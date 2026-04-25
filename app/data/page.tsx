import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { buildProvincieStats } from '@/lib/provincie-data';
import { buildMailto } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Verhuisdata voor makelaars, verzekeraars en marketeers',
  description: 'Anonieme maandelijkse verhuisdata per PC4, aggregaten per gemeente en provincie. Geen persoonsgegevens, direct inzetbaar in jouw dashboards.',
  alternates: { canonical: 'https://lokaalkabaal.agency/data' },
  openGraph: {
    title: 'Verhuisdata-abonnement · LokaalKabaal',
    description: 'Maandelijkse nieuwe-bewoners aggregaten per PC4 en gemeente voor B2B analytics.',
    url: 'https://lokaalkabaal.agency/data',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Verhuisdata NL') +
        '&subtitle=' +
        encodeURIComponent('Maandelijkse aggregaten, anoniem, API of CSV') +
        '&badge=' +
        encodeURIComponent('Data product'),
    ],
  },
};

const DOELGROEPEN = [
  {
    titel: 'Makelaars & vastgoedbeheerders',
    use: 'Trend-analyses per wijk: welke PC4s verhuizen sneller, waar ontstaan secundaire vraagpieken? Input voor woning-prijsmodellen en portfolio-beslissingen.',
  },
  {
    titel: 'Verzekeraars & hypotheekverstrekkers',
    use: 'Risicomodellering op woning-dynamiek, fraude-detectie (plotselinge spike van verzekeringen op een net-verhuisde PC4), acquisitietarget per regio.',
  },
  {
    titel: 'Marketeers & retail-chains',
    use: 'Meer dan 800.000 eigendomsoverdrachten per jaar gesegmenteerd per PC4 / gemeente / provincie. Koppel aan je CDP en zie waar je CAC het laagst is.',
  },
  {
    titel: 'Overheden & onderzoekers',
    use: 'Geanonimiseerde wijkbewegingen voor beleid (huisvesting, welzijn, participatie). Exports onder AVG-proof verwerkersovereenkomst.',
  },
];

const PAKKETTEN = [
  {
    titel: 'Basic feed',
    prijs: 'vanaf €500/mnd',
    punten: [
      'Geaggregeerde nieuwe-bewoners-counts per PC4, per maand',
      'CSV export + REST API',
      '6-maands historie rolling window',
      'Geen persoonsgegevens, AVG-proof',
    ],
  },
  {
    titel: 'Pro feed',
    prijs: 'vanaf €1.900/mnd',
    punten: [
      'Alles in Basic',
      'Bouwjaar + WOZ-klasse + energielabel brackets per PC4',
      '24-maands historie + forecasting band',
      'Wekelijkse updates i.p.v. maandelijks',
      'Dedicated API-key met 10k req/dag',
    ],
  },
  {
    titel: 'Custom research',
    prijs: 'op aanvraag',
    punten: [
      'Specifieke segmentatie (per bedrijf, per demografische variabele)',
      'Longitudinaal onderzoek over meerdere jaren',
      'Whitepaper + persbericht-ondersteuning',
      'Workshops met jouw data-team',
    ],
  },
];

export default function DataPage(): React.JSX.Element {
  const provincies = buildProvincieStats();
  const totaalPerJaar = provincies.reduce((s, p) => s + p.geschatteNieuweBewonersPerMaand * 12, 0);

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
            Data product · B2B
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Anonieme verhuisdata voor <em style={{ color: 'rgba(255,255,255,0.55)' }}>analytics teams.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Elke maand aggregeren we ~{Math.round(totaalPerJaar / 1000).toLocaleString('nl-NL')}k eigendomsoverdrachten per jaar (Kadaster via Altum AI) naar AVG-proof cijfers per PC4, gemeente en provincie. CSV, API of gedeelde dashboards.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '24px' }}>
          Wie koopt deze data?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }} className="data-grid">
          <style>{`
            @media (max-width: 700px) {
              .data-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          {DOELGROEPEN.map(d => (
            <div key={d.titel} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 22px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '6px' }}>{d.titel}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{d.use}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '18px' }}>
          Drie pakketten
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="data-tiers">
          <style>{`
            @media (max-width: 760px) {
              .data-tiers { grid-template-columns: 1fr !important; }
            }
          `}</style>
          {PAKKETTEN.map(p => (
            <div key={p.titel} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', marginBottom: '4px' }}>{p.titel}</div>
              <div style={{ fontSize: '13px', color: 'var(--green-dim)', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '14px' }}>{p.prijs}</div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {p.punten.map(pt => (
                  <li key={pt} style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6, paddingLeft: '14px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: 0, color: 'var(--green-dim)' }}>✓</span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Kennismaken?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Vertel ons waarvoor je de data wil gebruiken, dan stemmen we het pakket + AVG-verwerkersovereenkomst af.
          </p>
          <a href={buildMailto('data')} style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Plan kennismaking →
          </a>
          <div style={{ marginTop: '14px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>
            Of bekijk eerst de <Link href="/nl-verhuisdata" style={{ color: 'var(--green-dim)', textDecoration: 'underline' }}>gratis publieke dashboard</Link>.
          </div>
        </div>
      </section>
    </div>
  );
}
