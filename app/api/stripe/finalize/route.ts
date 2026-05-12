import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { campaigns, retailers } from '@/lib/schema';
import { and, eq } from 'drizzle-orm';

/**
 * POST /api/stripe/finalize
 *
 * Body: { sessionId: string, flyerDesign?: unknown, datum?: string, pc4Lijst?: string }
 *
 * Idempotent campaign creator driven by a Stripe Checkout Session ID.
 * The wizard pushes the campaign blueprint into Stripe's subscription
 * metadata at checkout time; this endpoint reads it back and writes
 * the row to /campaigns/ so /admin/orders has something to review.
 *
 * Why this exists: the original flow only created a campaign if (a)
 * /bedankt's sessionStorage hand-off survived the Stripe round-trip
 * OR (b) the Stripe webhook was wired in production. When neither
 * was true the customer paid and no order appeared anywhere. This
 * endpoint replaces both branches with a single deterministic path:
 * /bedankt always POSTs sessionId, the server fetches the session
 * from Stripe to verify it is paid, then creates the campaign if
 * none exists for that subscription. Idempotency is keyed on the
 * Stripe subscription id so refreshing /bedankt or running the
 * webhook in parallel never produces duplicates.
 */
function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe is niet geconfigureerd' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({})) as {
    sessionId?: string;
    datum?: string;
    pc4Lijst?: string;
    flyerDesign?: unknown;
  };

  const sessionId = body.sessionId;
  if (!sessionId || typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
    return NextResponse.json({ error: 'sessionId is verplicht' }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.status !== 'complete' && session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Betaling is nog niet afgerond', status: session.status, payment_status: session.payment_status },
        { status: 409 },
      );
    }

    const email = session.customer_details?.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Geen e-mailadres gekoppeld aan deze sessie' }, { status: 400 });
    }

    const sub = session.subscription as Stripe.Subscription | null;
    if (!sub || typeof sub !== 'object') {
      return NextResponse.json({ error: 'Geen subscription gekoppeld aan deze sessie' }, { status: 400 });
    }
    const meta = sub.metadata ?? {};

    // Look up retailer by email
    const retailerRow = await db
      .select({ id: retailers.id })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);
    const retailerId = retailerRow[0]?.id;
    if (!retailerId) {
      return NextResponse.json(
        { error: `Geen retailer-account gevonden voor ${email}. Log in met dat e-mailadres en probeer opnieuw.` },
        { status: 404 },
      );
    }

    // Idempotency check: same subscription -> same campaign row
    const existing = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(
        eq(campaigns.retailerId, retailerId),
        eq(campaigns.stripeSubscriptionItemId, sub.id),
      ))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ ok: true, id: existing[0].id, created: false });
    }

    // Build the campaign from Stripe metadata + caller-supplied extras
    const branche = meta.branche ?? '';
    const centrum = meta.centrum ?? '';
    const duurMaanden = Math.max(1, Math.min(24, parseInt(meta.duurMaanden ?? '1', 10) || 1));
    const verwachtAantalPerMaand = Math.max(1, parseInt(meta.verwachtAantalPerMaand ?? '300', 10) || 300);
    const formaat = (meta.formaat ?? 'a6') as 'a5' | 'a6' | 'sq';
    const dubbelzijdig = meta.dubbelzijdig === 'true';

    // startMaand: caller can pass an explicit ISO date; otherwise we
    // pick the 1st of next month so the dispatch cron's "25th" window
    // catches it on the next batch.
    const startMaand = body.datum && /^\d{4}-\d{2}-\d{2}$/.test(body.datum)
      ? body.datum
      : (() => {
          const next = new Date();
          next.setMonth(next.getMonth() + 1, 1);
          return next.toISOString().slice(0, 10);
        })();
    const end = new Date(startMaand);
    end.setMonth(end.getMonth() + (duurMaanden - 1));
    const eindMaand = end.toISOString().slice(0, 10);

    const [created] = await db.insert(campaigns).values({
      retailerId,
      naam: branche ? `${branche} campagne` : 'Nieuwe campagne',
      branche,
      centrum,
      straalKm: '10',
      pc4Lijst: typeof body.pc4Lijst === 'string' ? body.pc4Lijst : '',
      formaat,
      dubbelzijdig,
      verwachtAantalPerMaand,
      duurMaanden,
      startMaand,
      eindMaand,
      status: 'actief',
      awaitingReview: true,
      stripeSubscriptionItemId: sub.id,
    }).returning({ id: campaigns.id });

    console.warn(`[stripe/finalize] created campaign ${created.id} for ${email} from session ${sessionId}`);
    return NextResponse.json({ ok: true, id: created.id, created: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[stripe/finalize]', msg);
    return NextResponse.json(
      {
        error: 'Bestelling vastleggen mislukt',
        detail: process.env.NODE_ENV !== 'production' ? msg : undefined,
      },
      { status: 500 },
    );
  }
}
