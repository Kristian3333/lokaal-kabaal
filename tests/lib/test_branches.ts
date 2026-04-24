import { describe, it, expect } from 'vitest';
import { BRANCHE_OPTIES } from '@/lib/branches';

describe('BRANCHE_OPTIES', () => {
  it('test_BRANCHE_OPTIES_nonEmpty_hasManyEntries', () => {
    expect(BRANCHE_OPTIES.length).toBeGreaterThanOrEqual(40);
  });

  it('test_BRANCHE_OPTIES_noDuplicates_uniqueEntries', () => {
    const unique = new Set(BRANCHE_OPTIES);
    expect(unique.size).toBe(BRANCHE_OPTIES.length);
  });

  it('test_BRANCHE_OPTIES_includesCoreSectors_coversCommonBusinesses', () => {
    const required = [
      'Kapper / Barbershop',
      'Restaurant',
      'Bakkerij',
      'Makelaar',
      'Installatiebedrijf',
    ];
    for (const sector of required) {
      expect(BRANCHE_OPTIES).toContain(sector);
    }
  });

  it('test_BRANCHE_OPTIES_hasOverigFallback_finalItemIsCatchAll', () => {
    const last = BRANCHE_OPTIES[BRANCHE_OPTIES.length - 1];
    expect(last.toLowerCase()).toContain('overig');
  });

  it('test_BRANCHE_OPTIES_allStringsTrimmed_noLeadingTrailingWhitespace', () => {
    for (const s of BRANCHE_OPTIES) {
      expect(s).toBe(s.trim());
      expect(s.length).toBeGreaterThan(0);
    }
  });
});
