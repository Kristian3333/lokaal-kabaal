import { describe, it, expect } from 'vitest';
import {
  bucketPc4Counts,
  buildHeatmapLegend,
  quartileBreakpoints,
} from '@/lib/pc4-heatmap';

describe('quartileBreakpoints', () => {
  it('test_quartileBreakpoints_emptyArray_returnsZeros', () => {
    expect(quartileBreakpoints([])).toEqual({ q1: 0, q2: 0, q3: 0 });
  });

  it('test_quartileBreakpoints_singleValue_returnsThatValue', () => {
    expect(quartileBreakpoints([7])).toEqual({ q1: 7, q2: 7, q3: 7 });
  });

  it('test_quartileBreakpoints_ascendingEight_splitsByQuartile', () => {
    // sorted [1,2,3,4,5,6,7,8]; floor(0.25*8)=2 -> value 3,
    // floor(0.5*8)=4 -> 5, floor(0.75*8)=6 -> 7.
    expect(quartileBreakpoints([1, 2, 3, 4, 5, 6, 7, 8])).toEqual({
      q1: 3,
      q2: 5,
      q3: 7,
    });
  });
});

describe('bucketPc4Counts', () => {
  it('test_bucket_emptyInput_returnsEmpty', () => {
    expect(bucketPc4Counts([])).toEqual([]);
  });

  it('test_bucket_allZeroCounts_allBucketNoneZeroIntensity', () => {
    const res = bucketPc4Counts([
      { pc4: '3511', moverCount: 0 },
      { pc4: '3512', moverCount: 0 },
    ]);
    expect(res.every(r => r.bucket === 'none')).toBe(true);
    expect(res.every(r => r.intensity === 0)).toBe(true);
    expect(res.every(r => r.color === '#E5E5E5')).toBe(true);
  });

  it('test_bucket_singlePositivePoint_isPeak', () => {
    const res = bucketPc4Counts([{ pc4: '3511', moverCount: 5 }]);
    expect(res[0].bucket).toBe('peak');
    expect(res[0].intensity).toBe(1);
  });

  it('test_bucket_ascendingEight_distributesAcrossBuckets', () => {
    const points = [1, 2, 3, 4, 5, 6, 7, 8].map((c, i) => ({
      pc4: String(3500 + i),
      moverCount: c,
    }));
    const res = bucketPc4Counts(points);
    const byCount = new Map(res.map(r => [r.moverCount, r.bucket]));
    // q1=3, q2=5, q3=7: counts <=3 -> low, <=5 -> mid, <=7 -> high, >7 -> peak.
    expect(byCount.get(1)).toBe('low');
    expect(byCount.get(3)).toBe('low');
    expect(byCount.get(4)).toBe('mid');
    expect(byCount.get(5)).toBe('mid');
    expect(byCount.get(6)).toBe('high');
    expect(byCount.get(7)).toBe('high');
    expect(byCount.get(8)).toBe('peak');
  });

  it('test_bucket_minMoverCountThreshold_marksAtOrBelowAsNone', () => {
    const res = bucketPc4Counts(
      [
        { pc4: '3511', moverCount: 2 },
        { pc4: '3512', moverCount: 4 },
        { pc4: '3513', moverCount: 10 },
      ],
      { minMoverCount: 2 },
    );
    const byPc4 = new Map(res.map(r => [r.pc4, r.bucket]));
    expect(byPc4.get('3511')).toBe('none');
    expect(byPc4.get('3512')).not.toBe('none');
    expect(byPc4.get('3513')).not.toBe('none');
  });

  it('test_bucket_intensityIsCountOverMax_clampedToOne', () => {
    const res = bucketPc4Counts([
      { pc4: 'a', moverCount: 4 },
      { pc4: 'b', moverCount: 10 },
    ]);
    const byPc4 = new Map(res.map(r => [r.pc4, r.intensity]));
    expect(byPc4.get('a')).toBeCloseTo(0.4);
    expect(byPc4.get('b')).toBe(1);
  });

  it('test_bucket_colorMatchesBucket_forPeak', () => {
    const res = bucketPc4Counts([{ pc4: 'x', moverCount: 100 }]);
    expect(res[0].bucket).toBe('peak');
    expect(res[0].color).toBe('#0A6A3B');
  });
});

describe('buildHeatmapLegend', () => {
  it('test_legend_emptyInput_returnsFiveBucketsAllZeroRanges', () => {
    const legend = buildHeatmapLegend([]);
    expect(legend).toHaveLength(5);
    expect(legend.map(l => l.bucket)).toEqual(['none', 'low', 'mid', 'high', 'peak']);
  });

  it('test_legend_ascendingEight_labelsMatchQuartileRanges', () => {
    const legend = buildHeatmapLegend(
      [1, 2, 3, 4, 5, 6, 7, 8].map((c, i) => ({
        pc4: String(i),
        moverCount: c,
      })),
    );
    const byBucket = new Map(legend.map(l => [l.bucket, l.label]));
    expect(byBucket.get('none')).toBe('0');
    expect(byBucket.get('low')).toBe('1 – 3');
    expect(byBucket.get('mid')).toBe('4 – 5');
    expect(byBucket.get('high')).toBe('6 – 7');
    expect(byBucket.get('peak')).toBe('8 – 8');
  });
});
