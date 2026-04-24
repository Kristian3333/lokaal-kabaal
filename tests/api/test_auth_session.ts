import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/auth/session/route';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-with-enough-entropy-xyz-123456';
});

function mkRequest(cookieHeader?: string): NextRequest {
  const headers = new Headers();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  return new NextRequest('http://localhost/api/auth/session', { headers });
}

describe('GET /api/auth/session', () => {
  it('test_sessionRoute_noCookie_returnsUnauthenticated', async () => {
    const res = await GET(mkRequest());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({
      authenticated: false,
      email: null,
      retailerId: null,
      tier: null,
      branche: null,
      bedrijfsnaam: null,
    });
  });

  it('test_sessionRoute_invalidCookie_returnsUnauthenticated', async () => {
    const res = await GET(mkRequest('lk_session=not-a-valid-token'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
    expect(body.email).toBeNull();
  });

  it('test_sessionRoute_tamperedCookie_returnsUnauthenticated', async () => {
    // Create a payload that looks valid but has a bogus signature
    const payload = Buffer.from(JSON.stringify({
      email: 'evil@example.com',
      retailerId: 'fake',
      tier: 'agency',
      exp: Date.now() + 60_000,
    })).toString('base64');
    const token = `${payload}.${'0'.repeat(64)}`;
    const res = await GET(mkRequest(`lk_session=${token}`));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });
});
