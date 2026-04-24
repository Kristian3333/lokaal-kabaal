/**
 * Distributed rate limiter backed by Upstash Redis over its REST API.
 *
 * Drop-in replacement for the in-memory sliding window in lib/rate-limit.
 * Uses a sorted set per key where the score is the request timestamp, so
 * we can trim the window with ZREMRANGEBYSCORE and count with ZCARD. Two
 * round-trips (check + increment) trade strict atomicity for simplicity;
 * the worst-case race is within one HTTP RTT and acceptable for abuse
 * prevention. Upgrade to an EVAL/Lua script if perfect atomicity matters.
 *
 * No @upstash/redis dependency -- we talk to the REST endpoint directly so
 * the bundle stays small and the transport is easy to mock in tests.
 */

export type UpstashConfig = {
  url: string;
  token: string;
};

export type UpstashLimiterOptions = {
  key: string;
  windowMs: number;
  maxRequests: number;
  /** Injectable fetch for tests. Defaults to globalThis.fetch. */
  fetchFn?: typeof fetch;
  /** Injectable clock for tests. Defaults to Date.now. */
  now?: () => number;
  /** Injectable random suffix for member uniqueness. */
  randomSuffix?: () => string;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
};

/** True when the module has the env vars needed to make REST calls. */
export function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/**
 * Read credentials from env. Throws a specific error rather than returning
 * a partial config so misconfiguration surfaces loudly in the app logs.
 */
export function readUpstashConfig(): UpstashConfig {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error('Upstash env vars missing: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN');
  }
  return { url, token };
}

async function pipeline(
  config: UpstashConfig,
  commands: string[][],
  fetchFn: typeof fetch,
): Promise<Array<{ result?: unknown; error?: string }>> {
  const resp = await fetchFn(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!resp.ok) {
    throw new Error(`Upstash pipeline failed: HTTP ${resp.status}`);
  }
  return resp.json() as Promise<Array<{ result?: unknown; error?: string }>>;
}

/**
 * Check if the caller is within the sliding window limit and, when allowed,
 * record the request. Returns `success=false` with `remaining=0` when the
 * window is saturated.
 *
 * @param config - Upstash REST URL + token.
 * @param opts - key, window, max, and injectable fetch/clock/suffix.
 */
export async function checkAndIncrementUpstash(
  config: UpstashConfig,
  opts: UpstashLimiterOptions,
): Promise<RateLimitResult> {
  const {
    key,
    windowMs,
    maxRequests,
    fetchFn = fetch,
    now = Date.now,
    randomSuffix = () => Math.random().toString(36).slice(2, 10),
  } = opts;

  const redisKey = `rl:${key}`;
  const timestamp = now();
  const cutoff = timestamp - windowMs;

  const [trim, count] = await pipeline(
    config,
    [
      ['ZREMRANGEBYSCORE', redisKey, '0', String(cutoff)],
      ['ZCARD', redisKey],
    ],
    fetchFn,
  );

  if (trim?.error) throw new Error(`Upstash ZREMRANGEBYSCORE: ${trim.error}`);
  if (count?.error) throw new Error(`Upstash ZCARD: ${count.error}`);

  const currentCount = typeof count.result === 'number' ? count.result : 0;

  if (currentCount >= maxRequests) {
    return { success: false, remaining: 0 };
  }

  const expireSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  await pipeline(
    config,
    [
      ['ZADD', redisKey, String(timestamp), `${timestamp}:${randomSuffix()}`],
      ['EXPIRE', redisKey, String(expireSeconds)],
    ],
    fetchFn,
  );

  return {
    success: true,
    remaining: Math.max(0, maxRequests - currentCount - 1),
  };
}
