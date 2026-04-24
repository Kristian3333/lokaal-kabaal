import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'AVG / DPIA verantwoording',
  description: 'Hoe LokaalKabaal persoonsgegevens verwerkt, welke verwerkers we gebruiken, en welke controles we toepassen.',
  alternates: { canonical: 'https://lokaalkabaal.agency/avg-dpia' },
  robots: { index: true, follow: true },
};

export default function AvgDpiaPage(): React.JSX.Element {
  const sections = [
    {
      titel: '1. Doel en reikwijdte',
      tekst: `LokaalKabaal verwerkt persoonsgegevens voor één doel: automatisch flyermateriaal bezorgen bij nieuwe bewoners van een gekozen werkgebied. Deze pagina beschrijft hoe we die verwerking vormgeven zodat procurement- en compliance-teams bij klanten hun eigen DPIA kunnen voltooien.`,
    },
    {
      titel: '2. Welke gegevens verwerken we?',
      tekst: `• Retailer-accounts: e-mail, bedrijfsnaam, KvK, branche, Stripe-klantgegevens.\n• Bezorgadressen van nieuwe bewoners (naam + adres) via Altum AI / Kadaster-data. Adressen worden alleen gebruikt voor éénmalige flyerbezorging; ruwe adresrecords worden maximaal 30 dagen bewaard.\n• QR-verificatiecodes, interesse- en conversietimestamps per flyer (geen persoons-identificerende gegevens).\n• Technische logs (IP, user-agent) maximaal 90 dagen voor abuse-preventie.`,
    },
    {
      titel: '3. Rechtsgrond',
      tekst: `Verwerking van retailer-accounts: uitvoering overeenkomst (art. 6.1.b AVG).\nVerwerking van bezorgadressen: gerechtvaardigd belang van de retailer om nieuwe bewoners te bereiken (art. 6.1.f AVG), met de volgende balans-test documentatie:\n- Noodzaak: zonder adres kan geen fysieke post bezorgd worden.\n- Gebalanceerd belang: ontvanger kan te allen tijde bezwaar maken via LokaalKabaal-contact, en adresgegevens worden niet gebruikt voor profilering.\n- Proportionaliteit: één flyer per maand maximaal, adressen worden niet verrijkt of verkocht aan derden.`,
    },
    {
      titel: '4. Verwerkers',
      tekst: `We werken met deze subverwerkers, elk onder een AVG-verwerkersovereenkomst:\n• Neon (PostgreSQL hosting, EU-regio Frankfurt)\n• Vercel (hosting + edge, EU-regio Dublin)\n• Altum AI (Kadaster-ontsluiting, NL)\n• Print.one (flyer-druk + PostNL-bezorging, NL)\n• Stripe (betaalverwerking, Ierland)\n• Resend (transactionele e-mail, EU-regio)\n• Anthropic (optioneel, AI-gegenereerde flyercopy; alleen als de retailer dit actief inschakelt)`,
    },
    {
      titel: '5. Technische en organisatorische maatregelen',
      tekst: '• HTTPS/TLS 1.3 op alle endpoints, HSTS via middleware.\n• Scrypt password-hashing, HMAC-SHA256 gesigneerde session cookies.\n• Rate limiting op auth en redeem-endpoints.\n• SSRF-guard op scrape + flyer/generate endpoints via isValidExternalUrl.\n• CSV exports met formula-injection escaping.\n• Kwetsbaarheidsrapport via security@lokaalkabaal.agency (zie security.txt).\n• Telemetry via lib/telemetry zodat Sentry eenvoudig aan te koppelen is zonder console-log-drift.\n• Principle of least privilege voor DB + API-keys (aparte SESSION_SECRET, CRON_SECRET, REDEEM_API_KEY, PRINTONE_WEBHOOK_SECRET, STRIPE_WEBHOOK_SECRET).',
    },
    {
      titel: '6. Bewaartermijnen',
      tekst: `• Retailer-accountdata: zolang het account actief is + 12 maanden na opzegging.\n• Factuur- en boekhouddata: 7 jaar (fiscale bewaarplicht).\n• Bezorgadressen nieuwe bewoners: maximaal 30 dagen na bezorging.\n• Technische logs: 90 dagen.\n• QR-verificatiecodes inclusief interesse/conversie-timestamps: levensduur van de campagne + 12 maanden voor reporting.`,
    },
    {
      titel: '7. Betrokkenenrechten',
      tekst: `Iedere betrokkene (retailer of ontvanger van een flyer) kan contact opnemen via privacy@lokaalkabaal.agency voor inzage, rectificatie, verwijdering, beperking, portabiliteit of bezwaar. Wij reageren binnen 30 dagen. Klachten kunnen worden ingediend bij de Autoriteit Persoonsgegevens.`,
    },
    {
      titel: '8. Contact en verantwoordelijke',
      tekst: `Verantwoordelijke: LokaalKabaal B.V., Amsterdam.\nPrivacy-contact: privacy@lokaalkabaal.agency\nSecurity-contact: security@lokaalkabaal.agency (zie /.well-known/security.txt)\nDPO ad-interim: Kristian Barman (cofounder).`,
    },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 40px' }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Juridisch · Procurement</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '42px', fontWeight: 400, marginBottom: '8px' }}>AVG / DPIA verantwoording</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '40px', lineHeight: 1.6 }}>
          Voor inkoop- en compliance-teams die hun eigen DPIA (Data Protection Impact Assessment) moeten afronden. Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>

        {sections.map(s => (
          <div key={s.titel} style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 400, marginBottom: '10px' }}>{s.titel}</h2>
            <div style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{s.tekst}</div>
          </div>
        ))}

        <div style={{ borderTop: '1px solid var(--line)', paddingTop: '24px', marginTop: '40px' }}>
          <Link href="/privacy" style={{ color: 'var(--green-dim)', textDecoration: 'underline', fontSize: '13px' }}>
            → Volledig privacybeleid
          </Link>
          <span style={{ color: 'var(--muted)', margin: '0 10px' }}>·</span>
          <Link href="/voorwaarden" style={{ color: 'var(--green-dim)', textDecoration: 'underline', fontSize: '13px' }}>
            Algemene voorwaarden
          </Link>
          <span style={{ color: 'var(--muted)', margin: '0 10px' }}>·</span>
          <a href="/.well-known/security.txt" style={{ color: 'var(--green-dim)', textDecoration: 'underline', fontSize: '13px' }}>
            security.txt
          </a>
        </div>
      </div>
    </div>
  );
}
