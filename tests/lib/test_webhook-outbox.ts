import { describe, it, expect } from 'vitest';
import {
  canonicalJson,
  signWebhookBody,
  verifyWebhookSignature,
  retryDelaySeconds,
} from '@/lib/webhook-outbox';

describe('canonicalJson', () => {
  it('test_canonical_sortsObjectKeys', () => {
    const a = canonicalJson({ b: 2, a: 1, c: 3 });
    const b = canonicalJson({ c: 3, a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it('test_canonical_nestedObjectsSorted', () => {
    const s = canonicalJson({ outer: { z: 1, a: 2 }, alpha: true });
    expect(s).toBe('{"alpha":true,"outer":{"a":2,"z":1}}');
  });

  it('test_canonical_arraysPreserveOrder', () => {
    expect(canonicalJson([3, 1, 2])).toBe('[3,1,2]');
  });

  it('test_canonical_primitives_unchanged', () => {
    expect(canonicalJson('hello')).toBe('"hello"');
    expect(canonicalJson(42)).toBe('42');
    expect(canonicalJson(null)).toBe('null');
  });
});

describe('signWebhookBody + verifyWebhookSignature', () => {
  const SECRET = 'whsec_test_secret_xyz';

  it('test_sign_producesHexDigest', () => {
    const sig = signWebhookBody('{"hello":"world"}', SECRET);
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('test_verify_correctSignature_true', () => {
    const body = '{"event":"scan.registered"}';
    const sig = signWebhookBody(body, SECRET);
    expect(verifyWebhookSignature(body, sig, SECRET)).toBe(true);
  });

  it('test_verify_wrongSecret_false', () => {
    const body = '{"event":"x"}';
    const sig = signWebhookBody(body, 'other-secret');
    expect(verifyWebhookSignature(body, sig, SECRET)).toBe(false);
  });

  it('test_verify_tamperedBody_false', () => {
    const sig = signWebhookBody('{"x":1}', SECRET);
    expect(verifyWebhookSignature('{"x":2}', sig, SECRET)).toBe(false);
  });

  it('test_verify_wrongLengthSignature_false', () => {
    expect(verifyWebhookSignature('{}', 'deadbeef', SECRET)).toBe(false);
  });
});

describe('retryDelaySeconds', () => {
  it('test_retryDelay_zeroOrNegative_returnsZero', () => {
    expect(retryDelaySeconds(0)).toBe(0);
    expect(retryDelaySeconds(-5)).toBe(0);
  });

  it('test_retryDelay_firstAttempt_returns30s', () => {
    expect(retryDelaySeconds(1)).toBe(30);
  });

  it('test_retryDelay_monotonicallyIncreasing_untilCap', () => {
    const d1 = retryDelaySeconds(1);
    const d2 = retryDelaySeconds(2);
    const d3 = retryDelaySeconds(3);
    const d4 = retryDelaySeconds(4);
    const d5 = retryDelaySeconds(5);
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
    expect(d4).toBeGreaterThan(d3);
    expect(d5).toBeGreaterThan(d4);
  });

  it('test_retryDelay_beyondSchedule_capsAtFinalValue', () => {
    const last = retryDelaySeconds(5);
    expect(retryDelaySeconds(6)).toBe(last);
    expect(retryDelaySeconds(100)).toBe(last);
  });
});
