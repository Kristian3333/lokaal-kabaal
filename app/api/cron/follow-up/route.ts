import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications, retailers, campaigns } from '@/lib/schema';
import { eq, and, isNotNull, lte, inArray } from 'drizzle-orm';
import { sendScanNotification } from '@/lib/email';

export const maxDuration = 60;

/** Authorization check using CRON_SECRET header. Fails closed if CRON_SECRET is not set. */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

/**
 * GET /api/cron/follow-up
 *
 * Daily cron: finds all flyer verifications that have been scanned (interesseOp is set),
 * have not yet received a follow-up notification (followUpVerzonden = false),
 * and were sent more than 3 days ago. Groups them by retailer and sends a
 * batch scan-notification email per retailer.
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

  // Three days ago -- verifications must be older than this
  const driedagenGeleden = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  // Fetch all pending follow-up verifications in one query
  const pending = await db
    .select({
      verificationId: flyerVerifications.id,
      retailerId: flyerVerifications.retailerId,
      campagneId: flyerVerifications.campagneId,
    })
    .from(flyerVerifications)
    .where(
      and(
        isNotNull(flyerVerifications.interesseOp),
        eq(flyerVerifications.followUpVerzonden, false),
        lte(flyerVerifications.verzondenOp, driedagenGeleden),
      ),
    );

  if (pending.length === 0) {
    return NextResponse.json({ gestart: new Date().toISOString(), verwerkt: 0, emails: 0 });
  }

  // Group pending items by retailer + campaign for batching
  const grouped = new Map<string, { retailerId: string; campagneId: string; ids: string[] }>();

  for (const row of pending) {
    const key = `${row.retailerId}::${row.campagneId}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.ids.push(row.verificationId);
    } else {
      grouped.set(key, {
        retailerId: row.retailerId,
        campagneId: row.campagneId,
        ids: [row.verificationId],
      });
    }
  }

  const now = new Date();
  let emailsVerzonden = 0;
  let verwerkt = 0;

  for (const group of Array.from(grouped.values())) {
    try {
      // Fetch retailer details
      const retailerRows = await db
        .select({ email: retailers.email, bedrijfsnaam: retailers.bedrijfsnaam })
        .from(retailers)
        .where(eq(retailers.id, group.retailerId))
        .limit(1);

      const retailer = retailerRows[0];
      if (!retailer) continue;

      // Fetch campaign name
      const campagneRows = await db
        .select({ naam: campaigns.naam })
        .from(campaigns)
        .where(eq(campaigns.id, group.campagneId))
        .limit(1);

      const campagneNaam = campagneRows[0]?.naam ?? group.campagneId;
      const scanCount = group.ids.length;

      // Send the notification email
      const sent = await sendScanNotification(
        retailer.email,
        retailer.bedrijfsnaam,
        scanCount,
        campagneNaam,
      );

      if (sent) emailsVerzonden++;

      // Mark all verifications in this group as follow-up sent (batch update)
      try {
        await db
          .update(flyerVerifications)
          .set({ followUpVerzonden: true, followUpOp: now })
          .where(inArray(flyerVerifications.id, group.ids));
        verwerkt += group.ids.length;
      } catch (err) {
        console.error(`[cron/follow-up] DB batch update failed for ${group.ids.length} verifications:`, err);
      }
    } catch (err) {
      console.error(
        `[cron/follow-up] Error processing retailer ${group.retailerId} / campaign ${group.campagneId}:`,
        err,
      );
    }
  }

  return NextResponse.json({
    gestart: now.toISOString(),
    groepenVerwerkt: grouped.size,
    verwerkt,
    emails: emailsVerzonden,
  });
}
