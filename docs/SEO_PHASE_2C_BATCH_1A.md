# BAAGH — SEO Phase 2C Batch 1A

18 November 2026. Shared semantic DOM and no-JavaScript preparation only. No commit, push or deployment.

## Scope and original blockers

The Phase 2C feasibility report is the baseline for the content inventory: Chaunsa 8 acts/7 descriptions; Kinnow 8/9; Apple 9/9; Anaar 10/16. Previously the scene shell had zero H1s, later acts stayed hidden without JavaScript, annotations did not exist until projected points arrived, and Reading view replaced the entire page branch. Its collection links were fragments with no matching sections. The cold App lazy boundary remains a separate future integration concern.

Reviewed the feasibility report, Phase 2A regression audit, both Phase 2B Batch 1 reports, Product schema remediation, the shared page/shell/viewer/annotations/fallback, registry, all four configs, existing scene factories/builders and lifecycle, and existing browser gates. Historical source/evidence is retained.

## Shared representation

FruitIntelligence now always renders the same page root, silhouette, narrative shell and characteristic records. Reading and graphics-failure states no longer return a different content tree. Only the existing FruitViewer is conditionally unmounted/remounted through its existing lifecycle. The page and H1 do not have a mode-dependent key.

FruitExperienceShell renders one H1 using the existing config.headline from Reading view; remaining narrative headings are H2s inside sections. Each act and body is emitted once from config.acts. Existing act opacity windows, CTA windows, typography and spacer values remain in the interactive presentation. Anaar's reading headline contains a newline absent from its original interactive headline; a fruit-scoped interactive whitespace rule collapses it, preserving the original wrapping without changing the copy.

FruitAnnotations renders every nonempty anchor record once. A record receives the existing projected placement when available; no server-side camera solution or artificial projected points are supplied. The existing placement calculations, activation windows, connector mathematics and trio behavior are retained. Inactive cards remain in the DOM but are hidden in interactive mode. The same cards form an accessible list in static/Reading mode. There is no appended duplicate description grid and no second reading page.

FruitFallback is refactored to supply only the original CSS silhouette, with the fruit name as its accessible image label. Its former duplicate headline/grid/CTAs are supplied by the persistent shared shell/list. The narrative opening supplies the fruit introduction; no configured variety or sourcing claims were promoted into visible copy.

## Progressive presentation and geometry

Scoped fruitIntelligence.css supplies natural reading flow when the page has data-fi-mode="reading". It exposes every narrative act and characteristic, hides the interactive viewer/loading state, chapter rail, hint, connectors and scene spacer, and displays the existing silhouette. It uses the existing color and typography values and a responsive characteristic grid. Static top padding clears the header and mode controls, correcting the historical silhouette/header overlap. Visual inspection caught that the shared fixed atmospheric layers could cover an unpositioned static silhouette. The silhouette now establishes a relative z-index of 2, above those backgrounds, without changing flow or interactive geometry. All 16 final-static/ captures were repeated after this correction. The complete reading layout is necessarily longer than the old partial fallback because it now contains every narrative section.

In interactive mode the shell keeps its original inline fixed/absolute positioning. The silhouette is display:none; the viewer wrapper uses display:contents; characteristics remain fixed overlays. Static content therefore contributes no additional interactive scroll height. Spacers remain derived from config.scrollPaceScreens: Chaunsa/Kinnow 8.2 screens, Apple 9, Anaar 10. No scene scroll length is hardcoded in a second engine.

Server and first React render use the same deterministic state and semantic children. A commit ref sets only data-fi-client/data-fi-mode for CSS presentation before the first client paint; an effect supplies the semantic interactive state afterward. The ref reads the existing fallback query only during browser commit, not during rendering. This avoids a CSR reading-layout flash without introducing useLayoutEffect SSR warnings, a head script, a crawler branch or DOM replacement. A future SSR document first presents readable static content until hydration; the subsequent CSS enhancement is deliberate. Delayed-hydration visual timing remains a future actual-App integration gate.

The existing Reading/Try 3D buttons are keyboard-operable native buttons. Reading keeps the root/H1/content nodes and unmounts the viewer; Try 3D resets scroll/progress/points and mounts that same existing viewer. Controls are hidden without JavaScript. No new animation loop, canvas renderer, camera or dependency was introduced.

## CTA corrections

Only the four fruit configs' CTA destinations changed: #everyday-fresh → /everyday-fresh and #signature-collection → /signature. Anchor text is unchanged. The prepared static documents can navigate to the actual existing collection documents without a hash handler. Unrelated navigation and the route resolver are untouched.

## Files changed

