import { describe, it, expect } from 'vitest';
import { escapeCsvCell, toCsv } from '@/lib/csv';

describe('escapeCsvCell', () => {
  it('test_escape_plainText_unchanged', () => {
    expect(escapeCsvCell('hello')).toBe('hello');
  });

  it('test_escape_null_returnsEmpty', () => {
    expect(escapeCsvCell(null)).toBe('');
  });

  it('test_escape_undefined_returnsEmpty', () => {
    expect(escapeCsvCell(undefined)).toBe('');
  });

  it('test_escape_equalsPrefix_preventsFormulaInjection', () => {
    expect(escapeCsvCell('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
  });

  it('test_escape_plusPrefix_preventsFormulaInjection', () => {
    expect(escapeCsvCell('+cmd')).toBe("'+cmd");
  });

  it('test_escape_dashPrefix_preventsFormulaInjection', () => {
    expect(escapeCsvCell('-42')).toBe("'-42");
  });

  it('test_escape_atPrefix_preventsFormulaInjection', () => {
    expect(escapeCsvCell('@ref')).toBe("'@ref");
  });

  it('test_escape_commaInValue_wrappedInQuotes', () => {
    expect(escapeCsvCell('Amsterdam, Noord-Holland')).toBe('"Amsterdam, Noord-Holland"');
  });

  it('test_escape_doubleQuoteInValue_escaped', () => {
    expect(escapeCsvCell('He said "hi"')).toBe('"He said ""hi"""');
  });

  it('test_escape_newlineInValue_wrappedInQuotes', () => {
    expect(escapeCsvCell('line1\nline2')).toBe('"line1\nline2"');
  });

  it('test_escape_tabPrefix_prefixedSafely', () => {
    expect(escapeCsvCell('\tmalicious')).toBe("'\tmalicious");
  });
});

describe('toCsv', () => {
  it('test_toCsv_headerAndRows_correctShape', () => {
    const csv = toCsv(
      [
        ['PC4', 'pc4'],
        ['Verzonden', 'verzonden'],
      ],
      [
        { pc4: '3512', verzonden: 12 },
        { pc4: '3513', verzonden: 8 },
      ],
    );
    expect(csv).toBe('PC4,Verzonden\r\n3512,12\r\n3513,8\r\n');
  });

  it('test_toCsv_escapeAppliesToDataCells', () => {
    const csv = toCsv(
      [['Naam', 'naam']],
      [{ naam: '=HACK' }],
    );
    expect(csv).toContain("'=HACK");
  });

  it('test_toCsv_empty_returnsHeaderOnly', () => {
    const csv = toCsv(
      [['PC4', 'pc4']],
      [] as Array<{ pc4: string }>,
    );
    expect(csv).toBe('PC4\r\n');
  });
});
