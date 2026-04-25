import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import { buildMailto } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Welkomstpakket nieuwe bewoners voor gemeenten | LokaalKabaal',
  description: 'Een professioneel Welkom-in-[Stad] pakket dat elke nieuwe bewoner binnen 30 dagen na verhuizing ontvangt. Bundelt 15-20 lokale ondernemers, drukkosten gedragen door deelnemers.',
  alternates: { canonical: 'https://lokaalkabaal.agency/welkomstpakket-gemeenten' },
  openGraph: {
    title: 'Welkomstpakket voor gemeenten · LokaalKabaal',
    description: 'Welkom-in-[Stad] booklet voor nieuwe bewoners, volledig geproduceerd en bezorgd.',
    url: 'https://lokaalkabaal.agency/welkomstpakket-gemeenten',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Welkomstpakket gemeenten') +
        '&subtitle=' +
        encodeURIComponent('Welkom-in-[Stad] booklet voor nieuwe bewoners') +
        '&badge=' +
        encodeURIComponent('Overheid'),
    ],
  },
};

const VOORDELEN = [
  { titel: 'Nul kosten voor de gemeente', tekst: 'Lokale ondernemers dragen per placement bij. Wij regelen werving, layout, druk en bezorging. De gemeente tekent alleen af op de inhoud.' },
  { titel: 'Nieuwe bewoners voelen zich welkom', tekst: 'Een fysiek pakket op de mat beats een e-mail. Concrete tips over afvalinzameling, huisarts, bibliotheek, sportclubs + aanbiedingen van MKB ondernemers.' },
  { titel: 'Economisch beleid in actie', tekst: 'Lokale MKB ondernemers krijgen direct contact met bewoners die de eerste 90 dagen hun voorkeursmerken kiezen. Meetbaar: gemiddeld 6 a 8 verzilverde codes per pakket.' },
  { titel: 'AVG-compliant', tekst: 'Alleen Kadaster-verhuisdata via Altum AI, geen NAW-matching op persoonsniveau. DPIA volledig gedocumenteerd, zie /avg-dpia.' },
  { titel: 'Bestuurlijk afgedekt', tekst: 'Kaderbrief-template, raadsbesluit-memo en privacy-impact-assessment kant-en-klaar. Wij leveren alles voor B&W + commissie.' },
  { titel: 'Kwartaal dashboard', tekst: 'Gemeente krijgt toegang tot een dashboard met verhuis-volume, deelnemende ondernemers, conversieratios en bewoners-sentiment (anoniem).' },
];

const STAPPEN = [
  { n: '01', titel: 'Intake 90 min', tekst: 'Met beleidsmedewerker Economie/Dienstverlening. Wij scannen gemeente-kenmerken, bepalen aantal placements en budget.' },
  { n: '02', titel: 'Werving ondernemers', tekst: 'Wij werven 15-20 lokale MKB via bestaande ondernemersverenigingen en onze sales-channel. Gemeente hoeft niets te doen.' },
  { n: '03', titel: 'Booklet productie', tekst: 'In-house designer bouwt A5 booklet (16 paginas). Gemeente tekent af op redactionele pagina plus alle commerciele placements.' },
  { n: '04', titel: 'Maandelijkse bezorging', tekst: 'Iedere nieuwe bewoner binnen 30-60 dagen. PostNL delivery, A5 formaat, dichtgeklapt in een envelop met gemeente-wapen.' },
  { n: '05', titel: 'Kwartaal rapport', tekst: 'Wij leveren rapport met volume, conversies en sentiment. Basis voor B&W rapportage en evaluatie richting gemeenteraad.' },
];

export default function WelkomstpakketGemeentenPage(): React.JSX.Element {
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
            Voor gemeenten · economisch beleid
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Welkom nieuwe bewoners, <em style={{ color: 'rgba(255,255,255,0.55)' }}>versterk lokaal MKB.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Een gezamenlijk welkomstpakket dat elke nieuwe bewoner binnen 30 dagen op de mat krijgt. Gemeentelijke service plus 15-20 lokale ondernemers in een A5 booklet. Nul kosten voor de gemeente, de deelnemende MKB ondernemers dragen.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Waarom dit werkt
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }} className="mun-grid">
          <style>{`
            @media (max-width: 700px) { .mun-grid { grid-template-columns: 1fr !important; } }
          `}</style>
          {VOORDELEN.map(v => (
            <div key={v.titel} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '6px', lineHeight: 1.3 }}>{v.titel}</div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{v.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Traject in 5 stappen
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }} className="mun-steps">
          <style>{`
            @media (max-width: 820px) { .mun-steps { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px) { .mun-steps { grid-template-columns: 1fr !important; } }
          `}</style>
          {STAPPEN.map(s => (
            <div key={s.n} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', marginBottom: '6px' }}>
                STAP {s.n}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', marginBottom: '4px', lineHeight: 1.3 }}>
                {s.titel}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>
                {s.tekst}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '24px 28px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
            Kostenmodel
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--ink)', marginBottom: '10px' }}>
            Drie varianten, afhankelijk van de gemeentegrootte en het ambitieniveau:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.9, margin: 0, paddingLeft: '20px' }}>
            <li><strong style={{ color: 'var(--ink)' }}>Dorpskern</strong> (&lt;20.000 inwoners): 150-300 pakketten/mnd, minimum 10 ondernemers.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Middelgrote stad</strong> (20-100k): 300-800 pakketten/mnd, 15-20 ondernemers per editie.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Grote stad</strong> (&gt;100k): 800+ pakketten/mnd, wijk-specifieke edities met rouleerende ondernemers.</li>
          </ul>
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '12px', lineHeight: 1.6 }}>
            Exacte placement-tarieven in de offerte. Meerjaren-contract met prijsindexering beschikbaar. Aanbestedingsluw inkooptraject mogelijk onder SAS 2a/2b.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Laten we kennis maken
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Wij komen graag langs bij de beleidsmedewerker Economie of Dienstverlening. Intake is vrijblijvend en levert direct een projectvoorstel op dat B&W klaar is.
          </p>
          <a href={buildMailto('overheid')} style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Plan intake met beleidsmedewerker →
          </a>
        </div>
      </section>
    </div>
  );
}
