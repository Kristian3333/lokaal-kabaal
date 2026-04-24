/**
 * Build schema.org JSON-LD payloads for product/service reviews so Google &
 * Bing can render star-ratings in SERPs. Pure helpers, no IO -- callers
 * embed the returned object in a <script type="application/ld+json"> tag.
 *
 * Reference: https://schema.org/Review and https://schema.org/AggregateRating
 */

export type ReviewSource = 'trustpilot' | 'google' | 'eigen';

export type ReviewRecord = {
  author: string;
  rating: number;
  title?: string;
  body: string;
  /** ISO-8601 date string (YYYY-MM-DD). */
  publishedAt: string;
  source: ReviewSource;
};

export type ReviewStats = {
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
};

export type ReviewsJsonLd = {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  aggregateRating: {
    '@type': 'AggregateRating';
    ratingValue: string;
    reviewCount: number;
    bestRating: string;
    worstRating: string;
  };
  review: Array<{
    '@type': 'Review';
    author: { '@type': 'Person'; name: string };
    reviewRating: {
      '@type': 'Rating';
      ratingValue: string;
      bestRating: string;
      worstRating: string;
    };
    name?: string;
    reviewBody: string;
    datePublished: string;
    publisher: { '@type': 'Organization'; name: string };
  }>;
};

const SOURCE_PUBLISHER: Record<ReviewSource, string> = {
  trustpilot: 'Trustpilot',
  google: 'Google Reviews',
  eigen: 'LokaalKabaal',
};

/**
 * Compute the aggregate statistics for a list of reviews. Returns a
 * `reviewCount` of 0 with a neutral ratingValue=0 if the list is empty, so
 * callers can decide whether to render the structured data at all.
 */
export function computeReviewStats(reviews: readonly ReviewRecord[]): ReviewStats {
  const valid = reviews.filter(r => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5);
  if (valid.length === 0) {
    return { ratingValue: 0, reviewCount: 0, bestRating: 5, worstRating: 1 };
  }
  const sum = valid.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / valid.length;
  return {
    // Round to one decimal so schema.org renders stable, not "4.333333".
    ratingValue: Math.round(avg * 10) / 10,
    reviewCount: valid.length,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Produce a Product-scoped JSON-LD payload for embedding in a
 * `<script type="application/ld+json">` tag. The review list is capped to
 * `maxReviews` (default 10) to keep the payload Googlebot-friendly.
 */
export function buildReviewsJsonLd(args: {
  productName: string;
  productDescription: string;
  reviews: readonly ReviewRecord[];
  maxReviews?: number;
}): ReviewsJsonLd | null {
  const { productName, productDescription, reviews, maxReviews = 10 } = args;
  const stats = computeReviewStats(reviews);
  if (stats.reviewCount === 0) return null;

  const sortedNewestFirst = [...reviews]
    .filter(r => Number.isFinite(r.rating) && r.rating >= 1 && r.rating <= 5)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, Math.max(0, maxReviews));

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description: productDescription,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.ratingValue.toFixed(1),
      reviewCount: stats.reviewCount,
      bestRating: String(stats.bestRating),
      worstRating: String(stats.worstRating),
    },
    review: sortedNewestFirst.map(r => ({
      '@type': 'Review' as const,
      author: { '@type': 'Person' as const, name: r.author },
      reviewRating: {
        '@type': 'Rating' as const,
        ratingValue: r.rating.toFixed(1),
        bestRating: '5',
        worstRating: '1',
      },
      ...(r.title ? { name: r.title } : {}),
      reviewBody: r.body,
      datePublished: r.publishedAt,
      publisher: { '@type': 'Organization' as const, name: SOURCE_PUBLISHER[r.source] },
    })),
  };
}
