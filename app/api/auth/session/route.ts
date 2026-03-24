import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

/**
 * GET /api/auth/session
 * Returns current session info for client-side hydration.
 * Returns null fields if not authenticated (does not 401).
 */
export async function GET(req: NextRequest) {
  const session = getSession(req);

  if (!session) {
    return NextResponse.json({ authenticated: false, email: null, retailerId: null, tier: null });
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    retailerId: session.retailerId,
    tier: session.tier,
  });
}
