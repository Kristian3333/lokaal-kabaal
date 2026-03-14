'use client';
import Link from 'next/link';
import { useState } from 'react';

const TICKERS = [
  "🟢 Kapper Bloemendaal — 340 flyers verstuurd",
  "🟢 Pizzeria Oost — campagne gestart",
  "🟢 Yoga Utrecht — 12 nieuwe klanten",
  "🟢 Bakkerij Den Haag — campagne verlengd",
  "🟢 Restaurant Noord — regio exclusief geboekt",
  "🟢 Nagelstudio Haarlem — 890 bezorgd",
  "🟢 Slagerij Leiden — 3e maand actief",
  "🟢 Rijschool Eindhoven — 44 nieuwe leerlingen",
];

export default function Landing() {
  const [email, setEmail] = useState('');
  const [ww, setWw] = useState('');

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--ink)', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: '52px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '26px', height: '26px', background: 'var(--green)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 12 12" fill="none" width="12" height="12">
              <path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" fill="#0A0A0A" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#fff', letterSpacing: '-.02em' }}>
            Lokaal<span style={{ color: 'var(--green)' }}>Kabaal</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <a href="#hoe" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Hoe werkt het</a>
          <a href="#prijzen" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Prijzen</a>
          <Link href="/login" style={{
            fontSize: '12px', color: 'rgba(255,255,255,.6)',
            textDecoration: 'none', fontFamily: 'var(--font-mono)',
          }}>Inloggen</Link>
          <Link href="/login" style={{
            padding: '7px 16px', background: 'var(--green)', color: 'var(--ink)',
            borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: 700,
            textDecoration: 'none',
          }}>Gratis starten</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        paddingTop: '140px', paddingBottom: '100px',
        maxWidth: '1080px', margin: '0 auto', padding: '140px 40px 100px',
        display: 'grid', gridTemplateColumns: '1fr 420px', gap: '80px', alignItems: 'center',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '7px',
            padding: '4px 12px', background: 'var(--green-bg)',
            border: '1px solid rgba(0,232,122,0.2)', borderRadius: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)',
            marginBottom: '24px',
          }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
            Actief in heel Nederland
          </div>
          <h1 style={{
            fontFamily: 'var(--font-serif)', fontSize: '52px', lineHeight: 1.1,
            fontWeight: 400, marginBottom: '20px', color: 'var(--ink)',
          }}>
            Bereik nieuwe bewoners<br />
            <em style={{ color: 'var(--muted)', fontStyle: 'italic' }}>vóór je concurrent</em>
          </h1>
          <p style={{
            fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7,
            maxWidth: '480px', marginBottom: '36px',
          }}>
            Elke maand verhuizen <strong style={{ color: 'var(--ink)' }}>17.000 huishoudens</strong> in Nederland.
            De eerste 30 dagen kiezen ze hun vaste kapper, bakker en restaurant.
            Wij sturen jouw flyer als eerste — automatisch, exclusief, op adres.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/login" style={{
              padding: '13px 28px', background: 'var(--ink)', color: '#fff',
              borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px',
              textDecoration: 'none', display: 'inline-block',
            }}>Start gratis →</Link>
            <a href="#hoe" style={{
              padding: '13px 20px', color: 'var(--muted)',
              fontSize: '13px', textDecoration: 'none',
            }}>Hoe werkt het?</a>
          </div>
          <div style={{ display: 'flex', gap: '28px', marginTop: '40px' }}>
            {[['17.000+', 'verhuizingen/maand'], ['heel NL', 'dekking'], ['250', 'flyers minimum']].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green)' }}>{n}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* INLOG KAART */}
        <div style={{
          background: '#fff', border: '1px solid var(--line)',
          borderRadius: '4px', padding: '36px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
        }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '6px' }}>
            Direct beginnen
          </div>
          <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '24px', lineHeight: 1.6 }}>
            Maak een account of log in. Elk e-mailadres en wachtwoord werkt.
          </p>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '.09em', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
            }}>E-mailadres</label>
            <input
              type="email" placeholder="jij@bedrijf.nl"
              value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--line)',
                borderRadius: 'var(--radius)', fontSize: '13px', outline: 'none',
                fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              fontSize: '10px', fontWeight: 600, color: 'var(--muted)',
              letterSpacing: '.09em', textTransform: 'uppercase',
              fontFamily: 'var(--font-mono)', display: 'block', marginBottom: '5px',
            }}>Wachtwoord</label>
            <input
              type="password" placeholder="••••••••"
              value={ww} onChange={e => setWw(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--line)',
                borderRadius: 'var(--radius)', fontSize: '13px', outline: 'none',
                fontFamily: 'var(--font-mono)', boxSizing: 'border-box',
              }}
            />
          </div>
          <Link href="/app" style={{
            display: 'block', width: '100%', padding: '12px',
            background: 'var(--green)', color: 'var(--ink)',
            borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px',
            textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box',
          }}>
            Aan de slag →
          </Link>
          <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: '14px', fontFamily: 'var(--font-mono)' }}>
            Geen creditcard nodig · Gratis te proberen
          </p>
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow: 'hidden', background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
        <div className="ticker-inner" style={{ whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS].map((item, i) => (
            <span key={i} style={{
              display: 'inline-block', padding: '0 40px',
              fontSize: '11px', fontFamily: 'var(--font-mono)',
              color: 'rgba(255,255,255,0.4)',
            }}>{item}</span>
          ))}
        </div>
      </div>

      {/* HOE WERKT HET */}
      <section id="hoe" style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Hoe het werkt</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, marginBottom: '12px' }}>Drie stappen naar <em>vaste klanten</em></h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>Geen gedoe. Geen leads kopen. Gewoon jouw flyer bij de nieuwe buren.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {[
            { n: '01', titel: 'Kies je werkgebied & branche', tekst: 'Voer je postcode in en kies een straal. Wij selecteren automatisch alle PC4-gebieden die je raakt — actief in heel Nederland.' },
            { n: '02', titel: 'Upload je flyer', tekst: 'Gebruik onze editor of upload je eigen ontwerp. Onze AI schrijft de tekst op basis van jouw huisstijl.' },
            { n: '03', titel: 'Wij bezorgen automatisch', tekst: 'Elke overdracht in het Kadaster triggert een verzending. Jouw flyer ligt binnen 5 werkdagen in de brievenbus.' },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '16px' }}>{s.n}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, marginBottom: '10px' }}>{s.titel}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{s.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRIJZEN */}
      <section id="prijzen" style={{ background: 'var(--ink)', padding: '100px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Transparante prijzen</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>Per flyer. <em style={{ color: 'rgba(255,255,255,.4)' }}>Geen verborgen kosten.</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { label: 'Klein', prijs: '€0,59', sub: 'per flyer · A5 enkelvoudig', features: ['Vanaf 250 flyers', 'A5 formaat standaard', 'Heel Nederland', 'Bezorging op de 25e', 'Kadaster-data targeting'] },
              { label: 'Groei', prijs: '€0,49', sub: 'per flyer · vanaf 500 stuks', aanbevolen: true, features: ['Vanaf 500 flyers', 'A5 of A4 formaat', 'Heel Nederland', 'Bezorging op de 25e', 'Kadaster-data targeting', 'Proef flyer optie'] },
              { label: 'Volume', prijs: '€0,39', sub: 'per flyer · vanaf 1000 stuks', features: ['Vanaf 1000 flyers', 'Alle formaten', 'Dubbelzijdig mogelijk', 'Bezorging op de 25e', 'Kadaster-data targeting', 'Proef flyer + rapportage'] },
            ].map(t => (
              <div key={t.label} style={{
                padding: '28px', borderRadius: 'var(--radius)',
                border: t.aanbevolen ? '1px solid var(--green)' : '1px solid rgba(255,255,255,0.1)',
                background: t.aanbevolen ? 'rgba(0,232,122,0.06)' : 'rgba(255,255,255,0.03)',
                position: 'relative',
              }}>
                {t.aanbevolen && (
                  <div style={{ position: 'absolute', top: '-1px', right: '16px', background: 'var(--green)', color: 'var(--ink)', fontSize: '9px', fontWeight: 700, padding: '2px 10px', borderRadius: '0 0 4px 4px', fontFamily: 'var(--font-mono)' }}>meest gekozen</div>
                )}
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: t.aanbevolen ? 'var(--green)' : 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>{t.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '36px', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: '4px' }}>{t.prijs}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>{t.sub}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {t.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--green)', fontSize: '12px' }}>✓</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.55)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" style={{
                  display: 'block', marginTop: '24px', padding: '10px',
                  background: t.aanbevolen ? 'var(--green)' : 'rgba(255,255,255,0.07)',
                  color: t.aanbevolen ? 'var(--ink)' : '#fff',
                  borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px',
                  textAlign: 'center', textDecoration: 'none',
                }}>
                  Begin met {t.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLYER VOORBEELDEN */}
      <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Flyervoorbeelden</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, marginBottom: '12px' }}>Zo ziet jouw flyer <em style={{ color: 'var(--muted)' }}>eruit</em></h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '480px', margin: '0 auto' }}>Kies een template of upload je eigen ontwerp. De AI schrijft de tekst op maat.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', alignItems: 'start' }}>
          {[
            { kleur: '#1C0F0A', accent: '#E8A020', label: 'Koffiebar', icon: '☕', naam: 'Koffiehuis de Hoek', slogan: 'Elke dag vers.', tekst: 'Net ingetrokken? Welkom in de buurt! Kom kennismaken en geniet van de beste koffie in de wijk. Bij een besteding van €20 of meer, krijg jij €5 korting.', usps: ['€5 welkomstkorting bij €20', 'Vers gezette specialty koffie', 'Je nieuwe stamkroeg'] },
            { kleur: '#14213D', accent: '#C8A97E', label: 'Meubelwinkel', icon: '🛋️', naam: 'Wonen & Zo', slogan: 'Jouw thuis, jouw stijl.', tekst: 'Een nieuw huis verdient een nieuw begin. Als nieuwe bewoner krijg je 10% welkomstkorting op je eerste aankoop. Kom langs en laat je verrassen.', usps: ['10% welkomstkorting', 'Grote showroom', 'Gratis levering in regio'] },
            { kleur: '#0D0D0D', accent: '#FF6B35', label: 'Stucadoor', icon: '🔨', naam: 'StucPro Regio', slogan: 'Strak. Snel. Lokaal.', tekst: 'Nieuwe woning, nieuwe muren. Of je nu wil stucen, schilderen of verbouwen — wij zijn dé vakman in jouw regio. Gratis offerte aan huis.', usps: ['Gratis offerte aan huis', 'Lokale vakman', 'Binnen 2 weken op locatie'] },
          ].map(t => (
            <div key={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              {/* Flyer card */}
              <div style={{
                width: '240px', height: '340px', background: t.kleur, borderRadius: '6px',
                overflow: 'hidden', position: 'relative', flexShrink: 0,
                boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
              }}>
                <div style={{ height: '5px', background: t.accent }} />
                <div style={{ padding: '16px 18px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', background: t.accent, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{t.icon}</div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '11px' }}>{t.naam}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', marginTop: '2px' }}>{t.slogan}</div>
                  </div>
                </div>
                <div style={{ padding: '4px 18px 12px' }}>
                  <div style={{ color: t.accent, fontFamily: 'var(--font-serif)', fontSize: '15px', fontStyle: 'italic', lineHeight: 1.3, marginBottom: '10px' }}>Welkom in de buurt!</div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '9px', lineHeight: 1.6, marginBottom: '12px' }}>{t.tekst}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {t.usps.map((u, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '14px', height: '14px', background: t.accent, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: t.kleur, fontSize: '8px', fontWeight: 700 }}>✓</span>
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '8px' }}>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 18px', borderTop: `1px solid ${t.accent}33`, background: 'rgba(0,0,0,0.3)' }}>
                  <div style={{ color: t.accent, fontSize: '8px', fontFamily: 'var(--font-mono)' }}>lokaalkabaal.nl · Jouw website hier</div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Template · aanpasbaar</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <Link href="/login" style={{ padding: '12px 28px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Maak jouw flyer →</Link>
        </div>
      </section>

      {/* BLOG PREVIEW */}
      <section style={{ background: 'var(--ink)', padding: '100px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px' }}>
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Kennis & Kabaal</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', margin: 0 }}>Onze kijk op <em style={{ color: 'rgba(255,255,255,.35)' }}>lokale marketing</em></h2>
            </div>
            <Link href="/blog" style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', textDecoration: 'none', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>Alle artikelen →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            {[
              { slug: 'eerste-kennismaking', cat: 'Marketing', titel: 'De Eerste Kennismaking: Jouw Flyer als Start van de Klantreis', datum: '1 feb 2026', min: '5 min' },
              { slug: 'digitale-moeheid', cat: 'Gedrag', titel: 'Digitale Moeheid: Fysiek heeft een Langere Houdbaarheid', datum: '8 feb 2026', min: '4 min' },
              { slug: 'hyperlokaal', cat: 'Strategie', titel: 'Hyperlokaal: Vertrouwen via Fysieke Aanwezigheid', datum: '10 mrt 2026', min: '5 min' },
            ].map(a => (
              <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.03)', height: '100%', boxSizing: 'border-box' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--green)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', background: 'rgba(0,232,122,0.1)', padding: '2px 8px', borderRadius: '2px' }}>{a.cat.toUpperCase()}</span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)' }}>{a.min}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', fontWeight: 400, color: '#fff', lineHeight: 1.25, marginBottom: '16px' }}>{a.titel}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)' }}>{a.datum}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400, marginBottom: '16px' }}>
          Klaar om nieuwe klanten<br /><em style={{ color: 'var(--muted)' }}>te verwelkomen?</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.65 }}>
          Start vandaag. Eerste campagne loopt binnen 48 uur.
        </p>
        <Link href="/login" style={{
          padding: '14px 36px', background: 'var(--ink)', color: '#fff',
          borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px',
          textDecoration: 'none', display: 'inline-block',
        }}>
          Gratis account aanmaken →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--line)', padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)',
      }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacybeleid</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Over ons</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
        </div>
      </footer>
    </div>
  );
}
