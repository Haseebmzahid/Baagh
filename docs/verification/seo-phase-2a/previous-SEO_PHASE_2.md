# BAAGH SEO Phase 2 — feasibility review and stopped proof of concept

Status: **Phase 2A gate failed; no production prerendering enabled.** Phase 2B was not started. No push or deployment was performed.

## 1. Release checkpoint and architecture chosen

The working tree was clean at the start. Phase 1 is committed as `5ee23d1` (`Phase 1 SEO`). A fresh Chrome inspection confirmed that production now serves the Chaunsa title and canonical, robots.txt as `text/plain`, and sitemap.xml as `application/xml`. A second inspection confirmed llms.txt as `text/plain` and the `/about-us` canonical as `/our-story`.

Read `docs/SEO_PHASE_1.md` completely before this investigation. Inspected App, main, route resolver, all three SEO modules, Vite configuration, package scripts, Vercel configuration, commercial components, information pages, providers and Fruit Intelligence rendering components.

The candidate architecture is the existing React tree rendered at build time with ReactDOMServer, then hydrated with hydrateRoot. **It has not been accepted for production.** React/Vite itself is compatible with this approach; the obstacle is matching the existing viewport-dependent DOM while keeping its approved JavaScript-disabled mobile layout.

| Component/system | Build-time findings | Required treatment for a future implementation |
| --- | --- | --- |
| App | State initializers call `window.location`; direct Node rendering throws `ReferenceError: window is not defined`. | Explicit initial route/hash input, resolved using the existing resolver. |
| main | Always calls createRoot against an empty root. | Hydrate only documents whose matching tree was actually prerendered; retain existing behavior for other documents during an isolated rollout. |
| BrandProvider | Deterministic supplied/default brand data. | Can render in Node unchanged. |
| ScrollProvider | Browser listeners and frame loop are in effects; `performance.now()` is available in Node. | Can wrap a Node render, but keep its browser lifecycle unchanged. |
| BasketProvider | Reads localStorage during initialization. Node catches the missing window and falls back to empty selections with a storage-failure flag. Browser initialization can start with saved selections instead. | Explicit empty anonymous initial state on server **and first hydration render**, then restore browser state after hydration; do not erase stored selections. |
| ProductDetail | Real content renders in Node when given category/slug and BasketProvider. Responsive branches change columns, image ratio, spacing, order-block parent and mobile sticky controls. | Needs one responsive initial content tree; a root API change alone is insufficient. |
| ProductSpecimen | Currently renders FruitPhoto; it does not instantiate a WebGL renderer. | Preserve it as it exists. Do not reintroduce a 3D product specimen based on older comments or assumptions. |
| EverydayFresh | Catalogue content is renderable; viewport hook controls structure and spacing. Browser scrolling is in effects/handlers. | Same responsive initial-tree problem as Product Detail. |
| Signature | Most content is renderable; viewport, pointer and reduced-motion hooks affect initial presentation. PresentationBox scroll work is in effects. | Deterministic hydration snapshots and a matching responsive presentation. |
| Our Story/contact/information pages | Registered copy and headings are renderable; focusing/scrolling occur in effects/handlers. PageContainer still uses viewport-derived inline spacing. | Keep actual registered content; resolve shared responsive initialization first. |
| SiteHeader/cabinet | Header changes markup between desktop and mobile. Cabinet is closed initially and lazy-loaded; renderer creation is in effects after opening. | Header needs a responsive initial DOM. Cabinet and renderer lifecycle should remain unchanged. |
| FruitIntelligence | Initial fruit state/config are deterministic; URL fallback/scroll reset run in effects. | Explicit fruit input; preserve scene, progress and reduced-motion behavior. |
| FruitViewer | Returns canvas/loading DOM; factory loading and WebGL construction occur in an effect. | Do not execute scene factories in Node; retain existing browser-only factory lifecycle. |
| FruitExperienceShell | Existing configuration supplies all narrative text, but acts use fixed overlays, opacity/visibility and progress-dependent accessibility. | Merely serializing progress zero leaves later acts inaccessible without JavaScript. Needs a genuine readable presentation of existing copy, without duplicate hidden text or changes to progress math. |
| Cinematic homepage | R3F Canvas plus viewport-dependent cues and progress-zero visibility. | Keep R3F browser-only and solve accessible non-JavaScript narrative presentation separately. No scene/station changes. |

