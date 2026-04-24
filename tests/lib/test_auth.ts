import { describe, it, expect, beforeAll } from 'vitest';
import { createSessionToken, verifySessionToken } from '@/lib/auth';

// lib/auth.ts reads SESSION_SECRET lazily per call; set a stable test secret
// before any token operations so signing and verification agree.
beforeAll(() => {
  process.env.SESSION_SECRET = 'test-secret-with-enough-entropy-xyz-123456';
});

const VALID_PAYLOAD = {
  email: 'jane@example.com',
  retailerId: '11111111-2222-3333-4444-555555555555',
  tier: 'pro',
};

describe('createSessionToken / verifySessionToken', () => {
  it('test_createSessionToken_validPayload_returnsDotSeparatedToken', () => {
    const token = createSessionToken(VALID_PAYLOAD);
    expect(token).toContain('.');
    const [payloadB64, signature] = token.split('.');
    expect(payloadB64.length).toBeGreaterThan(0);
    expect(signature).toMatch(/^[0-9a-f]+$/);
  });

  it('test_verifySessionToken_validRoundtrip_returnsOriginalClaims', () => {
    const token = createSessionToken(VALID_PAYLOAD);
    const data = verifySessionToken(token);
    expect(data).not.toBeNull();
    expect(data!.email).toBe(VALID_PAYLOAD.email);
    expect(data!.retailerId).toBe(VALID_PAYLOAD.retailerId);
    expect(data!.tier).toBe(VALID_PAYLOAD.tier);
    expect(data!.exp).toBeGreaterThan(Date.now());
  });

  it('test_verifySessionToken_tamperedSignature_returnsNull', () => {
    const token = createSessionToken(VALID_PAYLOAD);
    const [payloadB64] = token.split('.');
    const tampered = `${payloadB64}.${'f'.repeat(64)}`;
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it('test_verifySessionToken_tamperedPayload_returnsNull', () => {
    const token = createSessionToken(VALID_PAYLOAD);
    const [, signature] = token.split('.');
    const fakePayload = Buffer.from(
      JSON.stringify({ ...VALID_PAYLOAD, tier: 'agency', exp: Date.now() + 1e9 })
    ).toString('base64');
    const tampered = `${fakePayload}.${signature}`;
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it('test_verifySessionToken_missingSignature_returnsNull', () => {
    const token = createSessionToken(VALID_PAYLOAD);
    const [payloadB64] = token.split('.');
    expect(verifySessionToken(payloadB64)).toBeNull();
  });

  it('test_verifySessionToken_malformedInput_returnsNull', () => {
    expect(verifySessionToken('not-a-token')).toBeNull();
    expect(verifySessionToken('')).toBeNull();
    expect(verifySessionToken('.')).toBeNull();
  });

  it('test_verifySessionToken_expiredToken_returnsNull', () => {
    // Build a manually-expired token using the same signing routine so we
    // exercise only the expiry check, not any other failure path.
    const expiredPayload = JSON.stringify({ ...VALID_PAYLOAD, exp: Date.now() - 1 });
    const payloadB64 = Buffer.from(expiredPayload).toString('base64');
    // Use the same HMAC by roundtripping createSessionToken is not enough since
    // it sets its own exp. Instead, sign via the public API indirectly: we
    // rebuild the HMAC manually with require('crypto') to match lib/auth's impl.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto') as typeof import('crypto');
    const sig = crypto.createHmac('sha256', process.env.SESSION_SECRET!).update(expiredPayload).digest('hex');
    const token = `${payloadB64}.${sig}`;
    expect(verifySessionToken(token)).toBeNull();
  });
});
