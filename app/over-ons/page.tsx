import Link from 'next/link';
import Nav from '@/components/Nav';

const PIJLERS = [
  {
    nummer: '01',
    titel: 'Hyper-lokaal',
    tekst: 'We schieten niet met hagel. Geen landelijke campagnes, geen anonieme doelgroepen. We raken mensen precies op het moment dat ze in een nieuwe wijk terechtkomen -- en dan telt elke interactie dubbel. Een flyer van de plaatselijke kapper is geen reclame. Het is een kennismaking.',
  },
  {
    nummer: '02',
    titel: 'Digital-First Fysiek',
    tekst: 'Onze interface ziet er uit als een SaaS-product van 2026. Maar het product dat we leveren is zo oud als de wereld: een stuk papier in een brievenbus. We gebruiken Kadaster-data, automatisering en tracking om een eeuwenoud medium radicaal te moderniseren.',
  },
  {
    nummer: '03',
    titel: 'Rebels & Energiek',
    tekst: 'De naam "Lokaal Kabaal" is geen toeval. We maken lawaai voor de lokale ondernemer. Geen supermarktfolders, geen bleke coupons. Energie, cultuur, karakter. Of je nu een underground barista bent, een buurtbarbier of een stucadoor die trots is op zijn vak -- wij maken jouw eerste indruk onvergetelijk.',
  },
  {
    nummer: '04',
    titel: 'Bestrijden Digitale Moeheid',
    tekst: 'De gemiddelde Nederlander ziet 4.000+ advertenties per dag online. Ze swipen ze weg zonder te knipperen. Een flyer op de mat? Die pakt iemand op. Die legt iemand neer op de keukentafel. Die blijft hangen. Fysiek heeft een houdbaarheid die geen algoritme kan evenaren.',
  },
  {
    nummer: '05',
    titel: 'De Eerste Kennismaking',
    tekst: 'Nieuwe bewoners kiezen hun vaste kapper, bakker en restaurant in de eerste 30 dagen na een verhuizing. Dat venster is goud. Wij zorgen dat jij er als eerste bent -- niet met een banner die ze negeren, maar met een flyer die ze vasthouden.',
  },
];

const STATS = [
  { val: '73%', label: 'van nieuwe bewoners kiest lokale vaste leveranciers in de eerste 30 dagen' },
  { val: '7 dagen', label: 'gemiddelde houdbaarheid van een flyer vs. 3 seconden voor een social ad' },
  { val: '17.000+', label: 'huishoudens verhuizen elke maand in Nederland -- dat zijn verse kansen' },
];

export default function OverOns() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      {/* Hero */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 40px 60px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Over ons</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '58px', fontWeight: 400, lineHeight: 1.05, marginBottom: '20px', maxWidth: '700px' }}>
          Wij zijn<br />Lokaal Kabaal.
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '560px', lineHeight: 1.65, marginBottom: '20px' }}>
          Geen Google Ads-bureau. Geen social media cowboys. We sturen flyers.
        </p>
        <p style={{ fontSize: '15px', color: 'var(--muted)', maxWidth: '560px', lineHeight: 1.7 }}>
          Want terwijl iedereen schreeuwt op Instagram, ligt er een stuk papier in de brievenbus van iemand die net is ingetrokken. En die persoon heeft nog geen kapper, geen stamkroeg, geen stucadoor. Dat venster is klein. En wij zorgen dat jij er als eerste in staat.
        </p>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--ink)', padding: '60px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {STATS.map(s => (
            <div key={s.val} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '48px', color: 'var(--green)', marginBottom: '8px' }}>{s.val}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pijlers */}
      <section style={{ maxWidth: '1080px', margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Onze filosofie</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400 }}>Vijf pijlers. <em style={{ color: 'var(--muted)' }}>Eén missie.</em></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {PIJLERS.map(p => (
            <div key={p.nummer} style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '28px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '12px' }}>{p.nummer}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>{p.titel}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{p.tekst}</p>
            </div>
          ))}
          {/* 5e pijler breed */}
          <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--radius)', padding: '28px', gridColumn: '1 / -1' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '12px' }}>05</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '12px' }}>De Eerste Kennismaking</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{PIJLERS[4].tekst}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '64px', color: 'var(--green)', lineHeight: 1 }}>30</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green-dim)' }}>DAGEN · HET GOUDEN VENSTER</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: 'var(--paper2)', borderTop: '1px solid var(--line)', padding: '80px 40px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Het team</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 400, marginBottom: '20px' }}>Klein. <em style={{ color: 'var(--muted)' }}>Maar lawaaiig.</em></h2>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '16px' }}>
            We zijn een klein team vanuit Amsterdam. We kennen alle lokale ondernemers in onze straat bij naam. Dat is precies waarom we dit bouwen -- omdat we zien hoe moeilijk het is om op te vallen als je geen marketingbudget van een multinational hebt.
          </p>
          <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.7 }}>
            Lokaal Kabaal is gebouwd voor de kapper op de hoek, de barista met een missie en de stucadoor die gewoon goed werk levert. Wij zijn hun megafoon.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, marginBottom: '16px' }}>
          Klaar om <em style={{ color: 'var(--muted)' }}>kabaal te maken?</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px' }}>Begin vandaag. Eerste campagne loopt binnen 48 uur.</p>
        <Link href="/login" style={{ padding: '14px 36px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}>
          Eerste batch voor €49 →
        </Link>
      </section>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '12px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Over ons</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
        </div>
      </footer>
    </div>
  );
}
