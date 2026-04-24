import { describe, it, expect } from 'vitest';
import {
  LOCATION_LIMITS,
  attributeConversions,
  canAddLocation,
  findLocationForPc4,
  validateLocations,
  type RetailerLocation,
} from '@/lib/retailer-locations';

const loc = (over: Partial<RetailerLocation>): RetailerLocation => ({
  id: 'l1',
  retailerId: 'r1',
  naam: 'Winkel',
  pc4: '3512',
  winkelPincode: '1234',
  isPrimary: false,
  ...over,
});

describe('canAddLocation', () => {
  it('test_canAddLocation_starter_zero_returnsTrue', () => {
    expect(canAddLocation('starter', 0)).toBe(true);
  });

  it('test_canAddLocation_starter_atLimit_returnsFalse', () => {
    expect(canAddLocation('starter', LOCATION_LIMITS.starter)).toBe(false);
  });

  it('test_canAddLocation_pro_underLimit_returnsTrue', () => {
    expect(canAddLocation('pro', 2)).toBe(true);
  });

  it('test_canAddLocation_pro_atLimit_returnsFalse', () => {
    expect(canAddLocation('pro', 3)).toBe(false);
  });

  it('test_canAddLocation_agency_hundred_returnsTrue', () => {
    expect(canAddLocation('agency', 100)).toBe(true);
  });

  it('test_canAddLocation_negativeCount_returnsFalse', () => {
    expect(canAddLocation('starter', -1)).toBe(false);
  });
});

describe('findLocationForPc4', () => {
  it('test_findLocationForPc4_emptyList_returnsNull', () => {
    expect(findLocationForPc4([], '3512')).toBeNull();
  });

  it('test_findLocationForPc4_exactMatch_wins', () => {
    const a = loc({ id: 'a', pc4: '3511', isPrimary: true });
    const b = loc({ id: 'b', pc4: '3512' });
    expect(findLocationForPc4([a, b], '3512')?.id).toBe('b');
  });

  it('test_findLocationForPc4_pc3PrefixMatch_usedWhenNoExact', () => {
    const a = loc({ id: 'a', pc4: '1015', isPrimary: true });
    const b = loc({ id: 'b', pc4: '3511' });
    // 3512 shares "351" prefix with 3511, not with 1015.
    expect(findLocationForPc4([a, b], '3512')?.id).toBe('b');
  });

  it('test_findLocationForPc4_noMatch_returnsPrimary', () => {
    const a = loc({ id: 'a', pc4: '1015', isPrimary: true });
    const b = loc({ id: 'b', pc4: '2033' });
    expect(findLocationForPc4([a, b], '9999')?.id).toBe('a');
  });

  it('test_findLocationForPc4_noMatchNoPrimary_returnsFirst', () => {
    const a = loc({ id: 'a', pc4: '1015', isPrimary: false });
    const b = loc({ id: 'b', pc4: '2033', isPrimary: false });
    expect(findLocationForPc4([a, b], '9999')?.id).toBe('a');
  });
});

describe('attributeConversions', () => {
  it('test_attributeConversions_routesEachConversionByPc4', () => {
    const a = loc({ id: 'a', pc4: '3511', isPrimary: true });
    const b = loc({ id: 'b', pc4: '1015' });
    const conversions = [
      { pc4: '3511' }, // exact -> a
      { pc4: '1015' }, // exact -> b
      { pc4: '3512' }, // prefix -> a (351)
    ];
    const result = attributeConversions(conversions, [a, b]);
    expect(result.get('a')).toHaveLength(2);
    expect(result.get('b')).toHaveLength(1);
  });

  it('test_attributeConversions_emptyConversions_returnsEmptyBuckets', () => {
    const a = loc({ id: 'a', pc4: '3511', isPrimary: true });
    const result = attributeConversions([], [a]);
    expect(result.get('a')).toEqual([]);
  });

  it('test_attributeConversions_noLocations_returnsEmptyMap', () => {
    const result = attributeConversions([{ pc4: '3511' }], []);
    expect(result.size).toBe(0);
  });
});

describe('validateLocations', () => {
  it('test_validateLocations_empty_returnsEmptyErrors', () => {
    expect(validateLocations([])).toEqual([]);
  });

  it('test_validateLocations_noPrimary_returnsError', () => {
    const errors = validateLocations([loc({ isPrimary: false })]);
    expect(errors).toContain('Geen primaire locatie ingesteld.');
  });

  it('test_validateLocations_multiplePrimaries_returnsError', () => {
    const errors = validateLocations([
      loc({ id: 'a', winkelPincode: '1', isPrimary: true }),
      loc({ id: 'b', winkelPincode: '2', isPrimary: true }),
    ]);
    expect(errors.some(e => e.includes('primaire locaties gevonden'))).toBe(true);
  });

  it('test_validateLocations_duplicatePincode_returnsError', () => {
    const errors = validateLocations([
      loc({ id: 'a', winkelPincode: '1234', isPrimary: true }),
      loc({ id: 'b', winkelPincode: '1234', isPrimary: false }),
    ]);
    expect(errors.some(e => e.includes('Dubbele winkel-pincode: 1234'))).toBe(true);
  });

  it('test_validateLocations_allGood_returnsEmptyErrors', () => {
    const errors = validateLocations([
      loc({ id: 'a', winkelPincode: '1111', isPrimary: true }),
      loc({ id: 'b', winkelPincode: '2222', isPrimary: false }),
    ]);
    expect(errors).toEqual([]);
  });
});
