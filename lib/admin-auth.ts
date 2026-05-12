import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

/**
 * Admin allowlist. Operators with addresses in the ADMIN_EMAILS env var
 * (comma-separated) can hit /admin/* routes and /api/admin/* endpoints.
 * Everyone else (including signed-in retailers) sees a 403.
 *
 * Keeping the allowlist in env rather than the DB means revoking access
 * is a one-line Vercel change, not a deploy. The cost is that the list
 * doesn't show up in the dashboard -- which is the right tradeoff while
 * the operator team is one or two people.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** True if the given email is on the admin allowlist. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** Result of a successful admin auth check. */
export interface AdminSession {
  email: string;
}

/**
 * Guard for /api/admin/* routes. Returns either an AdminSession or a
 * NextResponse to return immediately (401 if not signed in, 403 if
 * signed in but not on the allowlist).
 */
export function requireAdmin(req: NextRequest): AdminSession | NextResponse {
  const auth = requireAuth(req);
  if (auth instanceof NextResponse) return auth;
  if (!isAdminEmail(auth.email)) {
    return NextResponse.json({ error: 'Geen admin-toegang' }, { status: 403 });
  }
  return { email: auth.email };
}
