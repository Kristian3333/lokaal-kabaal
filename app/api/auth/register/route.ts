import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { isValidEmail, isValidBranche } from '@/lib/validation';
import { sendWelcomeEmail } from '@/lib/email';
import { authLimiter } from '@/lib/rate-limit';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 1024;
const MAX_BEDRIJFSNAAM_LENGTH = 255;

/**
 * POST /api/auth/register
 * Creates a new retailer account with a hashed password and a signed session.
 *
 * Body: { email, password, bedrijfsnaam, branche }
 * Returns retailer data and sets a session cookie.
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

  const { email, password, bedrijfsnaam, branche } = body as {
    email?: string;
    password?: string;
    bedrijfsnaam?: string;
    branche?: string;
  };

  // Validate all required fields
  if (!email || !password || !bedrijfsnaam || !branche) {
    return NextResponse.json(
      { error: 'Alle velden zijn verplicht: email, password, bedrijfsnaam, branche' },
      { status: 400 },
    );
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ongeldig e-mailadres' }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Wachtwoord moet ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} tekens zijn` },
      { status: 400 },
    );
  }

  if (typeof bedrijfsnaam !== 'string' || bedrijfsnaam.length === 0 || bedrijfsnaam.length > MAX_BEDRIJFSNAAM_LENGTH) {
    return NextResponse.json(
      { error: 'Bedrijfsnaam is ongeldig (1-255 tekens)' },
      { status: 400 },
    );
  }

  if (!isValidBranche(branche)) {
    return NextResponse.json({ error: 'Branche is ongeldig (max 100 tekens)' }, { status: 400 });
  }

  try {
    // Check email uniqueness
    const existing = await db
      .select({ id: retailers.id })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.warn(`[auth/register] Duplicate registration attempt for email: ${email}`);
      return NextResponse.json({ error: 'Er bestaat al een account met dit e-mailadres' }, { status: 409 });
    }

    const wachtwoordHash = await hashPassword(password);

    const [retailer] = await db
      .insert(retailers)
      .values({
        email,
        bedrijfsnaam,
        branche,
        wachtwoordHash,
        tier: 'starter',
        subscriptionStatus: 'proef',
      })
      .returning({
        id: retailers.id,
        email: retailers.email,
        bedrijfsnaam: retailers.bedrijfsnaam,
        tier: retailers.tier,
      });

    // Send welcome email -- fire-and-forget, failure must not break registration
    sendWelcomeEmail(email, bedrijfsnaam).catch((err) => {
      console.error('[auth/register] welcome email failed:', err);
    });

    const token = createSessionToken({
      email: retailer.email,
      retailerId: retailer.id,
      tier: retailer.tier,
    });

    const response = NextResponse.json({
      id: retailer.id,
      email: retailer.email,
      bedrijfsnaam: retailer.bedrijfsnaam,
      tier: retailer.tier,
    }, { status: 201 });

    return setSessionCookie(response, token);
  } catch (err) {
    console.error('[auth/register] Fout:', err);
    return NextResponse.json({ error: 'Interne fout bij registratie' }, { status: 500 });
  }
}
