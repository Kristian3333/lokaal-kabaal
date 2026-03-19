'use client';
import Link from 'next/link';
import { useState } from 'react';

// ─── Pakket-definities ────────────────────────────────────────────────────────
//
// Print.one A6 bulktarief (300+ stuks): €0,69/stuk incl. bezorging
// Ons tarief: +30% premium boven reguliere flyerbezorging
// Minimum 300 flyers per batch (bulk-drempel voor kortingstarief)
//
// Buurt:  10 pc4  · min. 300 flyers/batch
// Wijk:   50 pc4  · min. 300 flyers/batch
// Stad:   onbeperkt · min. 300 flyers/batch · A/B test min. 600 (300+300)

const TIERS = [
  {
    tier: 'Tier 1',
    name: 'Buurt',
    sub: 'Uw eerste vaste klanten werven',
    monthly: 249,
    yearly: 187,
    yearlyTotal: 2244,
    pc4s: '10',
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
      'Follow-up flyer: 2e kaart na 30 dagen voor niet-gescande QR\'s · tegen kostprijs print.one',
    ],
    noFeatures: [
      'Geen exclusiviteitsgarantie',
      'Geen A/B testen',
    ],
    exclusive: null,
    hero: false,
    breakEven: 'Break-even: 1 nieuwe vaste klant per kwartaal dekt de jaarkost.',
    cta: 'Start met Buurt →',
  },
  {
    tier: 'Tier 2',
    name: 'Wijk',
    sub: 'De vaste naam in de buurt worden',
    monthly: 499,
    yearly: 374,
    yearlyTotal: 4488,
    pc4s: '50',
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
    ],
    yearlyFeatures: [
      'Follow-up flyer: 2e kaart na 30 dagen voor niet-gescande QR\'s · tegen kostprijs print.one',
    ],
    noFeatures: [
      'Geen exclusiviteitsgarantie',
      'Geen A/B testen',
    ],
    exclusive: null,
    hero: true,
    breakEven: 'Break-even: 1 nieuwe vaste klant per 2 maanden. Typische return: 8–12×.',
    cta: 'Claim uw wijkpositie →',
  },
  {
    tier: 'Tier 3',
    name: 'Stad',
    sub: 'Categorie-eigenaar in uw verzorgingsgebied',
    monthly: 999,
    yearly: 749,
    yearlyTotal: 8988,
    pc4s: '∞',
    features: [
      'Onbeperkt postcodegebieden actief',
      'Min. 300 flyers per batch · onbeperkt batches',
      'Standaard A6 · print + bezorging inbegrepen',
      'Onbeperkt flyer-templates + AI auto-selectie',
      'QR-code scanning + gepersonaliseerde welkomstpagina',
      'Real-time dashboard',
    ],
    extraFeatures: [
      'A/B testen (min. 600 flyers: 300 per variant)',
    ],
    yearlyFeatures: [
      'Follow-up flyer: 2e kaart na 30 dagen voor niet-gescande QR\'s · tegen kostprijs print.one',
      'Persoonlijke flyerhulp inbegrepen',
    ],
    noFeatures: [] as string[],
    exclusive: 'Exclusiviteit per postcode, per branche',
    hero: false,
    breakEven: 'Voor installateurs en multi-locatie ondernemers met groter bereik.',
    cta: 'Domineer uw markt →',
  },
];

// Premium formaten: bovenop het maandabonnement
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
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '3px' }}>
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

        {/* Exclusivity bar — Stad only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', background: 'rgba(0,232,122,0.05)', margin: '28px 0 32px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
            <strong style={{ color: '#fff' }}>Exclusiviteitsbeveiliging (Stad-pakket):</strong> zodra u een postcode claimt, verstuurt geen enkele andere ondernemer in uw branche daar nog een flyer via LokaalKabaal. Als een postcodegebied bezet is, ontvangt u een melding met de bezettingsperiode.
          </span>
        </div>

        {/* Tier cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>
          {TIERS.map(t => (
            <div key={t.name} style={{
              border: t.hero ? '2px solid var(--green)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius)',
              padding: '28px 24px',
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
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginBottom: '20px' }}>{t.sub}</div>

              {/* Postcode badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 700, color: t.hero ? 'var(--green)' : '#fff', fontFamily: 'var(--font-mono)' }}>{t.pc4s}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>postcodegebieden</span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  €{yearly ? t.yearly : t.monthly}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.3)', paddingBottom: '4px' }}>/maand</span>
                {yearly && (
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--green)', fontFamily: 'var(--font-mono)', paddingBottom: '5px' }}>−25%</span>
                )}
              </div>

              {yearly ? (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                  €{fmt(t.yearlyTotal)} per jaar vooruit · was €{t.monthly * 12}
                </div>
              ) : (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>
                  maandelijks opzegbaar
                </div>
              )}

              {/* Min flyers note */}
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>
                Min. 300 flyers/batch · A6 standaard inbegrepen
              </div>

              {/* Features */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {t.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: t.hero ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}

                {/* Extra unieke features (groen gemarkeerd) */}
                {t.extraFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '2px' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>★</span>
                    <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 600, lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}

                {/* Exclusiviteit */}
                {t.exclusive && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>★</span>
                    <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, lineHeight: 1.4 }}>{t.exclusive}</span>
                  </div>
                )}

                {/* Jaarlijkse bonus features */}
                {t.yearlyFeatures.length > 0 && (
                  yearly ? (
                    t.yearlyFeatures.map(f => (
                      <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                        <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>★</span>
                        <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))
                  ) : (
                    t.yearlyFeatures.map(f => (
                      <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                        <span style={{ color: 'rgba(255,255,255,.15)', flexShrink: 0, fontSize: '12px' }}>★</span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.2)', lineHeight: 1.4 }}>{f} <em>(bij jaarcontract)</em></span>
                      </div>
                    ))
                  )
                )}

                {/* Niet-inbegrepen features */}
                {t.noFeatures.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'rgba(255,255,255,.2)', flexShrink: 0, fontSize: '12px' }}>—</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.2)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Break-even note */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius)', padding: '10px 12px', marginBottom: '20px', fontSize: '11px', color: 'rgba(255,255,255,.35)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                {t.breakEven}
              </div>

              <Link href="/login" style={{
                display: 'block', textAlign: 'center', padding: t.hero ? '12px 16px' : '11px 16px',
                background: t.hero ? 'var(--green)' : 'transparent',
                border: t.hero ? 'none' : '1px solid rgba(255,255,255,0.2)',
                color: t.hero ? 'var(--ink)' : '#fff',
                textDecoration: 'none', borderRadius: 'var(--radius)',
                fontWeight: t.hero ? 800 : 700, fontSize: '13px',
              }}>
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Formaat toeslag uitklapper */}
        <div style={{ marginTop: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <button
            onClick={() => setShowFormats(v => !v)}
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: 'none', cursor: 'pointer', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-mono)' }}>
              Wilt u een groter formaat? Premium formaten zijn beschikbaar als toeslag op elk pakket.
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)' }}>{showFormats ? '▲' : '▼'}</span>
          </button>
          {showFormats && (
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
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
          Alle prijzen excl. BTW · {yearly ? 'Jaarcontract: per jaar vooruit gefactureerd, niet tussentijds opzegbaar' : 'Maandelijks contract: per maand opzegbaar'} · A6 enkel­zijdig standaard in elk pakket · Premium formaten = toeslag per verstuurd stuk
        </div>
      </div>
    </section>
  );
}
