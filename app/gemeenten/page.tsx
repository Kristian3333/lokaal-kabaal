import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { buildMailto } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Voor gemeenten: welkomstpakket op basis van Kadaster-data',
  description: 'Maak je eigen welkomstpakket voor nieuwe bewoners met lokale ondernemers uit jouw gemeente. Embed, booklet, of co-branded campagne.',
  alternates: { canonical: 'https://lokaalkabaal.agency/gemeenten' },
  openGraph: {
    title: 'Voor gemeenten -- LokaalKabaal welkomstpakket',
    description: 'Co-branded welkomstpakket voor nieuwe bewoners, gemaakt door de lokale ondernemers in jouw gemeente.',
    url: 'https://lokaalkabaal.agency/gemeenten',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Voor gemeenten') +
        '&subtitle=' +
        encodeURIComponent('Welkomstpakket met lokale ondernemers in jouw gemeente') +
        '&badge=' +
        encodeURIComponent('Partnership'),
    ],
  },
};

const BOUWSTENEN = [
  {
    titel: 'Welkomstbooklet',
    tekst: 'Gedrukt A5 booklet dat nieuwe bewoners bij hun sleuteloverdracht of kort daarna ontvangen. 20 lokale ondernemers in 1 pakket, elk met een welkomstaanbieding en QR-code. Jij bepaalt de selectie; wij drukken + bezorgen maandelijks.',
  },
  {
    titel: 'Digital embed',
    tekst: 'iframe of script-tag op jouw gemeentelijke site die automatisch de welkomstpakket-retailers in de juiste PC4 toont. Nieuwe bewoner landt na verhuizing-aanmelding direct op een pagina met lokale partners.',
  },
  {
    titel: 'Verhuisdata dashboard',
    tekst: 'Inzicht in aantal verhuizingen per wijk per maand, anoniem en geaggregeerd. Handig voor beleidsdoeleinden (wijkparticipatie, huisvestingsplannen, welzijnsvoorzieningen).',
  },
  {
    titel: 'Co-branded QR',
    tekst: 'Elke flyer in jouw welkomstpakket heeft een unieke QR-code; scans en conversies gaan terug naar zowel jouw dashboard als naar de ondernemer. Transparante meetbaarheid per retailer, per wijk.',
  },
];

export default function GemeentenPage(): React.JSX.Element {
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
            Voor gemeenten · partnership
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Welkom in {`{gemeente}`}.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Help nieuwe bewoners hun weg te vinden naar de lokale ondernemers in jouw gemeente. Eén welkomstpakket, maandelijks automatisch bezorgd via Kadaster-data -- jouw merk, onze automatisering, onze drukker, onze bezorging.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '24px' }}>
          Vier bouwstenen, kies wat past
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }} className="gemeente-grid">
          <style>{`
            @media (max-width: 700px) {
              .gemeente-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          {BOUWSTENEN.map(b => (
            <div key={b.titel} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '8px' }}>{b.titel}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{b.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '16px 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 2.5vw, 26px)', fontWeight: 400, marginBottom: '12px' }}>
          Zo werkt de embed (voorbeeld)
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '12px' }}>
          Plaats deze tag op jouw gemeentelijke verhuis-landingspagina. De iframe detecteert de postcode van de bezoeker en laadt het juiste welkomstpakket.
        </p>
        <pre style={{
          background: 'var(--ink)', color: '#e0e0e0',
          padding: '18px 20px', borderRadius: 'var(--radius)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', overflow: 'auto',
          lineHeight: 1.65, marginBottom: '10px',
        }}>
{`<!-- LokaalKabaal welkomstpakket embed -->
<iframe
  src="https://lokaalkabaal.agency/embed/welkomstpakket?gemeente=utrecht"
  width="100%"
  height="560"
  style="border: 0"
  loading="lazy"
  title="Welkomstpakket Utrecht"
></iframe>`}
        </pre>
        <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.7 }}>
          Ondersteunt <code>?gemeente=</code>, <code>?pc4=</code> en optionele <code>?theme=light|dark</code>. Geen cookies, geen tracking -- enkel de pakket-inhoud + QR-codes.
        </p>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Interesse in een pilot?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            We starten partnerships per pilotgemeente. Stuur een mail, dan plannen we een kennismakingscall.
          </p>
          <a href={buildMailto('gemeenten')} style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Plan kennismakingscall →
          </a>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '28px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '16px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/avg-dpia" style={{ color: 'var(--muted)', textDecoration: 'none' }}>AVG/DPIA</Link>
          <Link href="/iso-27001-roadmap" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Security</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
