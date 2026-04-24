import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Flyers Versturen voor Kapper - Bereik Nieuwe Bewoners',
  description: 'Bereik nieuwe bewoners als kapper voordat ze een andere salon kiezen. Automatische flyers via Kadaster. Nieuwe klant = €360/jaar gemiddeld. Geen contract.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-kapper' },
  openGraph: {
    title: 'Flyers Versturen voor Kapper - Bereik Nieuwe Bewoners | LokaalKabaal',
    description: 'Bereik nieuwe bewoners als kapper voordat ze een andere salon kiezen. Automatische flyers via Kadaster. Nieuwe klant = €360/jaar.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-kapper',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes als kapper?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In een stedelijke wijk zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een kapsalon die 3–5 postcodes activeert, zijn dat 9–40 potentiële nieuwe klanten per maand. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat is de beste aanbieding voor op een kappersflyer voor nieuwe bewoners?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Het beste aanbod is een lagedrempel kennismakingsaanbieding: 15–20% korting op de eerste knipbeurt, of een gratis behandeling bij het eerste bezoek. De boodschap moet in één oogopslag duidelijk zijn: welkom in de wijk, kom kennismaken.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wanneer is de beste periode om te starten als kapsalon?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Verhuisbewegingen zijn het hele jaar door actief, met een piek van april tot september. Er is geen slechte maand -- elke maand dat u niet actief bent, zijn er nieuwe bewoners in uw wijk die een kapper kiezen zonder uw flyer te hebben ontvangen.',
      },
    },
  ],
};

