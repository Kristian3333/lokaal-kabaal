'use client';
import { useRef, useState } from 'react';

// Print dimensions in mm (incl. 3mm bleed rondom)
export const PRINT_DIMS = {
  a6: { w: 111, h: 154, trimW: 105, trimH: 148, label: 'A6' },
  a5: { w: 216, h: 154, trimW: 210, trimH: 148, label: 'A5' },
  a4: { w: 303, h: 216, trimW: 297, trimH: 210, label: 'A4' },
};

// px dimensions for on-screen preview (scale: 3px per mm at 300dpi equivalent)
const SCALE = 1.5; // screen preview scale
export const PREVIEW_PX = {
  a6: { w: Math.round(111 * SCALE), h: Math.round(154 * SCALE) },
  a5: { w: Math.round(154 * SCALE), h: Math.round(216 * SCALE) },
  a4: { w: Math.round(210 * SCALE), h: Math.round(297 * SCALE) },
};

interface FlyerExportProps {
  flyerRef: React.RefObject<HTMLDivElement>;
  formaat: 'a6' | 'a5' | 'a4';
  bedrijfsnaam: string;
}

export default function FlyerExport({ flyerRef, formaat, bedrijfsnaam }: FlyerExportProps) {
  const [loading, setLoading] = useState(false);
  const dims = PRINT_DIMS[formaat];

  const exportPDF = async () => {
    if (!flyerRef.current) return;
    setLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).jsPDF;

      // Render at 3x for ~300dpi equivalent
      const canvas = await html2canvas(flyerRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // PDF in mm, portrait or landscape based on formaat
      const isLandscape = dims.trimW > dims.trimH;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: [dims.w, dims.h], // incl. bleed
      });

      // Full bleed image
      pdf.addImage(imgData, 'JPEG', 0, 0, dims.w, dims.h);

      // Crop marks (3mm bleed → crop marks at trim edge)
      const bleed = 3;
      const markLen = 5;
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.25);
      const corners = [
        [bleed, bleed],
        [dims.w - bleed, bleed],
        [dims.w - bleed, dims.h - bleed],
        [bleed, dims.h - bleed],
      ];
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
        subject: `${dims.label} flyer met 3mm bleed – geschikt voor PrintAPI.nl`,
        creator: 'LokaalKabaal',
        keywords: 'flyer, print, drukwerk',
      });

      pdf.save(`flyer-${bedrijfsnaam.toLowerCase().replace(/\s+/g, '-')}-${formaat}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('PDF export mislukt. Probeer opnieuw.');
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
      <div style={{
        background: 'var(--paper2)', border: '1px solid var(--line)',
        borderRadius: 'var(--radius)', padding: '10px 12px',
        fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)',
        lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>PrintAPI.nl specificaties</div>
        <div>✓ Formaat: {dims.label} ({dims.trimW}×{dims.trimH}mm)</div>
        <div>✓ Bleed: 3mm rondom inbegrepen</div>
        <div>✓ Snijmarken: aanwezig in PDF</div>
        <div>✓ Resolutie: 300 DPI equivalent</div>
        <div style={{ color: '#e8a020', marginTop: '4px' }}>⚠ Converteer naar CMYK in Acrobat of Affinity vóór upload</div>
      </div>
    </div>
  );
}
