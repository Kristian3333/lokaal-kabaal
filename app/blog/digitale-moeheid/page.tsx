import Link from 'next/link';
import Nav from '@/components/Nav';

export default function BlogDigitaleMoeheid() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '.06em' }}>GEDRAG</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>4 min lezen · 8 februari 2026</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', fontWeight: 400, lineHeight: 1.1, marginBottom: '24px' }}>
          Digitale Moeheid: Waarom Fysiek Langer Blijft Hangen
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--green)', paddingLeft: '20px' }}>
          &ldquo;Je Instagram-ad wordt 3 seconden bekeken. Een flyer op de mat? Die blijft een week op de keukentafel liggen.&rdquo;
        </p>

        {[
          {
            kop: '4.000 advertenties per dag',
            tekst: `De gemiddelde Nederlander ziet dagelijks meer dan 4.000 advertentieboodschappen. Banners, gesponsorde posts, pre-rolls, pop-ups. Het brein heeft geleerd ze te negeren -- automatisch, onbewust. Onderzoekers noemen dit bannerimmuunheid: de hersenen filteren digitale reclame weg alsof het ruis is.

Het resultaat? Een gemiddelde klikratio op display-advertenties van 0,1%. Dat betekent dat 999 van de 1.000 mensen jouw advertentie zien zonder er iets mee te doen.`,
          },
          {
            kop: 'De 3-seconden-regel',
            tekst: `Sociale media zijn ontworpen om aandacht te fragmenteren. De gemiddelde gebruiker scrolt in 2026 met een snelheid van 2–3 berichten per seconde. Een video die niet in de eerste 1,5 seconden boeit, wordt weggeswiped. Een banner die niet instant opvalt, wordt genegeerd.

Jouw advertentie concurreert met kattenfilmpjes, politiek nieuws en de foto's van de verjaardag van iemands nichtje. En je hebt minder dan 3 seconden. De kans is klein.`,
          },
          {
            kop: 'De koelkasttest',
            tekst: `Hier is een simpele test: hoeveel papieren materialen hangen er op of bij jouw koelkast? Waarschijnlijk een paar. Een uitnodiging. Een bon. Misschien een flyer van de pizzeria om de hoek.

Die flyer is er al weken. Je kijkt er elke dag naar. Je hebt de naam van het restaurant onbewust al tientallen keren gelezen. Dat is passieve merkbekendheid -- en het kost niets meer na de eerste bezorging.

Dat is de echte houdbaarheid van fysiek: niet de kwaliteit van het papier, maar het feit dat het niet wegscrollt.`,
          },
          {
            kop: 'De revival van direct mail',
            tekst: `In de VS groeit de fysieke direct mail sector al drie jaar op rij, terwijl digitale advertentie-uitgaven voor het eerst stagneren. In Nederland zien we dezelfde trend. Niet omdat papier plotseling sexy is, maar omdat het werkt als de digitale ruimte vol raakt.

De paradox: hoe meer iedereen online adverteert, hoe waardevoller een fysieke aanwezigheid wordt. De offline ruimte wordt schaarser en daarmee waardevoller.`,
          },
          {
            kop: 'Timing is alles',
            tekst: `Fysieke marketing werkt het beste op het moment dat iemand open staat voor nieuwe indrukken. En er is geen moment waarop mensen opener staan voor nieuwe leveranciers dan wanneer ze net zijn verhuisd.

Ze hebben geen routine. Ze hebben geen stamkroeg. Ze zoeken actief naar een kapper, een bakker, een restaurant in de buurt. En dan ligt er op de mat een flyer. Van jou. Op het juiste moment. Op de juiste plek. Zonder algoritme dat beslist of je überhaupt zichtbaar bent.`,
          },
        ].map(s => (
          <div key={s.kop} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '14px' }}>{s.kop}</h2>
            <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--muted)', whiteSpace: 'pre-line' }}>{s.tekst}</div>
          </div>
        ))}

        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px', marginTop: '40px' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Stop met swipen. Begin met bezorgen.</p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Eerste batch voor €49 →</Link>
        </div>
      </article>

      <section style={{ borderTop: '1px solid var(--line)', padding: '60px 40px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '20px', letterSpacing: '.08em' }}>OOK INTERESSANT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { slug: 'hyperlokaal', titel: 'Hyperlokaal: Vertrouwen via Fysieke Aanwezigheid' },
            { slug: 'eerste-kennismaking', titel: 'De Eerste Kennismaking: Jouw Flyer als Start van de Klantreis' },
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
