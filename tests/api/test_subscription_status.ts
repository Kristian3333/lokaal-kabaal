import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/subscription/status/route';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-with-enough-entropy-xyz-123456';
});

function mkRequest(cookieHeader?: string): NextRequest {
  const headers = new Headers();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  return new NextRequest('http://localhost/api/subscription/status', { headers });
}

describe('GET /api/subscription/status', () => {
  it('test_subscriptionStatus_unauthenticated_returns401', async () => {
    const res = await GET(mkRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Niet ingelogd' });
  });

  it('test_subscriptionStatus_invalidSession_returns401', async () => {
    const res = await GET(mkRequest('lk_session=broken-token'));
    expect(res.status).toBe(401);
  });
});
