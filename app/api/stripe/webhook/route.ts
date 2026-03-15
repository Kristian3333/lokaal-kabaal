import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() { return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' }); }
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// In productie: vervang door echte database (Supabase / PlanetScale / etc.)
// Voor nu: in-memory store als placeholder. In Vercel zijn dit stateless functions,
// dus dit is puur als demonstratie. Vervang dit door een echte DB call.
const campaignStore: Record<string, CampaignRecord> = {};

interface CampaignRecord {
  subscriptionId: string;
  customerId: string;
  email: string;
  bedrijfsnaam: string;
  maxFlyers: number;
  formaat: string;
  dubbelzijdig: boolean;
  spec: string;
  datum: string;
  centrum: string;
  pricePerFlyerCents: number;
  status: 'pending' | 'active' | 'paused' | 'cancelled';
  createdAt: string;
  currentPeriod?: {
    start: string;
    end: string;
    actualFlyers?: number;
    creditCents?: number;
    rolloverFlyers?: number;
    resolved: boolean;
  };
}

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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'subscription' && session.subscription) {
        const sub = await getStripe().subscriptions.retrieve(session.subscription as string);
        const meta = sub.metadata;
        campaignStore[sub.id] = {
          subscriptionId: sub.id,
          customerId: session.customer as string,
          email: session.customer_details?.email ?? '',
          bedrijfsnaam: session.customer_details?.name ?? '',
          maxFlyers: Number(meta.maxFlyers),
          formaat: meta.formaat,
          dubbelzijdig: meta.dubbelzijdig === 'true',
          spec: meta.spec,
          datum: meta.datum,
          centrum: meta.centrum,
          pricePerFlyerCents: Number(meta.pricePerFlyerCents),
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        console.log('[webhook] campagne geactiveerd:', sub.id);
      }
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subId = typeof subRef === 'string' ? subRef : (subRef as Stripe.Subscription | undefined)?.id;
      if (subId && campaignStore[subId]) {
        const periodEnd = new Date((invoice.period_end ?? 0) * 1000).toISOString();
        const periodStart = new Date((invoice.period_start ?? 0) * 1000).toISOString();
        campaignStore[subId].currentPeriod = {
          start: periodStart,
          end: periodEnd,
          resolved: false,
        };
        console.log('[webhook] factuur betaald:', subId, 'periode:', periodStart, '–', periodEnd);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subRef = invoice.parent?.subscription_details?.subscription;
      const subId = typeof subRef === 'string' ? subRef : (subRef as Stripe.Subscription | undefined)?.id;
      if (subId && campaignStore[subId]) {
        campaignStore[subId].status = 'paused';
        console.warn('[webhook] betaling mislukt, campagne gepauzeerd:', subId);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      if (campaignStore[sub.id]) {
        campaignStore[sub.id].status = 'cancelled';
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// GET /api/stripe/webhook?subscriptionId=xxx — voor intern gebruik (dashboard polling)
export async function GET(req: NextRequest) {
  const subId = req.nextUrl.searchParams.get('subscriptionId');
  if (!subId) return NextResponse.json({ error: 'subscriptionId verplicht' }, { status: 400 });
  const record = campaignStore[subId];
  if (!record) return NextResponse.json({ error: 'Niet gevonden' }, { status: 404 });
  return NextResponse.json(record);
}
