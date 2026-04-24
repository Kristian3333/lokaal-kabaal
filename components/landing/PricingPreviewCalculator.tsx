'use client';

/**
 * PricingPreviewCalculator -- inline CLV slider shown inside the
 * PricingSection. Lets a visitor enter a realistic customer-lifetime-
 * value for their branche and instantly see "how many vaste klanten
 * per maand betaal ik met 1 Pro abonnement?" -- the break-even math
 * retailers are already doing in their head.
 */

import { useState } from 'react';
import Link from 'next/link';
import { BRANCHE_CLV, calculateRoi } from '@/lib/clv';

const BRANCHE_KEYS = Object.keys(BRANCHE_CLV);
const PRO_FLYERS_PER_MAAND = 400;
const PRO_MAANDPRIJS = 499;
const BASELINE_CONVERSIE = 0.06;

export default function PricingPreviewCalculator(): React.JSX.Element {
  const [branche, setBranche] = useState<string>('kapper');
  const [clv, setClv] = useState<number>(BRANCHE_CLV.kapper.defaultClv);

  const cfg = BRANCHE_CLV[branche];

  const roi = calculateRoi({
    flyersPerMaand: PRO_FLYERS_PER_MAAND,
    conversieRatio: BASELINE_CONVERSIE,
    clvPerJaar: clv,
    maandkostenTotaal: PRO_MAANDPRIJS,
  });
  const breakEvenKlanten = Math.ceil(PRO_MAANDPRIJS / (clv / 12));

  function changeBranche(key: string): void {
    setBranche(key);
    const c = BRANCHE_CLV[key];
    if (c) setClv(c.defaultClv);
  }

  return (
    <div style={{
      background: 'rgba(0,232,122,0.04)',
      border: '1px solid rgba(0,232,122,0.2)',
      borderRadius: 'var(--radius)',
      padding: '22px 26px',
      marginTop: '28px',
      marginBottom: '16px',
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: '24px',
    }} className="pricing-preview-grid">
      <style>{`
        @media (max-width: 700px) {
          .pricing-preview-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Inputs */}
      <div>
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#00E87A', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Bereken live · Pro-bundel
        </div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', lineHeight: 1.25, marginBottom: '16px' }}>
          Wat levert LokaalKabaal jou op?
        </div>

        <label htmlFor="pricing-branche" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '4px' }}>
          Branche
        </label>
        <select
          id="pricing-branche"
          value={branche}
          onChange={e => changeBranche(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', marginBottom: '14px',
            background: 'rgba(255,255,255,0.06)', color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px',
            fontSize: '13px',
          }}
        >
          {BRANCHE_KEYS.map(k => (
            <option key={k} value={k} style={{ color: '#0A0A0A' }}>
              {BRANCHE_CLV[k].label}
            </option>
          ))}
        </select>

        <label htmlFor="pricing-clv" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span>Waarde per vaste klant / jaar</span>
          <span style={{ color: '#00E87A', fontWeight: 700 }}>€{clv.toLocaleString('nl-NL')}</span>
        </label>
        <input
          id="pricing-clv"
          type="range"
          min={cfg.minClv}
          max={cfg.maxClv}
          step={10}
          value={clv}
          onChange={e => setClv(Number(e.target.value))}
          style={{ width: '100%', accentColor: '#00E87A' }}
        />
        <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
          {cfg.bron}
        </div>
      </div>

      {/* Output */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>
            VERWACHTE NIEUWE VASTE KLANTEN / MND
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: '#fff', lineHeight: 1 }}>
            ~{roi.nieuweKlantenPerMaand}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)', marginBottom: '2px' }}>
            BREAK-EVEN BIJ
          </div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#00E87A' }}>
            {breakEvenKlanten} {breakEvenKlanten === 1 ? 'nieuwe klant' : 'nieuwe klanten'} / maand
          </div>
          <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>
            op basis van €{PRO_MAANDPRIJS} Pro-abonnement + 6% conversie
          </div>
        </div>
        <Link
          href="/tools/roi-calculator"
          style={{
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.55)',
            textDecoration: 'underline', marginTop: '4px',
          }}
        >
          Open uitgebreide ROI calculator →
        </Link>
      </div>
    </div>
  );
}
