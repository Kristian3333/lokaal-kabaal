'use client';

/**
 * FlyerExport -- the "Print flyer / Save as PDF" button at the bottom
 * of the editor sidebar.
 *
 * Previous iterations rasterised the flyer with html2canvas and wrapped
 * the result in a jsPDF document. html2canvas reimplements CSS layout
 * and paint in JavaScript and kept diverging from what the browser
 * actually renders: descenders clipped, line-clamp boxes cut mid-
 * character, decorative opacities forced opaque, fallback fonts
 * shifting wrap. Every divergence cost a patch; the next one always
 * surfaced.
 *
 * This version drops html2canvas entirely. Export now uses the
 * browser's native print pipeline (window.print()), so the flyer is
 * laid out by the same engine that renders the on-screen preview --
 * Chrome's full layout. The printed output therefore cannot diverge
 * from the preview by construction. The user still gets a PDF if
 * they want one: the browser's print dialog has a built-in
 * "Save as PDF" option.
 *
 * Mechanism:
 *  1. Wait for fonts + images so layout is stable.
 *  2. Clone the offscreen frontRef (and backRef if double-sided) into
 *     a temporary .flyer-print-container appended to <body>. Cloning
 *     rather than re-parenting keeps the React virtual DOM intact.
 *  3. A @media print stylesheet hides every other element, brings the
 *     container on-screen, and uses CSS zoom to scale the 231x324
 *     CSS-px flyer up to the print page (1 CSS px = 0.265 mm at
 *     96 DPI; SCREEN_SCALE = 1.5 px/mm; zoom = 96 / 25.4 / 1.5 ≈ 2.52).
 *  4. window.print() opens the browser dialog. User picks Save as PDF
 *     or sends to a physical printer.
 *  5. After the dialog closes the cloned container is removed.
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

/** Wait for document fonts so the printed layout uses final faces. */
async function waitForFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (!fonts?.ready) return;
  await fonts.ready.catch(() => {});
}

/** Wait for all <img> descendants so wrap-affecting images are loaded. */
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

export default function FlyerExport({ frontRef, backRef, formaat, dubbelzijdig, bedrijfsnaam }: FlyerExportProps) {
  const [loading, setLoading] = useState(false);
  const dims = printDimsForFormaat(formaat);

  // CSS px <-> mm at the browser's 96 DPI default: 1 mm = 3.7795 px.
  // Our flyer DOM is laid out at SCREEN_SCALE px/mm, so to fill the
  // print page we apply zoom = 3.7795 / SCREEN_SCALE.
  const PRINT_ZOOM = (96 / 25.4) / SCREEN_SCALE;

  const handlePrint = async () => {
    if (!frontRef.current) return;
    setLoading(true);
    try {
      await waitForFonts();
      await waitForImages(frontRef.current);
      if (dubbelzijdig && backRef?.current) await waitForImages(backRef.current);

      const container = document.createElement('div');
      container.className = 'flyer-print-container';

      const frontClone = frontRef.current.cloneNode(true) as HTMLElement;
      frontClone.classList.add('flyer-print-page');
      frontClone.style.opacity = '1';
      frontClone.style.position = 'static';
      container.appendChild(frontClone);

      if (dubbelzijdig && backRef?.current) {
        const backClone = backRef.current.cloneNode(true) as HTMLElement;
        backClone.classList.add('flyer-print-page');
        backClone.style.opacity = '1';
        backClone.style.position = 'static';
        container.appendChild(backClone);
      }

      document.body.appendChild(container);

      const originalTitle = document.title;
      document.title = `Flyer - ${bedrijfsnaam}`;

      // Give layout one frame to settle before opening the dialog.
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      window.print();

      document.title = originalTitle;
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    } catch (e) {
      console.error('Print error:', e);
      showToast('Print mislukt. Probeer opnieuw.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <style jsx global>{`
        @media print {
          @page {
            size: ${dims.w}mm ${dims.h}mm;
            margin: 0;
          }
          html, body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden;
          }
          .flyer-print-container,
          .flyer-print-container * {
            visibility: visible;
          }
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
          .flyer-print-page:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
      <button
        onClick={handlePrint}
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
        {loading ? 'Bezig...' : 'Print flyer / opslaan als PDF'}
      </button>
      <p style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center', fontFamily: 'var(--font-mono)', lineHeight: 1.5, margin: 0 }}>
        Het printvenster opent.<br />Kies <strong>&ldquo;Opslaan als PDF&rdquo;</strong> of stuur direct naar je printer.
      </p>
    </div>
  );
}
