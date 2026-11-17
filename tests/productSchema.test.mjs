import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';

test('Product eligibility, accurate packs and publication guards', async () => {
  const vite = await createServer({ configFile: false, server: { middlewareMode: true } });
  try {
    const { buildProductSchema } = await vite.ssrLoadModule('/src/seo/product.ts');
    const { products } = await vite.ssrLoadModule('/src/data/catalogue.ts');
    const { seoForPath } = await vite.ssrLoadModule('/src/seo/pages.ts');
    assert.equal(products.length, 4);
    for (const product of products) {
      assert.equal(buildProductSchema(product), undefined);
      const page = seoForPath(`/product/${product.category}/${product.slug}`);
      assert(!page.schema.some(node => node['@type'] === 'Product'));
      assert(page.schema.some(node => node['@type'] === 'BreadcrumbList'));
    }
    // Synthetic fixtures only: never modify the imported catalogue.
    const fixture = structuredClone(products[0]);
    fixture.provisional = [];
    fixture.packs = fixture.packs.slice(0, 2).map((pack, i) => ({ ...pack, price: String(100 + i), priceConfirmed: true }));
    const options = { pricesAreProvisional: false };
    const schema = buildProductSchema(fixture, options);
    assert.deepEqual(schema.offers.map(offer => offer.price), [100, 101]);
    assert(schema.offers.every(offer => offer.priceCurrency === 'PKR' && offer.url === schema.url && !offer.availability));
    for (const field of ['price', 'packs']) {
      const provisional = structuredClone(fixture);
      provisional.provisional = [field];
      assert.equal(buildProductSchema(provisional, options), undefined);
    }
    for (const price of ['', '0', '-1', 'NaN', '1,2', '100 PKR']) {
      const invalid = structuredClone(fixture);
      invalid.packs.forEach(pack => { pack.price = price; });
      assert.equal(buildProductSchema(invalid, options), undefined);
    }
    const disabled = structuredClone(fixture);
    disabled.packs.forEach(pack => { pack.available = false; });
    assert.equal(buildProductSchema(disabled, options), undefined);
    fixture.availabilityVerified = true;
    assert(buildProductSchema(fixture, options).offers.every(offer => offer.availability === 'https://schema.org/InStock'));
    fixture.availability = 'limited';
    assert.equal(buildProductSchema(fixture, options).offers[0].availability, 'https://schema.org/LimitedAvailability');
    for (const state of ['unavailable', 'coming-soon', 'out-of-season']) {
      fixture.availability = state;
      assert.equal(buildProductSchema(fixture, options), undefined);
    }
    fixture.availability = 'available';
    assert.equal(buildProductSchema(fixture), undefined); // global provisional guard
    fixture.packs.forEach(pack => { pack.priceConfirmed = false; });
    assert.equal(buildProductSchema(fixture, options), undefined);
    fixture.reviews = [{ id: 'test', genuine: true, approved: true, author: 'Test fixture', body: 'Test only', rating: 4 }];
    assert.equal(buildProductSchema(fixture, options), undefined); // not rendered
    const published = { ...options, visibleReviewIds: ['test'] };
    assert.equal(buildProductSchema(fixture, published).aggregateRating.ratingValue, 4);
    fixture.reviews[0].genuine = false;
    assert.equal(buildProductSchema(fixture, published), undefined);
    fixture.reviews[0].genuine = true;
    fixture.reviews[0].approved = false;
    assert.equal(buildProductSchema(fixture, published), undefined);
    assert(products.every(product => !product.reviews));
  } finally { await vite.close(); }
});
