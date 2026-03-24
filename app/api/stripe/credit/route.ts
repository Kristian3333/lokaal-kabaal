import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requireDb } from '@/lib/db';
import { retailers, creditLedger } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAvailableCredits } from '@/lib/credits';

/**
 * GET /api/stripe/credit
 *
 * Returns the current credit balance (in flyers) for the authenticated retailer.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const credits = await getAvailableCredits(authResult.retailerId);
    return NextResponse.json({ credits });
  } catch (err: unknown) {
    console.error('[stripe/credit GET]', err);
    return NextResponse.json({ error: 'Tegoed ophalen mislukt' }, { status: 500 });
  }
}

/**
 * POST /api/stripe/credit
 *
 * Admin-only: manually add credits for a retailer with a reason.
 * Body: { retailerId, campagneId?, aantalFlyers, maand, toelichting }
 *
 * For automated surplus crediting use addSurplusCredits() directly in the
 * dispatch pipeline.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  // Only allow admin emails to perform manual credit adjustments
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean);
  if (!adminEmails.includes(authResult.email)) {
    console.warn(`[stripe/credit POST] niet-admin probeerde credits toe te voegen: ${authResult.email}`);
    return NextResponse.json({ error: 'Niet toegestaan' }, { status: 403 });
  }

  try {
    const body: unknown = await req.json();
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 });
    }

    const {
      retailerId,
      campagneId,
      aantalFlyers,
      maand,
      toelichting,
    } = body as Record<string, unknown>;

    if (
      typeof retailerId !== 'string' ||
      typeof aantalFlyers !== 'number' ||
      typeof maand !== 'string'
    ) {
      return NextResponse.json(
        { error: 'retailerId, aantalFlyers en maand zijn verplicht' },
        { status: 400 },
      );
    }

    // Verify the target retailer exists
    const db = requireDb();
    const rows = await db
      .select({ id: retailers.id })
      .from(retailers)
      .where(eq(retailers.id, retailerId))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Retailer niet gevonden' }, { status: 404 });
    }

    await db.insert(creditLedger).values({
      retailerId,
      campagneId: typeof campagneId === 'string' ? campagneId : null,
      reden: 'aanpassing',
      aantalFlyers,
      maand,
      toelichting: typeof toelichting === 'string' ? toelichting : `Handmatige aanpassing door beheerder`,
    });

    return NextResponse.json({ success: true, aantalFlyers });
  } catch (err: unknown) {
    console.error('[stripe/credit POST]', err);
    return NextResponse.json({ error: 'Credits toevoegen mislukt' }, { status: 500 });
  }
}
