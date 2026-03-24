import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, getAuthRetailerId } from '@/lib/auth';

// GET /api/conversies?campagneId=xxx  OR  ?retailerId=xxx
export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const campagneId = searchParams.get('campagneId');
  const retailerId = getAuthRetailerId(req);

  if (!campagneId && !retailerId) {
    return NextResponse.json({ error: 'campagneId of retailerId verplicht' }, { status: 400 });
  }

  const results = campagneId
    ? await db
        .select()
        .from(flyerVerifications)
        .where(eq(flyerVerifications.campagneId, campagneId))
        .orderBy(desc(flyerVerifications.verzondenOp))
        .limit(500)
    : await db
        .select()
        .from(flyerVerifications)
        .where(eq(flyerVerifications.retailerId, retailerId as string))
        .orderBy(desc(flyerVerifications.verzondenOp))
        .limit(500);

  const totaal       = results.length;
  const interesse    = results.filter(r => r.interesseOp).length;
  const conversies   = results.filter(r => r.conversieOp).length;
  const verlopen     = results.filter(r => !r.conversieOp && new Date() > new Date(r.geldigTot)).length;
  const openstaand   = totaal - interesse - verlopen;
  // Conversieratio: conversies / verzonden flyers
  const conversieRatio = totaal > 0 ? Math.round((conversies / totaal) * 100) : 0;
  // Interesse → conversie ratio
  const interesseConversieRatio = interesse > 0 ? Math.round((conversies / interesse) * 100) : 0;

  return NextResponse.json({
    stats: {
      totaal,
      interesse,
      conversies,
      verlopen,
      openstaand,
      conversieRatio,
      interesseConversieRatio,
    },
    results: results.map(r => ({
      code: r.code,
      adres: r.adres,
      postcode: r.postcode,
      stad: r.stad,
      verzondenOp: r.verzondenOp,
      interesseOp: r.interesseOp,
      conversieOp: r.conversieOp,
      geldigTot: r.geldigTot,
    })),
  });
}
