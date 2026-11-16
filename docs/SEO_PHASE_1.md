# BAAGH Phase 1 technical SEO audit and implementation

Date: 16 November 2026. Canonical origin: https://baagh.vercel.app/. Changes are local and have not been pushed or deployed.

## Initial audit — before implementation

- Architecture: React 18 + Vite 5 + Three.js, no server/backend. A custom resolver (`src/navigation/route.ts`) and History API/hash handlers in App own routing. Commercial product detail, Signature, information pages, cinematic journey and Fruit Intelligence are lazy loaded. Catalogue is the product source of truth.
- Public canonical routes: homepage; Everyday Fresh; Signature; four `/product/:category/:slug` pages; four `/fruit-intelligence/:fruit` studies; eight information pages. `/basket` is personal state. Unknown routes render a missing-page view. Legacy product paths, information aliases, query fruit selectors and hash views also exist.
- Initial response: the repository template and production responses for **all 19 public routes** contain an empty `<div id="root"></div>`, shared brand title and font links. Main content, navigation and useful copy require JavaScript. The detailed per-route HTTP audit is `verification/seo/production-audit.json`. Initial metadata/content must not be confused with rendered DOM.
- Titles/descriptions: App previously updated titles for most views after mounting, but product pages retained the generic homepage title. Descriptions were shared across commercial/educational views. Information pages had their own descriptions locally. Production confirms the same metadata gaps; rendered excerpts are recorded per route.
- Canonicals: none. Open Graph/Twitter metadata: none. Structured data: none.
- robots.txt/sitemap.xml: absent from source. Production requests to both return HTTP 200 **HTML SPA shell**, not valid crawler resources.
- Vercel: one broad rewrite to `/index.html`, excluding assets only. Direct route HTTP requests return 200; real routes render with JavaScript. Invalid URLs also return 200 (soft 404).
- Images: every existing `<img>` path supplies alt text (explicit descriptions or product-name fallbacks); no visual assets needed editing. Reference photos are already identified as reference imagery. WebGL canvases have DOM narrative/fallback content; a canvas itself is not an image alt attribute target.
- Crawler access: production returned 200 without an X-Robots-Tag block in the audit requests. This verifies ordinary public access, not whether Vercel firewall rules allow every crawler IP. Non-JavaScript clients receive no page body content. JavaScript-capable indexing can discover content after rendering. Robots files were invalid HTML, rather than an explicit intentional block.
- Direct access/refresh: public routes respond 200; post-change local browser refresh checks cover canonical pages. Production routing configuration remains to be confirmed after deployment.
- Performance: no verified CrUX/Search Console field data or production INP measurement is available. Existing scene-level performance instrumentation and adaptive graphics budgets are preserved. Three.js remains a 732 kB raw / 190 kB gzip shared chunk; the build's existing large-chunk warning remains. See the bounded mobile lab sample below; it is not a field Core Web Vitals pass.

## Technical choices and implementation

1. Centralized `SITE_URL` in `src/seo/config.ts`; canonical URLs, schema IDs, social image URLs, sitemap and llms links derive from it.
2. Added shared route SEO definitions sourced from the real catalogue and information registry. The build writes distinct static HTML **heads**, not page-body prerendering. Each static file keeps the original empty React root and existing hashed asset entry points. Runtime updates use the same definitions, including product-to-product transitions and removal of stale JSON-LD.
3. The Vite Node API loads the existing TypeScript modules for static file generation. No new dependency, framework migration, backend, CMS or database. Build-time SEO checks reject duplicate metadata, malformed structured data and missing Vercel mappings when catalogue routes change. Existing `createRoot`, responsive layout, scene lifecycle and navigation logic are retained.
4. Explicit Vercel mappings serve each canonical/alias HTML file; Vite preview applies these same mappings so a clean deep URL cannot silently receive the homepage head during local verification; crawler files/images/assets are excluded from the SPA fallback. Unknown routes use `spa.html` with initial `noindex, follow`; HTTP status remains 200. Basket is noindex, follow and omitted from sitemap. Aliases are preserved, carry the destination canonical, and are not listed separately.
5. Unique titles/descriptions, canonical links, Open Graph and Twitter large-image cards appear in initial response HTML. Existing mixed-fruit reference photography is used for social cards; no invented logo, account handle or new imagery. Verification tags are optional build-time environment variables.
6. Minimal Organization and WebSite entities describe BAAGH by name and URL only. Product schema uses actual visible names and short descriptions, without offers, prices, stock, reviews, ratings or unconfirmed origins. Product schema is semantically useful but **does not meet Google's product rich-result requirements** without verified offers/reviews/ratings. No claim of rich-result eligibility is made.
7. BreadcrumbList mirrors existing visible breadcrumbs on products and information pages. No breadcrumbs are invented for views that do not display them.
8. Robots allows ordinary crawlers and explicitly OAI-SearchBot; GPTBot is disallowed. Other AI search crawlers can access public pages under the wildcard rule. Robots is a voluntary crawler policy, not authorization enforcement or a search inclusion guarantee. Educational paths remain accessible. Optional generated llms.txt is a supplementary list of genuine pages, not a ranking signal guarantee.
9. No alt changes were necessary. No CSS, scenes, assets, catalogue values, Fruit Intelligence progress or commercial navigation were changed.

