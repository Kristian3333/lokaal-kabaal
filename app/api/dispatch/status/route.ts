/**
 * GET /api/dispatch/status
 *
 * Returns a summary of the most recent dispatch batch for the
 * authenticated retailer's campaigns.
 *
 * Protected by session auth.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { requireDb } from '@/lib/db';
import { flyerVerifications, campaigns } from '@/lib/schema';
import { eq, desc, and, gte } from 'drizzle-orm';

/** Response shape for a single campaign status summary */
interface CampaignStatusSummary {
  campagneId: string;
  naam: string;
  flyersSentThisMonth: number;
  lastDispatchDate: string | null;
}

/** Response shape for the dispatch status endpoint */
interface DispatchStatusResponse {
  maand: string;
  campaigns: CampaignStatusSummary[];
  totalFlyersThisMonth: number;
}

/**
 * GET handler: return dispatch status for the authenticated retailer.
 * Shows flyer counts and last dispatch date per campaign for the current month.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = requireAuth(req);
  if (session instanceof NextResponse) return session;

  const db = requireDb();

  // Current month boundary (first of month)
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  // Fetch all retailer campaigns
  const retailerCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.retailerId, session.retailerId));

  const summaries: CampaignStatusSummary[] = [];

  for (const campagne of retailerCampaigns) {
    // Count verifications sent this month
    const monthVerifications = await db
      .select()
      .from(flyerVerifications)
      .where(
        and(
          eq(flyerVerifications.campagneId, campagne.id),
          gte(flyerVerifications.verzondenOp, monthStart),
        ),
      );

    // Find the most recent dispatch date
    const latestRows = await db
      .select()
      .from(flyerVerifications)
      .where(eq(flyerVerifications.campagneId, campagne.id))
      .orderBy(desc(flyerVerifications.verzondenOp))
      .limit(1);

    summaries.push({
      campagneId: campagne.id,
      naam: campagne.naam,
      flyersSentThisMonth: monthVerifications.length,
      lastDispatchDate: latestRows[0]?.verzondenOp?.toISOString() ?? null,
    });
  }

  const response: DispatchStatusResponse = {
    maand: monthStartStr,
    campaigns: summaries,
    totalFlyersThisMonth: summaries.reduce((s, c) => s + c.flyersSentThisMonth, 0),
  };

  return NextResponse.json(response);
}
