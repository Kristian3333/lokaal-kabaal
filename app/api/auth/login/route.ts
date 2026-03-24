import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Authenticates a retailer by email and sets a signed session cookie.
 * Currently uses email-only lookup (no password) since the app uses test accounts.
 */
export async function POST(req: NextRequest) {
  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 });
    }

    const { email } = body as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'E-mail is verplicht' }, { status: 400 });
    }

    const rows = await db
      .select({
        id: retailers.id,
        email: retailers.email,
        tier: retailers.tier,
        bedrijfsnaam: retailers.bedrijfsnaam,
      })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    if (rows.length === 0) {
      console.warn(`[auth/login] Login attempt for unknown email: ${email}`);
      return NextResponse.json({ error: 'Geen account gevonden voor dit e-mailadres' }, { status: 404 });
    }

    const retailer = rows[0];
    const token = createSessionToken({
      email: retailer.email,
      retailerId: retailer.id,
      tier: retailer.tier,
    });

    const response = NextResponse.json({
      id: retailer.id,
      email: retailer.email,
      tier: retailer.tier,
      bedrijfsnaam: retailer.bedrijfsnaam,
    });

    return setSessionCookie(response, token);
  } catch (err) {
    console.error('[auth/login] Fout:', err);
    return NextResponse.json({ error: 'Interne fout bij inloggen' }, { status: 500 });
  }
}
