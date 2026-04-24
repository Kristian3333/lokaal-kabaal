import { describe, it, expect } from 'vitest';
import { assessChurn } from '@/lib/churn-signal';

describe('assessChurn', () => {
  it('test_assessChurn_lessThanThreeMonths_returnsHealthyWithMsg', () => {
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 5 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 4 },
    ]);
    expect(r.severity).toBe('healthy');
    expect(r.reden).toContain('Niet genoeg historische');
  });

  it('test_assessChurn_stableScanRate_returnsHealthy', () => {
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 5 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 5 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 5 },
      { maand: '2026-04', flyersVerzonden: 100, scans: 5 },
    ]);
    expect(r.severity).toBe('healthy');
    expect(r.latestScanRate).toBeCloseTo(0.05, 3);
    expect(r.baselineScanRate).toBeCloseTo(0.05, 3);
  });

  it('test_assessChurn_mild15PctDrop_returnsWatch', () => {
    // Baseline 10%, latest 8.5% (-15%)
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-04', flyersVerzonden: 100, scans: 8 },
    ]);
    expect(r.severity).toBe('watch');
  });

  it('test_assessChurn_35PctDrop_returnsRisk', () => {
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-04', flyersVerzonden: 100, scans: 6 },
    ]);
    expect(r.severity).toBe('risk');
  });

  it('test_assessChurn_60PctDrop_returnsCritical', () => {
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-04', flyersVerzonden: 100, scans: 3 },
    ]);
    expect(r.severity).toBe('critical');
  });

  it('test_assessChurn_zeroBaseline_returnsHealthy', () => {
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 0 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 0 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 0 },
      { maand: '2026-04', flyersVerzonden: 100, scans: 2 },
    ]);
    // Latest is better than baseline -> treat as healthy baseline
    expect(r.severity).toBe('healthy');
  });

  it('test_assessChurn_outOfOrderInput_sortsBeforeAssessing', () => {
    const out = assessChurn([
      { maand: '2026-04', flyersVerzonden: 100, scans: 8 },
      { maand: '2026-01', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-02', flyersVerzonden: 100, scans: 10 },
    ]);
    expect(out.latestScanRate).toBeCloseTo(0.08, 3);
    expect(out.severity).toBe('watch');
  });

  it('test_assessChurn_skipsMonthsWithZeroVolume', () => {
    // Months with 0 flyers should not pollute baseline
    const r = assessChurn([
      { maand: '2026-01', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-02', flyersVerzonden: 0,   scans: 0 },
      { maand: '2026-03', flyersVerzonden: 100, scans: 10 },
      { maand: '2026-04', flyersVerzonden: 100, scans: 10 },
    ]);
    expect(r.severity).toBe('healthy');
  });
});
