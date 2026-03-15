import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Automatisch Flyers naar Nieuwe Bewoners Versturen',
  description: 'Bereik nieuwe huiseigenaren binnen 30 dagen na verhuizing. Automatische flyers via Kadaster-data. Druk + bezorging inbegrepen. Geen handmatig werk.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-nieuwe-bewoners' },
  openGraph: {
    title: 'Automatisch Flyers naar Nieuwe Bewoners Versturen | LokaalKabaal',
    description: 'Bereik nieuwe huiseigenaren binnen 30 dagen na verhuizing. Automatische flyers via Kadaster-data.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-nieuwe-bewoners',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is het legaal om Kadaster-data te gebruiken voor marketingdoeleinden?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. Eigendomsoverdrachten zijn openbare informatie die door het Kadaster beschikbaar wordt gesteld. LokaalKabaal gebruikt uitsluitend adresgegevens die publiek beschikbaar zijn voor postbezorging. LokaalKabaal verwerkt persoonsgegevens conform de AVG en levert u de gegevens niet rechtstreeks; de bezorging verloopt via geautoriseerde kanalen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe snel na een verhuizing ontvangen nieuwe bewoners mijn flyer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Het Kadaster registreert eigendomsoverdrachten doorgaans binnen 1–3 werkdagen na de notariële overdracht. LokaalKabaal pikt die registratie op en start direct het drukproces. Bezorging volgt binnen 2 werkdagen na detectie.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan ik zelf bepalen welke postcodes ik wil targeten?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja, volledig. U kiest zelf welke postcodes u wilt activeren. U kunt zo nauwkeurig zijn als één specifieke wijk, of zo breed als een heel stadsdeel. Er is geen minimum aantal postcodes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat als er een maand geen eigendomsoverdrachten zijn in mijn postcodes?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Als er een maand geen overdrachten zijn, verstuurt u die maand geen flyers en betaalt u alleen het basisabonnement. Er zijn geen kosten voor lege maanden bovenop het vaste bedrag.',
      },
    },
    {
      '@type': 'Question',
      name: 'Kan ik meerdere flyer-templates instellen voor verschillende doelgroepen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. U kunt meerdere templates aanmaken voor verschillende typen panden (appartement vs. gezinswoning), verschillende seizoenen, of specifieke aanbiedingen. Het systeem selecteert automatisch de juiste template op basis van regels die u zelf instelt.',
      },
    },
  ],
};

const NAV_LINKS = [
  { href: '/flyers-versturen-nieuwe-bewoners', label: 'Nieuwe bewoners' },
  { href: '/direct-mail-mkb', label: 'Direct mail' },
  { href: '/flyers-versturen-kapper', label: 'Branches' },
  { href: '/blog', label: 'Blog' },
];

