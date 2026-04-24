'use client';

/**
 * RoiCalculator -- public, standalone ROI calculator widget for the
 * /tools/roi-calculator page. Differs from the wizard's inline calc
 * because this one has branche-picker + cost slider, not just CLV.
 */

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BRANCHE_CLV, calculateRoi } from '@/lib/clv';

const BRANCHE_KEYS = Object.keys(BRANCHE_CLV);

export default function RoiCalculator(): React.JSX.Element {
  const [branche, setBranche] = useState<string>('kapper');
  const [clv, setClv] = useState<number>(BRANCHE_CLV.kapper.defaultClv);
  const [flyers, setFlyers] = useState<number>(400);
  const [maandkosten, setMaandkosten] = useState<number>(499); // Pro tier default
  const [conversieRatio, setConversieRatio] = useState<number>(0.06); // 6% mid-range

  const cfg = BRANCHE_CLV[branche];

  const result = useMemo(() => calculateRoi({
    flyersPerMaand: flyers,
    conversieRatio,
    clvPerJaar: clv,
    maandkostenTotaal: maandkosten,
  }), [flyers, conversieRatio, clv, maandkosten]);

  function setBrancheAndResetClv(key: string): void {
    setBranche(key);
    const c = BRANCHE_CLV[key];
    if (c) setClv(c.defaultClv);
  }

  const fmtEuro = (n: number): string => '€' + Math.round(n).toLocaleString('nl-NL');

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--line)', borderRadius: '8px',
      padding: '24px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
    }} className="roi-grid">
      <style>{`
        @media (max-width: 700px) {
          .roi-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Inputs */}
      <div>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Input
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="roi-branche" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'block', marginBottom: '4px' }}>Branche</label>
          <select
            id="roi-branche"
            value={branche}
            onChange={e => setBrancheAndResetClv(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '4px', fontSize: '14px', background: 'var(--paper2)' }}
          >
            {BRANCHE_KEYS.map(k => <option key={k} value={k}>{BRANCHE_CLV[k].label}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="roi-clv" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Waarde per vaste klant / jaar</span>
            <span style={{ color: 'var(--green-dim)', fontWeight: 700 }}>{fmtEuro(clv)}</span>
          </label>
          <input
            id="roi-clv"
            type="range"
            min={cfg.minClv}
            max={cfg.maxClv}
            step={10}
            value={clv}
            onChange={e => setClv(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }}
          />
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{cfg.bron}</div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="roi-flyers" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Flyers per maand</span>
            <span style={{ color: 'var(--green-dim)', fontWeight: 700 }}>{flyers}</span>
          </label>
          <input
            id="roi-flyers"
            type="range"
            min={100}
            max={2000}
            step={50}
            value={flyers}
            onChange={e => setFlyers(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label htmlFor="roi-conversie" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Conversieratio</span>
            <span style={{ color: 'var(--green-dim)', fontWeight: 700 }}>{(conversieRatio * 100).toFixed(1)}%</span>
          </label>
          <input
            id="roi-conversie"
            type="range"
            min={0.02}
            max={0.12}
            step={0.005}
            value={conversieRatio}
            onChange={e => setConversieRatio(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }}
          />
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            Realistisch: 4-8% bij nieuwe bewoners
          </div>
        </div>

        <div>
          <label htmlFor="roi-kosten" style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span>Maandkosten (abonnement + extra flyers)</span>
            <span style={{ color: 'var(--green-dim)', fontWeight: 700 }}>{fmtEuro(maandkosten)}</span>
          </label>
          <input
            id="roi-kosten"
            type="range"
            min={349}
            max={1500}
            step={10}
            value={maandkosten}
            onChange={e => setMaandkosten(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--green)' }}
          />
          <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            Starter €349 · Pro €499 · Agency €649 · +€0,70 per extra flyer
          </div>
        </div>
      </div>

      {/* Output */}
      <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: '8px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            Verwachting per maand
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', color: 'var(--ink)', lineHeight: 1 }}>
            ~{result.nieuweKlantenPerMaand}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)' }}>nieuwe vaste klanten</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--white)', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '2px' }}>OMZET/MND</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>{fmtEuro(result.omzetPerMaand)}</div>
          </div>
          <div style={{ background: 'var(--white)', borderRadius: '6px', padding: '12px 14px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '2px' }}>TERUGVERDIEN</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px' }}>
              {isFinite(result.terugverdientijdMaanden) ? `${result.terugverdientijdMaanden.toFixed(1)} mnd` : '∞'}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--white)', borderRadius: '6px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>ROI OVER 12 MAANDEN</div>
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: result.roiJaarPct >= 0 ? 'var(--green-dim)' : '#c0392b' }}>
            {result.roiJaarPct >= 0 ? '+' : ''}{result.roiJaarPct}%
          </div>
        </div>

        <Link href="/login" style={{
          display: 'inline-block', textAlign: 'center', padding: '12px 20px',
          background: 'var(--ink)', color: '#fff', textDecoration: 'none',
          fontSize: '13px', fontWeight: 800, borderRadius: '4px',
        }}>
          Start deze campagne →
        </Link>
      </div>
    </div>
  );
}
