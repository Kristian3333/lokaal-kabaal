import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '../../../lib/db';
import { pc4Exclusivity, retailers } from '../../../lib/schema';
import { eq, and, or, isNull, gte } from 'drizzle-orm';

// ─── GET /api/exclusivity?pc4=1234&branche=Kapper ─────────────────────────────
//
// Controleert of een postcode+branche combinatie beschikbaar is voor een nieuw
// Stad-abonnement. Geeft een melding terug als de combinatie bezet is:
//   { beschikbaar: false, melding: "...", periodeStart: "...", periodeEind: "..." }
//
// ─── POST /api/exclusivity — claim een postcode voor een Stad-klant ────────────
//
// Body: { retailerId, pc4, branche, startDatum }
// Controleert eerst of de klant een actief Stad-abonnement heeft, en of de
// combinatie pc4+branche nog vrij is.

export async function GET(req: NextRequest) {
  const pc4 = req.nextUrl.searchParams.get('pc4');
  const branche = req.nextUrl.searchParams.get('branche');

  if (!pc4 || !branche) {
    return NextResponse.json({ error: 'pc4 en branche zijn verplicht' }, { status: 400 });
  }

  const db = requireDb();
  const vandaag = new Date().toISOString().split('T')[0];

  const claims = await db
    .select({
      startDatum: pc4Exclusivity.startDatum,
      eindDatum:  pc4Exclusivity.eindDatum,
    })
    .from(pc4Exclusivity)
    .where(
      and(
        eq(pc4Exclusivity.pc4, pc4),
        eq(pc4Exclusivity.branche, branche),
        eq(pc4Exclusivity.actief, true),
        or(
          isNull(pc4Exclusivity.eindDatum),
          gte(pc4Exclusivity.eindDatum, vandaag),
        ),
      )
    )
    .limit(1);

  if (claims.length === 0) {
    return NextResponse.json({ beschikbaar: true });
  }

  const claim = claims[0];
  const eindDatumLabel = claim.eindDatum
    ? new Date(claim.eindDatum).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })
    : null;
  const startDatumLabel = new Date(claim.startDatum).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  return NextResponse.json({
    beschikbaar: false,
    melding: eindDatumLabel
      ? `Postcodegebied ${pc4} is voor de branche "${branche}" al verkocht aan een concurrent van ${startDatumLabel} t/m ${eindDatumLabel}.`
      : `Postcodegebied ${pc4} is voor de branche "${branche}" al verkocht aan een concurrent (actief vanaf ${startDatumLabel}).`,
    periodeStart: claim.startDatum,
    periodeEind:  claim.eindDatum,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { retailerId, pc4, branche, startDatum } = await req.json();

    if (!retailerId || !pc4 || !branche || !startDatum) {
      return NextResponse.json({ error: 'retailerId, pc4, branche en startDatum zijn verplicht' }, { status: 400 });
    }

    const db = requireDb();

    const retailer = await db
      .select({ tier: retailers.tier, subscriptionStatus: retailers.subscriptionStatus })
      .from(retailers)
      .where(eq(retailers.id, retailerId))
      .limit(1);

    if (retailer.length === 0) {
      return NextResponse.json({ error: 'Retailer niet gevonden' }, { status: 404 });
    }
    if (retailer[0].tier !== 'stad') {
      return NextResponse.json({ error: 'Exclusiviteit is alleen beschikbaar voor het Stad-pakket' }, { status: 403 });
    }
    if (retailer[0].subscriptionStatus !== 'actief') {
      return NextResponse.json({ error: 'Abonnement is niet actief' }, { status: 403 });
    }

    const vandaag = new Date().toISOString().split('T')[0];
    const bestaand = await db
      .select({ id: pc4Exclusivity.id })
      .from(pc4Exclusivity)
      .where(
        and(
          eq(pc4Exclusivity.pc4, pc4),
          eq(pc4Exclusivity.branche, branche),
          eq(pc4Exclusivity.actief, true),
          or(
            isNull(pc4Exclusivity.eindDatum),
            gte(pc4Exclusivity.eindDatum, vandaag),
          ),
        )
      )
      .limit(1);

    if (bestaand.length > 0) {
      return NextResponse.json({ error: `Postcodegebied ${pc4} is al geclaimd voor branche "${branche}"` }, { status: 409 });
    }

    await db.insert(pc4Exclusivity).values({
      pc4,
      branche,
      retailerId,
      startDatum,
      actief: true,
    });

    return NextResponse.json({ success: true, message: `Postcodegebied ${pc4} succesvol geclaimd voor "${branche}"` });
  } catch (err) {
    console.error('[exclusivity POST]', err);
    return NextResponse.json({ error: 'Interne fout' }, { status: 500 });
  }
}
