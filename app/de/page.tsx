import type { Metadata } from 'next';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyer an Neumieter in Deutschland | LokaalKabaal',
  description: '5x die Marktgrosse der Niederlande, Grundbuch-Daten verfugbar. Deutschland-Waitlist fur Retailer in NRW, Niedersachsen und Bayern. Geplanter Start 2027 mit lokalem Druck-Partner.',
  alternates: { canonical: 'https://lokaalkabaal.agency/de' },
  openGraph: {
    title: 'LokaalKabaal Deutschland · 2027 Waitlist',
    description: 'Neumieter-Marketing fur deutsche Einzelhandler, powered by Grundbuch-Daten.',
    url: 'https://lokaalkabaal.agency/de',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Deutschland waitlist') +
        '&subtitle=' +
        encodeURIComponent('Neumieter-Marketing fur deutsche Handler') +
        '&badge=' +
        encodeURIComponent('2027'),
    ],
  },
};

const BUNDESLAENDER = [
  { land: 'Nordrhein-Westfalen', volumen: '~46.000 Umzuege/Monat', focus: 'Koln, Dusseldorf, Dortmund, Essen' },
  { land: 'Bayern', volumen: '~38.000 Umzuege/Monat', focus: 'Munchen, Nurnberg, Augsburg' },
  { land: 'Baden-Wurttemberg', volumen: '~32.000 Umzuege/Monat', focus: 'Stuttgart, Karlsruhe, Freiburg' },
  { land: 'Niedersachsen', volumen: '~22.000 Umzuege/Monat', focus: 'Hannover, Braunschweig, Oldenburg' },
  { land: 'Hessen', volumen: '~18.000 Umzuege/Monat', focus: 'Frankfurt, Wiesbaden, Kassel' },
  { land: 'Berlin', volumen: '~16.000 Umzuege/Monat', focus: 'Berlin (12 Bezirke)' },
];

const UNTERSCHIEDE = [
  { titel: 'Datenquelle', nl: 'Kadaster via Altum AI NL', de: 'Grundbuch via Land-spezifische Schnittstellen + commercial provider' },
  { titel: 'Datenschutz', nl: 'AVG + UAVG', de: 'DSGVO + Bundesdatenschutzgesetz (BDSG)' },
  { titel: 'Druck', nl: 'Print.one (centraal)', de: 'Lokale Druck-Partner per Bundesland wegen Porto-Kosten' },
  { titel: 'Versand', nl: 'PostNL maandelijks', de: 'Deutsche Post monatlich, regional teilweise hermes' },
  { titel: 'MwSt', nl: '21% NL BTW', de: '19% DE MwSt, reverse-charge bei EU B2B' },
  { titel: 'Sprache', nl: 'Nederlands', de: 'Deutsch, optional DE/EN voor Expat-Gebiete' },
];

const TIMELINE = [
  { quartal: 'Q4 2026', milestone: 'Druck-Partner Auswahl', tekst: 'Selektion van 2-3 regionalen Druckereien in NRW en Bayern. Pilot-capaciteit 5.000 flyers/maand.' },
  { quartal: 'Q1 2027', milestone: 'Rechtliche Struktur', tekst: 'DE GmbH oprichten of als EU-cross-border service registreren. BDSG-compliance audit.' },
  { quartal: 'Q2 2027', milestone: 'Private Beta', tekst: '10 pilot-retailers in Koln en Munchen. Data-feed en flyer-pipeline end-to-end getest.' },
  { quartal: 'Q3 2027', milestone: 'Public Launch', tekst: 'Waitlist opening. Eerste 50 retailers krijgen founding-member tarieven.' },
];

export default function DePage(): React.JSX.Element {
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
            Waitlist · geplant 2027
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Deutschland ist <em style={{ color: 'rgba(255,255,255,0.55)' }}>5x so gross.</em> Wir kommen.
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            3,5 Millionen Haushaltsumzuege pro Jahr. Grundbuchdaten sind verfugbar, DSGVO ist kompatibel mit unserem NL-Stack, und unabhangige Einzelhandler in NRW, Bayern und Niedersachsen haben den gleichen Bedarf wie ihre niederlandischen Nachbarn. Start 2027, Waitlist offen.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Zielmaerkte
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="de-laender">
          <style>{`
            @media (max-width: 700px) { .de-laender { grid-template-columns: 1fr !important; } }
          `}</style>
          {BUNDESLAENDER.map(b => (
            <div key={b.land} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '18px 22px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', marginBottom: '4px' }}>{b.land}</div>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', marginBottom: '4px' }}>{b.volumen}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.6 }}>{b.focus}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '10px' }}>
          Schatzungen basierend auf destatis Wanderungsstatistik 2024.
        </p>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          NL vs DE
        </h2>
        <div style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr',
            padding: '12px 22px', borderBottom: '1px solid var(--line)', background: 'var(--paper2)',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            <div>Thema</div>
            <div>Niederlande</div>
            <div>Deutschland</div>
          </div>
          {UNTERSCHIEDE.map((u, i) => (
            <div
              key={u.titel}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr',
                padding: '14px 22px',
                borderBottom: i === UNTERSCHIEDE.length - 1 ? 'none' : '1px solid var(--line)',
                fontSize: '13px', lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 600 }}>{u.titel}</div>
              <div style={{ color: 'var(--muted)' }}>{u.nl}</div>
              <div style={{ color: 'var(--muted)' }}>{u.de}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Zeitplan
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }} className="de-timeline">
          <style>{`
            @media (max-width: 820px) { .de-timeline { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px) { .de-timeline { grid-template-columns: 1fr !important; } }
          `}</style>
          {TIMELINE.map(t => (
            <div key={t.quartal} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', marginBottom: '6px' }}>
                {t.quartal}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', marginBottom: '4px', lineHeight: 1.3 }}>
                {t.milestone}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>
                {t.tekst}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Auf die Waitlist
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Schick uns deine USt-IdNr + PLZ-Einzugsgebiet. Die ersten 50 Retailer auf der Waitlist bekommen Founding-Member-Tarife (30% Rabatt auf die ersten 12 Monate) und bevorzugten Onboarding-Slot im Q3 2027.
          </p>
          <a href="mailto:de@lokaalkabaal.agency?subject=Deutschland%20Waitlist%20Anmeldung" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Auf die Deutschland-Waitlist →
          </a>
        </div>
      </section>
    </div>
  );
}
