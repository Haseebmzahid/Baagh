# INTERACTION_SPEC.md
Reverse-engineered from `Cinematic Hero.dc.html` + `cinema-stage.js` (the shipped prototype). Descriptive, not prescriptive: where the prototype has no implementation for something, this document says so.

---

## 1. Interaction model in one paragraph

Native vertical scroll over a `940vh` empty spacer is the **only** input. A `scroll` listener (`{passive:true}`) stores normalised progress `target = clamp(scrollY / (scrollHeight - innerHeight), 0, 1)`. One `requestAnimationFrame` loop damps that value, interpolates a 9-entry camera keyframe table, animates a handful of objects, drives fog/exposure, and writes inline `opacity`/`transform` onto the DOM cue blocks. There are **zero** CSS transitions, zero `@keyframes`, no animation library, no scroll-jacking, no snap, no click/hover/drag interaction with the 3D world.

```
scrollY ──► target ──damp(dt*3.4)──► cur ──► s = cur*8 ──► segment i, f = smoothstep
                                      │
                                      ├─► camera pos/target/fov  (2nd damp, dt*6 / dt*5)
                                      ├─► object animation (hero spin, examined spin, grading)
                                      ├─► atmosphere (fog density, tone-map exposure, macro light)
                                      ├─► DOM cues (opacity + translateY)
                                      └─► chapter rail (active item, progress scaleY)
```

## 2. Scroll progression

| Item | Value |
|---|---|
| Scroll surface | `<div data-spacer>` height `940vh` (tweak `journeyLength`, 500–1600) |
| Progress | `scrollY / (scrollHeight - innerHeight)`, clamped 0–1 |
| Damping | `cur += (target - cur) * min(1, dt*3.4)` — dt clamped to 0.05 s |
| Keyframe mapping | `s = cur * 8`; `i = min(7, floor(s))`; `f = smoothstep(s - i)` where `smoothstep(x)=x*x*(3-2*x)` |
| Per-segment scroll | 940vh / 8 ≈ **117vh per camera move** |
| Chapter index | `round(cur * 8)` |
| Progress bar | `transform: scaleY(cur)`, `transform-origin: top` |
| Debug hooks present in the file | `window.__cine.f` (frame count), `.err`, `.step(n)`, `.jump(p)` (snaps camera, sets `snap=true` for one frame) |

Segment boundaries in progress: 0, .125, .25, .375, .5, .625, .75, .875, 1.

## 3. Camera table (verbatim from `K[]`)

| # | Chapter | position | lookAt | fov |
|---|---|---|---|---|
| 1 | Fruit | 0.02, 0.905, 0.155 | 0, 0.888, 0 | 30 |
| 2 | Crate | 0.28, 1.36, 0.66 | 0.02, 0.885, −0.02 | 40 |
| 3 | Source | 0.05, 1.5, 2.55 | 0.0, 0.98, −2.6 | 45 |
| 4 | Hands | 7.74, 1.06, 0.5 | 8.02, 0.95, 0.05 | 26 |
| 5 | Selection | 15.86, 1.5, 1.14 | 16.12, 0.85, −0.04 | 30 |
| 6 | Packing | 23.66, 1.5, 1.22 | 24.16, 0.86, −0.02 | 37 |
| 7 | Journey | 30.6, 4.3, 8.8 | 34.6, 1.0, −0.6 | 44 |
| 8 | Arrival | 38.25, 1.66, 1.85 | 40.05, 1.0, −1.5 | 36 |
| 9 | Home | 40.02, 1.06, 0.44 | 40.0, 0.885, −0.42 | 30 |

Camera: `PerspectiveCamera(38, aspect, 0.008, 260)`. `lookAt(curTgt)` every frame, then roll is added.

## 4. Camera movement rules