- src/components/fruit-intelligence/FruitIntelligence.tsx: persistent composition, presentation flags and existing mode controls.
- src/components/fruit-intelligence/FruitExperienceShell.tsx: semantic headings/sections and presentation hooks.
- src/components/fruit-intelligence/FruitAnnotations.tsx: persistent characteristic records, accessible list and existing projected placements.
- src/components/fruit-intelligence/FruitFallback.tsx: reuse the original labelled silhouette without duplicate content.
- src/components/fruit-intelligence/fruitIntelligence.css: scoped static/Reading flow and enhancement presentation.
- src/components/fruit-intelligence/fruits/{chaunsa,kinnow,apple,anaar}/config.ts: two href corrections each.
- This report. All harnesses, raw HTML, assets, logs, JSON and screenshots are under ignored test-results/phase2c-batch1a/.

## Node and browser evidence

The isolated diagnostic imports actual components, BrandProvider, ScrollProvider, anonymous BasketProvider, SiteHeader, actual CSS and index.html's production font stylesheet links. It uses ReactDOMServer without window/document shims and hydrates the identical composition. No production App or route integration is substituted. This establishes component readiness, not production prerender availability.

The static acceptance probe checks actual section/card elements against the existing configs, one H1, complete visible acts/descriptions, silhouette, hidden viewer, hrefs and document width. It does not count strings in metadata as body content. Hydration probes retain original root, header/root-first-child, page and H1 references and collect console/page/recoverable errors.

| Fruit | Acts | Characteristics | 1440×900 | 768×1024 | 390×844 | 375×812 |
|---|---:|---:|---|---|---|---|
| Chaunsa | 8 | 7 | PASS* | PASS* | PASS* | PASS* |
| Kinnow | 8 | 9 | PASS* | PASS* | PASS* | PASS* |
| Apple | 9 | 9 | PASS* | PASS* | PASS* | PASS* |
| Anaar | 10 | 16 | PASS* | PASS* | PASS* | PASS* |

*Completed semantic/static and initial hydration diagnostic: 16/16 static cases and 16/16 hydration cases, one original H1 retained, root/page retained, no recoverable/console/page errors and no document overflow. Final-source repetition and full graphics outcomes are recorded below; these cells are not an all-graphics-regression certification.

## Scene and visual evidence

baseline-dist/ preserves the original production build. baseline/ contains actual application initial scene, inspection, final-progress metrics and Reading captures at all 16 fruit/viewport combinations. Production font links were included and document.fonts.ready was awaited; font status records distinguish loaded faces from unused Unicode subsets. These are installed Chrome/SwiftShader captures, not physical-device evidence or pixel-perfect certification.

Intermediate after/ captures preserve 15 completed combinations; all recorded interactive document heights and canvas rectangles match baseline. The first comparison identified Anaar's forced newline and led to the whitespace correction described above. One screenshot timed out after fonts loaded. accepted/ captures and comparison results provide the final-source interactive outcome below; final-static/ provides the final silhouette-layer static outcome; partial runs are retained rather than overwritten as successful evidence.

The existing FruitViewer, scene factories, geometry/textures, camera keys/solvers, sceneLoop, performance helpers and disposeScene are unmodified. Their existing deferred initialization, pointer/scroll/resize listeners, hidden-tab scheduling, reduced-motion behavior, cancellation and context-loss/disposal paths remain the owners of graphics behavior. No second scene for Reading view is created.

## Validation and limitations

- npm run build: PASS for the final source, including exactly four production prerenders; existing shared Three.js chunk warning remains.
- npm run check:types: PASS.
- npm run test:seo: PASS, 19 canonical documents and exact four-body scope.
- npm test: PASS, 35 tests.
- Existing Chaunsa production acceptance gate: PASS at all four viewport sizes, including saved basket/aliases and empty error arrays. Fresh output is archived; original evidence is restored at the end.
- Full browser suite: **16 passed, 2 failed, 0 skipped, 0 flaky** in 720.7 seconds. Only desktop Kinnow/Anaar fail the unchanged 20-second progress-settling assertion. No additional final-suite failure appeared. This full run preceded the final static-only pointer/keyboard and silhouette-layer corrections; build/types/SEO/unit and focused semantic, navigation and scene tests are repeated for that final correction. Initial launch failed because the Playwright bundled browser is absent; retry uses the supported installed-Chrome environment setting. An overlapping build invalidated one run (13 passed/3 failed/2 skipped): two documented settling failures plus a transient missing seo-manifest.json and dependent skips. That run is preserved and is not final acceptance evidence.
- Focused scene probe: initial zero, scroll .2/.6/1, Reading teardown and Try 3D with persistent H1/page. The first Apple .2 sample missed during initialization; later targets passed. Its original result is preserved in interaction-first.json; the repeat explicitly allows the normal initialization/store update to settle before sending scroll. Historical test thresholds are unchanged.

