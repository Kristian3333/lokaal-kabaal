import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';

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
    return NextResponse.json({ status: 'invalid', message: 'Ongeldige code', emoji: '❌' }, { status: 404 });
  }

  const v = rows[0];

  if (v.gebruikt) {
    return NextResponse.json({
      status: 'used',
      message: 'Al ingewisseld',
      gebruiktOp: v.gebruiktOp,
      emoji: '⚠️',
    }, { status: 409 });
  }

  if (new Date() > new Date(v.geldigTot)) {
    return NextResponse.json({
      status: 'expired',
      message: 'Verlopen',
      geldigTot: v.geldigTot,
      emoji: '⏰',
    }, { status: 410 });
  }

  // Geldig — markeer als gebruikt
  await db
    .update(flyerVerifications)
    .set({ gebruikt: true, gebruiktOp: new Date() })
    .where(eq(flyerVerifications.code, code));

  return NextResponse.json({
    status: 'valid',
    emoji: '✅',
    adres: `${v.adres}, ${v.postcode} ${v.stad}`,
    geldigTot: v.geldigTot,
    message: 'Nieuwe bewoner geverifieerd',
  });
}
