import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Direct Mail voor MKB — Automatisch, Lokaal, Meetbaar',
  description: 'Direct mail voor MKB op basis van Kadaster-data. Gerichter dan Google Ads, geen campagnebeheer. Druk en bezorging automatisch geregeld.',
  alternates: { canonical: 'https://lokaalkabaal.agency/direct-mail-mkb' },
  openGraph: {
    title: 'Direct Mail voor MKB — Automatisch, Lokaal, Meetbaar | LokaalKabaal',
    description: 'Direct mail voor lokaal MKB op basis van Kadaster-data. Gerichter dan Google Ads, geen campagnebeheer.',
    url: 'https://lokaalkabaal.agency/direct-mail-mkb',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wat is het verschil tussen LokaalKabaal en een gewone huis-aan-huisfolder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Een huis-aan-huisfolder gaat naar alle adressen in een gebied, ongeacht of de bewoner al klant is bij een concurrent. LokaalKabaal verstuurt uitsluitend naar nieuwe eigendomsoverdrachten — mensen die net zijn aangekomen en nog geen vaste voorkeursleverancier hebben. De doelgroep is fundamenteel anders, en daarmee de conversieratio.',
      },
    },
    {
      '@type': 'Question',
      name: 'Moet ik stopzetten met Google Ads als ik LokaalKabaal gebruik?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LokaalKabaal is geen vervanging voor alle marketing — het is een toevoeging voor één specifiek, zeer waardevol klantsegment: nieuwe bewoners. Veel klanten combineren LokaalKabaal met een beperkt Google-advertentiebudget voor brede zichtbaarheid.',
      },
    },
    {
      '@type': 'Question',
      name: 'Hoe meet ik of de flyers werken?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Zet een unieke aanbieding of kortingscode op uw flyer die alleen geldt voor nieuwe bewoners. Zo kunt u precies tracken hoeveel mensen via de flyer zijn binnengekomen. LokaalKabaal biedt ook een dashboard met verzendoverzichten per adres en periode.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is direct mail duurder dan online adverteren?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Per contact is direct mail duurder dan een advertentie-impressie. Maar de relevante metriek is kosten per acquisitie (CPA). Op die metriek presteert direct mail aan nieuwe bewoners structureel beter dan generieke online advertenties voor lokale MKB — omdat de doelgroep voorgeselecteerd is op verhuisbehoefte en geografische nabijheid.',
      },
    },
    {
      '@type': 'Question',
      name: 'Wat als ik in een regio woon met weinig eigendomsoverdrachten?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LokaalKabaal toont u vooraf hoeveel overdrachten er gemiddeld per maand zijn in uw gekozen postcodes, zodat u een realistisch beeld heeft van het verwachte volume.',
      },
    },
  ],
};

