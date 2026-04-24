/**
 * Pure helpers for building a PC4 new-mover density heatmap.
 *
 * The map component receives a list of PC4 codes with a mover-count for the
 * current window and needs to colour each polygon. We bucket counts into
 * quartiles so the colour scale adapts to whatever distribution we receive,
 * rather than hard-coding breakpoints that would go stale.
 */

export type Pc4Count = {
  pc4: string;
  moverCount: number;
};

export type Pc4Bucket = 'none' | 'low' | 'mid' | 'high' | 'peak';

export type Pc4HeatmapPoint = {
  pc4: string;
  moverCount: number;
  bucket: Pc4Bucket;
  /** 0-1 normalised value, stable relative to the input distribution. */
  intensity: number;
  /** Hex colour hook for the map layer. */
  color: string;
};

export type HeatmapOptions = {
  /**
   * Values at or below this threshold are always bucketed as 'none', even if
   * they happen to fall in a non-zero quartile for a very sparse dataset.
   */
  minMoverCount?: number;
};

const COLORS: Record<Pc4Bucket, string> = {
  none: '#E5E5E5',
  low: '#CFEBDA',
  mid: '#7FD3A4',
  high: '#2FB06F',
  peak: '#0A6A3B',
};

/**
 * Compute the quartile breakpoints for a sorted set of positive mover counts.
 * Returns an object with q1/q2/q3 values; handy for unit-testing boundary
 * logic without going through bucketPc4Counts.
 */
export function quartileBreakpoints(sortedPositives: readonly number[]): {
  q1: number;
  q2: number;
  q3: number;
} {
  const n = sortedPositives.length;
  if (n === 0) return { q1: 0, q2: 0, q3: 0 };
  const pick = (p: number): number => {
    const idx = Math.min(n - 1, Math.max(0, Math.floor(p * n)));
    return sortedPositives[idx] ?? 0;
  };
  return { q1: pick(0.25), q2: pick(0.5), q3: pick(0.75) };
}

/**
 * Bucket an array of (pc4, moverCount) points into density bands with a
 * colour and 0-1 intensity. Bucket boundaries are derived from the positive-
 * count distribution so the result is robust to sparse months and spikes.
 */
export function bucketPc4Counts(
  points: readonly Pc4Count[],
  opts: HeatmapOptions = {},
): Pc4HeatmapPoint[] {
  const minMover = Math.max(0, opts.minMoverCount ?? 0);
  const positives = points
    .map(p => p.moverCount)
    .filter(c => c > minMover)
    .sort((a, b) => a - b);
  const { q1, q2, q3 } = quartileBreakpoints(positives);
  const max = positives[positives.length - 1] ?? 0;

  return points.map(p => {
    const count = p.moverCount;
    let bucket: Pc4Bucket;
    if (count <= minMover) bucket = 'none';
    else if (count === max && max > 0) bucket = 'peak';
    else if (count <= q1) bucket = 'low';
    else if (count <= q2) bucket = 'mid';
    else if (count <= q3) bucket = 'high';
    else bucket = 'peak';

    const intensity = max > 0 ? Math.min(1, count / max) : 0;
    return {
      pc4: p.pc4,
      moverCount: count,
      bucket,
      intensity,
      color: COLORS[bucket],
    };
  });
}

/**
 * Build a small legend payload that a map side-panel can render. Returns the
 * five buckets with their colour and a human-readable range label derived
 * from the same breakpoints used for bucketPc4Counts.
 */
export function buildHeatmapLegend(
  points: readonly Pc4Count[],
  opts: HeatmapOptions = {},
): Array<{ bucket: Pc4Bucket; color: string; label: string }> {
  const minMover = Math.max(0, opts.minMoverCount ?? 0);
  const positives = points
    .map(p => p.moverCount)
    .filter(c => c > minMover)
    .sort((a, b) => a - b);
  const { q1, q2, q3 } = quartileBreakpoints(positives);
  const max = positives[positives.length - 1] ?? 0;

  return [
    { bucket: 'none', color: COLORS.none, label: minMover > 0 ? `≤ ${minMover}` : '0' },
    { bucket: 'low', color: COLORS.low, label: `${minMover + 1} – ${q1}` },
    { bucket: 'mid', color: COLORS.mid, label: `${q1 + 1} – ${q2}` },
    { bucket: 'high', color: COLORS.high, label: `${q2 + 1} – ${q3}` },
    { bucket: 'peak', color: COLORS.peak, label: `${q3 + 1} – ${max}` },
  ];
}
