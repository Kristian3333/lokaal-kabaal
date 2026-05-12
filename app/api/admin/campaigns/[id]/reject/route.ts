import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * POST /api/admin/campaigns/[id]/reject
 *
 * Mark a campaign as cancelled. Body: { reason: string }. The rejection
 * reason is stored on the campaign so the next operator (or the customer
 * support flow) can see why it was killed.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { reason?: string };
  const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 2000) : '';

  if (!reason) {
    return NextResponse.json({ error: 'Reden is verplicht' }, { status: 400 });
  }

  const result = await db
    .update(campaigns)
    .set({
      awaitingReview: false,
      status: 'geannuleerd',
      reviewedAt: new Date(),
      reviewedBy: auth.email,
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id))
    .returning({ id: campaigns.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 });
  }

  console.warn(`[admin] rejected campaign ${id} by ${auth.email}: ${reason}`);

  return NextResponse.json({ ok: true, id });
}
