'use client';
import Link from 'next/link';
import { useState } from 'react';

function QrCode({ fg, bg, size }: { fg: string; bg: string; size: number }) {
  const u = size / 21;
  const pts = [
    [8,0],[10,0],[12,0],[9,1],[11,1],[8,2],[12,2],[9,3],[11,3],[8,4],[10,4],[12,4],[9,5],[11,5],
    [0,8],[2,8],[4,8],[1,9],[3,9],[0,10],[4,10],[2,10],[1,11],[3,11],[0,12],[2,12],[4,12],
    [8,8],[10,8],[13,8],[15,8],[17,8],[19,8],[9,9],[12,9],[14,9],[16,9],[18,9],[20,9],
    [8,10],[11,10],[13,10],[17,10],[19,10],[9,11],[10,11],[14,11],[16,11],[18,11],[20,11],
    [8,12],[12,12],[14,12],[16,12],[18,12],[9,13],[11,13],[15,13],[17,13],[19,13],
    [8,14],[10,14],[12,14],[16,14],[18,14],[20,14],[9,15],[11,15],[13,15],[17,15],[19,15],
    [8,16],[10,16],[14,16],[18,16],[20,16],[9,17],[13,17],[15,17],[17,17],[19,17],
    [8,18],[12,18],[14,18],[16,18],[20,18],[9,19],[11,19],[15,19],[17,19],[19,19],
    [8,20],[10,20],[12,20],[16,20],[18,20],
  ];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      <rect width={size} height={size} fill={bg}/>
      <rect x={0} y={0} width={u*7} height={u} fill={fg}/><rect x={0} y={u} width={u} height={u*5} fill={fg}/><rect x={u*6} y={u} width={u} height={u*5} fill={fg}/><rect x={0} y={u*6} width={u*7} height={u} fill={fg}/><rect x={u*2} y={u*2} width={u*3} height={u*3} fill={fg}/>
      <rect x={u*14} y={0} width={u*7} height={u} fill={fg}/><rect x={u*14} y={u} width={u} height={u*5} fill={fg}/><rect x={u*20} y={u} width={u} height={u*5} fill={fg}/><rect x={u*14} y={u*6} width={u*7} height={u} fill={fg}/><rect x={u*16} y={u*2} width={u*3} height={u*3} fill={fg}/>
      <rect x={0} y={u*14} width={u*7} height={u} fill={fg}/><rect x={0} y={u*15} width={u} height={u*5} fill={fg}/><rect x={u*6} y={u*15} width={u} height={u*5} fill={fg}/><rect x={0} y={u*20} width={u*7} height={u} fill={fg}/><rect x={u*2} y={u*16} width={u*3} height={u*3} fill={fg}/>
      {pts.map(([x, y], i) => <rect key={i} x={u*x} y={u*y} width={u} height={u} fill={fg}/>)}
    </svg>
  );
}

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
  const [flipped, setFlipped] = useState<number | null>(null);

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
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Nieuwe bewoners</Link>
          <Link href="/direct-mail-mkb" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Direct mail</Link>
          <a href="#prijzen" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Prijzen</a>
          <Link href="/blog" style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>Blog</Link>
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

      {/* DIENSTEN */}
      <section style={{ padding: '80px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Wat wij doen</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400 }}>Twee manieren om <em style={{ color: 'var(--muted)' }}>nieuwe klanten te bereiken</em></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px', background: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 13L6 3h4l4 10" stroke="var(--green-dim)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 9h8" stroke="var(--green-dim)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Nieuwe bewoners</div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.2 }}>Flyers naar nieuwe huiseigenaren</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Altum registreert elke maand alle eigendomsoverdrachten in Nederland. LokaalKabaal verstuurt automatisch op de 25e een gepersonaliseerde flyer naar elke nieuwe bewoner in uw postcodes — precies in het venster dat ze hun vaste leveranciers kiezen.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['Maandelijks automatisch', 'Exclusief per branche/pc', '€69–€299/maand'].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: '3px' }}>{tag}</span>
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Bekijk abonnementen →</span>
          </Link>

          <Link href="/direct-mail-mkb" style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px', background: '#fff' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line)'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="4" width="12" height="9" rx="1.5" stroke="var(--ink)" strokeWidth="1.5"/><path d="M2 7h12" stroke="var(--ink)" strokeWidth="1.5"/><path d="M5 2l-1 2M11 2l1 2" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Direct mail MKB</div>
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.2 }}>Bulk direct mail voor lokaal MKB</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Stuur flyers naar een zelfgekozen doelgebied: op straatniveau, wijkniveau of heel Nederland. Geen abonnement, geen minimumcontract. Upload uw ontwerp, kies postcodes, wij regelen print en bezorging via PostNL.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['Per campagne', 'Eigen postcodeselectie', 'Vanaf €0,69/stuk'].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: '3px' }}>{tag}</span>
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Meer over direct mail →</span>
          </Link>
        </div>
      </section>

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
            { n: '03', titel: 'Elke 25e automatisch verstuurd', tekst: 'Altum publiceert op de 20e alle nieuwe eigendomsoverdrachten. Wij verwerken ze en sturen op de 25e een bulkorder — jouw flyer ligt bij elke nieuwe bewoner binnen hun eerste maand.' },
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
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Transparante prijzen</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>Platform + flyers. <em style={{ color: 'rgba(255,255,255,.4)' }}>Twee aparte kosten.</em></h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>Kies welke features je nodig hebt. Betaal flyers apart op basis van formaat en aantallen.</p>
          </div>
          {/* ── Deel 1: Platform-pakketten ── */}
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>① Platform — jaarlijks vast bedrag</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '48px' }}>
            {[
              {
                naam: 'Gratis',
                prijs: '€0',
                sub: 'per jaar',
                badge: null,
                border: 'rgba(255,255,255,0.1)',
                bg: 'rgba(255,255,255,0.02)',
                features: ['Upload eigen ontwerp', 'Automatisch op de 25e', 'Heel Nederland', 'Kadaster-data targeting'],
                geen: ['AI design generator', 'QR-code conversietracking'],
                cta: 'Gratis starten',
                ctaBg: 'rgba(255,255,255,0.07)',
                ctaColor: '#fff',
              },
              {
                naam: 'Design',
                prijs: '€199',
                sub: 'per jaar · excl. BTW',
                badge: null,
                border: 'rgba(255,255,255,0.15)',
                bg: 'rgba(255,255,255,0.03)',
                features: ['Upload eigen ontwerp', 'AI design generator', 'Automatisch op de 25e', 'Heel Nederland', 'Kadaster-data targeting'],
                geen: ['QR-code conversietracking'],
                cta: 'Design starten',
                ctaBg: 'rgba(255,255,255,0.07)',
                ctaColor: '#fff',
              },
              {
                naam: 'Tracking',
                prijs: '€299',
                sub: 'per jaar · excl. BTW',
                badge: 'MEEST GEKOZEN',
                border: 'var(--green)',
                bg: 'rgba(0,232,122,0.04)',
                features: ['Upload eigen ontwerp', 'AI design generator', 'Automatisch op de 25e', 'Heel Nederland', 'Kadaster-data targeting', 'QR-code per flyer (uniek per adres)', 'Conversiedashboard — scan = klant'],
                geen: [],
                cta: 'Tracking starten',
                ctaBg: 'var(--green)',
                ctaColor: 'var(--ink)',
              },
            ].map(t => (
              <div key={t.naam} style={{ padding: '28px', borderRadius: 'var(--radius)', border: `1px solid ${t.border}`, background: t.bg, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                {t.badge && (
                  <div style={{ position: 'absolute', top: '-1px', right: '16px', background: 'var(--green)', color: 'var(--ink)', fontSize: '9px', fontWeight: 700, padding: '2px 10px', borderRadius: '0 0 4px 4px', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>{t.badge}</div>
                )}
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: t.badge ? 'var(--green)' : 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>{t.naam}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '38px', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: '2px' }}>{t.prijs}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)', marginBottom: '20px' }}>{t.sub}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '24px', flex: 1 }}>
                  {t.features.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--green)', fontSize: '11px', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                  {t.geen.map(f => (
                    <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'rgba(255,255,255,.15)', fontSize: '11px', flexShrink: 0, marginTop: '1px' }}>—</span>
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.2)', lineHeight: 1.4 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" style={{ display: 'block', padding: '10px', background: t.ctaBg, color: t.ctaColor, borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px', textAlign: 'center' as const, textDecoration: 'none' }}>
                  {t.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* ── Deel 2: Flyerkosten ── */}
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', textTransform: 'uppercase' as const, marginBottom: '16px' }}>② Flyerkosten — bovenop pakketprijs, per verstuurd exemplaar</div>
          <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Formaat', 'Afmeting', 'Papier', 'Prijs per stuk*'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left' as const, fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { formaat: 'A6', afmeting: '10 × 15 cm', papier: 'Matte of Glossy', prijs: '€0,69' },
                  { formaat: 'Postcard', afmeting: '15 × 15 cm', papier: 'Matte of Glossy', prijs: '€0,74' },
                  { formaat: 'A5', afmeting: '15 × 21 cm', papier: 'Matte of Glossy', prijs: '€0,79' },
                ].map((r, i) => (
                  <tr key={r.formaat} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>{r.formaat}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-mono)' }}>{r.afmeting}</td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,.5)' }}>{r.papier}</td>
                    <td style={{ padding: '14px 16px', fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--green)', fontWeight: 600 }}>{r.prijs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footnote + examples */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '0' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
              * Alle prijzen excl. BTW · 350 gsm MC coated, FSC-gecertificeerd<br />
              Volume korting mogelijk vanaf 5.000 flyers/maand — <Link href="/contact" style={{ color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>neem contact op</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '12px 18px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '.1em', marginBottom: '4px' }}>VOORBEELD — ÉÉN CAMPAGNE</div>
                <div style={{ fontSize: '13px', color: '#fff', marginBottom: '2px' }}>Tracking + 500 A5 flyers/mnd</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>€299/jaar + (500 × €0,79) = <span style={{ color: 'var(--green)' }}>€694/jaar</span></div>
              </div>
              <div style={{ border: '1px solid rgba(0,232,122,0.15)', borderRadius: 'var(--radius)', padding: '12px 18px', background: 'rgba(0,232,122,0.03)' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', marginBottom: '4px' }}>VOORBEELD — MEERDERE CAMPAGNES</div>
                <div style={{ fontSize: '13px', color: '#fff', marginBottom: '2px' }}>Design + 3 seizoenscampagnes à 300 A6/mnd</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)' }}>€199/jaar + 3×(300 × €0,73) = <span style={{ color: 'var(--green)' }}>€857/jaar</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLYER VOORBEELDEN */}
      <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Flyervoorbeelden</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, marginBottom: '12px' }}>Zo ziet jouw flyer <em style={{ color: 'var(--muted)' }}>eruit</em></h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '520px', margin: '0 auto' }}>Klik op een flyer om hem om te draaien. AI genereert jouw design — inclusief unieke QR-code per adres voor conversietracking.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', alignItems: 'start' }}>

          {/* Design 1: BREW. — Specialty Coffee */}
          {(() => {
            const dk = '#0D0B08', am = '#E8A020', cr = '#F2EDE2';
            const isFlipped = flipped === 0;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div onClick={() => setFlipped(isFlipped ? null : 0)} style={{ width: '240px', height: '340px', perspective: '1200px', cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)' }}>
                    {/* Front */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: dk, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', fontFamily: 'sans-serif' }}>
                      <div style={{ height: '5px', background: am }} />
                      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', letterSpacing: '0.14em' }}>BREW.</div>
                          <div style={{ fontSize: '6.5px', color: am, fontFamily: 'monospace', letterSpacing: '0.15em', marginTop: '1px' }}>SPECIALTY COFFEE</div>
                        </div>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: am, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 9 Q2 4 6.5 4 Q11 4 11 9" stroke="#0D0B08" strokeWidth="1.4" fill="none" strokeLinecap="round"/><rect x="1" y="9" width="11" height="1.5" rx="0.75" fill="#0D0B08"/><path d="M5 3.5 Q5 2 6.5 2 Q8 2 8 3.5" stroke="#0D0B08" strokeWidth="0.9" fill="none"/></svg>
                        </div>
                      </div>
                      <div style={{ padding: '6px 18px 14px' }}>
                        <div style={{ fontSize: '34px', color: '#fff', lineHeight: 0.98, fontWeight: 300, letterSpacing: '-0.03em', fontFamily: 'Georgia, serif' }}>Welkom,<br /><span style={{ color: am }}>buur.</span></div>
                        <div style={{ width: '28px', height: '2px', background: am, margin: '12px 0 10px' }} />
                        <div style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, fontFamily: 'monospace' }}>Net ingetrokken? Wij vieren dat graag<br />mee. Eerste koffie bij ons op rekening.</div>
                      </div>
                      {/* QR — prominent */}
                      <div style={{ margin: '0 14px', background: cr, borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '4px', flexShrink: 0 }}>
                          <QrCode fg={dk} bg="#fff" size={52} />
                        </div>
                        <div>
                          <div style={{ fontSize: '6px', color: '#888', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '3px' }}>SCAN &amp; CLAIM</div>
                          <div style={{ fontSize: '14px', fontWeight: 800, color: dk, lineHeight: 1.1 }}>1 koffie<br />gratis</div>
                          <div style={{ fontSize: '6.5px', color: '#777', marginTop: '4px', fontFamily: 'monospace' }}>eerste bezoek · t/m 31 dec</div>
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 18px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>Koffieplein 12, Amsterdam</span>
                        <span style={{ fontSize: '7px', color: am, fontFamily: 'monospace' }}>brew-coffee.nl</span>
                      </div>
                      <div style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '6.5px', color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace' }}>klik ↺</div>
                    </div>
                    {/* Back */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: cr, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', fontFamily: 'sans-serif' }}>
                      <div style={{ height: '5px', background: am }} />
                      <div style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: dk, letterSpacing: '0.1em' }}>BREW.</div>
                            <div style={{ fontSize: '6.5px', color: '#888', fontFamily: 'monospace' }}>specialty coffee · Amsterdam</div>
                          </div>
                          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: am, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 9 Q2 4 6.5 4 Q11 4 11 9" stroke="#0D0B08" strokeWidth="1.4" fill="none" strokeLinecap="round"/><rect x="1" y="9" width="11" height="1.5" rx="0.75" fill="#0D0B08"/></svg>
                          </div>
                        </div>
                        {[['📍','Koffieplein 12, Amsterdam'],['📞','020 – 555 12 34'],['🌐','brew-coffee.nl'],['✉','hallo@brew-coffee.nl']].map(([ic,v],i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '8px', width: '14px' }}>{ic}</span>
                            <span style={{ fontSize: '7px', color: dk, fontFamily: 'monospace' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ background: dk, borderRadius: '4px', padding: '8px 10px', marginTop: '8px' }}>
                          <div style={{ fontSize: '6.5px', color: am, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '5px' }}>OPENINGSTIJDEN</div>
                          {[['Ma – Vr','07:00 – 18:00'],['Za','08:00 – 17:00'],['Zo','09:00 – 15:00']].map(([d,t],i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.4)' }}>{d}</span>
                              <span style={{ fontSize: '7px', color: '#fff' }}>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: dk, padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <QrCode fg="#fff" bg={dk} size={30} />
                          <div>
                            <div style={{ fontSize: '6px', color: am, fontFamily: 'monospace', letterSpacing: '0.08em' }}>SCAN &amp; CLAIM</div>
                            <div style={{ fontSize: '8px', color: '#fff', fontWeight: 700 }}>1 gratis koffie</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>klik ↺</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Dark Premium</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Koffie · horeca · food</div>
                </div>
              </div>
            );
          })()}

          {/* Design 2: Studio Lente — Wellness / Salon */}
          {(() => {
            const bg2 = '#F7F2EB', gr = '#243D22', tc = '#C96B38';
            const isFlipped = flipped === 1;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div onClick={() => setFlipped(isFlipped ? null : 1)} style={{ width: '240px', height: '340px', perspective: '1200px', cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)' }}>
                    {/* Front */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: bg2, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: 'sans-serif' }}>
                      {/* Decorative circle */}
                      <div style={{ position: 'absolute', top: '-48px', right: '-48px', width: '160px', height: '160px', borderRadius: '50%', background: gr, opacity: 0.12 }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '80px', height: '80px', borderRadius: '50%', background: gr, opacity: 0.07 }} />
                      <div style={{ padding: '16px 18px 0' }}>
                        <div style={{ fontSize: '8px', fontFamily: 'monospace', letterSpacing: '0.16em', color: tc, textTransform: 'uppercase' as const, marginBottom: '16px' }}>Studio Lente · Amsterdam</div>
                        <div style={{ fontSize: '31px', color: gr, lineHeight: 1.05, fontFamily: 'Georgia, serif', fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: '8px' }}>Jouw haar,<br />jouw<br /><span style={{ color: tc }}>moment.</span></div>
                        <div style={{ width: '28px', height: '2px', background: tc, marginBottom: '10px' }} />
                        <div style={{ fontSize: '7.5px', color: '#666', lineHeight: 1.6, fontFamily: 'monospace', marginBottom: '14px' }}>Als nieuwe bewoner:<br />25% welkomstkorting op je eerste afspraak.</div>
                      </div>
                      {/* QR — prominent, green background */}
                      <div style={{ margin: '0 14px', background: gr, borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '4px', flexShrink: 0 }}>
                          <QrCode fg={gr} bg="#fff" size={52} />
                        </div>
                        <div>
                          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '3px' }}>SCAN &amp; BOEK</div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>25%<br />korting</div>
                          <div style={{ fontSize: '6.5px', color: tc, marginTop: '4px', fontFamily: 'monospace', fontWeight: 600 }}>nieuwe bewoners</div>
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 18px', borderTop: `1px solid rgba(36,61,34,0.1)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '7px', color: '#999', fontFamily: 'monospace' }}>Bloemstraat 4, Amsterdam</span>
                        <span style={{ fontSize: '7px', color: tc, fontFamily: 'monospace' }}>studiolente.nl</span>
                      </div>
                      <div style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '6.5px', color: 'rgba(0,0,0,0.18)', fontFamily: 'monospace' }}>klik ↺</div>
                    </div>
                    {/* Back */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: gr, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', fontFamily: 'sans-serif' }}>
                      <div style={{ height: '5px', background: tc }} />
                      <div style={{ padding: '14px 18px' }}>
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.12em' }}>STUDIO LENTE</div>
                          <div style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', marginTop: '2px' }}>Knippen · Kleuren · Behandeling</div>
                        </div>
                        {[['📍','Bloemstraat 4, Amsterdam'],['📞','020 – 321 98 76'],['🌐','studiolente.nl'],['✉','afspraak@studiolente.nl']].map(([ic,v],i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px', marginBottom: '6px' }}>
                            <span style={{ fontSize: '8px', width: '14px' }}>{ic}</span>
                            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace' }}>{v}</span>
                          </div>
                        ))}
                        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '4px', padding: '8px 10px', marginTop: '8px' }}>
                          <div style={{ fontSize: '6.5px', color: tc, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '5px' }}>DIENSTEN</div>
                          {['Knippen & föhnen','Haarkleur & highlights','Keratine behandeling','Bruid & special events'].map((s,i) => (
                            <div key={i} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '3px' }}>
                              <span style={{ color: tc, fontSize: '8px' }}>✓</span>
                              <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)' }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.25)', padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ background: '#fff', padding: '3px', borderRadius: '3px', flexShrink: 0 }}>
                            <QrCode fg={gr} bg="#fff" size={28} />
                          </div>
                          <div>
                            <div style={{ fontSize: '6px', color: tc, fontFamily: 'monospace', letterSpacing: '0.08em' }}>SCAN &amp; BOEK</div>
                            <div style={{ fontSize: '8px', color: '#fff', fontWeight: 700 }}>25% welkomstkorting</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>klik ↺</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Warm Editorial</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Salon · beauty · wellness</div>
                </div>
              </div>
            );
          })()}

          {/* Design 3: ProBouw — Installatie & Klus */}
          {(() => {
            const nv = '#0B1D35', or = '#E84D00', wh = '#FFFFFF';
            const isFlipped = flipped === 2;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <div onClick={() => setFlipped(isFlipped ? null : 2)} style={{ width: '240px', height: '340px', perspective: '1200px', cursor: 'pointer' }}>
                  <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)' }}>
                    {/* Front */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', background: wh, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', fontFamily: 'sans-serif' }}>
                      {/* Orange left edge */}
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: or }} />
                      {/* Navy header */}
                      <div style={{ background: nv, padding: '12px 18px 12px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>PROBOUW</div>
                          <div style={{ fontSize: '6.5px', color: or, fontFamily: 'monospace', letterSpacing: '0.12em', marginTop: '1px' }}>INSTALLATIE &amp; RENOVATIE</div>
                        </div>
                        <div style={{ border: `2px solid ${or}`, borderRadius: '3px', padding: '3px 6px', textAlign: 'center' as const }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>20+</div>
                          <div style={{ fontSize: '5.5px', color: or, fontFamily: 'monospace', lineHeight: 1.2 }}>JAAR</div>
                        </div>
                      </div>
                      <div style={{ padding: '14px 18px 10px 22px' }}>
                        <div style={{ fontSize: '8px', color: or, fontFamily: 'monospace', letterSpacing: '0.14em', marginBottom: '8px' }}>WELKOM IN JE NIEUWE WONING</div>
                        <div style={{ fontSize: '28px', fontWeight: 900, color: nv, lineHeight: 0.98, letterSpacing: '-0.02em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>Nieuwe<br />woning?<br /><span style={{ color: or }}>Wij<br />regelen</span><br />het.</div>
                        <div style={{ fontSize: '7.5px', color: '#555', fontFamily: 'monospace', lineHeight: 1.55, marginBottom: '10px' }}>Elektra · Gas · Water · Klussen<br />Gratis advies aan huis.</div>
                      </div>
                      {/* QR — prominent, orange background */}
                      <div style={{ margin: '0 14px 10px', background: or, borderRadius: '8px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#fff', padding: '4px', borderRadius: '4px', flexShrink: 0 }}>
                          <QrCode fg={nv} bg="#fff" size={52} />
                        </div>
                        <div>
                          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '2px' }}>SCAN &amp; PLAN</div>
                          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>Gratis<br />offerte</div>
                          <div style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.8)', marginTop: '3px', fontFamily: 'monospace' }}>binnen 24u reactie</div>
                        </div>
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 6, right: 0, padding: '7px 18px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '7px', color: '#888', fontFamily: 'monospace' }}>Nijverheidsweg 8, Utrecht</span>
                        <span style={{ fontSize: '7px', color: or, fontFamily: 'monospace' }}>probouw.nl</span>
                      </div>
                      <div style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '6.5px', color: 'rgba(0,0,0,0.18)', fontFamily: 'monospace' }}>klik ↺</div>
                    </div>
                    {/* Back */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: nv, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', fontFamily: 'sans-serif' }}>
                      <div style={{ height: '5px', background: or }} />
                      <div style={{ padding: '14px 18px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '0.1em' }}>PROBOUW</div>
                          <div style={{ fontSize: '6.5px', color: or, fontFamily: 'monospace', marginTop: '1px' }}>Jouw vakman in de regio</div>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '6.5px', color: or, fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '6px' }}>WAT WIJ DOEN</div>
                          {['Elektrische installaties','Gas & waterleiding','Badkamer & keuken renovatie','CV-ketel onderhoud','Zonnepanelen plaatsen'].map((s,i) => (
                            <div key={i} style={{ display: 'flex', gap: '7px', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ color: or, fontSize: '9px', fontWeight: 700 }}>▸</span>
                              <span style={{ fontSize: '7.5px', color: 'rgba(255,255,255,0.75)' }}>{s}</span>
                            </div>
                          ))}
                        </div>
                        {[['📞','085 – 100 20 30'],['🌐','probouw.nl'],['✉','info@probouw.nl']].map(([ic,v],i) => (
                          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '5px', marginBottom: '5px' }}>
                            <span style={{ fontSize: '8px', width: '14px' }}>{ic}</span>
                            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: or, padding: '9px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ background: '#fff', padding: '3px', borderRadius: '3px', flexShrink: 0 }}>
                            <QrCode fg={nv} bg="#fff" size={28} />
                          </div>
                          <div>
                            <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>SCAN &amp; PLAN AFSPRAAK</div>
                            <div style={{ fontSize: '8px', color: '#fff', fontWeight: 700 }}>Gratis offerte aan huis</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '6.5px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>klik ↺</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px', marginBottom: '4px' }}>Bold & Direct</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Vakman · installatie · klus</div>
                </div>
              </div>
            );
          })()}
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
          Start vandaag. Elke 25e van de maand verstuurt LokaalKabaal automatisch uw flyers.
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
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Nieuwe bewoners</Link>
          <Link href="/direct-mail-mkb" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Direct mail MKB</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacybeleid</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
