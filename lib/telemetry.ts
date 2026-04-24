/**
 * Central error + event telemetry surface.
 *
 * Swap-in point for Sentry / Highlight / Datadog -- today it writes to
 * console only, but every caller uses these helpers instead of raw
 * `console.error` so the wiring lives in one file when we sign up.
 *
 * Design choices:
 * - Sync API so callers don't need to await (avoids leaking into fetch
 *   handlers that should return fast).
 * - Context is a simple record so the shape survives whatever transport
 *   we pick later (Sentry extras, Highlight attributes, etc.).
 * - `captureError` accepts `unknown` because that is what `try/catch` blocks
 *   receive in TypeScript strict mode.
 */

export type TelemetryContext = Record<string, string | number | boolean | null | undefined>;

/** Capture a handled error. Never throws, safe in any catch block. */
export function captureError(err: unknown, context: TelemetryContext = {}): void {
  const normalized = err instanceof Error ? err : new Error(String(err));
  const payload = {
    name: normalized.name,
    message: normalized.message,
    stack: normalized.stack,
    ...context,
  };
  // Prefix so log search in Vercel / Sentry can filter all handled errors.
  console.error('[telemetry:error]', JSON.stringify(payload));
}

/** Capture a non-error warning (rate-limit hit, stale config, etc.). */
export function captureWarning(message: string, context: TelemetryContext = {}): void {
  console.warn('[telemetry:warn]', JSON.stringify({ message, ...context }));
}

/** Capture a domain event (campaign created, scan received, etc.). */
export function captureEvent(name: string, context: TelemetryContext = {}): void {
  console.log('[telemetry:event]', JSON.stringify({ name, ...context }));
}