export default function FlyersKapper() {
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
          <span>Kappers</span>
        </div>

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px 48px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Branche -- Kappers & kapsalons
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '44px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Flyers versturen voor kappers --<br /><em style={{ color: 'var(--green-dim)' }}>wees de eerste kapsalon</em><br />die nieuwe bewoners zien
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '600px', marginBottom: '32px' }}>
            Elke maand verhuizen er in Nederland tienduizenden mensen. Ze komen in een nieuwe wijk, een nieuwe straat. En binnen twee weken hebben ze één dringende praktische vraag: waar is hier een fatsoenlijke kapper? LokaalKabaal koppelt automatisch aan het Kadaster. Zodra er een nieuwe eigenaar is geregistreerd in de postcodes rondom uw kapsalon, verstuurt het systeem uw welkomstflyer naar dat adres. Gemiddelde klantwaarde: <strong>€360 per jaar</strong>. De flyer: minder dan €3.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start voor uw kapsalon →
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
              Waarom nieuwe bewoners uw meest waardevolle nieuwe klant zijn als kapper
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Een nieuwe bewoner is een kapper&apos;s ideale nieuwe klant -- niet ondanks het feit dat ze vreemd zijn in de buurt, maar precies dáároor.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Wanneer iemand verhuist, valt het kapperspreferentiesysteem volledig weg. De vaste kapper van tien jaar zit misschien aan de andere kant van de stad. Het is niet prettig om een uur te reizen voor een knipbeurt. De meeste nieuwe bewoners besluiten bewust of onbewust: ik ga een nieuwe, dichterbije kapper zoeken.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Die zoekopdracht begint gemiddeld <strong>binnen 10–14 dagen na de verhuizing</strong>. Ze googlen &quot;kapper [buurt]&quot;, vragen het aan de nieuwe buren, of stappen gewoon ergens binnen. Maar wie er als eerste een fysieke aanwijzing heeft gegeven dat ze bestaan -- een flyer op de mat, een aanbieding voor de eerste knipbeurt -- die staat al op de shortlist.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Het koopgedrag is ook anders dan bij gewone nieuwe klanten. Nieuwe bewoners zijn niet selectief op prijs -- ze zijn selectief op <strong>nabijheid en vertrouwen</strong>. Ze willen weten dat u er bent, dat u professioneel bent, en dat er een goede reden is om eens langs te komen. Een welkomstaanbieding (eerste knipbeurt met korting, of gratis wassen bij eerste bezoek) verlaagt de drempel tot nul.
            </p>
          </section>

          {/* Blok 2 */}
          <section style={{ marginBottom: '56px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe LokaalKabaal automatisch uw flyercampagne beheert
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '20px' }}>
              U heeft geen tijd om een marketingcampagne te runnen. U staat de hele dag achter de stoel. LokaalKabaal is gebouwd voor mensen zoals u.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>DE SETUP (EENMALIG -- 20 MINUTEN)</div>
              {[
                'Maak een account aan en stel uw kapsalon in',
                'Selecteer de postcodes rondom uw salon -- zo precies als u wilt, tot op wijkniveau',
                'Upload uw logo en de tekst voor uw welkomstflyer (of gebruik ons kapperstemplate)',
                'Betaal het maandabonnement en activeer',
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
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>WAT STAAT ER OP EEN GOEDE KAPPERSFLYER?</div>
              {['Uw naam, logo en adres -- duidelijk zichtbaar', 'Warme welkomstboodschap: "Welkom in de wijk"', 'Concrete aanbieding: bijv. 20% korting op eerste knipbeurt of gratis wassen', 'Telefoonnummer + QR-code naar uw boekingssysteem', 'Openingstijden'].map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#555', padding: '3px 0' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0 }}>✓</span>{s}
                </div>
              ))}
            </div>
          </section>

          {/* ROI tabel */}
          <section id="rekensom" style={{ marginBottom: '56px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              De rekensom voor uw kapsalon
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: '20px' }}>
              {[
                ['Gemiddelde knipcycli per vaste klant per jaar', '7'],
                ['Gemiddeld kaartbedrag per bezoek', '€50'],
                ['Jaarwaarde vaste klant', '€350'],
                ['Lifetime value (5 jaar)', '€1.750'],
                ['Kosten van de flyer die deze klant binnenbracht', '~€3'],
                ['Break-even conversieratio (bij €349/mnd abonnement)', '<1%'],
                ['Verwachte conversieratio welkomstflyer', '4–8%'],
              ].map(([label, val], i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', borderBottom: i < 6 ? '1px solid var(--line)' : 'none', background: i % 2 === 0 ? 'var(--white)' : 'var(--paper)' }}>
                  <div style={{ padding: '10px 16px', fontSize: '13px', color: '#444' }}>{label}</div>
                  <div style={{ padding: '10px 16px', fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: i === 6 ? 'var(--green-dim)' : 'var(--ink)', textAlign: 'right' }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', letterSpacing: '0.08em' }}>REKENVOORBEELD -- 10 NIEUWE BEWONERS/MND · 6% CONVERSIE</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { label: 'Nieuwe klanten/jaar', val: '~8' },
                  { label: 'Omzettoevoeging/jaar', val: '€2.800' },
                  { label: 'Netto ROI', val: '+376%' },
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
              Veelgestelde vragen voor kappers over flyers versturen
            </h2>
            {[
              { q: 'Hoeveel nieuwe bewoners zijn er gemiddeld per maand in mijn postcodes?', a: 'In een stedelijke wijk in Nederland zijn er gemiddeld 3–8 eigendomsoverdrachten per postcode per maand. Voor een kapsalon die 3–5 postcodes rondom zich activeert, betekent dat 9–40 potentiële nieuwe klanten per maand. In grotere steden of actieve verhuiswijken (bijv. nieuwbouwgebieden) kan dit hoger liggen. LokaalKabaal toont u vooraf het historische overdrachtsvolume voor uw gekozen postcodes.' },
              { q: 'Wat is de beste aanbieding voor op mijn kappersflyer?', a: 'Het beste aanbod voor nieuwe bewoners is een lagedrempel kennismakingsaanbieding: 15–20% korting op de eerste knipbeurt, of een gratis behandeling (wassen, masker) bij het eerste bezoek. Vermijd te complexe voorwaarden. De boodschap moet in één oogopslag duidelijk zijn: "Welkom in de wijk -- kom kennismaken." Voeg altijd uw telefoonnummer en eventueel een QR-code naar uw boekingspagina toe.' },
              { q: 'Wanneer is de beste periode om te starten als kapsalon?', a: 'Eerlijk antwoord: nu. Verhuisbewegingen zijn het hele jaar door actief, met een piek van april tot september. Als u in februari start, profiteert u optimaal van de voorjaarspiek. Maar ook in oktober–maart zijn er wekelijks nieuwe bewoners in elke stedelijke wijk. Er is geen "slechte" maand voor LokaalKabaal -- er zijn alleen maanden waarop u nog niet actief bent terwijl uw buren dat wel zijn.' },
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
                { href: '/flyers-versturen-bakker', label: 'Bakkers' },
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
              Uw eerste kappersflyer gaat de deur uit<br />bij de volgende nieuwe bewoner in uw wijk.
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
              { href: '/flyers-versturen-bakker', label: 'Bakkers' },
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
