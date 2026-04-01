import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { isValidEmail } from '@/lib/validation';
import { authLimiter } from '@/lib/rate-limit';

/**
 * POST /api/auth/login
 * Authenticates a retailer by email and password, then sets a signed session cookie.
 *
 * If wachtwoordHash is null (legacy/test account), login is allowed without a password
 * for backwards compatibility.
 */
export async function POST(req: NextRequest) {
  const limit = authLimiter(req);
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  if (!db) {
    return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Ongeldige JSON' }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email) {
    return NextResponse.json({ error: 'E-mail is verplicht' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
  }

  try {
    const rows = await db
      .select({
        id: retailers.id,
        email: retailers.email,
        tier: retailers.tier,
        bedrijfsnaam: retailers.bedrijfsnaam,
        wachtwoordHash: retailers.wachtwoordHash,
      })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    if (rows.length === 0) {
      console.warn(`[auth/login] Login attempt for unknown email: ${email}`);
      // Return generic error to avoid email enumeration
      return NextResponse.json({ error: 'Onjuist e-mailadres of wachtwoord' }, { status: 401 });
    }

    const retailer = rows[0];

    // Verify password -- allow passwordless login only in development for legacy accounts
    if (retailer.wachtwoordHash === null) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Account vereist wachtwoord. Gebruik de magic link.' }, { status: 400 });
      }
      // Dev mode: allow passwordless login for test accounts
    } else {
      if (!password) {
        return NextResponse.json({ error: 'Wachtwoord is verplicht' }, { status: 400 });
      }
      const valid = await verifyPassword(password, retailer.wachtwoordHash);
      if (!valid) {
        console.warn(`[auth/login] Wrong password for email: ${email}`);
        return NextResponse.json({ error: 'Onjuist e-mailadres of wachtwoord' }, { status: 401 });
      }
    }

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
