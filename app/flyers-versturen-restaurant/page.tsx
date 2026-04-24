import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyers Versturen voor Restaurants - Bereik Nieuwe Bewoners',
  description: 'Bereik nieuwe bewoners als restaurant voordat ze hun vaste eetadres kiezen. Automatische flyers via Kadaster. Vaste gast = €600/jaar gemiddeld. Geen contract.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-restaurant' },
  openGraph: {
    title: 'Flyers Versturen voor Restaurants - Bereik Nieuwe Bewoners | LokaalKabaal',
    description: 'Bereik nieuwe bewoners als restaurant voordat ze hun vaste eetadres kiezen. Automatische flyers via Kadaster. Vaste gast = €600/jaar.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-restaurant',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes als restaurant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In een stedelijke wijk zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een restaurant dat 3–5 postcodes rondom zich activeert, zijn dat 9–40 potentiële nieuwe gasten per maand. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is de beste aanbieding voor op een restaurantflyer voor nieuwe bewoners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een welkomstaanbieding werkt goed: een gratis aperitief bij het eerste bezoek, 10% korting op de eerste reservering, of een gratis dessert. Zet uw sfeer en keuken in de verf met een mooie foto. Nieuwe bewoners willen weten "wat is dit voor tent" -- geef ze die indruk in één oogopslag. Voeg altijd een reserveringslink of telefoonnummer toe.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer is de beste periode om te starten als restaurant?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Voor restaurants zijn er twee goede periodes: direct na de verhuispiek (juni–augustus) als nieuwe bewoners hun buurt verkennen, en in het najaar (september–november) als mensen meer binnen eten. Maar eerlijk gezegd: elk moment is goed. Nieuwe bewoners zoeken het hele jaar door een vaste buurtrestaurant.',
      },
    },
  ],
};

export default function FlyersRestaurant() {
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
          <span>Restaurants</span>
        </div>

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 48px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Branche -- Restaurants & eetgelegenheden
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Flyers versturen voor restaurants --<br /><em style={{ color: 'var(--green-dim)' }}>wees het eerste restaurant</em><br />dat nieuwe bewoners ontdekken
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '32px' }}>
            Nieuwe bewoners verkennen hun buurt. Ze zoeken een restaurant om te vieren, te ontspannen, te eten als ze geen zin hebben om te koken. Het restaurant dat ze als eerste leren kennen -- via een flyer op de mat -- heeft een structureel voordeel. LokaalKabaal verstuurt automatisch uw welkomstflyer zodra er een nieuwe eigenaar is geregistreerd in uw postcodes. Vaste gast: gemiddeld <strong>€600 per jaar</strong>. De flyer: minder dan €3.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start voor uw restaurant →
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
              Waarom nieuwe bewoners de ideale nieuwe gast zijn voor uw restaurant
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Mensen die verhuizen, beginnen hun sociale leven opnieuw op te bouwen. Ze zoeken een buurtrestaurant om vrienden uit te nodigen, om te gaan eten na een lange verhuisdag, om te ontsnappen aan de verhuischaos. Ze zijn actief, nieuwsgierig en open voor ontdekkingen.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Restaurants bouwen hun klantenbestand op basis van gewoontes en herinneringen. Het restaurant waar je voor het eerst naartoe ging in de nieuwe buurt -- dat blijft hangen. <strong>Eerste indrukken zijn disproportioneel sterk</strong> in de horeca. Wie er vroeg bij is, plukt daar jaren van.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Nieuwe bewoners beslissen snel. Binnen de eerste maand na de verhuizing zijn ze al in de meeste horecagelegenheden in de buurt geweest die ze opvielen -- of hebben ze er al één als favoriet aangemerkt. Wie op dat moment al op de mat lag, was er eerder dan Google en eerder dan de buren.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Een vaste restaurantgast komt gemiddeld 1–2 keer per maand. Bij een gemiddelde besteding van €35–50 per bezoek loopt dat op tot <strong>€420–1.200 per jaar</strong>. En ze nemen vrienden mee.
            </p>
          </section>

          {/* Blok 2 */}
          <section style={{ marginBottom: '56px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe LokaalKabaal automatisch uw flyercampagne beheert
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '20px' }}>
              U draait de bediening, de keuken, de inkoop. Marketing is het laatste waar u aan wilt denken. LokaalKabaal regelt het.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>DE SETUP (EENMALIG -- 20 MINUTEN)</div>
              {[
                'Maak een account aan en stel uw restaurant in',
                'Selecteer de postcodes rondom uw zaak',
                'Upload uw logo en een sfeervolle foto van uw gerecht of interieur',
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>WAT STAAT ER OP EEN GOEDE RESTAURANTFLYER?</div>
              {['Uw naam, logo en adres -- duidelijk en stijlvol', 'Een pakkende sfeer: keuken, sfeer, doelgroep in één zin', 'Welkomstaanbieding: bijv. gratis aperitief of 10% korting eerste bezoek', 'Reserveringslink, telefoonnummer of QR-code', 'Openingstijden en sluitingsdagen'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#555', padding: '3px 0' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </section>

          {/* ROI tabel */}
          <section id="rekensom" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              De rekensom voor uw restaurant
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                ['Gemiddeld aantal bezoeken per vaste gast per maand', '1,5'],
                ['Gemiddelde besteding per bezoek', '€40'],
                ['Jaarwaarde vaste gast', '€720'],
                ['Lifetime value (5 jaar)', '€3.600'],
                ['Kosten van de flyer die deze gast binnenbracht', '~€3'],
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
                  { label: 'Nieuwe gasten/jaar', val: '~6' },
                  { label: 'Omzettoevoeging/jaar', val: '€4.320' },
                  { label: 'Netto ROI', val: '+637%' },
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
              Veelgestelde vragen voor restaurants over flyers versturen
            </h2>
            {[
              { q: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes?', a: 'In een stedelijke wijk in Nederland zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een restaurant dat 3–5 postcodes rondom zich activeert, zijn dat 9–40 potentiële nieuwe gasten per maand. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.' },
              { q: 'Wat is de beste aanbieding voor op mijn restaurantflyer?', a: 'Een welkomstaanbieding werkt goed: een gratis aperitief bij het eerste bezoek, 10% korting op de eerste reservering, of een gratis dessert. Zet uw sfeer en keuken in de verf met een mooie foto. Nieuwe bewoners willen weten "wat is dit voor tent" -- geef ze die indruk in één oogopslag. Voeg altijd een reserveringslink of telefoonnummer toe.' },
              { q: 'Wanneer is de beste periode om te starten als restaurant?', a: 'Voor restaurants zijn er twee goede periodes: direct na de verhuispiek (juni–augustus) als nieuwe bewoners hun buurt verkennen, en in het najaar (september–november) als mensen meer binnen eten. Maar eerlijk gezegd: elk moment is goed. Nieuwe bewoners zoeken het hele jaar door een vaste buurtrestaurant.' },
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
              Uw eerste restaurantflyer gaat de deur uit<br />bij de volgende nieuwe bewoner in uw buurt.
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
