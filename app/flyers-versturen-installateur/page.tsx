import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyers Versturen voor Installateurs — Bereik Nieuwe Bewoners',
  description: 'Bereik nieuwe bewoners als installateur voordat ze een andere vakman kiezen. Automatische flyers via Kadaster. Eerste opdracht gemiddeld €450. Geen contract.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-installateur' },
  openGraph: {
    title: 'Flyers Versturen voor Installateurs — Bereik Nieuwe Bewoners | LokaalKabaal',
    description: 'Bereik nieuwe bewoners als installateur voordat ze een andere vakman kiezen. Automatische flyers via Kadaster. Eerste opdracht gemiddeld €450.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-installateur',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes als installateur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In een stedelijke wijk zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een installateur die 5–10 postcodes activeert, zijn dat 15–80 potentiële nieuwe klanten per maand. Met name koopwoningen genereren direct na overdracht installatievragen. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is de beste aanbieding voor op een installatieflyer voor nieuwe bewoners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Voor installateurs werkt een gratis inspectie of vrijblijvend adviesgesprek goed als drempelverlagend aanbod. Nieuwe bewoners hebben vaak een checklist van klusjes — een cv-ketel keuring, nieuwe stopcontacten, warmtepomp advies. Positioneer uzelf als de "vaste vakman in de buurt" die ze kunnen bellen voor alles. Vermeld uw specialisaties en certificeringen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer is de beste periode om te starten als installateur?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Voor installateurs zijn de maanden september–november ideaal: nieuwe bewoners die in het voorjaar of zomer zijn verhuisd staan op het punt de winter in te gaan en denken aan cv-ketels, isolatie en verwarming. Maar ook in het voorjaar — na de verhuispiek in april–mei — zijn er direct kansen. Er is geen slechte maand om te starten.',
      },
    },
  ],
};

