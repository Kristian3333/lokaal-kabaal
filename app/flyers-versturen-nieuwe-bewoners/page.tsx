import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import PricingSection from '@/components/PricingSection';

export const metadata: Metadata = {
  title: 'Flyers naar Nieuwe Bewoners Versturen | Maandelijks Automatisch',
  description: 'Bereik nieuwe huiseigenaren elke maand automatisch. LokaalKabaal verstuurt elke 25e gepersonaliseerde flyers naar alle nieuwe bewoners in uw postcodes. Geen handmatig werk.',
  alternates: { canonical: 'https://lokaalkabaal.agency/flyers-versturen-nieuwe-bewoners' },
  openGraph: {
    title: 'Flyers naar Nieuwe Bewoners Versturen | LokaalKabaal',
    description: 'Elke 25e van de maand bereikt u alle nieuwe eigenaren in uw postcodes. Automatisch, zonder handmatig werk.',
    url: 'https://lokaalkabaal.agency/flyers-versturen-nieuwe-bewoners',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is het legaal om verhuisdata te gebruiken voor marketingdoeleinden?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. Eigendomsoverdrachten zijn openbare informatie. LokaalKabaal gebruikt uitsluitend adresgegevens die publiek beschikbaar zijn voor postbezorging. Persoonsgegevens worden verwerkt conform de AVG; de bezorging verloopt via geautoriseerde kanalen.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe snel na een verhuizing ontvangen nieuwe bewoners mijn flyer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Maandelijks verwerkt LokaalKabaal alle nieuwe eigendomsoverdrachten en verstuurt op de 25e een bulkprintorder. De nieuwe bewoner ontvangt uw flyer gemiddeld binnen 2–3 weken na hun verhuizing — ruimschoots in het 30-dagen beslissingsvenster.',
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

export default function FlyersNieuweBewoners() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>

        <Nav />

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px 60px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Direct mail · Nieuwe bewoners · Elke 25e automatisch
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Elke 25e liggen uw flyers<br />bij de nieuwe bewoners<br /><em style={{ color: 'var(--green-dim)' }}>op de mat</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '32px' }}>
            Elke maand verhuizen tienduizenden mensen naar een nieuw huis. LokaalKabaal verwerkt maandelijks alle eigendomsoverdrachten in uw postcodes en verstuurt op de 25e een gepersonaliseerde flyer naar elke nieuwe bewoner. Gemiddeld binnen 2–3 weken na de verhuizing — precies in het venster waarin 80% van de nieuwe bewoners hun vaste lokale leveranciers kiest.
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
              { n: '900.000+', label: 'woningwisselingen per jaar in Nederland' },
              { n: '25e', label: 'van de maand: uw flyers gaan eruit, zonder dat u iets doet' },
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
              Dit noemen marketeers een <strong>"life event trigger"</strong> — een levensgebeurtenis die gedrag fundamenteel verandert. Verhuizen is verreweg de meest ingrijpende lokale trigger die bestaat. En anders dan andere life events is een verhuizing openbaar geregistreerd en traceerbaar.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Dat maakt flyers versturen naar nieuwe bewoners uniek effectief. U richt u op mensen die net zijn gearriveerd, actief op zoek zijn, en nog geen enkel lokaal vooroordeel hebben. Uw flyer landt precies op het moment dat de beslissing nog open is. Voor een bakker in Utrecht: elke nieuwe eigenaar in een straal van 1,5 km is een potentiële dagelijkse klant. Eén gewonnen vaste klant levert gemiddeld €200–€400 per jaar op. De flyer kost een paar euro.
            </p>
          </section>

          {/* Blok 2 */}
          <section id="hoe-het-werkt" style={{ marginBottom: '60px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Hoe de maandelijkse cyclus werkt
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />

            {/* Timeline visual */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', marginBottom: '28px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)' }}>
              {[
                { dag: '20e', label: 'Verhuisdata beschikbaar', sub: 'nieuwe eigendomsoverdrachten', color: 'var(--paper)' },
                { dag: '21–23e', label: 'LokaalKabaal verwerkt', sub: 'adressen per abonnee', color: 'var(--white)' },
                { dag: '24–25e', label: 'Printorder verstuurd', sub: 'gebundelde bulkrun', color: 'var(--paper)' },
                { dag: '28–30e', label: 'Bezorging', sub: 'flyer op de mat bij nieuwe bewoner', color: 'var(--green-bg)' },
              ].map((t, i) => (
                <div key={i} style={{ padding: '14px 16px', background: t.color, borderRight: i < 3 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--green-dim)', marginBottom: '4px' }}>{t.dag}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.4 }}>{t.sub}</div>
                </div>
              ))}
            </div>

            {[
              { n: '01', title: 'Eenmalige setup via uw dashboard', text: 'U kiest uw postcodes, uploadt uw flyer-template en stelt uw branche in. Dat is alles. Vanaf dat moment loopt alles automatisch — u hoeft niets meer te doen.' },
              { n: '02', title: 'Verhuisdata op de 20e', text: 'Maandelijks worden alle nieuwe eigendomsoverdrachten verwerkt en gepubliceerd. LokaalKabaal haalt automatisch alle nieuwe adressen op in uw geselecteerde postcodes.' },
              { n: '03', title: 'Verwerking en bulkprint op de 25e', text: 'LokaalKabaal bundelt alle adressen per abonnee, koppelt het juiste template, en plaatst één gepoold printorder. Alle flyers worden tegelijk gedrukt en individueel geadresseerd verstuurd via PostNL. Bulk printen = lagere kosten per stuk.' },
              { n: '04', title: 'Bezorging en rapportage', text: 'Eind van de maand liggen de flyers bij de nieuwe bewoners. In uw dashboard ziet u hoeveel flyers er zijn verstuurd, naar welke adressen, en wat de overdrachtsactiviteit per postcode was die maand.' },
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
              Gemiddelde doorlooptijd: nieuwe bewoner ontvangt uw flyer binnen 2–3 weken na hun verhuizing. Ruimschoots in het 30-dagen beslissingsvenster.
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
              ].map(b => (
                <Link key={b.href} href={b.href} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '14px 16px', textDecoration: 'none', background: 'var(--white)', display: 'block' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--ink)', marginBottom: '3px' }}>{b.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{b.sub}</div>
                </Link>
              ))}
            </div>
          </section>

          <PricingSection />

          {/* FAQ */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '24px', letterSpacing: '-0.01em' }}>
              Veelgestelde vragen over flyers versturen naar nieuwe bewoners
            </h2>
            {[
              { q: 'Is het legaal om verhuisdata te gebruiken voor marketingdoeleinden?', a: 'Ja. Eigendomsoverdrachten zijn openbare informatie. LokaalKabaal gebruikt uitsluitend adresgegevens die publiek beschikbaar zijn voor postbezorging. Persoonsgegevens worden verwerkt conform de AVG; de bezorging verloopt via geautoriseerde kanalen.' },
              { q: 'Hoe snel na een verhuizing ontvangen nieuwe bewoners mijn flyer?', a: 'Maandelijks verwerkt LokaalKabaal alle nieuwe eigendomsoverdrachten en verstuurt op de 25e een bulkprintorder. Nieuwe bewoners ontvangen uw flyer gemiddeld 2–3 weken na hun verhuizing — ruimschoots binnen het 30-dagen venster waarin nieuwe bewoners hun vaste lokale leveranciers kiezen.' },
              { q: 'Kan ik zelf bepalen welke postcodes ik wil targeten?', a: 'Ja, volledig. U kiest zelf welke postcodes u wilt activeren. U kunt zo nauwkeurig zijn als één specifieke wijk, of zo breed als een heel stadsdeel. Er is geen minimum aantal postcodes. Een bakker in de Utrechtse Rivierenwijk kan kiezen voor uitsluitend de postcodes binnen loopafstand van zijn zaak.' },
              { q: 'Wat als er een maand geen eigendomsoverdrachten zijn in mijn postcodes?', a: 'In stedelijk Nederland is dat vrijwel nooit het geval — gemiddeld zijn er 3–8 overdrachten per PC4-postcode per maand. Maar als er een maand geen overdrachten zijn, verstuurt u die maand geen flyers en betaalt u alleen het abonnement. Er zijn geen extra kosten voor lege maanden.' },
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
              Start vandaag. Op de 25e liggen<br />uw flyers bij de nieuwe bewoners.
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
              Geen contract · Per maand opzegbaar · Setup in 20 minuten · Elke 25e automatisch verstuurd
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
