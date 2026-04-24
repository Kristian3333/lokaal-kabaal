import { describe, it, expect } from 'vitest';
import { compareAb } from '@/lib/ab-stats';

describe('compareAb', () => {
  it('test_compareAb_smallSamples_returnsNotEnoughData', () => {
    const r = compareAb({ aantal: 10, successen: 1 }, { aantal: 12, successen: 2 });
    expect(r.genoegData).toBe(false);
    expect(r.significant).toBe(false);
  });

  it('test_compareAb_equalRates_returnsNotSignificant', () => {
    const r = compareAb({ aantal: 500, successen: 50 }, { aantal: 500, successen: 50 });
    expect(r.rateA).toBe(0.1);
    expect(r.rateB).toBe(0.1);
    expect(r.absoluutVerschil).toBe(0);
    expect(r.pValue).toBeGreaterThan(0.5);
    expect(r.significant).toBe(false);
  });

  it('test_compareAb_bigLift_bigSamples_returnsSignificant', () => {
    // A: 5%, B: 10% over 1000 flyers each -- strong signal
    const r = compareAb({ aantal: 1000, successen: 50 }, { aantal: 1000, successen: 100 });
    expect(r.rateA).toBeCloseTo(0.05, 3);
    expect(r.rateB).toBeCloseTo(0.10, 3);
    expect(r.absoluutVerschil).toBeCloseTo(0.05, 3);
    expect(r.significant).toBe(true);
    expect(r.pValue).toBeLessThan(0.01);
  });

  it('test_compareAb_negativeLift_stillSignificant', () => {
    // B is worse than A -- significance should still detect it (two-tailed)
    const r = compareAb({ aantal: 1000, successen: 100 }, { aantal: 1000, successen: 50 });
    expect(r.absoluutVerschil).toBeLessThan(0);
    expect(r.significant).toBe(true);
  });

  it('test_compareAb_relativeLift_computedAgainstA', () => {
    const r = compareAb({ aantal: 500, successen: 25 }, { aantal: 500, successen: 50 });
    // A: 5%, B: 10% -> relative +100%
    expect(r.relatiefVerschil).toBeCloseTo(1.0, 2);
  });

  it('test_compareAb_zeroInA_relativeLiftIsInfinite', () => {
    const r = compareAb({ aantal: 200, successen: 0 }, { aantal: 200, successen: 10 });
    expect(r.relatiefVerschil).toBe(Number.POSITIVE_INFINITY);
  });

  it('test_compareAb_zeroSampleInB_returnsNotEnoughData', () => {
    const r = compareAb({ aantal: 500, successen: 50 }, { aantal: 0, successen: 0 });
    expect(r.genoegData).toBe(false);
    expect(r.significant).toBe(false);
  });

  it('test_compareAb_borderlinePValue_notCalledSignificant', () => {
    // Craft a case near p=0.1 -- should be "not significant"
    const r = compareAb({ aantal: 500, successen: 50 }, { aantal: 500, successen: 60 });
    expect(r.pValue).toBeGreaterThan(0.05);
    expect(r.significant).toBe(false);
  });
});
