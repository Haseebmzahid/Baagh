# ARCHITECTURE_GATE.md — Final Production Architecture Readiness Review

> **Project:** "BAAGH" Cinematic Hero Production Port  
> **Status:** Passed Architecture Gate  
> **Gate Keeper:** Principal AI Software Architect  
> **Scope:** Final verification of production readiness before code implementation.

---

## Architecture Verification Matrix (10 Core Gate Questions)

### 1. Can the golden HTML experience be reproduced faithfully?
**YES.**  
The proposed architecture isolates every mathematical function, camera keyframe table, lighting parameter, and CSS grade layer from `prototype/CinematicHero-offline (1).html`.
- **Camera Interpolation:** Preserves the exact 2-stage exponential damping (`dt * 3.4` scroll damping, `dt * 6` position/target smoothing) and `smoothstep` segment transitions without replacing them with standard GSAP tweens.
- **3D World:** Rebuilds all 9 stations along the +X axis (0m to 40m) in a single continuous `THREE.Scene`, preserving procedural geometries, materials, and lighting rigs.
- **DOM Overlay & Grade:** Ported 1:1 using React JSX components driven by direct DOM ref mutations (`opacity`, `transform`) in the frame loop, preserving film grain, vignette, and split-tone overlays.

---

### 2. Can the final brand name be swapped without structural redesign?
**YES.**  
All brand attributes (`BAAGH` wordmark, `est. 1961` sub-meta, nav links, CTA label copy) are isolated into a central configuration module (`/src/config/brand.ts`) and injected via `BrandContext`.
- **Zero Component Hard-coding:** `<SiteHeader />`, `<ScrollCue />`, and `<CtaPair />` read brand values dynamically.
- **Asset Swap Ready:** Replacing the text wordmark with an SVG logo asset requires updating `brandConfig.wordmarkSvg` without touching application code or layout styles.

---

### 3. Can 3D assets be replaced independently?
**YES.**  
Each of the 9 stations is encapsulated as an independent React Three Fiber component (`<Station1Fruit />` through `<Station9Home />`).
- **Decoupled Asset Interfaces:** Station 4 utilizes a `<HandsAdapter />` boundary. The V1 procedural hand representation can be swapped for a photoreal GLTF model (`<PhotorealHandAdapter />`) by updating a single component import without changing camera paths, lighting, or station coordinates.
- **Procedural Model Isolation:** Geometry generators (`mangoGeometry`, `treeModel`, `vanModel`, `cityBlocks`) are contained in `/src/components/canvas/procedural/` as pure data functions.

---

### 4. Can the cinematic timeline be modified without rewriting the whole application?
**YES.**  
The cinematic timeline is driven by two declarative data structures:
- `cameraKeyframes.ts`: The 9-station spatial table ($K_1 \dots K_9$ position, lookAt, FOV).
- `cueConfig.ts`: The normalized progress windows (`in`, `out`), text copy, anchors, and measures for all 10 scroll cues.
- **Decoupled Progression Engine:** The camera controller (`CameraRig`) and cue controller (`useScrollProgress`) consume these tables dynamically. Adjusting journey length (`journeyLength` spacer height) or shifting keyframe boundaries requires editing configuration objects, not code logic.

---

### 5. Can mobile performance be reduced independently of desktop fidelity?
**YES.**  
Mobile performance optimizations are managed via a dedicated `useViewportTier` hook and feature flag ladder:
- **Tiered Quality Settings:** Automatically adjusts `devicePixelRatio`, shadow map resolution (2048² → 1024²), shadow casting flags on secondary props (trees, city, sacks), and geometry segment density based on screen width and device capability.
- **Desktop Parity Protection:** Desktop settings (≥1280px) remain uncompromised at maximum fidelity regardless of mobile optimization rules.

---

### 6. Can the WebGL fallback operate independently?
**YES.**  
WebGL capability detection is handled at application mount by `useWebGLCapability`.
- **Automatic Fallback Mounting:** If `WebGLRenderer` throws or context is lost (`webglcontextlost`), the application unmounts `<CinemaStage />` and mounts `<FallbackView />`.
- **Independent Visuals:** `<FallbackView />` renders a high-quality static layout using Scene 9 typography, background styling, brand token hierarchy, and live CTAs without making WebGL calls or requiring active 3D context.

---

### 7. Are the design tokens centralized?
**YES.**  
All design system tokens are defined in `/src/config/tokens.ts`:
- **Color System:** Exact hex and RGBA values for ink, paper, paperBright, paperWarm, accent, buttonInk, rail, nav, and materials (`world.fog`, `mat.woodLight`, etc.).
- **Typography Scale:** Newsreader and IBM Plex Mono sizes, weights, line-heights, letter-spacings, and measures.
- **Spacing & Radii:** 2px cut radii, hairline borders, and optical gutter tokens (196px left anchor, 120-130px right anchors).

---

### 8. Are all prototype-only dependencies isolated?
**YES.**  
Every prototype-only asset and host dependency has been identified and removed from the production scope:
- **Eliminated:** `support.js` (Design Component runtime), `offline-boot.js` (blob bootloader), `cinema-stage-standalone.js`, unpkg CDN script tags, and `window.__cine` debug hooks.
- **Production Equivalents:** Local pinned `three@0.184.0` via npm, `@react-three/fiber`, self-hosted Google Fonts (`Newsreader` + `IBM Plex Mono` woff2), and standard React component state.

---

### 9. Are accessibility behaviours represented in the architecture?
**YES.**  
Keyboard navigation and screen reader accessibility are integrated into `<ScrollCue />` components via `useCueAccessibility`:
- **Dynamic Focus Management:** Automatically sets `inert` and `aria-hidden="true"` on cue blocks when `opacity <= 0.6`, preventing hidden off-screen links from capturing keyboard focus.
- **Active Cue Focus:** Restores focusability (`inert={false}`, `aria-hidden="false"`) when cues reach active scroll opacity (`opacity > 0.6`).
- **Semantic DOM:** All typography remains in the accessibility tree as standard semantic HTML text elements.

---

### 10. Is the system prepared for additional future website pages using the same design language?
**YES.**  
The production architecture cleanly separates design system infrastructure from the cinematic hero experience:
- **Shared UI Layer:** Design tokens (`tokens.ts`), brand configuration (`brand.ts`), typography styles, and layout components (`<SiteHeader />`, button variants) are reusable across future pages (e.g., Everyday Fresh catalog, Signature collection, Our Story).
- **Standalone Hero Experience:** The 3D canvas stage and scroll engine (`<CinematicExperience />`) act as a single hero page module that can easily co-exist with standard multi-page routing.

---

## Final Readiness Confirmation

All 10 architecture gate questions have been evaluated and confirmed. The technical design is complete, fully decoupled, brand-agnostic, and ready for production code implementation.
