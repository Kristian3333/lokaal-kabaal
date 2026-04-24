import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyers Versturen voor Bakkers - Bereik Nieuwe Bewoners',
  description: 'Bereik nieuwe bewoners als bakker voordat ze een andere bakkerij kiezen. Automatische flyers via Kadaster. Vaste klant = €520/jaar gemiddeld. Geen contract.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-bakker' },
  openGraph: {
    title: 'Flyers Versturen voor Bakkers - Bereik Nieuwe Bewoners | LokaalKabaal',
    description: 'Bereik nieuwe bewoners als bakker voordat ze een andere bakkerij kiezen. Automatische flyers via Kadaster. Vaste klant = €520/jaar.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-bakker',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes als bakker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In een stedelijke wijk zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een bakker die 3–5 postcodes activeert, zijn dat 9–40 potentiële nieuwe klanten per maand. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is de beste aanbieding voor op een bakkersflyer voor nieuwe bewoners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Het beste aanbod is een lagedrempel kennismakingsaanbieding: een gratis koffiebroodje bij het eerste bezoek, of 10% korting op de eerste bestelling. Zorg dat uw brood en openingstijden duidelijk staan. De boodschap: "Welkom in de wijk -- uw verse bakker om de hoek." Voeg een QR-code naar uw assortiment toe als u die heeft.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer is de beste periode om te starten als bakker?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Verhuisbewegingen zijn het hele jaar actief, met een piek van april tot september. Voor bakkers is er ook een voordeel in de herfst: nieuwe bewoners die in de zomer zijn verhuisd zoeken dan naar hun vaste routine -- inclusief een bakker voor het weekend. Er is geen slechte maand om te starten.',
      },
    },
  ],
};

