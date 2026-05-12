'use client';

/**
 * FlyerExport -- the "Download flyer" panel at the bottom of the editor.
 *
 * The earlier html2canvas + jsPDF pipeline reimplemented CSS layout in
 * JavaScript and kept diverging from Chrome's actual rendering: each
 * patch (descender slack, line-clamp -> max-height, opacity override,
 * box-sizing fix) surfaced the next divergence. We dropped that
 * pipeline entirely.
 *
 * Primary export is now an HTML file. We serialise the live flyer DOM
 * (frontRef + optional backRef) into a self-contained HTML document
 * with embedded fonts and a print stylesheet sized to the postcard's
 * mm dimensions. Opening the file in any browser renders the flyer
 * identically to the editor preview -- same layout engine, no
 * rasterisation step in the middle. From there the user can:
 *   - View it in browser (preview / share).
 *   - Ctrl+P -> "Save as PDF" (Chrome's native PDF, accurate by
 *     construction).
 *   - Ctrl+P -> physical printer at A5.
 *   - Upload the HTML directly to Print.one's template API.
 *
 * Secondary: "Print direct" button that triggers window.print() on
 * the live editor page using the same print stylesheet, so the user
 * doesn't need to download a file first if they just want a quick
 * paper print or PDF.
 */

import { useState } from 'react';
import { showToast } from '@/components/Toast';
import { printDimsForFormaat, SCREEN_SCALE } from '@/lib/flyer-export-math';

export interface FlyerExportProps {
  frontRef: React.RefObject<HTMLDivElement>;
  backRef?: React.RefObject<HTMLDivElement>;
  formaat: 'a6' | 'a5' | 'sq';
  dubbelzijdig?: boolean;
  bedrijfsnaam: string;
}

/** Wait for document fonts so the serialised layout uses final faces. */
async function waitForFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (!fonts?.ready) return;
  await fonts.ready.catch(() => {});
}

/** Wait for all <img> descendants so wrap-affecting images have loaded. */
async function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'));
  if (imgs.length === 0) return;
  await Promise.all(imgs.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const done = () => {
        img.removeEventListener('load', done);
        img.removeEventListener('error', done);
        resolve();
      };
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  }));
}

/** Minimal HTML attribute escaper for embedding user-supplied text. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Clone a flyer wrapper for export, stripping the offscreen-positioning
 *  inline styles the editor uses to hide the print refs from the user. */
function exportClone(el: HTMLElement): HTMLElement {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.opacity = '1';
  clone.style.position = 'static';
  clone.style.left = '';
  clone.style.top = '';
  return clone;
}

export default function FlyerExport({ frontRef, backRef, formaat, dubbelzijdig, bedrijfsnaam }: FlyerExportProps) {
  const [loading, setLoading] = useState<'html' | 'print' | null>(null);
  const dims = printDimsForFormaat(formaat);

  // CSS px <-> mm at the browser default 96 DPI: 1mm = 96/25.4 px = 3.7795.
  // Flyer DOM is laid out at SCREEN_SCALE px/mm (1.5), so zoom for print =
  // 3.7795 / 1.5 = 2.5197 to fill the A5/A6/SQ page natively.
  const PRINT_ZOOM = (96 / 25.4) / SCREEN_SCALE;

  const handleDownloadHtml = async () => {
    if (!frontRef.current) return;
    setLoading('html');
    try {
      await waitForFonts();
      await waitForImages(frontRef.current);
      if (dubbelzijdig && backRef?.current) await waitForImages(backRef.current);

      const frontHtml = exportClone(frontRef.current).outerHTML;
      const backHtml = dubbelzijdig && backRef?.current
        ? exportClone(backRef.current).outerHTML
        : '';

      const fullHtml = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(`Flyer - ${bedrijfsnaam}`)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Instrument+Serif&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --font-serif: 'Instrument Serif', Georgia, serif;
      --font-mono: 'DM Mono', ui-monospace, monospace;
      --font-sans: 'Manrope', system-ui, sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #f5f3ef; font-family: var(--font-sans); }
    .flyer-export {
      display: flex; gap: 32px; padding: 40px;
      justify-content: center; align-items: flex-start; flex-wrap: wrap;
      min-height: 100vh;
    }
    .flyer-export > * { box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18); border-radius: 4px; }
    @media print {
      @page { size: ${dims.w}mm ${dims.h}mm; margin: 0; }
      html, body { background: white !important; }
      .flyer-export { padding: 0 !important; gap: 0 !important; min-height: 0 !important; display: block !important; }
      .flyer-export > * {
        zoom: ${PRINT_ZOOM};
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-after: always;
        margin: 0 !important;
      }
      .flyer-export > *:last-child { page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="flyer-export">
    ${frontHtml}
    ${backHtml}
  </div>
</body>
</html>`;

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `flyer-${bedrijfsnaam.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'lokaalkabaal'}-${formaat}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('HTML export error:', e);
      showToast('Download mislukt. Probeer opnieuw.', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handlePrintNow = async () => {
    if (!frontRef.current) return;
    setLoading('print');
    try {
      await waitForFonts();
      await waitForImages(frontRef.current);
      if (dubbelzijdig && backRef?.current) await waitForImages(backRef.current);

      const container = document.createElement('div');
      container.className = 'flyer-print-container';
      container.appendChild(exportClone(frontRef.current));
      if (dubbelzijdig && backRef?.current) {
        const back = exportClone(backRef.current);
        container.appendChild(back);
      }
      Array.from(container.children).forEach((c) => (c as HTMLElement).classList.add('flyer-print-page'));
      document.body.appendChild(container);

      const originalTitle = document.title;
      document.title = `Flyer - ${bedrijfsnaam}`;
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      window.print();

      document.title = originalTitle;
      if (document.body.contains(container)) document.body.removeChild(container);
    } catch (e) {
      console.error('Print error:', e);
      showToast('Print mislukt. Probeer opnieuw.', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <style jsx global>{`
        @media print {
          @page { size: ${dims.w}mm ${dims.h}mm; margin: 0; }
          html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
          body * { visibility: hidden; }
          .flyer-print-container, .flyer-print-container * { visibility: visible; }
          .flyer-print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .flyer-print-page {
            zoom: ${PRINT_ZOOM};
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            opacity: 1 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-after: always;
          }
          .flyer-print-page:last-child { page-break-after: auto; }
        }
      `}</style>
      <button
        onClick={handleDownloadHtml}
        disabled={loading !== null}
        style={{
          padding: '10px 16px',
          background: loading === 'html' ? 'var(--paper3)' : 'var(--ink)',
          color: loading === 'html' ? 'var(--muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
        {loading === 'html' ? 'Bezig...' : 'Download flyer als HTML'}
      </button>
      <button
        onClick={handlePrintNow}
        disabled={loading !== null}
        style={{
          padding: '7px 12px',
          background: 'transparent',
          color: 'var(--ink)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          cursor: loading !== null ? 'not-allowed' : 'pointer',
          fontSize: '11px',
          fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
        {loading === 'print' ? 'Printvenster opent...' : 'Of: print direct / opslaan als PDF'}
      </button>
      <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', lineHeight: 1.5, margin: '4px 0 0' }}>
        HTML opent in elke browser en print 1-op-1 zoals de preview.
        300 DPI PNG/JPG nodig voor Print.one upload? Open de HTML en
        gebruik <strong>Bestand &rarr; Opslaan als PDF</strong> of een
        schermafbeelding-tool.
      </p>
    </div>
  );
}
