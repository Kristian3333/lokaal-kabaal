import { MetadataRoute } from 'next';

const base = 'https://lokaalkabaal.agency';
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/flyers-versturen-nieuwe-bewoners`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/direct-mail-mkb`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/flyers-versturen-kapper`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/flyers-versturen-bakker`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/flyers-versturen-installateur`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/flyers-versturen-restaurant`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/flyers-versturen-makelaar`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/blog/digital-first`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/blog/digitale-moeheid`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/blog/eerste-kennismaking`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/blog/hyperlokaal`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/over-ons`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/voorwaarden`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
