import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getAuthEmail } from '@/lib/auth';
import { isValidPincode } from '@/lib/validation';

// GET /api/pincode?email=xxx -- Haal huidige pincode op
export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const paramEmail = req.nextUrl.searchParams.get('email');
  const email = getAuthEmail(req, paramEmail, 'pincode/GET');
  if (!email) {
    return NextResponse.json({ error: 'email verplicht' }, { status: 400 });
  }

  const rows = await db
    .select({ winkelPincode: retailers.winkelPincode })
    .from(retailers)
    .where(eq(retailers.email, email))
    .limit(1);

  if (!rows.length) {
    return NextResponse.json({ error: 'Retailer niet gevonden' }, { status: 404 });
  }

  return NextResponse.json({ pincode: rows[0].winkelPincode ?? null });
}

// POST /api/pincode -- Stel pincode in of wijzig
export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email: bodyEmail, pincode } = body as { email?: string; pincode?: string };

  const email = getAuthEmail(req, bodyEmail, 'pincode/POST');
  if (!email) {
    return NextResponse.json({ error: 'email verplicht' }, { status: 400 });
  }

  // Validatie: 4-6 cijfers
  if (!isValidPincode(pincode)) {
    return NextResponse.json({ error: 'Pincode moet 4 tot 6 cijfers zijn' }, { status: 400 });
  }

  const result = await db
    .update(retailers)
    .set({ winkelPincode: pincode, updatedAt: new Date() })
    .where(eq(retailers.email, email));

  return NextResponse.json({ ok: true, pincode });
}
