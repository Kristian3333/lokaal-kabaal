import Link from 'next/link';

export default function Voorwaarden() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <nav style={{ borderBottom: '1px solid var(--line)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{ width: '22px', height: '22px', background: 'var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 12 12" fill="none" width="10" height="10"><path d="M6 1L10 4V8L6 11L2 8V4L6 1Z" fill="#00E87A" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '-.02em' }}>Lokaal<span style={{ color: 'var(--green)' }}>Kabaal</span></span>
        </Link>
        <Link href="/" style={{ fontSize: '12px', color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-mono)' }}>← Terug naar home</Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Juridisch</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, marginBottom: '8px' }}>Algemene Voorwaarden</h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '48px' }}>Versie 1.0 · Geldig vanaf 1 april 2026</p>

        {[
          {
            titel: 'Artikel 1 — Definities',
            tekst: `In deze Algemene Voorwaarden gelden de volgende definities:\n\n• LokaalKabaal: LokaalKabaal B.V., gevestigd te Amsterdam, KvK 00000000\n• Klant: de onderneming die een campagne boekt via het platform\n• Campagne: de opdracht om flyermateriaal te drukken en te bezorgen aan nieuwe bewoners in een gekozen werkgebied\n• Werkgebied: het geografische gebied (gedefinieerd via centrum-postcode en straal) waarbinnen flyers worden bezorgd\n• Nieuwe bewoners: personen wier adres binnen de afgelopen 30–60 dagen in het Kadaster is geregistreerd als eigendomsoverdracht\n• Bezorgmoment: de vaste maandelijkse verzenddatum, zijnde de 25e van elke maand`,
          },
          {
            titel: 'Artikel 2 — Toepasselijkheid',
            tekst: `2.1 Deze Algemene Voorwaarden zijn van toepassing op alle overeenkomsten tussen LokaalKabaal en de Klant.\n\n2.2 Afwijkingen zijn uitsluitend geldig indien schriftelijk overeengekomen.\n\n2.3 LokaalKabaal behoudt zich het recht voor deze voorwaarden te wijzigen. Klanten worden hierover minimaal 30 dagen van tevoren per e-mail geïnformeerd.`,
          },
          {
            titel: 'Artikel 3 — De dienst',
            tekst: `3.1 LokaalKabaal verzorgt het drukken en bezorgen van flyermateriaal aan nieuwe bewoners in het gekozen werkgebied.\n\n3.2 Bezorging vindt maandelijks plaats op de 25e van de maand via PostNL of vergelijkbare bezorgdienst.\n\n3.3 Adressen worden bepaald via de Altum AI / Kadaster API op basis van eigendomsoverdrachten in de afgelopen 30–60 dagen. Per klant wordt per maand maximaal 1 API-verzoek gedaan.\n\n3.4 LokaalKabaal garandeert een inspanningsverplichting maar geen resultaatsverplichting (conversie, omzet of respons).`,
          },
          {
            titel: 'Artikel 4 — Prijzen en betaling',
            tekst: `4.1 Prijzen zijn per flyer, exclusief BTW, en afhankelijk van volume en formaat:\n\n• 250–499 flyers: € 0,59 per stuk (A5 enkelvoudig)\n• 500–999 flyers: € 0,49 per stuk\n• Vanaf 1.000 flyers: € 0,39 per stuk\n\nFormaat-toeslag: A4 = +€ 0,08 | A6 = −€ 0,05 per stuk\nDubbelzijdig: +€ 0,06 per stuk\nProef flyer: € 4,95 eenmalig\n\n4.2 Minimale afname: 250 flyers per campagne.\n\n4.3 Betaling geschiedt vooraf via iDEAL, creditcard of factuur (achteraf, 14 dagen betalingstermijn voor zakelijke klanten).\n\n4.4 Bij niet-tijdige betaling is de Klant wettelijke rente verschuldigd.`,
          },
          {
            titel: 'Artikel 5 — Levering en uitvoering',
            tekst: `5.1 De Klant dient flyerinhoud uiterlijk 10 dagen voor het bezorgmoment aan te leveren in PDF (drukklaar, 300 dpi, inclusief 3mm afloop).\n\n5.2 Aanlevering na deze deadline verschuift de campagne automatisch naar de eerstvolgende bezorgmaand.\n\n5.3 Als het werkgebied minder nieuwe bewoners bevat dan het bestelde aantal flyers, worden credits bijgeschreven voor de niet-bezorgde exemplaren.\n\n5.4 LokaalKabaal is niet aansprakelijk voor vertragingen door PostNL of vergelijkbare bezorgdiensten.`,
          },
          {
            titel: 'Artikel 6 — Annulering',
            tekst: `6.1 Annulering is kosteloos tot 15 dagen voor de bezorgdatum van de eerste campagnemaand.\n\n6.2 Na deze datum wordt 50% van het campagnebedrag in rekening gebracht.\n\n6.3 Na aanvang van de productie (drukken) is geen annulering meer mogelijk.`,
          },
          {
            titel: 'Artikel 7 — Aansprakelijkheid',
            tekst: `7.1 De aansprakelijkheid van LokaalKabaal is beperkt tot het factuurbedrag van de betreffende campagne.\n\n7.2 LokaalKabaal is niet aansprakelijk voor indirecte schade, gederfde winst of gevolgschade.\n\n7.3 De Klant is verantwoordelijk voor de juistheid en rechtmatigheid van de flyerinhoud en vrijwaart LokaalKabaal van aanspraken van derden.`,
          },
          {
            titel: 'Artikel 8 — Toepasselijk recht',
            tekst: `8.1 Op alle overeenkomsten is Nederlands recht van toepassing.\n\n8.2 Geschillen worden voorgelegd aan de bevoegde rechter in het arrondissement Amsterdam.\n\n8.3 Partijen zullen eerst trachten een geschil in onderling overleg op te lossen.`,
          },
        ].map(s => (
          <div key={s.titel} style={{ marginBottom: '36px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, marginBottom: '12px' }}>{s.titel}</h2>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{s.tekst}</div>
          </div>
        ))}
      </div>

      <footer style={{ borderTop: '1px solid var(--line)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', flexWrap: 'wrap', gap: '12px' }}>
        <span>© 2026 LokaalKabaal B.V.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/privacy" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Over ons</Link>
        </div>
      </footer>
    </div>
  );
}
