import { describe, it, expect } from 'vitest';
import { GEMEENTEN, findGemeenteBySlug, estimateNewMoversPerMonth } from '@/lib/gemeenten';

describe('GEMEENTEN list', () => {
  it('test_gemeenten_hasAtLeast40Entries_forProgrammaticSeo', () => {
    expect(GEMEENTEN.length).toBeGreaterThanOrEqual(40);
  });

  it('test_gemeenten_slugsAreUnique_noCollisions', () => {
    const slugs = GEMEENTEN.map(g => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('test_gemeenten_slugsAreUrlSafe_lowercaseHyphenated', () => {
    for (const g of GEMEENTEN) {
      expect(g.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('test_gemeenten_coversBigFour_amsterdamRotterdamDenHaagUtrecht', () => {
    const slugs = GEMEENTEN.map(g => g.slug);
    expect(slugs).toContain('amsterdam');
    expect(slugs).toContain('rotterdam');
    expect(slugs).toContain('den-haag');
    expect(slugs).toContain('utrecht');
  });

  it('test_gemeenten_allHavePositiveInwonersAndValidPc4', () => {
    for (const g of GEMEENTEN) {
      expect(g.inwoners).toBeGreaterThan(0);
      expect(g.pc4).toMatch(/^\d{4}$/);
    }
  });
});

describe('findGemeenteBySlug', () => {
  it('test_findGemeenteBySlug_knownSlug_returnsGemeente', () => {
    const g = findGemeenteBySlug('utrecht');
    expect(g?.naam).toBe('Utrecht');
    expect(g?.provincie).toBe('Utrecht');
  });

  it('test_findGemeenteBySlug_hyphenatedSlug_returnsGemeente', () => {
    const g = findGemeenteBySlug('den-haag');
    expect(g?.naam).toBe('Den Haag');
  });

  it('test_findGemeenteBySlug_unknownSlug_returnsNull', () => {
    expect(findGemeenteBySlug('narnia')).toBeNull();
  });

  it('test_findGemeenteBySlug_emptyString_returnsNull', () => {
    expect(findGemeenteBySlug('')).toBeNull();
  });
});

describe('estimateNewMoversPerMonth', () => {
  it('test_estimate_bigCity_returnsReasonableOrderOfMagnitude', () => {
    // Amsterdam ~921_000 inwoners -> ~2000 new movers/month order of magnitude
    const est = estimateNewMoversPerMonth(921_000);
    expect(est).toBeGreaterThan(1000);
    expect(est).toBeLessThan(5000);
  });

  it('test_estimate_smallMunicipality_returnsSmallNumber', () => {
    const est = estimateNewMoversPerMonth(30_000);
    expect(est).toBeGreaterThan(20);
    expect(est).toBeLessThan(200);
  });

  it('test_estimate_zeroInwoners_returnsZero', () => {
    expect(estimateNewMoversPerMonth(0)).toBe(0);
  });

  it('test_estimate_roundsToNiceNumbers_forDisplayCopy', () => {
    // Small and mid-size cities should round to 2 significant digits
    const est = estimateNewMoversPerMonth(100_000);
    // String form should not be like 218.73 -- rounded
    expect(est % 10).toBe(0);
  });
});
