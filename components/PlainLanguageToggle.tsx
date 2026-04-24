'use client';

/**
 * PlainLanguageToggle -- adds a TL;DR summary above long legal docs
 * that a visitor can open/close. Improves accessibility + lowers the
 * bounce rate on privacy / voorwaarden pages for users who don't want
 * to scroll 8 articles.
 */

import { useState } from 'react';

interface PlainLanguageToggleProps {
  /** Plain-language bullet list summarising the legal doc */
  samenvatting: string[];
}

export default function PlainLanguageToggle({ samenvatting }: PlainLanguageToggleProps): React.JSX.Element {
  const [open, setOpen] = useState(true); // default open so the summary is seen

  return (
    <div style={{
      background: 'var(--green-bg)',
      border: '1px solid rgba(0,232,122,0.25)',
      borderRadius: 'var(--radius)',
      padding: '16px 20px',
      marginBottom: '32px',
    }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
          textAlign: 'left', padding: 0, color: 'var(--ink)',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '11px', color: 'var(--green-dim)' }}>{open ? '▾' : '▸'}</span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Samenvatting in gewone taal
        </span>
      </button>
      {open && (
        <ul style={{ margin: '10px 0 0 0', padding: '0 0 0 20px', fontSize: '13px', color: 'var(--ink)', lineHeight: 1.7 }}>
          {samenvatting.map((s, i) => (
            <li key={i} style={{ marginBottom: '4px' }}>{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
