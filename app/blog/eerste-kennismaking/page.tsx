import Link from 'next/link';
import Nav from '@/components/Nav';

export default function BlogEersteKennismaking() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '.06em' }}>MARKETING</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>5 min lezen · 1 februari 2026</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', fontWeight: 400, lineHeight: 1.1, marginBottom: '24px' }}>
          De Eerste Kennismaking: Jouw Flyer als Start van de Klantreis
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--green)', paddingLeft: '20px' }}>
          &ldquo;Een nieuwe bewoner is een onbeschreven blad. Hij heeft nog geen kapper, geen bakker, geen stamkroeg. Die eerste 30 dagen zijn het gouden venster.&rdquo;
        </p>

        {[
          {
            kop: 'Het onbeschreven blad',
            tekst: `Stel je voor: je pakt de sleutel van je nieuwe woning op. Je kent de buurt niet. Je weet niet waar de dichtstbijzijnde supermarkt is, welke kapper goed is, of er een gezellig terras om de hoek zit.

De eerste weken verken je. Je loopt, je kijkt, je zoekt online. En in die fase -- die eerste 30 dagen -- worden de meeste van je toekomstige gewoonten gevormd. De winkel waar je je boodschappen haalt. De kapper die je kiest. Het café waar je op zaterdagochtend je eerste koffie drinkt.

Als jij er dan als eerste bent, heb je een enorm voordeel.`,
          },
          {
            kop: 'De 30-dagenregel',
            tekst: `Consumentenonderzoek toont keer op keer hetzelfde aan: nieuwe bewoners zijn in de eerste 30 dagen significant actiever in het uitproberen van lokale bedrijven dan in de periode daarna. Ze hebben open staan voor aanbevelingen, ze reageren op aanbiedingen, ze zijn loyaal als de eerste ervaring goed is.

Na die 30 dagen vormt zich een routine. En routine is moeilijk te doorbreken. De kapper die ze na de verhuizing hebben bezocht, wordt de kapper. De bakker om de hoek wordt dé bakker. Wie te laat is, vist achter het net.`,
          },
          {
            kop: 'De flyer als eerste handdruk',
            tekst: `Een flyer is geen reclame. Het is een introductie. Het verschil is cruciaal.

Reclame probeert iemand te overtuigen. Een introductie laat iemand kennis maken. En kennismaken doe je niet met een banner of een gesponsorde post -- dat doe je met een stuk papier dat aanvoelt, dat je kunt vasthouden, dat je op de keukentafel kunt leggen en de dag erna nog kunt opzoeken.

De kwaliteit van dat papier zegt iets over jou. Een mooie, goed ontworpen flyer communiceert: wij zijn professioneel, wij nemen dit serieus, wij zijn het waard om te bezoeken.`,
          },
          {
            kop: 'Van flyer naar vaste klant',
            tekst: `De klantreis begint bij de flyer, maar eindigt bij de relatie. De flyer is de trigger die iemand de deur in doet stappen. Wat er daarna gebeurt, is aan jou: de service, de sfeer, het vak.

Maar die eerste stap -- ervoor zorgen dat iemand jouw naam kent op het moment dat ze nog geen keuze hebben gemaakt -- dat is wat LokaalKabaal voor je regelt. Automatisch, elke maand, voor alle nieuwe bewoners in jouw werkgebied.`,
          },
          {
            kop: 'Maak die eerste indruk onvergetelijk',
            tekst: `Een flyer die er slecht uitziet, is erger dan geen flyer. Het is een slechte eerste indruk die moeilijk te herstellen valt. Investeer daarom in de kwaliteit van je ontwerp en je drukwerk.

Via onze flyer-editor kun je in een paar klikken een professioneel ontwerp maken -- of upload je eigen drukklare bestand. De AI schrijft een wervende tekst op maat. En dan zorgen wij voor de rest: drukken, adresseren, bezorgen.

Jij focust op je vak. Wij zorgen dat je nieuwe buren je kennen.`,
          },
        ].map(s => (
          <div key={s.kop} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '14px' }}>{s.kop}</h2>
            <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--muted)', whiteSpace: 'pre-line' }}>{s.tekst}</div>
          </div>
        ))}

        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px', marginTop: '40px' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Wees er als eerste. Elke maand.</p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Eerste batch voor €49 →</Link>
        </div>
      </article>

      <section style={{ borderTop: '1px solid var(--line)', padding: '60px 40px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '20px', letterSpacing: '.08em' }}>OOK INTERESSANT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { slug: 'hyperlokaal', titel: 'Hyperlokaal: Vertrouwen via Fysieke Aanwezigheid' },
            { slug: 'digitale-moeheid', titel: 'Digitale Moeheid: Fysiek heeft een Langere Houdbaarheid' },
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
