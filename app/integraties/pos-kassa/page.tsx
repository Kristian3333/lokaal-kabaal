import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Lightspeed & MplusKASSA koppeling voor flyer-codes | LokaalKabaal',
  description: 'Flyer-codes direct verzilveren op de kassa: Lightspeed, MplusKASSA en iZettle. De medewerker scant de QR, de korting wordt automatisch toegepast en de conversie landt op je dashboard.',
  alternates: { canonical: 'https://lokaalkabaal.agency/integraties/pos-kassa' },
  openGraph: {
    title: 'Kassa-integraties · LokaalKabaal',
    description: 'Lightspeed, MplusKASSA en iZettle: flyer-codes verzilveren in 1 scan.',
    url: 'https://lokaalkabaal.agency/integraties/pos-kassa',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('POS & kassa integratie') +
        '&subtitle=' +
        encodeURIComponent('Lightspeed, MplusKASSA, iZettle') +
        '&badge=' +
        encodeURIComponent('Integratie'),
    ],
  },
};

const PLATFORMEN = [
  {
    naam: 'Lightspeed Retail (X-Series)',
    kanaal: 'Custom Payment Type + Webhook',
    tekst: 'Wij leveren een klein Node-script dat als Lightspeed Payment Type kan worden geregistreerd. De medewerker scant de QR, het script valideert en trekt de korting af als een negatieve betaalregel.',
    hardware: 'Elke Lightspeed-compatibele QR-scanner (Zebra DS2208, Honeywell HH660, etc.).',
  },
  {
    naam: 'MplusKASSA',
    kanaal: 'REST API + Custom Button',
    tekst: 'MplusKASSA heeft een open REST koppeling; wij leveren een JSON handler die als "Custom Button" op de kassa wordt ingesteld. 1 klik = scan + validatie + korting-regel.',
    hardware: 'Standaard USB/Bluetooth QR-scanner is voldoende.',
  },
  {
    naam: 'iZettle / Zettle Go',
    kanaal: 'Webhook-only (geen plugin nodig)',
    tekst: 'Retailer registreert een webhook-URL in onze dashboard. Zettle-kassa genereert bij afrekenen een POST met order + scan-code; wij valideren en antwoorden met toe te passen korting.',
    hardware: 'Standaard iPad + Zettle Reader.',
  },
];

const FLOW = [
  { n: '01', titel: 'Medewerker scant QR', tekst: 'Klant laat de QR-code op de flyer zien. Kassa-scanner leest de unieke code (start altijd met LK).' },
  { n: '02', titel: 'Kassa roept onze API', tekst: 'POST /api/codes/redeem met code + retailer-ID + order-total (optioneel). Onze API antwoordt binnen 200ms met korting of een fout.' },
  { n: '03', titel: 'Korting toegepast', tekst: 'De kassa voegt een negatieve regel toe met het aangeleverde bedrag. Bon wordt geprint inclusief "korting via LokaalKabaal-flyer".' },
  { n: '04', titel: 'Conversie zichtbaar', tekst: 'Binnen 5 seconden verschijnt de conversie op jouw LokaalKabaal dashboard met PC4, tijdstip en optionele order-waarde voor CLV-tracking.' },
];

export default function PosKassaIntegratiePage(): React.JSX.Element {
  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--paper)', minHeight: '100vh', color: 'var(--ink)' }}>
      <Nav />

      <section style={{ background: 'var(--ink)', color: '#fff', padding: '80px 40px 48px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,232,122,0.1)', border: '1px solid rgba(0,232,122,0.25)',
            borderRadius: '999px', padding: '4px 14px', marginBottom: '20px',
            fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#00E87A',
          }}>
            Integratie · fysieke kassa
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Scan de QR, <em style={{ color: 'rgba(255,255,255,0.55)' }}>korting toegepast.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Geen handmatige pincode meer intypen. Onze kassa-koppelingen voor Lightspeed, MplusKASSA en Zettle verzilveren een flyer-code in 1 scan en sturen de conversie direct naar je LokaalKabaal dashboard.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Ondersteunde platformen
        </h2>
        <div style={{ display: 'grid', gap: '14px' }}>
          {PLATFORMEN.map(p => (
            <div key={p.naam} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>{p.naam}</div>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.06em' }}>{p.kanaal}</div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '8px' }}>{p.tekst}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.6 }}>
                Hardware: {p.hardware}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          De flow aan de kassa
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }} className="pos-flow">
          <style>{`
            @media (max-width: 820px) { .pos-flow { grid-template-columns: repeat(2, 1fr) !important; } }
            @media (max-width: 480px) { .pos-flow { grid-template-columns: 1fr !important; } }
          `}</style>
          {FLOW.map(f => (
            <div key={f.n} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)', letterSpacing: '0.08em', marginBottom: '6px' }}>
                STAP {f.n}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15px', marginBottom: '4px', lineHeight: 1.3 }}>
                {f.titel}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.65 }}>
                {f.tekst}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 400, marginBottom: '10px' }}>
          Fallback voor elke andere kassa
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '12px', lineHeight: 1.7 }}>
          Heb je een ander kassasysteem? Jouw medewerker kan de pincode nog altijd handmatig invoeren op{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>/verify/[code]</code>. Dat is de flow die we standaard voor nieuwe retailers aanbevelen tijdens de eerste maand, voordat een van de kassa-integraties wordt geactiveerd.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7 }}>
          Ontwikkelaars: zie <Link href="/docs/webhooks" style={{ color: 'var(--green-dim)' }}>docs/webhooks</Link> voor de HMAC-signed{' '}
          <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>conversion.registered</code> payload die onze integraties intern gebruiken.
        </p>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            POS-koppeling activeren
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Stuur ons je kassa-merk, provider en winkelvestigingen. Wij leveren de configuratie + een proefsessie met je technische contactpersoon binnen 3 werkdagen.
          </p>
          <a href="mailto:integraties@lokaalkabaal.agency?subject=POS%20koppeling%20aanvraag" style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Vraag de kassa-koppeling aan →
          </a>
        </div>
      </section>
    </div>
  );
}