export default function FlyersBakker() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>

        <Nav />

        {/* Breadcrumb */}
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '16px 40px 0', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Home</Link>
          {' / '}
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Flyers nieuwe bewoners</Link>
          {' / '}
          <span>Bakkers</span>
        </div>

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 48px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Branche -- Bakkers & broodjeszaken
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Flyers versturen voor bakkers --<br /><em style={{ color: 'var(--green-dim)' }}>wees de eerste bakkerij</em><br />op de deurmat van nieuwe bewoners
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '32px' }}>
            Nieuwe bewoners zoeken een vaste bakker. Ze doen dat in de eerste weken na de verhuizing, en ze kiezen er één -- voor jaren. LokaalKabaal koppelt automatisch aan het Kadaster en verstuurt uw flyer zodra er een nieuwe eigenaar is geregistreerd in uw postcodes. Gemiddelde klantwaarde van een vaste klant: <strong>€520 per jaar</strong>. De flyer: minder dan €3.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start voor uw bakkerij →
            </Link>
            <Link href="#rekensom" style={{ padding: '12px 24px', background: 'transparent', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px', border: '1px solid var(--line)' }}>
              Bekijk de rekensom
            </Link>
          </div>
        </section>

        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '0 40px 60px' }}>

          {/* Blok 1 */}
          <section style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Waarom nieuwe bewoners de ideale nieuwe klant zijn voor uw bakkerij
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Een bakker verkoopt geen producten -- een bakker verkoopt een gewoonte. Het zaterdag-brood, het croissantje op weg naar het werk, de taart voor verjaardagen. Die gewoontes zijn sterk, maar ze zijn locatiegebonden. En bij een verhuizing vallen ze weg.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Nieuwe bewoners staan open voor een nieuwe vaste bakker. Ze kijken om zich heen in de buurt, lopen de straat door en vragen buren om tips. De eerste bakkerij die op hun mat ligt -- concreet, met een gezicht en een aanbieding -- heeft een enorm voordeel. Er is geen Google-advertentie die dat verslaat.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              De zoekopdracht begint <strong>binnen 1–2 weken na de verhuizing</strong>. En het beslissingsproces is eenvoudig: ze gaan naar de dichtstbijzijnde bakker die ze kennen. Wie er al bij ze in de bus lag, die kennen ze al.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Een vaste bakkerijklant koopt gemiddeld 2–3 keer per week. Bij een gemiddeld aankoopbedrag van €8–12 per bezoek is dat <strong>€800–1.800 per jaar</strong>. Eén nieuwe vaste klant via een flyer van €3 is een van de beste investeringen die u als bakker kunt doen.
            </p>
          </section>

          {/* Blok 2 */}
          <section style={{ marginBottom: '56px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe LokaalKabaal automatisch uw flyercampagne beheert
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '20px' }}>
              U begint om 4 uur &apos;s ochtends. Marketing heeft u geen tijd voor. LokaalKabaal draait zonder dat u er naar omkijkt.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>DE SETUP (EENMALIG -- 20 MINUTEN)</div>
              {[
                'Maak een account aan en stel uw bakkerij in',
                'Selecteer de postcodes rondom uw winkel -- wijk voor wijk',
                'Upload uw logo en welkomstboodschap (of gebruik ons bakkerstemplate)',
                'Activeer het abonnement',
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '2px 6px', borderRadius: 'var(--radius)', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{s}</span>
                </div>
              ))}
              <div style={{ padding: '10px 0', fontSize: '14px', fontWeight: 700, color: 'var(--green-dim)' }}>Daarna? Niets. Het systeem werkt.</div>
            </div>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '16px' }}>
              Elke dag monitort LokaalKabaal het Kadaster op nieuwe eigendomsoverdrachten in uw gekozen postcodes. Zodra er een nieuwe eigenaar is geregistreerd, start automatisch het drukproces. Binnen 2 werkdagen ligt uw flyer op de mat.
            </p>
            <div style={{ background: 'var(--paper2)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>WAT STAAT ER OP EEN GOEDE BAKKERSFLYER?</div>
              {['Uw naam, logo en adres -- groot en duidelijk', 'Warme welkomstboodschap: "Vers gebakken brood om de hoek"', 'Concrete aanbieding: bijv. gratis koffiebroodje bij eerste bezoek', 'Openingstijden (incl. weekend)', 'QR-code naar uw assortiment of webshop (optioneel)'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#555', padding: '3px 0' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </section>

          {/* ROI tabel */}
          <section id="rekensom" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              De rekensom voor uw bakkerij
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                ['Gemiddeld aantal bezoeken per vaste klant per week', '2'],
                ['Gemiddeld aankoopbedrag per bezoek', '€10'],
                ['Jaarwaarde vaste klant', '€1.040'],
                ['Lifetime value (5 jaar)', '€5.200'],
                ['Kosten van de flyer die deze klant binnenbracht', '~€3'],
                ['Break-even conversieratio (bij €349/mnd abonnement)', '<1%'],
                ['Verwachte conversieratio welkomstflyer', '3–6%'],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', borderBottom: i < 6 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'var(--white)' : 'var(--paper)' }}>
                  <div style={{ padding: '10px 16px', fontSize: '13px', color: '#444' }}>{label}</div>
                  <div style={{ padding: '10px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: i === 6 ? 'var(--green-dim)' : 'var(--ink)', textAlign: 'right' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>REKENVOORBEELD -- 10 NIEUWE BEWONERS/MND · 5% CONVERSIE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Nieuwe klanten/jaar', val: '~6' },
                  { label: 'Omzettoevoeging/jaar', val: '€6.240' },
                  { label: 'Netto ROI', val: '+963%' },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--green-dim)' }}>{s.val}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '24px', letterSpacing: '-0.01em' }}>
              Veelgestelde vragen voor bakkers over flyers versturen
            </h2>
            {[
              { q: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes?', a: 'In een stedelijke wijk in Nederland zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een bakker die 3–5 postcodes rondom zich activeert, betekent dat 9–40 potentiële nieuwe klanten per maand. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes, zodat u weet wat u kunt verwachten.' },
              { q: 'Wat is de beste aanbieding voor op mijn bakkersflyer?', a: 'Het beste aanbod voor nieuwe bewoners is een lagedrempel kennismakingsaanbieding: een gratis koffiebroodje bij het eerste bezoek, of 10% korting op de eerste aankoop. Zorg dat uw broodassortiment herkenbaar is op de flyer en vermeld uw openingstijden duidelijk. De boodschap: "Uw verse bakker om de hoek -- kom kennismaken."' },
              { q: 'Wanneer is de beste periode om te starten als bakker?', a: 'Verhuisbewegingen zijn het hele jaar actief, met een piek van april tot september. Voor bakkers is er ook een voordeel in de herfst: nieuwe bewoners die in de zomer zijn verhuisd zoeken in september–oktober hun vaste routine -- inclusief een bakker voor het weekend. Er is geen slechte maand om te starten.' },
            ].map((f, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '18px 0' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{f.q}</div>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </section>

          {/* Andere branches */}
          <section style={{ marginBottom: '56px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '12px', letterSpacing: '0.08em' }}>OOK INTERESSANT</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { href: '/flyers-versturen-kapper', label: 'Kappers' },
                { href: '/flyers-versturen-installateur', label: 'Installateurs' },
                { href: '/flyers-versturen-restaurant', label: 'Restaurants' },
                { href: '/flyers-versturen-makelaar', label: 'Makelaars' },
                { href: '/flyers-versturen-nieuwe-bewoners', label: 'Alle branches' },
              ].map(b => (
                <Link key={b.href} href={b.href} style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '12px', color: 'var(--ink)', fontFamily: 'var(--font-mono)', background: 'var(--white)' }}>{b.label}</Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section style={{ background: 'var(--ink)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>
              Uw eerste bakkersflyer gaat de deur uit<br />bij de volgende nieuwe bewoner in uw wijk.
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
              Geen contract · Per maand opzegbaar · Setup in 20 minuten
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '14px' }}>
              Start vandaag →
            </Link>
          </section>
        </main>

        <footer style={{ borderTop: '1px solid var(--line)', padding: '32px 40px', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>© 2026 LokaalKabaal</div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { href: '/flyers-versturen-nieuwe-bewoners', label: 'Flyers nieuwe bewoners' },
              { href: '/direct-mail-mkb', label: 'Direct mail MKB' },
              { href: '/flyers-versturen-kapper', label: 'Kappers' },
              { href: '/flyers-versturen-installateur', label: 'Installateurs' },
              { href: '/blog', label: 'Blog' },
              { href: '/privacy', label: 'Privacy' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: '11px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>{l.label}</Link>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
