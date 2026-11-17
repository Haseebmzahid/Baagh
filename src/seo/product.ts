import { commerce, routeOf } from '../data/catalogue';
import { ORDERABLE, type Product } from '../data/types';
import { absoluteUrl } from './config';

/** Review IDs must come from the actual page renderer, never an SEO-only list.
 * No current page renders reviews, so the default intentionally admits none.
 */
export function buildProductSchema(product: Product, options: {
  pricesAreProvisional?: boolean;
  visibleReviewIds?: readonly string[];
} = {}): Record<string, unknown> | undefined {
  const url = absoluteUrl(routeOf(product));
  const offers = (options.pricesAreProvisional ?? commerce.pricesAreProvisional) ||
    product.provisional.some(field => field === 'price' || field === 'packs') || !ORDERABLE[product.availability]
    ? [] : product.packs.filter(pack => pack.available && pack.priceConfirmed === true).flatMap(pack => {
      if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(pack.price)) return [];
      const price = Number(pack.price.replaceAll(',', ''));
      if (!Number.isFinite(price) || price <= 0) return [];
      return [{ '@type': 'Offer', name: pack.label, url, price, priceCurrency: commerce.currency,
        ...(product.availabilityVerified === true ? { availability: `https://schema.org/${product.availability === 'limited' ? 'LimitedAvailability' : 'InStock'}` } : {}) }];
    });
  const reviews = (product.reviews ?? []).filter(review => review.genuine === true && review.approved === true &&
    options.visibleReviewIds?.includes(review.id) && review.author.trim() && review.body.trim() &&
    Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5);
  if (!offers.length && !reviews.length) return;
  return {
    '@context': 'https://schema.org', '@type': 'Product', '@id': `${url}#product`,
    name: product.name, description: product.shortDescription, url,
    brand: { '@type': 'Brand', name: 'BAAGH' },
    ...(product.image.src ? { image: absoluteUrl(product.image.src) } : {}),
    ...(offers.length ? { offers } : {}),
    ...(reviews.length ? {
      review: reviews.map(review => ({ '@type': 'Review', author: { '@type': 'Person', name: review.author },
        reviewBody: review.body, reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5, worstRating: 1 },
        ...(review.datePublished && /^\d{4}-\d{2}-\d{2}$/.test(review.datePublished) && Number.isFinite(Date.parse(review.datePublished)) ? { datePublished: review.datePublished } : {}) })),
      aggregateRating: { '@type': 'AggregateRating', ratingValue: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length, reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
    } : {}),
  };
}
