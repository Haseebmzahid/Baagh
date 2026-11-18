# SEO Phase 2B Batch 1A — responsive DOM preparation

Date: 17 November 2026. Local implementation only. **No production prerender expansion, commit, push or deployment.**

## Original blockers and baseline

The Phase 2B feasibility report demonstrated that actual components render in Node, but desktop viewport snapshots produced desktop-only category grids, collection component trees and spacing on mobile. The earlier reports and feasibility evidence were preserved.

Before editing, actual production-build application captures were saved for Everyday Fresh, Signature and Our Story at 1440×900, 768×1024, 390×844 and 375×812. Full-page PNGs and section/H1/container measurements are in `verification/seo-phase2b-batch1a/baseline/`. Captures use reduced motion to make comparison repeatable. Full-page screenshots can include not-yet-decoded lazy images below the viewport; a dark image well in a capture is not evidence of removed imagery. Interactive normal-motion behavior is checked separately.

The existing bundled design prototypes under `Design prototype/commercial/` were inspected, including their embedded template HTML. These are multi-viewport design boards with earlier placeholder content, not identical live production pages. Their grid/rail, lead/secondary collection, full-bleed mobile and commercial spacing conventions informed the review; current application screenshots provide the before/after reference. No prototype content or commercial data was copied into production.

Recorded commercial measurements remain: desktop margin/gutter/section 56/28/140px; tablet 40/22/104px; mobile 22/14/76px. Breakpoints remain 1279/1280 and 767/768. H1 geometry and container padding match the pre-change measurements at all 12 page/viewport combinations. Typography, text wrapping and section composition are visible in the paired captures. This is bounded visual/geometry evidence, not a claim that every animated frame or every pixel is identical.

## Implementation and file changes

- `src/components/commercial/EverydayFresh.tsx`: a single category parent and one product-card set; fixed semantic structure and CSS layout hooks in featured, selections, boxes, season and closing sections. Width-derived layout branches/inline calculations were removed from this page.
- `src/components/commercial/Signature.tsx`: one UnifiedCollection article per catalogue collection, preserving order, one image, title, description and price. Hero, box, gift, seasonal, corporate and quote layouts use scoped CSS. Decorative sheen stays in the same DOM with responsive visibility.
- `src/components/commercial/PresentationBox.tsx`: one presentation tree and one frame-control group; CSS variables select the existing scroll or manual-frame value by media query. Existing section-progress effect, frame state, movement values (78px lift, -26deg tilt, 40px depth, 58→50deg base tilt), transition timing, reduced-motion open frame and listener cleanup remain.
- `src/components/commercial/ProductCard.tsx`: explicit opt-in responsive presentation for these commercial page cards. It retains a single add control/tree across widths; CSS reproduces the mobile button and image presentation. Unspecified opt-in preserves Product Detail and other existing consumers.
- `src/components/commercial/primitives.tsx`: optional CommercialPage className for isolated layout scopes. Existing consumers retain the original class and behavior.
- `src/components/information/InformationPage.tsx`: applies the responsive scope only for Our Story. Other information routes receive no new scope.
- New `src/components/commercial/responsivePages.css`: scoped CSS for those three experiences and the Signature presentation element. No design-token, catalogue or business-rule changes.
- This report and new evidence in `docs/verification/seo-phase2b-batch1a/`.

Temporary local-only diagnostic source, servers, build output and test logs are under ignored `test-results/seo-phase2b-batch1a/`. Existing Phase 2B feasibility files remain untouched. No new dependency or production routing/SEO integration was introduced.

## Responsive behavior

Everyday Fresh categories use the same six semantic elements: six-column desktop grid, three-column tablet grid, and 148px horizontal mobile rail with scroll snapping. Product cards remain in one ordered set: three/two/one columns with mobile 3:2 image treatment. Category/product links, filtering callbacks, selection and basket operations are retained.

GridNoteCell contains meaningful copy, so its single instance remains after the third product on all widths instead of disappearing on tablet/mobile. **Intentional visual difference:** the smaller layouts now show that existing note and later content moves down accordingly. This is the requested information-preservation change, not a claim of whole-page pixel identity. No new copy was written.

