import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { toCsv } from '@/lib/csv';

// GET /api/codes/export?campagneId=xxx&format=csv
// Exporteert alle verificatiecodes voor een campagne als CSV of JSON.
// Bedoeld zodat retailers codes kunnen importeren als kortingscodes in hun webshop.
// CSV formula-injection escaping zit in lib/csv.ts (shared met tests + andere endpoints).

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const campagneId = req.nextUrl.searchParams.get('campagneId');
  const format = req.nextUrl.searchParams.get('format') || 'csv';

  if (!campagneId) {
    return NextResponse.json({ error: 'campagneId verplicht' }, { status: 400 });
  }

  const rows = await db
    .select({
      code: flyerVerifications.code,
      adres: flyerVerifications.adres,
      postcode: flyerVerifications.postcode,
      stad: flyerVerifications.stad,
      verzondenOp: flyerVerifications.verzondenOp,
      geldigTot: flyerVerifications.geldigTot,
      interesseOp: flyerVerifications.interesseOp,
      conversieOp: flyerVerifications.conversieOp,
    })
    .from(flyerVerifications)
    .where(eq(flyerVerifications.campagneId, campagneId));

  if (format === 'json') {
    return NextResponse.json({ codes: rows });
  }

  const now = new Date();
  const withStatus = rows.map(r => ({
    code: r.code,
    adres: r.adres,
    postcode: r.postcode,
    stad: r.stad,
    geldig_tot: new Date(r.geldigTot).toISOString().slice(0, 10),
    status:
      r.conversieOp ? 'conversie' :
      r.interesseOp ? 'interesse' :
      now > new Date(r.geldigTot) ? 'verlopen' :
      'actief',
  }));

  const csv = toCsv(
    [
      ['code', 'code'],
      ['adres', 'adres'],
      ['postcode', 'postcode'],
      ['stad', 'stad'],
      ['geldig_tot', 'geldig_tot'],
      ['status', 'status'],
    ],
    withStatus,
  );

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lokaalkabaal-codes-${campagneId.slice(0, 8)}.csv"`,
    },
  });
}
