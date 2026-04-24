import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Algemene Voorwaarden',
  description: 'De algemene voorwaarden van LokaalKabaal: pakketten, bezorging, betaling, aansprakelijkheid en opzegging.',
  alternates: { canonical: 'https://lokaalkabaal.agency/voorwaarden' },
  robots: { index: true, follow: true },
};

export default function Voorwaarden() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Juridisch</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, marginBottom: '8px' }}>Algemene Voorwaarden</h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '48px' }}>Versie 1.0 · Geldig vanaf 1 april 2026</p>

        {[
          {
            titel: 'Artikel 1 - Definities',
            tekst: `In deze Algemene Voorwaarden gelden de volgende definities:\n\n• LokaalKabaal: LokaalKabaal B.V., gevestigd te Amsterdam, KvK 00000000\n• Klant: de onderneming die een campagne boekt via het platform\n• Campagne: de opdracht om flyermateriaal te drukken en te bezorgen aan nieuwe bewoners in een gekozen werkgebied\n• Werkgebied: het geografische gebied (gedefinieerd via centrum-postcode en straal) waarbinnen flyers worden bezorgd\n• Nieuwe bewoners: personen wier adres binnen de afgelopen 30-60 dagen in het Kadaster is geregistreerd als eigendomsoverdracht\n• Bezorgmoment: de vaste maandelijkse bezorgperiode, zijnde de 28e t/m 30e van elke maand`,
          },
          {
            titel: 'Artikel 2 - Toepasselijkheid',
            tekst: `2.1 Deze Algemene Voorwaarden zijn van toepassing op alle overeenkomsten tussen LokaalKabaal en de Klant.\n\n2.2 Afwijkingen zijn uitsluitend geldig indien schriftelijk overeengekomen.\n\n2.3 LokaalKabaal behoudt zich het recht voor deze voorwaarden te wijzigen. Klanten worden hierover minimaal 30 dagen van tevoren per e-mail geïnformeerd.`,
          },
          {
            titel: 'Artikel 3 - De dienst',
            tekst: `3.1 LokaalKabaal verzorgt het drukken en bezorgen van flyermateriaal aan nieuwe bewoners in het gekozen werkgebied.\n\n3.2 Bezorging vindt maandelijks plaats tussen de 28e en 30e van de maand via PostNL of vergelijkbare bezorgdienst.\n\n3.3 Adressen worden bepaald via de Altum AI / Kadaster API op basis van eigendomsoverdrachten in de afgelopen 30-60 dagen. Per klant wordt per maand maximaal 1 API-verzoek gedaan.\n\n3.4 LokaalKabaal garandeert een inspanningsverplichting maar geen resultaatsverplichting (conversie, omzet of respons).`,
          },
          {
            titel: 'Artikel 4 - Prijzen en betaling',
            tekst: `4.1 LokaalKabaal biedt drie maandabonnementen aan. A6 dubbelzijdig is standaard in elk pakket. Prijzen zijn excl. BTW:\n\n• Starter: € 349 per maand -- 300 flyers/mnd inbegrepen, max. 100 km werkgebiedstraal\n• Pro: € 499 per maand -- 400 flyers/mnd inbegrepen, max. 200 km werkgebiedstraal\n• Agency: € 649 per maand -- 500 flyers/mnd inbegrepen, onbeperkt werkgebied\n\n4.2 Jaarabonnement: 15% korting, per jaar vooruit gefactureerd, niet tussentijds opzegbaar.\n\n4.3 Upgrade naar A5: +€ 0,15 per flyer, bovenop het abonnement.\n\n4.4 Extra flyers buiten de bundel (tot 4.999 A6/maand): € 0,70 per flyer.\n\n4.5 Vanaf 5.000 flyers per maand geldt een maatwerktarief op aanvraag via support@lokaalkabaal.agency.\n\n4.6 Proef flyer: € 4,95 eenmalig.\n\n4.7 Betaling geschiedt via automatische incasso op de 1e van de maand. Bij niet-tijdige betaling is de Klant wettelijke rente verschuldigd.`,
          },
          {
            titel: 'Artikel 5 - Levering en uitvoering',
            tekst: `5.1 De Klant dient flyerinhoud uiterlijk 10 dagen voor het bezorgmoment aan te leveren in PDF (drukklaar, 300 dpi, inclusief 3mm afloop).\n\n5.2 Aanlevering na deze deadline verschuift de campagne automatisch naar de eerstvolgende bezorgmaand.\n\n5.3 Het abonnement dekt maximaal het inbegrepen aantal flyers per maand. Bevat het werkgebied in een bepaalde maand minder nieuwe bewoners dan de bundel, dan betaalt de Klant toch het volledige abonnementsbedrag; ongebruikte flyers vervallen aan het einde van de maand en worden niet overgedragen.\n\n5.4 LokaalKabaal is niet aansprakelijk voor vertragingen door PostNL of vergelijkbare bezorgdiensten.`,
          },
          {
            titel: 'Artikel 6 - Annulering',
            tekst: `6.1 Annulering is kosteloos tot 15 dagen voor de bezorgdatum van de eerste campagnemaand.\n\n6.2 Na deze datum wordt 50% van het campagnebedrag in rekening gebracht.\n\n6.3 Na aanvang van de productie (drukken) is geen annulering meer mogelijk.`,
          },
          {
            titel: 'Artikel 7 - Aansprakelijkheid',
            tekst: `7.1 De aansprakelijkheid van LokaalKabaal is beperkt tot het factuurbedrag van de betreffende campagne.\n\n7.2 LokaalKabaal is niet aansprakelijk voor indirecte schade, gederfde winst of gevolgschade.\n\n7.3 De Klant is verantwoordelijk voor de juistheid en rechtmatigheid van de flyerinhoud en vrijwaart LokaalKabaal van aanspraken van derden.`,
          },
          {
            titel: 'Artikel 8 - Toepasselijk recht',
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
