'use client';
import { useState } from 'react';
import { showToast } from '@/components/Toast';

// Print dimensions in mm (incl. 3mm bleed rondom) -- alle formaten portrait
// print.one specs: A6 105×148mm, A5 148×210mm, Vierkant 148×148mm + 3mm bleed rondom
export const PRINT_DIMS = {
  a6: { w: 111, h: 154, trimW: 105, trimH: 148, label: 'A6 (105×148mm)' },
  a5: { w: 154, h: 216, trimW: 148, trimH: 210, label: 'A5 (148×210mm)' },
  sq: { w: 154, h: 154, trimW: 148, trimH: 148, label: 'Vierkant (148×148mm)' },
};

// Schermpreview pixels (SCALE = 1.5 px/mm)
export const SCREEN_SCALE = 1.5;
export const PREVIEW_PX = {
  a6: { w: Math.round(111 * SCREEN_SCALE), h: Math.round(154 * SCREEN_SCALE) }, // 167×231
  a5: { w: Math.round(154 * SCREEN_SCALE), h: Math.round(216 * SCREEN_SCALE) }, // 231×324
  sq: { w: Math.round(154 * SCREEN_SCALE), h: Math.round(154 * SCREEN_SCALE) }, // 231×231
};

// Print-ready render pixels (SCALE = 3 px/mm for ~300dpi)
export const PRINT_RENDER_PX = {
  a6: { w: Math.round(111 * 3), h: Math.round(154 * 3) },
  a5: { w: Math.round(154 * 3), h: Math.round(216 * 3) },
  sq: { w: Math.round(154 * 3), h: Math.round(154 * 3) },
};

export interface FlyerExportProps {
  frontRef: React.RefObject<HTMLDivElement>;
  backRef?: React.RefObject<HTMLDivElement>;
  formaat: 'a6' | 'a5' | 'sq';
  dubbelzijdig?: boolean;
  bedrijfsnaam: string;
}

export default function FlyerExport({ frontRef, backRef, formaat, dubbelzijdig, bedrijfsnaam }: FlyerExportProps) {
  const [loading, setLoading] = useState(false);
  const dims = PRINT_DIMS[formaat];

  const exportPDF = async () => {
    if (!frontRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Render at 3x for ~300dpi equivalent
      const frontCanvas = await html2canvas(frontRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const frontImg = frontCanvas.toDataURL('image/jpeg', 0.95);

      // PDF in mm -- alle formaten portrait (of vierkant)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [dims.w, dims.h], // incl. bleed
      });

      // Full bleed front image
      pdf.addImage(frontImg, 'JPEG', 0, 0, dims.w, dims.h);

      // Back page for double-sided flyers
      if (dubbelzijdig && backRef?.current) {
        const backCanvas = await html2canvas(backRef.current, {
          scale: 3,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        });
        const backImg = backCanvas.toDataURL('image/jpeg', 0.95);
        pdf.addPage([dims.w, dims.h], 'portrait');
        pdf.addImage(backImg, 'JPEG', 0, 0, dims.w, dims.h);
      }

      // Crop marks (3mm bleed → crop marks at trim edge)
      const bleed = 3;
      const markLen = 5;
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.25);
      // Top-left
      pdf.line(0, bleed, markLen, bleed);
      pdf.line(bleed, 0, bleed, markLen);
      // Top-right
      pdf.line(dims.w - markLen, bleed, dims.w, bleed);
      pdf.line(dims.w - bleed, 0, dims.w - bleed, markLen);
      // Bottom-right
      pdf.line(dims.w - markLen, dims.h - bleed, dims.w, dims.h - bleed);
      pdf.line(dims.w - bleed, dims.h - markLen, dims.w - bleed, dims.h);
      // Bottom-left
      pdf.line(0, dims.h - bleed, markLen, dims.h - bleed);
      pdf.line(bleed, dims.h - markLen, bleed, dims.h);

      // Note in PDF metadata
      pdf.setProperties({
        title: `Flyer – ${bedrijfsnaam}`,
        subject: `${dims.label} flyer met 3mm bleed – LokaalKabaal`,
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
