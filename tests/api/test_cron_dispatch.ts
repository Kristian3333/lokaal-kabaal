import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/cron/dispatch/route';

const originalSecret = process.env.CRON_SECRET;

beforeAll(() => {
  process.env.CRON_SECRET = 'test-cron-secret-xyz';
});

afterAll(() => {
  if (originalSecret === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = originalSecret;
  }
});

function mkRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  if (authHeader) headers.set('authorization', authHeader);
  return new NextRequest('http://localhost/api/cron/dispatch', { method: 'POST', headers });
}

describe('POST /api/cron/dispatch auth', () => {
  it('test_cronDispatch_noAuthHeader_returns401', async () => {
    const res = await POST(mkRequest());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body).toEqual({ error: 'Unauthorized' });
  });

  it('test_cronDispatch_wrongSecret_returns401', async () => {
    const res = await POST(mkRequest('Bearer not-the-secret'));
    expect(res.status).toBe(401);
  });

  it('test_cronDispatch_missingBearerPrefix_returns401', async () => {
    const res = await POST(mkRequest('test-cron-secret-xyz'));
    expect(res.status).toBe(401);
  });
});

describe('GET /api/cron/dispatch auth', () => {
  it('test_cronDispatch_getWithoutAuth_returns401', async () => {
    const res = await GET(mkRequest());
    expect(res.status).toBe(401);
  });
});

describe('POST /api/cron/dispatch without CRON_SECRET env', () => {
  it('test_cronDispatch_unsetSecret_rejectsAll', async () => {
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    try {
      // Even with any Authorization header, the route must fail closed
      const res = await POST(mkRequest('Bearer anything'));
      expect(res.status).toBe(401);
    } finally {
      process.env.CRON_SECRET = saved;
    }
  });
});
