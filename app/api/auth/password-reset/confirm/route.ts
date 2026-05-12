import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/password';
import { createSessionToken, setSessionCookie } from '@/lib/auth';
import { authLimiter } from '@/lib/rate-limit';

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 1024;

/**
 * POST /api/auth/password-reset/confirm
 * Body: { token, newPassword }
 *
 * Validates a single-use reset token against the retailer row, hashes
 * the new password, clears the token (and any pending magic-login token
 * that shared the column), and returns a logged-in session cookie so the
 * user lands in the dashboard without a second login step.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
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

  const { token, newPassword } = body as { token?: string; newPassword?: string };

  if (!token || typeof token !== 'string' || token.length < 10) {
    return NextResponse.json({ error: 'Ongeldige reset-link' }, { status: 400 });
  }

  if (
    !newPassword ||
    typeof newPassword !== 'string' ||
    newPassword.length < MIN_PASSWORD_LENGTH ||
    newPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return NextResponse.json(
      { error: `Wachtwoord moet ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} tekens zijn` },
      { status: 400 },
    );
  }

  try {
    const rows = await db
      .select({
        id: retailers.id,
        email: retailers.email,
        tier: retailers.tier,
        magicLinkExpiry: retailers.magicLinkExpiry,
      })
      .from(retailers)
      .where(eq(retailers.magicLinkToken, token))
      .limit(1);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Ongeldige of al gebruikte reset-link' }, { status: 400 });
    }

    const retailer = rows[0];

    if (!retailer.magicLinkExpiry || new Date() > retailer.magicLinkExpiry) {
      // Wipe the expired token so a stale link cannot be retried.
      await db
        .update(retailers)
        .set({ magicLinkToken: null, magicLinkExpiry: null })
        .where(eq(retailers.id, retailer.id));
      return NextResponse.json({ error: 'Reset-link is verlopen, vraag een nieuwe aan' }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);

    await db
      .update(retailers)
      .set({
        wachtwoordHash: newHash,
        magicLinkToken: null,
        magicLinkExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(retailers.id, retailer.id));

    const sessionToken = createSessionToken({
      email: retailer.email,
      retailerId: retailer.id,
      tier: retailer.tier,
    });

    const response = NextResponse.json({ ok: true });
    return setSessionCookie(response, sessionToken);
  } catch (err) {
    console.error('[auth/password-reset/confirm] Fout:', err);
    return NextResponse.json({ error: 'Wachtwoord resetten mislukt' }, { status: 500 });
  }
}
