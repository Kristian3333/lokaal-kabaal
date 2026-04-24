import { describe, it, expect } from 'vitest';
import { GET as securityTxt } from '@/app/api/well-known/security.txt/route';
import { GET as health } from '@/app/api/health/route';

describe('GET /.well-known/security.txt (via rewrite)', () => {
  it('test_securityTxt_servesRfc9116Fields_plainText', async () => {
    const res = securityTxt();
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    const body = await res.text();
    expect(body).toContain('Contact:');
    expect(body).toContain('Expires:');
    expect(body).toContain('security@lokaalkabaal.agency');
    expect(body).toContain('Canonical:');
  });
});

describe('GET /api/health', () => {
  it('test_health_respondsOk_withCacheBust', async () => {
    const res = await health();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(['up', 'down', 'unconfigured']).toContain(body.db);
    expect(typeof body.ts).toBe('string');
  });
});