export default function FlyersNieuweBewoners() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>

        {/* Nav */}
        <nav style={{ borderBottom: '1px solid var(--line)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--paper)', zIndex: 100 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ width: '22px', height: '22px', background: 'var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" fill="#00E87A" /></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '-.02em' }}>Lokaal<span style={{ color: 'var(--green)' }}>Kabaal</span></span>
          </Link>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>{l.label}</Link>
            ))}
            <Link href="/login" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', background: 'var(--green)', padding: '6px 14px', borderRadius: 'var(--radius)', textDecoration: 'none' }}>Start gratis →</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px 60px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Direct mail · Nieuwe bewoners · Kadaster-koppeling
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Flyers versturen naar<br />nieuwe bewoners —<br /><em style={{ color: 'var(--green-dim)' }}>volledig automatisch</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '32px' }}>
            Elke maand wisselt het Kadaster tienduizenden woningen van eigenaar. Die nieuwe bewoners staan voor een complete reset: geen vaste bakker, geen kapper, geen installateur. Ze staan open. Ze zijn actief op zoek. En ze maken hun keuzes razendsnel — 80% van de nieuwe bewoners heeft binnen 30 dagen hun lokale voorkeursleveranciers gekozen. LokaalKabaal verstuurt automatisch gepersonaliseerde flyers naar nieuwe bewoners op basis van Kadaster-data, zodat u in dat venster zit.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start gratis proefperiode →
            </Link>
            <Link href="#hoe-het-werkt" style={{ padding: '12px 24px', background: 'transparent', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px', border: '1px solid var(--line)' }}>
              Bekijk hoe het werkt
            </Link>
          </div>
        </section>

        {/* Stats strip */}
        <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--white)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0' }}>
            {[
              { n: '900.000+', label: 'verhuisbewegingen per jaar in NL (CBS)' },
              { n: '30 dagen', label: 'venster waarin nieuwe bewoners vaste keuzes maken' },
              { n: '4–8%', label: 'conversieratio welkomstflyer nieuwe bewoners' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '16px 24px', borderRight: i < 2 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-dim)', marginBottom: '4px' }}>{s.n}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>

          {/* Blok 1 */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Waarom nieuwe bewoners de meest waardevolle doelgroep zijn voor uw winkel
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Nieuwe bewoners zijn geen gewone consument. Ze zijn een doelgroep in een uitzonderlijke beslissingsfase — en voor lokale ondernemers is die fase goud waard.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Wanneer iemand verhuist, komen ze in een omgeving die ze nog niet kennen. Het sociale netwerk bestaat nog niet. De aanbevelingen van buren zijn er nog niet. Gewoontes zijn doorbroken. Alles staat open. In de eerste vier weken na een verhuizing koopt de gemiddelde nieuwe bewoner significant meer lokale diensten dan in enige andere periode van het jaar.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Dit noemen marketeers een <strong>"life event trigger"</strong> — een levensgebeurtenis die gedrag fundamenteel verandert. Verhuizen is verreweg de meest ingrijpende lokale trigger die bestaat. En anders dan andere life events is een verhuizing zichtbaar en traceerbaar via het Kadaster.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Dat maakt flyers versturen naar nieuwe bewoners uniek effectief. U richt u op mensen die net zijn gearriveerd, actief op zoek zijn, en nog geen enkel lokaal vooroordeel hebben. Uw flyer landt precies op het moment dat de beslissing nog open is. Voor een bakker in Utrecht: elke nieuwe eigenaar in een straal van 1,5 km is een potentiële dagelijkse klant. Eén gewonnen vaste klant levert gemiddeld €200–€400 per jaar op. De flyer kost een paar euro.
            </p>
          </section>

          {/* Blok 2 */}
          <section id="hoe-het-werkt" style={{ marginBottom: '60px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe LokaalKabaal automatisch flyers verstuurt op basis van Kadaster-data
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            {[
              { n: '01', title: 'Kadaster-monitoring', text: 'Het Kadaster registreert dagelijks alle eigendomsoverdrachten in Nederland. LokaalKabaal koppelt aan deze datastroom en monitort continu op overdrachten in de postcodes die u heeft geselecteerd. U stelt dit eenmalig in via uw dashboard.' },
              { n: '02', title: 'Automatische flyertrigger', text: 'Zodra een nieuwe eigendomsoverdracht is geregistreerd in uw doelgebied, start het systeem automatisch het drukproces. Uw flyer — voorzien van het adres van de nieuwe bewoner — wordt aangemaakt als gepersonaliseerde drukorder.' },
              { n: '03', title: 'Druk en bezorging binnen 2 werkdagen', text: 'De flyer wordt gedrukt en bezorgd via een geïntegreerde print-on-demand koppeling. Gemiddelde doorlooptijd: 2 werkdagen na de Kadaster-registratie. De nieuwe bewoner ontvangt uw bericht terwijl de verhuizing nog vers is.' },
              { n: '04', title: 'Dashboard en rapportage', text: 'In uw LokaalKabaal-dashboard ziet u precies welke adressen een flyer hebben ontvangen, welke postcodes actief zijn, en hoeveel eigendomsoverdrachten er deze maand zijn geweest in uw gebied.' },
            ].map(s => (
              <div key={s.n} style={{ display: 'flex', gap: '20px', marginBottom: '24px', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '4px 8px', borderRadius: 'var(--radius)', flexShrink: 0, marginTop: '2px' }}>{s.n}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{s.title}</div>
                  <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{s.text}</p>
                </div>
              </div>
            ))}
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', padding: '14px 16px', fontSize: '13px', color: 'var(--green-dim)', marginTop: '8px' }}>
              Er is geen vergelijkbaar systeem in Nederland dat Kadaster-data combineert met geautomatiseerde direct mail voor lokale MKB-ondernemers. LokaalKabaal is de eerste en enige aanbieder van dit type.
            </div>
          </section>

          {/* Blok 3 */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Wat lokale ondernemers verdienen aan één nieuwe vaste klant
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            {[
              { title: 'Kapsalon', text: 'Eén nieuwe vaste klant: 6–8 knipcycli per jaar × €45–60 = €270–480/jaar. Conversiedrempel om quitte te spelen: 0,8% van de ontvangers. Verwachte conversie welkomstflyer: 4–8%.' },
              { title: 'Installatiebedrijf', text: 'Nieuwe huiseigenaren besteden gemiddeld €4.000–12.000 aan installatie- en verbouwwerk in het eerste jaar. Eén opdracht per kwartaal via LokaalKabaal: €15.000–50.000 extra omzet per jaar.' },
              { title: 'Buurtrestaurant', text: 'Een vaste restaurantklant: 1–2 bezoeken per maand × €35 = €420–840/jaar. Nieuwe bewoners zonder stamkroeg zijn de meest ontvankelijke doelgroep. Bereik ze in week één, win ze voor jaren.' },
            ].map((b, i) => (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '12px', background: 'var(--white)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{b.title}</div>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{b.text}</p>
              </div>
            ))}
          </section>

          {/* Branches */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Voor welke bedrijven werkt dit?
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '20px' }}>
              LokaalKabaal werkt voor elke lokale ondernemer waarbij de klantrelatie na de eerste aankoop doorloopt. Nieuwe bewoners kiezen geen eenmalige leverancier — ze kiezen een vaste.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[
                { href: '/flyers-versturen-kapper', label: 'Kappers', sub: '€360 jaarwaarde per vaste klant' },
                { href: '/flyers-versturen-bakker', label: 'Bakkers', sub: 'Dagelijks terugkerende klant' },
                { href: '/flyers-versturen-installateur', label: 'Installateurs', sub: '€8.000 gem. eerste jaar' },
                { href: '/flyers-versturen-restaurant', label: 'Restaurants', sub: '€840 jaarwaarde per vaste gast' },
                { href: '/flyers-versturen-makelaar', label: 'Makelaars', sub: 'Begin de relatie op dag één' },
              ].map(b => (
                <Link key={b.href} href={b.href} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 16px', textDecoration: 'none', background: 'var(--white)', display: 'block' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '3px' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{b.sub}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '24px', letterSpacing: '-0.01em' }}>
              Veelgestelde vragen over flyers versturen naar nieuwe bewoners
            </h2>
            {[
              { q: 'Is het legaal om Kadaster-data te gebruiken voor marketingdoeleinden?', a: 'Ja. Eigendomsoverdrachten zijn openbare informatie die door het Kadaster beschikbaar wordt gesteld. LokaalKabaal gebruikt uitsluitend adresgegevens die publiek beschikbaar zijn voor postbezorging — dezelfde data die ook beschikbaar is via het Kadaster-informatieloket. LokaalKabaal verwerkt persoonsgegevens conform de AVG en levert u de gegevens niet rechtstreeks; de bezorging verloopt via geautoriseerde kanalen.' },
              { q: 'Hoe snel na een verhuizing ontvangen nieuwe bewoners mijn flyer?', a: 'Het Kadaster registreert eigendomsoverdrachten doorgaans binnen 1–3 werkdagen na de notariële overdracht. LokaalKabaal pikt die registratie op en start direct het drukproces. Bezorging volgt binnen 2 werkdagen na detectie. In de meeste gevallen ligt uw flyer bij de nieuwe bewoner op de mat terwijl die nog aan het inpakken of uitpakken is — ruimschoots binnen het 30-dagen venster.' },
              { q: 'Kan ik zelf bepalen welke postcodes ik wil targeten?', a: 'Ja, volledig. U kiest zelf welke postcodes u wilt activeren. U kunt zo nauwkeurig zijn als één specifieke wijk, of zo breed als een heel stadsdeel. Er is geen minimum aantal postcodes. Een bakker in de Utrechtse Rivierenwijk kan kiezen voor uitsluitend de postcodes binnen loopafstand van zijn zaak.' },
              { q: 'Wat als er een maand geen eigendomsoverdrachten zijn in mijn postcodes?', a: 'In stedelijk Nederland is dat vrijwel nooit het geval — de Kadasterdata tonen gemiddeld 2–5 overdrachten per postcode per maand. Maar als er een maand geen overdrachten zijn, verstuurt u die maand geen flyers en betaalt u alleen het basisabonnement. Er zijn geen kosten voor lege maanden bovenop het vaste bedrag.' },
              { q: 'Kan ik meerdere flyer-templates instellen voor verschillende doelgroepen?', a: 'Ja. U kunt meerdere templates aanmaken voor verschillende typen panden (appartement vs. gezinswoning), verschillende seizoenen, of specifieke aanbiedingen. Het systeem selecteert automatisch de juiste template op basis van regels die u zelf instelt.' },
            ].map((f, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '18px 0' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}>{f.q}</div>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>{f.a}</p>
              </div>
            ))}
          </section>

          {/* CTA */}
          <section style={{ background: 'var(--ink)', borderRadius: 'var(--radius)', padding: '40px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#fff', marginBottom: '12px', lineHeight: 1.2 }}>
              Start vandaag. Uw eerste flyer gaat de deur uit<br />zodra de eerste nieuwe eigenaar is geregistreerd.
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
              Geen contract · Per maand opzegbaar · Setup in 20 minuten
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '14px' }}>
              Gratis starten →
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--line)', padding: '32px 40px', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            © 2025 LokaalKabaal
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { href: '/direct-mail-mkb', label: 'Direct mail MKB' },
              { href: '/flyers-versturen-kapper', label: 'Kappers' },
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
