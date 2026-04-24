import { describe, it, expect } from 'vitest';
import { escHtml, buildEmailHtml, buildStatRow } from '@/lib/email-templates';

describe('escHtml', () => {
  it('test_escHtml_ampersand_encodedFirst', () => {
    // The & must be replaced first so that &lt; etc. aren't double-encoded
    expect(escHtml('a & b')).toBe('a &amp; b');
  });

  it('test_escHtml_angleBrackets_encoded', () => {
    expect(escHtml('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('test_escHtml_quote_encoded', () => {
    expect(escHtml('"quoted"')).toBe('&quot;quoted&quot;');
  });

  it('test_escHtml_plainString_unchanged', () => {
    expect(escHtml('Hello world 123')).toBe('Hello world 123');
  });

  it('test_escHtml_emptyString_returnsEmpty', () => {
    expect(escHtml('')).toBe('');
  });

  it('test_escHtml_combinedSpecials_allEscaped', () => {
    expect(escHtml('<a href="?x=1&y=2">')).toBe('&lt;a href=&quot;?x=1&amp;y=2&quot;&gt;');
  });
});

describe('buildEmailHtml', () => {
  it('test_buildEmailHtml_noCta_includesTitleAndBody', () => {
    const html = buildEmailHtml('Welkom', '<p>Fijn je te zien</p>');
    expect(html).toContain('<title>Welkom</title>');
    expect(html).toContain('Welkom');
    expect(html).toContain('<p>Fijn je te zien</p>');
    expect(html).not.toContain('display: inline-block; margin-top: 24px');
  });

  it('test_buildEmailHtml_withCta_rendersCtaLink', () => {
    const html = buildEmailHtml('Hallo', '<p>body</p>', { text: 'Klik', url: 'https://example.com/x' });
    expect(html).toContain('href="https://example.com/x"');
    expect(html).toContain('Klik');
  });

  it('test_buildEmailHtml_brandHeaderPresent_lokaalKabaalLogo', () => {
    const html = buildEmailHtml('X', '<p>y</p>');
    expect(html).toContain('Lokaal');
    expect(html).toContain('Kabaal');
    expect(html).toContain('#00E87A');
  });

  it('test_buildEmailHtml_footerLink_pointsToSupport', () => {
    const html = buildEmailHtml('X', '<p>y</p>');
    expect(html).toContain('hallo@lokaalkabaal.agency');
  });
});

describe('buildStatRow', () => {
  it('test_buildStatRow_singleItem_rendersValueAndLabel', () => {
    const html = buildStatRow([{ value: 42, label: 'Scans' }]);
    expect(html).toContain('42');
    expect(html).toContain('Scans');
    expect(html).toContain('<table');
  });

  it('test_buildStatRow_multipleItems_rendersAllCells', () => {
    const html = buildStatRow([
      { value: 100, label: 'Flyers' },
      { value: '4.2%', label: 'Conversie' },
    ]);
    expect(html).toContain('100');
    expect(html).toContain('Flyers');
    expect(html).toContain('4.2%');
    expect(html).toContain('Conversie');
    // Two <td> cells
    expect((html.match(/<td/g) ?? []).length).toBe(2);
  });

  it('test_buildStatRow_emptyList_returnsEmptyTable', () => {
    const html = buildStatRow([]);
    expect(html).toContain('<table');
    expect(html).toContain('<tr></tr>');
  });
});
