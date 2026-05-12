import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireDb } from '../../../../lib/db';
import { campaigns, retailers } from '../../../../lib/schema';
import { and, eq } from 'drizzle-orm';
import { sendPaymentConfirmation } from '@/lib/email';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Geen signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] signature mismatch:', err);
    return NextResponse.json({ error: 'Ongeldige signature' }, { status: 400 });
  }

  try {
    const db = requireDb();

    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
        const meta = sub.metadata;
        const email = session.customer_details?.email ?? '';
        const customerId = session.customer as string;

        if (!email) break;

        const tier = (meta.tier ?? 'starter') as 'starter' | 'pro' | 'agency';
        const isJaarcontract = meta.isJaarcontract === 'true';

        // Upsert retailer op basis van e-mail
        const existing = await db
          .select({ id: retailers.id })
          .from(retailers)
          .where(eq(retailers.email, email))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(retailers)
            .set({
              stripeCustomerId:     customerId,
              stripeSubscriptionId: sub.id,
              tier,
              subscriptionStatus:   'actief',
              isJaarcontract,
              updatedAt: new Date(),
            })
            .where(eq(retailers.email, email));
        } else {
          await db.insert(retailers).values({
            email,
            bedrijfsnaam:         meta.bedrijfsnaam ?? session.customer_details?.name ?? '',
            branche:              meta.branche ?? '',
            stripeCustomerId:     customerId,
            stripeSubscriptionId: sub.id,
            tier,
            subscriptionStatus:   'actief',
            isJaarcontract,
          });
        }

        // Fire-and-forget: email failure must not break the webhook
        const bedrijfsnaam = meta.bedrijfsnaam ?? session.customer_details?.name ?? '';
        sendPaymentConfirmation(email, bedrijfsnaam, tier).catch((err) => {
          console.error('[webhook] payment confirmation email failed:', err);
        });

        // Create the campaign as a webhook-side fallback. The browser
        // path (/bedankt -> /api/campaigns) is the primary creator and
        // attaches the full flyer design + start date; this is the
        // safety net for when that path fails (dev server down, user
        // closes tab mid-redirect, etc.) so an order is never silently
        // lost. Skip if a campaign already exists for this Stripe
        // subscription -- idempotency.
        try {
          const retailerRow = await db
            .select({ id: retailers.id })
            .from(retailers)
            .where(eq(retailers.email, email))
            .limit(1);
          const retailerId = retailerRow[0]?.id;
          if (retailerId) {
            const existing = await db
              .select({ id: campaigns.id })
              .from(campaigns)
              .where(and(
                eq(campaigns.retailerId, retailerId),
                eq(campaigns.stripeSubscriptionItemId, sub.id),
              ))
              .limit(1);
            if (existing.length === 0) {
              const branche = meta.branche ?? '';
              const centrum = meta.centrum ?? '';
              const duurMaanden = Math.max(1, Math.min(24, parseInt(meta.duurMaanden ?? '1', 10) || 1));
              const verwachtAantalPerMaand = Math.max(1, parseInt(meta.verwachtAantalPerMaand ?? '300', 10) || 300);
              const formaat = meta.formaat ?? 'a6';
              const dubbelzijdig = meta.dubbelzijdig === 'true';
              // Next batch month: the 25th of next month. We store the
              // first day of that month and let the dispatch cron handle
              // the 25th window.
              const next = new Date();
              next.setMonth(next.getMonth() + 1, 1);
              const startMaand = next.toISOString().slice(0, 10);
              const end = new Date(next);
              end.setMonth(end.getMonth() + (duurMaanden - 1));
              const eindMaand = end.toISOString().slice(0, 10);

              await db.insert(campaigns).values({
                retailerId,
                naam: branche ? `${branche} campagne` : 'Nieuwe campagne',
                branche,
                centrum,
                straalKm: '10',
                pc4Lijst: '',
                formaat,
                dubbelzijdig,
                verwachtAantalPerMaand,
                duurMaanden,
                startMaand,
                eindMaand,
                status: 'actief',
                awaitingReview: true,
                stripeSubscriptionItemId: sub.id,
              });
              console.warn(`[webhook] fallback-created campaign for ${email} (sub ${sub.id})`);
            }
          }
        } catch (campaignErr) {
          // Never fail the webhook over the campaign fallback -- Stripe
          // would retry endlessly. The /bedankt path or a manual op
          // still has the customer's data.
          console.error('[webhook] fallback campaign create failed:', campaignErr);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const tier = (sub.metadata.tier ?? 'starter') as 'starter' | 'pro' | 'agency';
        const isJaarcontract = sub.metadata.isJaarcontract === 'true';
        const status = sub.status === 'active' ? 'actief'
          : sub.status === 'past_due' ? 'gepauzeerd'
          : sub.status === 'canceled' ? 'geannuleerd'
          : 'gepauzeerd';

        await db
          .update(retailers)
          .set({ tier, subscriptionStatus: status as 'actief' | 'gepauzeerd' | 'geannuleerd', isJaarcontract, updatedAt: new Date() })
          .where(eq(retailers.stripeSubscriptionId, sub.id));
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subRef = invoice.parent?.subscription_details?.subscription;
        const subId = typeof subRef === 'string' ? subRef : (subRef as Stripe.Subscription | undefined)?.id;
        if (subId) {
          await db
            .update(retailers)
            .set({ subscriptionStatus: 'gepauzeerd', updatedAt: new Date() })
            .where(eq(retailers.stripeSubscriptionId, subId));
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        // Stel dashboardActiefTot in op 1 maand na annulering
        // (de abonnee kan het dashboard nog 1 maand raadplegen)
        const dashboardActiefTot = new Date();
        dashboardActiefTot.setMonth(dashboardActiefTot.getMonth() + 1);

        await db
          .update(retailers)
          .set({
            subscriptionStatus: 'geannuleerd',
            dashboardActiefTot,
            updatedAt: new Date(),
          })
          .where(eq(retailers.stripeSubscriptionId, sub.id));
        break;
      }
    }
  } catch (dbErr) {
    // Log maar geef geen 500 terug aan Stripe (voorkomt retry-loops)
    console.error('[webhook] DB fout:', dbErr);
  }

  return NextResponse.json({ received: true });
}
