import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

// GET /api/conversies?campagneId=xxx  OR  ?retailerId=xxx
export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const campagneId = searchParams.get('campagneId');
  const retailerId = searchParams.get('retailerId');

  if (!campagneId && !retailerId) {
    return NextResponse.json({ error: 'campagneId of retailerId verplicht' }, { status: 400 });
  }

  const results = campagneId
    ? await db
        .select()
        .from(flyerVerifications)
        .where(eq(flyerVerifications.campagneId, campagneId))
        .orderBy(desc(flyerVerifications.verzondenOp))
        .limit(200)
    : await db
        .select()
        .from(flyerVerifications)
        .where(eq(flyerVerifications.retailerId, retailerId as string))
        .orderBy(desc(flyerVerifications.verzondenOp))
        .limit(200);

  const totaal = results.length;
  const geconverteerd = results.filter(r => r.gebruikt).length;
  const conversieRatio = totaal > 0 ? Math.round((geconverteerd / totaal) * 100) : 0;

  return NextResponse.json({
    results: results.map(r => ({
      code: r.code,
      adres: r.adres,
      postcode: r.postcode,
      stad: r.stad,
      verzondenOp: r.verzondenOp,
      gebruikt: r.gebruikt,
      gebruiktOp: r.gebruiktOp,
      geldigTot: r.geldigTot,
    })),
    totaal,
    geconverteerd,
    conversieRatio,
  });
}
