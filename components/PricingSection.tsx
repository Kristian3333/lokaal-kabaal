'use client';
import Link from 'next/link';
import { useState } from 'react';

// ─── Pakket-definities ────────────────────────────────────────────────────────
//
// Print.one A6 bulktarief (≥300 stuks): €0,69/stuk incl. druk + PostNL-bezorging
// Abonnement dekt service, automatisering, postcodedata en campagnebeheer.
//
// Starter:  1 campagne  · €99/m  · €891/jaar  (= €74,25/m)
// Pro:      3 campagnes · €199/m · €1.791/jaar (= €149,25/m)
// Agency:   Onbeperkt   · €499/m · €4.491/jaar (= €374,25/m)

const TIERS = [
  {
    tier: 'Starter',
    sub: 'Eén campagne testen',
    monthly: 99,
    yearly: 74.25,
    yearlyTotal: 891,
    maxCampaigns: '1',
    maxPc4s: '40',
    hero: false,
    features: [
      '1 gelijktijdige campagne',
      'Tot 40 postcodegebieden per campagne',
      'Max. 250 km werkgebiedstraal',
      'A6 standaard · print + bezorging: €0,69/stuk',
      'Onbeperkt flyer-templates',
      'QR-code scanning · conversieregistratie per adres',
      'Maandelijks rapport',
    ],
    lockedFeatures: [
      'Doelgroepfilters (bouwjaar, WOZ, energielabel)',
    ],
    extraFeatures: [] as string[],
    cta: 'Start gratis proef →',
    breakEven: 'Break-even: 1 nieuwe vaste klant per kwartaal dekt de jaarkost.',
  },
  {
    tier: 'Pro',
    sub: 'Meerdere campagnes, slimme targeting',
    monthly: 199,
    yearly: 149.25,
    yearlyTotal: 1791,
    maxCampaigns: '3',
    maxPc4s: '80',
    hero: true,
    features: [
      '3 gelijktijdige campagnes',
      'Tot 80 postcodegebieden per campagne',
      'Max. 250 km werkgebiedstraal',
      'A6 standaard · print + bezorging: €0,69/stuk',
      'Onbeperkt flyer-templates',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Wekelijks rapport + statistieken',
      'Follow-up flyer (na 30 dagen bij niet-scan)',
    ],
    lockedFeatures: [] as string[],
    extraFeatures: [
      'Doelgroepfilters: bouwjaar, WOZ-waarde, energielabel',
    ],
    cta: 'Claim uw positie →',
    breakEven: 'Break-even: 1 nieuwe vaste klant per 2 maanden. Typisch rendement: 8–12×.',
  },
  {
    tier: 'Agency',
    sub: 'Onbeperkt campagnes, volledige controle',
    monthly: 499,
    yearly: 374.25,
    yearlyTotal: 4491,
    maxCampaigns: '∞',
    maxPc4s: '∞',
    hero: false,
    features: [
      'Onbeperkt gelijktijdige campagnes',
      'Onbeperkt postcodegebieden per campagne',
      'Max. 250 km werkgebiedstraal',
      'A6 + grotere formaten (toeslag) · €0,69/stuk',
      'Onbeperkt flyer-templates + AI auto-selectie',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Real-time dashboard',
      'Follow-up flyer + A/B testen (min. 600 flyers)',
      'Doelgroepfilters: bouwjaar, WOZ-waarde, energielabel',
    ],
    lockedFeatures: [] as string[],
    extraFeatures: [
      'Persoonlijke flyerhulp (bij jaarcontract)',
    ],
    cta: 'Domineer uw markt →',
    breakEven: 'Voor installateurs en multi-locatie ondernemers. LTV eerste jaar: €4.000–12.000.',
  },
];

// Print.one formaat toeslagen (additief op €0,69 basistartief)
const FORMAT_UPGRADES = [
  { label: 'A6 enkelvoudig (standaard)', extra: '€0,69/stuk', surcharge: '—' },
  { label: 'A6 dubbelzijdig',            extra: '€0,79/stuk', surcharge: '+€0,10' },
  { label: 'A5 enkelvoudig',             extra: '€0,87/stuk', surcharge: '+€0,18' },
  { label: 'A5 dubbelzijdig',            extra: '€0,97/stuk', surcharge: '+€0,28' },
  { label: 'Vierkant enkelvoudig',        extra: '€0,88/stuk', surcharge: '+€0,19' },
  { label: 'Vierkant dubbelzijdig',       extra: '€0,98/stuk', surcharge: '+€0,29' },
];

