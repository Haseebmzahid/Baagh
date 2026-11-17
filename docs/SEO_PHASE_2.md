# BAAGH SEO Phase 2A — Chaunsa responsive HTML and hydration

Status: **PASS — isolated Chaunsa Phase 2A gate completed.** Local changes only. No commit, push or deployment performed. **Only `/product/mangoes/chaunsa` receives a prerendered body.**

The original stopped investigation and evidence are preserved. Its report is archived at `verification/seo-phase-2a/previous-SEO_PHASE_2.md`; the original `verification/seo-phase-2/` artifacts remain intact.

## Root cause and scoped correction

The old header selected entirely different navigation markup from viewport state. Product Detail changed the order panel's parent, image ratio, grids, spacing and mobile purchase controls from the same state. Node used desktop defaults while mobile hydration used the actual viewport. The first proof therefore replaced the initial DOM. Basket initialization also read localStorage before a matching anonymous hydration render existed.

This continuation uses the newly authorised responsive representation change. It preserves the existing React/Vite architecture, catalogue, tokens, typography, colour and spacing values, routing resolver, scroll restoration, scene factories and context-loss protections. There is no backend, second router, CMS, framework migration or added dependency.

## Responsive markup

**SiteHeader:** one brand cluster, one semantic navigation and one cabinet trigger. CSS uses the existing 1279px breakpoint to reproduce the desktop navigation and compact Fruit Guide/Order presentation. Each destination appears once. Alternate short UI labels live inside the same controls; there are no separate desktop/mobile navigation trees. Cabinet rendering and scene implementation are unchanged. Closing via the cabinet returns focus to its trigger.

**ProductDetail:** one H1, description, pack selector, quantity state and primary action for the main product. The order panel stays after the facts/description at every width. CSS reproduces the original columns, 4:3 tablet/mobile image, related-product layout, section spacing and mobile rail at the exact 767/768/1279/1280 breakpoints. Existing measurements remain 56/40/22px margins, 28/22/14px gutters and 140/104/76px section spacing.

The primary action and WhatsApp peer have one DOM instance each. They appear inline on desktop/tablet and in the existing fixed rail on mobile. This intentionally removes the former second inline set of mobile purchase actions. Consequently the mobile document is 136px shorter in that control area; the product composition, pack positions and sticky rail retain their approved measurements. This is the requested single-control consolidation, not a claim of pixel identity with the former duplicated full-page controls.

The glass blur uses a separate layer on mobile so it cannot turn the rail into a fixed element relative to the panel. Local stacking rules retain the rail's original relationship to the grain. Other commercial pages retain their existing layouts; shared primitive edits add CSS hooks and the hydration-safe pointer subscription.

## Route initialization and matching tree

1. `chaunsaBootstrap()` uses the existing `resolveRoute` for the canonical pathname and serializes a versioned pathname/hash/route snapshot.
2. The build imports `src/seo/prerender.tsx` through the existing Vite Node API. ReactDOMServer renders the real App and actual ProductDetail with explicit Chaunsa input. No window/document shims, browser renderer or scene factory is executed.
3. The real ProductDetail is resolved before rendering/hydration, avoiding a lazy loading-shell replacement. Other asynchronous experiences keep their existing Suspense behavior.
4. Only the canonical Chaunsa HTML receives the populated root and JSON bootstrap marker. Its product stylesheet is linked in the initial head using Vite's build manifest, so CSS does not depend on executing the JavaScript chunk.
5. `main.tsx` hydrates that same tree when the marker exists. All other documents retain createRoot. There is no duplicated crawler-specific markup or bot detection.
6. Existing route handlers continue to process History API, Back/Forward, query and hash aliases. Hash/query overrides run through the existing handler after matching hydration. The resolver and scroll-restoration code were not changed.

`useSyncExternalStore` supplies consistent server/hydration snapshots for viewport, pointer and reduced-motion subscriptions, then supplies real browser capabilities. Product layout itself is CSS-responsive before JavaScript runs. No hydration warnings are suppressed; recoverable errors are logged and collected by the gate.

## Basket restoration

For a prerendered App, BasketProvider starts with an explicit empty anonymous basket on the server and first hydration render. A guarded effect restores saved selections afterward. Restoration is read-only and does not call the normal persistence mutation. The guard handles Strict Mode effect repetition. Normal createRoot documents retain their existing basket initialization path.

