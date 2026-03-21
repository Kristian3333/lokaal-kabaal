import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyers Versturen voor Makelaars — Bereik Nieuwe Bewoners',
  description: 'Bereik nieuwe bewoners als makelaar op het moment dat ze nadenken over hun volgende stap. Automatische flyers via Kadaster. Gemiddelde opdracht €8.500. Geen contract.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-makelaar' },
  openGraph: {
    title: 'Flyers Versturen voor Makelaars — Bereik Nieuwe Bewoners | LokaalKabaal',
    description: 'Bereik nieuwe bewoners als makelaar op het moment dat ze nadenken over hun volgende stap. Automatische flyers via Kadaster. Gemiddelde opdracht €8.500.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-makelaar',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes als makelaar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In een stedelijke wijk zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Elke overdracht is een potentieel contact voor uw kantoor — iemand die net gekocht heeft, kent anderen die willen kopen of verkopen. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is de beste boodschap voor op een makelaarsflyer voor nieuwe bewoners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Voor makelaars werkt een informatieve, niet-verkopende boodschap het beste: "Welkom in de wijk — wij kennen elke straat hier." Geef waarde mee: een gratis waardebepaling van hun nieuwe woning, of een lokale marktupdate. Nieuwe bewoners zijn al in de makelaarswereld — ze staan open voor iemand die lokale expertise uitstraalt.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer is de beste periode om te starten als makelaar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Voor makelaars is er eigenlijk altijd een goed moment — eigendomsoverdrachten zijn het hele jaar actief. De verhuispiek van april–september genereert het meeste volume. Maar de contacten die u nu legt, resulteren in opdrachten 12–24 maanden later. Hoe eerder u start, hoe eerder u de pipeline vult.',
      },
    },
  ],
};

