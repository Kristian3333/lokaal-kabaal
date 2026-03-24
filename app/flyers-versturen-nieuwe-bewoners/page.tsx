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
        text: 'Maandelijks verwerkt LokaalKabaal alle nieuwe eigendomsoverdrachten en verstuurt op de 25e een bulkprintorder. De nieuwe bewoner ontvangt uw flyer gemiddeld binnen 2–3 weken na hun verhuizing -- ruimschoots in het 30-dagen beslissingsvenster.',
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

        {/* ── HERO ── */}
        <section style={{
          background: 'var(--ink)',
          padding: '80px 40px 100px',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div className="fade-in" style={{ animationDelay: '0ms' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '4px 12px',
                background: 'rgba(0,232,122,0.08)',
                border: '1px solid rgba(0,232,122,0.2)',
                borderRadius: '20px',
                fontSize: '11px', fontFamily: 'var(--font-mono)',
                color: 'var(--green-dim)', marginBottom: '28px',
              }}>
                <span style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
                Hyperlocal direct mail · elke 25e automatisch verstuurd
              </div>
            </div>

            <div className="fade-in" style={{ animationDelay: '80ms' }}>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(38px, 6vw, 64px)',
                lineHeight: 1.03,
                fontWeight: 400,
                color: '#fff',
                letterSpacing: '-0.02em',
                marginBottom: '24px',
                maxWidth: '720px',
              }}>
                Elke 25e liggen jouw flyers<br />
                bij nieuwe bewoners <em style={{ color: 'var(--green)' }}>op de mat.</em>
              </h1>
            </div>

            <div className="fade-in" style={{ animationDelay: '160ms' }}>
              <p style={{
                fontSize: '17px', color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.7, maxWidth: '560px', marginBottom: '40px',
              }}>
                Elke maand verhuizen <strong style={{ color: '#fff' }}>tienduizenden huishoudens</strong> in Nederland. In de eerste 30 dagen kiezen ze hun vaste kapper, bakker en installateur. LokaalKabaal zorgt dat jouw flyer als eerste op de mat ligt.
              </p>
            </div>

            <div className="fade-in" style={{ animationDelay: '240ms', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                padding: '14px 28px',
                background: 'var(--green)', color: 'var(--ink)',
                borderRadius: 'var(--radius)', fontWeight: 800,
                fontSize: '14px', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                minHeight: '48px',
              }}>
                Eerste batch voor €49 →
              </Link>
              <Link href="#hoe-het-werkt" style={{
                padding: '14px 20px', color: 'rgba(255,255,255,0.5)',
                fontSize: '13px', textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center',
                minHeight: '48px',
              }}>
                Bekijk hoe het werkt
              </Link>
            </div>

            {/* Mini stats */}
            <div className="fade-in" style={{
              animationDelay: '320ms',
              display: 'flex', gap: '36px', marginTop: '52px',
              paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)',
              flexWrap: 'wrap',
            }}>
              {([
                ['900.000+', 'eigendomsoverdrachten/jaar in NL'],
                ['30 dagen',  'beslissingsvenster nieuwe bewoners'],
                ['4–8%',      'conversieratio welkomstflyer'],
              ] as [string, string][]).map(([n, l]) => (
                <div key={l}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: '#fff', marginBottom: '4px', lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', lineHeight: 1.4, maxWidth: '140px' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WAAROM NIEUWE BEWONERS ── */}
        <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="grid-2">
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Waarom het werkt
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, lineHeight: 1.1, marginBottom: '20px' }}>
                80% kiest binnen<br />
                <em style={{ color: 'var(--muted)' }}>30 dagen.</em>
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                Nieuwe bewoners zijn geen gewone consument. Ze zijn een doelgroep in een uitzonderlijke beslissingsfase -- en voor lokale ondernemers is die fase goud waard.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
                Wanneer iemand verhuist, komen ze in een omgeving die ze nog niet kennen. Gewoontes zijn doorbroken. Alles staat open. Dit noemen marketeers een <strong style={{ color: 'var(--ink)' }}>&quot;life event trigger&quot;</strong> -- een levensgebeurtenis die gedrag fundamenteel verandert.
              </p>
              <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.8 }}>
                LokaalKabaal zorgt dat jouw flyer in dat venster arriveert -- vóór je concurrent.
              </p>
            </div>

            {/* Timeline visual */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { dag: 'Dag 1',   label: 'Eigendomsoverdracht',    active: false, sub: 'Nieuwe eigenaar betreedt de woning' },
                { dag: 'Dag 3',   label: 'Jouw flyer arriveert',   active: true,  sub: 'LokaalKabaal bezorgt via PostNL' },
                { dag: 'Dag 7',   label: 'Eerste aankoop',         active: false, sub: 'Nieuwe bewoner kiest eerste leverancier' },
                { dag: 'Dag 30',  label: 'Vaste klant gevormd',    active: false, sub: '80% heeft alle leveranciers gekozen' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '16px 20px',
                  background: item.active ? 'var(--green-bg)' : '#fff',
                  border: `1px solid ${item.active ? 'rgba(0,232,122,0.25)' : 'var(--line)'}`,
                  borderRadius: i === 0 ? 'var(--radius) var(--radius) 0 0' : i === 3 ? '0 0 var(--radius) var(--radius)' : '0',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '10px',
                    color: item.active ? 'var(--green)' : 'var(--muted)',
                    paddingTop: '2px', flexShrink: 0, width: '38px',
                  }}>
                    {item.dag}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: item.active ? 700 : 500, color: item.active ? 'var(--green-dim)' : 'var(--ink)', marginBottom: '2px' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                      {item.sub}
                    </div>
                  </div>
                  {item.active && (
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <span style={{ width: '7px', height: '7px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOE HET WERKT ── */}
        <section id="hoe-het-werkt" style={{ background: 'var(--paper2)', padding: '80px 40px 100px' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '56px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                De maandelijkse cyclus
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, marginBottom: '12px' }}>
                Drie stappen. <em style={{ color: 'var(--muted)' }}>Dan loopt het vanzelf.</em>
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>
                Stel eenmalig in welke postcodes je wil bereiken. De rest doen wij elke maand automatisch.
              </p>
            </div>

            {/* Timeline strip */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0',
              marginBottom: '48px', borderRadius: 'var(--radius)', overflow: 'hidden',
              border: '1px solid var(--line)',
            }} className="timeline-grid">
              {[
                { dag: '20e', label: 'Verhuisdata beschikbaar', sub: 'nieuwe eigendomsoverdrachten' },
                { dag: '21–23e', label: 'LokaalKabaal verwerkt', sub: 'adressen per abonnee' },
                { dag: '24–25e', label: 'Printorder verstuurd', sub: 'gebundelde bulkrun' },
                { dag: '28–30e', label: 'Bezorging', sub: 'flyer op de mat bij nieuwe bewoner', highlight: true },
              ].map((t, i) => (
                <div key={i} style={{
                  padding: '20px 20px',
                  background: t.highlight ? 'var(--green-bg)' : '#fff',
                  borderRight: i < 3 ? '1px solid var(--line)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 700, color: 'var(--green-dim)', marginBottom: '6px' }}>{t.dag}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', marginBottom: '3px' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: 1.5 }}>{t.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)' }} className="grid-3">
              {[
                {
                  n: '01',
                  titel: 'Kies jouw postcodes',
                  tekst: 'Geef aan welke postcodegebieden je wil bereiken. Wij koppelen automatisch alle nieuwe eigendomsoverdrachten in die gebieden aan jouw campagne.',
                },
                {
                  n: '02',
                  titel: 'Upload je flyerontwerp',
                  tekst: 'Upload je eigen ontwerp of laat ons helpen. Elke flyer krijgt automatisch het juiste adres -- gepersonaliseerd voor elke nieuwe bewoner.',
                },
                {
                  n: '03',
                  titel: 'Elke 25e automatisch verstuurd',
                  tekst: 'Wij verwerken maandelijks alle overdrachten en sturen op de 25e een bulkorder. Jouw flyer ligt bij elke nieuwe bewoner in hun eerste maand.',
                },
              ].map((s, i) => (
                <div key={s.n} style={{ background: '#fff', padding: '36px 32px' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px',
                    background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)',
                    borderRadius: '6px', marginBottom: '20px',
                    fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)',
                  }}>
                    {s.n}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.25 }}>
                    {s.titel}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>
                    {s.tekst}
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)',
              borderRadius: 'var(--radius)', padding: '14px 20px',
              fontSize: '13px', color: 'var(--green-dim)', fontFamily: 'var(--font-mono)',
            }}>
              Gemiddelde doorlooptijd: nieuwe bewoner ontvangt jouw flyer binnen 2–3 weken na hun verhuizing. Ruimschoots in het 30-dagen beslissingsvenster.
            </div>
          </div>
        </section>

        {/* ── WAAROM LOKAAL ── */}
        <section style={{ background: 'var(--ink)', padding: '100px 40px' }}>
          <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
                Wat lokale ondernemers verdienen
              </div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 400, color: '#fff', marginBottom: '16px', lineHeight: 1.08 }}>
                Eén nieuwe vaste klant.<br />
                <em style={{ color: 'rgba(255,255,255,0.3)' }}>Betaalt het hele jaar terug.</em>
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', borderRadius: 'var(--radius)', overflow: 'hidden' }} className="grid-2">
              {[
                { branche: 'Kapsalon', waarde: '€360', sub: 'per vaste klant/jaar · 6–8 knipcycli × €50', tekst: 'Eén nieuwe vaste klant brengt de jaarkosten van een Buurt-abonnement ruimschoots terug -- zelfs in de eerste maand.' },
                { branche: 'Installatiebedrijf', waarde: '€8.000', sub: 'eerste jaar · gem. verbouwbudget nieuwe eigenaar', tekst: 'Nieuwe huiseigenaren besteden gemiddeld €4.000–12.000 aan installatie- en verbouwwerk in het eerste jaar.' },
                { branche: 'Restaurant', waarde: '€840', sub: 'per vaste gast/jaar · 2× p/mnd × €35', tekst: 'Nieuwe bewoners zonder stamkroeg zijn de meest ontvankelijke doelgroep. Bereik ze in week één.' },
                { branche: 'Bakkerij', waarde: '€520', sub: 'per vaste klant/jaar · dagelijkse terugkeer', tekst: 'Dagelijkse gewoontes vormen zich in de eerste weken. Wees er als eerste -- voor de concurrent.' },
              ].map((b, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0',
                  padding: '32px 28px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff' }}>{b.branche}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-dim)', flexShrink: 0, marginLeft: '16px' }}>{b.waarde}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}>{b.sub}</div>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{b.tekst}</p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '16px',
              textAlign: 'center', padding: '24px',
              background: 'rgba(0,232,122,0.05)',
              border: '1px solid rgba(0,232,122,0.15)',
              borderRadius: '12px',
            }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: '#fff' }}>
                Break-even: <em style={{ color: 'var(--green)' }}>1 nieuwe vaste klant per 2 maanden.</em>
              </span>
              <span style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
                Wijk-abonnement · €399/mnd service · printkosten €0,69/flyer apart
              </span>
            </div>
          </div>
        </section>

        {/* ── VOOR WIE ── */}
        <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Voor wie
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, marginBottom: '12px' }}>
              Elke lokale ondernemer waarbij<br />
              <em style={{ color: 'var(--muted)' }}>klanten terugkomen.</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--line)' }} className="grid-4">
            {[
              { href: '/flyers-versturen-kapper', label: 'Kappers', sub: '€360 jaarwaarde per vaste klant', icon: '✂' },
              { href: '/flyers-versturen-bakker', label: 'Bakkers', sub: 'Dagelijks terugkerende klant', icon: '🥖' },
              { href: '/flyers-versturen-installateur', label: 'Installateurs', sub: '€8.000 gem. eerste jaar', icon: '🔧' },
              { href: '/flyers-versturen-restaurant', label: 'Restaurants', sub: '€840 jaarwaarde per vaste gast', icon: '🍽' },
            ].map(b => (
              <Link key={b.href} href={b.href} style={{
                background: '#fff', padding: '28px 24px',
                textDecoration: 'none', display: 'block',
              }}>
                <div style={{ fontSize: '24px', marginBottom: '12px' }}>{b.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)', marginBottom: '4px' }}>{b.label}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{b.sub}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── PRICING ── */}
        <PricingSection />

        {/* ── FAQ ── */}
        <section style={{ padding: '80px 40px', maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
              Veelgestelde vragen
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 400 }}>
              Alles over flyers naar nieuwe bewoners
            </h2>
          </div>
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            {[
              { q: 'Is het legaal om verhuisdata te gebruiken voor marketingdoeleinden?', a: 'Ja. Eigendomsoverdrachten zijn openbare informatie. LokaalKabaal gebruikt uitsluitend adresgegevens die publiek beschikbaar zijn voor postbezorging. Persoonsgegevens worden verwerkt conform de AVG; de bezorging verloopt via geautoriseerde kanalen.' },
              { q: 'Hoe snel na een verhuizing ontvangen nieuwe bewoners mijn flyer?', a: 'Maandelijks verwerkt LokaalKabaal alle nieuwe eigendomsoverdrachten en verstuurt op de 25e een bulkprintorder. Nieuwe bewoners ontvangen jouw flyer gemiddeld 2–3 weken na hun verhuizing -- ruimschoots binnen het 30-dagen venster.' },
              { q: 'Kan ik zelf bepalen welke postcodes ik wil targeten?', a: 'Ja, volledig. Je kiest zelf welke postcodes je wilt activeren. Je kunt zo nauwkeurig zijn als één specifieke wijk, of zo breed als een heel stadsdeel. Er is geen minimum aantal postcodes.' },
              { q: 'Wat als er een maand geen eigendomsoverdrachten zijn in mijn postcodes?', a: 'In stedelijk Nederland is dat vrijwel nooit het geval -- gemiddeld zijn er 3–8 overdrachten per PC4-postcode per maand. Als er een maand geen overdrachten zijn, verstuurt je die maand geen flyers en betaal je alleen het serviceabonnement.' },
              { q: 'Kan ik meerdere flyer-templates instellen voor verschillende doelgroepen?', a: 'Ja. Je kunt meerdere templates aanmaken voor verschillende typen panden (appartement vs. gezinswoning), verschillende seizoenen, of specifieke aanbiedingen. Het systeem selecteert automatisch de juiste template op basis van regels die je zelf instelt.' },
            ].map((f, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--line)', padding: '22px 0' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', color: 'var(--ink)' }}>{f.q}</div>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.75 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section style={{ padding: '80px 40px 100px', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 400, marginBottom: '16px', lineHeight: 1.08 }}>
            Start vandaag. Op de 25e liggen<br />
            <em style={{ color: 'var(--muted)' }}>jouw flyers bij de nieuwe bewoners.</em>
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '15px', marginBottom: '36px', lineHeight: 1.65 }}>
            Geen contract · Per maand opzegbaar · Setup in 20 minuten · Elke 25e automatisch verstuurd
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Link href="/login" style={{
              padding: '16px 40px',
              background: 'var(--ink)', color: '#fff',
              borderRadius: 'var(--radius)', fontWeight: 800,
              fontSize: '15px', textDecoration: 'none',
              minHeight: '52px',
              display: 'inline-flex', alignItems: 'center',
            }}>
              Eerste batch voor €49 →
            </Link>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Eenmalig instappen · of direct abonnement · vanaf €199/mnd service + printkosten
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          borderTop: '1px solid var(--line)', padding: '28px 40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)',
          flexWrap: 'wrap', gap: '16px',
        }}>
          <span>© 2026 LokaalKabaal B.V.</span>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              ['/direct-mail-mkb', 'Direct mail MKB'],
              ['/flyers-versturen-kapper', 'Kappers'],
              ['/flyers-versturen-bakker', 'Bakkers'],
              ['/flyers-versturen-installateur', 'Installateurs'],
              ['/blog', 'Blog'],
              ['/privacy', 'Privacy'],
            ].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: 'var(--muted)', textDecoration: 'none' }}>{label}</Link>
            ))}
          </div>
        </footer>

        <style>{`
          @media (max-width: 768px) {
            .timeline-grid { grid-template-columns: 1fr 1fr !important; }
          }
          @media (max-width: 480px) {
            .timeline-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </>
  );
}
