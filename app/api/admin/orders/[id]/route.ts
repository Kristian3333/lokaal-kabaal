import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { campaigns, retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/admin-auth';

/**
 * GET /api/admin/orders/[id]
 *
 * Returns the full campaign + retailer record so the admin UI can show
 * every field the operator might want to verify before approval.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const auth = requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  if (!db) return NextResponse.json({ error: 'Database niet geconfigureerd' }, { status: 503 });

  const { id } = await params;

  const rows = await db
    .select({
      campaign: campaigns,
      retailer: retailers,
    })
    .from(campaigns)
    .leftJoin(retailers, eq(campaigns.retailerId, retailers.id))
    .where(eq(campaigns.id, id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Bestelling niet gevonden' }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
