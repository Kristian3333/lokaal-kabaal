'use client';

/**
 * Exit-intent modal shown once per session when the user moves the
 * cursor towards the top of the viewport (classic "about to close the
 * tab" signal). Dismissed state persists in sessionStorage so we don't
 * harass returning visitors.
 *
 * Not shown on mobile where there's no cursor.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

const DISMISS_KEY = 'lk_exit_intent_dismissed';

export default function ExitIntent(): React.JSX.Element | null {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Skip on small screens (no cursor)
    if (window.matchMedia('(max-width: 768px)').matches) return;
    // Already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;

    function onMouseLeave(e: MouseEvent): void {
      // Only trigger when cursor exits through the top of the viewport
      if (e.clientY > 0) return;
      setOpen(true);
      document.removeEventListener('mouseleave', onMouseLeave);
    }
    // Wait 3s before arming so fast bouncers don't trigger immediately
    const armTimer = setTimeout(() => {
      document.addEventListener('mouseleave', onMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(armTimer);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  function dismiss(): void {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voordat je weggaat"
      onClick={e => { if (e.target === e.currentTarget) dismiss(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,10,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div style={{
        width: 'min(520px, 100%)',
        background: 'var(--paper)',
        borderRadius: '10px',
        padding: '32px 36px 28px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
        position: 'relative',
      }}>
        <button
          type="button"
          aria-label="Sluit"
          onClick={dismiss}
          style={{
            position: 'absolute', top: '14px', right: '14px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: '18px', fontFamily: 'var(--font-mono)',
          }}
        >
          ×
        </button>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
          Voordat je weggaat
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, lineHeight: 1.15, marginBottom: '12px', letterSpacing: '-0.02em' }}>
          Reken eerst uit wat <em style={{ color: 'var(--muted)' }}>1 vaste klant per maand</em> jou oplevert.
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '18px' }}>
          Onze gratis ROI calculator pakt je branche + klantwaarde en toont direct of LokaalKabaal zich terugverdient. Geen account nodig.
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/tools/roi-calculator"
            onClick={dismiss}
            style={{
              display: 'inline-block', padding: '12px 24px',
              background: 'var(--ink)', color: '#fff',
              fontSize: '13px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
            }}
          >
            Open ROI calculator →
          </Link>
          <button
            type="button"
            onClick={dismiss}
            style={{
              padding: '12px 16px', background: 'transparent', border: 'none',
              color: 'var(--muted)', fontSize: '12px', fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
            }}
          >
            Nee bedankt
          </button>
        </div>
      </div>
    </div>
  );
}
