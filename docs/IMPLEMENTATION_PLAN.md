# IMPLEMENTATION_PLAN.md — Production Architecture & Porting Specification

> **Status:** Architecture & Planning Phase (Decisions Approved)  
> **Source of Truth:** `/prototype/CinematicHero-offline (1).html` (authoritative prototype), `/docs/DESIGN.md`, `/docs/INTERACTION_SPEC.md`, `/docs/ASSET_MANIFEST.md`, `/docs/DEPENDENCIES.md`, `/docs/DECISION_LOG.md`.

---

## 1. Executive Summary & Core Engineering Principles

This document defines the production architectural plan for porting the "BAAGH" Cinematic Hero prototype (`/prototype/CinematicHero-offline (1).html`) to a production React / Three.js (@react-three/fiber) codebase.

### Mandatory Rules & Constraints
1. **Zero Redesign:** Maintain exact 1:1 visual parity with prototype timing, camera framing, typography, color tokens, and layout anchors.
2. **No Feature Creep:** Do not add additional UI chrome, cards, footers, or un-specified interactions.
3. **No Journey Simplification:** Retain the full 9-station continuous camera journey along the +X world axis.
4. **Strict 3D Preservation:** Do not substitute 2D flat fallbacks for 3D elements unless explicitly running under the WebGL error/unsupported fallback state.
5. **No Main-Thread Per-Frame React State Thrashing:** Drive all frame-loop updates (camera, lighting, DOM cue opacities, shaders) via non-React refs and direct DOM/Three object mutations.

---

## 2. Reverse-Engineering & Technical Assessment (12 Core Determinations)

### 1. Visual Elements Reproducible Directly
- **DOM Overlay Layout:** Fixed top header (wordmark, sub-meta, 6 nav links), fixed chapter rail track & fill, 10 scroll-driven typographic cue blocks, terminal CTA pair.
- **Design Tokens & Palette:** All hex & RGBA values (`color.ink`, `color.paper`, `color.accent`, `world.fog`, etc.) lifted directly to a production token module (`tokens.ts`).
- **Typography System:** Newsreader serif (weights 300, 400, 300 italic) paired with IBM Plex Mono (weight 400).
- **CSS Grade Stack:**
  - Base canvas CSS filter: `filter: saturate(1.08) contrast(1.07)`
  - Vignette overlay: `radial-gradient(118% 82% at 50% 44%, rgba(0,0,0,0) 34%, rgba(12,11,8,0.62) 100%)`
  - Split-tone overlay: `linear-gradient(180deg, rgba(255,214,150,.16) 0%, rgba(255,214,150,0) 42%, rgba(24,32,40,.20) 100%)` with `mix-blend-mode: soft-light`
  - Film grain overlay: Base64 SVG `feTurbulence` data-URI, `opacity: 0.13`, `mix-blend-mode: overlay`.
- **Procedural Shader/Texture Algorithms:** Mathematical functions for noise (`hash`, `vnoise`, `fbm`), mango skin maps (`skinMaps`), wood grain (`woodTexture`), fabric/soil fibres (`fibreTexture`), and equirectangular sky (`skyEquirect`).
- **Verbatim Copy & Order:** All 10 cue text sequences and chapter markers preserve exact string values, line wrapping, and responsive measure rules.

### 2. Animations Requiring React / Frame Loop Management
- *Note:* Per `DEPENDENCIES.md` §3 and `DESIGN.md` §11, standard GSAP tweens or CSS transitions **must not** be used for camera interpolation because they retime the camera and lose the heavy, weighted feel.
- **Damped Scroll Progress:** Exponential damping `cur += (target - cur) * min(1, dt * 3.4)` running inside a single frame loop.
- **Scroll Cue Transitions:** Linear opacity interpolation (`0.028` progress window) combined with dynamic translation `translateY((1-o)*14px)`.
- **Chapter Rail State:** Synchronized `scaleY(cur)` transform on progress track, coupled with discrete opacity swaps (`1.0` active / `0.28` inactive) for rail labels based on `round(cur * 8)`.
- **Atmospheric Scrubbing:**
  - Fog density: `0.08 + (1 - min(1, cur * 3)) * 0.03 - max(0, cur - 0.8) * 0.09`
  - Tone-mapping exposure: `0.6 + min(1, cur * 7) * 0.32 - max(0, cur - 0.82) * 0.1`
  - Macro point light decay: `0.3 * max(0, 1 - cur * 6)`

