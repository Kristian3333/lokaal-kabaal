import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { flyerVerifications } from '@/lib/schema';
import { eq } from 'drizzle-orm';

// ─── Webhook verificatie ────────────────────────────────────────────────────
// Verificatie via URL-token: /api/printone/webhook?token=xxx
// Of via header: x-webhook-secret (als PRINTONE_WEBHOOK_SECRET is ingesteld)
const WEBHOOK_SECRET = process.env.PRINTONE_WEBHOOK_SECRET ?? '';

function isValidWebhook(req: NextRequest): boolean {
  // Check URL token
  const urlToken = req.nextUrl.searchParams.get('token');
  if (WEBHOOK_SECRET && urlToken === WEBHOOK_SECRET) return true;
  // Check header
  if (WEBHOOK_SECRET && req.headers.get('x-webhook-secret') === WEBHOOK_SECRET) return true;
  // Geen secret geconfigureerd → accepteer alles (dev)
  if (!WEBHOOK_SECRET) return true;
  return false;
}

// ─── POST /api/printone/webhook ──────────────────────────────────────────────
// Print.one stuurt webhook events naar dit endpoint.
// We verwerken:
// - order_status_update → log status in console
// - batch_status_update → log batch status
// - qr_code_scanned    → registreer interesse (consument heeft QR gescand)

export async function POST(req: NextRequest) {
  if (!isValidWebhook(req)) {
    console.warn('[printone-webhook] ongeldig webhook secret — verworpen');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const event = body.event as string;
  const data  = body.data as Record<string, unknown>;

  console.log(`[printone-webhook] event: ${event}`);

  switch (event) {
    case 'qr_code_scanned': {
      // Print.one stuurt het order-object met metadata
      // De QR URL bevat onze verificatiecode: /v/CODE
      const metadata = data?.metadata as Record<string, unknown> | undefined;
      const orderId  = data?.id as string | undefined;

      if (!db || !orderId) break;

      // Zoek de flyer_verification die bij dit Print.one order hoort
      const rows = await db
        .select()
        .from(flyerVerifications)
        .where(eq(flyerVerifications.printoneOrderId, orderId))
        .limit(1);

      if (rows.length && !rows[0].interesseOp) {
        await db
          .update(flyerVerifications)
          .set({ interesseOp: new Date() })
          .where(eq(flyerVerifications.printoneOrderId, orderId));
        console.log(`[printone-webhook] interesse geregistreerd voor order ${orderId}`);
      }
      break;
    }

    case 'order_status_update': {
      const orderId = data?.id as string;
      const status  = data?.friendlyStatus as string;
      console.log(`[printone-webhook] order ${orderId} → ${status}`);
      break;
    }

    case 'batch_status_update': {
      const batchId = data?.id as string;
      const status  = data?.status as string;
      console.log(`[printone-webhook] batch ${batchId} → ${status}`);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