export default function FlyersInstallateur() {
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
          <span>Installateurs</span>
        </div>

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 48px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Branche — Installateurs & vakmensen
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Flyers versturen voor installateurs —<br /><em style={{ color: 'var(--green-dim)' }}>wees de eerste vakman</em><br />die nieuwe bewoners kennen
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '32px' }}>
            Nieuwe bewoners kopen een huis en hebben direct een lijst klussen: cv-ketel, stopcontacten, douche, isolatie. Ze zoeken een betrouwbare vakman in de buurt — en degene die al in de brievenbus lag, die bellen ze als eerste. LokaalKabaal verstuurt automatisch uw flyer zodra er een nieuwe eigenaar is geregistreerd in uw postcodes. Eerste opdracht gemiddeld <strong>€450</strong>. De flyer: minder dan €3.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start voor uw installatiebedrijf →
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
              Waarom nieuwe bewoners de ideale nieuwe klant zijn voor installateurs
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Een verhuizing is voor installateurs het perfecte moment. Een nieuw huis betekent nieuwe apparatuur, nieuwe storingen, nieuwe wensen. En de nieuwe bewoner heeft nog geen vaste loodgieter, geen vertrouwde elektricien, geen cv-monteur die ze al jaren kennen.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Gemiddeld heeft een nieuwe bewoner in het eerste jaar na de verhuizing <strong>2–4 installatievragen</strong>. Van een lekkende kraan tot het installeren van een laadpaal, van cv-ketel onderhoud tot het aanleggen van extra stopcontacten. Ze zoeken iemand die ze kunnen vertrouwen — en die ze snel kunnen bereiken.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              De beslissing wie ze bellen wordt vaak genomen in de eerste weken. Ze vragen buren om een aanbeveling, zoeken op Google, of — als er een flyer op de mat lag van een bedrijf dat professioneel overkomt — die bellen ze. Nabijheid en bekendheid zijn doorslaggevend. Advertenties op Google zijn duur en vluchtig. Een flyer op de mat is tastbaar en blijft.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Een klant die u eenmaal goed heeft geholpen, <strong>belt u voor alle volgende klussen</strong>. De lifetime value van een tevreden klant loopt voor een installatiebedrijf snel op naar €2.000–5.000 over meerdere jaren. De acquisitiekosten: één flyer van €3.
            </p>
          </section>

          {/* Blok 2 */}
          <section style={{ marginBottom: '56px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe LokaalKabaal automatisch uw flyercampagne beheert
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '20px' }}>
              U bent de hele dag op locatie. U heeft geen tijd voor marketing. LokaalKabaal doet het voor u.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>DE SETUP (EENMALIG — 20 MINUTEN)</div>
              {[
                'Maak een account aan en stel uw installatiebedrijf in',
                'Selecteer de postcodes in uw werkgebied',
                'Upload uw logo en contactgegevens (of gebruik ons installateurtemplate)',
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
              Elke dag monitort LokaalKabaal het Kadaster op nieuwe eigendomsoverdrachten in uw gekozen postcodes. Zodra er een nieuwe eigenaar is geregistreerd, start automatisch het drukproces. Binnen 2 werkdagen ligt uw flyer op de mat — terwijl de verhuisdozen nog in de gang staan.
            </p>
            <div style={{ background: 'var(--paper2)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>WAT STAAT ER OP EEN GOEDE INSTALLATEURFLYER?</div>
              {['Uw naam, logo en telefoonnummer — groot en leesbaar', 'Uw specialisaties: loodgieter / elektricien / cv / warmtepomp', 'Certificeringen en erkenningen (ISSO, VCA, e.d.)', 'Korte boodschap: "De vakman in uw wijk — bel voor een vrijblijvende offerte"', 'Eventueel: gratis inspectie of eerste adviesgesprek als aanbieding'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#555', padding: '3px 0' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </section>

          {/* ROI tabel */}
          <section id="rekensom" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              De rekensom voor uw installatiebedrijf
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                ['Gemiddeld aantal opdrachten per klant per jaar', '2'],
                ['Gemiddeld factuurbedrag per opdracht', '€350'],
                ['Jaarwaarde vaste klant', '€700'],
                ['Lifetime value (5 jaar)', '€3.500'],
                ['Kosten van de flyer die deze klant binnenbracht', '~€3'],
                ['Break-even conversieratio (bij €49/mnd abonnement)', '<1%'],
                ['Verwachte conversieratio welkomstflyer', '3–7%'],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', borderBottom: i < 6 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'var(--white)' : 'var(--paper)' }}>
                  <div style={{ padding: '10px 16px', fontSize: '13px', color: '#444' }}>{label}</div>
                  <div style={{ padding: '10px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: i === 6 ? 'var(--green-dim)' : 'var(--ink)', textAlign: 'right' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>REKENVOORBEELD — 15 NIEUWE BEWONERS/MND · 5% CONVERSIE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Nieuwe klanten/jaar', val: '~9' },
                  { label: 'Omzettoevoeging/jaar', val: '€6.300' },
                  { label: 'Netto ROI', val: '+969%' },
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
              Veelgestelde vragen voor installateurs over flyers versturen
            </h2>
            {[
              { q: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes?', a: 'In een stedelijke wijk in Nederland zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een installateur die 5–10 postcodes activeert, zijn dat 15–80 potentiële nieuwe klanten per maand. Met name koopwoningen genereren direct na overdracht installatievragen. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.' },
              { q: 'Wat is de beste aanbieding voor op mijn installateurflyer?', a: 'Voor installateurs werkt een gratis inspectie of vrijblijvend adviesgesprek goed als drempelverlagend aanbod. Nieuwe bewoners hebben vaak een checklist van klusjes — een cv-ketel keuring, nieuwe stopcontacten, warmtepomp advies. Positioneer uzelf als de "vaste vakman in de buurt" die ze kunnen bellen voor alles. Vermeld uw specialisaties en certificeringen duidelijk.' },
              { q: 'Wanneer is de beste periode om te starten als installateur?', a: 'Voor installateurs zijn de maanden september–november ideaal: nieuwe bewoners die in het voorjaar of zomer zijn verhuisd staan op het punt de winter in te gaan en denken aan cv-ketels, isolatie en verwarming. Maar ook in het voorjaar — na de verhuispiek in april–mei — zijn er direct kansen. Er is geen slechte maand om te starten.' },
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
                { href: '/flyers-versturen-bakker', label: 'Bakkers' },
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
              Uw eerste flyer gaat de deur uit<br />bij de volgende nieuwe bewoner in uw werkgebied.
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
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>© 2025 LokaalKabaal</div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { href: '/flyers-versturen-nieuwe-bewoners', label: 'Flyers nieuwe bewoners' },
              { href: '/direct-mail-mkb', label: 'Direct mail MKB' },
              { href: '/flyers-versturen-kapper', label: 'Kappers' },
              { href: '/flyers-versturen-bakker', label: 'Bakkers' },
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
