import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * GET /api/auth/session
 * Returns current session info plus the retailer's branche and bedrijfsnaam
 * for client-side hydration. Returns authenticated:false if not logged in.
 */
export async function GET(req: NextRequest) {
  const session = getSession(req);

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      email: null,
      retailerId: null,
      tier: null,
      branche: null,
      bedrijfsnaam: null,
    });
  }

  let branche: string | null = null;
  let bedrijfsnaam: string | null = null;
  if (db) {
    try {
      const rows = await db
        .select({ branche: retailers.branche, bedrijfsnaam: retailers.bedrijfsnaam })
        .from(retailers)
        .where(eq(retailers.id, session.retailerId))
        .limit(1);
      if (rows.length > 0) {
        branche = rows[0].branche;
        bedrijfsnaam = rows[0].bedrijfsnaam;
      }
    } catch (err) {
      console.error('[auth/session] Failed to hydrate retailer:', err);
    }
  }

  return NextResponse.json({
    authenticated: true,
    email: session.email,
    retailerId: session.retailerId,
    tier: session.tier,
    branche,
    bedrijfsnaam,
  });
}
