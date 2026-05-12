import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * POST /api/admin/campaigns/[id]/approve
 *
 * Clears the awaitingReview flag so the next dispatch-cron run will
 * pick the campaign up. Stamps reviewedAt / reviewedBy / reviewNotes
 * for audit. Status stays 'actief'.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => ({})) as { notes?: string };
  const notes = typeof body.notes === 'string' ? body.notes.slice(0, 2000) : null;

  const result = await db
    .update(campaigns)
    .set({
      awaitingReview: false,
      reviewedAt: new Date(),
      reviewedBy: auth.email,
      reviewNotes: notes,
      rejectionReason: null,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, id))
    .returning({ id: campaigns.id });

  if (result.length === 0) {
    return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 });
  }

  console.warn(`[admin] approved campaign ${id} by ${auth.email}`);

  return NextResponse.json({ ok: true, id });
}
