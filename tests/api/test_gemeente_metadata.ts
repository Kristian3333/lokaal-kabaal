import { describe, it, expect } from 'vitest';
import { generateStaticParams, generateMetadata } from '@/app/flyers-versturen-[gemeente]/page';

describe('flyers-versturen-[gemeente] generateStaticParams', () => {
  it('test_generateStaticParams_returnsAtLeast40Slugs', () => {
    const params = generateStaticParams();
    expect(params.length).toBeGreaterThanOrEqual(40);
    for (const p of params) {
      expect(typeof p.gemeente).toBe('string');
      expect(p.gemeente).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('test_generateStaticParams_includesBigFourCities', () => {
    const slugs = generateStaticParams().map(p => p.gemeente);
    expect(slugs).toContain('amsterdam');
    expect(slugs).toContain('rotterdam');
    expect(slugs).toContain('utrecht');
    expect(slugs).toContain('den-haag');
  });
});

describe('flyers-versturen-[gemeente] generateMetadata', () => {
  it('test_generateMetadata_knownSlug_returnsCityTitle', () => {
    const meta = generateMetadata({ params: { gemeente: 'utrecht' } });
    expect(meta.title).toContain('Utrecht');
    expect(meta.description).toContain('Utrecht');
    expect(meta.alternates?.canonical).toBe('https://lokaalkabaal.agency/flyers-versturen-utrecht');
    expect(meta.openGraph?.url).toBe('https://lokaalkabaal.agency/flyers-versturen-utrecht');
  });

  it('test_generateMetadata_hyphenatedSlug_renderedCorrectly', () => {
    const meta = generateMetadata({ params: { gemeente: 'den-haag' } });
    expect(meta.title).toContain('Den Haag');
  });

  it('test_generateMetadata_differentSlugs_differentTitles', () => {
    const a = generateMetadata({ params: { gemeente: 'amsterdam' } });
    const b = generateMetadata({ params: { gemeente: 'rotterdam' } });
    expect(a.title).not.toBe(b.title);
    expect(a.description).not.toBe(b.description);
  });

  it('test_generateMetadata_unknownSlug_returnsNotFoundTitle', () => {
    const meta = generateMetadata({ params: { gemeente: 'narnia' } });
    expect(meta.title).toContain('niet gevonden');
  });

  it('test_generateMetadata_ogImageUsesOgRoute_withEncodedCityTitle', () => {
    const meta = generateMetadata({ params: { gemeente: 'amsterdam' } });
    const images = meta.openGraph?.images;
    const imgUrl = Array.isArray(images) ? images[0] : images;
    expect(typeof imgUrl).toBe('string');
    expect(imgUrl as string).toContain('/api/og');
    expect(imgUrl as string).toContain(encodeURIComponent('Flyers in Amsterdam'));
  });
});
