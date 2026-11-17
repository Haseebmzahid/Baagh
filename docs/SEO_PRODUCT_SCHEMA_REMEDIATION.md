# Product structured-data remediation

## Initial audit

Google Search Console reported an incomplete Chaunsa Product: offers, review or aggregateRating required. The same unconditional Product was present on all four registered product routes; no additional registered product-detail records exist. Breadcrumbs were valid.

`src/seo/pages.ts` supplies both build-time head generation (`scripts/build-seo.mjs`) and runtime updates (`src/seo/head.ts`). Prices reside on typed catalogue packs as display strings. `commerce.pricesAreProvisional` is true; every product also lists price and packs as provisional. Pack availability flags are ordering controls, not verified inventory. No genuine approved reviews or ratings, review records, or visible customer review section were found. Prior Phase 1/2A reports deliberately acknowledged the incomplete rich-result eligibility; this report supersedes that Product-emission policy without rewriting those historical reports.

| Product / canonical route | Confirmed price | Genuine reviews | Product schema after remediation | Status |
|---|---|---|---|---|
| Chaunsa Mango — /product/mangoes/chaunsa | No; provisional | None | Withheld | No Product rich-result eligibility |
| Kinnow Mandarin — /product/citrus/kinnow | No; provisional | None | Withheld | No Product rich-result eligibility |
| Apple — /product/apples/apple | No; provisional | None | Withheld | No Product rich-result eligibility |
| Anaar — /product/seasonal/anaar | No; provisional | None | Withheld | No Product rich-result eligibility |

Before implementation every row emitted an incomplete Product. All now retain Organization, WebSite, WebPage and BreadcrumbList, plus existing titles, descriptions, canonicals, social metadata and indexability. Withholding invalid attempted rich results does not establish Product eligibility.

## Implementation

Shared `src/seo/product.ts` consumes the existing catalogue. It returns undefined unless eligible offers or published reviews exist. No second catalogue, dependency, business data, UI or routing change was introduced.

Offers require the global provisional flag to be cleared, product price/pack provisional markers cleared, an explicitly confirmed pack price (`priceConfirmed: true`), an available pack and an orderable product. Strict numeric parsing rejects missing, malformed, nonpositive or nonfinite prices. Multiple packs produce separate named Offers at the canonical absolute product URL with catalogue currency PKR. No stock quantities, expiry, seller or shipping claims are invented. Availability is omitted unless the new optional `availabilityVerified` flag is explicitly true; orderable available/limited states then map to InStock/LimitedAvailability. Nonorderable products emit no offers.

Optional typed review records support a later publication workflow. They require genuine and approved flags, nonempty author/body, a rating from 1 through 5, and an explicit list of IDs actually rendered on the product page. Current pages pass no such IDs, so no reviews can emit. Aggregate ratings derive only from admitted records. Future publication must wire the actual visible review renderer to that list and verify the source records; flags cannot independently prove a genuine customer experience. No review UI or production review record was added here. Synthetic test fixtures remain exclusively in tests.

## Files modified or created

- src/data/types.ts — optional explicit verification fields and future review contract; existing values unchanged.
- src/seo/product.ts — shared guarded builder.
- src/seo/pages.ts — conditional builder integration for build and runtime.
- scripts/check-seo.mjs — reject incomplete Product and assert withholding/preserved standard entities for every current product route.
- tests/productSchema.test.mjs — synthetic eligibility/offer/review guard tests and all four real catalogue routes.
- docs/SEO_PRODUCT_SCHEMA_REMEDIATION.md — this report.

No components, styles, basket, bootstrap, prerender generator, catalogue records, scene systems or historical evidence were changed. Chaunsa is still the only prerendered body; the other 18 canonical pages retain client rendering.

## Validation

- npm run build: PASS (existing large Three.js chunk warning remains).
- npm run check:types: PASS.
- npm run test:seo: PASS; 19 canonical documents, metadata/canonical checks, JSON-LD parsing, breadcrumbs and four product withholding checks.
- npm test: PASS, 35/35, including focused Product builder tests.
- Chaunsa prerendered body compared with preserved Phase 2A initial HTML: byte-for-byte identical. Hydration/bootstrap source untouched; dedicated node-identity hydration gate not rerun in this task.
- Direct inspection of all four generated product documents: PASS; no Product/Offer/Review/AggregateRating emitted, standard entities retained.
- Focused browser SEO suite: PASS, 6/6 desktop/mobile; canonical direct access/refresh, navigation/schema cleanup and crawler resources. Initial restricted preview-server attempt was stopped; retry with local-server access passed.

Tests cover multiple confirmed packs, PKR, global/product/pack verification guards, invalid prices, disabled packs, nonorderable states, optional verified availability, unpublished/unapproved/nongenuine review rejection and derived ratings. Current production output cannot receive synthetic test fixtures through these tests; fixtures clone catalogue records in test memory. Source truth and publication approval still require human verification.

Google Rich Results Test was NOT run against unpublished local output. No deployed remediation or Search Console validation is claimed. After an approved release, inspect all four live pages with Rich Results Test and URL Inspection, then request Search Console validation. Expected outcome today is no Product item detected, with breadcrumbs preserved. Google must recrawl before historical reports update.

Reference: https://developers.google.com/search/docs/appearance/structured-data/product-snippet — Product snippets require offers, review or aggregateRating. Valid markup does not guarantee a rich-result appearance.

## Required real business information

Before enabling offers, BAAGH must confirm actual pack prices, pack definitions/orderability and any availability claims, and clear the corresponding provisional guards. Do not flip flags merely to satisfy validation. Reviews require genuine approved customer records and visible publication on the same product page before schema inclusion. Until then Product remains withheld. No commit, push or deployment performed.
