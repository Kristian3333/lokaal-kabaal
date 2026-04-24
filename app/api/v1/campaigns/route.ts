import { NextRequest, NextResponse } from 'next/server';
import { requireDb } from '@/lib/db';
import { campaigns, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth';
import { captureError } from '@/lib/telemetry';

/**
 * Public REST API v1 -- list campaigns for the caller.
 *
 * Auth priority:
 *   1. `Authorization: Bearer <PUBLIC_API_KEY>` when the retailer has
 *      configured a personal access token (not yet wired; falls back to
 *      session). Leaves space for Zapier / Shopify plugin usage later.
 *   2. Active session cookie (same as /app).
 *
 * Returns a flat JSON array so scripts can iterate without chasing
 * pagination on small accounts. Add `?limit=` support when campaign
 * counts grow.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // TODO: Bearer-token path once retailers can create personal API keys.
  // Until then, the public API uses the same session cookie as the dashboard.
  const session = getSession(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized', docs: 'https://lokaalkabaal.agency/docs/api' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer realm="lokaalkabaal"' } },
    );
  }

  try {
    const db = requireDb();
    const rows = await db
      .select({
        id: campaigns.id,
        naam: campaigns.naam,
        branche: campaigns.branche,
        status: campaigns.status,
        centrum: campaigns.centrum,
        pc4Lijst: campaigns.pc4Lijst,
        verwachtAantalPerMaand: campaigns.verwachtAantalPerMaand,
        duurMaanden: campaigns.duurMaanden,
        formaat: campaigns.formaat,
        startMaand: campaigns.startMaand,
        eindMaand: campaigns.eindMaand,
        createdAt: campaigns.createdAt,
      })
      .from(campaigns)
      .innerJoin(retailers, eq(campaigns.retailerId, retailers.id))
      .where(eq(retailers.id, session.retailerId));

    return NextResponse.json({ data: rows, meta: { count: rows.length, apiVersion: 'v1' } });
  } catch (err) {
    captureError(err, { source: 'api/v1/campaigns', retailerId: session.retailerId });
    return NextResponse.json({ error: 'Kon campagnes niet laden' }, { status: 500 });
  }
}