The browser gate verifies a pre-existing basket containing Chaunsa 10kg ×3 and Anaar 3kg ×2. It checks storage bytes, observes storage writes, verifies the restored count after refresh and retains the original parsed H1 node. A separate action test selects Chaunsa 2kg, increases quantity to two, adds it, and verifies the exact persisted pack and quantity after reload.

## Initial HTML and SEO evidence

The built Chaunsa document contains the real H1, short description, selection narrative, existing pack/weight options, ordering controls, primary photo and Fruit Intelligence link. It contains one main-product pack selector and primary action, and zero canvases. ProductSpecimen remains the existing FruitPhoto component; no WebGL product enhancement was invented.

See `verification/seo-phase-2a/chaunsa-initial.html` and `initial-html-and-build.json`. The measured document is approximately 33.8KB raw / 6.1KB gzip. Canonical remains `https://baagh.vercel.app/product/mangoes/chaunsa`.

All 19 existing metadata definitions remain covered. Existing Product/Organization/WebSite/WebPage/BreadcrumbList JSON-LD is retained without invented offers, prices, ratings, reviews or stock. Syntax/shape checks pass; this is not external Google rich-result certification. robots.txt, sitemap.xml and llms.txt compare byte-for-byte equal to the preserved Phase 1 build. Verification variable names and canonical origin remain unchanged.

## Acceptance results

The definitive run is `node scripts/check-prerender-probe.mjs --production`. Its original fixture mode and evidence were retained; production mode checks the actual built App and client entry, not a substitute component tree.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Real content in initial HTTP HTML | PASS | Raw response/body, one H1 and actual catalogue copy |
| JavaScript-disabled layout at 1440×900, 768×1024, 375×812, 390×844 | PASS | Four `no-js-*` screenshots; H1/photo/pack geometry matches baseline |
| JavaScript-enabled before hydration | PASS | Scripts held while initial DOM/CSS is inspected |
| Original H1 and root child survive hydration | PASS | Node identity checks at all four sizes |
| No recoverable hydration errors/root fallback | PASS | Empty error arrays in browser evidence |
| One H1, pack selector and main primary action | PASS | Initial HTML and browser counts |
| Horizontal overflow | PASS | Four viewports, with explicit geometry checks as well as document width |
| Pack, quantity and basket action | PASS | 2kg ×2 stored and restored after refresh |
| Existing saved basket | PASS | Two existing lines retained, no restoration storage writes, initial H1 retained |
| Basket drawer focus | PASS | Closing restores the initiating purchase control |
| Header/cabinet keyboard interaction | PASS | Enter, Tab, ArrowRight, Escape and trigger-focus return |
| Fruit Intelligence cross-link and existing scene mount | PASS | Canonical link, actual Chaunsa factory ready marker |
| Back/Forward and refresh | PASS | Real browser navigation |
| Hash/query/legacy product aliases | PASS | Signature hash, Apple hash, fruit query, legacy product path |
| Reduced motion | PASS | Reduced-motion contexts, image animation disabled, existing inspection mounts |
| New console/runtime errors | PASS | No errors recorded in the focused gate |
| General all-scene animation regression suite | NOT TESTED | Outside this isolated gate; known Phase 1 failures not claimed fixed |
| Production deployment checks for this change | NOT TESTED | No push/deployment authorised or performed |

The final gate results and screenshots are under `verification/seo-phase-2a/`. The final layering check passed; the acceptance table describes that completed run.

## Visual comparison

Baselines were captured from a preserved Phase 1 build before editing, at every requested size. Original captures are retained; `baseline-settled-*` additionally waits for reference photos to decode. Before-hydration measurements wait for both stylesheets and fonts, avoiding comparisons against a font-loading frame.

The H1, main photo and pack-selector x/y/width/height match the approved baseline to within one pixel in all modes. Desktop and tablet initial viewport comparisons are pixel-identical in all three modes. At each mobile size, 190 pixels differ only at the panel/rail compositing edges, by at most 1/255 per channel at 375px and 2/255 at 390px; geometry and typography positions match. There are no pixels differing by more than 8/255 between JavaScript-disabled and hydrated full-page captures. Mobile comparisons and full-page details are recorded in `pixel-comparison.json` and `full-page-comparison.json`; the authorized removal of duplicate mobile controls is explicitly accounted for. No post-hydration screenshot alone was used as proof.

## Build and tests

