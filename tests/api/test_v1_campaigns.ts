import { describe, it, expect, beforeAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/campaigns/route';

beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-with-enough-entropy-xyz-123456';
});

function mkRequest(cookie?: string): NextRequest {
  const headers = new Headers();
  if (cookie) headers.set('cookie', cookie);
  return new NextRequest('http://localhost/api/v1/campaigns', { headers });
}

describe('GET /api/v1/campaigns', () => {
  it('test_v1Campaigns_noSession_returns401WithBearerChallenge', async () => {
    const res = await GET(mkRequest());
    expect(res.status).toBe(401);
    expect(res.headers.get('www-authenticate')).toContain('Bearer');
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
    expect(body.docs).toContain('/docs/api');
  });

  it('test_v1Campaigns_invalidSession_returns401', async () => {
    const res = await GET(mkRequest('lk_session=not-a-real-token'));
    expect(res.status).toBe(401);
  });
});
