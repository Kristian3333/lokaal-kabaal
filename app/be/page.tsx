import type { Metadata } from 'next';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyers sturen naar nieuwe bewoners in Belgie | LokaalKabaal',
  description: 'Altum AI koppeling met de Belgische Patrimoniumdocumentatie. 3-weekse PoC voor Vlaamse retailers. Flyers bezorgd door bpost naar nieuwe bewoners in Antwerpen, Gent, Brugge.',
  alternates: { canonical: 'https://lokaalkabaal.agency/be' },
  openGraph: {
    title: 'LokaalKabaal Belgie · Vlaanderen PoC',
    description: 'Directe mail naar nieuwe bewoners in Vlaanderen, powered by Altum AI BE feed.',
    url: 'https://lokaalkabaal.agency/be',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Belgie pilot') +
        '&subtitle=' +
        encodeURIComponent('Nieuwe-bewoners marketing voor Vlaamse retailers') +
        '&badge=' +
        encodeURIComponent('PoC'),
    ],
  },
};

const STEDEN = [
  { stad: 'Antwerpen', provincie: 'Antwerpen', verhuizingen: '~4.800/mnd' },
  { stad: 'Gent', provincie: 'Oost-Vlaanderen', verhuizingen: '~3.200/mnd' },
  { stad: 'Brugge', provincie: 'West-Vlaanderen', verhuizingen: '~1.400/mnd' },
  { stad: 'Leuven', provincie: 'Vlaams-Brabant', verhuizingen: '~2.100/mnd' },
  { stad: 'Hasselt', provincie: 'Limburg', verhuizingen: '~1.100/mnd' },
  { stad: 'Mechelen', provincie: 'Antwerpen', verhuizingen: '~1.000/mnd' },
];

const VERSCHILLEN = [
  { titel: 'Data bron', nl: 'Kadaster via Altum AI NL', be: 'Algemene Administratie van de Patrimoniumdocumentatie via Altum AI BE' },
  { titel: 'Privacy kader', nl: 'AVG + UAVG', be: 'GDPR + de Belgische Kaderwet gegevensbescherming' },
  { titel: 'Distributie', nl: 'PostNL maandelijks 28-30e', be: 'bpost maandelijks laatste week, servicewindow vergelijkbaar' },
  { titel: 'BTW', nl: '21% NL BTW op factuur', be: '21% BE BTW, VAT-reverse-charge voor B2B cross-border' },
  { titel: 'Taal', nl: 'Nederlands (NL)', be: 'Nederlands (VL) standaard, optioneel tweetalige editie NL/FR' },
];

export default function BePage(): React.JSX.Element {
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
            Internationale uitbreiding · PoC
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Nu ook nieuwe bewoners in <em style={{ color: 'rgba(255,255,255,0.55)' }}>Vlaanderen.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Wij openen in Q3 2026 een Belgie-pilot. Dezelfde flyer-automation, via de Belgische Patrimoniumdocumentatie en bpost. Retailers in Antwerpen, Gent, Brugge, Leuven en Mechelen kunnen zich nu aanmelden als pilot-klant.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Doelsteden pilot
        </h2>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {STEDEN.map((s, i) => (
            <div
              key={s.stad}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.2fr 1fr',
                padding: '14px 22px',
                borderBottom: i === STEDEN.length - 1 ? 'none' : '1px solid var(--line)',
                fontSize: '13px',
              }}
            >
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '16px' }}>{s.stad}</div>
              <div style={{ color: 'var(--muted)' }}>{s.provincie}</div>
              <div style={{ color: 'var(--green-dim)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{s.verhuizingen}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
          Schattingen op basis van FOD Economie migratiestatistieken 2024. Definitief volume hangt af van Altum AI BE feed-coverage.
        </p>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          NL versus BE
        </h2>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr',
            padding: '12px 22px', borderBottom: '1px solid var(--line)', background: 'var(--paper2)',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <div>Onderwerp</div>
            <div>Nederland</div>
            <div>Belgie</div>
          </div>
          {VERSCHILLEN.map((v, i) => (
            <div
              key={v.titel}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr',
                padding: '14px 22px',
                borderBottom: i === VERSCHILLEN.length - 1 ? 'none' : '1px solid var(--line)',
                fontSize: '13px', lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 600 }}>{v.titel}</div>
              <div style={{ color: 'var(--muted)' }}>{v.nl}</div>
              <div style={{ color: 'var(--muted)' }}>{v.be}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Pilot voorwaarden (Q3 2026)
          </div>
          <ul style={{ fontSize: '13px', color: 'var(--ink)', lineHeight: 1.9, margin: 0, paddingLeft: '20px' }}>
            <li>Eerste 20 Vlaamse retailers krijgen 3 maanden aan 50% korting op de NL tarieven.</li>
            <li>Minimum commitment 3 maanden, daarna maandelijks opzegbaar.</li>
            <li>Data-bron gaat live zodra de Altum AI BE feed minimaal 90% postcode-dekking haalt (nu 78%).</li>
            <li>Case-study samenwerking: wij gebruiken anonieme resultaten in toekomstige marketing in ruil voor de korting.</li>
          </ul>
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Interesse in de pilot?
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Stuur ons je KBO-nummer + werkgebied. We nemen contact op zodra de feed-coverage het target haalt en plannen een intake gesprek in.
          </p>
          <a href="mailto:be@lokaalkabaal.agency?subject=Vlaanderen%20pilot%20aanmelding" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Meld je aan voor de Vlaanderen-pilot →
          </a>
        </div>
      </section>
    </div>
  );
}
