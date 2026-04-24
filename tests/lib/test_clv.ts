import { describe, it, expect } from 'vitest';
import { BRANCHE_CLV, calculateRoi } from '@/lib/clv';

describe('BRANCHE_CLV', () => {
  it('test_brancheClv_hasCoreBranches', () => {
    expect(BRANCHE_CLV.kapper).toBeDefined();
    expect(BRANCHE_CLV.bakker).toBeDefined();
    expect(BRANCHE_CLV.restaurant).toBeDefined();
    expect(BRANCHE_CLV.installateur).toBeDefined();
    expect(BRANCHE_CLV.makelaar).toBeDefined();
    expect(BRANCHE_CLV.fysio).toBeDefined();
    expect(BRANCHE_CLV.overig).toBeDefined();
  });

  it('test_brancheClv_defaultsWithinMinMax', () => {
    Object.values(BRANCHE_CLV).forEach(cfg => {
      expect(cfg.defaultClv).toBeGreaterThanOrEqual(cfg.minClv);
      expect(cfg.defaultClv).toBeLessThanOrEqual(cfg.maxClv);
      expect(cfg.minClv).toBeLessThan(cfg.maxClv);
    });
  });
});

describe('calculateRoi', () => {
  it('test_roi_typicalProScenario_positive', () => {
    // Pro: 400 flyers/mnd, 6% conversion, kapper CLV €360, €499 subscription
    const r = calculateRoi({
      flyersPerMaand: 400,
      conversieRatio: 0.06,
      clvPerJaar: 360,
      maandkostenTotaal: 499,
    });
    // 400 * 0.06 = 24 klanten
    expect(r.nieuweKlantenPerMaand).toBe(24);
    // 24 * (360/12) = €720 per maand
    expect(r.omzetPerMaand).toBeCloseTo(720, 0);
    // Payback = 499/720 ≈ 0.69 mnd
    expect(r.terugverdientijdMaanden).toBeCloseTo(499 / 720, 1);
    // Annual ROI = (720*12 - 499*12)/(499*12)*100 ≈ 44%
    expect(r.roiJaarPct).toBeGreaterThan(30);
    expect(r.roiJaarPct).toBeLessThan(80);
  });

  it('test_roi_installateurHighClv_strongRoi', () => {
    const r = calculateRoi({
      flyersPerMaand: 400,
      conversieRatio: 0.02,
      clvPerJaar: 8000,
      maandkostenTotaal: 499,
    });
    // 8 klanten * €667/mnd = €5333/mnd omzet
    expect(r.roiJaarPct).toBeGreaterThan(500);
  });

  it('test_roi_lowConversion_negative', () => {
    const r = calculateRoi({
      flyersPerMaand: 100,
      conversieRatio: 0.01,
      clvPerJaar: 200,
      maandkostenTotaal: 649,
    });
    expect(r.roiJaarPct).toBeLessThan(0);
  });

  it('test_roi_zeroClv_infiniteTerugverdien', () => {
    const r = calculateRoi({
      flyersPerMaand: 400,
      conversieRatio: 0.06,
      clvPerJaar: 0,
      maandkostenTotaal: 499,
    });
    expect(r.terugverdientijdMaanden).toBe(Number.POSITIVE_INFINITY);
    expect(r.roiJaarPct).toBe(-100);
  });

  it('test_roi_zeroCost_roiIsZero', () => {
    const r = calculateRoi({
      flyersPerMaand: 400,
      conversieRatio: 0.06,
      clvPerJaar: 360,
      maandkostenTotaal: 0,
    });
    // Avoid divide-by-zero: roiJaarPct is clamped to 0 when cost=0
    expect(r.roiJaarPct).toBe(0);
  });

  it('test_roi_clientsCountIsFloored', () => {
    // 400 * 0.065 = 26 exact, no rounding drift
    const r = calculateRoi({
      flyersPerMaand: 400,
      conversieRatio: 0.065,
      clvPerJaar: 360,
      maandkostenTotaal: 499,
    });
    expect(r.nieuweKlantenPerMaand).toBe(26);
  });
});
