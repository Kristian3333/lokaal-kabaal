'use client';
import Link from 'next/link';
import Nav from '@/components/Nav';

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
            { n: '03', titel: 'Elke 25e automatisch verstuurd', tekst: 'Altum publiceert op de 20e alle nieuwe eigendomsoverdrachten. Wij verwerken ze en sturen op de 25e een bulkorder — jouw flyer ligt bij elke nieuwe bewoner binnen hun eerste maand.' },
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px', background: '#fff', transition: 'border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line)'; }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Abonnement · Nieuwe bewoners</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.2 }}>Automatisch flyers naar elke nieuwe huiseigenaar in jouw postcodes</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              LokaalKabaal koppelt aan Altum-verhuisdata en verstuurt elke 25e automatisch jouw flyer naar alle nieuwe eigenaren. Eén abonnement, exclusief per branche per postcode, geen handmatig werk.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['€69 – €299/maand', 'Exclusief per branche/postcode', 'Elke 25e automatisch'].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: '3px' }}>{tag}</span>
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Bekijk abonnementen en tarieven →</span>
          </Link>

          <Link href="/direct-mail-mkb" style={{ textDecoration: 'none', color: 'inherit', display: 'block', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '32px', background: '#fff', transition: 'border-color 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--ink)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--line)'; }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '14px' }}>Per campagne · Direct mail MKB</div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', fontWeight: 400, marginBottom: '12px', lineHeight: 1.2 }}>Bulk flyers naar een zelfgekozen doelgebied, zonder abonnement</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '20px' }}>
              Kies postcodes, upload je ontwerp, wij regelen print en bezorging via PostNL. Geen minimumcontract, geen maandelijks abonnement. Betalen per verstuurde flyer.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['Vanaf €0,69/stuk', 'Per campagne', 'Eigen postcodeselectie'].map(tag => (
                <span key={tag} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--ink)', background: 'var(--paper)', border: '1px solid var(--line)', padding: '3px 8px', borderRadius: '3px' }}>{tag}</span>
              ))}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink)' }}>Meer over direct mail →</span>
          </Link>
        </div>
      </section>

      {/* PRICING */}
      <section id="prijzen" style={{ background: 'var(--ink)', padding: '100px 40px' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Abonnementen · Nieuwe bewoners</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', marginBottom: '12px' }}>Welke positie wilt u innemen<br /><em style={{ color: 'rgba(255,255,255,.35)' }}>in uw buurt?</em></h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-mono)', maxWidth: '500px', margin: '0 auto 40px' }}>Per postcode neemt LokaalKabaal slechts één klant per branche aan. Controleer beschikbaarheid voordat een concurrent dat doet.</p>
          </div>

          {/* Exclusivity bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', border: '1px solid rgba(0,232,122,0.2)', borderRadius: 'var(--radius)', background: 'rgba(0,232,122,0.05)', marginBottom: '32px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-mono)' }}>
              <strong style={{ color: '#fff' }}>Exclusiviteitsbeveiliging actief:</strong> zodra u een postcode claimt, verstuurt geen enkele andere ondernemer in uw branche daar nog een flyer via LokaalKabaal.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'start' }}>

            {/* Buurt */}
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', padding: '28px 24px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Tier 1</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>Buurt</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginBottom: '20px' }}>Uw eerste vaste klanten werven</div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em' }}>€69</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.3)', marginLeft: '4px' }}>/maand</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>+ €2,25 per extra flyer boven bundel</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['1 postcode actief', '20 flyers/maand inbegrepen', 'A6 · print + bezorging', '1 flyer-template', 'Maandelijks rapport', 'Per maand opzegbaar'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'rgba(255,255,255,.2)', flexShrink: 0, fontSize: '12px' }}>—</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.2)', lineHeight: 1.4 }}>Geen exclusiviteitsgarantie</span>
                </div>
              </div>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '11px 16px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px' }}>
                Start met Buurt →
              </Link>
            </div>

            {/* Wijk — HERO */}
            <div style={{ border: '2px solid var(--green)', borderRadius: 'var(--radius)', padding: '28px 24px', background: 'rgba(0,232,122,0.04)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: 'var(--green)', color: 'var(--ink)', fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '3px 12px', borderRadius: '20px', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                Meest gekozen
              </div>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Tier 2</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>Wijk</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.5)', marginBottom: '20px' }}>De vaste naam in de buurt worden</div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em' }}>€149</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.3)', marginLeft: '4px' }}>/maand</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>+ €1,85 per extra flyer boven bundel</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['3 postcodes actief', '50 flyers/maand inbegrepen', 'A5 dubbelzijdig · premium formaat', '3 templates (incl. seizoensvariant)', 'Wekelijks rapport + statistieken', 'A/B test twee templates', 'Telefonische onboarding', 'Per maand opzegbaar'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>★</span>
                  <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, lineHeight: 1.4 }}>Exclusiviteit per postcode, per branche</span>
                </div>
              </div>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '12px 16px', background: 'var(--green)', color: 'var(--ink)', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 800, fontSize: '13px' }}>
                Claim uw wijkpositie →
              </Link>
            </div>

            {/* Stad */}
            <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius)', padding: '28px 24px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,.3)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Tier 3</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, color: '#fff', marginBottom: '4px' }}>Stad</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,.4)', marginBottom: '20px' }}>Categorie-eigenaar in uw verzorgingsgebied</div>
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', fontWeight: 400, color: '#fff', letterSpacing: '-0.02em' }}>€299</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,.3)', marginLeft: '4px' }}>/maand</span>
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)', marginBottom: '24px' }}>+ €1,45 per extra flyer boven bundel</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['10 postcodes actief', '150 flyers/maand inbegrepen', 'A5 dubbelzijdig · gepersonaliseerd', 'Onbeperkt templates + auto-selectie', 'Real-time dashboard', 'Kwartaalgesprek accountmanager', 'Professioneel ontwerp (éénmalig inbegrepen)', 'Per maand opzegbaar'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px' }}>✓</span>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,.6)', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '4px' }}>
                  <span style={{ color: 'var(--green)', flexShrink: 0, fontSize: '12px', marginTop: '1px' }}>★</span>
                  <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 700, lineHeight: 1.4 }}>Exclusiviteit voor het volledige verzorgingsgebied</span>
                </div>
              </div>
              <Link href="/login" style={{ display: 'block', textAlign: 'center', padding: '11px 16px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', textDecoration: 'none', borderRadius: 'var(--radius)', fontWeight: 700, fontSize: '13px' }}>
                Domineer uw markt →
              </Link>
            </div>
          </div>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-mono)' }}>
              Alle prijzen excl. BTW · Geen minimale looptijd · Maandelijks opzegbaar
            </div>
            <Link href="/direct-mail-mkb" style={{ fontSize: '11px', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
              Op zoek naar losse campagnes zonder abonnement? → Direct mail MKB
            </Link>
          </div>
        </div>
      </section>

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
          Geen contract · Per maand opzegbaar · Setup in 20 minuten
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/flyers-versturen-nieuwe-bewoners" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Nieuwe bewoners</Link>
          <Link href="/direct-mail-mkb" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Direct mail MKB</Link>
          <Link href="/blog" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Blog</Link>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
        </div>
      </footer>
    </div>
  );
}
