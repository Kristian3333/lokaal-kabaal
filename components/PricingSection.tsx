'use client';
import Link from 'next/link';
import { useState } from 'react';

// ─── Pakket-definities ────────────────────────────────────────────────────────
//
// Print.one A6 bulktarief (300+ stuks): €0,69/stuk incl. bezorging
// Minimum 300 flyers per batch (bulk-drempel voor kortingstarief)
//
// Proefbatch: €49 eenmalig · 10 pc4 · 1 batch
// Buurt:  10 pc4  · €199/m · €149/m (jaarlijks)
// Wijk:   50 pc4  · €399/m · €299/m (jaarlijks)
// Stad:   onbeperkt · €799/m · €599/m (jaarlijks)

const TIERS = [
  {
    tier: 'Eenmalig',
    name: 'Proefbatch',
    sub: 'Één echte batch als meetbaar bewijs',
    monthly: 49,
    yearly: null,
    yearlyTotal: null,
    pc4s: '10',
    isOneTime: true,
    features: [
      '10 postcodegebieden · 1 batch',
      'Min. 300 flyers (vaste printrun)',
      'A6 enkelzijdig · print + bezorging inbegrepen',
      'QR-code tracking inbegrepen',
    ],
    extraFeatures: [] as string[],
    yearlyFeatures: [] as string[],
    noFeatures: [] as string[],
    hero: false,
    breakEven: 'Eenmalig €49. Na afloop automatische uitnodiging voor het Buurt-abonnement.',
    cta: 'Eerste batch voor €49 →',
  },
  {
    tier: 'Tier 1',
    name: 'Buurt',
    sub: 'Uw eerste vaste klanten werven',
    monthly: 199,
    yearly: 149,
    yearlyTotal: 1788,
    pc4s: '10',
    isOneTime: false,
    features: [
      '10 postcodegebieden actief',
      'Min. 300 flyers per batch · maandelijks bezorgd',
      'Standaard A6 · print + bezorging inbegrepen',
      'Onbeperkt flyer-templates',
      'QR-code scanning · conversieregistratie per adres',
      'Maandelijks rapport',
    ],
    extraFeatures: [] as string[],
    yearlyFeatures: [
      'Follow-up flyer: 2e kaart na 30 dagen voor niet-gescande QR\'s · tegen gereduceerd tarief',
    ],
    noFeatures: [] as string[],
    hero: false,
    breakEven: 'Break-even: 1 nieuwe vaste klant per kwartaal dekt de jaarkost.',
    cta: 'Start met Buurt →',
  },
  {
    tier: 'Tier 2',
    name: 'Wijk',
    sub: 'De vaste naam in de buurt worden',
    monthly: 399,
    yearly: 299,
    yearlyTotal: 3588,
    pc4s: '50',
    isOneTime: false,
    features: [
      '50 postcodegebieden actief',
      'Min. 300 flyers per batch · maandelijks bezorgd',
      'Standaard A6 · print + bezorging inbegrepen',
      'Onbeperkt flyer-templates',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Wekelijks rapport + statistieken',
    ],
    extraFeatures: [
      'Prioriteit bezorging',
      'Meerdere flyer-templates (seizoen, woningtype, aanbieding)',
    ],
    yearlyFeatures: [
      'Follow-up flyer: 2e kaart na 30 dagen voor niet-gescande QR\'s · tegen gereduceerd tarief',
    ],
    noFeatures: [] as string[],
    hero: true,
    breakEven: 'Break-even: 1 nieuwe vaste klant per 2 maanden. Typische return: 8–12×.',
    cta: 'Claim uw wijkpositie →',
  },
  {
    tier: 'Tier 3',
    name: 'Stad',
    sub: 'Categorie-eigenaar in uw verzorgingsgebied',
    monthly: 799,
    yearly: 599,
    yearlyTotal: 7188,
    pc4s: '∞',
    isOneTime: false,
    features: [
      'Onbeperkt postcodegebieden actief',
      'Min. 300 flyers per batch · onbeperkt batches',
      'A6 + grotere formaten zonder toeslag',
      'Onbeperkt flyer-templates + AI auto-selectie op woningtype',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Real-time dashboard',
    ],
    extraFeatures: [
      'A/B testen (min. 600 flyers: 300 per variant)',
    ],
    yearlyFeatures: [
      'Follow-up flyer: 2e kaart na 30 dagen voor niet-gescande QR\'s · tegen gereduceerd tarief',
      'Persoonlijke flyerhulp inbegrepen',
    ],
    noFeatures: [] as string[],
    hero: false,
    breakEven: 'Voor installateurs en multi-locatie ondernemers. LTV eerste jaar installateur: €4.000–12.000.',
    cta: 'Domineer uw markt →',
  },
];

// Premium formaten: bovenop het maandabonnement (niet van toepassing op Stad)
const FORMAT_UPGRADES = [
  { label: 'A6 enkel­zijdig (standaard)', extra: '€0,00 extra' },
  { label: 'A6 dubbelzijdig', extra: '+€0,10/stuk' },
  { label: 'A5 enkel­zijdig', extra: '+€0,18/stuk' },
  { label: 'A5 dubbelzijdig', extra: '+€0,28/stuk' },
];

