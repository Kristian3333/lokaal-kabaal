'use client';

/**
 * FlyerExport -- the "Download flyer" button at the bottom of the editor.
 *
 * PDF generation is deliberately not offered. Every PDF path we tried
 * (html2canvas -> jsPDF, then browser window.print() -> Save as PDF)
 * diverged from the on-screen preview in ways that matter for postal
 * print: descender clipping, line-clamp mid-character cuts, font
 * fallback wrap shifts, decorative-opacity overrides. The browser's
 * own PDF export is technically accurate but users were still
 * dropping the file into Print.one expecting it to match the editor
 * and getting surprised, so we removed that path entirely.
 *
 * The single supported export is an HTML file. We serialise the live
 * flyer DOM (frontRef + optional backRef) into a self-contained HTML
 * document with embedded fonts and a print stylesheet sized to the
 * postcard's mm dimensions. Opening the file in any browser renders
 * the flyer identically to the editor preview -- same layout engine,
 * no rasterisation step in the middle. The user can view it, share
 * it, or upload the HTML directly to Print.one's template API.
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

/** Minimal HTML escaper for embedding user-supplied text into the document. */
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
  const [loading, setLoading] = useState(false);
  const dims = printDimsForFormaat(formaat);

  // CSS px <-> mm at the browser default 96 DPI: 1mm = 96/25.4 px = 3.7795.
  // Flyer DOM is laid out at SCREEN_SCALE px/mm (1.5), so the embedded
  // print stylesheet uses zoom = 3.7795 / SCREEN_SCALE to fill the page.
  const PRINT_ZOOM = (96 / 25.4) / SCREEN_SCALE;

  const handleDownloadHtml = async () => {
    if (!frontRef.current) return;
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <button
        onClick={handleDownloadHtml}
        disabled={loading}
        style={{
          padding: '10px 16px',
          background: loading ? 'var(--paper3)' : 'var(--ink)',
          color: loading ? 'var(--muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          justifyContent: 'center',
        }}
      >
        {loading ? 'Bezig...' : 'Download flyer als HTML'}
      </button>
      <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', lineHeight: 1.5, margin: '4px 0 0' }}>
        HTML opent in elke browser en rendert 1-op-1 zoals de preview.
        Upload het bestand direct naar de Print.one template-API of deel
        het ter controle voordat we de bestelling indienen.
      </p>
    </div>
  );
}
