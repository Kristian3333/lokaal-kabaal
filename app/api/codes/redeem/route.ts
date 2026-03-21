import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// POST /api/codes/redeem
// Webhook voor webshops: wanneer een klant een kortingscode gebruikt in de webshop,
// stuurt de webshop dit endpoint aan om de conversie te registreren.
//
// Body: { "code": "ABCD1234", "apiKey": "..." }
// apiKey = de CRON_SECRET of een retailer-specifieke API key
//
// Voorbeeld Shopify Flow / WooCommerce webhook:
//   POST https://lokaalkabaal.vercel.app/api/codes/redeem
//   { "code": "{{coupon_code}}", "apiKey": "jouw_api_key" }

export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { code: rawCode, apiKey } = body as { code?: string; apiKey?: string };

  if (!rawCode) {
    return NextResponse.json({ error: 'code verplicht' }, { status: 400 });
  }

  // Authenticatie via API key (CRON_SECRET als simpele API key)
  if (!apiKey || apiKey !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Ongeldige apiKey' }, { status: 401 });
  }

  const code = rawCode.toUpperCase().trim();

  const rows = await db
    .select()
    .from(flyerVerifications)
    .where(eq(flyerVerifications.code, code))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ status: 'invalid', message: 'Code niet gevonden' }, { status: 404 });
  }

  const v = rows[0];

  if (new Date() > new Date(v.geldigTot)) {
    return NextResponse.json({ status: 'expired', message: 'Code verlopen' }, { status: 410 });
  }

  if (v.conversieOp) {
    return NextResponse.json({
      status: 'already-redeemed',
      message: 'Code al ingewisseld',
      conversieOp: v.conversieOp,
    }, { status: 409 });
  }

  const now = new Date();
  await db
    .update(flyerVerifications)
    .set({
      conversieOp: now,
      gebruikt: true,
      gebruiktOp: now,
      ...(!v.interesseOp ? { interesseOp: now } : {}),
    })
    .where(eq(flyerVerifications.code, code));

  return NextResponse.json({
    status: 'redeemed',
    message: 'Conversie geregistreerd',
    code,
    conversieOp: now.toISOString(),
  });
}
