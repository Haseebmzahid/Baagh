# Phase 2B Batch 1B — production prerender integration

18 November 2026. Local implementation only; no commit, push or deployment. The user explicitly confirmed that deployed Batch 1A passed manual production QA for all three pages before implementation began.

## Implementation

Reused the Phase 2A production App, providers, resolver, version-1 route snapshot, renderToString and conditional hydrateRoot. No separate crawler markup, duplicate content, dependency, renderer or page redesign was added.

Changed files:

- `src/seo/bootstrap.ts`: explicit four-path typed allowlist and generic route snapshot builder; retains chaunsaBootstrap.
- `src/seo/prerender.tsx`: dispatches Chaunsa through its existing renderer; renders the actual App with preloaded Signature and InformationPage for the other paths.
- `src/main.tsx`: preloads the matching real page before hydration. EverydayFresh is already a synchronous App import.
- `src/App.tsx`: optional preloaded Signature/Story components, retaining the existing ProductPage mechanism and anonymous BasketProvider. Suspense is bypassed only for available synchronous page components. Navigation to an unloaded product retains its loading boundary.
- `scripts/build-seo.mjs`: generates actual App bodies only for approved canonical paths; retains ProductDetail CSS inclusion and existing metadata/crawler generation.
- `scripts/check-seo.mjs`: checks new H1/bootstrap bodies and scans every generated HTML document, including aliases/fallback, to enforce exactly four markers and empty roots elsewhere. Existing Product schema assertions remain.
- This report and `docs/verification/seo-phase2b-batch1b/` evidence.

The first functional run found a lazy product navigation timeout after leaving a new prerendered page. The boundary condition was corrected within the integration scope; the build and four-size functional tests were repeated successfully. An earlier full browser run was interrupted for this correction; only the completed final run is acceptance evidence. No initial responsive HTML or hydration failure was recorded.

## Exact rendering scope

Meaningful initial body and bootstrap marker:

1. `/product/mangoes/chaunsa`
2. `/everyday-fresh`
3. `/signature`
4. `/our-story`

All other canonical routes, aliases, basket and SPA fallback retain empty initial React roots. `generated-documents.json` records every generated document, marker, empty-root and H1 count. No Vercel change or alias expansion was made.

## Initial HTML, hydration and functions

Actual dist documents, production CSS and assets were served to installed headless Chrome. All 12 new-route/viewport combinations pass at 1440×900, 768×1024, 390×844 and 375×812. Each was measured with JavaScript disabled, with modules held before hydration, and after release. `initial/results.json` records original root, root-child, page and H1 identities, empty recoverable/console/page error arrays, no document overflow, unchanged spacing through hydration, responsive categories and collection/control counts. Saved Chaunsa 2kg quantity 2 remains intact with zero persistence writes during restoration. This extends the existing read-only hydration pattern without changing basket business logic.

`batch1a-comparison.json` compares production initial H1 geometry against Batch 1A actual-application captures; all four-size H1 geometries match. Container padding and category composition also match the prior diagnostics. Existing responsive CSS and all page components remain unchanged. Signature collection alignment and mobile GridNoteCell are retained. Full-page no-JavaScript PNGs are in `initial/`; native lazy images below the viewport may be undecoded in full-page captures, as in Batch 1A. Images retain their real sources and native loading behavior; blank wells in those captures are not missing image markup. This is bounded visual/geometry evidence, not every-frame or pixel-identical certification.

`functional/results.json` passes all four sizes with normal motion: fruit selection, add-to-basket, saved basket after refresh, product navigation and Back/Forward, mobile category scrolling, desktop PresentationBox scroll progression, mobile Closed/Open controls, reduced-motion open frame, corporate quote opening and Our Story collection navigation. The existing full SEO browser suite additionally checks direct routes, refresh, navigation and metadata. Temporary local-only harnesses remain ignored under `test-results/batch1b/`; no alternate production rendering architecture is involved.

## Validation and protected systems

Build, explicit TypeScript check, SEO checks and 35 unit tests pass. The unchanged Chaunsa production acceptance gate passes all four sizes, keyboard/interaction and saved-basket checks. Logs and Chaunsa JSON are preserved here; original Phase 2A evidence was restored afterward. The existing large Three.js chunk warning remains.

`isolation.json` records an empty diff for page/component systems, catalogue, contexts/basket, hooks, tokens/config, navigation, Product schema implementation, package files, Vercel and public assets. Changes to App/main and SEO entry points are limited to the integration described above. Homepage/Fruit Intelligence sources and WebGL lifecycle remain untouched; shared Three.js hash matches the documented baseline. robots.txt, sitemap.xml and llms.txt generation text is unchanged. No unrelated graphics fix was attempted.

## Remaining limits

Checks use local Chrome, including software WebGL for the existing graphics suite, not physical mobile devices or field Core Web Vitals. No production rollout or Search Console indexing claim is made.

## Final regression outcome

The complete final `npm run test:browser` run (JSON reporter and isolated output only) finished in 787 seconds: **16 passed, 2 failed, 0 skipped, 0 flaky**. Both failures are desktop Kinnow/Anaar `selected engine, scroll completion and scene cleanup`, at `page.waitForFunction`, timeout 20000ms. These are the documented Phase 1/Phase 2A/Batch 1A settling failures; no new browser failure appeared. The suite is not fully green. Phase 1's historical mobile fallback timeout did not recur; no fix is claimed. All six SEO browser cases passed. Full results are in `browser-full.json`.

The actual Batch 1A application captures (rather than its isolated diagnostic wrapper) have identical H1 geometry at all 12 combinations. Container padding is 56px desktop, 40px tablet and 22px mobile. See `batch1a-comparison.json`. There is no intentional visual change in Batch 1B.

Final `git diff --check` passes. Fresh graphics metrics were archived under ignored `test-results/batch1b/performance-final`; original performance and Phase 2A evidence was restored. Only the six listed integration source files, this report and new Batch 1B evidence remain changed. The final evidence summary records preservation hashes. No commit, push or deployment occurred. Implementation stops here.
