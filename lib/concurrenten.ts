/**
 * Comparison data for bottom-of-funnel SEO pages at /vergelijk/[slug].
 *
 * Each competitor entry captures the honest differentiators so the page
 * reads as a fair comparison (not a hit piece). Copy is intentionally
 * neutral -- we win on hyperlocal + automation, they win on scale or
 * brand recognition.
 */

export interface Concurrent {
  slug: string;
  naam: string;
  tagline: string;
  /** One-liner describing their strength honestly */
  waarInGoed: string;
  /** Neutral URL to the competitor's service page (for the outbound link) */
  website: string;
  /** Side-by-side feature matrix. true = supported, false = not, 'partial' for caveats */
  features: {
    feature: string;
    us: boolean | 'partial';
    them: boolean | 'partial';
    /** Optional footnote if a value is 'partial' */
    note?: string;
  }[];
  /** Who should pick the competitor over us (honest advice) */
  wanneerZijKiezen: string;
  /** Who should pick LokaalKabaal instead */
  wanneerWijKiezen: string;
}

export const CONCURRENTEN: Concurrent[] = [
  {
    slug: 'spotta',
    naam: 'Spotta',
    tagline: 'Folders in een folderpakket naar heel Nederland',
    waarInGoed: 'Grote volumes folderdistributie via brievenbussen zonder ja/ja-sticker, landelijk dekkend netwerk.',
    website: 'https://www.spotta.nl',
    features: [
      { feature: 'Targeting op nieuwe bewoners (Kadaster)', us: true,  them: false },
      { feature: 'Automatische maandelijkse bezorging',     us: true,  them: false, note: 'Spotta werkt per losse campagne' },
      { feature: 'QR-code tracking + conversiemeting',     us: true,  them: false },
      { feature: 'Integratie met webshop (redeem API)',    us: true,  them: false },
      { feature: 'Brede landelijke coverage',              us: 'partial', them: true, note: 'Wij dekken heel NL, Spotta heeft diepere penetratie' },
      { feature: 'A5 en A6 dubbelzijdig',                  us: true,  them: true },
      { feature: 'Per-stuk persoonlijke adressering',      us: true,  them: false },
      { feature: 'Dashboard met realtime scans',           us: true,  them: false },
      { feature: 'Minimum afname',                         us: 'partial', them: false, note: '300 flyers/maand binnen abonnement' },
    ],
    wanneerZijKiezen:
      'Je wil honderdduizenden folders in één keer landelijk verspreiden, zonder targeting op nieuwe bewoners. Spotta heeft dan het meest kostenefficiënte volume.',
    wanneerWijKiezen:
      'Je bent een lokale ondernemer die specifiek nieuwe huiseigenaren in eigen werkgebied wil bereiken op het moment dat zij nieuwe leveranciers kiezen, met meetbare QR-conversie.',
  },
  {
    slug: 'postnl-direct-mail',
    naam: 'PostNL Direct Mail',
    tagline: 'Geadresseerde post via het reguliere PostNL-netwerk',
    waarInGoed: 'Betrouwbare bezorging via PostNL met hoge levermate, geschikt voor transactionele post en mailings met grote variatie in format.',
    website: 'https://www.postnl.nl/zakelijke-oplossingen/direct-mail',
    features: [
      { feature: 'Targeting op nieuwe bewoners',           us: true,  them: false, note: 'PostNL levert het adres, niet de doelgroep-data' },
      { feature: 'Automatische maandelijkse cyclus',       us: true,  them: false },
      { feature: 'QR-tracking met retailer-pincode',       us: true,  them: false },
      { feature: 'All-in prijs incl. druk en bezorging',   us: true,  them: 'partial', note: 'PostNL is bezorgen, druk koop je apart' },
      { feature: 'Vast abonnement vanaf €349/mnd',         us: true,  them: false },
      { feature: 'Brede formatenkeuze',                    us: 'partial', them: true, note: 'Wij focussen op A6/A5' },
      { feature: 'Integratie met eigen CRM',               us: true,  them: true },
      { feature: 'Drempelloos starten (geen contract)',    us: true,  them: false },
    ],
    wanneerZijKiezen:
      'Je hebt een eigen adresbestand, eigen drukker en wil alleen de bezorging inkopen. Of je stuurt geadresseerde post met complexe variabele inhoud (bijvoorbeeld jaaroverzichten).',
    wanneerWijKiezen:
      'Je wil het end-to-end uitbesteden: Kadaster-data, druk, adressering, bezorging en conversiemeting in één abonnement.',
  },
  {
    slug: 'facebook-ads',
    naam: 'Facebook/Meta Ads',
    tagline: 'Digitale advertenties op Facebook + Instagram',
    waarInGoed: 'Goedkoop testen van creatives, gedetailleerde interest-targeting, directe conversie naar webshop.',
    website: 'https://www.facebook.com/business/ads',
    features: [
      { feature: 'Fysiek op de keukentafel terechtkomen',  us: true,  them: false },
      { feature: 'Timing rond verhuizing',                 us: true,  them: 'partial', note: 'Meta heeft lifecycle-events maar niet verhuis-granulariteit' },
      { feature: 'Voorspelbare maandelijkse kosten',       us: true,  them: false, note: 'CPC schommelt per veiling' },
      { feature: 'Lange leestijd / tastbaar',              us: true,  them: false },
      { feature: 'Realtime A/B testing',                   us: 'partial', them: true, note: 'Agency tier bij ons ondersteunt A/B' },
      { feature: 'Clickthrough naar webshop',              us: 'partial', them: true, note: 'Via QR-code scan' },
      { feature: 'Werk bij digital-moe publiek',           us: true,  them: false },
      { feature: 'Geen advertentieblindheid',              us: true,  them: false },
    ],
    wanneerZijKiezen:
      'Je bent een pure e-commerce speler zonder fysieke winkel, je wil veel creatives snel testen tegen impulskoop-publiek, of je doelgroep is landelijk/online.',
    wanneerWijKiezen:
      'Je hebt een lokaal bedrijf (kapper, bakker, installateur, fysio) en je wil vaste klanten winnen op het moment dat nieuwe bewoners hun lokale keuze maken. Digitale ads komen niet naast de koffie op de keukentafel terecht.',
  },
];

export function findConcurrentBySlug(slug: string): Concurrent | null {
  return CONCURRENTEN.find(c => c.slug === slug) ?? null;
}