```js
tmpP = lerp(K[i].p, K[i+1].p, f);  tmpT = lerp(K[i].t, K[i+1].t, f)
fov  = K[i].fov + (K[i+1].fov - K[i].fov) * f
kL   = snap ? 1 : min(1, dt*6)
curPos.lerp(tmpP, kL);  curTgt.lerp(tmpT, kL)
curFov += (fov - curFov) * (snap ? 1 : min(1, dt*5))
camera.position.copy(curPos); camera.position.y += bob
camera.lookAt(curTgt)
camera.rotation.z += roll
if (|camera.fov - curFov| > 0.01) { camera.fov = curFov; updateProjectionMatrix() }
```
- **Handheld bob:** `sin(performance.now()*0.00042) * 0.0035 * (1 - cur*0.5)` added to Y. Period ≈ 15 s; amplitude 3.5 mm → 1.75 mm by the end.
- **Handheld roll:** `+= sin(performance.now()*0.00031) * 0.0022` rad on Z, applied after `lookAt`. Period ≈ 20 s. Because it is `+=` on a matrix reset each frame by `lookAt`, it is effectively an absolute per-frame offset.
- **Key light follows camera:** `key.position.x = camera.position.x - 4.5`; `key.target.position.set(camera.position.x, 0.6, 0)` + `updateMatrixWorld()`. Without this the single ±14 m shadow frustum stops covering the world after station 3.

## 5. Object animation (the complete list — there is nothing else)

| Object | Rule | Window |
|---|---|---|
| Hero mango (station 1) | `rotation.y += dt * 0.045 * (1 - min(1, cur*4))` | stops at cur ≥ 0.25 |
| Examined mango (hands) | `rotation.y += dt * 0.25 * max(0, 1 - abs(cur-0.40)*7)` | active ≈ cur 0.257–0.543, peak at 0.40 |
| 9 graded mangoes | `gp = clamp((cur-0.47)*8,0,1)`; per fruit `e = smoothstep(clamp(gp*1.4 - i*0.05,0,1))`; accepted (`i%3 !== 2`, 6 of 9): `y += e*0.03`, `z -= e*0.13`, `x -= e*0.22`; rejected (3 of 9): `y -= e*0.006`, `z += e*0.30`, `x += e*0.5`, and `rotation.x += dt*0.5*e` | 0.47 → ≈0.60 |
| `arrivedCrate` | `visible = cur > 0.78 && cur < 0.94` (hard cut, no fade) | — |
| Everything else | static | — |

No object scaling is animated. Static scales only: hand groups `0.88`, mangoes `0.86–1.02`, crates `0.62–1.1`, trees `0.8–1.3`.

## 6. Parallax & depth effects

Parallax is **not** simulated — it is real perspective from a moving camera. Layering was authored to produce it: near occluders (crate stacks at x −1.35/7.0/15.0/22.9/25.3, sacks, baskets, overhead beams at y 2.15 and 1.72, dark city blocks at 26.4/38.2) sweep quickly; orchard rows 4.5–28 m back and city blocks 3–19 m back barely move.

Depth cues, in order of contribution:
1. `FogExp2('#7d6e55')`, density `0.08 + (1 - min(1, cur*3))*0.03 - max(0, cur-0.8)*0.09` → 0.11 at start, 0.08 mid, ≈0.062 at the end (world opens up).
2. Near plane 0.008 with a 0.155 m macro camera distance → aggressive perspective falloff at station 1.
3. CSS vignette + split-tone + grain overlays (z1–z3).

**No depth-of-field pass exists.** No `EffectComposer`, no bokeh, no blur on the canvas. The only blur in the document is `backdrop-filter: blur(2px)` on the chapter-rail scrim.

## 7. Lighting changes over scroll

| Light / setting | Rule |
|---|---|
| Macro point light | `intensity = 0.3 * max(0, 1 - cur*6)` → off by cur ≈ 0.167 |
| Tone-map exposure | `0.6 + min(1, cur*7)*0.32 - max(0, cur-0.82)*0.1` → 0.60 → 0.92 by cur 0.143 → 0.902 at 1.0 |
| Fog density | see §6 |
| Key / hemi / rim / spots / interior lights | constant intensity; key light only translates in X |