### 3. 3D Elements Requiring React Three Fiber / Three.js
- **World Infrastructure:** Single continuous `THREE.Scene`, single ground plane `PlaneGeometry(200, 90)`, procedural equirectangular sky background + PMREM environment generator.
- **Station 1–3 (Fruit, Crate, Source):** Sorting table, hero crate, hero mango (deformed sphere geometry), 4 companion mangoes, cloth, 88 orchard trees (8×11 grid), crate stacks, basket, sack, overhead beam.
- **Station 4 (Hands):** Expert dark table, procedural hand representation for V1 wrapped behind a decoupled interface, examined mango, spot backlight (`intensity 26`).
- **Station 5 (Selection):** Selection table, accept tray crate, reject crate, 9 graded mangoes on 5×2 lattice, loupe (`TorusGeometry`).
- **Station 6 (Packing):** Packing table, pack crate, 6 wrapped mangoes with paper discs, scale group, paper stack, 2 crate stacks.
- **Station 7 (Journey):** City at dawn (26 hashed box blocks, road plane `26×3.2`, delivery van with wheels/glass/bumper/stripe, bed-mounted travel crate, 2 near-frame dark blocks, 4 trees).
- **Station 8–9 (Arrival & Home):** Enclosed home room (floor, back/side/split-left/front walls, ceiling, window plane `MeshBasicMaterial #e8d8b6` + mullion, rug, dining table, bowl with 5 mangoes, 2 chairs, pendant lamp + cord, counter, door spotlight, arrived crate with hard visibility window `0.78 < cur < 0.94`).
- **Lighting Rig:** Directional Key Light with PCF soft shadows, Hemisphere sky/ground light, Rim light, Macro point light, Hands backlight spot, Door spot light, Interior fill point light, Pendant bulb point light.

### 4. Camera Movements to Rebuild
- **9-Station Keyframe Table ($K_1 \dots K_9$):** Exact spatial position, lookAt target, and FOV interpolation across 8 normalized segments ($s = \text{cur} \times 8$).
- **Segment Easing:** `smoothstep(s - i)` mapping between keyframe indices $i$ and $i+1$.
- **Second-Order Camera Smoothing:** `curPos.lerp(tmpP, min(1, dt * 6))`, `curTgt.lerp(tmpT, min(1, dt * 6))`, `curFov += (fov - curFov) * min(1, dt * 5)`.
- **Handheld Procedural Motion:**
  - Y-axis sine bob: `sin(t * 0.00042) * 0.0035 * (1 - cur * 0.5)`
  - Z-axis sine roll: `+= sin(t * 0.00031) * 0.0022` rad (applied after `lookAt`).
- **Key Light Coupling:** Per-frame camera tracking `key.position.x = camera.position.x - 4.5` and `key.target.position.set(camera.position.x, 0.6, 0)` to maintain shadow map coverage across the 44m world.

### 5. Reusable Prototype Assets
- **Binary Assets:** None exist in the project (0 PNGs, 0 JPGs, 0 GLTFs, 0 audio files).
- **Procedural Canvas Generators:** Lift exact math for 12 runtime canvas textures (`skinMaps`, `woodTexture(0/1)`, `fibreTexture(...)`, `skyEquirect`).
- **Geometry Generators:** Re-use `mangoGeometry(seed)` with 3 fixed seeds (`0`, `1.7`, `3.4`) across all 26 fruit meshes.
- **Inline SVG Overlay:** SVG film grain URI string embedded directly in CSS overlay.

### 6. Production Equivalents for Prototype Dependencies
| Prototype Dependency | Source | Production Action |
|---|---|---|
| `three@0.184.0` | unpkg CDN via import map + SRI | Install via `npm i three@0.184.0`. **Pin version strictly** to avoid tone mapping / environment intensity shifts. |
| `@react-three/fiber` | N/A (prototype used native Three.js) | Use `@react-three/fiber` for React declarative lifecycle, wrapping pinned Three.js 0.184.0. |
| Google Fonts CDN | `fonts.googleapis.com` | Self-host woff2 font files using `@font-face` / Fontsource (`Newsreader` variable opsz 6–72 wght 300–400 + italic; `IBM Plex Mono` wght 400). Drop unused weight 500. |
| `support.js` | Design Component host runtime | **Delete.** Replaced by native React components and props. |
| `offline-boot.js` / `cinema-stage-standalone.js` | Blob URL rewriting bootloader | **Delete.** Native bundler (Vite / Next.js) resolves modules directly. |

