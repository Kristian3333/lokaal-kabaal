import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendMagicLink } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';
import { authLimiter } from '@/lib/rate-limit';
import crypto from 'crypto';

const TOKEN_BYTES = 32; // 64 hex chars
const EXPIRY_MINUTES = 15;

/**
 * Generate a cryptographically random URL-safe token.
 */
function generateMagicToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * POST /api/auth/magic-link
 * Generates a one-time magic login link and sends it to the given email address.
 *
 * Body: { email }
 * Always returns 200 to prevent email enumeration.
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

  const { email } = body as { email?: string };

  // Always return 200 for invalid emails to prevent enumeration
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ ok: true });
  }

  try {
    const rows = await db
      .select({ id: retailers.id, bedrijfsnaam: retailers.bedrijfsnaam })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    // Always respond with 200 to avoid leaking which emails have accounts
    if (rows.length === 0) {
      console.warn(`[auth/magic-link] Magic link requested for unknown email: ${email}`);
      return NextResponse.json({ ok: true });
    }

    const token = generateMagicToken();
    const expiry = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await db
      .update(retailers)
      .set({ magicLinkToken: token, magicLinkExpiry: expiry })
      .where(eq(retailers.email, email));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lokaalkabaal.agency';

    // Fire-and-forget: we still return 200 even if email fails
    sendMagicLink(email, token, baseUrl).catch((err) => {
      console.error('[auth/magic-link] email send failed:', err);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/magic-link] Fout:', err);
    return NextResponse.json({ error: 'Interne fout bij aanmaken magic link' }, { status: 500 });
  }
}
