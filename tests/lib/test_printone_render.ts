import { describe, it, expect } from 'vitest';
import {
  PRINT_CONFIG,
  wrapPreviewHtmlForPrint,
  wrapMmHtmlForPrint,
} from '@/lib/printone-render';

// ─── PRINT_CONFIG invariants ──────────────────────────────────────────────────

describe('PRINT_CONFIG', () => {
  it('test_PRINT_CONFIG_a5_matchesPhysicalA5WithBleed', () => {
    // 148 mm trim + 3 mm bleed each long side -> 154 mm
    // 210 mm trim + 3 mm bleed each short side -> 216 mm
    expect(PRINT_CONFIG.a5.mmW).toBe(154);
    expect(PRINT_CONFIG.a5.mmH).toBe(216);
  });

  it('test_PRINT_CONFIG_a6_matchesPhysicalA6WithBleed', () => {
    expect(PRINT_CONFIG.a6.mmW).toBe(111);
    expect(PRINT_CONFIG.a6.mmH).toBe(154);
  });

  it('test_PRINT_CONFIG_sq_matchesSquareWithBleed', () => {
    expect(PRINT_CONFIG.sq.mmW).toBe(154);
    expect(PRINT_CONFIG.sq.mmH).toBe(154);
  });

  it('test_PRINT_CONFIG_a5_previewPxAt1_5PxPerMm', () => {
    // Preview scale: 1.5 px/mm
    expect(PRINT_CONFIG.a5.previewW).toBe(231);
    expect(PRINT_CONFIG.a5.previewH).toBe(324);
  });

  it('test_PRINT_CONFIG_a5_printPxRoundedTo582x816', () => {
    // 154 mm × 96 / 25.4 = 582.05 -> 582
    // 216 mm × 96 / 25.4 = 816.38 -> 816
    expect(PRINT_CONFIG.a5.printPxW).toBe(582);
    expect(PRINT_CONFIG.a5.printPxH).toBe(816);
  });

  it('test_PRINT_CONFIG_a6_printPxRoundedTo420x582', () => {
    expect(PRINT_CONFIG.a6.printPxW).toBe(420);
    expect(PRINT_CONFIG.a6.printPxH).toBe(582);
  });

  it('test_PRINT_CONFIG_printPx_areIntegers', () => {
    for (const cfg of Object.values(PRINT_CONFIG)) {
      expect(Number.isInteger(cfg.printPxW)).toBe(true);
      expect(Number.isInteger(cfg.printPxH)).toBe(true);
    }
  });

  it('test_PRINT_CONFIG_a5_scaleMatchesPrintTrimOverPreview', () => {
    // A5 trim: 148 mm × 3.7795 = 559 px. Preview: 231 px. Ratio = 2.4199.
    expect(PRINT_CONFIG.a5.scale).toBeCloseTo(559 / 231, 4);
  });
});

// ─── wrapPreviewHtmlForPrint ──────────────────────────────────────────────────

