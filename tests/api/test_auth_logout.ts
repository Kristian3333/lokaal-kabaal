import { describe, it, expect, beforeAll } from 'vitest';
import { POST } from '@/app/api/auth/logout/route';

// lib/auth reads SESSION_SECRET on demand; supply one so clearSessionCookie
// can run without tripping the env check.
beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-with-enough-entropy-xyz-123456';
});

describe('POST /api/auth/logout', () => {
  it('test_logoutRoute_happyPath_returnsJsonOk', async () => {
    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true });
  });

  it('test_logoutRoute_setsSessionCookieToExpire', async () => {
    const res = await POST();
    // Next.js sets cookies via the Set-Cookie header on the response
    const cookieHeader = res.headers.get('set-cookie') ?? '';
    // When clearSessionCookie runs, the cookie is either explicitly deleted
    // (Max-Age=0) or reset to empty. Both count as clearing.
    const clearsSession =
      cookieHeader.includes('lk_session=;') ||
      /lk_session=[^;]*;[^;]*Max-Age=0/i.test(cookieHeader) ||
      /lk_session=[^;]*;[^;]*Expires=Thu, 01 Jan 1970/i.test(cookieHeader);
    expect(clearsSession).toBe(true);
  });
});
