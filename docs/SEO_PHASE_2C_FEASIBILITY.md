# BAAGH — SEO Phase 2C feasibility audit

18 November 2026 (America/Los_Angeles). Repository: D:\karamat. Canonical origin: https://baagh.vercel.app/.

**Decision: technically feasible after a separate shared DOM/content preparation phase; FAIL for a production rollout of the unchanged page.** All four actual FruitIntelligence components render in Node without browser shims and hydrate in the isolated diagnostic. However, the default experience renders zero H1s, no annotation descriptions, an indefinitely loading empty canvas without JavaScript, and later narrative acts remain hidden. The existing FruitFallback is a useful static foundation, but it is not part of the default initial tree. Extending the allowlist alone is insufficient.

This is an investigation only. No production source, routing, metadata, scene, dependency or integration was changed. No commit, push or deployment. Only this report is added outside ignored diagnostics. Live production responses were not re-audited; production-mode statements below refer to current repository architecture and existing local dist output.

## 1. Existing production rendering architecture

Reviewed docs/SEO_PHASE_1.md, SEO_PHASE_2.md, SEO_PHASE_2A_REGRESSION_AUDIT.md, SEO_PHASE_2B_BATCH_1A.md, SEO_PHASE_2B_BATCH_1B.md and SEO_PRODUCT_SCHEMA_REMEDIATION.md. Earlier reports describe earlier scope. Current source and Batch 1B supersede historical statements that Chaunsa alone is prerendered. The Product-schema remediation supersedes Phase 1's historical incomplete Product emission policy.

The exact allowlist in src/seo/bootstrap.ts remains:

- /product/mangoes/chaunsa
- /everyday-fresh
- /signature
- /our-story

The version-1 bootstrap contains canonical pathname, empty hash and resolveRoute output. readBootstrap rejects routes outside that typed allowlist and mismatched route snapshots. scripts/build-seo.mjs uses Vite's SSR loader and ReactDOMServer through src/seo/prerender.tsx. It fills the real App root only for those four paths, serializes the snapshot and links ProductDetail's extracted CSS where needed. All other canonical documents receive route-specific heads and an empty root. scripts/check-seo.mjs enforces this distinction and scans generated aliases/fallback too.

App receives explicit route state and preloaded ProductPage, SignaturePage or StoryPage. EverydayFresh is synchronous. ExperienceBoundary bypasses Suspense only when the corresponding synchronous approved page is ready. App wraps BrandProvider → ScrollProvider → anonymous BasketProvider → AppContent. Anonymous basket initialization is deterministic; existing read-only restoration runs after mount. main.tsx preloads the matching component and calls hydrateRoot for a valid marker, otherwise createRoot. Existing navigation and hash reconciliation run in effects. App's initialRoute reads window unless a bootstrap supplies the route.

FruitIntelligence remains React.lazy in App. There is no synchronous fruit-page injection/preload contract. A fresh isolated App SSR probe using an explicitly supplied **diagnostic-only unsupported** fruit snapshot returned the Suspense loading boundary for every route: zero H1s and unfinished-Suspense markers. These snapshots were not installed in production documents or passed through readBootstrap. Earlier warm-module probes sometimes rendered the page because the lazy promise had resolved between probes; cold-app-results.json is the reliable cold-start evidence. Simply observing a warm import is not an integration proof.

## 2. Actual component dependency map

All four canonical paths resolve in src/navigation/route.ts to { view: 'fruit-intelligence', fruit }. AppContent selects the same shared component with that ID.

```text
App → BrandProvider → ScrollProvider → BasketProvider → AppContent
  ├─ SiteHeader → siteHeader.css
  │    └─ closed initially; when opened: lazy FruitCabinet → FruitCabinetScene
  └─ Suspense → lazy FruitIntelligence(fruit)
       ├─ fruits/index.ts → synchronous config + deferred loadFactory
       ├─ FruitViewer → useReducedMotion → sceneQuality
       │    └─ effect → deferred fruit scene factory (existing canvas only)
       ├─ FruitAnnotations → core/mathUtils.win + projected ScreenPoint[]
       ├─ FruitExperienceShell → config.acts + progress + useReducedMotion
       └─ alternative branch: FruitFallback(config)
```

| Route suffix | Configuration under src/components/fruit-intelligence/fruits/ | Deferred factory | Scene builders |
|---|---|---|---|
| chaunsa | chaunsa/config.ts → chaunsaConfig | chaunsa/ChaunsaScene.ts → createChaunsaScene | chaunsa/geometry.ts, chaunsa/textures.ts |
| kinnow | kinnow/config.ts → kinnowConfig | kinnow/KinnowScene.ts → createKinnowScene | kinnow/geometry.ts, kinnow/textures.ts |
| apple | apple/config.ts → appleConfig | apple/AppleScene.ts → createAppleScene | apple/geometry.ts, apple/textures.ts |
| anaar | anaar/config.ts → anaarConfig | anaar/AnaarScene.ts → createAnaarScene | anaar/geometry.ts, anaar/textures.ts |

