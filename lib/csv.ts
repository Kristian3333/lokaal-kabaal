/**
 * Minimal CSV helpers with formula-injection escaping.
 *
 * Excel + Numbers + Google Sheets all interpret cells that start with
 * `=`, `+`, `-`, or `@` as formulas. User-supplied content (retailer
 * names, address fields) can therefore hijack the spreadsheet when
 * exported naively. We prefix any dangerous cell with a single quote
 * so the spreadsheet treats it as text.
 *
 * See https://owasp.org/www-community/attacks/CSV_Injection
 */

const FORMULA_TRIGGERS = ['=', '+', '-', '@', '\t', '\r'];

/** Escape a single cell for safe CSV export. */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const raw = String(value);
  const prefixed = FORMULA_TRIGGERS.includes(raw[0] ?? '') ? `'${raw}` : raw;
  if (prefixed.includes(',') || prefixed.includes('"') || prefixed.includes('\n')) {
    return `"${prefixed.replace(/"/g, '""')}"`;
  }
  return prefixed;
}

/**
 * Build a CSV document (header row + data rows) from an array of
 * records. Column order follows the `columns` list.
 *
 * @param columns  Ordered list of [header, accessorKey] pairs
 * @param rows     Records to serialise
 */
export function toCsv<T extends Record<string, unknown>>(
  columns: Array<[header: string, key: keyof T]>,
  rows: T[],
): string {
  const headerLine = columns.map(([header]) => escapeCsvCell(header)).join(',');
  const lines = rows.map(row =>
    columns.map(([, key]) => escapeCsvCell(row[key] as string | number | null | undefined)).join(','),
  );
  return [headerLine, ...lines].join('\r\n') + '\r\n';
}