describe('wrapPreviewHtmlForPrint', () => {
  it('test_wrapPreviewHtmlForPrint_a5_setsViewportToPreviewWidth', () => {
    const out = wrapPreviewHtmlForPrint('<p>hi</p>', 'a5');
    expect(out).toMatch(/<meta\s+name="viewport"\s+content="width=231/);
  });

  it('test_wrapPreviewHtmlForPrint_a5_setsBodyToPreviewPixels', () => {
    const out = wrapPreviewHtmlForPrint('<p>hi</p>', 'a5');
    expect(out).toMatch(/width:\s*231px/);
    expect(out).toMatch(/height:\s*324px/);
  });

  it('test_wrapPreviewHtmlForPrint_a5_appliesZoomScale', () => {
    const out = wrapPreviewHtmlForPrint('<p>hi</p>', 'a5');
    // 559/231 ≈ 2.4199
    expect(out).toMatch(/zoom:\s*2\.4199/);
  });

  it('test_wrapPreviewHtmlForPrint_a6_appliesA6Scale', () => {
    const out = wrapPreviewHtmlForPrint('<p>hi</p>', 'a6');
    // 397/167 ≈ 2.3772
    expect(out).toMatch(/zoom:\s*2\.3772/);
  });

  it('test_wrapPreviewHtmlForPrint_unknownFormaat_fallsBackToA6', () => {
    const out = wrapPreviewHtmlForPrint('<p>hi</p>', 'oversized-billboard');
    expect(out).toMatch(/<meta\s+name="viewport"\s+content="width=167/);
    expect(out).toMatch(/zoom:\s*2\.3772/);
  });

  it('test_wrapPreviewHtmlForPrint_documentInput_extractsBodyOnly', () => {
    const input = '<!DOCTYPE html><html><head><title>X</title></head><body><p>FLYER</p></body></html>';
    const out = wrapPreviewHtmlForPrint(input, 'a5');
    expect(out).toContain('<p>FLYER</p>');
    expect(out).not.toContain('<title>X</title>');
  });

  it('test_wrapPreviewHtmlForPrint_fragmentInput_treatsAsBody', () => {
    const out = wrapPreviewHtmlForPrint('<div class="raw">hi</div>', 'a5');
    expect(out).toContain('<div class="raw">hi</div>');
  });

  it('test_wrapPreviewHtmlForPrint_emptyImgSrc_isStripped', () => {
    const out = wrapPreviewHtmlForPrint('<p>x</p><img src=""/><p>y</p>', 'a5');
    expect(out).not.toMatch(/<img[^>]*src=""/);
  });

  it('test_wrapPreviewHtmlForPrint_dataCommaImg_isStripped', () => {
    const out = wrapPreviewHtmlForPrint('<img src="data:,"/>OK', 'a5');
    expect(out).not.toMatch(/<img[^>]*src="data:,"/);
    expect(out).toContain('OK');
  });

  it('test_wrapPreviewHtmlForPrint_blobImg_isStripped', () => {
    const out = wrapPreviewHtmlForPrint('<img src="blob:https://x/abc"/>OK', 'a5');
    expect(out).not.toMatch(/<img[^>]*src="blob:/);
    expect(out).toContain('OK');
  });

  it('test_wrapPreviewHtmlForPrint_outputIsValidStandaloneDocument', () => {
    const out = wrapPreviewHtmlForPrint('<p>hi</p>', 'a5');
    expect(out).toMatch(/^<!DOCTYPE html>/);
    expect(out).toContain('<html>');
    expect(out).toContain('</html>');
    expect(out).toContain('<head>');
    expect(out).toContain('<body>');
  });
});

// ─── wrapMmHtmlForPrint ───────────────────────────────────────────────────────

describe('wrapMmHtmlForPrint', () => {
  it('test_wrapMmHtmlForPrint_a5_setsViewportToPrintPixelWidth', () => {
    const out = wrapMmHtmlForPrint('<div>hi</div>', 'a5');
    // 154 mm at 96 dpi = 582 px
    expect(out).toMatch(/<meta\s+name="viewport"\s+content="width=582/);
  });

  it('test_wrapMmHtmlForPrint_a5_setsBodyToPrintPixels', () => {
    const out = wrapMmHtmlForPrint('<div>hi</div>', 'a5');
    expect(out).toMatch(/width:\s*582px/);
    expect(out).toMatch(/height:\s*816px/);
  });

  it('test_wrapMmHtmlForPrint_a6_setsCorrectPrintPixelDimensions', () => {
    const out = wrapMmHtmlForPrint('<div>hi</div>', 'a6');
    expect(out).toMatch(/<meta\s+name="viewport"\s+content="width=420/);
    expect(out).toMatch(/width:\s*420px/);
    expect(out).toMatch(/height:\s*582px/);
  });

  it('test_wrapMmHtmlForPrint_preservesHeadStyles', () => {
    const input = `<!DOCTYPE html><html>
      <head><style>.foo { color: red }</style></head>
      <body><div class="foo">hi</div></body>
    </html>`;
    const out = wrapMmHtmlForPrint(input, 'a5');
    expect(out).toContain('.foo { color: red }');
  });

  it('test_wrapMmHtmlForPrint_preservesHeadScripts', () => {
    const input = `<!DOCTYPE html><html>
      <head><script>window.adapt && adapt();</script></head>
      <body><img class="logo"/></body>
    </html>`;
    const out = wrapMmHtmlForPrint(input, 'a5');
    expect(out).toContain('window.adapt && adapt();');
  });

  it('test_wrapMmHtmlForPrint_preservesFontImports', () => {
    const input = `<!DOCTYPE html><html>
      <head><style>@import url('https://fonts.googleapis.com/css2?family=Manrope');</style></head>
      <body><div>hi</div></body>
    </html>`;
    const out = wrapMmHtmlForPrint(input, 'a5');
    expect(out).toContain("@import url('https://fonts.googleapis.com/css2?family=Manrope');");
  });

  it('test_wrapMmHtmlForPrint_documentInput_extractsBodyOnly', () => {
    const input = '<!DOCTYPE html><html><head><title>HIDDEN</title></head><body><div>VISIBLE</div></body></html>';
    const out = wrapMmHtmlForPrint(input, 'a5');
    // body content present
    expect(out).toContain('<div>VISIBLE</div>');
    // <title> from input head should NOT bleed into the wrapper body
    const bodyMatch = out.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    expect(bodyMatch).not.toBeNull();
    expect(bodyMatch![1]).not.toContain('<title>HIDDEN</title>');
  });

  it('test_wrapMmHtmlForPrint_unknownFormaat_fallsBackToA6', () => {
    const out = wrapMmHtmlForPrint('<div>hi</div>', 'oversized-billboard');
    expect(out).toMatch(/<meta\s+name="viewport"\s+content="width=420/);
    expect(out).toMatch(/width:\s*420px/);
    expect(out).toMatch(/height:\s*582px/);
  });

  it('test_wrapMmHtmlForPrint_fragmentInput_treatsAsBody', () => {
    const out = wrapMmHtmlForPrint('<div class="raw">hi</div>', 'a5');
    expect(out).toContain('<div class="raw">hi</div>');
  });

  it('test_wrapMmHtmlForPrint_outputIsValidStandaloneDocument', () => {
    const out = wrapMmHtmlForPrint('<div>hi</div>', 'a5');
    expect(out).toMatch(/^<!DOCTYPE html>/);
    expect(out).toContain('<html>');
    expect(out).toContain('</html>');
    expect(out).toContain('<head>');
    expect(out).toContain('<body>');
  });

  it('test_wrapMmHtmlForPrint_canvasOverflowHidden_clipsBleedExcess', () => {
    // The wrapper canvas must use overflow:hidden so 3 mm bleed rendering
    // does not spill outside the print canvas. Without this, print.one's
    // snapshot can include scrollbars or extra blank area.
    const out = wrapMmHtmlForPrint('<div>hi</div>', 'a5');
    expect(out).toMatch(/overflow:\s*hidden/);
  });
});
