'use client';
import Link from 'next/link';
import { useState } from 'react';
import {
  TIERS,
  YEARLY_DISCOUNT,
  EXTRA_FLYER_PRICE_A6,
  A5_UPGRADE_PRICE,
  CUSTOM_PRICING_THRESHOLD,
  type Tier,
} from '@/lib/tiers';
import PricingPreviewCalculator from '@/components/landing/PricingPreviewCalculator';

// ─── Tier display configuration ───────────────────────────────────────────────
//
// A6 dubbelzijdig is standaard in alle pakketten (geen toeslag).
// Abonnement dekt service, automatisering, postcodedata, printkosten voor
// inbegrepen flyers én PostNL-bezorging.

type TierCardConfig = {
  tier: Tier;
  label: string;
  sub: string;
  hero: boolean;
  features: string[];
  extraFeatures: string[];
  lockedFeatures: string[];
  cta: string;
  breakEven: string;
  werkgebied: string;
};

const TIER_CARDS: TierCardConfig[] = [
  {
    tier: 'starter',
    label: 'Starter',
    sub: 'Eén campagne, lokaal werkgebied',
    hero: false,
    werkgebied: 'Max. 100 km straal',
    features: [
      '300 A6 dubbelzijdige flyers per maand',
      'Max. 100 km werkgebiedstraal',
      'Tot 40 postcodegebieden',
      '1 gelijktijdige campagne',
      'Onbeperkt flyer-templates',
      'QR-code scanning · conversieregistratie per adres',
      'Maandelijks rapport',
    ],
    lockedFeatures: [
      'Doelgroepfilters (bouwjaar, WOZ, energielabel)',
    ],
    extraFeatures: [],
    cta: 'Start gratis proef →',
    breakEven: 'Break-even: 1 nieuwe vaste klant per kwartaal dekt de jaarkost.',
  },
  {
    tier: 'pro',
    label: 'Pro',
    sub: 'Meerdere campagnes, slimme targeting',
    hero: true,
    werkgebied: 'Max. 200 km straal',
    features: [
      '400 A6 dubbelzijdige flyers per maand',
      'Max. 200 km werkgebiedstraal',
      'Tot 80 postcodegebieden',
      '3 gelijktijdige campagnes',
      'Onbeperkt flyer-templates',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Wekelijks rapport + statistieken',
      'Follow-up flyer (na 30 dagen bij niet-scan)',
    ],
    lockedFeatures: [],
    extraFeatures: [
      'Doelgroepfilters: bouwjaar, WOZ-waarde, energielabel',
    ],
    cta: 'Claim uw positie →',
    breakEven: 'Break-even: 1 nieuwe vaste klant per 2 maanden. Typisch rendement: 8-12x.',
  },
  {
    tier: 'agency',
    label: 'Agency',
    sub: 'Onbeperkt werkgebied, volledige controle',
    hero: false,
    werkgebied: 'Onbeperkt werkgebied',
    features: [
      '500 A6 dubbelzijdige flyers per maand',
      'Onbeperkt werkgebied (geen straallimiet)',
      'Onbeperkt postcodegebieden',
      'Onbeperkt gelijktijdige campagnes',
      'Onbeperkt flyer-templates + AI auto-selectie',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Real-time dashboard',
      'Follow-up flyer + A/B testen',
      'Doelgroepfilters: bouwjaar, WOZ-waarde, energielabel',
    ],
    lockedFeatures: [],
    extraFeatures: [
      'Persoonlijke flyerhulp (inbegrepen bij jaarcontract)',
    ],
    cta: 'Domineer uw markt →',
    breakEven: 'Voor installateurs en multi-locatie ondernemers. LTV eerste jaar: €4.000-12.000.',
  },
];

