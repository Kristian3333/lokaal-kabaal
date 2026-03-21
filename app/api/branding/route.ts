import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// GET /api/branding?email=xxx — Haal branding op
export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'email verplicht' }, { status: 400 });
  }

  const rows = await db
    .select({
      logoUrl: retailers.logoUrl,
      merkKleur: retailers.merkKleur,
      welkomstTekst: retailers.welkomstTekst,
    })
    .from(retailers)
    .where(eq(retailers.email, email))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ error: 'Retailer niet gevonden' }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}

// POST /api/branding — Sla branding op
export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, logoUrl, merkKleur, welkomstTekst } = body as {
    email?: string;
    logoUrl?: string;
    merkKleur?: string;
    welkomstTekst?: string;
  };

  if (!email) {
    return NextResponse.json({ error: 'email verplicht' }, { status: 400 });
  }

  // Valideer hex kleur
  if (merkKleur && !/^#[0-9A-Fa-f]{6}$/.test(merkKleur)) {
    return NextResponse.json({ error: 'merkKleur moet een hex kleur zijn (#RRGGBB)' }, { status: 400 });
  }

  await db
    .update(retailers)
    .set({
      logoUrl: logoUrl || null,
      merkKleur: merkKleur || null,
      welkomstTekst: welkomstTekst || null,
      updatedAt: new Date(),
    })
    .where(eq(retailers.email, email));

  return NextResponse.json({ ok: true });
}
