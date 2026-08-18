\# DESIGN.md — "BAAGH" Cinematic Hero Experience  
**\*\*Implementation contract for reproducing the existing prototype exactly.\*\***

Source of truth files in this project (read them alongside this doc — they are normative, this doc explains them):

| File | Role |  
|---|---|  
| \`Cinematic Hero.dc.html\` | The page: DOM overlay layer, typography, nav, chapter rail, grade layers, scroll spacer, tweak props |  
| \`cinema-stage.js\` | The \`\<cinema-stage\>\` custom element: the entire WebGL world, camera choreography, per\-frame overlay driving |  
| \`CinematicHeroOffline.dc.html\` \+ \`offline-boot.js\` \+ \`cinema-stage-standalone.js\` | Offline export variants (three.js loaded from inlined blobs instead of an import map) |  
| \`CinematicHero-offline.html\` | Compiled single\-file offline build (1.2 MB) |

**\*\*Non-negotiables.\*\*** Do not substitute flat images for the 3D world. Do not replace the procedural mango with a sphere or a sprite. Do not cut the camera journey to fewer stops. Do not swap the type pairing. Do not add sections, cards, testimonials, product grids, or footers — the page is deliberately one continuous world plus 10 typographic cues.

\---

\#\# 0\. Design reasoning (read first)

The brief's positioning is **\*\*"Fruit you never have to doubt."\*\*** Trust in a fruit business is not communicated by claims; it is communicated by *\*showing the chain of custody\**. So the homepage is not a page about the fruit — it **\*\*is\*\*** the journey of one piece of fruit, and the scrollbar is the camera dolly.

Three rules follow, and every number later in this document exists to serve them:

1\. **\*\*The experience is the interface.\*\*** At scroll 0 there are exactly three UI elements: a wordmark, a six-item nav, and a "Scroll to follow the fruit" prompt. No hero headline, no buttons. The brand statement and CTAs are withheld until the journey is complete (progress ≥ 0.93) — earning the claim before making it.  
2\. **\*\*One continuous world, not nine scenes.\*\*** All nine stations exist simultaneously in a single \`THREE.Scene\`, laid out along the world **\*\*+X axis\*\*** on one unbroken ground plane. The camera never cuts; it travels. Exponential fog (\`FogExp2\`) is the connective tissue — it hides the fact that station 5 is 16 m from station 1, so travel between stations reads as a haze-dissolve rather than a jump.  
3\. **\*\*Craftsmanship visible, technology invisible.\*\*** No lens flares, no bloom, no UI chrome over the render, no "3D website" tells. Contrast and warmth are managed with a film grade (tone mapping \+ CSS vignette/grain), so the render reads as photographed rather than rendered.

\---

\#\# 1\. Design tokens

Tokens are authored **\*\*inline\*\*** in the prototype (no stylesheet, no CSS variables) because the design must paint from the first streamed byte. When re-implementing in React/R3F you may lift these to a token file, but the *\*values\** must not drift.

\`\`\`js  
// colour  
color.ink            \= '\#16150f'   // page background behind canvas  
color.paper          \= '\#f2ece0'   // primary light text / primary button fill  
color.paperBright    \= '\#f6f1e6'   // hero statement text  
color.paperWarm      \= '\#f4efe4'   // scene headlines  
color.paperNav       \= '\#f4eee2'   // wordmark  
color.accent         \= '\#e8cfa0'   // eyebrow labels, link hover, progress fill  (tweakable)  
color.accentAlt      \= \['\#c8a06a', '\#9aa47f', '\#d8b8a0'\]  // curated accent options  
color.buttonInk      \= '\#1d2419'   // text on primary button  
color.selectionBg    \= '\#4a5a44'  
color.railTrack      \= 'rgba(244,238,226,.16)'  
color.railFill       \= 'rgba(232,207,160,.85)'  
color.railScrim      \= 'rgba(14,13,9,.42)'  
color.navText        \= 'rgba(244,238,226,.78)'  
color.navMeta        \= 'rgba(244,238,226,.42)'  
color.hairline       \= 'rgba(244,238,226,.32)'   // outline button border  
color.hairlineStrong \= 'rgba(242,236,224,.42)'   // secondary CTA border  
color.bodyMuted      \= 'rgba(242,236,224,.55)'   // supporting copy (most cues)  
color.bodyMuted58    \= 'rgba(242,236,224,.58)'  
color.bodyMuted60    \= 'rgba(242,236,224,.60)'  
color.bodyMuted62    \= 'rgba(242,236,224,.62)'  
color.italicLead     \= 'rgba(244,239,228,.92)'

// scene / world colour  
world.fog            \= '\#7d6e55'   // \= FogExp2 colour, also the horizon haze  
world.skyZenith      \= '\#5d6f74'  
world.skyUpperHaze   \= '\#c8b79a'  
world.skyHorizon     \= '\#f0dcbb'  
world.skyLowerHaze   \= '\#c2ab8c'  
world.skyGround      \= '\#3c3a33'  
world.sun            \= 'rgba(255,240,214,0.95)'  
world.keyLight       \= '\#ffd7a2'  
world.hemiSky        \= '\#9fb3bd'  
world.hemiGround     \= '\#3a2f22'  
world.rimLight       \= '\#bcd4dd'  
world.macroLight     \= '\#ffe0b4'  
world.backlight      \= '\#ffe6bd'  
world.doorLight      \= '\#ffe8c4'  
world.warmFill       \= '\#ffd9a4'  
world.bulb           \= '\#ffdfae'  
mat.woodLight        \= '\#a8845c'  
mat.woodDark         \= '\#7a5c3c'  
mat.leaf             \= '\#22301d'  
mat.hand             \= '\#33241a'  
mat.plaster          \= '\#8e8269'  
mat.stone            \= '\#6f6759'  
mat.cityNear         \= '\#4a4438'  
mat.road             \= '\#6b6459'  
mat.floorWood        \= '\#7d6042'  
mat.ceiling          \= '\#8b8069'  
mat.counter          \= '\#8f8571'  
mat.bowl             \= '\#cbbfa6'  
mat.basketBottom     \= '\#6d5636'  
mat.window           \= '\#e8d8b6'  
mat.shade            \= '\#d9cdb4'  
mat.mullion          \= '\#6a6252'  
mat.vanBody          \= '\#2f3a31'  
mat.vanCab           \= '\#33402f'  
mat.vanGlass         \= '\#2b3138'  
mat.vanBumper        \= '\#26251f'  
mat.vanStripe        \= '\#20261f'  
mat.tyre             \= '\#22201d'  
mat.scalePlate       \= '\#7d786c'  
mat.scaleBody        \= '\#4a463f'  
mat.loupe            \= '\#5d5a52'  
mat.pendantCord      \= '\#3a342b'  
mat.sheenColor       \= '\#e9d7a8'  
\`\`\`

**\*\*Why this palette.\*\*** Everything except the fruit sits in a narrow warm-neutral band (hue ≈ 60–90°, low chroma). The mango's gold-and-blush skin is the only saturated element in the frame, so the product is always the brightest, most colourful thing on screen without a single accent-colour rectangle being drawn. Greens are desaturated and dark (\`\#22301d\`) so foliage recedes; a saturated green would compete with the fruit and read "agri-tech".

RGB equivalents of the key hex values: \`\#16150f\` \= rgb(22,21,15) · \`\#f2ece0\` \= rgb(242,236,224) · \`\#e8cfa0\` \= rgb(232,207,160) · \`\#7d6e55\` \= rgb(125,110,85) · \`\#1d2419\` \= rgb(29,36,25) · \`\#f6f1e6\` \= rgb(246,241,230) · \`\#f4efe4\` \= rgb(244,239,228).

\---

\#\# 2\. Typography system

Two families only, loaded from Google Fonts with \`display=swap\`:

\`\`\`  
Newsreader — ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300  
IBM Plex Mono — wght@400;500  
\`\`\`

Body default: \`font-family: Newsreader, Georgia, serif\` on \`\<body\>\`.

**\*\*Why.\*\*** Newsreader at weight 300 is an editorial serif with high-contrast, slightly condensed forms — it reads as a broadsheet/food-journalism voice, i.e. authority without luxury cliché (no Didone, no script). IBM Plex Mono is used **\*\*only\*\*** for micro-labels, nav and buttons: monospace at 8–10.5 px with wide tracking reads as a *\*specification stamp\** — crate stencils, grading sheets, invoices. The pairing lets the page make emotional claims in the serif and factual claims in the mono, which is exactly the brand's split between craft and consistency. Never set body copy in the mono above 10.5 px, and never set the mono at weight 500 outside the nav.

| Role | Family | Size | Weight | Line height | Letter spacing | Case | Colour |  
|---|---|---|---|---|---|---|---|  
| Wordmark | Newsreader | 21px | 300 | normal | 0.34em | as\-typed (BAAGH) | \`\#f4eee2\` \+ \`text-shadow: 0 1px 14px rgba(0,0,0,.5)\` |  
| Wordmark meta ("est. 1961") | Plex Mono | 8px | 400 | normal | 0.20em | uppercase | \`rgba(244,238,226,.42)\` |  
| Nav item | Plex Mono | 10px | 400 | normal | 0.17em | uppercase | \`rgba(244,238,226,.78)\` |  
| Chapter rail item | Plex Mono | 8px | 400 | normal | 0.16em | uppercase | \`\#f2ece0\`, \`text-shadow: 0 1px 6px rgba(0,0,0,.6)\` |  
| Scroll prompt | Plex Mono | 9px | 400 | normal | 0.30em | uppercase | \`rgba(242,236,224,.62)\` |  
| Cue eyebrow (accent) | Plex Mono | 9px | 400 | normal | 0.24em / 0.26em | uppercase | \`\#e8cfa0\` (accent token) |  
| Scene 1 italic lead | Newsreader | 23px | 300 italic | 1.45 | normal | sentence | \`rgba(244,239,228,.92)\` |  
| Scene headline (S2, S4, S6, S7) | Newsreader | 27px | 300 | 1.35 | normal | sentence | \`\#f4efe4\` |  
| Scene headline (S5 selection) | Newsreader | 29px | 300 | 1.32 | normal | sentence | \`\#f4efe4\` |  
| Scene headline (S3 source) | Newsreader | 31px | 300 | 1.30 | normal | sentence | \`\#f4efe4\` |  
| Hero statement | Newsreader | 60px | 300 | 1.10 | −0.015em | sentence | \`\#f6f1e6\` \+ \`text-shadow: 0 2px 40px rgba(10,9,7,.6)\` |  
| Hero subline | Plex Mono | 10.5px | 400 | normal | 0.22em | uppercase | \`rgba(242,236,224,.62)\` |  
| Supporting cue copy | Plex Mono | 10px | 400 | 1.90 | 0.08em | sentence | \`rgba(242,236,224,.55)\` (S2 uses .58) |  
| Stat pair ("Kept · 6") | Plex Mono | 9px | 400 | normal | 0.16em | uppercase | \`rgba(242,236,224,.55)\` |  
| Button label | Plex Mono | 10px | 400 | normal | 0.20em | uppercase | see §13 |  
| Interstitial line (S8) | Plex Mono | 9px | 400 | normal | 0.28em | uppercase | \`rgba(242,236,224,.60)\` |

Type scale reasoning: the headline ladder **\*\*23 → 27 → 29 → 31 → 60\*\*** is not modular by accident of taste — size tracks *\*narrative weight\**. The whisper at the start is smallest; the "somewhere real" reveal (31px) is the largest mid-journey beat; the withheld brand statement (60px, \~2× the largest scene headline) is the only display-scale type in the entire page, so the payoff lands. \`text-wrap: pretty\` is set on the three longest headlines to prevent orphans at 300 weight, where a single hanging word is very visible.

\---

\#\# 3\. Spacing scale

Used values only — implement as a scale, do not "round to 8".

\`\`\`  
2, 8, 10, 11, 12, 14, 15, 16, 20, 22, 26, 30, 34, 40, 44, 52, 120, 130, 140, 196  
\`\`\`

Semantic assignments: nav padding \`26px 40px\`; nav item gap \`30px\`; wordmark internal gap \`11px\`; rail column gap \`10px\`; rail scrim padding \`12px 14px\`; rail-to-track gap \`14px\`; eyebrow→headline \`14px\`; headline→supporting copy \`12px\`; headline→stat row \`20px\`; hero statement→subline \`22px\`; subline→CTA row \`44px\`; CTA gap \`16px\`; button padding \`15px 30px\` (primary and secondary identical); scroll-prompt bottom offset \`52px\`; scroll prompt internal gap \`12px\`.

**\*\*Why 196px for left-anchored cues.\*\*** The chapter rail's painted box (rail at \`left:34px\`, 1px track \+ 14px gap \+ scrim with 14px horizontal padding) ends near 132px. 196px gives a \~64px optical gutter so the serif's left sidebearing never crowds the rail scrim. Right-anchored cues sit at 120–130px because there is no furniture on that side — the asymmetry is intentional: the composition breathes toward whichever side the 3D subject is *\*not\** occupying.

\---

\#\# 4\. Container widths, grid rules, layout

There is **\*\*no page grid and no max-width container.\*\*** This is a full-bleed cinematic canvas; a 12-column grid would fight the camera. Layout is a fixed-viewport stage with absolutely positioned cue blocks, each with its own \`max-width\` measure:

| Cue | Anchor | Measure |  
|---|---|---|  
| S1 lead | \`left:196px; top:50%; translateY(-50%)\` | 300px |  
| S2 "Chosen at source." | \`right:120px; top:54%\` (right\-aligned) | 280px |  
| S3 "…somewhere real." | \`left:196px; bottom:130px\` | 340px |  
| S4 "…know fruit." | \`right:130px; top:46%\` (right\-aligned) | 300px |  
| S5 "…good enough." | \`left:196px; top:48%\` | 330px |  
| S6 "Handled with care." | \`right:130px; bottom:140px\` (right\-aligned) | 290px |  
| S7 "Delivered with confidence." | \`left:196px; top:50%\` | 300px |  
| S8 interstitial | centred, \`bottom:120px\` | auto |  
| S9 hero block | \`inset:0\`, flex column centred | auto (single line at ≥1280px) |

Measures of 280–340px hold scene headlines to 2–3 lines at 27–31px — short enough to be read in one glance during a moving shot. Cue vertical anchors alternate (50% → 54% → bottom → 46% → 48% → bottom → 50% → bottom → centre) so consecutive beats never appear in the same place: the eye is led around the frame in step with the camera.

Sibling groups (nav, rail, CTA row, stat row) are all \`display:flex\` with \`gap\`. No margin-based spacing between siblings anywhere.

\---

\#\# 5\. Border radius, borders, shadows, opacity

**\*\*Radius.\*\*** \`2px\` on buttons, \`3px\` on the rail scrim. Nothing else is rounded. Rationale: at 2px the corner is a *\*cut\**, not a pill — it reads as printed label stock. Never raise these; rounded-card language would immediately make the page look like an ecommerce template.

**\*\*Borders.\*\*** Only two exist: nav "WhatsApp Order" \`1px solid rgba(244,238,226,.32)\`, secondary CTA \`1px solid rgba(242,236,224,.42)\`. Both hairlines, both semi-transparent so they sit *\*in\** the image rather than on top of it. No dividers, no card outlines, no section rules.

**\*\*Shadows.\*\*** No box shadows anywhere. Only two text shadows, both functional (legibility over a moving render, not decoration): wordmark \`0 1px 14px rgba(0,0,0,.5)\`, rail items \`0 1px 6px rgba(0,0,0,.6)\`, hero statement \`0 2px 40px rgba(10,9,7,.6)\`. All real depth in the page comes from the WebGL shadow map, the fog, and the CSS vignette.

**\*\*Opacity rules.\*\***  
\- Cue blocks: \`0 → 1\`, driven per-frame by scroll (§20).  
\- Chapter rail: active item \`1\`, inactive \`0.28\`.  
\- Grain layer: \`0.13\` (tweakable 0–0.30).  
\- Rail scrim: \`rgba(14,13,9,.42)\` \+ \`backdrop-filter: blur(2px)\`.  
\- Text colours carry their own alpha (see §1) — do not stack element opacity on top of them.

\---

\#\# 6\. Background treatments (the grade stack)

Five stacked fixed layers. Order and blend modes are load-bearing:

| z-index | Layer | Spec | Why |  
|---|---|---|---|  
| 0 | \`\<cinema-stage\>\` canvas | \`position:fixed; inset:0; 100vw/100vh; filter: saturate(1.08) contrast(1.07)\` | Slight grade in CSS is cheaper than a postprocessing pass and keeps the WebGL output neutral |  
| 1 | Vignette | \`radial-gradient(118% 82% at 50% 44%, rgba(0,0,0,0) 34%, rgba(12,11,8,0.62) 100%)\` | Centres attention on the fruit; corner falloff mimics a fast prime lens |  
| 2 | Split tone | \`linear-gradient(180deg, rgba(255,214,150,.16) 0%, rgba(255,214,150,0) 42%, rgba(24,32,40,.20) 100%)\`, \`mix-blend-mode: soft-light\` | Warm top / cool bottom \= dawn light, the same grade a colourist would apply |  
| 3 | Grain | 180×180 SVG \`feTurbulence\` (\`fractalNoise\`, baseFrequency 0.9, 3 octaves) tiled, \`opacity:.13\`, \`mix-blend-mode: overlay\` | Breaks up the flat gradients of low\-poly geometry; makes CG read as film emulsion |  
| 4 | Cue layer | \`position:fixed; inset:0; pointer-events:none\` | Typography floats over the world; only cues with opacity \> 0.5 accept pointer events |  
| 5 | Nav \+ chapter rail | fixed | Persistent chrome, always above the grade |

Page background beneath everything: \`\#16150f\`. Offline build must use the base64 form of the grain SVG (the utf8 form's inner \`url(\#n)\` breaks bundler asset resolution).

\---

\#\# 7\. Buttons

Both CTAs appear only in scene 9\. Same geometry, deliberately equal weight because the two collections serve two different customers — the design must not push everyday buyers toward gifting.

**\*\*Primary — "Explore Everyday Fresh"\*\***  
\`padding:15px 30px; background:\#f2ece0; color:\#1d2419; border-radius:2px; font: Plex Mono 10px/normal, letter-spacing .20em, uppercase\`  
Hover: \`background:\#e8cfa0\`.

**\*\*Secondary — "Discover Signature Collection"\*\***  
\`padding:15px 30px; background:transparent; border:1px solid rgba(242,236,224,.42); color:\#f2ece0; border-radius:2px;\` same type.  
Hover: \`border-color:\#e8cfa0; color:\#e8cfa0\`.

States to implement: default, hover (above), active (\`transform: translateY(1px)\`, no colour change — keep it physical, not flashy), focus-visible (\`outline: 1px solid \#e8cfa0; outline-offset: 3px\`), disabled (n/a — no disabled buttons in this design). Buttons are \`\<a\>\` elements; keyboard focus must reach them once the final cue is active, and they must be non-interactive (\`pointer-events:none\`) while opacity ≤ 0.5 so invisible CTAs are never tabbable.

Nav "WhatsApp Order" is a third button variant: \`padding:8px 15px; border:1px solid rgba(244,238,226,.32); border-radius:2px\`, inheriting nav type; hover follows the global link hover (\`\#e8cfa0\`).

\---

\#\# 8\. Navigation

\`position:fixed; top:0; left:0; right:0; z-index:5; display:flex; align-items:center; justify-content:space-between; padding:26px 40px\`.

Left cluster: wordmark \`BAAGH\` (placeholder mark — **\*\*replace with the real wordmark, keep the 0.34em tracking and 21px size\*\***) \+ \`est. 1961\` meta, \`display:flex; align-items:baseline; gap:11px\`.

Right cluster: \`display:flex; align-items:center; gap:30px\` — Everyday Fresh · Signature · Our Story · Fruit Guide · Corporate · WhatsApp Order (outlined).

Rules: never opaque, never a solid bar, no scroll-shrink, no mobile hamburger animation that covers the render. Global link styling is defined once (\`a {color:inherit; text-decoration:none}\`, \`a:hover {color:\#e8cfa0}\`) so any link added later inherits the palette instead of browser blue.

**\*\*Chapter rail\*\*** (\`left:34px; top:50%; translateY(-50%)\`, \`pointer-events:none\`): a 1px × 200px track \`rgba(244,238,226,.16)\` with a fill \`rgba(232,207,160,.85)\` scaled by \`scaleY(progress)\` from \`transform-origin: top\`; beside it a 9-item mono list on a \`rgba(14,13,9,.42)\` \+ \`blur(2px)\` scrim. Items: Fruit, Crate, Source, Hands, Selection, Packing, Journey, Arrival, Home. Active item opacity 1, others 0.28. It is a *\*chapter marker\**, not navigation — it is not clickable, because clicking would break the single continuous take.

\---

\#\# 9\. Section spacing / page height

There are no sections. Page height is one spacer: \`height: 940vh\` (tweakable 500–1600vh, step 20). 940vh ÷ 8 inter-keyframe segments ≈ **\*\*117vh of scroll per camera move\*\*** — long enough that each move feels weighted and no beat is skipped by one flick of a trackpad, short enough that the full journey is \~9 comfortable scroll gestures. If you change the page length, cue \`data-in\`/\`data-out\` values stay valid (they are normalised progress, not pixels).

\---

\#\# 10\. Responsive rules

Breakpoints: **\*\*≥1280px desktop (primary)\*\***, **\*\*768–1279px tablet\*\***, **\*\*\<768px mobile\*\***.

**\*\*Desktop (primary, designed at 1440–1920 × 900–1080).\*\*** Exactly as specified above. The hero statement sits on one line at ≥1280px.

**\*\*Tablet (768–1279px).\*\*** Keep the full camera journey. Reduce: hero statement 60 → 44px; scene headlines 27–31 → 24–26px; left cue anchor 196 → 132px; right cue anchors 120/130 → 88px; nav padding 26/40 → 20/28px; nav gap 30 → 20px; chapter rail keeps the scrim but drops to \`left:20px\`. Renderer pixel ratio cap 1.6. Shadow map 2048 → 1024\.

**\*\*Mobile (\<768px).\*\*** The journey is preserved and simplified — **\*\*not\*\*** restacked into cards.  
\- Camera: same 9 keyframes, but widen every \`fov\` by \+6° to compensate for the portrait aspect (subjects stay in frame), and raise the macro keyframe distance from 0.155 → 0.19 so the fruit does not clip the near plane.  
\- Type: hero statement 32px, scene headlines 21px, supporting copy 10px/1.8, all cues centred (\`left:24px; right:24px; text-align:center\`), vertical anchors compressed to 44%/56%/bottom 96px.  
\- Chrome: nav collapses to wordmark \+ a single "Order" mono link; chapter rail hidden (\`showChapters: false\`) — vertical space is too scarce for it.  
\- CTAs stack full-width with 12px gap, \`padding:16px 24px\`.  
\- Performance: see §16.

\---

\#\# 11\. Motion, durations, easing, scroll

**\*\*There are no CSS transitions or keyframe animations in this design.\*\*** Every motion is computed per frame inside the single \`requestAnimationFrame\` loop in \`cinema-stage.js\`, from one scalar: normalised scroll progress. This is deliberate — mixing CSS easing with a scrubbed camera produces drift between type and image.

\`\`\`js  
progress   \= clamp(scrollY / (scrollHeight \- innerHeight), 0, 1)   // authored target  
cur       \+= (target \- cur) \* min(1, dt \* 3.4)                     // scroll damping ("camera weight")  
s          \= cur \* (K.length \- 1)                                  // 0..8 along 9 keyframes  
i          \= min(K.length \- 2, floor(s))  
f          \= smoothstep(s \- i)                                     // x\*x\*(3-2x) per segment  
pos        \= lerp(K\[i\].p, K\[i\+1\].p, f)  
tgt        \= lerp(K\[i\].t, K\[i\+1\].t, f)  
fov        \= lerp(K\[i\].fov, K\[i\+1\].fov, f)  
curPos.lerp(pos, min(1, dt \* 6))                                   // second-order smoothing  
curTgt.lerp(tgt, min(1, dt \* 6))  
curFov    \+= (fov \- curFov) \* min(1, dt \* 5)  
\`\`\`

Easing/timing constants and why they exist:

| Constant | Value | Purpose |  
|---|---|---|  
| Scroll damp rate | \`dt \* 3.4\` (≈ 300 ms to settle) | Gives the camera mass. Direct 1:1 scroll feels twitchy and cheap |  
| Segment easing | \`smoothstep\` | Ease\-in\-out at every station, so each stop *\*arrives\** and *\*departs\** instead of sliding through |  
| Position/target smoothing | \`dt \* 6\` (≈ 170 ms) | Removes micro\-jitter from trackpad scroll without adding lag |  
| FOV smoothing | \`dt \* 5\` | Slightly slower than position so focal\-length changes read as a breath, not a zoom |  
| Handheld float | \`sin(t·0.00042) × 0.0035 × (1 − cur·0.5)\` on camera Y | Sub\-centimetre bob ≈ 24 s period; amplitude halves by the end so the final composition is dead calm |  
| Handheld roll | \`+= sin(t·0.00031) × 0.0022\` on camera Z rotation | \~34 s period; the two prime\-ish periods never sync, so the float never looks like a loop |  
| Hero fruit idle spin | \`dt \* 0.045 × (1 − min(1, cur·4))\` | Almost imperceptible turn during the macro shot; stops entirely by 25% progress |  
| Examined fruit spin | \`dt \* 0.25 × max(0, 1 − |cur − 0.40|·7)\` | Only spins within ±14% progress of the hands beat — the expert is turning it over |  
| Cue fade window | \`0.028\` progress in and out | ≈ 26vh of scroll per fade at the default page height: a deliberate dissolve, never a pop |  
| Cue rise | \`translateY((1 − opacity) × 14px)\` | 14px of lift tied to the same scalar — type drifts up into place with the camera |  
| Grading beat | \`gp \= clamp((cur − 0.47)·8, 0, 1)\`, per\-fruit stagger \`− i·0.05\`, \`smoothstep\` | Accept/reject happens across \~12% of scroll with a 9\-step stagger, so it reads as a hand working, not a switch |

**\*\*Scroll behaviour.\*\*** Native scroll only (\`html { scroll-behavior: auto }\`). No scrolljacking, no snap points, no \`scrollIntoView\`, no locked wheel handlers — the user keeps full control of pace and can stop anywhere. The scroll listener is \`{ passive: true }\` and only stores the target; all work happens in the rAF loop. Never derive scroll from \`wheel\` events.

**\*\*Parallax\*\*** is not faked in CSS. It is a by-product of real perspective: near props (crate stacks, sacks, baskets, the overhead beams at \`y \= 2.15\` and \`1.72\`) sweep past far faster than the orchard rows 20–30 m back, and fog attenuates the far layer. Foreground occluders are placed at every station specifically to generate this differential.

**\*\*Depth of field.\*\*** No \`postprocessing\`/bokeh pass (cost, and it fights the grain). Depth is sold three ways: (1) very short camera-to-subject distance at macro keyframes with a 0.008 near plane, so background falls into fog; (2) \`FogExp2\` density modulation; (3) the CSS vignette darkening the frame edges. If you later add a real DOF pass, target focal distance \= \`camera.position.distanceTo(curTgt)\`, aperture no wider than f/4 equivalent — anything stronger turns the world to mush and breaks the "physically believable" requirement.

**\*\*Chapter transitions.\*\*** Chapter \= nearest keyframe index (\`round(cur × 8)\`); the rail cross-fades opacity only (1 ↔ 0.28) with no slide, and the progress bar is a continuous \`scaleY\`. Atmosphere also transitions with progress:  
\`\`\`js  
fog.density        \= 0.08 \+ (1 − min(1, cur·3))·0.03 − max(0, cur − 0.8)·0.09  
toneMappingExposure \= 0.6 \+ min(1, cur·7)·0.32 − max(0, cur − 0.82)·0.1  
macroPointLight.intensity \= 0.3 × max(0, 1 − cur·6)  
arrivedCrate.visible \= cur \> 0.78 && cur \< 0.94  
\`\`\`  
Reasoning: the opening is fog-heavy and under-exposed (intimate, unresolved — "what am I looking at?"); the world *\*opens up\** as the story widens; the interior pulls exposure back down 0.1 so the final frame is calm and settled rather than blown out.

\---

\#\# 12\. Loading behaviour

\- Three.js is loaded via a pinned import map (\`three@0.184.0\`, SRI hashes present in the file). The stage mounts via \`component-from-global-scope="cinema-stage"\`, so the DOM overlay (nav, rail, first cue) paints **\*\*before\*\*** WebGL is ready — the page is never blank.  
\- All textures are generated procedurally on the CPU at boot (1× 1024² skin triple, 2× 512² wood, 5× 256² fibre, 1× 1024×512 sky). Budget ≈ 300–500 ms on a laptop; there is no network wait for assets.  
\- No spinner, no progress percentage, no "loading experience" splash: the fixed background \`\#16150f\` plus already-painted typography is the loading state. Adding a loader would announce the technology.  
\- Offline build: \`offline-boot.js\` polls \`window.\_\_resources\`, fetches the inlined three.module.js \+ three.core.js, rewrites the relative core import to a blob URL, \`import()\`s it into \`window.THREE\_NS\`, then imports the stage module. Guarded by \`window.\_\_offlineBooted\` against double-boot.

\---

\#\# 13\. Reduced motion and performance fallbacks

**\*\*\`prefers-reduced-motion: reduce\` (must be implemented in the production build):\*\***  
\- Remove the handheld float and roll (both sine terms) and the idle fruit rotations.  
\- Set scroll damping to 1 (camera tracks scroll exactly, no inertia) so nothing continues moving after the user stops.  
\- Keep the camera journey itself — it is user-driven, not autoplaying, and removing it would remove the content.  
\- Cue fades: keep opacity, drop the 14px translate.

**\*\*Mobile / low-power fallback ladder\*\*** (apply in this order as capability drops):  
1\. \`renderer.setPixelRatio(min(devicePixelRatio, 1.5))\`, shadow map 1024², \`PCFShadowMap\`.  
2\. Disable shadow casting on props (crate stacks, sacks, baskets, trees, city blocks); keep it on the fruit, crates and tables at the current station.  
3\. Halve orchard tree count (8×11 → 4×7) and city blocks (26 → 14).  
4\. Mango geometry \`SphereGeometry(0.5, 110, 90)\` → \`(0.5, 64, 48)\`; keep all three seeded variants.  
5\. If WebGL is unavailable: render the DOM overlay over a static warm gradient (\`\#16150f\` → \`\#2a2318\`) with the cue copy revealed on scroll. Never ship a card layout as the fallback.

Frame budget target: 60 fps at 1440×900 on integrated graphics; the current scene is \~120k triangles, 1 shadow-casting directional light, 3 point/spot lights, 1 draw-call-per-mesh (no instancing yet — instancing the orchard and city is the first optimisation if needed).

\---

\#\# 14\. 3D scene composition (world layout)

Single \`THREE.Scene\`, y-up, metres, one \`PlaneGeometry(200, 90)\` ground at y=0 (\`soilMat\`). Stations are spaced along \+X:

| \# | Station | World X | Key contents |  
|---|---|---|---|  
| 1–3 | Sorting table \+ hero crate \+ orchard | 0 | table(0, 2.6×1.4, h .76); crate at (0, .79, 0); hero mango at (0, .885, 0\) rot (.1,.6,.28); 4 companion mangoes; cloth at (.95,.795,.12); 88 trees in 8 rows from z −4.5 to −28; crate stack (−1.35, .9), basket (1.5, 1.0), sack (−2.1, 1.6), beam (0.2, 2.15, 1.7, len 6\) |  
| 4 | The expert hands | 8 | table(8, 2.2×1.2, h .78, dark); hand group at (7.9,.86,.02) ry −.35 scale .88; second hand at (8.42,.85,−.16) ry 2.35; examined mango (7.96,.95,.06); spotlight backlight at (8.7,2.1,−1.6) → (8.0,.9,.1), intensity 26, angle .7, penumbra .85 |  
| 5 | Grading | 16 | table(16, 3.0×1.4); accept tray crate (15.42,.8,−.06) s.68 ry .16; reject crate (16.66,.8,.2) s.62 ry −.28; 9 graded mangoes on a 5×2 lattice from (15.82,.845,−.14), step .19 x / .26 z; loupe torus (16.3,.8,−.32) |  
| 6 | Packing | 24 | table(24, 2.8×1.3, dark); pack crate (24,.79,0) s1.05; 6 wrapped mangoes 3×2 from (23.76,.885,−.09); paper discs r.10 at y .80; scale group (24.95,.81,.18); paper stack (23.1,.81,.2); crate stacks (22.9, .8, n4) and (25.3, .75, n2) |  
| 7 | City at dawn | 32 | 26 hashed blocks (w .9–2.6, h 1.6–7.0, d .9–2.5) between x 29–38, z −3 to −19, alternating plaster/stone; road plane 26×3.2 at (34,.005,1.2); van group at (33.9,0,.5) ry −.5; travel crate on the bed at (32.6,.72,1.5); two dark near\-frame blocks at (26.4,·,−5.2) and (38.2,·,−6.4) |  
| 8–9 | The home | 40 | floor 9×7 at (40,.012,−1); back wall (40,1.7,−4.4), side wall (44.3,1.7,−1), split left walls (36.4,1.7,−3.4) and (36.4,1.7,.35), front wall (40,1.7,2.4), ceiling (40,3.36,−1); window plane 2.0×1.9 at (38.6,1.75,−4.32) \`MeshBasicMaterial \#e8d8b6\` \+ mullion; rug 3.2×2.2 at (40,.02,−.5); dining table (40, 2.0×1.1, h .75, dark, z −.4); bowl hemisphere r.24 at (40,.86,−.4); 5 mangoes in the bowl on a radial ring r.10/.085 (index 4 raised .055); two chairs at (40,.42, ry π) and (40,−1.22, ry 0); pendant cord \+ cone shade at (40,1.78,−.4) with point light (40,1.66,−.4); counter 4.2×0.9×0.75 at (40.6,.45,−3.6); arrived crate (40.45,.815,−.62) ry .22, visible only 0.78 \< cur \< 0.94; doorway slab (37.3,1.25,−3.0); door spotlight (37.6,3,−3) → (40,.8,−.6) intensity 22 |

**\*\*Why one axis.\*\*** A linear world means the camera path is monotonic in X, so scroll direction always maps to forward/backward travel — no risk of the user scrolling and appearing to move sideways. Fog density 0.08 gives \~90% extinction by 28 m, i.e. the next station is invisible until you are nearly at it.

\---

\#\# 15\. Camera specification

\`PerspectiveCamera(fov 38 initial, aspect \= w/h, near 0.008, far 260)\`. Near plane must stay at 0.008 — the macro keyframe is 0.155 m from a 0.16 m fruit.

| \# | Chapter | position (x,y,z) | lookAt (x,y,z) | fov | Intent |  
|---|---|---|---|---|---|  
| 1 | Fruit | 0.02, 0.905, 0.155 | 0, 0.888, 0 | 30 | Extreme macro. Skin fills the frame; location unreadable → curiosity |  
| 2 | Crate | 0.28, 1.36, 0.66 | 0.02, 0.885, −0.02 | 40 | First context: the fruit is *\*in\** something built by hand |  
| 3 | Source | 0.05, 1.5, 2.55 | 0.0, 0.98, −2.6 | 45 | Widest outdoor frame; orchard rows recede into haze |  
| 4 | Hands | 7.74, 1.06, 0.5 | 8.02, 0.95, 0.05 | 26 | Longest lens of the journey → compressed, intimate, portrait\-like |  
| 5 | Selection | 15.86, 1.5, 1.14 | 16.12, 0.85, −0.04 | 30 | Slightly high angle so accept/reject motion is legible |  
| 6 | Packing | 23.66, 1.5, 1.22 | 24.16, 0.86, −0.02 | 37 | Working distance — hands\-and\-materials view |  
| 7 | Journey | 30.6, 4.3, 8.8 | 34.6, 1.0, −0.6 | 44 | Only elevated establishing shot; the crate becomes small in a city |  
| 8 | Arrival | 38.25, 1.66, 1.85 | 40.05, 1.0, −1.5 | 36 | Threshold: entering the home, eye height |  
| 9 | Home | 40.02, 1.06, 0.44 | 40.0, 0.885, −0.42 | 30 | Seated height, still, symmetrical — the calm frame under the brand statement |

FOV choreography (30 → 40 → 45 → **\*\*26\*\*** → 30 → 37 → 44 → 36 → 30\) is a lens kit, not noise: wide for context, long for people. Keyframes 1 and 9 share fov 30 and near-identical framing height — the journey ends the way it began, but now you know where the fruit has been.

Key light rig follows the camera every frame (\`key.position.x \= camera.position.x − 4.5\`, target \`(camera.position.x, 0.6, 0)\`) so a single 2048² shadow map covering ±14 m stays valid across a 44 m world. Do not remove this or shadows disappear after station 3\.

\---

\#\# 16\. Lighting

| Light | Type | Colour | Intensity | Position / params | Purpose |  
|---|---|---|---|---|---|  
| Key | Directional, castShadow | \`\#ffd7a2\` | 2.9 | (−4.5, 5.5, 4.2), follows camera X; shadow 2048², near .5 far 40, ±14 x, \+10/−6 y, bias −0.0006, normalBias 0.012 | Low warm dawn sun, front\-left — rakes the fruit's skin so bump and blush read |  
| Ambient sky | Hemisphere | sky \`\#9fb3bd\` / ground \`\#3a2f22\` | 0.22 | — | Cool sky fill \+ warm bounce; kept low so shadows stay deep |  
| Rim | Directional | \`\#bcd4dd\` | 0.5 | (7, 4, −6) | Cool back edge separating subjects from haze |  
| Macro | Point | \`\#ffe0b4\` | 0.3 → 0 by cur ≈ .17 | (−0.16, 1.02, 0.2), dist 1.2, decay 2 | Practical for the opening close\-up only |  
| Hands backlight | Spot | \`\#ffe6bd\` | 26 | (8.7, 2.1, −1.6) → (8.0, .9, .1), angle .7, penumbra .85, decay 1.7 | Turns the hands into rim\-lit silhouettes: gesture implied, anatomy not described |  
| Door light | Spot | \`\#ffe8c4\` | 22 | (37.6, 3, −3) → (40, .8, −.6), angle .6, penumbra .7, decay 1.6 | Light spilling in with the delivery |  
| Interior fill | Point | \`\#ffd9a4\` | 2.2 | (41.4, 1.9, −1.2), dist 7, decay 2 | Keeps the room warm rather than grey |  
| Pendant bulb | Point | \`\#ffdfae\` | 1.6 | (40, 1.66, −.4), dist 4.2, decay 2 | Practical over the bowl; motivates the final frame's pool of light |

Renderer: \`ACESFilmicToneMapping\`, exposure scrubbed 0.6 → 0.92 → 0.82 (§11), \`SRGBColorSpace\`, \`PCFSoftShadowMap\`, \`antialias: true\`, \`setPixelRatio(min(dpr, 1.85))\`. Environment: PMREM from the procedural sky, \`environmentIntensity 0.34\`, \`backgroundIntensity 0.55\` — low, so IBL adds sheen without flattening the key light.

\---

\#\# 17\. Materials and procedural textures

All textures are canvas-generated at runtime (\`CanvasTexture\`, \`RepeatWrapping\`, anisotropy 8). No image files ship. Noise stack: \`hash\` → bilinear \`vnoise\` → \`fbm\` (octave gain .5, lacunarity 2.07).

**\*\*Mango skin — 1024×1024, three maps\*\*** (\`skinMaps()\`): colour ramp green shoulder \`rgb(68,88,22)\` → gold \`rgb(176,106,24)\` over v 0.06–0.56; sun blush band centred at u 0.28 (+112 R, −40 G); fbm mottling ±20; fine fbm at 130× for pore detail; lenticels as \~0.35%-probability pale specks (+46/+40/+26); blemishes where \`fbm(u·5+11, v·5+3) \> 0.74\`, darkening up to −70 R. Bump map \= same fine noise, mid-grey 128 base. Roughness map \= 168 base, −46 where blushed (waxy bloom), \+60 on blemishes, −10 with ripeness.  
Material: \`MeshPhysicalMaterial { bumpScale .05, roughness .72, clearcoat .22, clearcoatRoughness .55, sheen .35, sheenColor \#e9d7a8, sheenRoughness .7 }\`.  
**\*\*Why:\*\*** natural imperfection is the entire credibility argument. A clean gradient sphere reads "3D asset"; asymmetric blush \+ lenticels \+ one or two blemishes read "this is a real fruit someone picked". Clearcoat stays low (0.22) — glossy plastic was explicitly forbidden; sheen carries the dusty bloom instead.

**\*\*Mango geometry\*\*** (\`mangoGeometry(seed)\`): \`SphereGeometry(0.5, 110, 90)\` deformed — y × 1.52, cubic taper 0.94 − 0.30·|y/0.76|³, x × taper·1.02, z × taper·0.86, asymmetric belly \`+ (max(0, .72 − t))²·0.10 − 0.02\` on x, \`sin(t·π)·0.018\` on z, fbm displacement ±5.5%, stem dimple −0.055 at (0.02, 0.74, 0), then uniform scale 0.105 → \~0.16 m long. Three seeds (0, 1.7, 3.4) are generated and reused across \~26 fruit instances so no two neighbours are identical while geometry memory stays flat.

Other materials: \`woodMat\` (512² grain, \`\#a8845c\`, rough .85), \`woodDark\` (\`\#7a5c3c\`, rough .9), \`paperMat\` (fibre 196/184/160, rough .95, DoubleSide, vertex-jittered liner ±0.02), \`clothMat\` (96/104/88, rough 1), \`soilMat\` (56/47/34, rough 1), \`leafMat\` (\`\#22301d\`, rough 1, flatShading), \`skinTone\` (\`\#33241a\`, rough .95), \`plaster\` (\`\#8e8269\`), \`stone\` (\`\#6f6759\`), plus the per-object materials listed in §1. Palette discipline: 11 shared materials cover the whole world; per-object materials exist only for the van, scale, loupe, bowl, window and lamp.

\---

\#\# 18\. Components, states, interaction

Reusable DOM components (implement as five components, no more):

1\. **\*\*\`\<CinemaStage\>\`\*\*** — the WebGL host. Props: none in the prototype; it reads \`\[data-in\]\`, \`\[data-chapter\]\`, \`\[data-progress\]\` from the document each frame and writes inline styles. In React/R3F, invert this: hoist \`progress\` to context and let cues subscribe. States: pre-init (transparent, page background shows), running, context-lost (re-init on \`webglcontextrestored\`).  
2\. **\*\*\`\<SiteHeader\>\`\*\*** — wordmark \+ nav. States: default, link hover (\`\#e8cfa0\`), focus-visible outline.  
3\. **\*\*\`\<ChapterRail\>\`\*\*** — track \+ fill \+ 9 labels. States: active/inactive item; hidden when \`showChapters \=== false\`.  
4\. **\*\*\`\<ScrollCue\>\`\*\*** — the repeated typographic block. Props: \`in\`, \`out\` (normalised progress), anchor, measure, optional eyebrow, headline, support, stats, actions. States: hidden (\`opacity 0\`, \`translateY 14px\`, \`pointer-events none\`), entering/leaving (scrubbed), active (\`opacity 1\`, \`translateY 0\`, \`pointer-events auto\` above 0.5).  
5\. **\*\*\`\<CtaPair\>\`\*\*** — primary \+ secondary link buttons (§7).

Interaction rules: scroll is the only navigation. No click targets on the canvas, no drag-orbit (it would break the authored composition), no hover effects on 3D objects, no cursor customisation. All hover/focus states live on real links so keyboard and screen-reader users get the copy in DOM order regardless of camera position. Cue blocks must remain in the accessibility tree (they are real text, not canvas), and the final CTA pair must be reachable by keyboard.

\---

\#\# 19\. Content hierarchy and exact copy

Order of revelation is the argument: *\*what am I looking at → where is it from → who chose it → how was it judged → how was it handled → how did it travel → it arrived → here is who we are.\**

| Progress in/out | Copy (verbatim) |  
|---|---|  
| 0 → 0.075 | \`Scroll to follow the fruit\` |  
| 0.005 → 0.07 | \`Chaunsa · Mid-season\` / \`One fruit, before anyone else has seen it.\` |  
| 0.10 → 0.20 | \`Chosen at source.\` / \`Every crate is filled by hand, on the morning it is picked.\` |  
| 0.235 → 0.325 | \`Multan · 05:40\` / \`This fruit came from somewhere real.\` |  
| 0.375 → 0.455 | \`Chosen by people who know fruit.\` / \`Three generations of wholesale judgement, in one hand.\` |  
| 0.49 → 0.575 | \`Not everything that looks good is good enough.\` / \`Kept · 6\` \`Set aside · 3\` |  
| 0.61 → 0.695 | \`Handled with care.\` / \`Wrapped, weighed and placed — never poured.\` |  
| 0.735 → 0.815 | \`Delivered with confidence.\` / \`Same-day, temperature-held, across the city.\` |  
| 0.845 → 0.915 | \`It arrives the way it left.\` |  
| 0.93 → 1.01 | \`Fruit you never have to doubt.\` / \`Chosen with generations of fruit expertise\` / CTAs: \`Explore Everyday Fresh\`, \`Discover Signature Collection\` |  
| persistent | \`BAAGH\` · \`est. 1961\` · nav: \`Everyday Fresh\` \`Signature\` \`Our Story\` \`Fruit Guide\` \`Corporate\` \`WhatsApp Order\` |  
| chapter rail | \`Fruit\` \`Crate\` \`Source\` \`Hands\` \`Selection\` \`Packing\` \`Journey\` \`Arrival\` \`Home\` |

Cue windows are non-overlapping with \~0.02–0.03 gaps: never two headlines on screen at once. Fade maths special-cases the ends so the opening cues are fully visible at progress 0 (\`in ≤ 0.006 ⇒ f1 \= 1\`) and the hero block reaches full opacity and becomes clickable at progress 1 (\`out ≥ 1 ⇒ f2 \= 1\`).

**\*\*Placeholders to replace before launch:\*\*** \`BAAGH\` wordmark and \`est. 1961\` (temporary mark per brief); the low-poly hands (stand-in for a photoreal hand scan); orchard/city geometry is stylised-by-intent, not a placeholder.

\---

\#\# 20\. Asset inventory

| Asset | Type | Dimensions | Where used | Notes |  
|---|---|---|---|---|  
| Mango skin colour map | procedural canvas | 1024×1024 | every mango (\~26 instances) | \`skinMaps().map\` |  
| Mango bump map | procedural canvas | 1024×1024 | same | \`bumpScale .05\` |  
| Mango roughness map | procedural canvas | 1024×1024 | same | waxy/dry variation |  
| Wood grain A | procedural canvas | 512×512 | tables, crate bases, floor | \`woodTexture(0)\` |  
| Wood grain B | procedural canvas | 512×512 | crate slats, dark tables, chairs, beams | \`woodTexture(1)\` |  
| Fibre — paper | procedural canvas | 256×256 | crate liners, wraps, paper stack | \`fibreTexture(196,184,160,60)\` |  
| Fibre — cloth | procedural canvas | 256×256 | table cloth, sleeves | \`fibreTexture(96,104,88,130)\` |  
| Fibre — soil | procedural canvas | 256×256 | ground plane | \`fibreTexture(56,47,34,40)\` |  
| Fibre — basket | procedural canvas | 256×256 | baskets | \`fibreTexture(126,100,66,120)\` |  
| Fibre — sack | procedural canvas | 256×256 | sacks | \`fibreTexture(122,108,80,140)\` |  
| Fibre — rug | procedural canvas | 256×256 | home rug | \`fibreTexture(120,108,88,150)\` |  
| Dawn sky equirect | procedural canvas | 1024×512 | \`scene.background\` \+ PMREM environment | 5\-stop gradient \+ radial sun at (320,250) r260 |  
| Film grain | inline SVG \`feTurbulence\` | 180×180, tiled | fixed overlay z3 | base64 form required for the offline bundle |  
| Fonts | Google Fonts | — | all type | Newsreader 300/400/300i, IBM Plex Mono 400/500 |  
| Splash thumbnail | inline SVG | 1200×800 viewBox | offline bundle unpack screen | \`\#16150f\` bg, ellipses |

No raster images, no GLTF/OBJ models, no HDRIs, no video. Every 3D object is procedural: mango (deformed sphere), crate, table, chair, basket, sack, beam, tree (cylinder \+ 9 icosahedra), city block, van (7 boxes \+ 4 cylinders), scale, loupe (torus), bowl (partial sphere), pendant (cone \+ cylinder), window plane.

\---

\#\# 21\. Dependencies and platform requirements

\- **\*\*three.js 0.184.0\*\*** — only \`three\` (no addons; the import map is a closed set with SRI hashes). Core classes used: \`WebGLRenderer\`, \`Scene\`, \`PerspectiveCamera\`, \`FogExp2\`, \`PMREMGenerator\`, \`CanvasTexture\`, \`DirectionalLight\`, \`HemisphereLight\`, \`PointLight\`, \`SpotLight\`, \`MeshPhysicalMaterial\`, \`MeshStandardMaterial\`, \`MeshBasicMaterial\`, \`SphereGeometry\`, \`BoxGeometry\`, \`PlaneGeometry\`, \`CylinderGeometry\`, \`CapsuleGeometry\`, \`IcosahedronGeometry\`, \`TorusGeometry\`, \`ConeGeometry\`, \`CircleGeometry\`, \`Clock\`.  
\- **\*\*WebGL 2\*\*** with float texture support; \~120k triangles, 1 shadow map. No custom GLSL, no shader chunks, no postprocessing pass in the current design — if you port to R3F, \`@react-three/fiber\` \+ \`@react-three/drei\` are acceptable, but do not introduce \`EffectComposer\` bloom (explicitly off-brand).  
\- Google Fonts (or self-hosted equivalents — self-hosting preferred in production).  
\- No animation library. GSAP/Framer are unnecessary: all motion is scrubbed from scroll in one rAF loop. If you must use GSAP ScrollTrigger, use it only as the progress source (\`scrub: true\`) and keep the interpolation maths in §11 unchanged.  
\- Target: desktop Chrome/Safari/Firefox current; iOS Safari 16+ for the mobile ladder.

\#\# 22\. Tweakable parameters (already exposed in the prototype)

| Prop | Editor | Default | Range | Effect |  
|---|---|---|---|---|  
| \`journeyLength\` | range | 940 | 500–1600 vh, step 20 | Scroll spacer height \= pace of the whole film |  
| \`showChapters\` | boolean | true | — | Chapter rail visibility |  
| \`grain\` | range | 13 | 0–30 % | Grain overlay opacity |  
| \`accent\` | color | \`\#e8cfa0\` | \`\#e8cfa0\`, \`\#c8a06a\`, \`\#9aa47f\`, \`\#d8b8a0\` | Eyebrow label colour (and, by convention, progress fill / link hover) |

Keep these four as the only authored knobs. They are the parameters a director would actually adjust — pace, chrome, grain, warmth — and each was chosen because it changes the *\*feel\** without letting anyone accidentally break the composition.

