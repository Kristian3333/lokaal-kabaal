import { describe, it, expect } from 'vitest';
import {
  buildReviewsJsonLd,
  computeReviewStats,
  type ReviewRecord,
} from '@/lib/reviews-jsonld';

const r = (over: Partial<ReviewRecord>): ReviewRecord => ({
  author: 'Test',
  rating: 5,
  body: 'Great',
  publishedAt: '2026-03-01',
  source: 'trustpilot',
  ...over,
});

describe('computeReviewStats', () => {
  it('test_stats_emptyList_zeroCountNeutralRating', () => {
    expect(computeReviewStats([])).toEqual({
      ratingValue: 0,
      reviewCount: 0,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it('test_stats_singleFive_returnsFivePointZero', () => {
    expect(computeReviewStats([r({ rating: 5 })])).toEqual({
      ratingValue: 5,
      reviewCount: 1,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it('test_stats_average345_returnsFour', () => {
    const stats = computeReviewStats([
      r({ rating: 3 }), r({ rating: 4 }), r({ rating: 5 }),
    ]);
    expect(stats.ratingValue).toBe(4);
    expect(stats.reviewCount).toBe(3);
  });

  it('test_stats_filtersNaNAndOutOfRange_usingOnlyValid', () => {
    const stats = computeReviewStats([
      r({ rating: NaN }),
      r({ rating: 0 }),
      r({ rating: 6 }),
      r({ rating: 4 }),
      r({ rating: 5 }),
    ]);
    expect(stats.reviewCount).toBe(2);
    expect(stats.ratingValue).toBe(4.5);
  });

  it('test_stats_rounds433_toOneDecimal', () => {
    // avg of 4,4,5 = 4.333... -> 4.3
    const stats = computeReviewStats([
      r({ rating: 4 }), r({ rating: 4 }), r({ rating: 5 }),
    ]);
    expect(stats.ratingValue).toBe(4.3);
  });
});

describe('buildReviewsJsonLd', () => {
  it('test_jsonld_emptyList_returnsNull', () => {
    expect(buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews: [],
    })).toBeNull();
  });

  it('test_jsonld_basic_shapeHasProductAndAggregateRating', () => {
    const res = buildReviewsJsonLd({
      productName: 'LokaalKabaal',
      productDescription: 'Flyer automation',
      reviews: [r({ rating: 5, author: 'Anna' })],
    });
    expect(res).not.toBeNull();
    expect(res?.['@context']).toBe('https://schema.org');
    expect(res?.['@type']).toBe('Product');
    expect(res?.name).toBe('LokaalKabaal');
    expect(res?.aggregateRating.ratingValue).toBe('5.0');
    expect(res?.aggregateRating.reviewCount).toBe(1);
    expect(res?.review[0].author.name).toBe('Anna');
  });

  it('test_jsonld_sortsNewestFirst', () => {
    const res = buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews: [
        r({ publishedAt: '2026-01-01', author: 'old' }),
        r({ publishedAt: '2026-03-15', author: 'newer' }),
        r({ publishedAt: '2026-02-01', author: 'mid' }),
      ],
    });
    expect(res?.review.map(x => x.author.name)).toEqual(['newer', 'mid', 'old']);
  });

  it('test_jsonld_capsAtMaxReviews', () => {
    const reviews: ReviewRecord[] = Array.from({ length: 15 }, (_, i) => r({
      publishedAt: `2026-01-${String(i + 1).padStart(2, '0')}`,
      author: `u${i}`,
    }));
    const res = buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews,
      maxReviews: 5,
    });
    expect(res?.review).toHaveLength(5);
  });

  it('test_jsonld_includesTitleWhenProvided', () => {
    const res = buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews: [r({ title: 'Top service' })],
    });
    expect(res?.review[0].name).toBe('Top service');
  });

  it('test_jsonld_omitsTitleWhenMissing', () => {
    const res = buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews: [r({ title: undefined })],
    });
    expect(res?.review[0].name).toBeUndefined();
  });

  it('test_jsonld_mapsPublisherPerSource', () => {
    const res = buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews: [
        r({ source: 'trustpilot', publishedAt: '2026-03-03', author: 'a' }),
        r({ source: 'google', publishedAt: '2026-03-02', author: 'b' }),
        r({ source: 'eigen', publishedAt: '2026-03-01', author: 'c' }),
      ],
    });
    const byAuthor = new Map(res?.review.map(x => [x.author.name, x.publisher.name]));
    expect(byAuthor.get('a')).toBe('Trustpilot');
    expect(byAuthor.get('b')).toBe('Google Reviews');
    expect(byAuthor.get('c')).toBe('LokaalKabaal');
  });

  it('test_jsonld_filtersInvalidRatings_beforeBuilding', () => {
    const res = buildReviewsJsonLd({
      productName: 'LK',
      productDescription: 'desc',
      reviews: [
        r({ rating: 0, author: 'bad' }),
        r({ rating: 6, author: 'also-bad' }),
        r({ rating: 5, author: 'good' }),
      ],
    });
    expect(res?.review).toHaveLength(1);
    expect(res?.review[0].author.name).toBe('good');
  });
});