function fmt(n: number) {
  return n.toLocaleString('nl', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const [showFormats, setShowFormats] = useState(false);

  return (
    <section id="prijzen" style={{ background: 'var(--ink)', padding: '100px 40px' }}>
      <style>{`
        @media (max-width: 768px) {
          .pricing-grid { grid-template-columns: 1fr !important; }
          .pricing-section { padding: 60px 20px !important; }
          .pricing-toggle { flex-wrap: wrap; gap: 8px !important; }
          .format-grid { grid-template-columns: 1fr 1fr !important; }
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
            Abonnementen · Nieuwe bewoners
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>
            Welke positie wilt u innemen<br />
            <em style={{ color: 'rgba(255,255,255,.35)' }}>in uw buurt?</em>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)', maxWidth: '560px', margin: '0 auto 32px' }}>
            U betaalt een vast maandbedrag — alle nieuwe bewoners in uw postcodes zijn inbegrepen. Geen verassingen. Minimum 300 flyers per batch voor gegarandeerd rendement.
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
                −25%
              </span>
            </button>
          </div>
          {yearly && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: 'var(--font-mono)' }}>
              25% korting · per jaar vooruit gefactureerd
            </div>
          )}
        </div>

        {/* Tier cards */}
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', alignItems: 'start', marginTop: '32px' }}>
          {TIERS.map(t => {
            // Proefbatch is altijd zichtbaar, jaarlijks toggle heeft geen effect
            const showYearly = yearly && !t.isOneTime && t.yearly !== null;
            const price = showYearly ? t.yearly! : t.monthly;

            return (
              <div key={t.name} style={{
                border: t.hero ? '2px solid var(--green)' : t.isOneTime ? '1px solid rgba(0,232,122,0.25)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius)',
                padding: '24px 20px',
                background: t.hero ? 'rgba(0,232,122,0.04)' : t.isOneTime ? 'rgba(0,232,122,0.02)' : 'rgba(255,255,255,0.03)',
                position: 'relative',
              }}>
                {t.hero && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Meest gekozen
                  </div>
                )}
                {t.isOneTime && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,232,122,0.15)', border: '1px solid rgba(0,232,122,0.3)', color: 'var(--green)', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Instap · geen abonnement
                  </div>
                )}

                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: t.hero ? 'var(--green)' : t.isOneTime ? 'var(--green)' : 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {t.tier}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginBottom: '16px' }}>{t.sub}</div>

                {/* Postcode badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: t.hero ? 'var(--green)' : '#fff', fontFamily: 'var(--font-mono)' }}>{t.pc4s}</span>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>
                    {t.isOneTime ? 'postcodes · 1 batch' : 'postcodegebieden'}
                  </span>
                </div>

                {/* Price */}
                <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    €{price}
                  </span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', paddingBottom: '4px' }}>
                    {t.isOneTime ? 'eenmalig' : '/maand'}
                  </span>
                  {showYearly && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)', paddingBottom: '5px' }}>−25%</span>
                  )}
                </div>

                {!t.isOneTime && (
                  showYearly ? (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                      €{fmt(t.yearlyTotal!)} per jaar vooruit · was €{t.monthly * 12}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                      maandelijks opzegbaar
                    </div>
                  )
                )}

                {/* Min flyers note */}
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
                  Min. 300 flyers · A6 standaard inbegrepen
                </div>

                {/* Features */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {t.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>✓</span>
                      <span style={{ fontSize: '11px', color: t.hero ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}

                  {t.extraFeatures.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '2px' }}>
                      <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>★</span>
                      <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}

                  {/* Jaarlijkse bonus features */}
                  {t.yearlyFeatures.length > 0 && (
                    showYearly ? (
                      t.yearlyFeatures.map(f => (
                        <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                          <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>★</span>
                          <span style={{ fontSize: '11px', color: 'var(--green)', fontWeight: 700, lineHeight: 1.4 }}>{f}</span>
                        </div>
                      ))
                    ) : (
                      t.yearlyFeatures.map(f => (
                        <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                          <span style={{ color: 'rgba(255,255,255,.15)', flexShrink: 0, fontSize: '12px' }}>★</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', lineHeight: 1.4 }}>{f} <em>(bij jaarcontract)</em></span>
                        </div>
                      ))
                    )
                  )}
                </div>

                {/* Break-even note */}
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: '16px', fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                  {t.breakEven}
                </div>

                <div className="pricing-cta">
                  <Link href="/login" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', padding: t.hero ? '12px 16px' : '11px 16px',
                    minHeight: '48px', lineHeight: '1.4',
                    background: t.hero ? 'var(--green)' : t.isOneTime ? 'rgba(0,232,122,0.12)' : 'transparent',
                    border: t.hero ? 'none' : t.isOneTime ? '1px solid rgba(0,232,122,0.35)' : '1px solid rgba(255,255,255,0.2)',
                    color: t.hero ? 'var(--ink)' : t.isOneTime ? 'var(--green)' : '#fff',
                    textDecoration: 'none', borderRadius: 'var(--radius)',
                    fontWeight: t.hero ? 800 : 700, fontSize: '13px',
                  }}>
                    {t.cta}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Formaat toeslag uitklapper */}
        <div style={{ marginTop: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <button
            onClick={() => setShowFormats(v => !v)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-mono)' }}>
              Wilt u een groter formaat? Premium formaten zijn beschikbaar als toeslag op Buurt en Wijk. Stad heeft alle formaten zonder toeslag.
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '12px' }}>{showFormats ? '▲' : '▼'}</span>
          </button>
          {showFormats && (
            <div className="format-grid" style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {FORMAT_UPGRADES.map(f => (
                <div key={f.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12px', color: '#fff', marginBottom: '4px' }}>{f.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{f.extra}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)' }}>
          Alle prijzen excl. BTW · {yearly ? 'Jaarcontract: per jaar vooruit gefactureerd, niet tussentijds opzegbaar' : 'Maandelijks contract: per maand opzegbaar'} · A6 enkel­zijdig standaard in elk pakket · Premium formaten = toeslag per verstuurd stuk (niet bij Stad)
        </div>
      </div>
    </section>
  );
}