## Prerendering decision and remaining architectural limitation

**Body prerendering is advisable, especially for commercial pages and Our Story. It is deferred here, not claimed as complete.** Social previews and metadata-only bots can now read metadata; content extraction by clients that do not execute JavaScript remains limited. llms.txt does not replace crawlable page content.

The current App reads `window.location` during initialization and lazy-renders viewport-dependent UI, browser basket state and WebGL components. Adding server rendering directly would require initialization/hydration changes and visual/scene regression work. Injecting separate keyword-rich crawler text, serving a different bot-only page, or snapshotting temporary loading screens would be a risky workaround.

Low-risk follow-up proposal: build-time render the **existing** commercial/information components with explicit route input, a deterministic initial responsive strategy, and an empty anonymous basket. Hydrate that same DOM and mount Three.js only in existing effects. Start with one product page in isolation, verify mobile first paint and basket hydration, then expand to collections/information pages. For Fruit Intelligence, render the existing narrative from configuration and preserve the current scene/progress component lifecycle. This needs a separate reviewable implementation gate; no SSR framework migration is justified for this finite static catalogue.

Other remaining limitations: hash-based views share their initial document head with the underlying path; existing query-fruit aliases initially receive homepage HTML then set the Fruit Intelligence canonical in JavaScript. Use clean canonical path links for discovery and submissions. A real HTTP 404 strategy for unknown routes should be designed separately, rather than risking route changes in this sprint.

## Search verification and domain maintenance

- Set `VITE_GOOGLE_SITE_VERIFICATION` to the exact Google-provided **content token**, then rebuild/deploy. Empty means no tag. DNS verification is also possible for a future owned domain; it is not performed by this change.
- Optional Bing placeholder: set `VITE_BING_SITE_VERIFICATION` to the Bing content token. Empty means no tag. No fake verification token is shipped.
- These are public verification values, not API secrets. Both generation and runtime read the same build-time environment values.
- When the permanent domain is ready, change `SITE_URL`, rebuild, configure the domain in Vercel and establish old-domain redirects. Update Search Console/Bing properties and resubmit the generated sitemap.
- Run `npm run build`, `npm run check:types`, `npm run test:seo`, `npm test`, and `npm run test:browser`. Windows browser checks support `BAAGH_CHROMIUM_PATH`, `BAAGH_SOFTWARE_WEBGL=1`, and an optional `BAAGH_PREVIEW_PORT`.

## Files created and modified

Modified: `index.html`, `src/App.tsx` (metadata effect only), `package.json`, `vercel.json`, `playwright.config.ts` (configurable preview port), `vite.config.ts` (preview-only middleware applying Vercel mappings).

Created: `src/seo/config.ts`, `src/seo/pages.ts`, `src/seo/head.ts`; `scripts/build-seo.mjs`, `scripts/check-seo.mjs`, `scripts/seo-production-audit.mjs`, `scripts/seo-visual-check.mjs`, `scripts/seo-mobile-metrics.mjs`; `tests/browser/seo.spec.ts`; this report and evidence in `docs/verification/seo/`.

Generated ignored build output: 19 canonical HTML documents, 14 alias documents, basket HTML, unknown-route SPA fallback, robots.txt, sitemap.xml, llms.txt and seo-manifest.json. Crawl files intentionally come from the shared build configuration, not hand-maintained duplicate public files. Vercel must use `npm run build` and output `dist`.

