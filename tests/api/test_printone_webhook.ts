import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';

// The webhook route reads PRINTONE_WEBHOOK_SECRET at module-load time (top-level
// const). Configure the env before the dynamic import so the captured secret
// matches what the tests pass in.
beforeAll(() => {
  process.env.PRINTONE_WEBHOOK_SECRET = 'po-test-secret-xyz';
});

async function importRoute(): Promise<typeof import('@/app/api/printone/webhook/route')> {
  return await import('@/app/api/printone/webhook/route');
}

function mkRequest(opts: { token?: string; headerSecret?: string; body?: unknown } = {}): NextRequest {
  const params = opts.token ? `?token=${encodeURIComponent(opts.token)}` : '';
  const headers = new Headers({ 'content-type': 'application/json' });
  if (opts.headerSecret) headers.set('x-webhook-secret', opts.headerSecret);
  return new NextRequest(`http://localhost/api/printone/webhook${params}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(opts.body ?? { event: 'order_status_update', data: { id: 'ord_1', friendlyStatus: 'printed' } }),
  });
}

describe('POST /api/printone/webhook auth', () => {
  it('test_printoneWebhook_noTokenOrHeader_returns401', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('test_printoneWebhook_wrongUrlToken_returns401', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest({ token: 'not-the-secret' }));
    expect(res.status).toBe(401);
  });

  it('test_printoneWebhook_wrongHeaderSecret_returns401', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest({ headerSecret: 'nope' }));
    expect(res.status).toBe(401);
  });

  it('test_printoneWebhook_validUrlToken_returns200', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest({ token: 'po-test-secret-xyz' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ received: true });
  });

  it('test_printoneWebhook_validHeaderSecret_returns200', async () => {
    const { POST } = await importRoute();
    const res = await POST(mkRequest({ headerSecret: 'po-test-secret-xyz' }));
    expect(res.status).toBe(200);
  });

  it('test_printoneWebhook_validAuthButInvalidJson_returns400', async () => {
    const { POST } = await importRoute();
    const headers = new Headers({ 'content-type': 'application/json', 'x-webhook-secret': 'po-test-secret-xyz' });
    const req = new NextRequest('http://localhost/api/printone/webhook', {
      method: 'POST',
      headers,
      body: 'not-json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body).toEqual({ error: 'Invalid JSON' });
  });
});
