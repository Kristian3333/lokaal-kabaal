import { MetadataRoute } from 'next';
import { GEMEENTEN } from '@/lib/gemeenten';
import { CONCURRENTEN } from '@/lib/concurrenten';
import { allBrancheCityCombos } from '@/lib/industry-city';
import { BRANCHE_CLV } from '@/lib/clv';

const base = 'https://lokaalkabaal.agency';
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const gemeentenRoutes: MetadataRoute.Sitemap = GEMEENTEN.map(g => ({
    url: `${base}/flyers-versturen-${g.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
  const vergelijkRoutes: MetadataRoute.Sitemap = CONCURRENTEN.map(c => ({
    url: `${base}/vergelijk/${c.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));
  const matrixRoutes: MetadataRoute.Sitemap = allBrancheCityCombos().map(({ branche, gemeente }) => ({
    url: `${base}/flyers-versturen-${branche.slug}-in-${gemeente.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    // Lower priority than the canonical branche pages
    priority: 0.5,
  }));
  const benchmarkRoutes: MetadataRoute.Sitemap = Object.keys(BRANCHE_CLV)
    .filter(k => k !== 'overig')
    .map(b => ({
      url: `${base}/nl-verhuisdata/${b}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  return [...gemeentenRoutes, ...vergelijkRoutes, ...matrixRoutes, ...benchmarkRoutes, ...STATIC_ROUTES];
}

const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
  { url: `${base}/flyers-versturen-nieuwe-bewoners`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${base}/direct-mail-mkb`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  { url: `${base}/flyers-versturen-kapper`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/flyers-versturen-bakker`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/flyers-versturen-installateur`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/flyers-versturen-restaurant`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/flyers-versturen-makelaar`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/tools/verhuisdata`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/tools/roi-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/nl-verhuisdata`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  { url: `${base}/blog/digital-first`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${base}/blog/digitale-moeheid`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${base}/blog/eerste-kennismaking`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${base}/blog/hyperlokaal`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${base}/over-ons`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${base}/voorwaarden`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  { url: `${base}/avg-dpia`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
  { url: `${base}/iso-27001-roadmap`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${base}/voorbeelden/maandrapport`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  { url: `${base}/docs/webhooks`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  { url: `${base}/gemeenten`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${base}/white-label`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${base}/data`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${base}/design`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${base}/retargeting`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${base}/welkomstpakket-gemeenten`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  { url: `${base}/be`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  { url: `${base}/de`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
];
