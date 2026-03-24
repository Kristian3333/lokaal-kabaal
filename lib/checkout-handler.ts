import Stripe from 'stripe';
import { requireDb } from '@/lib/db';
import { retailers } from '@/lib/schema';
import { eq } from 'drizzle-orm';

function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
}

export interface CheckoutResult {
  success: boolean;
  /** Whether the webhook has already processed and the DB is updated */
  webhookProcessed: boolean;
  tier?: string;
  email?: string;
  reason?: string;
}

/**
 * Verify and resolve a completed Stripe checkout session.
 *
 * Called from the dashboard when it detects the ?payment=success&session_id=...
 * query params. Retrieves the session from Stripe, then checks whether the
 * webhook has already updated the retailer record in the database.
 *
 * Returns a CheckoutResult indicating both overall success and whether the
 * webhook has been processed (so the caller can decide whether to poll or proceed).
 */
export async function resolveCheckoutSession(sessionId: string): Promise<CheckoutResult> {
  if (!sessionId || typeof sessionId !== 'string') {
    return { success: false, webhookProcessed: false, reason: 'Geen sessie-ID opgegeven' };
  }

  let session: Stripe.Checkout.Session;
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId);
  } catch (err: unknown) {
    console.error('[checkout-handler] Stripe sessie ophalen mislukt:', err);
    return { success: false, webhookProcessed: false, reason: 'Sessie niet gevonden' };
  }

  if (session.payment_status !== 'paid') {
    return {
      success: false,
      webhookProcessed: false,
      reason: `Betaling niet voltooid (status: ${session.payment_status})`,
    };
  }

  const email = session.customer_details?.email;
  if (!email) {
    return { success: false, webhookProcessed: false, reason: 'Geen e-mail op sessie' };
  }

  // Check whether the webhook has already updated the DB
  try {
    const db = requireDb();
    const rows = await db
      .select({
        tier: retailers.tier,
        subscriptionStatus: retailers.subscriptionStatus,
        stripeSubscriptionId: retailers.stripeSubscriptionId,
      })
      .from(retailers)
      .where(eq(retailers.email, email))
      .limit(1);

    const webhookProcessed =
      rows.length > 0 &&
      rows[0].stripeSubscriptionId !== null &&
      rows[0].subscriptionStatus === 'actief';

    return {
      success: true,
      webhookProcessed,
      tier: webhookProcessed ? rows[0].tier : undefined,
      email,
    };
  } catch (dbErr: unknown) {
    console.error('[checkout-handler] DB controle mislukt:', dbErr);
    // Stripe payment succeeded even if DB check fails; treat as partial success
    return { success: true, webhookProcessed: false, email };
  }
}
