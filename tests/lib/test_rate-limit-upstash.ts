import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkAndIncrementUpstash,
  isUpstashConfigured,
  readUpstashConfig,
  type UpstashConfig,
} from '@/lib/rate-limit-upstash';

const origEnv = { ...process.env };

afterEach(() => {
  // Restore env between tests to avoid leakage.
  process.env = { ...origEnv };
});

describe('isUpstashConfigured', () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('test_isUpstashConfigured_bothVarsSet_returnsTrue', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    expect(isUpstashConfigured()).toBe(true);
  });

  it('test_isUpstashConfigured_missingUrl_returnsFalse', () => {
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    expect(isUpstashConfigured()).toBe(false);
  });

  it('test_isUpstashConfigured_missingToken_returnsFalse', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    expect(isUpstashConfigured()).toBe(false);
  });
});

describe('readUpstashConfig', () => {
  beforeEach(() => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it('test_readUpstashConfig_bothSet_returnsConfig', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'token';
    expect(readUpstashConfig()).toEqual({
      url: 'https://example.upstash.io',
      token: 'token',
    });
  });

  it('test_readUpstashConfig_missingToken_throws', () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    expect(() => readUpstashConfig()).toThrow(/UPSTASH_REDIS_REST_TOKEN/);
  });
});

/**
 * Build a fake fetch that returns a queue of JSON payloads in order, one per
 * call. Each pipeline invocation pops the next queued response.
 */
function fetchStub(responses: Array<Array<{ result?: unknown; error?: string }>>): {
  fetchFn: typeof fetch;
  calls: Array<{ url: string; body: string[][]; headers: Record<string, string> }>;
} {
  const calls: Array<{ url: string; body: string[][]; headers: Record<string, string> }> = [];
  const queue = [...responses];
  const fetchFn = (async (input: string | URL | Request, init?: RequestInit) => {
    const body = init?.body ? (JSON.parse(String(init.body)) as string[][]) : [];
    const headers = (init?.headers as Record<string, string>) ?? {};
    calls.push({ url: String(input), body, headers });
    const next = queue.shift() ?? [];
    return {
      ok: true,
      status: 200,
      json: async () => next,
    } as Response;
  }) as unknown as typeof fetch;
  return { fetchFn, calls };
}

const cfg: UpstashConfig = { url: 'https://example.upstash.io', token: 't' };

describe('checkAndIncrementUpstash', () => {
  it('test_underLimit_returnsSuccess_withRemainingDecremented', async () => {
    // First pipeline call returns trim + count=2 (below maxRequests=5).
    // Second pipeline call (zadd+expire) returns empty success.
    const { fetchFn, calls } = fetchStub([
      [{ result: 0 }, { result: 2 }],
      [{ result: 1 }, { result: 1 }],
    ]);
    const res = await checkAndIncrementUpstash(cfg, {
      key: 'ip:1.2.3.4',
      windowMs: 60_000,
      maxRequests: 5,
      fetchFn,
      now: () => 1_000_000,
      randomSuffix: () => 'abc',
    });
    expect(res).toEqual({ success: true, remaining: 2 }); // 5-2-1
    // Two HTTP calls (check, then write).
    expect(calls).toHaveLength(2);
  });

  it('test_atMax_returnsBlocked_andDoesNotWrite', async () => {
    const { fetchFn, calls } = fetchStub([[{ result: 0 }, { result: 5 }]]);
    const res = await checkAndIncrementUpstash(cfg, {
      key: 'ip:1.2.3.4',
      windowMs: 60_000,
      maxRequests: 5,
      fetchFn,
      now: () => 1_000_000,
    });
    expect(res).toEqual({ success: false, remaining: 0 });
    // Only one HTTP call -- we don't increment when blocked.
    expect(calls).toHaveLength(1);
  });

  it('test_atMaxMinusOne_returnsSuccessWithZeroRemaining', async () => {
    const { fetchFn } = fetchStub([
      [{ result: 0 }, { result: 4 }],
      [{ result: 1 }, { result: 1 }],
    ]);
    const res = await checkAndIncrementUpstash(cfg, {
      key: 'ip:1.2.3.4',
      windowMs: 60_000,
      maxRequests: 5,
      fetchFn,
      now: () => 1_000_000,
    });
    expect(res).toEqual({ success: true, remaining: 0 });
  });

  it('test_cutoffPassedToZRemRangeByScore_isNowMinusWindow', async () => {
    const { fetchFn, calls } = fetchStub([
      [{ result: 0 }, { result: 0 }],
      [{ result: 1 }, { result: 1 }],
    ]);
    await checkAndIncrementUpstash(cfg, {
      key: 'ip:abc',
      windowMs: 60_000,
      maxRequests: 3,
      fetchFn,
      now: () => 2_000_000,
    });
    const firstPipeline = calls[0].body;
    expect(firstPipeline[0]).toEqual(['ZREMRANGEBYSCORE', 'rl:ip:abc', '0', '1940000']);
    expect(firstPipeline[1]).toEqual(['ZCARD', 'rl:ip:abc']);
  });

  it('test_authHeader_bearerToken', async () => {
    const { fetchFn, calls } = fetchStub([[{ result: 0 }, { result: 5 }]]);
    await checkAndIncrementUpstash(cfg, {
      key: 'k',
      windowMs: 60_000,
      maxRequests: 5,
      fetchFn,
      now: () => 1,
    });
    expect(calls[0].headers.Authorization).toBe('Bearer t');
  });

  it('test_pipelineErrorOnTrim_throwsWrappedError', async () => {
    const { fetchFn } = fetchStub([[{ error: 'WRONGTYPE' }, { result: 0 }]]);
    await expect(
      checkAndIncrementUpstash(cfg, {
        key: 'k',
        windowMs: 60_000,
        maxRequests: 5,
        fetchFn,
        now: () => 1,
      }),
    ).rejects.toThrow(/WRONGTYPE/);
  });

  it('test_httpErrorOn5xx_throws', async () => {
    const fetchFn = (async () => ({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response)) as unknown as typeof fetch;
    await expect(
      checkAndIncrementUpstash(cfg, {
        key: 'k',
        windowMs: 60_000,
        maxRequests: 5,
        fetchFn,
        now: () => 1,
      }),
    ).rejects.toThrow(/HTTP 500/);
  });

  it('test_expireSeconds_ceilOfWindowMs', async () => {
    const { fetchFn, calls } = fetchStub([
      [{ result: 0 }, { result: 0 }],
      [{ result: 1 }, { result: 1 }],
    ]);
    await checkAndIncrementUpstash(cfg, {
      key: 'k',
      windowMs: 2_500, // 2.5s -> ceil -> 3s expire
      maxRequests: 5,
      fetchFn,
      now: () => 1_000,
      randomSuffix: () => 'sfx',
    });
    const secondPipeline = calls[1].body;
    expect(secondPipeline[0]).toEqual(['ZADD', 'rl:k', '1000', '1000:sfx']);
    expect(secondPipeline[1]).toEqual(['EXPIRE', 'rl:k', '3']);
  });
});
