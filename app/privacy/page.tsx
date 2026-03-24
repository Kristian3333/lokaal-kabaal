import Link from 'next/link';
import Nav from '@/components/Nav';

export default function Privacy() {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Juridisch</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, marginBottom: '8px' }}>Privacybeleid</h1>
        <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '48px' }}>Laatst bijgewerkt: 1 april 2026</p>

        {[
          {
            titel: '1. Wie zijn wij?',
            tekst: `LokaalKabaal B.V. is een marketingdienst gevestigd in Amsterdam, Nederland. Wij verzorgen de distributie van flyermateriaal aan nieuwe bewoners op basis van Kadaster-transactiedata. In dit privacybeleid leggen wij uit welke persoonsgegevens wij verwerken, met welk doel en hoe wij die beschermen.\n\nKvK: 00000000 · BTW: NL000000000B01 · Adres: Postbus 12345, 1000 AA Amsterdam · E-mail: privacy@lokaalkabaal.nl`,
          },
          {
            titel: '2. Welke gegevens verwerken wij?',
            tekst: `Wij verwerken de volgende categorieën persoonsgegevens:\n\n• Accountgegevens: naam, e-mailadres, bedrijfsnaam, KvK-nummer\n• Betalingsgegevens: IBAN, BTW-nummer, factuuradres\n• Campagnedata: gekozen werkgebieden (postcodes), flyerinhoud, startdatum\n• Technische gegevens: IP-adres, browsertype, sessiecookies\n• Bezorgadressen: naam en adres van nieuwe bewoners (verkregen via Kadaster via Altum AI) -- deze worden uitsluitend gebruikt voor de éénmalige flyerbezorging en worden niet opgeslagen na uitvoering`,
          },
          {
            titel: '3. Waarvoor gebruiken wij uw gegevens?',
            tekst: `Uw gegevens worden verwerkt voor de volgende doeleinden:\n\n• Uitvoering van de overeenkomst (flyer drukken en bezorgen)\n• Facturatie en betalingsverwerking\n• Klantenservice en communicatie\n• Verbetering van onze dienst (geanonimiseerde campagneanalyse)\n• Wettelijke verplichtingen (bewaarplicht belastingdienst: 7 jaar)`,
          },
          {
            titel: '4. Bewaartermijnen',
            tekst: `Wij bewaren uw gegevens niet langer dan noodzakelijk:\n\n• Accountgegevens: zolang uw account actief is + 12 maanden na opzegging\n• Factuurdata: 7 jaar (fiscale bewaarplicht)\n• Bezorgadressen nieuwe bewoners: maximaal 30 dagen na bezorging, daarna permanent verwijderd\n• Technische logdata: maximaal 90 dagen`,
          },
          {
            titel: '5. Uw rechten',
            tekst: `Op grond van de AVG heeft u de volgende rechten:\n\n• Recht op inzage in uw persoonsgegevens\n• Recht op correctie van onjuiste gegevens\n• Recht op verwijdering ("recht om vergeten te worden")\n• Recht op beperking van de verwerking\n• Recht op dataportabiliteit\n• Recht op bezwaar\n\nU kunt uw rechten uitoefenen door een e-mail te sturen naar privacy@lokaalkabaal.nl. Wij reageren binnen 30 dagen. Bij klachten kunt u terecht bij de Autoriteit Persoonsgegevens (autoriteitpersoonsgegevens.nl).`,
          },
          {
            titel: '6. Cookies',
            tekst: `Wij gebruiken uitsluitend functionele cookies die noodzakelijk zijn voor het functioneren van de website (sessiebeheer, inlogstatus). Wij gebruiken geen tracking- of advertentiecookies van derden. U kunt cookies uitschakelen via uw browserinstellingen, maar dit kan de functionaliteit beïnvloeden.`,
          },
          {
            titel: '7. Beveiliging',
            tekst: `Wij nemen passende technische en organisatorische maatregelen om uw gegevens te beveiligen: versleutelde verbindingen (HTTPS/TLS), toegangscontrole, regelmatige beveiligingsaudits en verwerkers contractueel gebonden aan de AVG.`,
          },
          {
            titel: '8. Contact',
            tekst: `Voor vragen over dit privacybeleid of voor het uitoefenen van uw rechten:\n\nLokaalKabaal B.V.\nE-mail: privacy@lokaalkabaal.nl\nPostbus 12345, 1000 AA Amsterdam`,
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
          <Link href="/privacy" style={{ color: 'var(--ink)', textDecoration: 'none', fontWeight: 600 }}>Privacy</Link>
          <Link href="/voorwaarden" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Voorwaarden</Link>
          <Link href="/contact" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Contact</Link>
          <Link href="/over-ons" style={{ color: 'var(--muted)', textDecoration: 'none' }}>Over ons</Link>
        </div>
      </footer>
    </div>
  );
}
