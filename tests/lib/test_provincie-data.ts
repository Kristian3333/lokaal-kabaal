import { describe, it, expect } from 'vitest';
import { buildProvincieStats } from '@/lib/provincie-data';

describe('buildProvincieStats', () => {
  it('test_buildProvincieStats_returnsNonEmptyList', () => {
    const provs = buildProvincieStats();
    expect(provs.length).toBeGreaterThan(0);
  });

  it('test_buildProvincieStats_sortedByNewMoversDesc', () => {
    const provs = buildProvincieStats();
    for (let i = 1; i < provs.length; i++) {
      expect(provs[i - 1].geschatteNieuweBewonersPerMaand)
        .toBeGreaterThanOrEqual(provs[i].geschatteNieuweBewonersPerMaand);
    }
  });

  it('test_buildProvincieStats_allHavePositiveInwoners', () => {
    for (const p of buildProvincieStats()) {
      expect(p.totaleInwoners).toBeGreaterThan(0);
      expect(p.aantalGemeenten).toBeGreaterThan(0);
    }
  });

  it('test_buildProvincieStats_topGemeenten_hasAtMostThree', () => {
    for (const p of buildProvincieStats()) {
      expect(p.topGemeenten.length).toBeLessThanOrEqual(3);
    }
  });

  it('test_buildProvincieStats_topGemeentenSortedByInwoners', () => {
    for (const p of buildProvincieStats()) {
      for (let i = 1; i < p.topGemeenten.length; i++) {
        expect(p.topGemeenten[i - 1].inwoners)
          .toBeGreaterThanOrEqual(p.topGemeenten[i].inwoners);
      }
    }
  });
});
