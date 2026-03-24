import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireAuth } from '@/lib/auth';
import { requireDb } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

interface InvoiceRecord {
  id: string;
  datum: string;
  bedragCents: number;
  valuta: string;
  status: string;
  pdfUrl: string | null;
  beschrijving: string | null;
}

/**
 * GET /api/stripe/invoices
 *
 * Returns the last 12 invoices for the authenticated retailer.
 * Fetches live data from Stripe using the retailer's stripeCustomerId.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const authResult = requireAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const db = requireDb();
    const rows = await db
      .select({ stripeCustomerId: retailers.stripeCustomerId })
      .from(retailers)
      .where(eq(retailers.id, authResult.retailerId))
      .limit(1);

    if (rows.length === 0 || !rows[0].stripeCustomerId) {
      return NextResponse.json({ invoices: [] });
    }

    const invoices = await getStripe().invoices.list({
      customer: rows[0].stripeCustomerId,
      limit: 12,
    });

    const records: InvoiceRecord[] = invoices.data.map(inv => ({
      id: inv.id,
      datum: new Date(inv.created * 1000).toISOString(),
      bedragCents: inv.amount_paid,
      valuta: inv.currency,
      status: inv.status ?? 'onbekend',
      pdfUrl: inv.invoice_pdf ?? null,
      beschrijving: inv.description ?? inv.lines.data[0]?.description ?? null,
    }));

    return NextResponse.json({ invoices: records });
  } catch (err: unknown) {
    console.error('[stripe/invoices]', err);
    return NextResponse.json({ error: 'Facturen ophalen mislukt' }, { status: 500 });
  }
}