## 2. Prerendering method tested

Created an isolated diagnostic fixture, `tests/prerender/ChaunsaProbe.tsx`. It uses the **actual unchanged ProductDetail**, real Chaunsa record, real SiteHeader, BrandProvider, ScrollProvider, BasketProvider and basket surfaces. It does not introduce a second router, duplicate product copy or mock browser globals.

`scripts/probe-prerender.mjs` loads the existing TypeScript components through Vite, renders the fixture with ReactDOMServer and creates a separate diagnostic hydration bundle in ignored `test-results/prerender-probe/`. Its Node rendering runs without window/document/localStorage shims. The fixture supplies `mangoes` and `chaunsa` explicitly.

`scripts/check-prerender-probe.mjs` serves the fixture over a local HTTP server and compares real Chrome rendering at 1440×900 and 375×812. It tests JavaScript disabled and hydrateRoot enabled, delays the hydration entry long enough to retain a reference to the original H1, and records recoverable hydration failures and console errors. Its acceptance gate exits nonzero on failure.

This is a diagnostic, **not an implementation wired into npm run build or src/main.tsx**. It deliberately establishes what the unchanged components do. It does not claim to implement explicit anonymous-basket restoration or working application-wide navigation.

## 3. Routes prerendered

- Diagnostic fixture only: the real `/product/mangoes/chaunsa` content, served locally as `/probe/chaunsa`.
- Production build: **zero page bodies newly prerendered**. Existing Phase 1 metadata generation for all 19 canonical pages remains unchanged.
- No expansion to collections, other products, homepage, Fruit Intelligence or information pages after the failed gate.

## 4. Initial HTML evidence

Node produced a 29,762-byte product body with one H1, the real short description, selection body and `/fruit-intelligence/chaunsa` link. No canvas was rendered. See `verification/seo-phase-2/node-results.json` and `chaunsa-diagnostic.html`.

The diagnostic HTTP response was 200 HTML, rather than a JavaScript-generated DOM alone. The real catalogue supplied all visible product data, including existing provisional-price labeling; no commercial facts were changed or invented.

## 5. JavaScript-disabled verification

At desktop width the product content was readable and matched the existing heading geometry. At 375px the Node-generated desktop layout remained a two-column composition with desktop navigation and narrow text. The heading was only about 97px wide, compared with the approved mobile width of 331px. `scrollWidth <= innerWidth` alone did not detect this failure because the commercial shell clips horizontal overflow.

See `chaunsa-no-js-375.png` versus `chaunsa-baseline-375.png`. The content is genuine; the mobile presentation is unacceptable. No hidden keyword block was added.

## 6. Hydration verification and exact blocker

Desktop hydration retained the original H1 and reported no recoverable hydration errors in the fixture. Mobile hydration reported mismatches and switched the root to client rendering. The original H1 node was replaced. This violates the required gate.

The mismatch is structural, not just a missing window guard:

- `useViewportTier` uses 1440×900 in Node and the real viewport during the first browser render.
- SiteHeader renders different navigation markup for those tiers.
- ProductDetail changes the order block's parent and conditionally includes mobile controls. It also sets breakpoint-specific inline grid, spacing and image-ratio values.
- Reduced-motion/pointer hooks and restored basket state are additional initialization concerns; those were inspected but were not all exercised by this empty-basket diagnostic.

Starting both renders as desktop could make initial hydration deterministic, but the JavaScript-disabled mobile document would still retain the incorrect composition. Starting both as mobile just moves the visual mismatch to desktop. A client script that changes the DOM before hydration does not solve JavaScript-disabled presentation. Rendering duplicate desktop/mobile product text would violate the single-content requirement.

