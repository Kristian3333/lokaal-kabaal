'use client';

/**
 * ProefFlyerForm -- lead-magnet on the landing page. Captures email +
 * bedrijfsnaam + adres + branche in exchange for a free proof flyer at
 * the retailer's address. Submits to /api/proef-flyer.
 */

import { useState } from 'react';
import { BRANCHE_OPTIES } from '@/lib/branches';

type FieldErrors = Partial<Record<'email' | 'bedrijfsnaam' | 'adres' | 'branche', string>>;

export default function ProefFlyerForm(): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [bedrijfsnaam, setBedrijfsnaam] = useState('');
  const [adres, setAdres] = useState('');
  const [branche, setBranche] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setFieldErrors({});
    try {
      const res = await fetch('/api/proef-flyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, bedrijfsnaam, adres, branche }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFieldErrors(data.fieldErrors ?? {});
        setMessage({ type: 'error', text: data.error ?? 'Er ging iets mis.' });
        return;
      }
      setMessage({ type: 'success', text: data.message });
      setEmail(''); setBedrijfsnaam(''); setAdres(''); setBranche('');
    } catch {
      setMessage({ type: 'error', text: 'Netwerkfout -- probeer het zo opnieuw.' });
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--line)', borderRadius: '4px',
    background: 'var(--white)', fontSize: '13px',
    fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)',
    display: 'block', marginBottom: '4px', letterSpacing: '0.06em', textTransform: 'uppercase',
  };
  const errorStyle: React.CSSProperties = {
    fontSize: '11px', color: '#c0392b', fontFamily: 'var(--font-mono)',
    marginTop: '3px',
  };

  return (
    <section style={{ background: 'var(--paper2)', padding: '80px 40px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', textAlign: 'center' }}>
          Gratis proef
        </div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '14px', textAlign: 'center', letterSpacing: '-0.02em' }}>
          Probeer een proef-flyer <em style={{ color: 'var(--muted)' }}>gratis</em>.
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '32px', textAlign: 'center', maxWidth: '560px', marginLeft: 'auto', marginRight: 'auto' }}>
          Laat ons een voorbeeldflyer naar je eigen adres sturen zodat je de drukkwaliteit en bezorging met eigen ogen kunt zien -- geen account, geen creditcard.
        </p>

        {message && (
          <div
            role={message.type === 'success' ? 'status' : 'alert'}
            style={{
              background: message.type === 'success' ? 'var(--green-bg)' : 'rgba(231,76,60,0.08)',
              border: `1px solid ${message.type === 'success' ? 'rgba(0,232,122,0.25)' : 'rgba(231,76,60,0.25)'}`,
              color: message.type === 'success' ? 'var(--green-dim)' : '#c0392b',
              padding: '12px 16px', borderRadius: '4px', marginBottom: '20px',
              fontSize: '13px', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
            }}
          >
            {message.text}
          </div>
        )}

        {message?.type !== 'success' && (
          <form onSubmit={onSubmit} style={{
            background: 'var(--white)', padding: '28px 32px', borderRadius: '8px',
            border: '1px solid var(--line)', display: 'grid', gap: '14px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="proef-grid">
              <style>{`
                @media (max-width: 600px) {
                  .proef-grid { grid-template-columns: 1fr !important; }
                }
              `}</style>
              <div>
                <label htmlFor="proef-bedrijfsnaam" style={labelStyle}>Bedrijfsnaam</label>
                <input
                  id="proef-bedrijfsnaam" style={inputStyle} required
                  autoComplete="organization"
                  value={bedrijfsnaam} onChange={e => setBedrijfsnaam(e.target.value)}
                  placeholder="Jouw Bedrijf BV"
                />
                {fieldErrors.bedrijfsnaam && <div style={errorStyle}>{fieldErrors.bedrijfsnaam}</div>}
              </div>
              <div>
                <label htmlFor="proef-branche" style={labelStyle}>Branche</label>
                <select
                  id="proef-branche" style={inputStyle} required
                  value={branche} onChange={e => setBranche(e.target.value)}
                >
                  <option value="">Kies branche</option>
                  {BRANCHE_OPTIES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                {fieldErrors.branche && <div style={errorStyle}>{fieldErrors.branche}</div>}
              </div>
            </div>
            <div>
              <label htmlFor="proef-email" style={labelStyle}>E-mailadres</label>
              <input
                id="proef-email" type="email" style={inputStyle} required
                autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="jij@bedrijf.nl"
              />
              {fieldErrors.email && <div style={errorStyle}>{fieldErrors.email}</div>}
            </div>
            <div>
              <label htmlFor="proef-adres" style={labelStyle}>Afleveradres (straat + huisnr + postcode + stad)</label>
              <input
                id="proef-adres" style={inputStyle} required
                autoComplete="street-address"
                value={adres} onChange={e => setAdres(e.target.value)}
                placeholder="Kerkstraat 12, 3512 AB Utrecht"
              />
              {fieldErrors.adres && <div style={errorStyle}>{fieldErrors.adres}</div>}
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px', marginTop: '4px',
                background: loading ? 'var(--line2)' : 'var(--ink)', color: '#fff',
                border: 'none', borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontWeight: 800,
              }}
            >
              {loading ? 'Versturen...' : 'Stuur mij een gratis proef-flyer →'}
            </button>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
              We versturen max. 10 gratis proeven per dag first-come-first-served. Je e-mailadres + adres worden alleen gebruikt om deze proef te bezorgen.
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