export default function DirectMailMKB() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>

        <Nav />

        {/* Hero */}
        <section style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 40px 60px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)', letterSpacing: '0.12em', marginBottom: '16px', textTransform: 'uppercase' }}>
            Direct mail · MKB · Kadaster-trigger
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
            Direct mail voor MKB —<br /><em style={{ color: 'var(--green-dim)' }}>gerichter dan adverteren,</em><br />volledig geautomatiseerd
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '620px', marginBottom: '32px' }}>
            U heeft een lokaal bedrijf. Uw klanten wonen in een straal van 2 kilometer. Toch betaalt u voor Google Ads die vertoond worden aan mensen in heel Nederland, in een veiling waar u concurreert met budgetten van landelijke ketens. Er is een betere manier. LokaalKabaal maakt direct mail voor MKB automatisch, betaalbaar en meetbaar — gericht op de doelgroep die het meest ontvankelijk is: nieuwe bewoners.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/login" style={{ padding: '12px 24px', background: 'var(--ink)', color: 'var(--paper)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px' }}>
              Start met direct mail dat werkt →
            </Link>
            <Link href="/flyers-versturen-nieuwe-bewoners" style={{ padding: '12px 24px', background: 'transparent', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 600, fontSize: '14px', border: '1px solid var(--line)' }}>
              Lees over de doelgroep
            </Link>
          </div>
        </section>

        {/* Vergelijking tabel */}
        <div style={{ borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: 'var(--white)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 40px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginBottom: '16px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Vergelijking: direct mail vs. online advertenties voor lokale MKB
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0', fontSize: '12px' }}>
              {['', 'Google Ads', 'Social media', 'LokaalKabaal'].map((h, i) => (
                <div key={i} style={{ padding: '8px 12px', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--paper2)', borderBottom: '1px solid var(--line)', color: i === 3 ? 'var(--green-dim)' : 'var(--muted)' }}>{h}</div>
              ))}
              {[
                ['Conversieratio', '1–3%', '0,5–1,5%', '4–8%'],
                ['Doelgroep in actieve beslissingsfase', '✗', '✗', '✓'],
                ['Stopt als u stopt met betalen', '✓', '✓', '✗'],
                ['Campagnebeheer nodig', '✓', '✓', '✗'],
                ['Geografisch precies', 'beperkt', 'beperkt', '✓'],
              ].map((row, ri) => row.map((cell, ci) => (
                <div key={`${ri}-${ci}`} style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', fontSize: ci === 0 ? '13px' : '12px', fontWeight: ci === 0 ? 600 : 400, color: ci === 3 && cell === '✓' ? 'var(--green-dim)' : ci === 3 && cell !== '✗' ? 'var(--ink)' : cell === '✗' ? '#bbb' : 'var(--ink)', fontFamily: ci > 0 ? 'var(--font-mono)' : 'inherit' }}>
                  {cell}
                </div>
              )))}
            </div>
          </div>
        </div>

        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 40px' }}>

          {/* Blok 1 */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Waarom direct mail beter werkt voor lokale MKB dan Google Ads of sociale media
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Laten we eerlijk zijn over wat digitale advertenties doen voor een lokale kapper in Rotterdam-Noord.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              <strong>Google Ads:</strong> U biedt op "kapper Rotterdam". De gemiddelde CPC ligt op €0,80–2,50. Van de mensen die klikken converteert 2–5% naar een afspraak. Dat is €40–125 per nieuwe klant. Bovendien verdwijnt uw zichtbaarheid zodra u stopt met betalen.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              <strong>Facebook/Instagram:</strong> 80–90% van uw advertentiebudget gaat naar mensen die al een vaste kapper hebben en niet van plan zijn te wisselen. Conversieratio&apos;s voor niet-getriggerde lokale advertenties liggen op 0,5–1,5%.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              <strong>Direct mail aan nieuwe bewoners:</strong> Conversieratio&apos;s voor welkomstflyers liggen op 4–8%. De reden: u bereikt mensen in een actieve beslissingsfase. Ze hebben geen vaste kapper meer. Ze zijn ontvankelijk.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444' }}>
              Daarnaast is er een kwalitatief verschil: een fysieke flyer wordt bewaard, op de koelkast geplakt, en meerdere keren bekeken. Een digitale advertentie bestaat voor 1,7 seconden.
            </p>
          </section>

          {/* Blok 2 */}
          <section style={{ marginBottom: '60px', background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              Wat automatisering verandert — van campagne naar infrastructuur
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '24px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '10px', letterSpacing: '0.08em' }}>VROEGER</div>
                {['1. Besluiten een flyercampagne te doen', '2. Adressenlijst samenstellen of kopen', '3. Ontwerper inhuren', '4. Drukkerij offerte opvragen', '5. Bezorging regelen', '6. Resultaten proberen te meten', '7. Herhalen — of niet'].map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#888', padding: '5px 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px' }}>
                    <span style={{ color: '#ccc', flexShrink: 0 }}>{i + 1}.</span>{s.replace(`${i + 1}. `, '')}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)', marginBottom: '10px', letterSpacing: '0.08em' }}>MET LOKAALKABAAL</div>
                {['1. Eenmalige setup: postcodes selecteren, flyertemplate uploaden', '2. Niets meer doen'].map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--ink)', padding: '5px 0', borderBottom: '1px solid var(--line)', display: 'flex', gap: '8px', fontWeight: i === 1 ? 700 : 400 }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>{i + 1}.</span>{s.replace(`${i + 1}. `, '')}
                  </div>
                ))}
                <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--green-dim)', fontFamily: 'var(--font-mono)' }}>
                  → Systeem monitort dagelijks het Kadaster<br />
                  → Flyer gaat automatisch de deur uit<br />
                  → U krijgt een notificatie in uw dashboard
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#555', lineHeight: 1.7 }}>
              Dit verandert de economie van direct mail voor MKB fundamenteel. Waar een traditionele flyercampagne een incidentele investering was, wordt direct mail via LokaalKabaal een vaste lage kostenpost met een constante instroom van potentiële klanten. Het is geen marketingactie meer — het is acquisitie-infrastructuur.
            </p>
          </section>

          {/* Blok 3 */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '16px', letterSpacing: '-0.01em' }}>
              De enige direct mail die getriggerd wordt door een koopmoment: eigendomsoverdracht
            </h2>
            <div style={{ width: '32px', height: '2px', background: 'var(--green)', marginBottom: '20px' }} />
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Er zijn veel vormen van direct mail. Huis-aan-huis folders. Adresgerichte campagnes op basis van demografische selecties. Seizoensmailings. Maar er is één trigger die alle andere in effectiviteit overtreft: het moment van eigendomsoverdracht.
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Een eigendomsoverdracht is geen willekeurig adres. Het is een adres waar iemand net een woning heeft gekocht. Die persoon staat nu voor een reeks nieuwe keuzes: welke dienstverleners in de buurt? Welke winkel wordt de vaste? Welk restaurant wordt het stamadres?
            </p>
            <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#444', marginBottom: '16px' }}>
              Dit is wat marketeers een <strong>"high intent moment"</strong> noemen. Uw flyer arriveert niet als ongewenste reclame bij iemand die tevreden is met zijn huidige situatie. Uw flyer arriveert als nuttige informatie bij iemand die precies zoekt wat u aanbiedt.
            </p>
            <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', padding: '14px 16px', fontSize: '13px', color: 'var(--green-dim)' }}>
              LokaalKabaal is de enige aanbieder in Nederland die Kadaster-eigendomsoverdrachten gebruikt als trigger voor geautomatiseerde direct mail voor lokale MKB.
            </div>
          </section>

          {/* FAQ */}
          <section style={{ marginBottom: '60px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', fontWeight: 400, marginBottom: '24px', letterSpacing: '-0.01em' }}>
              Veelgestelde vragen over direct mail voor MKB
            </h2>
            {[
              { q: 'Wat is het verschil tussen LokaalKabaal en een gewone huis-aan-huisfolder?', a: 'Een huis-aan-huisfolder gaat naar alle adressen in een gebied, ongeacht of de bewoner al klant is bij een concurrent, of al jaren op hetzelfde adres woont. LokaalKabaal verstuurt uitsluitend naar nieuwe eigendomsoverdrachten — mensen die net zijn aangekomen en nog geen vaste voorkeursleverancier hebben. De doelgroep is fundamenteel anders, en daarmee de conversieratio.' },
              { q: 'Moet ik stopzetten met Google Ads als ik LokaalKabaal gebruik?', a: 'Dat is uw keuze. LokaalKabaal is geen vervanging voor alle marketing — het is een toevoeging aan uw mix voor één specifiek, zeer waardevol klantsegment: nieuwe bewoners. Veel klanten combineren LokaalKabaal met een beperkt Google-advertentiebudget voor de brede zichtbaarheid, en zien LokaalKabaal als het meest rendabele kanaal voor klantacquisitie.' },
              { q: 'Hoe meet ik of de flyers werken?', a: 'De meest directe methode: zet een unieke aanbieding of kortingscode op uw flyer die alleen geldt voor nieuwe bewoners. Zo kunt u precies tracken hoeveel mensen via de flyer zijn binnengekomen. LokaalKabaal biedt ook een dashboard met verzendoverzichten per adres en periode, zodat u uitspraken kunt doen over bereik en conversie.' },
              { q: 'Is direct mail duurder dan online adverteren?', a: 'Per contact is direct mail duurder dan een advertentie-impressie. Maar vergelijkingen op basis van impressies zijn misleidend. De relevante metriek is kosten per acquisitie (CPA). Op die metriek presteert direct mail aan nieuwe bewoners structureel beter dan generieke online advertenties voor lokale MKB — omdat de doelgroep voorgeselecteerd is op verhuisbehoefte en geografische nabijheid.' },
              { q: 'Wat als ik in een regio woon met weinig eigendomsoverdrachten?', a: 'In stedelijk Nederland (de vier grote steden plus de G40) zijn er voldoende overdrachten voor een constant volume. LokaalKabaal toont u vooraf hoeveel overdrachten er gemiddeld per maand zijn in uw gekozen postcodes, zodat u een realistisch beeld heeft van het verwachte volume.' },
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
              Fysieke post die daadwerkelijk<br />wordt gelezen.
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '24px', fontFamily: 'var(--font-mono)' }}>
              Geen contract · Geen minimumafname · Betalen per verstuurde flyer
            </p>
            <Link href="/login" style={{ display: 'inline-block', padding: '14px 32px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '14px' }}>
              Start met direct mail dat werkt →
            </Link>
          </section>
        </main>

        <footer style={{ borderTop: '1px solid var(--line)', padding: '32px 40px', maxWidth: '800px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>© 2025 LokaalKabaal</div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {[
              { href: '/flyers-versturen-nieuwe-bewoners', label: 'Flyers nieuwe bewoners' },
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
