import { describe, it, expect, vi, beforeEach } from 'vitest';

// The module under test constructs Stripe and reads from the DB. Stub both
// before importing so the real SDK / driver never initialise.

const sessionsRetrieve = vi.fn();
vi.mock('stripe', () => {
  class MockStripe {
    checkout = { sessions: { retrieve: sessionsRetrieve } };
  }
  return { default: MockStripe };
});

const dbSelect = vi.fn();
vi.mock('@/lib/db', () => ({
  requireDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({ limit: () => dbSelect() }),
      }),
    }),
  }),
}));

async function importHandler(): Promise<typeof import('@/lib/checkout-handler')> {
  return await import('@/lib/checkout-handler');
}

beforeEach(() => {
  sessionsRetrieve.mockReset();
  dbSelect.mockReset();
  process.env.STRIPE_SECRET_KEY = 'sk_test_stub';
});

describe('resolveCheckoutSession', () => {
  it('test_resolveCheckoutSession_emptyId_returnsFailure', async () => {
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('');
    expect(r.success).toBe(false);
    expect(r.reason).toContain('sessie');
  });

  it('test_resolveCheckoutSession_stripeRetrieveThrows_returnsFailure', async () => {
    sessionsRetrieve.mockRejectedValueOnce(new Error('no such session'));
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('cs_bad');
    expect(r.success).toBe(false);
    expect(r.reason).toContain('Sessie');
  });

  it('test_resolveCheckoutSession_unpaidSession_returnsFailure', async () => {
    sessionsRetrieve.mockResolvedValueOnce({ payment_status: 'unpaid', customer_details: { email: 'a@b.nl' } });
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('cs_unpaid');
    expect(r.success).toBe(false);
    expect(r.reason).toContain('unpaid');
  });

  it('test_resolveCheckoutSession_paidButNoEmail_returnsFailure', async () => {
    sessionsRetrieve.mockResolvedValueOnce({ payment_status: 'paid', customer_details: {} });
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('cs_noemail');
    expect(r.success).toBe(false);
    expect(r.reason).toBe('Geen e-mail op sessie');
  });

  it('test_resolveCheckoutSession_paidAndWebhookDone_returnsTierAndProcessed', async () => {
    sessionsRetrieve.mockResolvedValueOnce({ payment_status: 'paid', customer_details: { email: 'x@y.nl' } });
    dbSelect.mockResolvedValueOnce([{ tier: 'pro', subscriptionStatus: 'actief', stripeSubscriptionId: 'sub_1' }]);
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('cs_ok');
    expect(r.success).toBe(true);
    expect(r.webhookProcessed).toBe(true);
    expect(r.tier).toBe('pro');
    expect(r.email).toBe('x@y.nl');
  });

  it('test_resolveCheckoutSession_paidButWebhookPending_returnsSuccessNotProcessed', async () => {
    sessionsRetrieve.mockResolvedValueOnce({ payment_status: 'paid', customer_details: { email: 'pending@y.nl' } });
    dbSelect.mockResolvedValueOnce([{ tier: 'starter', subscriptionStatus: 'proef', stripeSubscriptionId: null }]);
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('cs_pending');
    expect(r.success).toBe(true);
    expect(r.webhookProcessed).toBe(false);
    expect(r.tier).toBeUndefined();
    expect(r.email).toBe('pending@y.nl');
  });

  it('test_resolveCheckoutSession_paidButDbLookupFails_returnsPartialSuccess', async () => {
    sessionsRetrieve.mockResolvedValueOnce({ payment_status: 'paid', customer_details: { email: 'dbfail@y.nl' } });
    dbSelect.mockRejectedValueOnce(new Error('db down'));
    const { resolveCheckoutSession } = await importHandler();
    const r = await resolveCheckoutSession('cs_dbfail');
    expect(r.success).toBe(true);
    expect(r.webhookProcessed).toBe(false);
    expect(r.email).toBe('dbfail@y.nl');
  });
});
