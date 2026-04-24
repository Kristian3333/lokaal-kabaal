import { describe, it, expect } from 'vitest';
import {
  bucketByTime,
  breakdownByPostcode,
  sparklinePoints,
  type VerificationPoint,
} from '@/lib/conversie-stats';

const SAMPLE: VerificationPoint[] = [
  { verzondenOp: '2026-03-28T08:00:00.000Z', interesseOp: '2026-03-30T12:00:00.000Z', conversieOp: null,                        postcode: '3512' },
  { verzondenOp: '2026-03-28T08:00:00.000Z', interesseOp: '2026-04-02T09:30:00.000Z', conversieOp: '2026-04-05T14:00:00.000Z',  postcode: '3512' },
  { verzondenOp: '2026-04-28T08:00:00.000Z', interesseOp: null,                        conversieOp: null,                        postcode: '3513' },
  { verzondenOp: '2026-04-28T08:00:00.000Z', interesseOp: '2026-04-29T10:00:00.000Z', conversieOp: '2026-04-30T11:00:00.000Z',  postcode: '3513' },
];

describe('bucketByTime (month granularity)', () => {
  it('test_bucketByTime_month_groupsEventsCorrectly', () => {
    const buckets = bucketByTime(SAMPLE, 'month');
    expect(buckets).toHaveLength(2);
    expect(buckets[0].key).toBe('2026-03');
    expect(buckets[0].verzonden).toBe(2);
    expect(buckets[0].interesse).toBe(1);   // one scanned in March
    expect(buckets[0].conversies).toBe(0);
    expect(buckets[1].key).toBe('2026-04');
    expect(buckets[1].verzonden).toBe(2);
    expect(buckets[1].interesse).toBe(2);
    expect(buckets[1].conversies).toBe(2);
  });

  it('test_bucketByTime_emptyInput_returnsEmpty', () => {
    expect(bucketByTime([], 'month')).toEqual([]);
  });

  it('test_bucketByTime_day_separatesEventsPerDay', () => {
    const buckets = bucketByTime(SAMPLE, 'day');
    const keys = buckets.map(b => b.key);
    expect(keys).toContain('2026-03-28');
    expect(keys).toContain('2026-04-05');
    // sorted chronologically
    expect(keys).toEqual([...keys].sort());
  });
});

describe('breakdownByPostcode', () => {
  it('test_breakdownByPostcode_sortsByConversieRateDesc', () => {
    const out = breakdownByPostcode(SAMPLE);
    expect(out).toHaveLength(2);
    const by = Object.fromEntries(out.map(r => [r.pc4, r]));
    // 3512: 2 rows, 2 scans, 1 conversion -> scanRate 1.0, conversieRate 0.5
    expect(by['3512'].scanRate).toBeCloseTo(1.0, 5);
    expect(by['3512'].conversieRate).toBeCloseTo(0.5, 5);
    // 3513: 2 rows, 1 scan, 1 conversion -> scanRate 0.5, conversieRate 0.5
    expect(by['3513'].scanRate).toBeCloseTo(0.5, 5);
    expect(by['3513'].conversieRate).toBeCloseTo(0.5, 5);
    // Tie on conversieRate, tiebreak is volume (both 2) -> insertion order wins
    expect(out[0].pc4).toBe('3512');
  });

  it('test_breakdownByPostcode_handlesMissingPostcode_skips', () => {
    const result = breakdownByPostcode([
      { verzondenOp: '2026-03-01T00:00:00.000Z', interesseOp: null, conversieOp: null, postcode: '' },
    ]);
    expect(result).toEqual([]);
  });

  it('test_breakdownByPostcode_truncatesPostcodeTo4Chars', () => {
    const result = breakdownByPostcode([
      { verzondenOp: '2026-03-01T00:00:00.000Z', interesseOp: null, conversieOp: null, postcode: '3512AB' },
    ]);
    expect(result[0].pc4).toBe('3512');
  });

  it('test_breakdownByPostcode_zeroVerzonden_ratesAreZero', () => {
    // Not possible in practice (every row has verzondenOp), but guard divisor
    const result = breakdownByPostcode([]);
    expect(result).toEqual([]);
  });
});

describe('sparklinePoints', () => {
  it('test_sparklinePoints_empty_returnsEmptyString', () => {
    expect(sparklinePoints([], 100, 20)).toBe('');
  });

  it('test_sparklinePoints_single_returnsMidline', () => {
    expect(sparklinePoints([42], 100, 20)).toBe('0,10 100,10');
  });

  it('test_sparklinePoints_monotonicSeries_mapsEndsCorrectly', () => {
    // min=1 at top (height=20), max=4 at bottom-to-top: value 4 -> y=0, value 1 -> y=20
    const pts = sparklinePoints([1, 2, 3, 4], 30, 20);
    const pairs = pts.split(' ').map(p => p.split(',').map(Number));
    expect(pairs[0][0]).toBeCloseTo(0, 1);
    expect(pairs[0][1]).toBeCloseTo(20, 1); // min value -> bottom
    expect(pairs[3][0]).toBeCloseTo(30, 1);
    expect(pairs[3][1]).toBeCloseTo(0, 1);   // max value -> top
  });

  it('test_sparklinePoints_flatSeries_allSameY', () => {
    const pts = sparklinePoints([5, 5, 5], 30, 20);
    const ys = pts.split(' ').map(p => Number(p.split(',')[1]));
    expect(new Set(ys).size).toBe(1);
  });
});