function fmt(n: number): string {
  return n.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n: number): string {
  return n.toLocaleString('nl', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function PricingSection(): React.JSX.Element {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="prijzen" style={{ background: 'var(--ink)', padding: '100px 40px' }}>
      <style>{`
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .pricing-section { padding: 60px 20px !important; }
          .pricing-toggle { flex-wrap: wrap; gap: 8px !important; }
          .pricing-extras { grid-template-columns: 1fr !important; }
          .pricing-cta a, .pricing-cta button {
            min-height: 48px;
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }} className="pricing-section">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Abonnementen · Nieuwe woningeigenaren
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>
            Bereik nieuwe bewoners<br />
            <em style={{ color: 'rgba(255,255,255,.35)' }}>automatisch, elke maand</em>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)', maxWidth: '580px', margin: '0 auto 16px' }}>
            A6 dubbelzijdig, drukkosten en PostNL-bezorging zitten bij je abonnement. Je betaalt alleen bij als je boven je maandbundel uitkomt.
          </p>

          {/* Billing toggle */}
          <div className="pricing-toggle" style={{ display: 'inline-flex', alignItems: 'center', gap: '0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '3px' }}>
            <button onClick={() => setYearly(false)} style={{
              padding: '7px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)',
              background: !yearly ? '#fff' : 'transparent',
              color: !yearly ? 'var(--ink)' : 'rgba(255,255,255,.5)',
              transition: 'all 0.15s',
            }}>
              Maandelijks
            </button>
            <button onClick={() => setYearly(true)} style={{
              padding: '7px 18px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-mono)',
              background: yearly ? 'var(--green)' : 'transparent',
              color: yearly ? 'var(--ink)' : 'rgba(255,255,255,.5)',
              transition: 'all 0.15s',
              display: 'flex', alignItems: 'center', gap: '7px',
            }}>
              Jaarlijks
              <span style={{
                fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px',
                background: yearly ? 'rgba(0,0,0,0.15)' : 'var(--green)',
                color: 'var(--ink)',
              }}>
                −{Math.round(YEARLY_DISCOUNT * 100)}%
              </span>
            </button>
          </div>
          {yearly && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: 'var(--font-mono)' }}>
              {Math.round(YEARLY_DISCOUNT * 100)}% korting · per jaar vooruit gefactureerd · niet tussentijds opzegbaar
            </div>
          )}
        </div>

        {/* Interactive pricing preview -- shows "break-even bij X klanten/mnd" */}
        <PricingPreviewCalculator />

        {/* Tier cards */}
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start', marginTop: '32px' }}>
          {TIER_CARDS.map(card => {
            const cfg = TIERS[card.tier];
            const price = yearly ? cfg.priceYearly : cfg.priceMonthly;

            return (
              <div key={card.tier} style={{
                border: card.hero ? '2px solid var(--green)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius)',
                padding: '24px 20px',
                background: card.hero ? 'rgba(0,232,122,0.04)' : 'rgba(255,255,255,0.03)',
                position: 'relative',
              }}>
                {card.hero && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Meest gekozen
                  </div>
                )}

                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: card.hero ? 'var(--green)' : 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginBottom: '16px' }}>{card.sub}</div>

                {/* Key metrics badges */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: card.hero ? 'var(--green)' : '#fff', fontFamily: 'var(--font-mono)' }}>{fmtInt(cfg.includedFlyers)}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>flyers/mnd</span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-mono)' }}>{card.werkgebied}</span>
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    €{fmt(price)}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', paddingBottom: '4px' }}>
                    /maand
                  </span>
                  {yearly && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)', paddingBottom: '5px' }}>−{Math.round(YEARLY_DISCOUNT * 100)}%</span>
                  )}
                </div>

                {/* Included flyers note */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,232,122,0.08)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: '4px', padding: '3px 8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(0,232,122,0.85)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {fmtInt(cfg.includedFlyers)} A6 dubbelzijdig inbegrepen
                  </span>
                </div>

                {/* Yearly total */}
                {yearly ? (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    €{fmtInt(cfg.priceYearlyTotal)} per jaar vooruit · was €{fmtInt(cfg.priceMonthly * 12)}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    maandelijks opzegbaar
                  </div>
                )}

                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
                  A6 dubbelzijdig standaard · bezorging op de 28e-30e · incasso op de 1e
                </div>

                {/* Features */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {card.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>✓</span>
                      <span style={{ fontSize: '11px', color: card.hero ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}

                  {card.extraFeatures.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '2px' }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>★</span>
                      <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}

                  {card.lockedFeatures.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '2px', opacity: 0.4 }}>
                      <span style={{ flexShrink: 0, fontSize: '12px' }}>🔒</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Break-even note */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: '16px', fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                  {card.breakEven}
                </div>

                <div className="pricing-cta">
                  <Link href="/login" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', padding: card.hero ? '12px 16px' : '11px 16px',
                    minHeight: '48px', lineHeight: '1.4',
                    background: card.hero ? 'var(--green)' : 'transparent',
                    border: card.hero ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    color: card.hero ? 'var(--ink)' : '#fff',
                    textDecoration: 'none', borderRadius: 'var(--radius)',
                    fontWeight: card.hero ? 800 : 700, fontSize: '13px',
                  }}>
                    {card.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add-ons / extra options */}
        <div className="pricing-extras" style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>A5 UPGRADE</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', marginBottom: '4px' }}>+€0,15 / flyer</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
              Groter formaat, meer ruimte voor beeld. Toeslag per flyer bovenop je bundel.
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>EXTRA FLYERS BUITEN BUNDEL</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', marginBottom: '4px' }}>€{fmt(EXTRA_FLYER_PRICE_A6)} / flyer</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.45)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
              Tot 4.999 A6 per maand · automatisch op de incasso van de 1e.
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', padding: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>VANAF {fmtInt(CUSTOM_PRICING_THRESHOLD)} FLYERS/MND</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: '#fff', marginBottom: '8px' }}>Op aanvraag</div>
            <a
              href="mailto:support@lokaalkabaal.agency?subject=Maatwerkprijs%20%285.000%2B%20flyers%2Fmnd%29"
              style={{ display: 'inline-block', padding: '6px 14px', background: 'var(--green)', color: 'var(--ink)', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-mono)' }}
            >
              Neem contact op →
            </a>
          </div>
        </div>

        {/* Campaign duration info */}
        <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '6px' }}>BEZORGDATUM</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Flyers liggen tussen de 28e en 30e van de maand bij de nieuwe bewoner op de mat.</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '6px' }}>BETALING INCASSO</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Automatische incasso op de 1e · abonnement + eventuele bijbestelling op één factuur.</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '6px' }}>CAMPAGNEDUUR</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Kies 1-24 maanden. Maandelijks opzegbaar behalve bij jaarabonnement.</div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)' }}>
          Alle prijzen excl. BTW · A6 dubbelzijdig standaard in alle pakketten · A5 upgrade: +€{fmt(A5_UPGRADE_PRICE)}/flyer · Extra flyers boven bundel: €{fmt(EXTRA_FLYER_PRICE_A6)}/stuk · {yearly ? 'Jaarcontract: per jaar vooruit, niet tussentijds opzegbaar' : 'Maandelijks opzegbaar'}
        </div>
      </div>
    </section>
  );
}