## 8. Durations, delays, easing (there are no ms-based durations)

Everything is scroll-scrubbed; "duration" is scroll distance, and settle times are damping constants.

| Motion | Easing | Effective time / distance |
|---|---|---|
| Progress damping | exponential, rate 3.4/s | ≈300 ms to settle after scroll stops |
| Camera pos/target | exponential, rate 6/s | ≈170 ms |
| Camera fov | exponential, rate 5/s | ≈200 ms |
| Per-segment path | `smoothstep` (ease-in-out) | ≈117vh of scroll |
| Cue fade in/out | **linear** ramp over `0.028` progress | ≈26vh each |
| Cue rise | linear, tied to cue opacity: `translateY((1-o)*14px)` | same window |
| Grading stagger | `smoothstep`, delay `i*0.05` of `gp` | 0.47→0.60 progress |
| Chapter rail item | instant opacity swap 1 ↔ 0.28 (no transition declared) | 0 |
| Bob / roll | sine, periods ≈15 s / ≈20 s | continuous |

## 9. Text reveal timing (`data-in` / `data-out`, per-frame in JS)

```js
f1 = (c.a <= 0.006) ? 1 : clamp((cur - c.a)/0.028, 0, 1)
f2 = (c.b >= 1)     ? 1 : clamp((c.b - cur)/0.028, 0, 1)
o  = min(f1, f2)
el.style.opacity = o
el.style.transform = `translateY(${(1-o)*14}px)`
el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
```

| in → out | Content |
|---|---|
| 0 → 0.075 | Scroll prompt |
| 0.005 → 0.07 | `Chaunsa · Mid-season` / *One fruit, before anyone else has seen it.* |
| 0.10 → 0.20 | Chosen at source. / Every crate is filled by hand… |
| 0.235 → 0.325 | `Multan · 05:40` / This fruit came from somewhere real. |
| 0.375 → 0.455 | Chosen by people who know fruit. / Three generations… |
| 0.49 → 0.575 | Not everything that looks good is good enough. / Kept · 6 · Set aside · 3 |
| 0.61 → 0.695 | Handled with care. / Wrapped, weighed and placed — never poured. |
| 0.735 → 0.815 | Delivered with confidence. / Same-day, temperature-held… |
| 0.845 → 0.915 | It arrives the way it left. |
| 0.93 → 1.01 | Fruit you never have to doubt. / subline / 2 CTAs |

Windows never overlap; the two special cases keep the first cues visible at rest at progress 0 and the hero block fully open and clickable at progress 1.

## 10. Scene-by-scene specification

### Scene 1 — Fruit (progress 0 → 0.125)
- **Purpose:** provoke "what am I looking at?" before any brand claim.
- **Initial state:** page at scroll 0; canvas fixed; nav + rail + scroll prompt + italic lead visible at full opacity; exposure 0.60, fog 0.11 (heaviest).
- **Trigger:** page load (no scroll needed).
- **Camera:** `K1` — 0.02, 0.905, 0.155 → 0, 0.888, 0, fov 30, near 0.008.
- **Objects:** hero mango at (0, 0.885, 0) rot (0.1, 0.6, 0.28) slowly turning; 4 companions in the crate; cloth; macro point light at 0.3.
- **Text:** scroll prompt (centre, bottom 52px) + eyebrow/italic lead (left 196px, mid-height).
- **Animation:** hero `rotation.y` creep; bob/roll at max amplitude.
- **Transition out:** camera pulls back and up (0.155 → 0.66 z, 0.905 → 1.36 y) as fov widens 30 → 40; both cues fade by 0.07/0.075; macro light dies at 0.167.
- **End state:** crate legible, fruit no longer filling frame.