function fmt(n: number) {
  return n.toLocaleString('nl', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            Abonnementen · Nieuwe woningeigenaren
          </div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>
            Bereik nieuwe bewoners<br />
            <em style={{ color: 'rgba(255,255,255,.35)' }}>automatisch, elke maand</em>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)', maxWidth: '580px', margin: '0 auto 16px' }}>
            Het abonnement dekt service, automatisering en campagnebeheer. Printkosten komen daar bovenop:{' '}
            <strong style={{ color: 'rgba(255,255,255,.6)' }}>€0,69 per flyer</strong> incl. druk en PostNL-bezorging — bij minimaal 300 stuks.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,200,0,0.07)', border: '1px solid rgba(255,200,0,0.18)', borderRadius: '8px', padding: '8px 16px', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,200,80,0.8)', fontFamily: 'var(--font-mono)' }}>
              Voorbeeld Pro: €199/mnd service + 400 flyers × €0,69 = <strong>€475/mnd totaal</strong>
            </span>
          </div>

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
              25% korting · per jaar vooruit gefactureerd · niet tussentijds opzegbaar
            </div>
          )}
        </div>

        {/* Tier cards */}
        <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start', marginTop: '32px' }}>
          {TIERS.map(t => {
            const price = yearly ? t.yearly : t.monthly;

            return (
              <div key={t.tier} style={{
                border: t.hero ? '2px solid var(--green)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius)',
                padding: '24px 20px',
                background: t.hero ? 'rgba(0,232,122,0.04)' : 'rgba(255,255,255,0.03)',
                position: 'relative',
              }}>
                {t.hero && (
                  <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    Meest gekozen
                  </div>
                )}

                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: t.hero ? 'var(--green)' : 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  {t.tier}
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>{t.tier}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginBottom: '16px' }}>{t.sub}</div>

                {/* Badges: campagnes + postcodes */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: t.hero ? 'var(--green)' : '#fff', fontFamily: 'var(--font-mono)' }}>{t.maxCampaigns}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>
                      {t.maxCampaigns === '1' ? 'campagne' : 'campagnes'}
                    </span>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: t.hero ? 'var(--green)' : '#fff', fontFamily: 'var(--font-mono)' }}>{t.maxPc4s}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>pc4's</span>
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
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)', paddingBottom: '5px' }}>−25%</span>
                  )}
                </div>

                {/* Printkosten note */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: '4px', padding: '3px 8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,200,80,0.85)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    + €0,69/flyer printkosten apart
                  </span>
                </div>

                {/* Yearly total */}
                {yearly ? (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    €{t.yearlyTotal.toLocaleString('nl')} per jaar vooruit · was €{(t.monthly * 12).toLocaleString('nl')}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                    maandelijks opzegbaar
                  </div>
                )}

                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>
                  Min. 300 flyers per batch · A6 standaard · betaling per incasso op de 25e
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

                  {t.lockedFeatures.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '2px', opacity: 0.4 }}>
                      <span style={{ flexShrink: 0, fontSize: '12px' }}>🔒</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
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
                    background: t.hero ? 'var(--green)' : 'transparent',
                    border: t.hero ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    color: t.hero ? 'var(--ink)' : '#fff',
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
              Groter formaat gewenst? Alle formaten en toeslagen — voor alle abonnementen.
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginLeft: '12px' }}>{showFormats ? '▲' : '▼'}</span>
          </button>
          {showFormats && (
            <div className="format-grid" style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {FORMAT_UPGRADES.map(f => (
                <div key={f.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '10px 12px' }}>
                  <div style={{ fontSize: '12px', color: '#fff', marginBottom: '4px' }}>{f.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--green)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{f.extra}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{f.surcharge !== '—' ? `toeslag: ${f.surcharge}/stuk` : 'basistartief'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaign duration info */}
        <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '6px' }}>CAMPAGNEDUUR</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Kies 1–24 maanden. Elke 25e van de maand gaat een batch de deur uit.</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '6px' }}>BETALING INCASSO</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Automatische incasso op de 25e · abonnement + flyers op één factuur.</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '0.1em', marginBottom: '6px' }}>CREDITS</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>Surplus flyers worden als credits bijgeschreven en automatisch verrekend.</div>
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)' }}>
          Alle prijzen excl. BTW · Abonnement = service + automatisering · Printkosten €0,69/stuk apart · {yearly ? 'Jaarcontract: per jaar vooruit, niet tussentijds opzegbaar' : 'Maandelijks opzegbaar'} · Min. 250 km maximale werkgebiedstraal
        </div>
      </div>
    </section>
  );
}
