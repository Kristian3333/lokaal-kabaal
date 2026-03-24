import Link from 'next/link';
import Nav from '@/components/Nav';

export default function BlogHyperlokaal() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <article style={{ maxWidth: '680px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', background: 'var(--green-bg)', padding: '3px 8px', borderRadius: '2px', letterSpacing: '.06em' }}>STRATEGIE</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>5 min lezen · 10 maart 2026</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '46px', fontWeight: 400, lineHeight: 1.1, marginBottom: '24px' }}>
          Hyperlokaal: Vertrouwen via Fysieke Aanwezigheid
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '40px', fontStyle: 'italic', borderLeft: '3px solid var(--green)', paddingLeft: '20px' }}>
          &ldquo;De kapper om de hoek heeft geen Facebook-advertenties nodig. Hij hoeft alleen maar aanwezig te zijn -- op het juiste moment, op de juiste plek.&rdquo;
        </p>

        {[
          {
            kop: 'De lokale ondernemer versus het grote geld',
            tekst: `Stel je voor: je bent net verhuisd naar een nieuwe wijk. Je kent niemand. Je hebt geen kapper, geen stamkroeg, geen bakker. Je zoekt. Online misschien, maar vaker loop je gewoon de straat op. En dan ligt er een flyer op de mat. Van de kapper drie straten verderop. Met een welkomstaanbieding. Die flyer pak je op.

Dat is hyperlokale marketing in één zin: aanwezig zijn waar de behoefte is, precies op het moment dat de behoefte er is. Geen algoritme kan dat nabootsen.`,
          },
          {
            kop: 'Waarom vertrouwen lokaal werkt',
            tekst: `Digitale advertenties zijn anoniem. Ze komen van overal en nergens. Een sponsored post van een kapperszaak in Amsterdam terwijl jij in Rotterdam woont? Nutteloos. Maar een flyer van de kapper in jouw straat? Die heeft context. Die zegt: ik ben hier, ik ben dichtbij, ik ken jouw buurt.

Dat is het principe achter hyper-lokale marketing: vertrouwen door nabijheid. Mensen vertrouwen eerder een bedrijf dat fysiek dichtbij is. Een flyer is het bewijs van die nabijheid.`,
          },
          {
            kop: 'Het verschil met online adverteren',
            tekst: `Online kun je targeten op leeftijd, interesse en zelfs locatie. Maar je targert naar mensen die al ergens zijn. Bij hyper-lokale flyerdistributie target je naar mensen die net ergens naartoe zijn gegaan -- een nieuw adres, een nieuw leven, nieuwe gewoonten die gevormd moeten worden.

Dat is het gouden moment. En het is een moment dat Google Ads en Meta simpelweg niet kunnen pakken, want die weten wel waar iemand is, maar niet dat die persoon net is ingetrokken en nóg geen vaste leveranciers heeft.`,
          },
          {
            kop: 'De kapper, de bakker, het restaurant',
            tekst: `De lokale kapper met een flyercampagne via LokaalKabaal bereikt gemiddeld 400–600 nieuwe bewoners per maand in een straal van 10 kilometer. Bij een conversieratio van 4–6% levert dat 16–36 nieuwe klanten op -- klanten die, als ze tevreden zijn, jarenlang terugkomen.

De lifetime value van een vaste klant bij een kapper is makkelijk €1.000–€2.000 over vijf jaar. Reken zelf maar uit wat die flyer van €0,59 waard is.`,
          },
          {
            kop: 'Begin klein, win groot',
            tekst: `Je hoeft geen multinational te zijn om hyperlokaal te winnen. Sterker nog: de schaal werkt in je voordeel. De lokale snackbar kan met 250 flyers beginnen. Dat is €147,50. Voor dat bedrag kun je ook een week lang advertenties draaien op Instagram -- die 3 seconden worden bekeken en direct worden weggezwaafd.

Of je kiest voor iets dat blijft hangen. Letterlijk.`,
          },
        ].map(s => (
          <div key={s.kop} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '14px' }}>{s.kop}</h2>
            <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--muted)', whiteSpace: 'pre-line' }}>{s.tekst}</div>
          </div>
        ))}

        <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '24px', marginTop: '40px' }}>
          <p style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', marginBottom: '16px' }}>Klaar om jouw buurt te veroveren?</p>
          <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Eerste batch voor €49 →</Link>
        </div>
      </article>

      {/* Gerelateerd */}
      <section style={{ borderTop: '1px solid var(--line)', padding: '60px 40px', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '20px', letterSpacing: '.08em' }}>OOK INTERESSANT</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { slug: 'digitale-moeheid', titel: 'Digitale Moeheid: Fysiek heeft een Langere Houdbaarheid' },
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
