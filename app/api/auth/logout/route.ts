import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

/**
 * POST /api/auth/logout
 * Clears the session cookie to log the user out.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearSessionCookie(response);
}
