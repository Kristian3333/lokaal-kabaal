import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { retailers, flyerVerifications } from '@/lib/schema';
import { eq, and, gte, lt, isNotNull } from 'drizzle-orm';
import { sendMonthlyReport } from '@/lib/email';
import type { MonthlyReport } from '@/lib/email';

export const maxDuration = 120;

/** Authorization check using CRON_SECRET header. Fails closed if CRON_SECRET is not set. */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

/** Return the first and last moment (exclusive) of the previous calendar month as Date objects. */
function prevMonthBounds(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  return { start, end };
}

/**
 * Derive the top postcodes from a list of verifications by scan count.
 *
 * @param verifications - Array of objects with postcode and interesseOp fields
 * @param topN          - Maximum number of postcodes to return
 * @returns Array of postcode strings sorted by descending scan count
 */
function topPostcodes(
  verifications: Array<{ postcode: string; interesseOp: Date | null }>,
  topN: number,
): string[] {
  const counts = new Map<string, number>();
  for (const v of verifications) {
    if (v.interesseOp) {
      counts.set(v.postcode, (counts.get(v.postcode) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([pc]) => pc);
}

/**
 * GET /api/cron/monthly-report
 *
 * Monthly cron (runs on the 1st of each month): for each active retailer,
 * compiles stats from the previous month and sends a performance report email.
 *
 * Protected by CRON_SECRET authorization header.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'DATABASE_URL niet geconfigureerd' }, { status: 503 });
  }

  const { start, end } = prevMonthBounds();
  const now = new Date();

  // Fetch all retailers that have at least one campaign
  const allRetailers = await db
    .select({ id: retailers.id, email: retailers.email, bedrijfsnaam: retailers.bedrijfsnaam })
    .from(retailers);

  let emailsVerzonden = 0;
  let fouten = 0;

  for (const retailer of allRetailers) {
    try {
      // Fetch all verifications sent for this retailer in the previous month
      const verifs = await db
        .select({
          postcode: flyerVerifications.postcode,
          interesseOp: flyerVerifications.interesseOp,
          conversieOp: flyerVerifications.conversieOp,
        })
        .from(flyerVerifications)
        .where(
          and(
            eq(flyerVerifications.retailerId, retailer.id),
            gte(flyerVerifications.verzondenOp, start),
            lt(flyerVerifications.verzondenOp, end),
          ),
        );

      // Skip retailers with no activity last month
      if (verifs.length === 0) continue;

      const flyersSent = verifs.length;
      const scans = verifs.filter((v) => v.interesseOp !== null).length;
      const conversions = verifs.filter((v) => v.conversieOp !== null).length;
      const conversionRate = flyersSent > 0 ? (conversions / flyersSent) * 100 : 0;
      const top = topPostcodes(verifs, 5);

      const report: MonthlyReport = {
        flyersSent,
        scans,
        conversions,
        conversionRate,
        topPostcodes: top,
      };

      const sent = await sendMonthlyReport(retailer.email, retailer.bedrijfsnaam, report);
      if (sent) emailsVerzonden++;
    } catch (err) {
      console.error(`[cron/monthly-report] Error for retailer ${retailer.id}:`, err);
      fouten++;
    }
  }

  return NextResponse.json({
    gestart: now.toISOString(),
    maandStart: start.toISOString(),
    maandEind: end.toISOString(),
    retailers: allRetailers.length,
    emailsVerzonden,
    fouten,
  });
}

