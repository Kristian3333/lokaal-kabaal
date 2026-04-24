'use client';

/**
 * VerhuisdataTool -- public free tool widget for the /tools/verhuisdata page.
 *
 * Accepts a 4-digit Dutch postcode, fetches an average new-mover estimate,
 * and shows the result plus a soft CTA. Uses the existing /api/pc4 endpoint
 * for the PC4 metadata; the new-movers estimate is a client-side calc from
 * dwellings count (CBS baseline of 5.5% annual turnover / 2.1 people per
 * household / 12 months).
 */

import { useState } from 'react';
import Link from 'next/link';

interface Pc4Data {
  pc4: string;
  estAdressenMaand: number;
  totalAdressen: number;
  verhuisgraadPct: number;
  dataBron: string;
  gemeenteCode?: string;
}

export default function VerhuisdataTool(): React.JSX.Element {
  const [pc4Input, setPc4Input] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Pc4Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  const normalized = pc4Input.replace(/\D/g, '').slice(0, 4);
  const canSubmit = normalized.length === 4 && !loading;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      // The public /api/pc4 endpoint accepts POST { centrumPc4, straalKm }
      // and returns an estAdressenMaand for the PC4 area. We use straalKm=1
      // so the result is essentially this single PC4's new-movers estimate.
      const res = await fetch('/api/pc4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centrumPc4: normalized, straalKm: 1 }),
      });
      if (!res.ok) {
        if (res.status === 400) {
          setError(`Postcode ${normalized} niet gevonden. Controleer de 4 cijfers.`);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const body = await res.json() as Pc4Data;
      setData({ ...body, pc4: normalized });
    } catch {
      setError('Opzoeken mislukt -- probeer het zo nog eens.');
    } finally {
      setLoading(false);
    }
  }

  const estPerMonth = data?.estAdressenMaand ?? null;
  const estPerYear = estPerMonth !== null ? estPerMonth * 12 : null;

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '20px', maxWidth: '420px' }}
      >
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          value={pc4Input}
          onChange={e => setPc4Input(e.target.value)}
          placeholder="3512"
          aria-label="4-cijferige postcode"
          style={{
            flex: 1, padding: '14px 16px', fontSize: '20px', letterSpacing: '0.2em',
            fontFamily: 'var(--font-mono)', textAlign: 'center',
            border: '1px solid var(--line)', borderRadius: '6px', background: '#fff',
          }}
        />
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            padding: '0 24px', background: canSubmit ? 'var(--ink)' : 'var(--line2)',
            color: '#fff', border: 'none', borderRadius: '6px',
            fontWeight: 700, fontSize: '14px', cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Ophalen...' : 'Check →'}
        </button>
      </form>

      {error && (
        <div role="alert" style={{
          background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)',
          borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: '20px',
          fontSize: '13px', color: '#c0392b', fontFamily: 'var(--font-mono)',
        }}>
          {error}
        </div>
      )}

      {data && estPerMonth !== null && (
        <div style={{
          background: '#fff', border: '1px solid var(--line)', borderRadius: '8px',
          padding: '28px 32px',
        }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Postcode {data.pc4}{data.gemeenteCode ? ` · gemeente ${data.gemeenteCode}` : ''}
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '52px', color: 'var(--ink)', lineHeight: 1, marginBottom: '6px' }}>
            ~{estPerMonth.toLocaleString('nl-NL')}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '18px' }}>
            nieuwe huiseigenaren per maand
            {` · ~${data.totalAdressen.toLocaleString('nl-NL')} woningen in het gebied · ${data.verhuisgraadPct}% verhuisgraad`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div style={{ background: 'var(--paper2)', borderRadius: '6px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '4px' }}>PER JAAR</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--ink)' }}>~{estPerYear?.toLocaleString('nl-NL')}</div>
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: '6px', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', marginBottom: '4px' }}>CONVERSIERATIO</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--green-dim)' }}>4-8%</div>
            </div>
          </div>
          <Link href="/login" style={{
            display: 'inline-block', padding: '12px 24px', background: 'var(--green)', color: 'var(--ink)',
            fontSize: '13px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Start campagne in {data.pc4} →
          </Link>
        </div>
      )}

      <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '14px', lineHeight: 1.6 }}>
        Schatting gebaseerd op CBS-verhuisgraad per gemeente. Werkelijke aantallen worden via Altum AI / Kadaster opgehaald zodra je een campagne start.
      </p>
    </div>
  );
}
