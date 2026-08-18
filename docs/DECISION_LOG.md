# DECISION_LOG.md — Architectural Decision Record

> **Project:** "BAAGH" Cinematic Hero Production Port  
> **Status:** Approved Architecture Decisions  
> **Scope:** Formal decisions resolving reverse-engineering uncertainties prior to production implementation.

---

## Decision 1: Prototype Source Path

- **Uncertainty:** Discrepancy between specified `/prototype/cinematic-hero.html` path in prompt and the actual workspace file `prototype/CinematicHero-offline (1).html`.
- **Chosen Decision:** Use `prototype/CinematicHero-offline (1).html` as the sole authoritative golden prototype source.
- **Why Chosen:** `prototype/CinematicHero-offline (1).html` is the complete, self-contained single-file build containing the authoritative WebGL scene code, CSS grade layers, and DOM overlay.
- **Temporary or Permanent:** Permanent.
- **Trigger for Future Change:** N/A.

---

## Decision 2: WebGL Fallback Architecture

- **Uncertainty:** Prototypes lack WebGL availability checks and context loss handling (`new WebGLRenderer` throwing freezes page over near-black background).
- **Chosen Decision:** Implement an independent `<FallbackView />` component. For V1, render a static visual fallback utilizing Scene 9 framing, color palette, typography hierarchy (`Fruit you never have to doubt.`), and interactive CTAs. Do not build a separate alternative website.
- **Why Chosen:** Ensures graceful degradation for low-end devices, blocked WebGL contexts, or GPU crashes without fragmenting brand messaging or creating duplicate codebase maintenance.
- **Temporary or Permanent:** Architecture is Permanent; fallback asset composition is V1 baseline.
- **Trigger for Future Change:** Addition of pre-rendered high-res static video/image fallback assets generated from the 3D pipeline in future brand releases.

---

## Decision 3: Hand Model Architecture (Station 4)

- **Uncertainty:** `DESIGN.md` §19 identifies procedural sphere/capsule hands as stand-ins for photoreal hand scans.
- **Chosen Decision:** Retain procedural capsule/sphere hands for V1. Decouple Station 4 behind a `<HandsAdapter />` boundary interface (`<ProceduralHandGroup />` vs `<PhotorealHandAdapter />`).
- **Why Chosen:** Guarantees 1:1 visual parity with the golden prototype for V1 while establishing a clean slot to swap in a photoreal GLTF/mesh asset without modifying Station 4 lighting, camera keyframes, or timeline logic.
- **Temporary or Permanent:** Temporary (Procedural implementation); Permanent (Adapter architecture).
- **Trigger for Future Change:** Availability of an approved photoreal 3D hand GLTF model and texture map asset.

---

## Decision 4: Brand Configuration & Token Isolation

- **Uncertainty:** `BAAGH` wordmark and `est. 1961` sub-meta are prototype placeholders.
- **Chosen Decision:** Centralize all brand identifiers into `/src/config/brand.ts` (`brandConfig.name`, `brandConfig.establishedYear`, `brandConfig.wordmarkSvg`, `brandConfig.navLinks`). Never hard-code brand strings in components.
- **Why Chosen:** Enables instant re-branding, wordmark SVG replacement, or foundation year updates without altering layout structure, CSS rules, or component code.
- **Temporary or Permanent:** Permanent.
- **Trigger for Future Change:** Client delivery of final production brand guidelines, logo assets, or domain naming.

---

## Decision 5: Inventory & Assessment of `UI Mockups Needed.zip`

- **Uncertainty:** Unextracted `UI Mockups Needed.zip` in `/prototype/` directory created ambiguity regarding missing assets or unapproved design changes.
- **Chosen Decision:** Zip contents were extracted and inventoried:
  - `Cinematic Hero.dc.html`, `cinema-stage.js`, `support.js`: Redundant (source files from which the golden offline HTML was compiled).
  - `shots/*.jpg`, `shots/grid*.png`: Supplementary (development visual reference stills and render thumbnails).
  No design or code changes from the zip will be incorporated into the production build.
- **Why Chosen:** Preserves the integrity of the approved golden prototype `prototype/CinematicHero-offline (1).html` and prevents unvetted visual drift.
- **Temporary or Permanent:** Permanent.
- **Trigger for Future Change:** Explicit client instruction to incorporate specific supplementary visual references.

---

## Decision 6: Mobile Responsive Implementation Order

- **Uncertainty:** Mobile layout rules in `DESIGN.md` §10 are design guidelines missing from the prototype code.
- **Chosen Decision:** Implement and verify desktop cinematic experience (≥1280px) to 1:1 golden parity first. Retain mobile responsive architecture (FOV shift, macro offset, centered cues, mobile performance ladder). Touch drag and inertia tuning will occur during post-desktop browser validation.
- **Why Chosen:** Establishes an uncompromised desktop reference implementation before introducing responsive layout adaptations and mobile touch event calibration.
- **Temporary or Permanent:** Temporary implementation order; Permanent target architecture.
- **Trigger for Future Change:** Completion of desktop parity validation.

---

## Decision 7: Accessibility Focus Management for Scroll Cues

- **Uncertainty:** Visually inactive/off-screen scroll cues (`opacity: 0`) in the prototype remain focusable via keyboard tabbing, breaking WCAG keyboard navigation order.
- **Chosen Decision:** Implement dynamic accessibility state management via `useCueAccessibility`. Apply `inert` and `aria-hidden="true"` to `<ScrollCue>` blocks when `opacity <= 0.6`. Re-enable focusability when active (`opacity > 0.6`).
- **Why Chosen:** Corrects accessibility flaw without modifying any visual styles, typography, transforms, or frame-loop timing.
- **Temporary or Permanent:** Permanent.
- **Trigger for Future Change:** N/A.

---

## Decision 8: Texture Strategy & Performance Optimization

- **Uncertainty:** Synchronous CPU texture generation (`skinMaps`, `woodTexture`, `fibreTexture`) takes ~300–500ms at boot.
- **Chosen Decision:** Preserve exact CPU procedural canvas texture generation for V1. Benchmark actual startup performance across devices before considering worker offloading or texture pre-baking.
- **Why Chosen:** Guarantees 100% mathematical visual parity with the golden prototype textures without risk of compression artifacts, mipmap shifts, or color space conversion errors.
- **Temporary or Permanent:** Temporary (V1 baseline); architecture supports worker/bake upgrade post-benchmarking.
- **Trigger for Future Change:** Empirical performance profiling demonstrating main-thread boot bottlenecks on target low-tier devices.
