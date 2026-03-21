import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '../../../../lib/db';
import { retailers } from '../../../../lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * GET /api/subscription/status?email=...
 *
 * Geeft de abonnementsstatus terug voor een retailer:
 * - tier, subscriptionStatus, isJaarcontract
 * - dashboardActiefTot (1 maand na laatste batch)
 * - dagelijkse resterende tijd tot dashboard verloopt
 *
 * Gebruikt door het dashboard om de lifecycle-banner te tonen.
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email is verplicht' }, { status: 400 });
  }

  try {
    const db = requireDb();
    const rows = await db
      .select({
        tier: retailers.tier,
        subscriptionStatus: retailers.subscriptionStatus,
        isJaarcontract: retailers.isJaarcontract,
        periodeStart: retailers.periodeStart,
        periodeEind: retailers.periodeEind,
        dashboardActiefTot: retailers.dashboardActiefTot,
      })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    if (rows.length === 0) {
      // Nieuwe gebruiker — geen abonnement gevonden
      return NextResponse.json({ found: false });
    }

    const r = rows[0];
    const nu = new Date();

    // Bereken hoeveel dagen het dashboard nog actief is
    let dagenResterend: number | null = null;
    if (r.dashboardActiefTot) {
      const diff = r.dashboardActiefTot.getTime() - nu.getTime();
      dagenResterend = Math.ceil(diff / (1000 * 60 * 60 * 24));
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
    });
  } catch (err) {
    console.error('[subscription/status]', err);
    return NextResponse.json({ error: 'DB fout' }, { status: 500 });
  }
}
