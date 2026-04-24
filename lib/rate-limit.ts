import { NextRequest } from 'next/server';

/**
 * Configuration for a rate limiter instance.
 */
export interface RateLimitConfig {
  /** Sliding window duration in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
}

/**
 * Result returned by a rate limit check.
 */
export interface RateLimitResult {
  /** Whether the request is allowed to proceed. */
  success: boolean;
  /** Number of requests remaining in the current window. */
  remaining: number;
}

/** Internal record tracking request timestamps per key. */
interface WindowRecord {
  timestamps: number[];
}

/** In-memory store: maps a key (IP) to its sliding window record. */
const store = new Map<string, WindowRecord>();

/** Interval handle for periodic cleanup of expired entries. */
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Start the background cleanup task that removes entries with no recent
 * timestamps. Called automatically on first use.
 *
 * @param windowMs - The maximum window age; entries older than this are pruned.
 */
function ensureCleanupRunning(windowMs: number): void {
  if (cleanupTimer !== null) return;
  // Run cleanup at most once per window period
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    Array.from(store.entries()).forEach(([key, record]) => {
      const active = record.timestamps.filter((ts: number) => now - ts < windowMs);
      if (active.length === 0) {
        store.delete(key);
      } else {
        record.timestamps = active;
      }
    });
  }, windowMs);

  // Allow Node.js to exit even if this timer is still registered
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    (cleanupTimer as { unref: () => void }).unref();
  }
}

/**
 * Extract the client IP address from a Next.js request.
 * Reads x-forwarded-for first (Vercel/proxy), then x-real-ip, then falls back
 * to the literal string "unknown".
 *
 * @param req - The incoming Next.js request.
 * @returns The best-effort IP string for rate limit keying.
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for may contain a comma-separated list; the first is the client
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

/**
 * Check whether a request is within the allowed rate limit using a sliding
 * window algorithm.
 *
 * This implementation is in-memory and therefore scoped to a single serverless
 * instance. It is appropriate for light abuse prevention on auth endpoints
 * where cross-instance coordination is not required. For stricter enforcement,
 * replace the store with a shared Redis/Upstash backend.
 *
 * @param req - The incoming Next.js request.
 * @param config - Window duration and maximum request count.
 * @returns An object with `success` (whether the request is allowed) and
 *   `remaining` (how many requests are left in the current window).
 */
export function rateLimit(req: NextRequest, config: RateLimitConfig): RateLimitResult {
  const { windowMs, maxRequests } = config;

  ensureCleanupRunning(windowMs);

  const ip = getClientIp(req);
  const now = Date.now();
  const cutoff = now - windowMs;

  const record = store.get(ip) ?? { timestamps: [] };

  // Prune timestamps outside the current window
  record.timestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (record.timestamps.length >= maxRequests) {
    store.set(ip, record);
    return { success: false, remaining: 0 };
  }

  record.timestamps.push(now);
  store.set(ip, record);

  return {
    success: true,
    remaining: maxRequests - record.timestamps.length,
  };
}

/**
 * Pre-configured rate limiter for authentication endpoints.
 * Allows 5 requests per minute per IP address.
 *
 * @param req - The incoming Next.js request.
 * @returns Rate limit result.
 */
export function authLimiter(req: NextRequest): RateLimitResult {
  return rateLimit(req, { windowMs: 60_000, maxRequests: 5 });
}

/**
 * Pre-configured rate limiter for general API endpoints.
 * Allows 30 requests per minute per IP address.
 *
 * @param req - The incoming Next.js request.
 * @returns Rate limit result.
 */
export function apiLimiter(req: NextRequest): RateLimitResult {
  return rateLimit(req, { windowMs: 60_000, maxRequests: 30 });
}

/**
 * Pre-configured rate limiter for code/pincode redemption endpoints.
 * Stricter than auth: 10 attempts per 10 minutes per IP, sized to make
 * 4-6 digit pincode brute-force impractical while still allowing retailer staff
 * to register multiple legitimate conversions.
 *
 * @param req - The incoming Next.js request.
 * @returns Rate limit result.
 */
export function redeemLimiter(req: NextRequest): RateLimitResult {
  return rateLimit(req, { windowMs: 10 * 60_000, maxRequests: 10 });
}
