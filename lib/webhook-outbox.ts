/**
 * Webhook outbox primitives.
 *
 * Retailers register outgoing webhook endpoints (Zapier catch-hooks,
 * Slack incoming-webhooks, self-hosted automation). When a relevant
 * domain event fires -- scan registered, campaign dispatched, monthly
 * report generated -- we POST the event to each subscribed endpoint.
 *
 * This module has the pure pieces (event shape, signature, retry
 * policy) so the actual DB-bound dispatcher can import them. The DB
 * table + cron wiring are the next step.
 */

import crypto from 'crypto';

/** Events we deliver to webhook subscribers. Keep the union tight so
 *  consumers can build typed switch-statements. Extend with care --
 *  existing subscribers' code depends on these names. */
export type WebhookEvent =
  | { type: 'scan.registered';        retailerId: string; campagneId: string; code: string; postcode: string; stad: string; at: string }
  | { type: 'conversion.registered';  retailerId: string; campagneId: string; code: string; postcode: string; stad: string; at: string }
  | { type: 'campaign.dispatched';    retailerId: string; campagneId: string; flyersSent: number; maand: string; at: string }
  | { type: 'monthly_report.ready';   retailerId: string; campagneId: string; maand: string; reportUrl: string; at: string };

/**
 * Produce a stable JSON string for signing. Keys are sorted so
 * signature verification on the receiver side isn't sensitive to
 * field-ordering whims in JSON.stringify.
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return '[' + obj.map(canonicalJson).join(',') + ']';
  const keys = Object.keys(obj as Record<string, unknown>).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson((obj as Record<string, unknown>)[k])).join(',') + '}';
}

/**
 * Build an HMAC-SHA256 signature for a webhook body. Subscribers
 * verify the same way: compute HMAC over the raw body using the
 * secret you shared with them, compare in constant time.
 */
export function signWebhookBody(body: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

/** Retry schedule: exponential backoff, max 5 attempts over ~4 hours. */
export function retryDelaySeconds(attempt: number): number {
  if (attempt <= 0) return 0;
  // Attempts: 1 -> 30s, 2 -> 2min, 3 -> 8min, 4 -> 30min, 5 -> 2h, 6+ -> give up
  const schedule = [30, 120, 480, 1800, 7200];
  return schedule[Math.min(attempt - 1, schedule.length - 1)];
}

/** Receiver-side helper: compare expected vs provided signature in
 *  constant time so attackers can't guess bytes via timing. */
export function verifyWebhookSignature(body: string, provided: string, secret: string): boolean {
  const expected = signWebhookBody(body, secret);
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(provided, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