Signature collections retain the wide 4:3 lead plus 108px square secondary imagery at larger widths; tablet stacks the lead and secondary group. Mobile uses one full-bleed 4:5 image per collection, with the existing 20/22px copy inset, 48px collection gap, link tap heights and typography. A final body-wrapper adjustment retains the original lead flex alignment and centered secondary copy. Descriptions exist once and are shown at the widths where the approved presentation includes them. There are no duplicate desktop/mobile collections.

PresentationBox keeps desktop scroll-driven opening and mobile manual Closed/Open frames, with the same 16:11 versus 4:3 well. One control group is presented only on mobile and hidden for reduced motion, matching prior behavior. CSS media queries supply the correct first-frame presentation without JavaScript reparenting. No WebGL renderer is involved.

Our Story uses the same actual editorial component and narrative. Scoped CSS overrides the inherited server desktop spacing at tablet/mobile. Contact, Help, Delivery, Returns, Privacy, Cookies and Terms retain their existing container behavior; no global spacing override was added.

## Diagnostic and functional acceptance

The temporary diagnostic uses actual production page components, header, BrandProvider and anonymous BasketProvider, rendered by ReactDOMServer and bundled with their actual CSS. Explicit diagnostic route input selects the page. hydrateRoot hydrates that same diagnostic tree. It is not production App prerender integration, and production routes remain in their previous rendering modes.

All three routes passed at all four sizes (12 combinations):

| Check | Result |
|---|---|
| Actual no-JavaScript HTML, one H1 and readable content | PASS |
| Responsive containers and category/grid/collection presentation | PASS |
| Before/after hydration root child, page root and H1 identity | PASS |
| Recoverable hydration errors and console/page errors | PASS — empty error arrays |
| Horizontal document overflow | PASS — none recorded |
| Container padding and H1 placement stable through hydration | PASS |
| One Signature collection per record and one presentation control group | PASS |
| Saved basket restoration at 375px on each diagnostic page | PASS — exact saved lines retained, no persistence writes |

No-JavaScript diagnostic captures and final JSON are in `diagnostic/`. The harness holds module execution while measuring the pre-hydration DOM, then releases it and checks original node identities. An initial harness run lacked a UTF-8 charset declaration and incorrectly waited on external font stylesheets; those harness problems were corrected and the final gate passed. Initial failed-run evidence is retained separately and is not attributed to the application.

Actual production-route functional checks passed at all four sizes: Everyday fruit selection, product links, basket add/restore after refresh, Back/Forward, mobile rail scrolling, Signature quote opening, desktop box scroll progress, mobile Closed/Open controls, reduced motion and Our Story collection navigation. The saved-basket diagnostic additionally checks anonymous hydration read-only restoration. See `functional/results.json` and `diagnostic/saved-basket.json`.

## Visual comparison

Full-page production captures after the final implementation are in `after/`; `comparison/` contains paired before/after evidence and final measurement results. Signature collection crops at each size permit closer review of the consolidated articles. Our Story geometry/presentation remains unchanged in inspected comparisons. Everyday's mobile/tablet grid note is the intentional difference described above. Lazy image loading and font/render timing can create screenshot differences unrelated to layout; no exhaustive pixel-equality certification is claimed.

## Commands and regression results

- `npm run build`: PASS; TypeScript, Vite, Chaunsa body generation and SEO validation. Existing shared Three.js chunk-size warning remains.
- `npm run check:types`: PASS.
- `npm run test:seo`: PASS for all 19 canonical documents, metadata/canonicals, Product withholding and breadcrumbs.
- `npm test`: PASS, 35/35.
- `npm run test:browser`: 16 PASS / 2 FAIL. Desktop Kinnow and Anaar fail at the documented 20-second progress-settling assertion. Both match the Phase 1/regression baseline; no graphics repair was attempted. All four mobile graphics cases, desktop Chaunsa/Apple, fallback/basket and all six SEO browser cases passed. This full run preceded the final small Signature body-wrapper alignment refinement; the final build and focused responsive/hydration/interaction gates were rerun for that final tree.
- Final temporary responsive diagnostic: PASS, 12/12.
- Final temporary production functional cases: PASS, 4/4 viewport cases.
- Existing `node scripts/check-prerender-probe.mjs --production`: PASS at all four sizes, including original Chaunsa no-JavaScript/hydration, basket and keyboard/alias gate. New summary JSON is archived under `chaunsa/`.
- `git diff --check`: PASS.

