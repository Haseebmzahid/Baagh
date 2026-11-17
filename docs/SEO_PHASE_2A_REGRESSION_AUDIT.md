# BAAGH Phase 2A final regression audit

Date: 16 November 2026 (America/Los_Angeles; some logs use 17 November UTC).

**New regressions: PASS — none demonstrated in the audited coverage.** The existing browser suite is **FAIL**, because two documented graphics assertions still time out. This is a regression comparison, not an all-green graphics certification. No application code was changed, and nothing was committed, pushed or deployed.

## Results by area

| Area | Regression result | Evidence and limits |
| --- | --- | --- |
| Cinematic homepage | PASS | All nine stations, chapter progression and final commercial CTA passed at desktop/tablet/mobile with reduced motion; mobile also passed with normal motion. Desktop/tablet normal-motion cue-opacity timeouts reproduced on the preserved Phase 1 build. |
| Fruit Intelligence | PASS | All four fruits enter at progress 0/scroll 0 and pass gradual reduced-motion progression at all three sizes. Normal-motion Chaunsa/Apple pass at all sizes; all four mobile engines pass. Kinnow/Anaar desktop/tablet settling timeouts are baseline issues, detailed below. |
| Fruit cabinet/header | PASS | Open/close, focus return, Enter/Tab/ArrowRight/Escape, Anaar selection, logo navigation and history pass at all three sizes. Four specimen canvases are present. |
| Commercial pages | PASS | Everyday Fresh, Signature, all four Product Detail pages and Our Story pass direct access, refresh, readable headings and overflow checks at all three sizes. Main-page navigation and Back/Forward pass. |
| Basket | PASS | Open/close, pack selection, quantity increase/decrease, saved pack/quantity restoration after refresh, and basket-page navigation/history pass at all three sizes. |
| Rendering isolation | PASS | Only canonical `/product/mangoes/chaunsa` has the prerender marker and meaningful initial root body. The other 18 canonical documents and generated aliases retain their intended empty initial React root/client-rendered mode. |
| New console/runtime errors | PASS | Supplemental audit contexts recorded no console or page errors. Graphics assertion timeouts remain failures, not newly observed JavaScript exceptions. |

## Environment and method

Read the Phase 1 and Phase 2 reports and preserved diagnostic evidence. Started with Git status and retained all existing local Phase 2A work. Compared against the preserved Phase 1 build in `test-results/phase2a-baseline`, the documented Phase 1 graphics results, and the existing accepted Phase 2A screenshot/geometry evidence.

Browser checks used actual installed headless Chrome with SwiftShader software WebGL. Supplemental viewports were **1440×900, 768×1024 and 375×812**. The unchanged existing Playwright projects additionally use their configured desktop/mobile settings, including mobile device scale factor 2. The separate tablet graphics project used 768×1024, touch/mobile emulation and device scale factor 1. These are local lab results, not physical-device, FPS, field Core Web Vitals or live-deployment certification.

Temporary audit-only scripts/configurations were created under ignored `test-results/seo-phase2a-audit/`; no production tests or application files were edited. Local HTTP servers served actual built documents, assets and existing Vercel route mappings. No deployment was performed.

## Commands actually run

| Command | Result |
| --- | --- |
| `npm run build` | **PASS**; TypeScript, Vite, isolated Chaunsa generation and build SEO validation. Existing large shared Three.js chunk warning remains. |
| `npm run check:types` | **PASS** |
| `npm run test:seo` | **PASS** |
| `npm test` | **PASS — 34/34** |
| `npm run test:browser` (JSON reporter/output options only) | **FAIL — 16 passed, 2 failed, 0 skipped**. Failures: desktop Kinnow and Anaar, existing 20-second progress-settling assertion. All six SEO browser tests passed. |
| Separate unchanged `production.spec.ts`, audit-only tablet project | **FAIL — 4 passed, 2 failed, 0 skipped**. Same Kinnow/Anaar settling assertion. Chaunsa, Apple, information pages and reduced-motion/context-loss/basket tests passed. |
| Same two tablet graphics tests against preserved Phase 1 build | **FAIL — 0 passed, 2 failed** at the same 20-second assertion, confirming those tablet failures predate Phase 2A. |

Desktop/mobile graphics tests ran as part of the full browser command; the graphics suite was also run separately at tablet size. No test failure was hidden or converted to a pass.

Logs and parsed results: `verification/seo-phase-2a-audit/{build,types,seo,unit}.log`, `browser-full.json`, `graphics-tablet.json`, and `graphics-tablet-baseline.json`.

## Supplemental functional coverage