### Scene 2 — Crate (0.125 → 0.25)
- **Purpose:** first context — the fruit sits in something built by hand.
- **Initial state:** arriving from S1; no cue on screen until 0.10 (cue starts fading in slightly before the segment).
- **Trigger:** progress ≥ ~0.10.
- **Camera:** `K2` 0.28, 1.36, 0.66 → 0.02, 0.885, −0.02, fov 40.
- **Objects:** crate, 5 mangoes, paper liner (vertex-jittered), cloth; static.
- **Text:** right-anchored, right-aligned, 280px measure, top 54%.
- **Animation:** camera only.
- **Transition:** rise/retreat to z 2.55, fov 40 → 45; orchard enters frame; cue out at 0.20.
- **End state:** wide exterior with orchard rows behind the table.

### Scene 3 — Source (0.25 → 0.375)
- **Purpose:** prove a real origin.
- **Camera:** `K3` 0.05, 1.5, 2.55 → 0, 0.98, −2.6, fov 45 (widest).
- **Objects:** 88 trees (8 rows × 11), crate stack, basket, sack, overhead beam at y 2.15; fog thinning (density → 0.08 at cur 0.333).
- **Text:** left 196px, bottom 130px, 340px measure, 31px headline (largest mid-journey).
- **Animation:** camera; strongest parallax differential in the piece.
- **Transition:** long lateral travel x 0.05 → 7.74 (≈7.7 m) with fov collapsing 45 → 26 — the only place the camera crosses a large empty stretch of world; fog hides it.
- **End state:** tight portrait framing on the hands table.

### Scene 4 — Hands (0.375 → 0.5)
- **Purpose:** attribute the judgement to people.
- **Camera:** `K4` 7.74, 1.06, 0.5 → 8.02, 0.95, 0.05, fov 26 (longest lens).
- **Objects:** two hand groups (`#33241a`, scale 0.88) back-lit by a 26-intensity spot from (8.7, 2.1, −1.6); examined mango rotating (peak speed at cur 0.40).
- **Text:** right 130px, right-aligned, 300px, top 46%.
- **Animation:** examined-fruit spin envelope; camera.
- **Transition:** travel to x 15.86, fov 26 → 30, camera rises to 1.5 (slightly high angle).
- **End state:** grading lattice in frame, pre-sort.

### Scene 5 — Selection (0.5 → 0.625)
- **Purpose:** show rejection as proof of standards.
- **Camera:** `K5` 15.86, 1.5, 1.14 → 16.12, 0.85, −0.04, fov 30.
- **Objects:** 9 mangoes on a 5×2 lattice (step 0.19 x / 0.26 z from 15.82, 0.845, −0.14), accept tray (15.42), reject crate (16.66), loupe (16.3).
- **Text:** left 196px, top 48%, 330px, 29px headline + stat row (Kept · 6 / Set aside · 3) matching the 6/3 split in the 3D animation.
- **Animation:** the grading beat (§5) — starts at 0.47, i.e. **before** the segment boundary, so the sort is already in motion when the frame settles.
- **Transition:** travel to 23.66, fov 30 → 37; cue out at 0.575.
- **End state:** sorted trays; camera departing.

### Scene 6 — Packing (0.625 → 0.75)
- **Purpose:** show handling discipline.
- **Camera:** `K6` 23.66, 1.5, 1.22 → 24.16, 0.86, −0.02, fov 37.
- **Objects:** pack crate, 6 wrapped mangoes with paper discs at y 0.80, scale (24.95), paper stack (23.1), two crate stacks, sack, 5 trees behind.
- **Text:** right 130px, right-aligned, 290px, bottom 140px.
- **Animation:** camera only.
- **Transition:** the biggest move in the piece — x 23.66 → 30.6, y 1.5 → 4.3, z 1.22 → 8.8, fov 37 → 44. Reads as lifting away from the bench into the city.
- **End state:** elevated establishing frame.

