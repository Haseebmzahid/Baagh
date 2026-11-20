# BAAGH — SEO Phase 2C Batch 1B

18 November 2026. Local production build integration. No commit, push or deployment occurred.

## Rendering and hydration

The Phase 2C feasibility probe found that a cold `renderToString` of the production App reaches the Fruit Intelligence `React.lazy` boundary before the page module resolves. The new shared loader imports the actual `FruitIntelligence.tsx` module. Its named `FruitIntelligence` export is the page for all four fruits. The App passes the snapshot’s resolved fruit ID into that component, which selects the existing configuration and scene factory loader from the registry.

The server generates a version 1 snapshot with the existing resolver, awaits the page module, and supplies the concrete component to the App before `renderToString`. The existing readiness boundary can then render the complete page synchronously. BrandProvider, ScrollProvider and the anonymous BasketProvider wrap the App in both environments. The SEO builder resolves the emitted route CSS through the Vite manifest and links it in the initial document.

The entry reads and validates the existing marker and route snapshot. It awaits the same named page export before calling `hydrateRoot` on the existing root. The first React render uses the same fruit and Reading tree. The Batch 1A commit ref applies presentation attributes and reads the existing fallback query. The existing viewer effect loads and initializes the chosen scene in the browser. Client-rendered entry points retain `React.lazy`; the scene factories remain separate dynamic imports.

## Initial HTML and exact allowlist

| Canonical route | Narrative acts | Characteristic descriptions |
|---|---:|---:|
| `/product/mangoes/chaunsa` | | |
| `/everyday-fresh` | | |
| `/signature` | | |
| `/our-story` | | |
| `/fruit-intelligence/chaunsa` | 8 | 7 |
| `/fruit-intelligence/kinnow` | 8 | 9 |
| `/fruit-intelligence/apple` | 9 | 9 |
| `/fruit-intelligence/anaar` | 10 | 16 |

The gate scanned 35 generated HTML documents, covering 19 canonical pages, 14 aliases, Basket and the SPA fallback. Exactly eight documents had a single prerender marker and meaningful initial content. Every other initial root was empty. Direct inspection of the four fruit documents found the correct H1 and one occurrence of each configured act body and nonempty characteristic description in the root. Each fruit document includes the labelled static silhouette, the Reading presentation, and links to `/everyday-fresh` and `/signature`. The existing scene loading surface is hidden in Reading mode.

Product and Offer markup remain withheld. `robots.txt`, `sitemap.xml` and `llms.txt` are byte-identical to the Batch 1A baseline.

## Browser acceptance

Each cell records the HTTP initial document, JavaScript-disabled Reading layout, held-module Reading layout, hydration identity and reduced-motion 3D checks. The browser used actual built HTML, production CSS and the emitted scene modules.

| Fruit | 1440×900 | 768×1024 | 390×844 | 375×812 |
|---|---|---|---|---|
| Chaunsa | Pass | Pass | Pass | Pass |
| Kinnow | Pass | Pass | Pass | Pass |
| Apple | Pass | Pass | Pass on retry | Pass on retry |
| Anaar | Pass | Pass | Pass on retry | Pass |

At all 16 combinations, the static layout exposed the introduction, all acts and characteristics, the labelled silhouette and both collection links, with no horizontal overflow. The same layout remained visible while the page module request was held. Hydration retained the existing root, App wrapper, fruit page, H1 and first characteristic node without recoverable hydration errors. The scene booted at scroll and progress zero. Drag dismissed the hint, scrolling reached .2, .6 and 1, and the final CTA became keyboard reachable. Keyboard entry into Reading removed the canvas and released the old scene’s geometries and owned WebGL context. Try 3D started a new scene at progress zero with one canvas and retained the same semantic nodes.

The three marked cases initially passed those assertions and then failed the final console check on one resource-load error each. Chromium reported one timeout and two connection resets without URLs in that run. All three repeated the complete checks and passed with empty console, page and recoverable hydration error arrays. The application build and timing thresholds were identical on retry.

The supplemental 390×844 checks followed both collection links with JavaScript disabled from each fruit, for eight successful navigations. All four `?fallback=true` entries reached Reading without a live scene or viewer canvas. The selected scene module can download during the existing startup effect. Try 3D reached the correct scene and displayed the fruit-specific inspection annotations. The Apple annotation probe repeated its scroll sample after viewer readiness because its first early sample stayed at progress zero.

The client-rendered Kinnow product loaded no Fruit Intelligence page or scene assets on entry. Its study link kept the original App root, requested the deferred page JavaScript and stylesheet, and mounted the Kinnow scene without requesting the other fruit scenes.

The unchanged 20-second normal-motion settling assertion reproduced for desktop Kinnow at .4 and desktop Anaar at .75. Both reached the matching scroll offset and fell short of the progress tolerance with a live scene and no page errors, consistent with the preserved desktop failures in Batch 1A. Historical timeouts and graphics source were left as recorded.

The full `npm run test:browser` run finished with 29 passed, five failed and 16 skipped duplicate matrix invocations in the mobile project. The pre-existing suite accounted for 16 passes and the two documented desktop failures. The new matrix accounted for 13 passes and the three resource-console failures listed above. The Chaunsa production gate passed at all four sizes, including basket persistence, keyboard interactions, Fruit Intelligence navigation and aliases.

Raw HTML inspection, viewport captures, browser output and command logs are under `test-results/phase2c-batch1b/`.

## Build and protected systems

- `npm run build`, `npm run check:types` and `npm run test:seo` passed.
- `npm test` passed all 35 tests, including scene-loop visibility, reduced-motion scheduling and disposal.
- The route resolver, fruit source, editorial configurations, CSS, homepage source, provider implementations, catalogue, and schema implementation have no source diffs. Renderer ownership, scene factories, camera, geometry, textures, annotation projection, drag, scene loop and context-loss cleanup use the existing implementations.
- The production manifest shows a dynamic Fruit Intelligence page with four separately loaded scene chunks. The static entry graph contains none of those five chunks. The Fruit Intelligence page is 40,534 bytes and its stylesheet is 1,978 bytes, equal to the pre-change asset sizes. The initial JS entry is 247,179 bytes, an increase of 183 bytes. The single shared Three.js chunk is byte-identical to the baseline, 732,125 bytes (189.59 kB gzip in the build report). Vite still reports its existing warning for a chunk over 500 kB.

The Phase 2C feasibility report and Batch 1A evidence were preserved. The browser gates' fresh output was archived and all 82 files in the pre-existing performance and Chaunsa evidence directories were restored and verified byte-for-byte. Local Chromium with software WebGL supplies browser evidence for this batch. Field Core Web Vitals and physical-device FPS were outside the local verification.