### 7. Production Scene System Architecture
- **Single World Coordinate Space:** All objects reside in one `THREE.Scene` along the +X axis (0m to 40m).
- **Static Procedural Generation:** Geometries and textures are built once during initialization (`useMemo`) and reused across mesh instances.
- **Subscription-Based Frame Loop:** High-frequency loop (`useFrame`) updates non-React refs for position, camera matrices, light targets, and DOM cue inline styles without invoking React `setState`.

### 8. Scroll Progress Driving the Cinematic Timeline
- **Scroll Spacer:** A fixed vertical container (`940vh` height).
- **Passive Scroll Capture:** `window.addEventListener('scroll', ..., { passive: true })` captures raw scroll position and updates `targetProgressRef.current = scrollY / (scrollHeight - innerHeight)`.
- **Damped Scrubbing:** Frame loop reads `targetProgressRef.current`, computes damped `curProgressRef.current`, and drives all scene state deterministically as a function of `curProgressRef.current`.

### 9. Responsive Behaviour Rules
- **Desktop (≥1280px):** Baseline layout. Headline typography up to 60px, cue left anchors at `196px`, right anchors at `120–130px`.
- **Tablet (768–1279px):** Retain full 3D journey. Scale hero headline (60 → 44px), scene headlines (27–31 → 24–26px). Shift left cue anchor (`196 → 132px`), right anchors (`120/130 → 88px`). Cap `devicePixelRatio` to 1.6, shadow map to 1024².
- **Mobile (<768px):** Retain 3D journey (do NOT convert to 2D cards). Widen camera FOV by +6° across all keyframes. Increase macro camera distance from 0.155m to 0.19m to prevent near-plane clipping. Centre all cue blocks (`left:24px; right:24px; text-align:center`). Collapse header nav to wordmark + single "Order" link. Hide chapter rail. Stack CTAs full-width.

### 10. Mobile Performance Protection Ladder
1. **Resolution & Shadows:** Cap `devicePixelRatio` to `min(window.devicePixelRatio, 1.5)`. Reduce shadow map to 1024² `PCFShadowMap`.
2. **Shadow Casting Pruning:** Disable shadow casting on background trees, city blocks, sacks, and baskets; preserve shadows only on primary fruit, crates, and tables.
3. **Geometry Downsampling:** Halve orchard tree count (8×11 → 4×7) and city blocks (26 → 14). Reduce mango sphere segment density from `(0.5, 110, 90)` to `(0.5, 64, 48)`.
4. **Asynchronous Texture Boot:** Offload CPU noise/texture generation to Web Workers + `ImageBitmap` to prevent main-thread freeze during initial load.

### 11. Reduced Motion Implementation (`prefers-reduced-motion: reduce`)
- **Disable Idle Motion:** Disable handheld camera Y-bob and Z-roll sine waves; disable hero/examined fruit idle rotation.
- **Remove Scroll Inertia:** Set scroll damping factor to 1.0 (camera tracks scroll position instantly without coasting).
- **Maintain Cinematic Path:** Retain camera spatial movement, as it is user-controlled scroll navigation, not auto-playing motion.
- **DOM Cue Animations:** Retain opacity cross-fades; remove `translateY(14px)` motion.

### 12. Reusable React Component Breakdown
1. `<CinematicExperience />`: Root application container, scroll event orchestrator, and store provider.
2. `<CinemaStage />`: R3F Canvas container, WebGL context lifecycle management, resize handler, WebGL capability check.
3. `<SceneWorld />`: 3D container instantiating ground plane, sky equirectangular environment, lights, and station components.
4. `<Station1Fruit />` through `<Station9Home />`: Modular 3D sub-scenes holding procedural meshes for each station.
5. `<GradeOverlay />`: Fixed CSS layers (Vignette, split-tone, film grain SVG).
6. `<SiteHeader />`: Fixed header navigation bar driven by central brand token configuration.
7. `<ChapterRail />`: Fixed left chapter tracker with progress bar fill and active chapter labels.
8. `<ScrollCue />`: Reusable typographic cue block handling absolute positioning, measures, anchors, direct DOM opacity/transform updates, and `inert`/`aria-hidden` focus management.
9. `<CtaPair />`: Terminal button pair ("Explore Everyday Fresh" & "Discover Signature Collection").
10. `<ScrollSpacer />`: Fixed height element (`940vh`) generating the native scroll distance.
11. `<FallbackView />`: High-quality static fallback view utilizing final-scene visual styling, brand hierarchy, and CTAs when WebGL is unsupported or lost.

