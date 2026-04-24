import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { createSessionToken, setSessionCookie } from '@/lib/auth';

/**
 * GET /api/auth/magic-link/verify?token=xxx
 * Validates a magic link token, creates a session, and redirects to the dashboard.
 *
 * On success: redirects to /app with session cookie set.
 * On failure: redirects to /login?error=invalid_token.
 */
export async function GET(req: NextRequest) {
  if (!db) {
    return NextResponse.redirect(new URL('/login?error=db_unavailable', req.url));
  }

  const token = req.nextUrl.searchParams.get('token');

  if (!token || token.length < 10) {
    return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
  }

  try {
    const rows = await db
      .select({
        id: retailers.id,
        email: retailers.email,
        bedrijfsnaam: retailers.bedrijfsnaam,
        tier: retailers.tier,
        magicLinkToken: retailers.magicLinkToken,
        magicLinkExpiry: retailers.magicLinkExpiry,
      })
      .from(retailers)
      .where(eq(retailers.magicLinkToken, token))
      .limit(1);

    if (rows.length === 0) {
      console.warn(`[auth/magic-link/verify] Unknown or already-used token`);
      return NextResponse.redirect(new URL('/login?error=invalid_token', req.url));
    }

    const retailer = rows[0];

    // Check token expiry
    if (!retailer.magicLinkExpiry || new Date() > retailer.magicLinkExpiry) {
      console.warn(`[auth/magic-link/verify] Expired token for email: ${retailer.email}`);
      // Clear the expired token
      await db
        .update(retailers)
        .set({ magicLinkToken: null, magicLinkExpiry: null })
        .where(eq(retailers.id, retailer.id));
      return NextResponse.redirect(new URL('/login?error=token_expired', req.url));
    }

    // Invalidate the token immediately after use (one-time use)
    await db
      .update(retailers)
      .set({ magicLinkToken: null, magicLinkExpiry: null })
      .where(eq(retailers.id, retailer.id));

    const sessionToken = createSessionToken({
      email: retailer.email,
      retailerId: retailer.id,
      tier: retailer.tier,
    });

    // Use the incoming request origin so this works identically on localhost and prod.
    const response = NextResponse.redirect(new URL('/app', req.nextUrl.origin));
    return setSessionCookie(response, sessionToken);
  } catch (err) {
    console.error('[auth/magic-link/verify] Fout:', err);
    return NextResponse.redirect(new URL('/login?error=server_error', req.url));
  }
}
