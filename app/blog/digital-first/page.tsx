import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Digital-First: Moderne Technologie voor een Fysiek Product',
  description: 'Hoe LokaalKabaal Kadaster-data, automatisering en AI combineert om het meest analoge marketingmedium te vernieuwen.',
  alternates: { canonical: 'https://lokaalkabaal.agency/blog/digital-first' },
  openGraph: {
    title: 'Digital-First flyers voor nieuwe bewoners | LokaalKabaal',
    description: 'Kadaster-data, automatisering en AI voor het meest analoge marketingmedium.',
    url: 'https://lokaalkabaal.agency/blog/digital-first',
  },
};

export default function BlogDigitalFirst() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '.06em' }}>TECHNOLOGIE</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>6 min lezen · 24 februari 2026</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', fontWeight: 400, lineHeight: 1.1, marginBottom: '24px' }}>
          Digital-First: Moderne Technologie voor een Fysiek Product
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--green)', paddingLeft: '20px' }}>
          &ldquo;We bouwen software die eruitziet als een SaaS-tool van 2026. Maar het product dat we leveren is zo oud als de brievenbus.&rdquo;
        </p>

        {[
          {
            kop: 'De paradox van de papieren flyer',
            tekst: `Er is iets grappigs aan wat we doen. Aan de ene kant: een strakke Next.js-interface, Kadaster-data via een API, automatische planning op basis van eigendomsoverdrachten, AI-gegenereerde flyerteksten. Aan de andere kant: een stuk papier dat door een brievenbus gaat.

Dat is precies de kracht van het model. We gebruiken de meest geavanceerde data- en automatiseringstechnologie om het meest analoge marketingmedium te vernieuwen. En dat werkt.`,
          },
          {
            kop: 'Kadaster als marketing-engine',
            tekst: `Het Kadaster registreert elke eigendomsoverdracht in Nederland. Via Altum AI ontsluiten we deze data: elke maand rond de 20e trekken we de transacties van de voorgaande maand voor elk actief werkgebied. Dat geeft ons een lijst van adressen waar recent nieuwe eigenaren zijn ingetrokken.

Eén API-call per klant per maand. Geen privacy-gevoelige persoonsgegevens -- alleen adressen. Precies genoeg om de flyers naar de juiste brievenbussen te sturen.`,
          },
          {
            kop: 'Automatisering die écht helpt',
            tekst: `De ondernemer hoeft niks te doen na de eerste setup. Hij kiest zijn postcode, zijn straal en het aantal flyers. Upload zijn flyer. En dan? Dan regelen wij het. Elke maand. Automatisch.

Dat is het verschil met traditionele flyerdistributie: geen gedoe met folders vol adressen, geen handmatige selectie, geen foutgevoelig maatwerk. De technologie verdwijnt naar de achtergrond zodat de ondernemer zich kan focussen op wat hij echt goed kan: zijn vak.`,
          },
          {
            kop: 'AI voor de tekst, menselijk oordeel voor de rest',
            tekst: `Via de flyer-editor genereert Claude -- Anthropic's taalmodel -- automatisch een wervende flyertekst op basis van de branche en de bedrijfsnaam. Inclusief USPs, call-to-action en een welkomstboodschap die is afgestemd op de situatie van een nieuwe bewoner.

Maar AI is een startpunt, geen eindpunt. De ondernemer past de tekst aan. Hij voegt zijn eigen karakter toe. Want een flyer is geen generieke reclame -- het is een introductie. En die moet kloppen.`,
          },
          {
            kop: 'De toekomst van het papieren kanaal',
            tekst: `We zijn pas begonnen. De volgende stap is real-time tracking: wanneer zijn de flyers bezorgd, welke postcodes zijn gedekt, hoeveel nieuwe bewoners zijn er per maand in jouw werkgebied? Een dashboard dat je direct vertelt wat je campagne doet.

Daarna: integratie met PostNL voor live-bezorgingstatus, gepersonaliseerde QR-codes per postcode, en data-gedreven inzichten over welke flyerinhoud het beste converteert. Allemaal in dienst van één doel: het meest analoge medium het meest data-gedreven maken.`,
          },
        ].map(s => (
          <div key={s.kop} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '14px' }}>{s.kop}</h2>
            <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--muted)', whiteSpace: 'pre-line' }}>{s.tekst}</div>
          </div>
        ))}

        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px', marginTop: '40px' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Ervaar het platform zelf</p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Start nu jouw campagne →</Link>
        </div>
      </article>

      <section style={{ borderTop: '1px solid var(--line)', padding: '60px 40px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '20px', letterSpacing: '.08em' }}>OOK INTERESSANT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { slug: 'hyperlokaal', titel: 'Hyperlokaal: Vertrouwen via Fysieke Aanwezigheid' },
            { slug: 'digitale-moeheid', titel: 'Digitale Moeheid: Fysiek heeft een Langere Houdbaarheid' },
          ].map(a => (
            <Link key={a.slug} href={`/blog/${a.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ padding: '16px', background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', lineHeight: 1.3, marginBottom: '8px' }}>{a.titel}</div>
                <span style={{ fontSize: '12px', color: 'var(--green-dim)' }}>Lees verder →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '12px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Over ons</Link>
        </div>
      </footer>
    </div>
  );
}
