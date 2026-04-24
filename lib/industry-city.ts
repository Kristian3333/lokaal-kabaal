/**
 * Industry x city combination definitions for programmatic SEO at
 * /flyers-versturen-[branche]-[gemeente]. Covers 6 core industries that
 * each have their own landing page, crossed with the 40 gemeenten.
 *
 * Total pages: 6 x 40 = 240 combos. All canonicalise to the main branche
 * page so we don't create duplicate-content risk -- they exist to rank
 * for long-tail "[branche] in [stad]" queries, not to replace the
 * branche pages.
 */

import { GEMEENTEN, type Gemeente } from '@/lib/gemeenten';

export interface Branche {
  /** URL slug used in /flyers-versturen-[slug] + in the combined URL */
  slug: string;
  /** Display label used in page copy */
  label: string;
  /** Canonical URL for the branche-only page */
  canonicalPath: string;
  /** Short pitch shown in the hero, e.g. "kappers die vaste klanten zoeken" */
  pitch: string;
  /** Plural noun for use in sentences like "kappers in Amsterdam" */
  meervoud: string;
}

export const BRANCHES: Branche[] = [
  { slug: 'kapper',         label: 'kapper',        canonicalPath: '/flyers-versturen-kapper',        pitch: 'Nieuwe bewoners kiezen hun vaste kapper in de eerste 30 dagen na een verhuizing.', meervoud: 'kappers' },
  { slug: 'bakker',         label: 'bakker',        canonicalPath: '/flyers-versturen-bakker',        pitch: 'Wie als eerste een versbrood-flyer op de mat legt, wordt de stambakker.',           meervoud: 'bakkers' },
  { slug: 'installateur',   label: 'installateur',  canonicalPath: '/flyers-versturen-installateur',  pitch: 'Nieuwe huiseigenaren investeren gemiddeld €8.000 in verbouwing in het eerste jaar.', meervoud: 'installatiebedrijven' },
  { slug: 'restaurant',     label: 'restaurant',    canonicalPath: '/flyers-versturen-restaurant',    pitch: 'Een nieuwe bewoner boekt 2x per maand een restaurant in de buurt -- jij wil de eerste keuze zijn.', meervoud: 'restaurants' },
  { slug: 'makelaar',       label: 'makelaar',      canonicalPath: '/flyers-versturen-makelaar',      pitch: 'Volgende verhuizing of verbouwhypotheek begint met een bekende makelaar in de buurt.', meervoud: 'makelaars' },
  { slug: 'nieuwe-bewoners',label: 'nieuwe bewoner',canonicalPath: '/flyers-versturen-nieuwe-bewoners', pitch: 'Alle nieuwe huiseigenaren in jouw postcodes -- automatisch elke maand bereikt.',   meervoud: 'nieuwe bewoners' },
];

export function findBrancheBySlug(slug: string): Branche | null {
  return BRANCHES.find(b => b.slug === slug) ?? null;
}

/**
 * Return all (branche, gemeente) combinations for static generation.
 * Used by generateStaticParams on the programmatic route.
 */
export function allBrancheCityCombos(): { branche: Branche; gemeente: Gemeente }[] {
  const combos: { branche: Branche; gemeente: Gemeente }[] = [];
  for (const b of BRANCHES) {
    for (const g of GEMEENTEN) {
      combos.push({ branche: b, gemeente: g });
    }
  }
  return combos;
}