## Isolation and limitations

`isolation.json` verifies no changes to App/main, production bootstrap/prerender/SEO modules, build generator, route resolver, contexts, hooks, catalogue/data, tokens, homepage/canvas, Fruit Intelligence, package files or Vercel configuration. Product Detail implementation is unchanged; shared optional presentation hooks preserve its existing behavior. Basket business logic and Product structured-data remediation are untouched.

Only `dist/product/mangoes/chaunsa/index.html` has the prerender marker/nonempty root. All other canonical documents retain client-rendered initial bodies. The shared Three.js module retains SHA256 e534bdf4b582ac9a9af07288af7ab9bf0fdb31a05bc6634d65f3cf6066cbb483; no renderer/context was added. New scoped CSS is approximately 10.9KB raw / 2.2KB gzip, with no dependency. robots.txt, sitemap.xml and llms.txt are byte-identical to the preserved baseline.

Checks used headless Chrome and software WebGL for the existing graphics suite, not physical mobile devices or field Core Web Vitals. Historical mobile fallback timing failures are not claimed fixed merely because they did not recur. Full production four-route prerender integration remains a separate task. No deployment or live production change occurred.

Final evidence preservation: original `docs/verification/seo-phase-2a/` and `performance-pages/` files were restored byte-for-byte after archiving new results. See `evidence-preservation.json`. Existing full nine-station homepage progression was not independently rerun in this batch; homepage source/bundle isolation and the existing browser SEO/homepage route checks are the evidence here, rather than a new all-frame cinematic certification. Final focused browser cases passed for the final Signature wrapper refinement. No new regression was demonstrated within the tested coverage; baseline graphics assertion failures remain unresolved.

## Revalidation — 18 November 2026

The workspace already contained the implementation and the before/after evidence above when this request was revisited. No application source was changed during this verification, and the original baseline, feasibility and comparison evidence was preserved.

Fresh `npm run build`, `npm run check:types`, `npm run test:seo` and `npm test` passed (35 unit tests). The build still reports the existing large shared Three.js chunk warning. An initial overlapping diagnostic rebuild caused Vite's background dependency scanner to report missing temporary HTML; after the diagnostic build finished, the production build was rerun successfully without that scanner error.

The actual-component Node diagnostic was rebuilt. Real installed headless Chrome then passed all 12 page/viewport combinations in no-JavaScript, before-hydration and after-hydration modes: no document overflow, preserved root-child/page/H1 identity, unchanged container padding and H1 vertical position, and empty recoverable/console/page-error arrays. Static diagnostic HTML also contains exactly one H1 per page, three Signature collection articles and one presentation control group. The first restricted Chrome attempt could not access localhost; the permitted retry passed.

Fresh normal-motion functional checks passed at all four sizes for fruit selection, product navigation and history, basket persistence, mobile category scrolling, desktop presentation scroll progression, mobile Closed/Open frame controls, reduced-motion presentation, corporate quote opening and Our Story navigation. Results are in `verification/seo-phase2b-batch1a/revalidation/`, including `summary.json`, `diagnostic/results.json` and `functional/results.json`.

The earlier complete `npm run test:browser` evidence remains `browser-full.json`: **16 passed, 2 failed**, the documented desktop Kinnow/Anaar settling timeouts. That full suite and the earlier Chaunsa browser gate were not repeated during this revalidation; their results above are retained rather than represented as fresh runs. Existing side-by-side captures were visually reviewed; no new visual change was made.

Fresh protected-path diff inspection is empty. Fresh generated-document inspection confirms **only `dist/product/mangoes/chaunsa/index.html` contains the production prerender bootstrap marker**; SEO checks enforce empty initial roots for the other canonical pages. Production bootstrap, prerender integration, route allowlist, Chaunsa, catalogue, basket logic, Product schema remediation, homepage and Fruit Intelligence source remain unchanged. No commit, push or deployment occurred. Work stops at responsive preparation.