## Exact sitemap URLs

- https://baagh.vercel.app/
- https://baagh.vercel.app/everyday-fresh
- https://baagh.vercel.app/signature
- https://baagh.vercel.app/product/mangoes/chaunsa
- https://baagh.vercel.app/product/citrus/kinnow
- https://baagh.vercel.app/product/apples/apple
- https://baagh.vercel.app/product/seasonal/anaar
- https://baagh.vercel.app/fruit-intelligence/chaunsa
- https://baagh.vercel.app/fruit-intelligence/kinnow
- https://baagh.vercel.app/fruit-intelligence/apple
- https://baagh.vercel.app/fruit-intelligence/anaar
- https://baagh.vercel.app/our-story
- https://baagh.vercel.app/contact
- https://baagh.vercel.app/privacy-policy
- https://baagh.vercel.app/cookies
- https://baagh.vercel.app/terms
- https://baagh.vercel.app/delivery
- https://baagh.vercel.app/returns
- https://baagh.vercel.app/help

## robots.txt contents

```text
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Disallow: /

Sitemap: https://baagh.vercel.app/sitemap.xml
```

## Metadata and structured-data coverage

All rows have initial-HTML title, description, canonical, Open Graph and Twitter tags. All have Organization, WebSite and WebPage schema; additional types are listed.

| Canonical path | Title | Description | Additional schema |
| --- | --- | --- | --- |
| / | BAAGH â€” Fruit you never have to doubt. | Discover BAAGH through its fruit journey, Everyday Fresh collection, Signature gifting and interactive Fruit Intelligence guides. | None |
| /everyday-fresh | Everyday Fresh â€” Fruit Collection &#124; BAAGH | Explore the BAAGH Everyday Fresh fruit collection. Compare fruit and pack options, learn about each selection and prepare a WhatsApp order request. | None |
| /signature | Signature â€” Fruit Gifting &#124; BAAGH | Explore BAAGH Signature fruit gifting, presentation boxes and corporate gifting enquiries. Discuss your occasion and requirements with the BAAGH team. | None |
| /product/mangoes/chaunsa | Chaunsa Mango â€” Everyday Fresh &#124; BAAGH | Explore Chaunsa Mango in the BAAGH Everyday Fresh collection. Review fruit details and pack options, and discover its Fruit Intelligence guide. | Product, BreadcrumbList |
| /product/citrus/kinnow | Kinnow Mandarin â€” Everyday Fresh &#124; BAAGH | Explore Kinnow Mandarin in the BAAGH Everyday Fresh collection. Review fruit details and pack options, and discover its Fruit Intelligence guide. | Product, BreadcrumbList |
| /product/apples/apple | Apple â€” Everyday Fresh &#124; BAAGH | Explore Apple in the BAAGH Everyday Fresh collection. Review fruit details and pack options, and discover its Fruit Intelligence guide. | Product, BreadcrumbList |
| /product/seasonal/anaar | Anaar â€” Everyday Fresh &#124; BAAGH | Explore Anaar in the BAAGH Everyday Fresh collection. Review fruit details and pack options, and discover its Fruit Intelligence guide. | Product, BreadcrumbList |
| /fruit-intelligence/chaunsa | Chaunsa Mango â€” Fruit Intelligence &#124; BAAGH | Explore Chaunsa Mango with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view. | None |
| /fruit-intelligence/kinnow | Kinnow Mandarin â€” Fruit Intelligence &#124; BAAGH | Explore Kinnow Mandarin with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view. | None |
| /fruit-intelligence/apple | Apple â€” Fruit Intelligence &#124; BAAGH | Explore Apple with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view. | None |
| /fruit-intelligence/anaar | Anaar â€” Fruit Intelligence &#124; BAAGH | Explore Anaar with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view. | None |
| /our-story | Our Story &#124; BAAGH | Three generations of wholesale judgement, brought to the everyday table. | BreadcrumbList |
| /contact | Contact us &#124; BAAGH | Contact BAAGH for fruit orders, Signature gifting and help with your request. | BreadcrumbList |
| /privacy-policy | Privacy policy &#124; BAAGH | How BAAGH handles your basket, enquiry details and external services. | BreadcrumbList |
| /cookies | Cookies & storage &#124; BAAGH | How BAAGH remembers your basket in your browser. | BreadcrumbList |
| /terms | Ordering terms &#124; BAAGH | How order requests, provisional prices and confirmation work at BAAGH. | BreadcrumbList |
| /delivery | Delivery information &#124; BAAGH | Discuss delivery destinations, charges and timing with the BAAGH team. | BreadcrumbList |
| /returns | Order support &#124; BAAGH | Help with fruit quality, changes, cancellations and delivery concerns. | BreadcrumbList |
| /help | Help & FAQs &#124; BAAGH | Answers about shopping, gift enquiries and ordering through WhatsApp. | BreadcrumbList |

