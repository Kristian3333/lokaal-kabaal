/**
 * Pure aggregation helpers for the conversions dashboard.
 *
 * These take a flat list of verification rows as returned by
 * /api/conversies and bucket them into time buckets (day or month) and
 * per-PC4 groups for charting. Kept testable by being pure.
 */

export interface VerificationPoint {
  verzondenOp: string;            // ISO date
  interesseOp: string | null;     // ISO date or null
  conversieOp: string | null;     // ISO date or null
  postcode: string;
}

export interface TimeBucket {
  /** YYYY-MM-DD for day buckets, YYYY-MM for month buckets. */
  key: string;
  verzonden: number;
  interesse: number;
  conversies: number;
}

export type Granularity = 'day' | 'month';

function bucketKey(isoDate: string, granularity: Granularity): string {
  // isoDate is always YYYY-MM-DD... so substring works without Date parsing
  return granularity === 'day' ? isoDate.slice(0, 10) : isoDate.slice(0, 7);
}

/**
 * Bucket verification events into chronologically-sorted time buckets.
 *
 * Each event contributes to at most three buckets: verzondenOp always,
 * interesseOp when present, conversieOp when present. A scan two months
 * after send shows up in a different bucket than the send itself.
 */
export function bucketByTime(
  points: VerificationPoint[],
  granularity: Granularity = 'month',
): TimeBucket[] {
  const buckets = new Map<string, TimeBucket>();
  const ensure = (key: string): TimeBucket => {
    let b = buckets.get(key);
    if (!b) {
      b = { key, verzonden: 0, interesse: 0, conversies: 0 };
      buckets.set(key, b);
    }
    return b;
  };
  for (const p of points) {
    ensure(bucketKey(p.verzondenOp, granularity)).verzonden += 1;
    if (p.interesseOp) ensure(bucketKey(p.interesseOp, granularity)).interesse += 1;
    if (p.conversieOp) ensure(bucketKey(p.conversieOp, granularity)).conversies += 1;
  }
  return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
}

export interface PostcodeBreakdown {
  pc4: string;
  verzonden: number;
  interesse: number;
  conversies: number;
  scanRate: number;        // 0..1
  conversieRate: number;   // 0..1 (conversies / verzonden)
}

/**
 * Break conversion metrics down per PC4 postcode so retailers see which
 * neighbourhoods convert. Sorts descending by conversieRate with a stable
 * tiebreak on volume (verzonden) so high-volume areas beat tiny samples.
 */
export function breakdownByPostcode(points: VerificationPoint[]): PostcodeBreakdown[] {
  const map = new Map<string, PostcodeBreakdown>();
  for (const p of points) {
    const pc4 = (p.postcode || '').trim().slice(0, 4);
    if (!pc4) continue;
    let entry = map.get(pc4);
    if (!entry) {
      entry = { pc4, verzonden: 0, interesse: 0, conversies: 0, scanRate: 0, conversieRate: 0 };
      map.set(pc4, entry);
    }
    entry.verzonden += 1;
    if (p.interesseOp) entry.interesse += 1;
    if (p.conversieOp) entry.conversies += 1;
  }
  Array.from(map.values()).forEach((entry) => {
    entry.scanRate = entry.verzonden > 0 ? entry.interesse / entry.verzonden : 0;
    entry.conversieRate = entry.verzonden > 0 ? entry.conversies / entry.verzonden : 0;
  });
  return Array.from(map.values()).sort((a, b) => {
    if (b.conversieRate !== a.conversieRate) return b.conversieRate - a.conversieRate;
    return b.verzonden - a.verzonden;
  });
}

/**
 * Build SVG polyline points for a sparkline given a numeric series.
 * Returns a string usable as `<polyline points={...} />`.
 *
 * The caller owns width/height; this helper only maps [min, max] to
 * [height, 0] so the highest value sits at the top.
 */
export function sparklinePoints(values: number[], width: number, height: number): string {
  if (values.length === 0) return '';
  if (values.length === 1) return `0,${height / 2} ${width},${height / 2}`;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}
