import { describe, it, expect } from 'vitest';
import {
  PRINTONE_BASE_A6,
  PRINTONE_TOESLAG,
  PRINTONE_DUBBELZIJDIG,
  prijsPerStuk,
  totalePrintkosten,
  prijsLabel,
  toeslagLabel,
} from '@/lib/printone-pricing';

// ── Constants ──

describe('pricing constants', () => {
  it('test_PRINTONE_BASE_A6_value_is069', () => {
    expect(PRINTONE_BASE_A6).toBe(0.69);
  });

  it('test_PRINTONE_TOESLAG_a6_isZero', () => {
    expect(PRINTONE_TOESLAG.a6).toBe(0);
  });

  it('test_PRINTONE_TOESLAG_a5_is018', () => {
    expect(PRINTONE_TOESLAG.a5).toBe(0.18);
  });

  it('test_PRINTONE_TOESLAG_sq_is019', () => {
    expect(PRINTONE_TOESLAG.sq).toBe(0.19);
  });

  it('test_PRINTONE_DUBBELZIJDIG_allFormats_is010', () => {
    expect(PRINTONE_DUBBELZIJDIG.a6).toBe(0.10);
    expect(PRINTONE_DUBBELZIJDIG.a5).toBe(0.10);
    expect(PRINTONE_DUBBELZIJDIG.sq).toBe(0.10);
  });
});

// ── prijsPerStuk ──

describe('prijsPerStuk', () => {
  it('test_prijsPerStuk_a6Enkelzijdig_returns069', () => {
    expect(prijsPerStuk('a6', false)).toBeCloseTo(0.69, 2);
  });

  it('test_prijsPerStuk_a6Dubbelzijdig_returns079', () => {
    expect(prijsPerStuk('a6', true)).toBeCloseTo(0.79, 2);
  });

  it('test_prijsPerStuk_a5Enkelzijdig_returns087', () => {
    expect(prijsPerStuk('a5', false)).toBeCloseTo(0.87, 2);
  });

  it('test_prijsPerStuk_a5Dubbelzijdig_returns097', () => {
    expect(prijsPerStuk('a5', true)).toBeCloseTo(0.97, 2);
  });

  it('test_prijsPerStuk_sqEnkelzijdig_returns088', () => {
    expect(prijsPerStuk('sq', false)).toBeCloseTo(0.88, 2);
  });

  it('test_prijsPerStuk_sqDubbelzijdig_returns098', () => {
    expect(prijsPerStuk('sq', true)).toBeCloseTo(0.98, 2);
  });
});

// ── totalePrintkosten ──

describe('totalePrintkosten', () => {
  it('test_totalePrintkosten_300a6Enkelzijdig_returns207', () => {
    expect(totalePrintkosten({ formaat: 'a6', dubbelzijdig: false, aantalFlyers: 300 })).toBe(207.00);
  });

  it('test_totalePrintkosten_1a6Enkelzijdig_returns069', () => {
    expect(totalePrintkosten({ formaat: 'a6', dubbelzijdig: false, aantalFlyers: 1 })).toBe(0.69);
  });

  it('test_totalePrintkosten_0flyers_returnsZero', () => {
    expect(totalePrintkosten({ formaat: 'a5', dubbelzijdig: true, aantalFlyers: 0 })).toBe(0);
  });
});

// ── prijsLabel ──

describe('prijsLabel', () => {
  it('test_prijsLabel_a6Enkelzijdig_returnsFormattedDutch', () => {
    expect(prijsLabel('a6', false)).toBe('€0,69/stuk');
  });

  it('test_prijsLabel_a5Dubbelzijdig_returnsFormattedDutch', () => {
    expect(prijsLabel('a5', true)).toBe('€0,97/stuk');
  });
});

// ── toeslagLabel ──

describe('toeslagLabel', () => {
  it('test_toeslagLabel_a6Enkelzijdig_returnsStandaard', () => {
    expect(toeslagLabel('a6', false)).toBe('Standaard · €0,69/stuk');
  });

  it('test_toeslagLabel_a6Dubbelzijdig_returnsPlusToeslag', () => {
    expect(toeslagLabel('a6', true)).toBe('+€0,10 /stuk');
  });

  it('test_toeslagLabel_a5Enkelzijdig_returnsPlusToeslag', () => {
    expect(toeslagLabel('a5', false)).toBe('+€0,18 /stuk');
  });

  it('test_toeslagLabel_a5Dubbelzijdig_returnsCombinedToeslag', () => {
    expect(toeslagLabel('a5', true)).toBe('+€0,28 /stuk');
  });

  it('test_toeslagLabel_sqEnkelzijdig_returnsPlusToeslag', () => {
    expect(toeslagLabel('sq', false)).toBe('+€0,19 /stuk');
  });

  it('test_toeslagLabel_sqDubbelzijdig_returnsCombinedToeslag', () => {
    expect(toeslagLabel('sq', true)).toBe('+€0,29 /stuk');
  });
});
