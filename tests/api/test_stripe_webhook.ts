import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// The webhook route captures STRIPE_WEBHOOK_SECRET at module-load via a
// top-level const, so the env must be set before the dynamic import resolves.
beforeAll(() => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_stub';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_stub';
});

async function importRoute(): Promise<typeof import('@/app/api/stripe/webhook/route')> {
  return await import('@/app/api/stripe/webhook/route');
}

function mkRequest(body: string, signature: string | null): NextRequest {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (signature !== null) headers.set('stripe-signature', signature);
  return new NextRequest('http://localhost/api/stripe/webhook', {
    method: 'POST',
    headers,
    body,
  });
}

/**
 * Build a syntactically-correct Stripe signature header for the given
 * payload and secret. Stripe's official webhook-verification algorithm hashes
 * `timestamp.payload` with HMAC-SHA256 and formats the header as
 * `t=<timestamp>,v1=<signature>`. Used so the "happy-path" signature parser
 * is exercised (though we still expect 400 below because we stop at parse
 * time -- there is no real event body).
 */
function stripeSignature(payload: string, secret: string, timestamp: number): string {
  const signedPayload = `${timestamp}.${payload}`;
  const sig = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');
  return `t=${timestamp},v1=${sig}`;
}

describe('POST /api/stripe/webhook signature validation', () => {
  it('test_stripeWebhook_missingSignature_returns400', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest('{}', null));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Geen signature' });
  });

  it('test_stripeWebhook_emptySignature_returns400', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest('{}', ''));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Geen signature' });
  });

  it('test_stripeWebhook_garbageSignature_returns400', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest('{"type":"checkout.session.completed"}', 'not-a-real-signature'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Ongeldige signature' });
  });

  it('test_stripeWebhook_wrongSecretSignature_returns400', async () => {
    const { POST } = await importRoute();
    const payload = JSON.stringify({ type: 'invoice.payment_failed' });
    // Sign with a DIFFERENT secret so Stripe.webhooks.constructEvent rejects it
    const sig = stripeSignature(payload, 'whsec_wrong_secret', Math.floor(Date.now() / 1000));
    const res = await POST(mkRequest(payload, sig));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Ongeldige signature' });
  });

  it('test_stripeWebhook_expiredTimestamp_returns400', async () => {
    const { POST } = await importRoute();
    const payload = JSON.stringify({ type: 'invoice.payment_failed' });
    // Stripe's default tolerance is 5 minutes; a 1-hour-old timestamp fails
    const oldTimestamp = Math.floor(Date.now() / 1000) - 60 * 60;
    const sig = stripeSignature(payload, 'whsec_test_stub', oldTimestamp);
    const res = await POST(mkRequest(payload, sig));
    expect(res.status).toBe(400);
  });
});
