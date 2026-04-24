import { describe, it, expect } from 'vitest';
import { buildMonthlyReport } from '@/lib/monthly-report';

function v(postcode: string, interesse: boolean, conversie: boolean) {
  return {
    postcode,
    verzondenOp: new Date('2026-04-28T00:00:00.000Z'),
    interesseOp: interesse ? new Date('2026-04-30T00:00:00.000Z') : null,
    conversieOp: conversie ? new Date('2026-05-02T00:00:00.000Z') : null,
  };
}

describe('buildMonthlyReport', () => {
  it('test_buildMonthlyReport_basicCounts_correct', () => {
    const report = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'Test', tier: 'pro' },
      campagne: { naam: 'Campagne 1' },
      maandLabel: 'april 2026',
      flyersVerzonden: 100,
      verifications: [
        v('3512', true, true),
        v('3512', true, false),
        v('3513', true, false),
        v('3513', false, false),
      ],
    });
    expect(report.title).toContain('Test');
    expect(report.period).toBe('april 2026');
    expect(report.scans).toBe(3);
    expect(report.conversions).toBe(1);
    expect(report.scanRate).toBe(3.0);
    expect(report.conversionRate).toBe(1.0);
  });

  it('test_buildMonthlyReport_zeroFlyers_zeroRates', () => {
    const r = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'Empty', tier: 'starter' },
      campagne: { naam: 'Blank' },
      maandLabel: 'april 2026',
      flyersVerzonden: 0,
      verifications: [],
    });
    expect(r.scanRate).toBe(0);
    expect(r.conversionRate).toBe(0);
    expect(r.topPostcodes).toEqual([]);
  });

  it('test_buildMonthlyReport_topPostcodes_excludesLowVolume', () => {
    // PC4 3512 has 6 rows with 100% scans -> qualifies (>=5 volume)
    // PC4 3513 has 3 rows with 100% scans -> skipped (below threshold)
    const rows = [
      ...Array(6).fill(v('3512', true, false)),
      ...Array(3).fill(v('3513', true, false)),
    ];
    const r = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'Test', tier: 'pro' },
      campagne: { naam: 'C' },
      maandLabel: 'april 2026',
      flyersVerzonden: 9,
      verifications: rows,
    });
    expect(r.topPostcodes).toEqual(['3512']);
  });

  it('test_buildMonthlyReport_topPostcodes_sortedByScanRateDesc', () => {
    const rows = [
      // PC4 3512: 6 sent, 3 scans -> 50%
      ...Array(3).fill(v('3512', true, false)),
      ...Array(3).fill(v('3512', false, false)),
      // PC4 3513: 5 sent, 5 scans -> 100%
      ...Array(5).fill(v('3513', true, false)),
      // PC4 3514: 5 sent, 1 scan -> 20%
      v('3514', true, false),
      ...Array(4).fill(v('3514', false, false)),
    ];
    const r = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'Test', tier: 'pro' },
      campagne: { naam: 'C' },
      maandLabel: 'april 2026',
      flyersVerzonden: 16,
      verifications: rows,
    });
    expect(r.topPostcodes).toEqual(['3513', '3512', '3514']);
  });

  it('test_buildMonthlyReport_overage_detectedForExcessFlyers', () => {
    // Starter bundle = 300; sending 400 -> 100 overage * €0.70 = €70
    const r = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'Overage', tier: 'starter' },
      campagne: { naam: 'C' },
      maandLabel: 'april 2026',
      flyersVerzonden: 400,
      verifications: [],
    });
    expect(r.overageCount).toBe(100);
    expect(r.overageEuros).toBe(70);
  });

  it('test_buildMonthlyReport_withinBundle_noOverage', () => {
    const r = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'OK', tier: 'pro' },
      campagne: { naam: 'C' },
      maandLabel: 'april 2026',
      flyersVerzonden: 400, // exactly at Pro bundle
      verifications: [],
    });
    expect(r.overageCount).toBe(0);
    expect(r.overageEuros).toBe(0);
  });

  it('test_buildMonthlyReport_tierLabel_uppercased', () => {
    const r = buildMonthlyReport({
      retailer: { bedrijfsnaam: 'X', tier: 'agency' },
      campagne: { naam: 'C' },
      maandLabel: 'april 2026',
      flyersVerzonden: 100,
      verifications: [],
    });
    expect(r.tierLabel).toBe('AGENCY');
  });
});
