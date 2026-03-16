'use client';
import Link from 'next/link';
import Nav from '@/components/Nav';
import PricingSection from '@/components/PricingSection';

const TICKERS = [
  "🟢 Kapper Bloemendaal — 340 flyers verstuurd",
  "🟢 Pizzeria Oost — campagne gestart",
  "🟢 Yoga Utrecht — 12 nieuwe klanten",
  "🟢 Bakkerij Den Haag — 3e maand actief",
  "🟢 Restaurant Noord — regio exclusief geboekt",
  "🟢 Nagelstudio Haarlem — 890 bezorgd",
  "🟢 Slagerij Leiden — 5e maand actief",
  "🟢 Rijschool Eindhoven — 44 nieuwe leerlingen",
];

export default function Landing() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>

      <Nav />

      {/* HERO */}
      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '100px 40px 100px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '4px 12px', background: 'var(--green-bg)', border: '1px solid rgba(0,232,122,0.2)', borderRadius: '20px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', marginBottom: '28px' }}>
          <span style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
          Actief in heel Nederland · elke 25e automatisch verstuurd
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '58px', lineHeight: 1.05, fontWeight: 400, marginBottom: '24px', color: 'var(--ink)', letterSpacing: '-0.02em', maxWidth: '720px' }}>
          Bereik nieuwe bewoners<br />
          <em style={{ color: 'var(--muted)', fontStyle: 'italic' }}>vóór je concurrent</em>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '540px', marginBottom: '40px' }}>
          Elke maand verhuizen <strong style={{ color: 'var(--ink)' }}>tienduizenden huishoudens</strong> in Nederland. De eerste 30 dagen kiezen ze hun vaste kapper, bakker en installateur. LokaalKabaal verstuurt automatisch jouw flyer — elke 25e, naar elk nieuw adres in jouw postcodes.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/flyers-versturen-nieuwe-bewoners#prijzen" style={{ padding: '14px 28px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
            Bekijk abonnementen →
          </Link>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ padding: '14px 20px', color: 'var(--muted)', fontSize: '13px', textDecoration: 'none' }}>
            Hoe het werkt
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '40px', marginTop: '52px', paddingTop: '40px', borderTop: '1px solid var(--line)' }}>
          {[
            ['900.000+', 'eigendomsoverdrachten per jaar in NL'],
            ['30 dagen', 'beslissingsvenster nieuwe bewoners'],
            ['4–8%', 'conversieratio welkomstflyer'],
          ].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '30px', color: 'var(--ink)', marginBottom: '4px' }}>{n}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ overflow: 'hidden', background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '10px 0' }}>
        <div className="ticker-inner" style={{ whiteSpace: 'nowrap' }}>
          {[...TICKERS, ...TICKERS].map((item, i) => (
            <span key={i} style={{ display: 'inline-block', padding: '0 40px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.4)' }}>{item}</span>
          ))}
        </div>
      </div>

      {/* HOE HET WERKT */}
      <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Hoe het werkt</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, marginBottom: '12px' }}>Drie stappen. <em style={{ color: 'var(--muted)' }}>Dan loopt het vanzelf.</em></h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto' }}>Stel eenmalig in welke postcodes je wil bereiken. De rest doen wij elke maand automatisch.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', background: 'var(--line)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {[
            { n: '01', titel: 'Kies postcodes & branche', tekst: 'Geef aan welke postcodes je wil targeten en wat voor bedrijf je hebt. Wij controleren of de exclusiviteit in jouw postcodes nog beschikbaar is.' },
            { n: '02', titel: 'Upload je flyerontwerp', tekst: 'Upload je eigen ontwerp of laat ons helpen. Het systeem koppelt automatisch het juiste adres aan elke individuele flyer.' },
            { n: '03', titel: 'Elke 25e automatisch verstuurd', tekst: 'Wij verwerken maandelijks alle nieuwe eigendomsoverdrachten en sturen op de 25e een bulkorder — jouw flyer ligt bij elke nieuwe bewoner binnen hun eerste maand.' },
          ].map(s => (
            <div key={s.n} style={{ background: '#fff', padding: '36px 32px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--green)', marginBottom: '20px' }}>{s.n}</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.25 }}>{s.titel}</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>{s.tekst}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTEN */}
      <section style={{ padding: '0 40px 100px', maxWidth: '1080px', margin: '0 auto' }}>
        <div>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px', background: '#fff', transition: 'border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line)'; }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Abonnement · Nieuwe bewoners</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.2 }}>Automatisch flyers naar elke nieuwe huiseigenaar in jouw postcodes</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              LokaalKabaal verstuurt elke 25e automatisch jouw flyer naar alle nieuwe eigenaren in jouw postcodes. Eén abonnement, exclusief per branche per postcode, geen handmatig werk.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['€69 – €299/maand', 'Exclusief per branche/postcode', 'Elke 25e automatisch'].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: '3px' }}>{tag}</span>
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Bekijk abonnementen en tarieven →</span>
          </Link>

        </div>
      </section>

      <PricingSection />

      {/* WAAROM LOKAALKABAAL */}
      <section style={{ padding: '100px 40px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Waarom het werkt</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '34px', fontWeight: 400, marginBottom: '20px', lineHeight: 1.15 }}>
              Nieuwe bewoners zijn de meest<br /><em style={{ color: 'var(--muted)' }}>waardevolle doelgroep</em> die bestaat
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8, marginBottom: '16px' }}>
              Wanneer iemand verhuist, zijn alle gewoontes doorbroken. Er is geen vaste kapper, geen stamrestaurant, geen vertrouwde installateur. Alles staat open — en de keuzes worden razendsnel gemaakt.
            </p>
            <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.8 }}>
              80% van de nieuwe bewoners heeft binnen 30 dagen hun vaste lokale leveranciers gekozen. Dit is het enige venster. LokaalKabaal zorgt dat uw flyer in dat venster arriveert.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[
              { branche: 'Kapsalon', waarde: '€360/jaar', sub: 'per vaste klant · 6–8 knipcycli × €50' },
              { branche: 'Installatiebedrijf', waarde: '€8.000/jaar', sub: 'eerste jaar · gem. verbouwbudget nieuwe eigenaar' },
              { branche: 'Restaurant', waarde: '€840/jaar', sub: 'per vaste gast · 2× p/mnd × €35' },
              { branche: 'Bakkerij', waarde: '€520/jaar', sub: 'per vaste klant · dagelijkse terugkeer' },
            ].map((b, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? '#fff' : 'var(--paper)', border: '1px solid var(--line)', borderRadius: i === 0 ? 'var(--radius) var(--radius) 0 0' : i === 3 ? '0 0 var(--radius) var(--radius)' : '0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px' }}>{b.branche}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{b.sub}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', color: 'var(--green-dim)', flexShrink: 0 }}>{b.waarde}</div>
              </div>
            ))}
            <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Break-even Wijk-abonnement: 1 nieuwe vaste klant per 2 maanden.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, marginBottom: '16px', lineHeight: 1.1 }}>
          Elke maand nieuwe klanten.<br /><em style={{ color: 'var(--muted)' }}>Zonder extra werk.</em>
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '32px', lineHeight: 1.65 }}>
          Stel eenmalig in. Elke 25e verstuurt LokaalKabaal automatisch jouw flyer naar alle nieuwe bewoners in jouw postcodes.
        </p>
        <Link href="/flyers-versturen-nieuwe-bewoners#prijzen" style={{ padding: '15px 36px', background: 'var(--ink)', color: '#fff', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}>
          Bekijk abonnementen →
        </Link>
        <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
          Geen contract · Per maand opzegbaar · Vanaf €69/mnd
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Nieuwe bewoners</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
