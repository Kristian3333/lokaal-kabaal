// ─── Print.one HTML wrapping helpers ─────────────────────────────────────────
//
// Print.one renders the supplied HTML in a headless Chromium and snapshots the
// page at the postcard's physical dimensions. This module owns the wrapping
// strategy that pins the rendered canvas to the right pixel size, regardless
// of how the inner flyer HTML was authored.
//
// Two wrappers are exported because the two upstream HTML producers differ:
//   - The dashboard preview component emits HTML sized in screen pixels at
//     1.5 px / mm. wrapPreviewHtmlForPrint() takes that input and uses CSS
//     zoom to scale up to the print canvas.
//   - The server-side template builder (app/api/printone/template/route.ts)
//     emits HTML with mm/pt units. wrapMmHtmlForPrint() takes that input,
//     pins the layout viewport to the print canvas pixel width, and lets the
//     mm units resolve at 96 dpi to fill the canvas exactly.
//
// Why both: forcing one producer to convert to the other format is a
// high-risk visual refactor on print output. Two named wrappers keep the
// contract explicit at the call site.

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Mono:wght@400;500&family=Manrope:wght@400;600;700;800&display=swap';

const ROOT_VARS_CSS = `
  :root {
    --ink: #0A0A0A; --paper: #F5F3EF; --paper2: #EDEBE6;
    --line: #D8D4CC; --muted: #8A8479;
    --green: #00E87A; --green-dim: #00B85F;
    --red: #FF3B3B; --white: #FFFFFF; --radius: 2px;
    --font-serif: 'Instrument Serif', Georgia, serif;
    --font-mono: 'DM Mono', monospace;
    --font-sans: 'Manrope', sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
`;

/**
 * Print canvas configuration per supported flyer formaat.
 *
 * - mmW / mmH:       physical paper size including 3 mm bleed each side.
 * - previewW / previewH: dashboard preview pixel size at 1.5 px / mm.
 * - printPxW / printPxH: round(mm × 96 / 25.4) -- the pixel canvas Chromium
 *   would render the body at if the viewport were pinned to it. Used by
 *   wrapMmHtmlForPrint() to make print.one's snapshot match the paper size.
 * - scale: print-trim pixels / preview pixels. Used as CSS zoom by
 *   wrapPreviewHtmlForPrint().
 */
export interface PrintConfig {
  mmW: number;
  mmH: number;
  previewW: number;
  previewH: number;
  printPxW: number;
  printPxH: number;
  scale: number;
}

const MM_PER_INCH = 25.4;
const DPI = 96;
const mmToPx = (mm: number): number => Math.round((mm * DPI) / MM_PER_INCH);

export const PRINT_CONFIG: Record<string, PrintConfig> = {
  // A6: 105 × 148 mm trim, +3 mm bleed -> 111 × 154 mm
  a6: {
    mmW: 111, mmH: 154,
    previewW: 167, previewH: 231,
    printPxW: mmToPx(111), printPxH: mmToPx(154),
    scale: 397 / 167,
  },
  // A5: 148 × 210 mm trim, +3 mm bleed -> 154 × 216 mm
  a5: {
    mmW: 154, mmH: 216,
    previewW: 231, previewH: 324,
    printPxW: mmToPx(154), printPxH: mmToPx(216),
    scale: 559 / 231,
  },
  // Square: falls back onto the A5 canvas, but at a 1:1 aspect.
  sq: {
    mmW: 154, mmH: 154,
    previewW: 231, previewH: 231,
    printPxW: mmToPx(154), printPxH: mmToPx(154),
    scale: 559 / 231,
  },
};

const DEFAULT_FORMAAT = 'a6';

const cfgFor = (formaat: string): PrintConfig =>
  PRINT_CONFIG[formaat] ?? PRINT_CONFIG[DEFAULT_FORMAAT];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip <img> tags whose src would never resolve in print.one's renderer.
 * Empty, data:, and blob: srcs trigger a "resource at data:, could not be
 * loaded" error and break the render entirely.
 */
function sanitizeContent(html: string): string {
  return html
    .replace(/<img\b([^>]*?)\bsrc=(["'])(?:|data:,|blob:[^"']*)\2([^>]*?)>/gi, '')
    .replace(/<img\b([^>]*)src=["']\s*["']([^>]*)>/gi, '');
}

/**
 * Pull the inner contents of <head> and <body> out of an HTML document.
 * If the input is a fragment without those tags, returns it as the body.
 */
function extractHeadAndBody(rawHtml: string): { head: string; body: string } {
  const headMatch = rawHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return {
    head: headMatch ? headMatch[1] : '',
    body: bodyMatch ? bodyMatch[1] : rawHtml,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Wrap dashboard-preview HTML (sized in screen pixels at 1.5 px / mm) for
 * print.one rendering. Pins the viewport to the preview pixel width and uses
 * CSS zoom to scale up to the print trim canvas.
 */
export function wrapPreviewHtmlForPrint(rawHtml: string, formaat: string): string {
  const cfg = cfgFor(formaat);
  const { body } = extractHeadAndBody(rawHtml);
  const content = sanitizeContent(body);
  const scale = cfg.scale.toFixed(4);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${cfg.previewW}, initial-scale=1.0">
  <link rel="stylesheet" href="${FONTS_HREF}">
  <style>
    ${ROOT_VARS_CSS}
    html, body {
      width: ${cfg.previewW}px;
      height: ${cfg.previewH}px;
      overflow: hidden;
      font-family: var(--font-sans);
      -webkit-font-smoothing: antialiased;
    }
    /* zoom (not transform:scale) so layout reflows at the scaled size */
    .lk-wrap {
      width: ${cfg.previewW}px;
      height: ${cfg.previewH}px;
      zoom: ${scale};
      transform-origin: top left;
    }
  </style>
</head>
<body>
  <div class="lk-wrap">
    ${content}
  </div>
</body>
</html>`;
}

/**
 * Wrap server-built HTML whose inner content uses mm/pt units for print.one
 * rendering. Pins the layout viewport to the print canvas pixel width so
 * mm units resolve to the correct physical size at 96 dpi.
 *
 * The inner head's <style>, <script>, and font @import rules are preserved
 * so flyer typography survives the wrap.
 */
export function wrapMmHtmlForPrint(rawHtml: string, formaat: string): string {
  const cfg = cfgFor(formaat);
  const { head, body } = extractHeadAndBody(rawHtml);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=${cfg.printPxW}, initial-scale=1.0">
  ${head}
  <style>
    /* Print canvas: pinned to the postcard's pixel size at 96 dpi (incl.
     * 3 mm bleed). With the viewport meta above, Chromium uses this as the
     * layout viewport, so mm units inside the body resolve to fill the page
     * exactly when print.one snapshots the rendering. */
    html, body {
      width: ${cfg.printPxW}px;
      height: ${cfg.printPxH}px;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}