---

## 3. Proposed Production Folder Structure

```
/docs
  IMPLEMENTATION_PLAN.md
  DESIGN.md
  INTERACTION_SPEC.md
  ASSET_MANIFEST.md
  DEPENDENCIES.md
  DECISION_LOG.md
  ARCHITECTURE_GATE.md

/public
  /fonts
    Newsreader-Variable.woff2
    Newsreader-Italic-Variable.woff2
    IBMPlexMono-Regular.woff2

/src
  /assets
    /svg
      grain.svg

  /config
    brand.ts
    tokens.ts
    cueConfig.ts
    cameraKeyframes.ts
    tweakDefaults.ts

  /components
    /canvas
      CinemaStage.tsx
      SceneWorld.tsx
      CameraRig.tsx
      LightingRig.tsx
      SkyEnvironment.tsx
      /stations
        Station1Fruit.tsx
        Station2Crate.tsx
        Station3Source.tsx
        Station4Hands.tsx
        /models
          ProceduralHandGroup.tsx
          PhotorealHandAdapter.tsx
        Station5Selection.tsx
        Station6Packing.tsx
        Station7Journey.tsx
        Station8Arrival.tsx
        Station9Home.tsx
      /procedural
        mangoGeometry.ts
        proceduralTextures.ts
        materials.ts
        treeModel.ts
        vanModel.ts
        cityBlocks.ts

    /dom
      SiteHeader.tsx
      ChapterRail.tsx
      ScrollCue.tsx
      CtaPair.tsx
      GradeOverlay.tsx
      FallbackView.tsx
      ScrollSpacer.tsx

  /context
    ScrollContext.ts
    BrandContext.ts

  /hooks
    useScrollProgress.ts
    useReducedMotion.ts
    useViewportTier.ts
    useWebGLCapability.ts
    useCueAccessibility.ts

  App.tsx
  main.tsx
  index.css
```

---

## 4. Architectural Resolution of the 8 Core Uncertainties

The eight open uncertainties have been resolved as follows (detailed rationale in `/docs/DECISION_LOG.md`):

1. **Prototype Path:** Pinned to `prototype/CinematicHero-offline (1).html` as the authoritative single-file prototype.
2. **WebGL Fallback:** Implemented as a high-quality static fallback (`<FallbackView />`) matching Scene 9 visual hierarchy, brand messaging, and live CTAs when WebGL is unavailable or crashes.
3. **Hands Representation:** V1 utilizes procedural hands wrapped in a `<HandsAdapter />` boundary so a photoreal GLTF model can be swapped in V2 without modifying Station 4 architecture.
4. **Brand Tokens:** `BAAGH` and `est. 1961` isolated to `/src/config/brand.ts` (`brandConfig.name`, `brandConfig.establishedYear`, `brandConfig.wordmarkSvg`). Components read from this central configuration.
5. **UI Mockups Needed.zip Inventory:** Unpacked and inventoried. Contains original template files (`.dc.html`, `cinema-stage.js`, `support.js`) redundant with the golden prototype, plus reference render thumbnails (`shots/*.jpg`, `grid*.png`). No design alterations incorporated.
6. **Mobile Execution Strategy:** Desktop cinematic experience built and verified first. Mobile touch/inertia tuning handled during browser validation after desktop visual parity is established.
7. **Accessibility & Focus Management:** `ScrollCue` components dynamically apply `inert` and `aria-hidden="true"` when `opacity <= 0.6`, preventing keyboard tab focus from reaching off-screen inactive links while preserving exact visual layout.
8. **Texture Strategy:** V1 preserves existing CPU procedural texture generation for guaranteed 1:1 visual parity. Worker offloading or baking evaluated post-V1 via empirical performance benchmarking.
