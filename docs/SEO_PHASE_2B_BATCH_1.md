# SEO Phase 2B Batch 1 — feasibility stop

Date: 17 November 2026. Status: **BLOCKED before production implementation**. Batch 1 success criteria have NOT passed. No commit, push or deployment occurred.

## Audit and architecture

Reviewed the Phase 1, Phase 2A, regression and Product remediation reports; current bootstrap/prerender/build/check scripts; App/client entry; header, viewport and commercial primitives; actual EverydayFresh, Signature, InformationPage, PresentationBox and relevant styles. Git status was clean at the start. Current HEAD is 02144a8; the present EverydayShowcase is a DOM/photo experience, so historical comments about a live commercial stage should not be mistaken for current WebGL execution.

Chaunsa uses an explicit resolved-route snapshot, a preloaded real ProductDetail, renderToString, stylesheet inclusion and hydrateRoot. Other documents use createRoot. The hydration snapshot is deterministic (desktop 1440×900), and ProductDetail supplies scoped responsive CSS to make that initial markup work at other widths. Those scoped rules do not cover these three new page trees.

## Demonstrated blocker

An isolated diagnostic rendered the actual unchanged components with BrandProvider and anonymous BasketProvider through Vite's Node module loader and ReactDOMServer. It did not replace App, modify dist, or claim production integration. All three rendered without a browser and each produced one H1:

| Route | Node render | H1 | Production rollout |
|---|---|---|---|
| /everyday-fresh | PASS; 60,550 characters | Everyday.Exceptional. (line break in DOM) | NOT IMPLEMENTED |
| /signature | PASS; 42,167 characters | Fruit chosen to be given. | NOT IMPLEMENTED |
| /our-story | PASS; 6,058 characters | Good fruit. Considered judgement. | NOT IMPLEMENTED |

Node success is insufficient. A real headless Chrome probe at 375×812 with JavaScript disabled loaded those diagnostic bodies with the existing built CSS. Everyday Fresh retained a six-column category grid and had no mobile category rail. All three retained inline container padding of 56px, instead of the existing mobile commercial margin. This probe checks DOM/attributes at one size; it is not a screenshot comparison, full production browser acceptance test, or overflow certification. Images/fonts were not served as a production document in this setContent diagnostic.

Exact source mechanisms:

- EverydayFresh.tsx CategoriesSection (~248–313): mobile baagh-rail/flex/scroll presentation versus desktop six-column grid. Product grid (~449–493) changes columns, card landscape representation and inserts GridNoteCell only on desktop. Other sections use viewport-derived inline spacing, columns and image ratios.
- Signature.tsx CollectionsSection (~231–269): mobile FullBleedCollection components versus desktop LeadCollection plus nested SmallCollection components. This is a different content structure, not merely a different grid width.
- PresentationBox.tsx (~63–81, ~196–203): desktop scroll progress versus mobile manual frame, different aspect ratios and conditionally rendered mobile controls. Its browser APIs run in effects, but responsive presentation/control differences remain. No WebGL renderer is required or proposed.
- InformationPage.tsx has CSS-driven narrative layout and browser APIs confined to effects/handlers, but its shared CommercialPage/PageContainer still derive inline spacing from the desktop server viewport.

useSyncExternalStore can match the initial hydration render and subsequently apply the actual browser viewport. It cannot make a no-JavaScript desktop grid become the approved mobile rail or collections composition. Simply adding route markers would therefore fail the requested responsive initial-HTML acceptance criteria. Changing the server snapshot to mobile would create the corresponding desktop problem. Duplicate hidden content or a second bot page is not an acceptable solution.

This is not a claim that prerendering is impossible. The existing trees require a responsive representation refactor before a safe rollout. Under the instruction to stop when the existing DOM/functionality cannot be safely preserved by this extension, no production route was enabled and no partial Our Story-only rollout was performed.

## Smallest viable next implementation

First establish one responsive representation for Everyday Fresh categories/product cards and Signature collections using the current breakpoints and exact measurements, without duplicate controls/content. Scope container/section CSS to the newly targeted pages so ProductDetail and other pages retain their behavior. Treat the PresentationBox's mobile controls, manual frame and reduced-motion lifecycle as a separately verified browser enhancement; preserve its approved animation measurements and interaction.

Capture current approved desktop/tablet/two-mobile baselines before that refactor. Then extend the existing bootstrap allowlist, preloaded route-component input, renderToString entry, stylesheet inclusion and conditional hydrateRoot to exactly the three new routes. Reuse the existing resolver and anonymous/read-only basket restoration. Verify each page in no-JavaScript/before-hydration/after-hydration modes and preserve root/H1 identity. Only after those gates pass should generated output and SEO checks permit exactly four prerendered canonical documents. No alternative rendering architecture is proposed.

## Acceptance and regression status

- Meaningful direct-component Node HTML: PASS, all three.
- Diagnostic mobile responsive representation: FAIL for immediate unchanged-component rollout; desktop-dependent markup/spacing remains.
- Four-size initial production HTML, hydration identity, navigation, presentation interaction, basket restoration, reduced motion and visual comparison: NOT TESTED; production integration deliberately not implemented.
- npm run build, npm run check:types, npm run test:seo, npm test, npm run test:browser and existing Chaunsa acceptance gate: NOT RUN in this stopped investigation. No new implementation exists to validate; historical passes are not presented as current results.
- Kinnow/Anaar graphics timeouts: NOT RETESTED or fixed. Existing Phase 1/regression baseline remains applicable; no new graphics regression is claimed.
- Homepage, Fruit Intelligence, scene systems, catalogue, Product schema remediation, basket logic, route semantics and crawler files: UNMODIFIED. No new renderer or dependency introduced; no performance/Core Web Vitals claim.
- Production prerender scope: UNCHANGED; Chaunsa only. The required four-page rollout is NOT complete.

## Files and evidence

Created this report and docs/verification/seo-phase2b-batch1/feasibility.json. Temporary diagnostic scripts and generated component bodies remain under ignored test-results/seo-phase2b-batch1/. No application/configuration/test source was modified. Existing reports and evidence were preserved. No deployment occurred.
