# DEPENDENCIES.md
Every external dependency in the shipped prototype, plus the porting assessment. Descriptive of what exists — no redesign implied.

## 1. Dependency table

### three.js — 0.184.0
- **Source:** `https://unpkg.com/three@0.184.0/build/three.module.js` via `<script type="importmap">`, with an `integrity` map covering `three.module.js` and `three.core.js` (SRI `sha384-8FCZ1eVO…` / `sha384-dw2ooPew…`).
- **Purpose:** the entire experience — renderer, scene, camera, procedural geometry, materials, lights, shadow map, PMREM environment, canvas textures.
- **API surface actually used:** `WebGLRenderer`, `Scene`, `PerspectiveCamera`, `FogExp2`, `Color`, `Vector3`, `Clock`, `PMREMGenerator`, `CanvasTexture`, `Group`, `Mesh`; lights `DirectionalLight`, `HemisphereLight`, `PointLight`, `SpotLight`; materials `MeshPhysicalMaterial`, `MeshStandardMaterial`, `MeshBasicMaterial`; geometry `Sphere`, `Box`, `Plane`, `Cylinder`, `Capsule`, `Icosahedron`, `Torus`, `Cone`, `Circle`; constants `ACESFilmicToneMapping`, `SRGBColorSpace`, `PCFSoftShadowMap`, `RepeatWrapping`, `EquirectangularReflectionMapping`, `DoubleSide`. **No addons.**
- **Keep in production:** yes, and keep the exact version. `environmentIntensity`, `backgroundIntensity` and ACES output differ across releases; drifting the version silently changes the grade.
- **Production equivalent:** `npm i three@0.184.0` bundled locally (drop the import map + SRI). For a React app, `@react-three/fiber` on top of the same pinned three is fine; `drei` is optional and currently unused.

### Google Fonts — Newsreader + IBM Plex Mono
- **Source:** `https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300&family=IBM+Plex+Mono:wght@400;500&display=swap`, plus `preconnect` to `fonts.gstatic.com`.
- **Purpose:** all typography (see DESIGN.md §2).
- **Keep in production:** the *fonts* yes, the *CDN* no.
- **Production equivalent:** self-host woff2 subsets with `@font-face` + `font-display: swap` (`next/font/google` or Fontsource). Both are OFL-licensed. Subset to latin; ship Newsreader as a variable font (opsz 6–72, wght 300–400 + one italic) and Plex Mono 400 only — weight 500 is requested but never used, so drop it.

### Design Component runtime — `support.js`
- **Source:** local, host-generated (not authored by the design).
- **Purpose:** parses the `<x-dc>` template, resolves `{{ }}` holes, mounts `<x-import component-from-global-scope="cinema-stage">`, hot-reloads the logic class, and renders the Tweaks panel from `data-props`.
- **Keep in production:** **no — prototype-only.** In React this layer disappears: the template becomes JSX, the logic class becomes a component, and `data-props` becomes props/config.

### Offline-build shims — `offline-boot.js`, `cinema-stage-standalone.js`
- **Source:** local, used only by `CinematicHeroOffline.dc.html` → `CinematicHero-offline.html`.
- **Purpose:** replace the import map for a zero-network build — polls `window.__resources`, fetches the inlined three.js text, rewrites the relative `./three.core.js` import to a blob URL, imports it as `window.THREE_NS`, then imports the standalone stage module. `window.__offlineBooted` prevents double-boot.
- **Keep in production:** **no — prototype-only.** A real bundler makes both files unnecessary.

### Not present (do not add during the port)
GSAP / ScrollTrigger · Lenis or any smooth-scroll library · Framer Motion · Locomotive · Lottie · any postprocessing (`EffectComposer`, bloom, DOF) · `OrbitControls` · any model/texture loader · icon library · CSS framework · analytics · polyfills. All motion is a damped lerp in one `requestAnimationFrame` loop; all textures are canvas-generated.

## 2. Directly portable to React (copy the values, not a rewrite)