No blanket graphics PASS is claimed. Desktop Kinnow/Anaar normal-motion settling timeouts are documented baseline failures; any other final failure must be evaluated separately. Forced context-loss/resource disposal coverage comes from the existing full suite rather than source hashes alone. Lab captures do not establish real-device FPS, field Core Web Vitals or every-frame visual equivalence.

## Protected systems and rollout boundary

The production prerender allowlist remains exactly /product/mangoes/chaunsa, /everyday-fresh, /signature and /our-story. Fruit Intelligence production HTML still has empty React roots and remains client-rendered. No changes to bootstrap.ts, prerender.tsx, build-seo.mjs, App/main prerender/hydration integration, route resolver, SEO definitions, Product/Offer policy, crawler files, homepage, catalogue, basket logic, design tokens, scene builders or dependencies.

before.json and protected.json compare existing tracked-file hashes. original-verification/ preserves pre-existing evidence; fresh-verification/ archives changed test outputs before original files are restored. Existing Phase 2C feasibility report and ignored feasibility evidence remain intact. No commit, push or deployment occurred. Production prerender integration requires a separate task after reviewing this preparation and its bounded evidence.

## Evidence index

All diagnostic paths are under ignored test-results/phase2c-batch1a/:

- baseline-dist/, baseline/results.json and baseline/*.png: original actual application/build evidence, all 16 combinations.
- after/ and final/: retained partial comparison runs, including screenshot timeouts.
- accepted/: final serial application captures and baseline final-CTA probes.
- visual-comparison.json: heading, viewer, document-height, annotation and CTA geometry comparison.
- component.tsx, client.tsx, generate.mjs, built/, ssr-results.json: actual-component Node and hydration documents, production CSS/font links.
- static-acceptance.json, browser-results.json, cta-navigation.json, interaction-results.json, acceptance.json: final focused contract evidence.
- full-browser-final.json, browser-final-summary.json: complete fixed-build suite; earlier launch/race attempts remain separate.
- build-final-static.log, types-final-static.log, seo-final-static.log, unit-final-static.log and chaunsa-gate.log: required command outcomes.
- before.json, protected.json, original-verification/, fresh-verification/, evidence-restoration.json and production-scope.json: protected source/scope and evidence preservation.

No historical assertion deadline was relaxed. Diagnostic selector mistakes and partial screenshot failures are retained and distinguished from application failures. Final graphics claims remain bounded by the two known failing assertions.

## Final acceptance outcome

acceptance.json passes all focused gates: **4 Node renders, 16 static cases, 16 hydration cases, 32 actual JavaScript-disabled collection navigations, 4 pointer/scroll/Reading/Try 3D/disposal cases and 16 visual comparisons**. No recoverable hydration, console or page errors were recorded in the hydration cases. The repeated reduced-motion native-scroll samples all settle at .2, .6 and 1; initial/retry progress is zero. Reading removes the canvas and clears the scene reference; disposed resources report zero geometries, at most one bookkeeping texture and a lost owned context. Pointer interaction removes the initial hint. H1/page identities survive both transitions.

At every viewport, initial interactive H1 and canvas rectangles and document heights match the preserved baseline; final CTA rectangles match exactly, including Anaar after the whitespace correction. Recorded active annotation rectangles remain within one pixel of baseline. All final CTAs reach visible/tabindex-zero state at progress one. These are DOM/geometry and bounded visual checks, not every-frame pixel equality. Final static captures visibly show the existing silhouettes above the shared atmosphere and complete reading content. The static stacking fix does not apply to the hidden interactive silhouette, so it does not invalidate the interactive geometry comparison.

The full browser suite remains **16 PASS / 2 FAIL**, solely the documented desktop Kinnow/Anaar 20-second settling failures. No complete graphics-regression PASS is claimed. Final static corrections were verified by rebuilt actual components, repeated static/hydration/navigation/transition gates and visual review; the complete long suite was not repeated after those static-only corrections. Build/type/SEO/unit gates pass; the latest CSS-layer build is build-static-layer.log. Original evidence is restored, only the eight intended existing source files differ in the 743-file tracked baseline, and no protected-path changes were found. New scoped CSS and this report are the intentional additions; the pre-existing feasibility report remains untouched.

Production prerender integration remains disabled for all four fruit routes. Work stops after this preparation.
