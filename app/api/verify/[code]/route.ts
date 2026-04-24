import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { redeemLimiter } from '@/lib/rate-limit';

// ─── GET /api/verify/[code] -- Interesse registreren (consument scant QR) ─────

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  if (!db) {
    return NextResponse.json({ status: 'error', message: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const code = params.code.toUpperCase().trim();

  const rows = await db
    .select()
    .from(flyerVerifications)
    .where(eq(flyerVerifications.code, code))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ status: 'invalid', message: 'Ongeldige code' }, { status: 404 });
  }

  const v = rows[0];

  if (new Date() > new Date(v.geldigTot)) {
    return NextResponse.json({
      status: 'expired',
      message: 'Verlopen',
      geldigTot: v.geldigTot,
    }, { status: 410 });
  }

  if (v.interesseOp) {
    return NextResponse.json({
      status: 'interesse',
      message: 'Al gescand door consument',
      interesseOp: v.interesseOp,
      conversieOp: v.conversieOp ?? null,
    });
  }

  // Eerste scan → registreer interesse
  await db
    .update(flyerVerifications)
    .set({ interesseOp: new Date() })
    .where(eq(flyerVerifications.code, code));

  return NextResponse.json({
    status: 'interesse',
    message: 'Interesse geregistreerd',
    adres: `${v.adres}, ${v.postcode} ${v.stad}`,
    geldigTot: v.geldigTot,
  });
}

// ─── POST /api/verify/[code] -- Conversie registreren (bedrijf scant bij kassa) ─

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  if (!db) {
    return NextResponse.json({ status: 'error', message: 'Database niet geconfigureerd' }, { status: 503 });
  }

  // Brute-force guard: pincode is only 4-6 digits, so a stricter limit than
  // authLimiter keeps code-and-pin combos from being guessed at scale.
  const limit = redeemLimiter(req);
  if (!limit.success) {
    return NextResponse.json(
      { status: 'rate-limited', message: 'Te veel verzoeken. Wacht 10 minuten en probeer opnieuw.' },
      { status: 429, headers: { 'Retry-After': '600' } },
    );
  }

  const code = params.code.toUpperCase().trim();
  const body = await req.json().catch(() => ({}));
  const { retailerId, pincode } = body as { retailerId?: string; pincode?: string };

  const rows = await db
    .select()
    .from(flyerVerifications)
    .where(eq(flyerVerifications.code, code))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ status: 'invalid', message: 'Ongeldige code' }, { status: 404 });
  }

  const v = rows[0];

  // Authenticatie: via pincode (QR-scan flow) of retailerId (dashboard flow)
  if (pincode) {
    const retailerRows = await db
      .select({ id: retailers.id, winkelPincode: retailers.winkelPincode })
      .from(retailers)
      .where(eq(retailers.id, v.retailerId))
      .limit(1);
    const retailer = retailerRows[0];
    if (!retailer?.winkelPincode) {
      return NextResponse.json({ status: 'error', message: 'Geen pincode ingesteld -- stel deze in via het dashboard' }, { status: 400 });
    }
    if (retailer.winkelPincode !== pincode) {
      return NextResponse.json({ status: 'forbidden', message: 'Onjuiste pincode' }, { status: 403 });
    }
  } else if (retailerId && v.retailerId !== retailerId) {
    return NextResponse.json({ status: 'forbidden', message: 'Code hoort niet bij dit bedrijf' }, { status: 403 });
  }

  if (new Date() > new Date(v.geldigTot)) {
    return NextResponse.json({ status: 'expired', message: 'Verlopen', geldigTot: v.geldigTot }, { status: 410 });
  }

  if (v.conversieOp) {
    return NextResponse.json({
      status: 'already-converted',
      message: 'Al ingewisseld',
      conversieOp: v.conversieOp,
    }, { status: 409 });
  }

  // Registreer conversie + markeer als gebruikt
  const now = new Date();
  await db
    .update(flyerVerifications)
    .set({
      conversieOp: now,
      gebruikt: true,
      gebruiktOp: now,
      // Als consument nog niet had gescand, registreer interesse ook (walk-in)
      ...(!v.interesseOp ? { interesseOp: now } : {}),
    })
    .where(eq(flyerVerifications.code, code));

  return NextResponse.json({
    status: 'conversie',
    message: 'Conversie geregistreerd',
    adres: `${v.adres}, ${v.postcode} ${v.stad}`,
    interesseOp: v.interesseOp ?? now,
    conversieOp: now,
  });
}
