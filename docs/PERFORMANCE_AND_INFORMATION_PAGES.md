# Fruit Intelligence performance and public information pages

Implementation date: 16 November 2026. Frontend only; existing basket and manual
WhatsApp request service remain in place.

## Performance changes

- The fruit registry now loads only the selected scene engine through a dynamic
  import. Narrative/loading UI can paint before scene generation begins. Async
  initialization is cancelled on route exit, including React Strict Mode's
  development remount.
- All four engines use a shared cancellable loop, capped at 60 render updates per
  second on high-refresh displays. Background tabs stop rendering. Reduced-motion
  scenes render on demand for scroll, drag and resize, without idle drift.
- Damping uses elapsed time instead of a fixed per-frame multiplier, keeping
  settling behavior consistent across frame rates.
- DOM annotation publication is limited to 24 Hz; unchanged projected points do
  not create redundant React state. The narrative shell is memoized.
- Mobile/constrained devices use a lower graphics budget; high-density screens
  have bounded pixel ratios. Sustained slow frames trigger resolution reductions,
  with a 0.75 minimum ratio and a cooldown to avoid repeated resize churn. Camera
  sequence, physical anatomy and selection mechanics remain intact.
- Procedural skin texture sizes, selected geometry subdivisions and shadow maps
  have lower bounded budgets. Drawing-buffer preservation is disabled.
- Kinnow and Apple flesh use surface lighting without the expensive full-scene
  refraction pass. Compatible Kinnow rim/segment-side geometries are merged while
  retaining their original vertices, materials and anatomical motion. Portrait
  camera distance/target bias keeps the fruit above the narrative copy.
- Duplicate touch plus pointer gesture handlers are replaced with one Pointer
  Events path; native vertical scrolling remains available.
- Exit disposes scene geometry, materials, textures, shadow targets, PMREM targets
  and instanced resources, then explicitly releases the owned WebGL context.
  Three.js bookkeeping can retain one texture count after disposal; browser tests
  require zero scene geometries, at most one bookkeeping texture, and an actually
  lost/released context rather than treating the counter as proof of a GPU leak.
- A visible reading-view control provides an immediate lighter alternative; a
  graphics failure remains local to Fruit Intelligence. Inactive narrative CTAs
  are removed from keyboard focus and the accessibility tree.
- Final-act copy and CTAs stay fully visible at scroll progress 1.0 instead of
  fading out at the endpoint; browser verification checks keyboard availability
  there. The mobile scroll/drag hint stays on one line.
- Duplicate Google Fonts CSS import removed; typefaces remain loaded by the
  existing document stylesheet link.

## Public pages

`/our-story`, `/contact`, `/privacy-policy`, `/cookies`, `/terms`, `/delivery`,
`/returns` (order support), and `/help`. About/contact/policy aliases are supported.
The header's Our Story link and legacy `#story` reach the real story page.
Shared shopping footers expose the information pages; the basket and missing-page
screen also provide them. Each page has route metadata, semantic headings,
keyboard focus on arrival, mobile layouts and local section navigation.

The visual system uses existing cream/ink/gold, editorial serif type, hairlines,
restrained glass for the chapter navigation and a lightweight perspective effect
on the original user-provided orchard image. New information pages do not boot a
WebGL renderer. Page bodies are lazy-loaded to avoid adding policy prose to the
initial application bundle.

## Content basis and business limits

- Story: `src/config/cueConfig.ts`, `src/config/brand.ts`, `docs/Design.md` and
  `docs/PRODUCT_AUDIT_AND_ROADMAP.md`. Uses the existing generations/selection
  narrative, not invented founder names, dates, milestones or certifications.
  The existing header's “est. 1961” is retained; the design documentation marks
  this as provisional, so the new story does not expand it into an asserted
  founding history.
- Contact: existing business number `+92 304 4323073` in the catalogue. No invented
  email, street address, opening hours or response-time promise.
- Privacy/storage: audited BasketContext/model and in-memory request service.
  Describes the actual `baagh.basket.v1` selection data, Google Fonts requests,
  hosting technical data and the WhatsApp draft handoff. No analytics code was
  found in the application. Hosting configuration and staff record-retention
  practices still require owner confirmation before legal launch sign-off.
- External references checked: [WhatsApp privacy policy](https://www.whatsapp.com/legal/privacy-policy)
  and [Google Fonts privacy information](https://developers.google.com/fonts/faq/privacy).
- Delivery/terms/support explain the current assisted-request process. They do
  not invent service areas, charges, payment methods, refund windows or delivery
  guarantees. The owner should supply operational/legal details before launch.

## Verification

`npm test`: 34 tests pass. `npm run build`: TypeScript and Vite pass. The initial
application bundle is approximately 241.91 kB minified; full policy/story bodies
are in a separate lazy information-page chunk. These are build sizes, not
end-to-end page speed scores.

The final desktop/mobile regression run passes all 12 browser tests, including
each fruit's native-scroll completion, final CTA keyboard availability, selected
scene loading and context/resource cleanup. Screenshots were inspected for the
story layout, mobile fruit framing and the fully visible final invitation.
Both reduced-motion cases were additionally rerun with a simulated actual WebGL
context loss; the reading fallback appeared and the basket stayed accessible.

Recorded viewer initialization, in milliseconds, from the final full run:

| Fruit | Desktop | Mobile viewport emulation |
| --- | ---: | ---: |
| Chaunsa | 2,077 | 1,769 |
| Kinnow | 1,506 | 1,355 |
| Apple | 1,976 | 1,987 |
| Anaar | 2,994 | 3,722 |

These observations include procedural build and first-render work. They leave
room for a future texture-baking/worker sprint; they do not establish a universal
loading-time guarantee.

Unit tests cover basket/request rules, routes/aliases, page registry, elapsed-time
damping, device budgets, adaptive-resolution thresholds and loop visibility/
disposal. Browser checks and curated screenshots are in
`docs/verification/performance-pages`; their metrics identify the actual graphics
renderer. The browser suite can be repeated with `npm run build` then
`npm run test:browser`. Set `BAAGH_CHROMIUM_PATH` only when using an already
installed compatible Chromium rather than Playwright's managed browser.
`BAAGH_SOFTWARE_WEBGL=1` enables an explicit software-rendering stress run; it is
not the default GPU path and its timing is not a physical-device performance score.

The normal graphics-path checks use Intel UHD Graphics 620 / ANGLE Direct3D11 in
headless Chromium, at 1440×900 and emulated 375×812, plus a 320 px information-page
width check. Recorded `readyMs` measures viewer initialization to the first drawn
scene, with separate procedural `buildMs` and `firstRenderMs`; it is not navigation
load time, a cold-network measurement or a controlled before/after benchmark.
Earlier forced-software desktop Kinnow checks exceeded their per-stage time
budget; no smooth-software-rendering claim is made. The reading view provides a
lighter path on unsuitable graphics hardware.

Remaining limits: physical phone and field frame-rate profiling, production network
measurements and legal/business sign-off. No payment was taken, WhatsApp message
sent or deployment performed. Route metadata is client-side; no SSR or HTTP 404
status work is claimed. The shared Three.js chunk still triggers Vite's existing
large-chunk warning.
