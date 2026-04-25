import type { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { buildMailto } from '@/lib/contact-config';

export const metadata: Metadata = {
  title: 'Voor partners: open data + link-kit | LokaalKabaal',
  description: 'Ben je gemeente, ondernemersvereniging of makelaarskantoor? Onze open verhuisdata, ROI-calculator en branche-benchmarks zijn vrij te gebruiken. Link-kit inclusief.',
  alternates: { canonical: 'https://lokaalkabaal.agency/voor-partners' },
  openGraph: {
    title: 'Partners + link-kit · LokaalKabaal',
    description: 'Open verhuisdata, tools en branche-benchmarks -- vrij te gebruiken voor gemeenten en ondernemersverenigingen.',
    url: 'https://lokaalkabaal.agency/voor-partners',
    images: [
      'https://lokaalkabaal.agency/api/og?title=' +
        encodeURIComponent('Voor partners') +
        '&subtitle=' +
        encodeURIComponent('Open data + link-kit voor gemeenten en verenigingen') +
        '&badge=' +
        encodeURIComponent('Partners'),
    ],
  },
};

type Asset = {
  titel: string;
  pad: string;
  waarom: string;
  anchor: string;
  voor: string;
};

const ASSETS: Asset[] = [
  {
    titel: 'NL verhuisdata dashboard',
    pad: '/nl-verhuisdata',
    waarom: 'Live landelijke totalen + provincie-tabel met top-3 gemeenten. Gebaseerd op Kadaster + Altum AI.',
    anchor: 'Actuele verhuisstatistieken per provincie',
    voor: 'Gemeentelijk economisch beleid, makelaarskantoren, journalisten.',
  },
  {
    titel: 'Branche-benchmarks',
    pad: '/nl-verhuisdata/kapper',
    waarom: 'Per branche: nationale markt omvang, provincie-tabel met verwachte maandomzet en conversie-ratio.',
    anchor: 'Markt-omvang voor [branche] in Nederland',
    voor: 'Ondernemersverenigingen, franchise-moederbedrijven, sector-onderzoekers.',
  },
  {
    titel: 'ROI-calculator voor flyer-campagnes',
    pad: '/tools/roi-calculator',
    waarom: 'Gratis tool die input-parameters (budget, branche, conversie) omzet naar verwachte omzet + pay-back-tijd.',
    anchor: 'Gratis ROI-calculator voor direct-mail campagnes',
    voor: 'Bedrijfsadviseurs, accountants die MKB adviseren, startcentra.',
  },
  {
    titel: 'Verhuisdata per gemeente',
    pad: '/tools/verhuisdata',
    waarom: 'Interactieve lookup-tool voor specifieke postcodes en gemeenten.',
    anchor: 'Verhuisdata opzoeken per postcode of gemeente',
    voor: 'Bewonersinformatie-pagina&apos;s, nieuws-sites, buurtvereniging-portals.',
  },
  {
    titel: 'Welkomstpakket-concept voor gemeenten',
    pad: '/welkomstpakket-gemeenten',
    waarom: 'Business-case pagina voor gemeenten, met kostenmodel per gemeente-grootte en bestuurlijk-dekkende materialen.',
    anchor: 'Business-case welkomstpakket nieuwe bewoners',
    voor: 'Beleidsmedewerkers Economie/Dienstverlening, VNG-nieuwsbrieven.',
  },
  {
    titel: 'Neurowetenschap van de nieuwe bewoner',
    pad: '/blog/neurowetenschap-nieuwe-bewoner',
    waarom: 'Research-driven artikel over habit-formation na verhuizing met citaties naar Wendy Wood / USC.',
    anchor: 'Waarom de eerste 30 dagen na verhuizing marketingtechnisch goud waard zijn',
    voor: 'Marketing-publicaties, retail-vakbladen, ondernemers-nieuwsbrieven.',
  },
];

export default function VoorPartnersPage(): React.JSX.Element {
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
            Voor partners · open data + link-kit
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '18px' }}>
            Verwijs gewoon naar ons, <em style={{ color: 'rgba(255,255,255,0.55)' }}>gratis.</em>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '640px' }}>
            Onze verhuisdata, branche-benchmarks en ROI-tools zijn publiek. Gemeenten, ondernemersverenigingen, makelaarskantoren en vakbladen mogen ze vrij citeren en linken. Hieronder de lijst van pagina&apos;s waar een backlink voor iedereen waardevol is, met suggested anchor-tekst.
          </p>
        </div>
      </section>

      <section style={{ padding: '56px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '20px' }}>
          Vrij te gebruiken assets
        </h2>
        <div style={{ display: 'grid', gap: '14px' }}>
          {ASSETS.map(a => (
            <div key={a.pad} style={{ background: 'var(--white)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 26px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px' }}>{a.titel}</div>
                <Link href={a.pad} style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--green-dim)' }}>
                  {a.pad} →
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '10px' }}>{a.waarom}</p>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                IDEAAL VOOR: {a.voor}
              </div>
              <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '10px 14px', marginTop: '4px' }}>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: '4px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Suggested anchor
                </div>
                <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--ink)' }}>
                  {`<a href="https://lokaalkabaal.agency${a.pad}">${a.anchor}</a>`}
                </code>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 56px', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', fontWeight: 400, marginBottom: '12px' }}>
          Diepere samenwerking
        </h2>
        <div style={{ background: 'var(--paper2)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '22px 26px', marginBottom: '14px' }}>
          <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--ink)', marginBottom: '10px' }}>
            Naast simpele backlinks werken we in drie vormen samen:
          </p>
          <ul style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.85, margin: 0, paddingLeft: '20px' }}>
            <li><strong style={{ color: 'var(--ink)' }}>Co-branded research</strong>: wij leveren data, jij het redactionele frame. Publicatie op beide sites.</li>
            <li><strong style={{ color: 'var(--ink)' }}>Embed-widgets</strong>: de ROI-calculator en de verhuisdata-lookup zijn beschikbaar als iframe-embed voor gemeente- of verenigingsites (met automatische backlink).</li>
            <li><strong style={{ color: 'var(--ink)' }}>Event-sponsoring</strong>: wij sponsoren een MKB-bijeenkomst in ruil voor een speakers-slot of nieuwsbrief-mention.</li>
          </ul>
          <p style={{ fontSize: '12px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '12px', lineHeight: 1.6 }}>
            Geen geld-voor-link deals. Google verbiedt het en het werkt op de lange termijn niet -- we richten ons op wederzijds waardevolle uitwisseling.
          </p>
        </div>
      </section>

      <section style={{ padding: '48px 40px', background: 'var(--paper2)' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, marginBottom: '12px' }}>
            Partnership pitchen
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.65 }}>
            Stuur ons je domein + een korte beschrijving van je doelgroep. We antwoorden binnen 5 werkdagen met een voorstel voor de meest logische samenwerking.
          </p>
          <a href={buildMailto('partners')} style={{
            display: 'inline-block', padding: '14px 32px', background: 'var(--ink)', color: '#fff',
            fontSize: '14px', fontWeight: 800, textDecoration: 'none', borderRadius: '4px',
          }}>
            Stuur ons een pitch →
          </a>
        </div>
      </section>
    </div>
  );
}