These scenes use core/sceneLoop.ts, core/performance.ts, core/disposeScene.ts and core/mathUtils.ts. core/types.ts defines configuration, anchors, screen points and scene contracts. core/cameraSystem.ts exports solveCameraPose but is not imported by these four current scene factories; their actual camera choreography lives in their scene files and config data (including Anaar's anaarCameraKeys). No replacement camera system is needed or proposed.

FruitIntelligence does not consume viewport-tier state. useViewportTier provides a stable 1440×900 server snapshot through useSyncExternalStore for other App surfaces. SiteHeader already uses one CSS-responsive tree. useReducedMotion uses a false server snapshot, then subscribes to matchMedia after hydration.

## 3. Route-by-route feasibility matrix

This table evaluates the **unchanged default FruitIntelligence component in the isolated real-component diagnostic**, not a deployed prerender. Educational content requires readable inspection/annotation information without JavaScript, rather than merely hidden strings in HTML. Responsive HTML PASS means tested document width/readable initial copy; it does not override the content failures.

| Fruit route | Node SSR | H1 in initial HTML | Educational content | Scene isolation | Responsive HTML | Hydration feasibility |
|---|---|---|---|---|---|---|
| /fruit-intelligence/chaunsa | PASS | FAIL | FAIL | PASS | PASS | PASS |
| /fruit-intelligence/kinnow | PASS | FAIL | FAIL | PASS | PASS | PASS |
| /fruit-intelligence/apple | PASS | FAIL | FAIL | PASS | PASS | PASS |
| /fruit-intelligence/anaar | PASS | FAIL | FAIL | PASS | PASS | PASS |

Hydration PASS is bounded: actual components/providers/header, matching explicit props, existing scenes and actual CSS, across four sizes. Full production App/main/bootstrap hydration for fruit routes is **NOT TESTED**, because that integration does not exist and is outside scope. Default H1 identity is **NOT TESTED/absent**, not a successful identity assertion. The separate unchanged FruitFallback diagnostic passes one-H1/content/identity checks for all fruits, but is not the default route representation.

## 4. Initial HTML findings

Current generated dist fruit documents all have empty roots, no bootstrap marker and zero H1s. Their real metadata, canonical, Open Graph/Twitter fields and Organization/WebSite/WebPage graph already exist before JavaScript. The fruit name can occur in the head; that is not a visible page H1 or body. No Product, Offer, Review, AggregateRating or BreadcrumbList is emitted on these educational routes.

| Fruit | Actual narrative acts | Nonempty annotation descriptions | Default diagnostic H1s | Default annotation descriptions in HTML | Reading diagnostic H1s | Reading descriptions in HTML |
|---|---:|---:|---:|---:|---:|---:|
| chaunsa | 8 | 7 | 0 | 0 | 1 | 7 |
| kinnow | 8 | 9 | 0 | 0 | 1 | 9 |
| apple | 9 | 9 | 0 | 0 | 1 | 9 |
| anaar | 10 | 16 | 0 | 0 | 1 | 16 |

All act bodies are present in the default server markup: 8/8 Chaunsa, 8/8 Kinnow, 9/9 Apple and 10/10 Anaar. The shared shell's comment saying “8 Acts” is not the actual count for Apple/Anaar. At progress zero only the opening act is visible; later acts have visibility:hidden, opacity zero and aria-hidden. The opening fade can itself be partially opaque. Native scrolling without JavaScript does not change progress, so later educational copy and final CTAs never become available. All narrative headlines are div elements, including the opening fruit headline.

FruitAnnotations starts with an empty points array and progress zero. Callout cards require projected points and active progress windows; trio badges also require points. No nonempty annotation descriptions are emitted initially. This is a content omission, not an SSR exception. The canvas has a meaningful fruit-specific aria-label, but contains no static scene image or fallback text. Its loading status remains forever with JavaScript disabled. The Reading view button cannot switch branches without JavaScript; ?fallback=true is also read only in an effect.

FruitFallback directly renders config.headline as one H1, the existing summary, a CSS silhouette, every anchor with a nonempty description, and two CTA anchors. It supplies a useful renderer-free reading representation. It does not render all narrative acts, config.variety or fallback.summaryTitle. Therefore it is a useful foundation, not complete narrative parity. No extra fruit claims were supplied for this investigation.

## 5. Browser/API and WebGL isolation audit

| Surface | Source finding | Consequence |
|---|---|---|
| FruitIntelligence | Initial hasWebGL=true, forceFallback=false, points=[], progress=0, hasInteracted=false | Deterministic initial page for every fruit; browser failure changes it only afterward |
| URL fallback / scroll reset | window.location, scrollTo, documentElement/body scroll writes are inside useEffect | Safe in Node; retain reset and initial zero in any later integration |
| FruitViewer render | Fixed stage and canvas always exist; ready=false initially | Stable server/client structure; canvas alone supplies no rendered fruit before JS |
| FruitViewer initialization | loadFactory in useEffect, cancellation guards, one deferred requestAnimationFrame before factory invocation | No scene import/factory execution, renderer or texture canvas created by Node page rendering |
| Scene factories | Existing new THREE.WebGLRenderer uses supplied canvas inside create*Scene | Keep this exact renderer ownership; no second scene/canvas required |
| Geometry/textures | Fruit-specific builders; document.createElement('canvas') is inside texture helper functions | Builders remain behind client factory invocation; no browser shims required for page SSR |
| Annotations | Guarded direct window.innerWidth/innerHeight reads; 1440/900 server defaults | Currently harmless at empty points/progress zero; risky if prepopulated annotations are later introduced |
| Reduced motion | useSyncExternalStore false server snapshot and matchMedia subscription | First hydration matches; real preference can restart viewer effect afterward through existing dependency |
| Scene loop | Existing cancellable RAF, hidden-tab pause, reduced-motion on-demand invalidation, frame/publication budgets | Preserve existing scheduling; no additional loop needed |
| Cleanup | Viewer cancels deferred start, removes pointer/scroll/resize/context listeners and disposes scene | Existing ownership can remain intact inside server-rendered DOM |
| Scene disposal | loop.dispose, disposeScene resource traversal/Set, renderer.dispose and forceContextLoss | Existing cleanup protections remain unchanged |
| App capability hook | Server guard; cached client-only temporary WebGL2 support probe released immediately | Existing App behavior; the isolated wrapper does not add or invoke this probe |
| ScrollProvider | Zero refs; Node performance.now exists; listeners/central RAF in effects | SSR safe in the tested Node runtime; reuse provider rather than add a new scroll engine |

No useLayoutEffect exists in the Fruit Intelligence subsystem. No render-time renderer construction was found there. Browser-only scene APIs are behind the viewer effect. Annotation viewport reads are an exception to effect-only browser access, but are guarded and currently produce no viewport-dependent initial child nodes. The canonical route resolver is pure. Basket storage remains isolated by the existing anonymous provider contract.

The debug __toggleFruitFallback function is assigned in an effect without removal on unmount; this is an existing development/testing hook, not an SSR blocker. No cleanup change was attempted. Historical CinemaStage stale-callback and context-loss fixes were neither reopened nor modified.

## 6. Diagnostic method and no-JavaScript results

All scripts, JSON, built assets, HTML and PNG captures are under ignored test-results/phase2c-feasibility/. No production App replacement or routing modification was made. component.tsx composes the actual BrandProvider, ScrollProvider, anonymous BasketProvider, SiteHeader and either the unchanged FruitIntelligence or unchanged FruitFallback, using existing registry data. Both server and client import that same diagnostic composition. It imports src/index.css; SiteHeader imports its real CSS. Vite bundles their actual styles and existing scene imports into an isolated built directory.

ReactDOMServer.renderToString runs in Node without window/document shims. Eight raw documents and a Vite production build were generated. client.tsx exposes an explicit diagnostic hydration trigger; module loading does not mount React until the browser test requests it. This permits inspection of actual parsed DOM before hydration, followed by hydrateRoot of the identical tree with onRecoverableError collection. Main.tsx, bootstrap and App integration are not exercised by that wrapper.

Installed headless Chrome and existing Playwright dependencies served local diagnostic documents at 1440×900, 768×1024, 390×844 and 375×812, DPR 1. Each of 32 fruit/mode/viewport combinations was visited in a separate JavaScript-disabled context, captured full-page, scrolled to the bottom, then tested separately with hydration enabled. Actual production CSS is used; the diagnostic omits index.html's external Google Fonts stylesheet links, so captures use declared fallback fonts. Typography/pixel equivalence to font-loaded production is **NOT TESTED**. These are readability/structure findings, not approved visual redesign evidence.

| Diagnostic | Cases | H1 | Inspection copy | Static scene representation | Document overflow |
|---|---:|---|---|---|---|
| Default experience | 16 | FAIL — zero | FAIL — only opening copy visible; annotations absent | FAIL — empty labelled canvas and loading status | PASS — none |
| Existing reading view | 16 | PASS — exactly one correct headline | PASS — all existing nonempty anchor descriptions readable | PASS — existing CSS silhouette and text grid | PASS — none |

Opening fruit names/headlines and introductory descriptions are readable in default captures. Reading captures show the fruit-specific headline, real summary and characteristic cards. The reading grid adapts from columns to a single column on phones. Representative desktop, tablet and mobile screenshots were visually inspected. At phone widths the fixed header overlaps the upper silhouette area; headings and grid copy remain below and readable. No spacing fix was applied. Document-width checks cannot certify every hidden/transformed descendant, contrast, keyboard target or every font-loaded geometry.

Internal links: desktop header has genuine path anchors to /, /everyday-fresh, /signature, /our-story, /signature#corporate and /basket. Compact header CSS leaves brand and Order visible, with Fruit Guide as a JavaScript-dependent cabinet button. Existing product pages link to their canonical fruit study; cabinet fruit selection uses callbacks and is unavailable without JS. Study CTAs in every config use #everyday-fresh and #signature-collection. Without JS these stay on the study path and do not reach those collections; no corresponding section IDs exist in the study. In the default experience the CTAs are additionally hidden/inert at progress zero. Reading mode makes them visible but does not repair the fragment-only destinations. A later preparation phase must address genuine hrefs within its separately approved scope.

## 7. Hydration results and remaining risks

All 32 isolated cases preserve the root element, root-first-child (SiteHeader header) and page-root identities. All 16 reading cases preserve the exact original H1 node. All 16 default cases have no H1 to compare. Console error arrays, page-error arrays and recoverable React error arrays are empty across all 32. The default canvas count is one before/after hydration, while reading mode has zero. All 16 hydrated default cases reached the actual selected scene with diagnostic progress exactly zero and one canvas. No fake crawler content or scene stub was used.

| Risk | Finding / future gate |
|---|---|
| Cold lazy App route | FAIL for unchanged integration: loading Suspense output; add a matching real-component preload contract only in a separately authorized task |
| Production bootstrap | Fruit routes remain disallowed; no production hydration test can be claimed yet |
| First-render reading selection | Do not server-render FruitFallback then hydrate FruitIntelligence: those are different trees |
| Missing H1 | Semantic preparation must supply exactly one persistent H1 with existing copy |
| Static annotations | Initial projected points must remain empty; expose existing text through a shared static representation rather than fabricate scene coordinates |
| Viewport reads | Current empty-annotation initial tree passes all sizes; populated server points would invalidate that assurance |
| Reduced motion | Server snapshot matches; subsequent effect restart is existing behavior, requiring lifecycle regression gates |
| Progress/scroll | Retain zero initialization/reset, native scroll sampling, renderAt(0), existing damping and total scene scroll range |
| Fallback transition | Existing Reading view replaces the interactive branch after hydration; future structural changes need deliberate identity expectations |
| Saved basket / aliases | Existing anonymous restoration and route-handler behavior must be rechecked in the actual App once integration exists |

A supplemental 375×812 reduced-motion check mounted all four actual scenes at scroll/progress zero, sampled native scroll at .2, .6 and 1, and reached each target within .02. Reading view then produced the correct H1, zero canvases and no remaining __fruitScene reference for every fruit. No page errors were recorded. This verifies the observed mount/progression/fallback transition; it is not a forced context-loss/disposal-resource audit. The wrapper has no App hash-route handler, so its enabled-JS fragment-click result is not a production routing failure. See interaction-results.json.

No blanket production hydration or graphics-regression PASS is claimed. Existing desktop/tablet Kinnow/Anaar normal-motion settling timeouts are documented in prior audits; the full historical browser suite was not repeated or claimed fixed here.

## 8. Performance considerations

SSR emits the shell and canvas element without importing scene factories or generating geometry/textures. Keep scene factories deferred behind the existing effect. Static reading content is inexpensive compared with procedural scene construction, but including it blindly alongside the scene can change total scroll height, progress mapping and layout. Sharing existing editorial data avoids duplicated maintenance and crawler-only copy.

The isolated build reports the existing large Three.js chunk warning. Its different entry graph is not a production bundle comparison; no production speedup or bundle-size regression is inferred. Browser readiness diagnostics are recorded per case but are unthrottled software-WebGL lab observations, not physical-device GPU results, Lighthouse, CrUX, INP or Core Web Vitals. Existing adaptive pixel ratios, frame budgets, hidden-tab pause, 24Hz publication budget and on-demand reduced motion should remain untouched. ScrollProvider's existing global RAF already exists; do not add another permanent loop for prerendering.

## 9. Protected-system status

Initial Git status was clean. SHA256 comparison covers 743 existing tracked files and records 0 changes in protected-after.json. Historical reports/evidence are preserved. Production source, route resolver/allowlist, SEO bootstrap/prerender generator, App/main integration, scenes, homepage, catalogue, basket logic, tokens, metadata, public assets and package files are untouched. No dependencies installed. Existing dist was inspected, not rebuilt by npm run build; isolated Vite output goes only below the diagnostic directory. Existing crawler files and production output were not overwritten.

node scripts/check-seo.mjs passes for existing 19 canonical documents and exactly four prerender markers. All four dist fruit documents remain empty-root/client-rendered. git check-ignore confirms diagnostic output is ignored. No deployment, Search Console action or live indexing claim is made.

## 10. Smallest safe implementation strategy — recommendation only

Proceed first with a separate shared Fruit Intelligence DOM preparation task, keeping the production allowlist unchanged. Reuse existing config text and FruitFallback presentation as the static content foundation. Establish one semantic fruit heading and one persistent page root, with inspection descriptions readable before JS, genuine collection hrefs, and an accessible renderer-free scene description. Reuse existing narrative data for any missing educational sections; do not invent or rewrite claims. Preserve all fruit-specific visual configuration.

A prepared component must render the **same initial representation** on server and first client render. Do not switch implementations based on typeof window, render only a reading page for crawlers, add a second fallback H1 under noscript, or immediately hydrate a reading tree with the interactive tree. Scene enhancement can be enabled after matching hydration, using the existing FruitViewer/canvas/factory ownership. The semantic heading and page root should survive enhancement. Whether the reading grid is retained in flow or becomes an accessible reading mode requires an explicit DOM/visual decision; simply appending it changes document height and therefore the existing scroll choreography. This investigation has not proven that combined layout.

After DOM preparation passes, the later integration can extend the existing typed snapshot/preload pattern to fruit pages, preload the same actual page before SSR/hydration, and use existing production CSS extraction where required. Reuse App/providers/navigation and current SEO definitions. No new SSR framework, route resolver, renderer, scene builder, camera system, scroll engine or dependency is justified.

## 11. Recommended phases and acceptance gates

1. **Shared DOM preparation, no prerender rollout.** One existing-copy H1; visible static inspection descriptions; accessible reading representation; real path links; deterministic zero-progress initial state; all four sizes with JS disabled and actual font-loaded production CSS; no visual redesign. Preserve interactive composition and scroll length. Gate against approved screenshots and section geometry.
2. **Isolated prepared-component proof.** All four fruits render with ReactDOMServer without shims, exactly one H1 and expected narrative/anchor coverage. Hydration preserves root/first-child/page/H1 identity at all sizes, normal/reduced motion, no WebGL and fallback-query cases. Zero React recovery/runtime errors; one existing renderer at most. Verify static content remains usable on failure.
3. **Explicitly authorized production integration.** Extend existing allowlist/bootstrap and synchronous page preload contract only after the preceding gate. Test actual generated App/main documents, anonymous basket restoration, direct access/refresh, Back/Forward, hash/query reconciliation and runtime metadata. Keep the four existing prerendered routes green and enforce exact intended rollout in check-seo.
4. **Scene regression and release acceptance.** Existing initial zero, native scroll/camera/annotation behavior, drag, final CTA, Reading/Try 3D transitions, reduced motion, hidden tabs, teardown and context-loss handling. Compare known Kinnow/Anaar timing failures with preserved baselines; do not silently change their thresholds or reopen historical fixes. No simultaneous duplicate canvas/renderer or extra permanent RAF. Release/production verification requires a separate authorized task.

## 12. Route-by-route editorial and SEO evidence

The following values are copied from actual registry/config and shared SEO definitions. They are an inventory, not newly verified fruit or commercial claims. Exact descriptions/acts are also preserved in content-map.json.

### /fruit-intelligence/chaunsa

- Existing reading H1: **Read a Chaunsa / the way a buyer reads it.**. Default scene-shell version is a div, not H1.
- Name: Chaunsa Mango; configured variety: Summer Honey Chaunsa (variety is data, not rendered by these page components).
- Title: Chaunsa Mango — Fruit Intelligence | BAAGH.
- Meta description: Explore Chaunsa Mango with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view.
- Canonical: https://baagh.vercel.app/fruit-intelligence/chaunsa. Existing social metadata uses /images/fruit/mixed.webp.
- Primary configured description: One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.
- Reading summary source: Your device can’t run the interactive inspection. The same assessment — aroma, skin, firmness, ripeness — is written out below in full.
- Rendered summary substitutes only the component's existing “A lighter reading view.” prefix where applicable.
- Structured data: Organization, WebSite, WebPage; no Product/Offer.
- Native scroll spacer: 819.9999999999999vh.

| Educational section | Existing headline | Existing body |
|---|---|---|
| CHAPTER TWO — FRUIT INTELLIGENCE | Read a Chaunsa / the way a buyer reads it. | One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection. |
| 01 — THE INSPECTION | Four judgements, in this order. | Aroma first, then skin, then firmness at the shoulder — colour is confirmation, not evidence. |
| 02 — THE CUT | One pass, beside the stone. | The cheek comes away in a single stroke. How cleanly it releases tells us how the fruit was grown and held. |
| 03 — WHAT IS INSIDE | Skin, flesh, stone. | Held apart for a moment. Each part answers a different question about the same fruit. |
| 04 — FRUIT INTELLIGENCE | What our buyers note. | Prototype wording — the categories, not the verdict. Hover a marker to read it in full. |
| 05 — THE SELECTION TEST | Not every mango that looks beautiful is the mango we choose. | Three sound fruits. One carries the aroma, the gradation and the weight together — that is the one we send. |
| 06 — WHOLE AGAIN | A judgement made a thousand times a day. | Every crate is read this way before it leaves the packhouse. |
| Final invitation | The Chaunsa we choose for you. | Selected with the judgement of experienced fruit buyers. |

| Characteristic / annotation | Existing description |
|---|---|
| AROMA | Assessed at the stem end, before anything else. |
| SKIN | Taut and lightly speckled. Never wrinkled. |
| FIRMNESS | A slight give at the shoulder. Not softness. |
| RIPENESS | Gradation across the fruit, not a flat yellow. |
| FLESH | Colour, texture and maturity, read together. |
| FIBRE | Smooth at the cut face is what we want. |
| STONE | Slim, with generous flesh held around it. |

The default diagnostic contains all 8 act bodies but zero annotation descriptions and zero H1s. Reading diagnostic contains all 7 listed descriptions and one H1, but not all act bodies. Existing local production HTML contains neither body representation. Header navigation and incoming product/cabinet links follow the shared mapping above. Outgoing study CTAs are EXPLORE EVERYDAY FRESH → #everyday-fresh and EXPLORE SIGNATURE COLLECTION → #signature-collection.

### /fruit-intelligence/kinnow

- Existing reading H1: **Judge a Kinnow / before you peel it.**. Default scene-shell version is a div, not H1.
- Name: Kinnow Mandarin; configured variety: Punjab Seeded Kinnow (variety is data, not rendered by these page components).
- Title: Kinnow Mandarin — Fruit Intelligence | BAAGH.
- Meta description: Explore Kinnow Mandarin with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view.
- Canonical: https://baagh.vercel.app/fruit-intelligence/kinnow. Existing social metadata uses /images/fruit/mixed.webp.
- Primary configured description: One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.
- Reading summary source: Your device can’t run the interactive inspection. The same assessment — colour, button, weight, give — is written out below in full.
- Rendered summary substitutes only the component's existing “A lighter reading view.” prefix where applicable.
- Structured data: Organization, WebSite, WebPage; no Product/Offer.
- Native scroll spacer: 819.9999999999999vh.

| Educational section | Existing headline | Existing body |
|---|---|---|
| CHAPTER THREE — FRUIT INTELLIGENCE | Judge a Kinnow / before you peel it. | One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection. |
| 01 — THE INSPECTION | Four judgements, before the peel. | Weight in the hand first. Then colour, then the button, then how the skin answers a thumb. |
| 02 — THE PEEL | How it releases tells us plenty. | A good Kinnow lets its rind away cleanly, in one piece, leaving the flesh dry and the fingers oiled. |
| 03 — WHAT IS INSIDE | Ten segments, held together. | They should part willingly and hold their shape. Segments that collapse have been picked too late. |
| 04 — THE CROSS SECTION | Cut across, it cannot hide anything. | Ten wedges packed to the rind, a small tight core, juice standing at the face. This is the test that settles a crate. |
| 05 — THE SELECTION TEST | Colour is the easiest thing to admire. Weight is the harder truth. | Three sound fruits. One is heavy for its size, tight at the button and even in colour — that is the one we send. |
| 06 — WHOLE AGAIN | Read once, then repeated crate after crate. | The same four judgements, made by hand, before anything is packed. |
| Final invitation | The Kinnow we choose for you. | Selected with the judgement of experienced fruit buyers. |

| Characteristic / annotation | Existing description |
|---|---|
| COLOUR | Deep and even, with fine pebbling. |
| BUTTON | The stem end stays tight and fresh, never dry. |
| WEIGHT | Heavy for its size. Juice has weight. |
| GIVE | Springy under the thumb. Never slack. |
| RIND | Thin, tight, and clean off the flesh. |
| MEMBRANE | Fine enough to eat without noticing. |
| SEEDS | Kinnow carries seeds. We count them. |
| JUICE | Vesicles standing full at the cut face. |
| CORE | Tight and small — the segments carry the fruit. |

The default diagnostic contains all 8 act bodies but zero annotation descriptions and zero H1s. Reading diagnostic contains all 9 listed descriptions and one H1, but not all act bodies. Existing local production HTML contains neither body representation. Header navigation and incoming product/cabinet links follow the shared mapping above. Outgoing study CTAs are EXPLORE EVERYDAY FRESH → #everyday-fresh and EXPLORE SIGNATURE COLLECTION → #signature-collection.

### /fruit-intelligence/apple

- Existing reading H1: **An apple gives away / more than it means to.**. Default scene-shell version is a div, not H1.
- Name: Apple; configured variety: Crimson Crisp Apple (variety is data, not rendered by these page components).
- Title: Apple — Fruit Intelligence | BAAGH.
- Meta description: Explore Apple with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view.
- Canonical: https://baagh.vercel.app/fruit-intelligence/apple. Existing social metadata uses /images/fruit/mixed.webp.
- Primary configured description: One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection.
- Reading summary source: Your device can’t run the interactive inspection. The same assessment — skin, colour, stem, firmness — is written out below in full.
- Rendered summary substitutes only the component's existing “A lighter reading view.” prefix where applicable.
- Structured data: Organization, WebSite, WebPage; no Product/Offer.
- Native scroll spacer: 900vh.

| Educational section | Existing headline | Existing body |
|---|---|---|
| CHAPTER FOUR — FRUIT INTELLIGENCE | An apple gives away / more than it means to. | One fruit, examined properly. Drag to turn it in the light; scroll to follow the inspection. |
| 01 — THE INSPECTION | Four judgements, before the knife. | Skin first, then how the colour is laid down, then the stem, then how the fruit answers a thumb. |
| 02 — THE SLICE | One pass, straight down through the core. | A sound apple resists the blade and then parts cleanly. You can hear it before you see it. |
| 03 — THE WEDGES | Six faces, all telling the same story. | Even colour across every cut, a thin bright skin line, and moisture standing on the surface. |
| 04 — THE CROSS SECTION | Cut lengthwise, nothing stays hidden. | The core reads as a closed butterfly, the flesh cream against it. This is where a bad crate is caught. |
| 05 — CORE AND SEEDS | The part nobody eats, and we still read it. | Dark, filled seed chambers say the fruit was left on the tree long enough. Pale ones say it was not. |
| 06 — THE SELECTION TEST | Not every apple that looks good is the apple we choose. | Three sound fruits. One has the colour laid down evenly, a supple stem and no give at all — that is the one we send. |
| 07 — WHOLE AGAIN | Read once, then repeated crate after crate. | The same judgements, made by hand, before anything is packed. |
| Final invitation | The apple we choose for you. | Selected with the judgement of experienced fruit buyers. |

| Characteristic / annotation | Existing description |
|---|---|
| SKIN | Tight and waxy, with fine pale freckling. |
| COLOUR | Striped crimson over a gold shoulder — never flat. |
| STEM | Still attached, still supple. It dates the pick. |
| FIRMNESS | No give at all under the thumb. |
| CUT FACE | Crisp and beaded with moisture, not mealy. |
| FLESH | Cream, close-grained, green nearer the core. |
| CORE | Closed and dry. Nothing browning at the walls. |
| SEEDS | Dark and plump — the fruit matured on the tree. |
| CHAMBERS | Five, evenly filled. A sign of even pollination. |

The default diagnostic contains all 9 act bodies but zero annotation descriptions and zero H1s. Reading diagnostic contains all 9 listed descriptions and one H1, but not all act bodies. Existing local production HTML contains neither body representation. Header navigation and incoming product/cabinet links follow the shared mapping above. Outgoing study CTAs are EXPLORE EVERYDAY FRESH → #everyday-fresh and EXPLORE SIGNATURE COLLECTION → #signature-collection.

### /fruit-intelligence/anaar

- Existing reading H1: **Anaar, before anyone / claims anything.**. Default scene-shell version is a div, not H1.
- Name: Anaar; configured variety: Kandhari Anaar (variety is data, not rendered by these page components).
- Title: Anaar — Fruit Intelligence | BAAGH.
- Meta description: Explore Anaar with BAAGH Fruit Intelligence. Inspect its outer characteristics and inner anatomy through an interactive study or the reading view.
- Canonical: https://baagh.vercel.app/fruit-intelligence/anaar. Existing social metadata uses /images/fruit/mixed.webp.
- Primary configured description: One pomegranate, lit and left alone. Drag to turn it in the light; scroll to follow the inspection.
- Reading summary source: Your device can’t run the interactive inspection. The same assessment — skin, crown, chambers, arils — is written out below in full.
- Rendered summary substitutes only the component's existing “A lighter reading view.” prefix where applicable.
- Structured data: Organization, WebSite, WebPage; no Product/Offer.
- Native scroll spacer: 1000vh.

| Educational section | Existing headline | Existing body |
|---|---|---|
| 01 — WHOLE FRUIT | Anaar, before anyone claims anything. | One pomegranate, lit and left alone. Turn it: the skin records the season it had — where the sun sat, how long it held on the tree. |
| 02 — INSPECTION | What the hand knows first. | A buyer reads five things before the fruit is ever cut. None of them are printed on the box. |
| 03 — THE CROWN | Read the crown first. | The calyx dries as the fruit matures. Splayed, leathery, brittle at the tips — it is the earliest honest signal a pomegranate gives. |
| 04 — THE OPENING | It is opened, not broken. | Score the skin, follow the ridges the fruit already has, and it comes apart along its own chambers. Force it and you lose the evidence. |
| 05 — INSIDE | Chambers, not compartments. | Pale membrane divides the fruit into uneven rooms. No two pomegranates are partitioned the same way — which is exactly why the inside has to be looked at. |
| 06 — THE ARILS | Hundreds of small decisions. | Each aril is a seed inside its own jacket of juice. Size varies, colour varies. What should not vary is how tightly they are packed. |
| 07 — STRUCTURE | The inside is the evidence. | Five things we look at once the fruit is open. Read conservatively, and against the crate it came from. |
| 08 — SELECTION | Good. Better. Best. | Three pomegranates that would all pass at a market stall. Not every anaar that looks good from the outside is the one we choose. |
| 09 — WHOLE AGAIN | Closed, and still known. | The fruit goes back together. What changed is what you now know to look for — and who did the looking before it reached you. |
| 10 — SELECTION, PACKED | The Anaar we choose for you. | Selected with the judgement of experienced fruit buyers. |

| Characteristic / annotation | Existing description |
|---|---|
| SKIN | Matte, taut, finely pored |
| WEIGHT | Heavy for its size |
| FIRMNESS | No give at the shoulder |
| CROWN | Dry, intact, closed |
| COLOUR | Uneven — sun-worked, not painted |
| SEPALS | Six to eight, dried open |
| TIPS | Brittle, slightly inturned |
| NECK | Short, unsplit |
| ARILS | Packed edge to edge |
| MEMBRANE | Thin, pale, unbruised |
| COLOUR | Garnet through to deep ruby |
| JUICINESS | Arils sit taut, not shrunken |
| SEED | Small core, soft bite |
| GOOD | Sound fruit. Lighter in the hand. |
| BETTER | Even colour. Crown a little green. |
| BEST | Squared shoulders. Dense, dry-crowned. |

The default diagnostic contains all 10 act bodies but zero annotation descriptions and zero H1s. Reading diagnostic contains all 16 listed descriptions and one H1, but not all act bodies. Existing local production HTML contains neither body representation. Header navigation and incoming product/cabinet links follow the shared mapping above. Outgoing study CTAs are EXPLORE EVERYDAY FRESH → #everyday-fresh and EXPLORE SIGNATURE COLLECTION → #signature-collection.

## 13. Evidence index and reproduction

All paths below are relative to ignored test-results/phase2c-feasibility/:

- generate.mjs, component.tsx, client.tsx: actual-component Node SSR and isolated Vite build.
- ssr-results.json: original render results; string presence there is a literal escaped-HTML check. html-summary.json corrects entity escaping and is authoritative for content counts.
- content-map.json: exact configuration/editorial/SEO inventory.
- cold-app.mjs, cold-app-results.json: fresh-module App/Suspense probes, unsupported diagnostic snapshots only.
- *-experience.html, *-reading.html: raw actual-component SSR output; built/ contains separately bundled diagnostic documents/assets.
- browser.mjs, browser-results.json: 32 no-JS/before-hydration/after-hydration cases with text, links, dimensions, scene diagnostics, node identities and error arrays.
- *-nojs.png: all 32 full-page JavaScript-disabled captures.
- interaction.mjs, interaction-results.json: four-fruit mobile reduced-motion progression and Reading view teardown observations.
- nojs-links.mjs, nojs-links.json: explicit JavaScript-disabled reading CTA fragment-navigation checks.
- protected-before.json, protected-after.json, protect.mjs: source/evidence preservation.

Reproduce from repository root with node test-results/phase2c-feasibility/generate.mjs, node test-results/phase2c-feasibility/cold-app.mjs, node test-results/phase2c-feasibility/summarize.mjs and node test-results/phase2c-feasibility/browser.mjs. These write only diagnostic output, except the optional report-authoring helper. Chrome defaults to the existing C:/Program Files/Google/Chrome/Application/chrome.exe. The first restricted browser attempt returned ERR_NETWORK_ACCESS_DENIED on localhost; permitted local-server retry completed. Initial harness-only import/JSX errors were corrected before successful rendering and are not application SSR failures. No application SSR exception was concealed.

**Work stops at investigation. Production implementation requires a separate approval and task.**