### Scene 7 — Journey (0.75 → 0.875)
- **Purpose:** scale — the crate becomes small in a city.
- **Camera:** `K7` 30.6, 4.3, 8.8 → 34.6, 1.0, −0.6, fov 44 (only elevated shot).
- **Objects:** 26 hashed city blocks, road plane 26×3.2 at (34, 0.005, 1.2), van at (33.9, 0, 0.5) ry −0.5 with crate on the bed (32.6, 0.72, 1.5), 2 dark near-frame blocks, 4 trees.
- **Text:** left 196px, top 50%, 300px.
- **Animation:** camera; fog now thinning fast (`- max(0, cur-0.8)*0.09`).
- **Transition:** descend to eye height 1.66 and push to x 38.25, fov 44 → 36; `arrivedCrate` becomes visible at 0.78 (during this scene).
- **End state:** at the threshold of the home.

### Scene 8 — Arrival (0.875 → ~0.93)
- **Purpose:** the hand-off beat.
- **Camera:** `K8` 38.25, 1.66, 1.85 → 40.05, 1.0, −1.5, fov 36.
- **Objects:** enclosed room (back/side/split-left/front walls + ceiling), unlit window plane `#e8d8b6` + mullion, rug, dining table, bowl with 5 mangoes, 2 chairs, pendant + bulb, counter, door spotlight (37.6, 3, −3) → (40, 0.8, −0.6), `arrivedCrate` visible until 0.94.
- **Text:** centred, bottom 120px, mono 9px/0.28em: *It arrives the way it left.*
- **Animation:** camera; exposure begins its −0.1 pull-back after 0.82.
- **Transition:** short move to the seated frame `K9`; `arrivedCrate` hard-hides at 0.94; interstitial cue out at 0.915.
- **End state:** still, symmetrical bowl composition.

