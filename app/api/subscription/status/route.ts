import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/auth';
import { requireDb } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAvailableCredits } from '@/lib/credits';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

/**
 * GET /api/subscription/status
 *
 * Returns the full subscription status for the authenticated retailer:
 * - tier, subscriptionStatus, isJaarcontract
 * - billing period and next payment date (from Stripe)
 * - credit balance (from creditLedger)
 * - dashboardActiefTot
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const db = requireDb();
    const rows = await db
      .select({
        id: retailers.id,
        tier: retailers.tier,
        subscriptionStatus: retailers.subscriptionStatus,
        isJaarcontract: retailers.isJaarcontract,
        periodeStart: retailers.periodeStart,
        periodeEind: retailers.periodeEind,
        dashboardActiefTot: retailers.dashboardActiefTot,
        stripeSubscriptionId: retailers.stripeSubscriptionId,
      })
      .from(retailers)
      .where(eq(retailers.id, authResult.retailerId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ found: false });
    }

    const r = rows[0];
    const nu = new Date();

    let dagenResterend: number | null = null;
    if (r.dashboardActiefTot) {
      const diff = r.dashboardActiefTot.getTime() - nu.getTime();
      dagenResterend = Math.ceil(diff / (1000 * 60 * 60 * 24));
    }

    // Fetch credit balance from the ledger
    const creditBalance = await getAvailableCredits(authResult.retailerId);

    // Fetch live Stripe subscription data if available
    let volgendeBetaling: string | null = null;
    let huidigPeriodeEind: string | null = null;
    let stripeBedragCents: number | null = null;

    if (r.stripeSubscriptionId) {
      try {
        const sub = await getStripe().subscriptions.retrieve(r.stripeSubscriptionId);
        const subData = sub as unknown as { status: string; current_period_end: number; items: { data: Array<{ price?: { unit_amount?: number | null } }> } };
        if (subData.status !== 'canceled') {
          volgendeBetaling = new Date(subData.current_period_end * 1000).toISOString();
          huidigPeriodeEind = new Date(subData.current_period_end * 1000).toISOString();
          stripeBedragCents = subData.items.data[0]?.price?.unit_amount ?? null;
        }
      } catch (stripeErr) {
        // Non-fatal: log and continue without live Stripe data
        console.warn('[subscription/status] Stripe ophalen mislukt:', stripeErr);
      }
    }

    return NextResponse.json({
      found: true,
      tier: r.tier,
      subscriptionStatus: r.subscriptionStatus,
      isJaarcontract: r.isJaarcontract,
      periodeStart: r.periodeStart?.toISOString() ?? null,
      periodeEind: r.periodeEind?.toISOString() ?? null,
      dashboardActiefTot: r.dashboardActiefTot?.toISOString() ?? null,
      dagenResterend,
      creditBalance,
      volgendeBetaling,
      huidigPeriodeEind,
      stripeBedragCents,
    });
  } catch (err: unknown) {
    console.error('[subscription/status]', err);
    return NextResponse.json({ error: 'Status ophalen mislukt' }, { status: 500 });
  }
}
