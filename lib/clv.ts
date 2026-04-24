/**
 * Branche-specific customer lifetime value (CLV) defaults.
 *
 * Values are in EUR per customer per year and come from a mix of industry
 * reports + internal benchmarks. They are intentionally conservative so
 * the ROI calculator doesn't over-promise.
 */

export interface BrancheClv {
  /** Human-readable label shown in UI */
  label: string;
  /** Default CLV slider position in EUR/jaar */
  defaultClv: number;
  /** Slider min (EUR) */
  minClv: number;
  /** Slider max (EUR) */
  maxClv: number;
  /** Short line explaining how we derived the default */
  bron: string;
}

export const BRANCHE_CLV: Record<string, BrancheClv> = {
  kapper:         { label: 'Kapper / Barbershop',     defaultClv: 360,  minClv: 150,  maxClv: 1000,  bron: '6-8 knipcycli x €50 per jaar' },
  bakker:         { label: 'Bakkerij',                defaultClv: 520,  minClv: 200,  maxClv: 1500,  bron: 'dagelijkse terugkeer, gem. €10/week' },
  restaurant:     { label: 'Restaurant',              defaultClv: 840,  minClv: 300,  maxClv: 2500,  bron: '2x per maand x €35 per couvert' },
  installateur:   { label: 'Installatiebedrijf',      defaultClv: 8000, minClv: 1000, maxClv: 25000, bron: 'gem. verbouwbudget nieuwe eigenaar' },
  fysio:          { label: 'Fysiotherapeut',          defaultClv: 720,  minClv: 300,  maxClv: 2000,  bron: '12-18 behandelingen x €45' },
  makelaar:       { label: 'Makelaar',                defaultClv: 6000, minClv: 2000, maxClv: 20000, bron: 'courtage bij eerste transactie' },
  overig:         { label: 'Overig / eigen schatting',defaultClv: 500,  minClv: 100,  maxClv: 10000, bron: 'handmatige invoer' },
};

export interface RoiInput {
  /** Flyers sent per month */
  flyersPerMaand: number;
  /** Expected conversion rate (0..1) */
  conversieRatio: number;
  /** Customer lifetime value in EUR per year */
  clvPerJaar: number;
  /** All-in monthly cost of the campaign (subscription + overage) */
  maandkostenTotaal: number;
}

export interface RoiOutput {
  /** Expected new customers per month */
  nieuweKlantenPerMaand: number;
  /** Expected revenue per month from new customers */
  omzetPerMaand: number;
  /** Payback time in months for the monthly spend */
  terugverdientijdMaanden: number;
  /** Annual ROI percentage (omzet - kosten) / kosten * 100 */
  roiJaarPct: number;
}

/**
 * Compute ROI for a flyer campaign given monthly volume, conversion, CLV
 * and cost. Pure function for easy testing.
 */
export function calculateRoi(input: RoiInput): RoiOutput {
  const nieuweKlantenPerMaand = Math.round(input.flyersPerMaand * input.conversieRatio);
  const omzetPerMaand = nieuweKlantenPerMaand * (input.clvPerJaar / 12);
  const terugverdientijdMaanden = omzetPerMaand > 0
    ? Math.max(0.1, input.maandkostenTotaal / omzetPerMaand)
    : Number.POSITIVE_INFINITY;
  const omzetPerJaar = omzetPerMaand * 12;
  const kostenPerJaar = input.maandkostenTotaal * 12;
  const roiJaarPct = kostenPerJaar > 0
    ? Math.round(((omzetPerJaar - kostenPerJaar) / kostenPerJaar) * 100)
    : 0;
  return { nieuweKlantenPerMaand, omzetPerMaand, terugverdientijdMaanden, roiJaarPct };
}