### Scene 9 — Home (0.93 → 1.0)
- **Purpose:** deliver the withheld brand statement and the two CTAs.
- **Camera:** `K9` 40.02, 1.06, 0.44 → 40.0, 0.885, −0.42, fov 30 (mirrors S1's fov and intimacy).
- **Objects:** static bowl scene; pendant bulb + warm fill; bob amplitude at its minimum (×0.5).
- **Text:** full-bleed centred flex block — 60px `Fruit you never have to doubt.`, 10.5px mono subline, CTA pair. Reaches opacity 1 and `pointer-events:auto` at progress 1 (`out = 1.01` forces `f2 = 1`).
- **Animation:** none beyond bob/roll and camera settle.
- **Transition to next:** none — terminal scene. Scrolling up reverses everything symmetrically (all state is a pure function of `cur`).
- **End state:** calm frame, exposure ≈0.902, fog ≈0.062, CTAs live.

## 11. CTA behaviour

Both CTAs are `<a href="#">` inside the scene-9 block, `display:flex; gap:16px`, `padding:15px 30px`, radius 2px, mono 10px/0.20em uppercase.
- Primary: `#f2ece0` fill / `#1d2419` text; `style-hover` → `background:#e8cfa0`.
- Secondary: transparent, `1px solid rgba(242,236,224,.42)`, `#f2ece0` text; `style-hover` → `border-color:#e8cfa0; color:#e8cfa0`.
- Clickability is gated by the shared cue rule (`pointer-events` auto only when opacity > 0.6), so they cannot be clicked before the journey ends.
- **Not implemented in the prototype:** active state, `:focus-visible` styling, real destinations. Anything beyond the two hover rules above would be new work.

## 12. Navigation behaviour

- Fixed header, `26px 40px`, `justify-content: space-between`, z-index 5. Never changes with scroll — no shrink, no background, no hide-on-scroll.
- Links: `a { color: inherit; text-decoration: none }`, `a:hover { color: #e8cfa0 }` (global, in `<helmet>`). All `href="#"`.
- Nav order button: `padding:8px 15px`, `1px solid rgba(244,238,226,.32)`, radius 2px.
- **Chapter rail is display-only:** `pointer-events: none` on the `<aside>`. Items are not clickable, there is no jump-to-chapter, and `data-chapter` elements only receive opacity 1 / 0.28 based on `round(cur*8)`. Progress fill is `scaleY(cur)` on a 1×200px track.
- No mobile menu, no hamburger, no focus trap — none exist in the prototype.

## 13. Mouse, touch, keyboard

| Input | Behaviour in the prototype |
|---|---|
| Wheel / trackpad | Native scroll only |
| Touch drag | Native scroll only (`scroll` listener is passive; nothing prevents default) |
| Pointer over canvas | Nothing — no raycasting, no orbit controls, no hover on 3D objects, no cursor change |
| Click | Only on `<a>` elements (nav + 2 CTAs), all `href="#"` |
| Hover | Only the global `a:hover` and the two CTA `style-hover` rules |
| Keyboard | Native scroll keys work; links are in DOM order and tabbable — but off-screen cues are only `pointer-events:none`, **not** `inert`/`aria-hidden`, so invisible links remain focusable. Known gap, not a design decision |
| Resize | `resize` listener → `renderer.setSize(innerWidth, innerHeight, false)` + aspect update; host is `position:fixed; inset:0; 100vw/100vh` |

## 14. Mobile behaviour (as it actually is)

`<meta name="viewport" content="width=device-width, initial-scale=1">` is present, but **no breakpoint, media query, or mobile branch exists in the prototype.** On a phone it renders the desktop layout at phone size: full journey plays, `left:196px` cues crowd the frame, the chapter rail overlaps cues, 60px hero type overflows, portrait aspect crops the wide compositions, and `setPixelRatio(min(dpr, 1.85))` at native resolution is the main perf cost. Everything in DESIGN.md §10 for tablet/mobile is a *recommendation for the production build*, not existing behaviour.

## 15. Reduced motion

**Not implemented.** There is no `prefers-reduced-motion` query in either file: bob, roll, idle spins and inertial damping run for every user. DESIGN.md §13 specifies the intended fallback; treat it as new work.

## 16. Loading behaviour

1. HTML + inline styles paint immediately — background `#16150f`, nav, rail, and the scene-1 cues are visible before any JS runs.
2. Fonts load via Google Fonts `display=swap`.
3. `<script type="importmap">` pins `three@0.184.0` with SRI; `<script type="module" src="./cinema-stage.js">` runs on parse.
4. `connectedCallback` guards on `this._up`, then builds everything synchronously: 3 × 1024² skin maps, 2 × 512² wood, 6 × 256² fibre, 1 × 1024×512 sky, PMREM, ~120k triangles of geometry, 3 seeded mango meshes. ~300–500 ms of main-thread work on a laptop; the page is visibly static (not blank) during it.
5. First `tick()` renders; the loop runs unconditionally from then on.
6. **No spinner, no progress indicator, no fade-in of the canvas, no `webglcontextlost` handling.**

Offline build only: `offline-boot.js` polls `window.__resources` every 60 ms, fetches inlined `three.core.js`/`three.module.js`, rewrites the relative core import to a blob URL, imports it as `window.THREE_NS`, then imports `cinema-stage-standalone.js`. Guarded by `window.__offlineBooted`. Failures log `standalone boot failed`.

## 17. Fallback behaviour

**None exists.** If WebGL is unavailable or the context is lost: `new WebGLRenderer` throws, the module errors, and the user is left with the DOM layer over `#16150f` — nav, rail, and all cue blocks frozen at their authored inline opacities (scene-1 cues visible, the rest at `opacity:0` only after the first frame runs, so pre-crash they show at their static markup values). No `try/catch` around the build, no `isWebGLAvailable` check, no static poster. This is the largest production gap in the prototype.

## 18. Tweak props (host-driven, applied imperatively)

`Component.apply()` runs on mount/update and writes: `[data-spacer].style.height = journeyLength + 'vh'` (940), `[data-grain].style.opacity = grain/100` (13), `[data-rail].style.display = showChapters ? 'flex' : 'none'`, and `accent` (`#e8cfa0`) onto every `[data-accent]` element. Direct DOM writes, not React state — see the porting notes in `docs/DEPENDENCIES.md`.
