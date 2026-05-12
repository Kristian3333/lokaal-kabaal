import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, retailers } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/admin/orders?status=pending|approved|rejected|all
 *
 * Lists campaigns for operator review. Default `status=pending` returns
 * everything awaiting approval (awaitingReview=true). `approved` returns
 * the most recent 50 approved campaigns (audit / sanity check). `all`
 * returns the 100 most recent regardless of state.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });

  const statusFilter = req.nextUrl.searchParams.get('status') ?? 'pending';

  try {
    const baseQuery = db
      .select({
        id: campaigns.id,
        naam: campaigns.naam,
        branche: campaigns.branche,
        status: campaigns.status,
        awaitingReview: campaigns.awaitingReview,
        reviewedAt: campaigns.reviewedAt,
        reviewedBy: campaigns.reviewedBy,
        rejectionReason: campaigns.rejectionReason,
        centrum: campaigns.centrum,
        straalKm: campaigns.straalKm,
        formaat: campaigns.formaat,
        dubbelzijdig: campaigns.dubbelzijdig,
        verwachtAantalPerMaand: campaigns.verwachtAantalPerMaand,
        duurMaanden: campaigns.duurMaanden,
        startMaand: campaigns.startMaand,
        eindMaand: campaigns.eindMaand,
        createdAt: campaigns.createdAt,
        retailerId: campaigns.retailerId,
        retailerEmail: retailers.email,
        retailerNaam: retailers.bedrijfsnaam,
        retailerTier: retailers.tier,
      })
      .from(campaigns)
      .leftJoin(retailers, eq(campaigns.retailerId, retailers.id))
      .orderBy(desc(campaigns.createdAt));

    let rows;
    if (statusFilter === 'pending') {
      rows = await baseQuery.where(eq(campaigns.awaitingReview, true)).limit(100);
    } else if (statusFilter === 'approved') {
      rows = await baseQuery.where(eq(campaigns.awaitingReview, false)).limit(50);
    } else {
      rows = await baseQuery.limit(100);
    }

    return NextResponse.json({ orders: rows, count: rows.length });
  } catch (err) {
    // The most common cause is a missing migration: the columns
    // awaiting_review / reviewed_at / reviewed_by / review_notes /
    // rejection_reason are introduced by drizzle/0002_daily_molecule_man.sql
    // and the query fails before this catch otherwise. Surface the
    // underlying message in non-production so the operator can see it.
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/orders]', msg);
    const isMissingColumn = /column.*does not exist/i.test(msg);
    return NextResponse.json(
      {
        error: 'Fout bij ophalen bestellingen',
        detail: process.env.NODE_ENV !== 'production' ? msg : undefined,
        hint: isMissingColumn
          ? 'Run de databasemigratie: `npx drizzle-kit migrate` (kolommen awaiting_review e.a. ontbreken).'
          : undefined,
      },
      { status: 500 },
    );
  }
}