React requires initial client content to match server content; suppressing mismatch warnings is not a correctness fix. [React hydration guidance](https://react.dev/reference/react-dom/client/hydrateRoot).

**Stop decision:** do not ship this fixture or broaden prerendering. Meeting both presentation and hydration requirements needs a scoped change to responsive markup/layout representation. The task explicitly protects existing layout and prohibits refactoring those systems, so that change is proposed below rather than forced into production.

## 7. Canonical and metadata coverage

All 19 existing Phase 1 metadata documents still pass `npm run test:seo`. The fixture uses the existing seoForPath/renderHead definitions and the unchanged canonical origin. Its canonical is `https://baagh.vercel.app/product/mangoes/chaunsa` in both JavaScript-disabled and hydrated checks. Metadata was not rewritten into a separate system.

## 8. Structured-data validation

Existing build checks passed JSON-LD parsing/shape, supported breadcrumb structure and omission of fabricated Product offers, prices, ratings, reviews and stock. The fixture reuses that existing Product/Organization/WebSite/WebPage/BreadcrumbList graph. No additional Google rich-result eligibility or external validator certification is claimed.

## 9. HTTP status and soft-404 findings

Fresh production HTTP tests found:

| Request | Status | Result |
| --- | ---: | --- |
| `/product/mangoes/chaunsa` | 200 | Correct Phase 1 title/canonical; empty initial body |
| `/robots.txt` | 200 | text/plain, expected crawler policy |
| `/sitemap.xml` | 200 | application/xml |
| `/llms.txt` | 200 | text/plain |
| `/about-us` | 200 | Canonical `/our-story` |
| `/seo-phase-2-missing` | 200 | HTML, noindex; soft-404 remains |
| `/product/mangoes/not-there` | 200 | HTML, noindex; soft-404 remains |

The broad final Vercel rewrite explains the 200 responses. A future isolated fix can preserve explicit canonical/alias mappings, emit a genuine `404.html`, and allow unmatched requests to return the platform's 404 instead of rewriting every path to spa.html. Before release it must account for the resolver's case/trailing-slash behavior, legacy selectors and all supported aliases, and must be tested on Vercel with actual HTTP statuses. Hash navigation is client-only and must stay unchanged. No status/routing change was shipped after the prerender gate failed. Raw findings: `verification/seo-phase-2/production-status.json`.

## 10. Desktop and mobile verification

The diagnostic tested both desktop/mobile without JavaScript and with hydration. It captured before/after/baseline screenshots and preserved one H1 and one pack selector in all observations. Desktop geometry matched the baseline; mobile geometry and DOM preservation failed before hydration. The hydrated mobile screenshot looked like the baseline only **after React discarded the initial tree**, which is not a pass.

No application-wide pack/basket/navigation/refresh acceptance is claimed for a failed, isolated fixture. Full expansion tests were intentionally not started.

## 11. Existing WebGL regression comparison

No production source, geometry, textures, materials, camera keyframes, progress calculations, context-loss handling or scene mount logic was changed. The Phase 1 commit/report already records desktop Kinnow/Anaar progress-settling failures and the mobile reduced-motion fallback final-CTA failure. They predate this diagnostic. No claim that they are fixed is made.

No WebGL canvas was instantiated by the product fixture; the current ProductSpecimen is photographic. The full graphics/browser suite was not rerun after the failed feasibility gate, so there is no new all-scenes pass certification.

## 12. Performance comparison

Production build output remained unchanged: main entry `index-DvjvxOyL.js`, stylesheet `index-BTusb3uW.css`, and shared Three.js `three.module-CR6bOPqT.js`. There is no added production payload, renderer, loop or hydration work. The existing large-chunk warning remains.

The diagnostic Node render took about 31ms in one observation; that is not a production benchmark. Its development-diagnostic React bundle is not included in the application and must not be interpreted as a production bundle-size comparison. No new field Core Web Vitals, Lighthouse score, INP or general performance improvement is claimed.

## 13. Files created and modified; verification commands

New files only:

- `tests/prerender/ChaunsaProbe.tsx`
- `scripts/probe-prerender.mjs`
- `scripts/check-prerender-probe.mjs`
- `docs/SEO_PHASE_2.md`
- Evidence under `docs/verification/seo-phase-2/` (six screenshots, initial HTML, Node/browser/gate results and production status findings).

No production files, dependencies, package scripts, existing tests, Phase 1 metadata or Vercel configuration were modified. Generated diagnostic bundles remain under ignored test-results.

| Command | Result |
| --- | --- |
| `npm run build` | Passed; unchanged Phase 1 build and metadata checks |
| `npm run check:types` | Passed |
| `npm run test:seo` | Passed, 19 canonical documents |
| `npm test` | Passed, 34/34 |
| `node scripts/probe-prerender.mjs` | Generated isolated real-component fixture |
| `node scripts/check-prerender-probe.mjs` | **Acceptance gate failed** on mobile, recorded with nonzero exit |
| `npm run test:browser` | Not rerun; stopped at failed proof gate. Phase 1 results retained as the documented baseline. |

Reproduce sequentially from the project root: build the application, run the probe-generation script, then its browser-check script. The last command is expected to fail until the layout/hydration blocker is resolved. It serves assets from the existing build and the isolated fixture; saved diagnostic HTML is evidence, not a standalone deployable page.

## 14. Unresolved issues and smallest continuation proposal

1. Permit a narrowly scoped **representation change** for the Chaunsa page and shared header: use one content tree with CSS media queries/grid placement instead of viewport-dependent relocation of product content. Copy the existing breakpoint values and visual behavior exactly, without changing design tokens, typography, spacing targets or scene code. Verify first paint with JavaScript disabled at mobile/tablet/desktop, including the current sticky controls. This is a layout implementation refactor, which is why it was not silently made under the present constraints.
2. Give App explicit initial route input, using the current resolver, and preserve that serialized initial route during hydration. Apply legacy hash/query navigation using the existing handlers after hydration; do not add a router.
3. Start BasketProvider with an explicit anonymous empty state, then restore localStorage after hydration without persisting the empty snapshot over existing selections. Make viewport/pointer/reduced-motion initialization hydration-safe. Do not change Fruit Intelligence timing to compensate for initialization.
4. Resolve the existing lazy page before emitting complete HTML, then hydrate the matching same tree. Keep R3F/scene factories browser-only and retain existing cleanup/context-loss effects.
5. Repeat the Chaunsa gate, including saved-basket restoration, pack selection, cross-links, SPA transitions, refresh, reduced motion and mobile first-paint screenshots. Only after it passes consider expanding to the other 18 pages. Fruit Intelligence/homepage readable narrative presentation needs its own gate using existing copy and no duplicated hidden text.

No framework migration, backend, database, CMS, bot detection, keyword pages or new dependencies are proposed. This is feasible engineering work once the scoped responsive-markup constraint is resolved; the diagnostic is not evidence that React/Vite cannot support prerendering.

## 15. Deployment instructions

**Do not deploy the diagnostic as Phase 2.** There is no production prerendering patch to release. No commit, push or deployment was performed here.

After a future implementation passes the gate: run the listed checks, inspect the complete diff, explicitly approve commit/push/deployment, use the existing Vercel `npm run build` / `dist` configuration, and verify real production HTTP bodies/statuses/canonicals, JavaScript-disabled layout and hydration on the deployed URLs. Keep the Phase 1 origin and crawler policy unchanged. Do not declare all pages prerendered based solely on metadata documents.

## 16. Search Console, Bing and IndexNow follow-up

Keep `VITE_GOOGLE_SITE_VERIFICATION` and `VITE_BING_SITE_VERIFICATION`. Obtain each service's real HTML meta-tag **content token**, set it in the relevant Vercel build environment, then rebuild/redeploy and inspect the initial response for the exact tag. Empty tokens emit no tag. The HTML verification content tokens are intentionally public; private API credentials must never use a VITE-prefixed client variable.

After ownership verification, submit `https://baagh.vercel.app/sitemap.xml`, inspect representative URLs and monitor indexing. robots.txt, sitemap.xml and llms.txt were reachable in the production checkpoint. llms.txt and crawler permission do not guarantee inclusion.

IndexNow was not implemented or invoked. For a later adoption, use a legitimate ownership-key file on the host and keep submission-service/API secrets in a server-side or CI secret store. No runtime backend is needed for a CI submission design; do not add one for this sprint. Do not invent a key or treat IndexNow as a guarantee of Google indexing.
