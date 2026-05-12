'use client';
import { useState } from 'react';
import { showToast } from '@/components/Toast';
import { HTML2CANVAS_PRINT_SCALE, printDimsForFormaat } from '@/lib/flyer-export-math';
import { applyExportSafeHeadlineStyles } from '@/lib/flyer-export-clone-style';

export interface FlyerExportProps {
  frontRef: React.RefObject<HTMLDivElement>;
  backRef?: React.RefObject<HTMLDivElement>;
  formaat: 'a6' | 'a5' | 'sq';
  dubbelzijdig?: boolean;
  bedrijfsnaam: string;
}

/**
 * Wait for document fonts so html2canvas measures text against the
 * final faces; otherwise fallback-font wrapping clips clamped lines.
 */
async function waitForFonts(): Promise<void> {
  const fonts = (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts;
  if (!fonts?.ready) return;
  await fonts.ready.catch(() => {}); // FontFaceSet rejection is non-fatal.
}

/**
 * Wait for all <img> descendants of the export root so html2canvas captures
 * the final layout, not a transient "text wrapped before image/font settled"
 * state.
 */
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

  const exportPDF = async () => {
    if (!frontRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      await waitForFonts();
      await waitForImages(frontRef.current);
      if (dubbelzijdig && backRef?.current) await waitForImages(backRef.current);

      // Keep a reference to the live document so the onclone fixer can
      // read computed CSS variable values from the original cascade.
      const liveDoc = document;

      const frontCanvas = await html2canvas(frontRef.current, {
        scale: HTML2CANVAS_PRINT_SCALE,
        useCORS: true,
        backgroundColor: null,
        logging: false,
        onclone: (clonedDoc) => applyExportSafeHeadlineStyles(clonedDoc, liveDoc),
      });

      const frontImg = frontCanvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [dims.w, dims.h],
      });

      pdf.addImage(frontImg, 'PNG', 0, 0, dims.w, dims.h);

      if (dubbelzijdig && backRef?.current) {
        const backCanvas = await html2canvas(backRef.current, {
          scale: HTML2CANVAS_PRINT_SCALE,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          onclone: (clonedDoc) => applyExportSafeHeadlineStyles(clonedDoc, liveDoc),
        });
        const backImg = backCanvas.toDataURL('image/png');
        pdf.addPage([dims.w, dims.h], 'portrait');
        pdf.addImage(backImg, 'PNG', 0, 0, dims.w, dims.h);
      }

      // Crop marks at the 3mm trim line.
      const bleed = 3;
      const markLen = 5;
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.25);
      pdf.line(0, bleed, markLen, bleed);
      pdf.line(bleed, 0, bleed, markLen);
      pdf.line(dims.w - markLen, bleed, dims.w, bleed);
      pdf.line(dims.w - bleed, 0, dims.w - bleed, markLen);
      pdf.line(dims.w - markLen, dims.h - bleed, dims.w, dims.h - bleed);
      pdf.line(dims.w - bleed, dims.h - markLen, dims.w - bleed, dims.h);
      pdf.line(0, dims.h - bleed, markLen, dims.h - bleed);
      pdf.line(bleed, dims.h - markLen, bleed, dims.h);

      pdf.setProperties({
        title: `Flyer - ${bedrijfsnaam}`,
        subject: `${dims.label} flyer met 3mm bleed - LokaalKabaal`,
        creator: 'LokaalKabaal',
        keywords: 'flyer, print, drukwerk',
      });

      pdf.save(`flyer-${bedrijfsnaam.toLowerCase().replace(/\s+/g, '-')}-${formaat}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      showToast('PDF export mislukt. Probeer opnieuw.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <button
        onClick={exportPDF}
        disabled={loading}
        style={{
          padding: '10px 16px', background: loading ? 'var(--paper3)' : 'var(--ink)',
          color: loading ? 'var(--muted)' : '#fff', border: 'none',
          borderRadius: 'var(--radius)', cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
        }}
      >
        {loading ? (
          <>⏳ PDF genereren...</>
        ) : (
          <>↓ Download print-klaar PDF</>
        )}
      </button>
    </div>
  );
}