Aliases use their destination metadata. Basket/unknown views use noindex and no structured data; unknown views omit canonical. Verification tags apply only when configured.

## Verification results

- Production audit: 19 public paths plus robots.txt, sitemap.xml and an invalid path inspected through real Chrome. Existing production was inspected, not modified.
- Build and explicit TypeScript check passed. Static SEO checks passed for all 19 canonical documents, unique metadata, JSON-LD parsing/shape, sitemap membership, safe product fields, Vercel mappings and crawler policy. JSON-LD syntax/shape checks do not constitute an external Schema.org/Google validator certification.
- Existing unit suite: 34/34 passed.
- Final focused SEO browser run: **6/6 passed** on desktop/mobile after correcting preview routing. Covers all 19 canonical pages, initial response metadata, direct access/refresh, canonical tags, descriptions, viewport overflow, existing image alt attributes, no page runtime exceptions, client navigation/schema cleanup, invalid product noindex, basket noindex, and actual crawler resource content types. Evidence: `verification/seo/browser-seo-final.json`.
- Full browser run before the preview mapping fix: 13/18 passed. Two SEO failures identified the preview mismatch and are covered by the final focused rerun. Three graphics assertions remain unresolved: desktop Kinnow/Anaar missed 20-second progress-settling deadlines; the mobile reduced-motion fallback test did not show its final CTA within 20 seconds. No scene or progress source was modified. All four mobile full-progress/cleanup tests passed; desktop Chaunsa/Apple and desktop fallback/basket passed. Evidence: `verification/seo/browser-full-suite-summary.json` and `verification/seo/webgl-run/`. A blanket no-WebGL-regression certification is not claimed.
- Visual baseline: eight matched desktop/mobile screenshots across Everyday Fresh, Signature, Chaunsa product and Our Story had **zero changed pixels**. CSS output hash remained unchanged. This is a bounded initial-viewport comparison, not every possible animation frame.

### Mobile lab sample

One local unthrottled Chrome run per route at 375×812, DPR 2 with software WebGL. These numbers are observational lab samples, not production/field Core Web Vitals. INP was not measured.

| Path | LCP (ms) | FCP (ms) | CLS |
| --- | ---: | ---: | ---: |
| / | 2296 | 1648 | 0.0000 |
| /everyday-fresh | 1684 | 1532 | 0.0020 |
| /signature | 1276 | 744 | 0.0000 |
| /product/mangoes/chaunsa | 2064 | 864 | 0.0101 |
| /fruit-intelligence/apple | 1344 | 896 | 0.0037 |
| /our-story | 1488 | 740 | 0.0211 |

## Release and next steps

1. Review and deploy these changes from main through the existing Vercel workflow. No push or deployment was performed in this session.
2. Verify deployed HTTP bodies/content types, canonicals, verification tag values and refresh behavior. Test Rich Results/Schema.org output and URL Inspection on the deployed URLs. Inspect Vercel firewall/bot controls for OAI-SearchBot; robots permission alone cannot establish this.
3. Verify ownership and submit the sitemap in Google Search Console and Bing Webmaster Tools. Request indexing of priority pages; monitor coverage rather than assuming immediate indexing.
4. Plan the isolated body-prerendering follow-up above. Verify existing factual/operational copy and provisional commercial details with the business before expanding product structured data.
5. Establish production mobile Lighthouse and CrUX/Search Console baselines, including real-user INP where available. Preserve the cinematic experiences while prioritizing measured bottlenecks.

No article production, backlinks, CMS work or redesign was included. First-place Google rankings cannot be promised by a technical foundation sprint.

References: [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google product structured data requirements](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [OpenAI crawler policy](https://developers.openai.com/api/docs/bots).