- **Commercial:** 21 direct-page/refresh cases across seven pages and three sizes passed. Each checked HTTP 200, correct raw rendering mode, visible H1 and no horizontal overflow. Existing SEO tests also covered all 19 canonical routes and their metadata/refresh behavior.
- **Navigation:** Everyday Fresh → Signature → Our Story → Everyday Fresh → header Order → Basket → Back/Forward passed at every size. Cabinet selection navigated into Anaar at progress 0, and Back returned to Chaunsa. Header logo navigation entered the cinematic homepage with a working WebGL context and scroll 0.
- **Basket:** selected Chaunsa 2kg, quantity 2, added to drawer, increased to 3, decreased to 2, closed/reopened and refreshed. Saved `{productId:'chaunsa', packId:'2kg', quantity:2}` survived at all three sizes. No application persistence logic was changed during this audit.
- **Cabinet/keyboard:** final corrected run passed 3 viewport cases plus 3 empty-console checks. Tested pointer closure, trigger focus return, Enter reopening, Tab into the cabinet, ArrowRight, Escape, then specimen selection.
- **Fruit Intelligence:** 12 fruit/viewport cases passed with reduced motion. Checked initial progress/scroll 0, native scroll samples at .025, .05, .1, .2, .35, .5, .65, .8, .95 and 1, monotonic diagnostics within the existing .015 tolerance, final CTA, one valid scene canvas, and Reading view removal of that canvas. Existing normal-motion tests separately checked engine selection, scroll completion and scene disposal where they passed.
- **Homepage:** reduced-motion functional run passed all nine station checkpoints at every size, one valid WebGL canvas/program, active chapter labels where displayed, and final CTA navigation. Mobile normal-motion run also passed all nine checkpoints. Desktop/tablet normal-motion limitations are documented below rather than claimed passed.

Evidence: `manual/results-all-all.json`, final `manual/results-cabinet-all.json`, and final `homepage-reduced/results-homepage-all.json`. The final homepage functional rerun used no screenshots to avoid a browser-driver screenshot timeout; earlier actual screenshots remain available.

## Baseline graphics issues and audit limitations

1. **Desktop Kinnow and Anaar:** the same `production.spec.ts:28` progress-settling timeout documented in `verification/seo/browser-full-suite-summary.json` remains. Not a newly demonstrated regression.
2. **Tablet Kinnow and Anaar:** same assertion failed in this audit and then failed again against the preserved Phase 1 build using the same viewport/configuration. Baseline-reproduced; not attributed to Phase 2A.
3. **Historical mobile reduced-motion/context-loss final CTA assertion:** documented in Phase 1; **did not recur** in this full run. This audit does not claim its underlying issue was fixed.
4. **Homepage desktop/tablet normal-motion cue visibility:** the supplemental 30-second cue-opacity assertion failed at the second station on both current and preserved Phase 1 builds. Mobile normal motion and all three reduced-motion journeys passed. The exact timing cause was not diagnosed. Complete desktop/tablet normal-motion progression certification remains unavailable from this run.
5. **Cabinet caption:** the existing caption says three specimens while the registry renders four. Phase 1 already contains the same caption/registry mismatch. Left unchanged.

Initial supplemental failures caused by audit assumptions were retained in the evidence: expecting three cabinet canvases instead of four, querying specimen links as buttons, and checking chapter CSS opacity before its transition completed. Corrected audit-only selectors/waits subsequently passed. A baseline-server working-directory startup error and an intermediate screenshot timeout are also retained. These are harness limitations, not demonstrated application regressions. The initial mixed supplemental run therefore remains recorded as 43 passes/5 failures; its cabinet failures are superseded by the corrected final cabinet run, and its desktop/tablet homepage failures by the baseline comparison above.

## Visual and protected-system review

Inspected current desktop/tablet/mobile commercial and cabinet captures and the nine-station mobile contact sheet. No obvious new visual regression was observed in the inspected captures. Existing Phase 2A baseline/initial-HTML/hydrated pixel and geometry comparisons remain preserved; this audit did not replace them or claim a new exhaustive pixel comparison of every animated frame.

Useful captures: `verification/seo-phase-2a-audit/manual/commercial-cabinet-contactsheet.jpg`, `manual/mobile-nine-stations-contactsheet.png`, individual commercial/cabinet/station captures under `manual/`, and graphics captures under `graphics-full-run/` and `graphics-tablet-run/`.

Protected scene/config/data/navigation source paths have no diff from Phase 1. The built shared Three.js module is byte-identical to the preserved Phase 1 build (SHA256 `e534bdf4b582ac9a9af07288af7ab9bf0fdb31a05bc6634d65f3cf6066cbb483`). No geometry, textures, materials, camera keyframes, progress calculations, scroll restoration, WebGL context-loss handling or design tokens were edited. See `protected-systems.json`.

## Files changed during this audit

- **Application/source/configuration files modified: none.** All 406 pre-existing tracked and nonignored local files captured at audit start have identical final SHA256 hashes, including uncommitted Phase 2A work and previous diagnostic reports/evidence. See `verification/seo-phase-2a-audit/file-preservation.json`.
- Created this report: `docs/SEO_PHASE_2A_REGRESSION_AUDIT.md`.
- Created audit logs, JSON results and screenshots under `docs/verification/seo-phase-2a-audit/`.
- Created ignored audit helpers/backups/test output under `test-results/seo-phase2a-audit/` and regenerated ignored build output.

The existing browser suite writes into `docs/verification/performance-pages/`. Fresh results were archived into the new audit evidence, then that directory was restored byte-for-byte to its starting state. Audit-created tablet files in the old evidence directory were archived and removed; original user evidence was preserved. Existing `docs/SEO_PHASE_2.md` was not modified.

**No commit, push, deployment, scene fix or expansion of prerendering was performed. Audit stopped here.**
