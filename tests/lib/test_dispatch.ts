import { describe, it, expect } from 'vitest';
import {
  parsePc4Lijst,
  isLastMonth,
  formatMaandLabel,
  currentBatchMonth,
} from '@/lib/dispatch';

describe('parsePc4Lijst', () => {
  it('test_parsePc4Lijst_null_returnsEmptyArray', () => {
    expect(parsePc4Lijst(null)).toEqual([]);
  });

  it('test_parsePc4Lijst_undefined_returnsEmptyArray', () => {
    expect(parsePc4Lijst(undefined)).toEqual([]);
  });

  it('test_parsePc4Lijst_emptyString_returnsEmptyArray', () => {
    expect(parsePc4Lijst('')).toEqual([]);
  });

  it('test_parsePc4Lijst_singleCode_returnsOneElement', () => {
    expect(parsePc4Lijst('3512')).toEqual(['3512']);
  });

  it('test_parsePc4Lijst_multipleCodes_returnsAll', () => {
    expect(parsePc4Lijst('3512,3513,3514')).toEqual(['3512', '3513', '3514']);
  });

  it('test_parsePc4Lijst_whitespacePadded_trimsEach', () => {
    expect(parsePc4Lijst(' 3512 , 3513 , 3514 ')).toEqual(['3512', '3513', '3514']);
  });

  it('test_parsePc4Lijst_emptySegments_filteredOut', () => {
    expect(parsePc4Lijst('3512,,3513,')).toEqual(['3512', '3513']);
  });
});

describe('isLastMonth', () => {
  it('test_isLastMonth_sameYearMonth_returnsTrue', () => {
    expect(isLastMonth('2026-05-01', '2026-05-01')).toBe(true);
    // Day component is ignored, only year-month matters
    expect(isLastMonth('2026-05-01', '2026-05-28')).toBe(true);
  });

  it('test_isLastMonth_differentMonth_returnsFalse', () => {
    expect(isLastMonth('2026-04-01', '2026-05-01')).toBe(false);
  });

  it('test_isLastMonth_differentYear_returnsFalse', () => {
    expect(isLastMonth('2025-12-01', '2026-12-01')).toBe(false);
  });
});

describe('formatMaandLabel', () => {
  it('test_formatMaandLabel_march_returnsDutchLabel', () => {
    const label = formatMaandLabel('2026-03-01');
    expect(label.toLowerCase()).toContain('maart');
    expect(label).toContain('2026');
  });

  it('test_formatMaandLabel_december_returnsDutchLabel', () => {
    const label = formatMaandLabel('2026-12-01');
    expect(label.toLowerCase()).toContain('december');
    expect(label).toContain('2026');
  });
});

describe('currentBatchMonth', () => {
  it('test_currentBatchMonth_format_isIsoDay1', () => {
    const m = currentBatchMonth();
    expect(m).toMatch(/^\d{4}-\d{2}-01$/);
  });

  it('test_currentBatchMonth_year_matchesCurrentUtcYear', () => {
    const m = currentBatchMonth();
    const expectedYear = new Date().getUTCFullYear();
    expect(m.startsWith(String(expectedYear))).toBe(true);
  });
});
