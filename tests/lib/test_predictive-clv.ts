import { describe, it, expect } from 'vitest';
import { predictClv } from '@/lib/predictive-clv';
import { BRANCHE_CLV } from '@/lib/clv';

describe('predictClv', () => {
  it('test_predictClv_noSignals_usesBrancheDefault', () => {
    const r = predictClv({ brancheKey: 'kapper' });
    expect(r.clvMid).toBe(BRANCHE_CLV.kapper.defaultClv);
    expect(r.clvLow).toBe(Math.round(r.clvMid * 0.7));
    expect(r.clvHigh).toBe(Math.round(r.clvMid * 1.3));
    expect(r.toegepasteSignalen).toEqual([]);
  });

  it('test_predictClv_highWozDiscretionaryBranche_bumpsMid', () => {
    const baseline = predictClv({ brancheKey: 'restaurant' });
    const high = predictClv({ brancheKey: 'restaurant', wozAverage: 800_000 });
    expect(high.clvMid).toBeGreaterThan(baseline.clvMid);
    expect(high.toegepasteSignalen.some(s => s.includes('WOZ'))).toBe(true);
  });

  it('test_predictClv_highWozBakker_noEffect', () => {
    // Bakker is in the "not elastic to WOZ" list
    const baseline = predictClv({ brancheKey: 'bakker' });
    const high = predictClv({ brancheKey: 'bakker', wozAverage: 800_000 });
    expect(high.clvMid).toBe(baseline.clvMid);
  });

  it('test_predictClv_highOwnerShare_bumpsAllBranches', () => {
    const baseline = predictClv({ brancheKey: 'kapper' });
    const high = predictClv({ brancheKey: 'kapper', eigenwoningratio: 0.85 });
    expect(high.clvMid).toBeGreaterThan(baseline.clvMid);
    expect(high.toegepasteSignalen.some(s => s.includes('woningeigenaar'))).toBe(true);
  });

  it('test_predictClv_newBuildInstallateur_bigBump', () => {
    const baseline = predictClv({ brancheKey: 'installateur' });
    const newBuild = predictClv({ brancheKey: 'installateur', bouwjaarMediaan: 2015 });
    expect(newBuild.clvMid).toBeGreaterThan(baseline.clvMid);
  });

  it('test_predictClv_oldStockInstallateur_alsoBump', () => {
    const baseline = predictClv({ brancheKey: 'installateur' });
    const old = predictClv({ brancheKey: 'installateur', bouwjaarMediaan: 1920 });
    expect(old.clvMid).toBeGreaterThan(baseline.clvMid);
  });

  it('test_predictClv_multipleSignals_stack', () => {
    const r = predictClv({
      brancheKey: 'installateur',
      wozAverage: 700_000,
      eigenwoningratio: 0.85,
      bouwjaarMediaan: 2012,
    });
    const baseline = BRANCHE_CLV.installateur.defaultClv;
    // Expect at least ~1.3x boost (cumulative)
    expect(r.clvMid).toBeGreaterThan(baseline * 1.2);
    expect(r.toegepasteSignalen.length).toBeGreaterThanOrEqual(2);
  });

  it('test_predictClv_wozCapsAt35Pct_noRunawayEstimates', () => {
    const r = predictClv({ brancheKey: 'restaurant', wozAverage: 10_000_000 });
    const baseline = predictClv({ brancheKey: 'restaurant' });
    // Cap is +35%, so the 1e7 WOZ shouldn't push us above 1.36x baseline
    expect(r.clvMid).toBeLessThanOrEqual(Math.round(baseline.clvMid * 1.36));
  });

  it('test_predictClv_unknownBrancheKey_returnsZeros', () => {
    // Bad key on purpose -- cast to bypass compile-time check
    const r = predictClv({ brancheKey: 'narnia' as keyof typeof BRANCHE_CLV });
    expect(r.clvMid).toBe(0);
  });
});
