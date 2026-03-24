import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/auth';
import { requireDb } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

/**
 * POST /api/stripe/portal
 *
 * Creates a Stripe Billing Portal session for the authenticated retailer.
 * Looks up the retailer's stripeCustomerId from the database.
 * Returns the portal URL for redirect.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

  try {
    const db = requireDb();
    const rows = await db
      .select({ stripeCustomerId: retailers.stripeCustomerId })
      .from(retailers)
      .where(eq(retailers.id, authResult.retailerId))
      .limit(1);

    if (rows.length === 0 || !rows[0].stripeCustomerId) {
      return NextResponse.json(
        { error: 'Geen actief abonnement gevonden' },
        { status: 404 },
      );
    }

    const session = await getStripe().billingPortal.sessions.create({
      customer: rows[0].stripeCustomerId,
      return_url: `${baseUrl}/app`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error('[stripe/portal]', err);
    return NextResponse.json({ error: 'Portaal starten mislukt' }, { status: 500 });
  }
}