| Command | Result |
| --- | --- |
| `npm run build` | PASS; TypeScript, Vite, Chaunsa body generation and SEO checks |
| `npm run check:types` | PASS |
| `npm run test:seo` | PASS; 19 metadata documents, Chaunsa body/control counts, all other routes without prerender markers |
| `npm test` | PASS; 34/34 |
| `npm run test:browser -- tests/browser/seo.spec.ts` | PASS; 6/6 desktop/mobile SEO browser tests |
| `node scripts/check-prerender-probe.mjs --production` | PASS; final four-size gate, keyboard operation and read-only saved-basket restoration |
| Full existing graphics browser suite | NOT TESTED in this continuation |

The focused browser gate exercises real headless Chrome with software WebGL for cabinet/inspection checks. It is not a physical-device FPS or field Core Web Vitals benchmark. The Phase 1 Kinnow/Anaar settling assertions and mobile reduced-motion fallback assertion remain documented baseline issues; none is declared fixed here.

## Performance and protected systems

No additional renderer or animation loop was introduced. The shared Three.js output is byte-identical to Phase 1 (`three.module-CR6bOPqT.js`); scene sources, textures, geometry, materials, camera keyframes and progress code are unmodified. Scene chunk names can change because their imported application chunk hashes change.

The main entry remains about 245KB raw / 77KB gzip. Main CSS is about 28.6KB raw / 6.45KB gzip, plus the product stylesheet about 3.9KB raw / 1.2KB gzip. The extra initial HTML and stylesheet provide real content and responsive first paint. There is no new dependency or server runtime. The existing large Three.js chunk warning remains. No new Lighthouse/CrUX/INP improvement is claimed.

## Files changed

- `src/components/dom/SiteHeader.tsx`, new `siteHeader.css`: one responsive navigation tree and cabinet focus return.
- `src/components/commercial/ProductDetail.tsx`, new `productDetail.css`: stable product structure and one responsive action group.
- `src/components/commercial/primitives.tsx`: scoped CSS hooks and hydration-safe pointer subscription.
- `src/hooks/useViewportTier.ts`, `src/hooks/useReducedMotion.ts`: external-store snapshots that match during hydration.
- `src/context/BasketContext.tsx`: anonymous first render and read-only restoration.
- `src/App.tsx`, `src/main.tsx`: explicit initial route/preloaded product and conditional hydration.
- New `src/seo/bootstrap.ts`, `src/seo/prerender.tsx`: shared Chaunsa bootstrap and actual-tree Node renderer.
- `vite.config.ts`, `scripts/build-seo.mjs`: manifest-backed initial CSS and the single-page body generation.
- `scripts/check-seo.mjs`: body/control and isolated-rollout checks.
- `scripts/check-prerender-probe.mjs`, new `scripts/verify-chaunsa.mjs`: opt-in production gate and preserved baseline comparison.
- This report and new `docs/verification/seo-phase-2a/` evidence.

Catalogue data, design tokens, route resolver, scroll restoration, scene implementations, robots/sitemap/llms policy, package dependencies and hosting rewrites are unchanged.

## Reproduction and release boundary

From `D:\karamat`, run the normal build/check commands, then `node scripts/check-prerender-probe.mjs --production`. The gate starts its own HTTP server against dist. Chrome defaults to the existing Windows installation; `BAAGH_CHROMIUM_PATH` can select another executable. Existing Playwright checks also support `BAAGH_SOFTWARE_WEBGL=1` and `BAAGH_PREVIEW_PORT`.

Do not run the old diagnostic without its production flag expecting current acceptance evidence; its historical fixture remains separate. To recreate baseline comparisons, first preserve an approved pre-change dist under `test-results/phase2a-baseline` before building the new version.

No release was performed. Review the Chaunsa proof before any explicitly approved push/deployment. A later deployment would keep Vercel's existing `npm run build`/dist configuration and require fresh live no-JavaScript, hydration and route checks. There is no expansion to the other 18 page bodies, no status-routing change, and no claim that the full SEO Phase 2 rollout is complete. The existing unknown-route HTTP 200/noindex limitation is unchanged.


## Manual search verification follow-up

The existing `VITE_GOOGLE_SITE_VERIFICATION` and `VITE_BING_SITE_VERIFICATION` remain configurable. Supply each service's real HTML meta-tag content token in the Vercel build environment, rebuild after an approved release, and inspect the initial HTML for the exact value. These HTML tokens are public; no private API credentials belong in VITE variables. No token was invented or submitted here. After an approved deployment, use Search Console/Bing URL inspection and the existing sitemap manually. No IndexNow submission or automated indexing claim is part of this proof.