1. **The whole DOM overlay** — header, chapter rail, 10 cue blocks, CTA pair, spacer. Inline-styled absolutely-positioned elements → JSX with `style` objects, 1:1. The `data-in`/`data-out` attributes become props on a `<ScrollCue>` component.
2. **All design tokens** — colours, type scale, tracking, spacing, radii, opacities, z-index stack (DESIGN.md §1–5).
3. **The grade stack** — vignette / soft-light split-tone / grain overlays and the canvas `filter: saturate(1.08) contrast(1.07)` are pure CSS. Keep the grain as a base64 data URI (the utf8 form's inner `url(#n)` breaks bundler asset resolution).
4. **The 9-entry camera keyframe table** and every interpolation constant (`3.4`, `6`, `5`, `smoothstep`, `0.028`, `14px`) — port as plain data/constants.
5. **All procedural texture and geometry functions** (`hash`, `vnoise`, `fbm`, `skinMaps`, `woodTexture`, `fibreTexture`, `skyEquirect`, `mangoGeometry`) — framework-agnostic; wrap in `useMemo`.
6. **Copy and content order**, verbatim (DESIGN.md §19).
7. **Tweak props** → component props: `journeyLength`, `showChapters`, `grain`, `accent`.

## 3. Must be reimplemented in React / three.js

1. **`<cinema-stage>` custom element** → an R3F `<Canvas>` (or a `useEffect`-managed renderer). The `connectedCallback`/`this._up` guard, manual `appendChild`, and `resize` listener all go away.
2. **The rAF loop** → a single `useFrame`. Keep the two-stage damping and `smoothstep` exactly; do not substitute GSAP tweens (they retime the camera and lose the weighted feel).
3. **Overlay driving.** The prototype reads `[data-in]`, `[data-chapter]`, `[data-progress]` from `document` each frame and writes inline styles. Invert this: hoist `progress` into a ref/store (a ref, not state — per-frame `setState` will drop frames) and let cues subscribe.
4. **Tweak application.** `Component.apply()` does imperative `document.querySelector` writes on mount/update; in React these are just props.
5. **Debug hooks** `window.__cine.step/jump/f/err` — remove or move behind a dev flag.
6. **Scene assembly.** ~200 imperative `scene.add()` calls. Either keep one imperative builder inside a `useMemo` (lowest risk, recommended) or convert to declarative JSX (higher risk of coordinate drift). If declarative, instance the 88 trees and 26 city blocks.
7. **Responsive, reduced-motion, WebGL fallback, focus management** — specified in DESIGN.md §10/§13/§18 but **absent from the prototype**; all four are new work.

## 4. Prototype-only (delete on port)

`support.js` · `offline-boot.js` · `cinema-stage-standalone.js` · `CinematicHeroOffline.dc.html` · `CinematicHero-offline.html` · the `<x-dc>` / `<helmet>` / `<x-import>` wrappers · `data-props` JSON · `window.__cine` hooks · `href="#"` placeholders · the `BAAGH` / `est. 1961` placeholder wordmark.

## 5. External CDN dependencies

| Resource | Origin | Blocking? | Production action |
|---|---|---|---|
| `three.module.js` + `three.core.js` | unpkg.com | yes — no scene without it | bundle locally, pin 0.184.0 |
| Google Fonts CSS | fonts.googleapis.com | render-blocking stylesheet | self-host |
| Font woff2 | fonts.gstatic.com | swap-deferred | self-host, subset latin |

Three third-party origins today; **zero** after the recommended changes. `CinematicHero-offline.html` already proves the experience runs with no network at all.

## 6. Risks when reproducing this in production

1. **Version drift in three.js changes the look.** Tone mapping, `environmentIntensity` (0.34) and `backgroundIntensity` (0.55) are release-sensitive. Pin 0.184.0 and screenshot-diff scene 1, 4 and 9 on any upgrade.
2. **Boot cost is CPU, not network.** 3 × 1024² + 2 × 512² + 6 × 256² canvas textures and three 110×90-segment deformed spheres are generated synchronously on the main thread (~300–500 ms on a laptop, worse on phones). There is no loading state. Mitigations: generate at lower resolution on mobile, move noise generation to a worker + `ImageBitmap`, or bake the maps to KTX2 for production (bakes must be pixel-compared against the procedural output).
3. **No WebGL fallback at all.** `new WebGLRenderer` throwing leaves a frozen DOM overlay on a near-black page, and there is no `webglcontextlost` handler. Ship a capability check and a static poster path before launch.
4. **No mobile branch.** The desktop layout renders as-is on phones: `left:196px` cues crowd the frame, the rail overlaps them, 60px hero type overflows, and portrait aspect crops the wide compositions. Budget real work here; do not just scale type.
5. **Reduced-motion is unhandled** — continuous bob/roll plus scroll inertia. An accessibility blocker in most review processes.
6. **Focus order includes invisible content.** Off-screen cues get `pointer-events:none` only; their links stay tabbable. Add `inert`/`aria-hidden` when a cue's opacity is 0.
7. **Perf ceiling.** ~120k triangles, one mesh per object, no instancing, one 2048² shadow map, `pixelRatio` up to 1.85. Fine on desktop; the tree/city instancing and shadow-map reduction are the first levers.
8. **The camera key-light coupling is easy to break.** `key.position.x = camera.position.x - 4.5` plus target update runs every frame; drop it during refactor and shadows vanish past station 3.
9. **Single-scene coordinate fragility.** All nine stations share one world along +X; fog at density 0.08 is what hides neighbours. Changing fog, camera `far` (260), or station spacing can reveal the next set.
10. **Scroll-length coupling.** Cue windows are normalised progress, so `journeyLength` is safe to change — but any hard-coded pixel scroll logic added later will desync type from camera.
11. **CSS blend modes + `filter` on the canvas** can force extra compositing layers; verify on Safari, where `mix-blend-mode: soft-light` over a WebGL canvas has historically been expensive.
12. **The grain data URI** must stay base64 in any bundled build (the utf8 variant's `url(#n)` is misread as a missing asset).
13. **Per-frame React state would destroy the feel.** Drive the overlay from refs; the damping constants assume a stable 60 fps loop.