export default function FlyersMakelaar() {
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
          <span>Makelaars</span>
        </div>

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 48px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Branche — Makelaars & vastgoed
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Flyers versturen voor makelaars —<br /><em style={{ color: 'var(--green-dim)' }}>wees de eerste makelaar</em><br />die nieuwe bewoners kennen
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '32px' }}>
            Iemand die net een huis heeft gekocht, is binnen 3–5 jaar vaak weer klaar voor de volgende stap. En ze kennen tientallen anderen die ook kopen of verkopen. Wie die relatie als eerste legt — direct na de verhuizing — heeft een structureel voordeel. LokaalKabaal verstuurt automatisch uw welkomstflyer zodra er een nieuwe eigenaar is geregistreerd in uw postcodes. Gemiddelde makelaarsprovisie: <strong>€8.500</strong>. De flyer: minder dan €3.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start voor uw makelaarskantoor →
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
              Waarom nieuwe bewoners de meest waardevolle contacten zijn voor uw makelaarskantoor
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Makelaarswerk draait op relaties en timing. En er is geen beter moment om een relatie te leggen dan precies wanneer iemand net heeft verhuisd.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Iemand die net een woning heeft gekocht, is actief in de vastgoedwereld. Ze kennen het proces. Ze praten erover met vrienden en familie. Ze horen wie ook wil kopen, wie wil verkopen. <strong>Elke nieuwe bewoner is een potentieel netwerkknooppunt</strong> — niet alleen een toekomstige opdrachtgever zelf, maar ook een bron van doorverwijzingen.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              De gemiddelde huizenbezitter verhuist elke 7–10 jaar. Wie die relatie nu legt, plukt daar over een aantal jaar de vruchten van. En in de tussentijd: elk gesprek, elke aanbeveling, elke doorverwijzing begint ermee dat ze uw naam kennen.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              De meeste makelaars investeren in dure online advertenties die breed gericht zijn en kort leven. Een fysieke flyer bij een nieuwe bewoner thuis — op het moment dat ze nog vol in de verhuissfeer zitten en openstaan voor lokale contacten — is gerichter, goedkoper en blijvender.
            </p>
          </section>

          {/* Blok 2 */}
          <section style={{ marginBottom: '56px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe LokaalKabaal automatisch uw flyercampagne beheert
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '20px' }}>
              U bent bezig met bezichtigingen, onderhandelingen en papierwerk. LokaalKabaal bouwt ondertussen uw lokale naamsbekendheid op.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>DE SETUP (EENMALIG — 20 MINUTEN)</div>
              {[
                'Maak een account aan en stel uw makelaarskantoor in',
                'Selecteer de postcodes in uw werkgebied',
                'Upload uw logo en boodschap (of gebruik ons makelaarstemplate)',
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>WAT STAAT ER OP EEN GOEDE MAKELAARSFLYER?</div>
              {['Uw naam, kantoor en telefoonnummer — professioneel uitgestraald', 'Lokale marktkennis benadrukken: "Al X jaar actief in deze wijk"', 'Gratis waardebepaling als drempelverlagend aanbod', 'Recente verkoopresultaten in de buurt (optioneel maar overtuigend)', 'QR-code naar uw website of directe contactpagina'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#555', padding: '3px 0' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </section>

          {/* ROI tabel */}
          <section id="rekensom" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              De rekensom voor uw makelaarskantoor
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                ['Gemiddelde verkoopwaarde woning in Nederland', '€425.000'],
                ['Gemiddelde makelaarsprovisie (2%)', '€8.500'],
                ['Gemiddelde tijd tot opdracht (na eerste contact)', '1–3 jaar'],
                ['Kosten van de flyer die dit contact legde', '~€3'],
                ['Break-even conversieratio (bij €49/mnd abonnement)', '<0,1%'],
                ['Verwachte conversieratio welkomstflyer (tot opdracht)', '1–3%'],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', borderBottom: i < 5 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'var(--white)' : 'var(--paper)' }}>
                  <div style={{ padding: '10px 16px', fontSize: '13px', color: '#444' }}>{label}</div>
                  <div style={{ padding: '10px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: i === 5 ? 'var(--green-dim)' : 'var(--ink)', textAlign: 'right' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>REKENVOORBEELD — 20 NIEUWE BEWONERS/MND · 2% CONVERSIE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Nieuwe opdrachten/jaar', val: '~5' },
                  { label: 'Omzettoevoeging/jaar', val: '€42.500' },
                  { label: 'Netto ROI', val: '+7.155%' },
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
              Veelgestelde vragen voor makelaars over flyers versturen
            </h2>
            {[
              { q: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes?', a: 'In een stedelijke wijk in Nederland zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Elke overdracht is een potentieel contact voor uw kantoor. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.' },
              { q: 'Wat is de beste boodschap voor op mijn makelaarsflyer?', a: 'Voor makelaars werkt een informatieve, niet-verkopende boodschap het beste: "Welkom in de wijk — wij kennen elke straat hier." Geef waarde mee: een gratis waardebepaling van hun nieuwe woning, of een lokale marktupdate. Nieuwe bewoners zijn al in de makelaarswereld — ze staan open voor iemand die lokale expertise uitstraalt.' },
              { q: 'Wanneer is de beste periode om te starten als makelaar?', a: 'Voor makelaars is er eigenlijk altijd een goed moment — eigendomsoverdrachten zijn het hele jaar actief. De verhuispiek van april–september genereert het meeste volume. Maar de contacten die u nu legt, resulteren in opdrachten 12–24 maanden later. Hoe eerder u start, hoe eerder u de pipeline vult.' },
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
                { href: '/flyers-versturen-installateur', label: 'Installateurs' },
                { href: '/flyers-versturen-restaurant', label: 'Restaurants' },
                { href: '/flyers-versturen-nieuwe-bewoners', label: 'Alle branches' },
              ].map(b => (
                <Link key={b.href} href={b.href} style={{ padding: '6px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', textDecoration: 'none', fontSize: '12px', color: 'var(--ink)', fontFamily: 'var(--font-mono)', background: 'var(--white)' }}>{b.label}</Link>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section style={{ background: 'var(--ink)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>
              Uw eerste makelaarsflyer gaat de deur uit<br />bij de volgende nieuwe bewoner in uw werkgebied.
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
              { href: '/flyers-versturen-restaurant', label: 'Restaurants' },
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
