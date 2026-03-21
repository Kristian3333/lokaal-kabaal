import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/codes/export?campagneId=xxx&format=csv
// Exporteert alle verificatiecodes voor een campagne als CSV
// Bedoeld zodat retailers codes kunnen importeren als kortingscodes in hun webshop

export async function GET(req: NextRequest) {
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

  // CSV export
  const header = 'code,adres,postcode,stad,geldig_tot,status';
  const csvRows = rows.map(r => {
    const status = r.conversieOp ? 'conversie' : r.interesseOp ? 'interesse' : new Date() > new Date(r.geldigTot) ? 'verlopen' : 'actief';
    const geldigTot = new Date(r.geldigTot).toISOString().slice(0, 10);
    // Escape commas in address fields
    const adres = `"${r.adres.replace(/"/g, '""')}"`;
    const stad = `"${r.stad.replace(/"/g, '""')}"`;
    return `${r.code},${adres},${r.postcode},${stad},${geldigTot},${status}`;
  });

  const csv = [header, ...csvRows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="lokaalkabaal-codes-${campagneId.slice(0, 8)}.csv"`,
    },
  });
}
