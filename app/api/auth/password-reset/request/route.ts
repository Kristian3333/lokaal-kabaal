import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/email';
import { isValidEmail } from '@/lib/validation';
import { authLimiter } from '@/lib/rate-limit';
import crypto from 'crypto';

const TOKEN_BYTES = 32; // 64 hex chars
const EXPIRY_MINUTES = 15;

function generateResetToken(): string {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

/**
 * POST /api/auth/password-reset/request
 * Body: { email }
 *
 * Generates a single-use password-reset token, stores it in the retailer
 * row (reusing the magicLinkToken column), and emails the recipient a
 * link to /reset-password?token=...
 *
 * Always returns 200 regardless of whether the email exists, so the
 * endpoint cannot be used to enumerate registered addresses.
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

  const { email } = body as { email?: string };

  if (!email || !isValidEmail(email)) {
    // Mirror the unknown-email path: silent 200 to prevent enumeration.
    return NextResponse.json({ ok: true });
  }

  try {
    const rows = await db
      .select({ id: retailers.id })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    if (rows.length === 0) {
      console.warn(`[auth/password-reset/request] Unknown email: ${email}`);
      return NextResponse.json({ ok: true });
    }

    const token = generateResetToken();
    const expiry = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000);

    await db
      .update(retailers)
      .set({ magicLinkToken: token, magicLinkExpiry: expiry })
      .where(eq(retailers.email, email));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin;

    // Fire-and-forget: we always return 200 even if the email transport
    // is down so callers cannot probe Resend availability via this route.
    sendPasswordResetEmail(email, token, baseUrl).catch((err) => {
      console.error('[auth/password-reset/request] email send failed:', err);
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/password-reset/request] Fout:', err);
    return NextResponse.json({ error: 'Interne fout' }, { status: 500 });
  }
}
