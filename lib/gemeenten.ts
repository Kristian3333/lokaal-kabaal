/**
 * Curated list of Dutch municipalities for programmatic SEO pages.
 *
 * Starting with the top 40 by population -- these individually rank for
 * "flyers versturen [city]" intent. The rest can be appended in batches
 * without code changes to the route.
 */

export interface Gemeente {
  /** URL slug used in /flyers-versturen-[slug] */
  slug: string;
  /** Display name with proper capitalisation */
  naam: string;
  /** Province ISO code (NL-FR, NL-GR, etc.) */
  provincie: string;
  /** Approximate population; used in page copy */
  inwoners: number;
  /** Representative PC4 postcode for hero map centering */
  pc4: string;
}

export const GEMEENTEN: Gemeente[] = [
  { slug: 'amsterdam',        naam: 'Amsterdam',        provincie: 'Noord-Holland', inwoners: 921000, pc4: '1012' },
  { slug: 'rotterdam',        naam: 'Rotterdam',        provincie: 'Zuid-Holland',  inwoners: 664000, pc4: '3011' },
  { slug: 'den-haag',         naam: 'Den Haag',         provincie: 'Zuid-Holland',  inwoners: 566000, pc4: '2511' },
  { slug: 'utrecht',          naam: 'Utrecht',          provincie: 'Utrecht',       inwoners: 368000, pc4: '3511' },
  { slug: 'eindhoven',        naam: 'Eindhoven',        provincie: 'Noord-Brabant', inwoners: 246000, pc4: '5611' },
  { slug: 'groningen',        naam: 'Groningen',        provincie: 'Groningen',     inwoners: 239000, pc4: '9711' },
  { slug: 'tilburg',          naam: 'Tilburg',          provincie: 'Noord-Brabant', inwoners: 228000, pc4: '5038' },
  { slug: 'almere',           naam: 'Almere',           provincie: 'Flevoland',     inwoners: 221000, pc4: '1315' },
  { slug: 'breda',            naam: 'Breda',            provincie: 'Noord-Brabant', inwoners: 187000, pc4: '4811' },
  { slug: 'nijmegen',         naam: 'Nijmegen',         provincie: 'Gelderland',    inwoners: 184000, pc4: '6511' },
  { slug: 'apeldoorn',        naam: 'Apeldoorn',        provincie: 'Gelderland',    inwoners: 166000, pc4: '7311' },
  { slug: 'arnhem',           naam: 'Arnhem',           provincie: 'Gelderland',    inwoners: 165000, pc4: '6811' },
  { slug: 'haarlem',          naam: 'Haarlem',          provincie: 'Noord-Holland', inwoners: 164000, pc4: '2011' },
  { slug: 'enschede',         naam: 'Enschede',         provincie: 'Overijssel',    inwoners: 161000, pc4: '7511' },
  { slug: 'amersfoort',       naam: 'Amersfoort',       provincie: 'Utrecht',       inwoners: 160000, pc4: '3811' },
  { slug: 'zaanstad',         naam: 'Zaanstad',         provincie: 'Noord-Holland', inwoners: 158000, pc4: '1506' },
  { slug: 's-hertogenbosch',  naam: '\'s-Hertogenbosch',provincie: 'Noord-Brabant', inwoners: 158000, pc4: '5211' },
  { slug: 'haarlemmermeer',   naam: 'Haarlemmermeer',   provincie: 'Noord-Holland', inwoners: 161000, pc4: '2132' },
  { slug: 'zwolle',           naam: 'Zwolle',           provincie: 'Overijssel',    inwoners: 131000, pc4: '8011' },
  { slug: 'zoetermeer',       naam: 'Zoetermeer',       provincie: 'Zuid-Holland',  inwoners: 126000, pc4: '2711' },
  { slug: 'leeuwarden',       naam: 'Leeuwarden',       provincie: 'Friesland',     inwoners: 125000, pc4: '8911' },
  { slug: 'leiden',           naam: 'Leiden',           provincie: 'Zuid-Holland',  inwoners: 125000, pc4: '2311' },
  { slug: 'dordrecht',        naam: 'Dordrecht',        provincie: 'Zuid-Holland',  inwoners: 120000, pc4: '3311' },
  { slug: 'maastricht',       naam: 'Maastricht',       provincie: 'Limburg',       inwoners: 121000, pc4: '6211' },
  { slug: 'ede',              naam: 'Ede',              provincie: 'Gelderland',    inwoners: 120000, pc4: '6711' },
  { slug: 'alphen-aan-den-rijn',naam: 'Alphen aan den Rijn',provincie: 'Zuid-Holland',inwoners: 115000,pc4: '2401' },
  { slug: 'alkmaar',          naam: 'Alkmaar',          provincie: 'Noord-Holland', inwoners: 111000, pc4: '1811' },
  { slug: 'delft',            naam: 'Delft',            provincie: 'Zuid-Holland',  inwoners: 106000, pc4: '2611' },
  { slug: 'venlo',            naam: 'Venlo',            provincie: 'Limburg',       inwoners: 102000, pc4: '5911' },
  { slug: 'deventer',         naam: 'Deventer',         provincie: 'Overijssel',    inwoners: 102000, pc4: '7411' },
  { slug: 'helmond',          naam: 'Helmond',          provincie: 'Noord-Brabant', inwoners: 95000,  pc4: '5701' },
  { slug: 'oss',              naam: 'Oss',              provincie: 'Noord-Brabant', inwoners: 94000,  pc4: '5341' },
  { slug: 'hilversum',        naam: 'Hilversum',        provincie: 'Noord-Holland', inwoners: 92000,  pc4: '1211' },
  { slug: 'amstelveen',       naam: 'Amstelveen',       provincie: 'Noord-Holland', inwoners: 92000,  pc4: '1181' },
  { slug: 'westland',         naam: 'Westland',         provincie: 'Zuid-Holland',  inwoners: 111000, pc4: '2671' },
  { slug: 'purmerend',        naam: 'Purmerend',        provincie: 'Noord-Holland', inwoners: 92000,  pc4: '1441' },
  { slug: 'sittard-geleen',   naam: 'Sittard-Geleen',   provincie: 'Limburg',       inwoners: 91000,  pc4: '6131' },
  { slug: 'roosendaal',       naam: 'Roosendaal',       provincie: 'Noord-Brabant', inwoners: 78000,  pc4: '4701' },
  { slug: 'schiedam',         naam: 'Schiedam',         provincie: 'Zuid-Holland',  inwoners: 80000,  pc4: '3111' },
  { slug: 'spijkenisse',      naam: 'Spijkenisse',      provincie: 'Zuid-Holland',  inwoners: 73000,  pc4: '3201' },
];

/** Look up a gemeente by its URL slug. Returns null when not found. */
export function findGemeenteBySlug(slug: string): Gemeente | null {
  return GEMEENTEN.find(g => g.slug === slug) ?? null;
}

/**
 * Estimate monthly new-movers for a gemeente from population.
 *
 * NL-wide average: ~5.5% of households change owner per year, avg
 * household size is ~2.1 people. So new-movers / month is roughly
 * inwoners * 0.055 / 2.1 / 12. Result is rounded to a nice number
 * for display copy.
 */
export function estimateNewMoversPerMonth(inwoners: number): number {
  const raw = (inwoners * 0.055) / 2.1 / 12;
  // Round to 2 significant digits so copy reads naturally (e.g. 180, 2.100)
  const mag = Math.pow(10, Math.max(0, Math.floor(Math.log10(raw)) - 1));
  return Math.round(raw / mag) * mag;
}
