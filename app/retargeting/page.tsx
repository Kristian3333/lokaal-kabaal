import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import { buildMailto } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Digital retargeting: bereik QR-scanners opnieuw op Facebook & Google',
  description: 'Scans converteren niet altijd direct. Met retargeting laat je jouw flyer-scanners opnieuw jouw advertenties zien op Facebook, Instagram en het Google display netwerk.',
  alternates: { canonical: 'https://lokaalkabaal.agency/retargeting' },
  openGraph: {
    title: 'Retargeting voor flyer-scanners · LokaalKabaal',
    description: 'Combineer fysieke flyers met digitale retargeting op Meta & Google.',
    url: 'https://lokaalkabaal.agency/retargeting',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Digital retargeting') +
        '&subtitle=' +
        encodeURIComponent('Bereik scanners opnieuw via Meta & Google') +
        '&badge=' +
        encodeURIComponent('Add-on'),
    ],
  },
};

const KANALEN = [
  { platform: 'Meta (Facebook + Instagram)', reach: 'Custom audience op basis van gehashte postcode + device-ID uit de QR-scan. Retailer rent 7-dag window.' },
  { platform: 'Google Display & YouTube', reach: 'Lookalike audience in dezelfde PC4 + aangrenzende buurten. Werkt ook voor gebruikers zonder social account.' },
  { platform: 'TikTok (optioneel)', reach: 'Voor F&B en fashion branches -- jonge nieuwe bewoners activeren via kort-video formaat met lokale slant.' },
];

export default function RetargetingPage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '80px 40px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Add-on · digitaal
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Iemand scant je flyer <em style={{ color: 'rgba(255,255,255,0.55)' }}>en vergeet hem.</em> Pak ze terug.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            45-60% van de scans converteert pas na 2-3 touchpoints. Retargeting laat jouw vervolgadvertentie zien op Meta en Google aan iedereen die jouw flyer al heeft gescand -- tot 14 dagen na de scan.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Kanalen
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="rt-kanalen">
          <style>{`
            @media (max-width: 820px) { .rt-kanalen { grid-template-columns: 1fr 1fr !important; } }
            @media (max-width: 540px) { .rt-kanalen { grid-template-columns: 1fr !important; } }
          `}</style>
          {KANALEN.map(k => (
            <div key={k.platform} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 22px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '6px', lineHeight: 1.3 }}>{k.platform}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>{k.reach}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 48px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Hoe het werkt (privacy-first)
          </div>
          <ol style={{ fontSize: '14px', lineHeight: 1.8, color: 'var(--ink)', paddingLeft: '20px', margin: 0 }}>
            <li>Scanner bezoekt <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>/v/[code]</code>. We hashen alleen PC4 + device-hint, nooit NAW.</li>
            <li>De hash wordt via de officiele Meta Conversions API en Google Ads Enhanced Conversions naar jouw ad-account gepusht.</li>
            <li>Het ad-account bouwt zelf een custom audience; wij zien de individuele profielen niet.</li>
            <li>Jij bepaalt de campaign, budget, creatives. Wij leveren alleen de doelgroep-signalen.</li>
          </ol>
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '12px', lineHeight: 1.6 }}>
            Volledig AVG-compliant. Zie onze <a href="/avg-dpia" style={{ color: 'var(--green-dim)' }}>DPIA-pagina</a> voor de technische details.
          </p>
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="rt-pricing">
          <style>{`
            @media (max-width: 700px) { .rt-pricing { grid-template-columns: 1fr !important; } }
          `}</style>
          <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Service fee</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '6px' }}>€79<span style={{ fontSize: '14px', color: 'var(--muted)' }}>/maand</span></div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              Setup van pixels, custom audience sync, maandelijkse audit. Geen kosten als je minder dan 50 scans per maand hebt.
            </p>
          </div>
          <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>Ad-spend</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', marginBottom: '6px' }}>Op jouw account</div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
              Wij beheren jouw Meta Business Manager / Google Ads account. Budget staat op jouw creditcard -- volledige controle en transparantie.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Pilot starten?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Minimaal 200 scans/mnd nodig om een zinvolle custom audience te bouwen. Geef ons je ad-account en huidige creative, wij doen de rest.
          </p>
          <a href={buildMailto('retargeting')} style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Start een retargeting pilot →
          </a>
        </div>
      </section>
    </div>
  );
}
