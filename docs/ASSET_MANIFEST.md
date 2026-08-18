# ASSET_MANIFEST.md
Complete inventory for the shipped prototype. **There are no binary assets in this project** — no image, model, audio, or icon files exist. Every visual surface is generated at runtime on a `<canvas>` or drawn as inline SVG.

Project files:

```
Cinematic Hero.dc.html          page (DOM overlay + helmet + tweak props)
cinema-stage.js                 the WebGL world (ES module, imports "three")
cinema-stage-standalone.js      same, with `const THREE = window.THREE_NS` instead of the import
CinematicHeroOffline.dc.html    offline variant of the page (blob-boot instead of import map)
offline-boot.js                 offline three.js loader
CinematicHero-offline.html      compiled single-file build, 1.2 MB
support.js                      DC runtime (host-provided, not authored)
DESIGN.md, docs/*.md            documentation
```

## 1. Images

| Filename | Path | Type | Dimensions | Used | Local/External |
|---|---|---|---|---|---|
| — | — | — | — | — | — |

**None.** No `.png`, `.jpg`, `.webp`, `.svg` files, no `<img>`, no CSS `url()` pointing at a file. The only `background-image` is an inline data-URI SVG (see §5).

## 2. 3D models

| Filename | Path | Type | Used | Local/External |
|---|---|---|---|---|
| — | — | — | — | — |

**None.** No `.glb`/`.gltf`/`.obj`/`.fbx`, no loaders imported. All geometry is built procedurally in `cinema-stage.js` from three.js primitives:

| Object | Construction | Instances |
|---|---|---|
| Mango | `SphereGeometry(0.5, 110, 90)` deformed in `mangoGeometry(seed)` — y×1.52, cubic taper, asymmetric belly, fbm displacement ±5.5%, stem dimple, uniform scale 0.105 (≈0.16 m) | 3 seeded geometries (0, 1.7, 3.4) reused across ~26 meshes |
| Table | 1 `BoxGeometry` top + 4 leg boxes | 6 |
| Crate | base box + 4 slat boxes + vertex-jittered `PlaneGeometry(12×8)` paper liner | ~20 (incl. stacks) |
| Tree | `CylinderGeometry` trunk + 9 `IcosahedronGeometry(detail 1)` flat-shaded canopy blobs | 88 orchard + 9 elsewhere |
| Hand | `SphereGeometry` palm (scaled 1.15/0.5/1.0) + 4 `CapsuleGeometry` fingers + 1 thumb + `CylinderGeometry` sleeve | 2 (`clone()`), scale 0.88 |
| City block | `BoxGeometry`, hashed w/h/d | 26 + 2 near-frame |
| Van | 3 body boxes + bumper + stripe + glass box + 4 `CylinderGeometry` wheels | 1 |
| Basket | open-ended `CylinderGeometry` + `CircleGeometry` bottom | 4 |
| Sack | `SphereGeometry(20,14)` scaled 1/1.25/0.85 | 4 |
| Chair | seat + back + 4 legs (boxes) | 2 |
| Bowl | partial `SphereGeometry(0.24, 40, 24, 0, 2π, 0.52π, 0.48π)`, DoubleSide | 1 |
| Loupe | `TorusGeometry(0.05, 0.008, 10, 30)` | 1 |
| Scale | `CylinderGeometry` plate + box body | 1 |
| Pendant | `ConeGeometry(0.22, 0.24, 28, 1, true)` shade + thin cylinder cord | 1 |
| Room / ground / road / rug / window | `PlaneGeometry` + `BoxGeometry` | — |

Scene total ≈ 120k triangles, one mesh per object (no instancing).

## 3. Textures

All are `CanvasTexture` objects created at boot. `wrapS/wrapT = RepeatWrapping`, `anisotropy = 8`. Noise: `hash` → bilinear `vnoise` → `fbm` (gain 0.5, lacunarity 2.07).

| Asset | Generator | Type | Dimensions | Used on | Local/External |
|---|---|---|---|---|---|
| Mango colour | `skinMaps().map` | CanvasTexture | 1024×1024 | all mangoes (`MeshPhysicalMaterial.map`) | runtime, local |
| Mango bump | `skinMaps().bump` | CanvasTexture | 1024×1024 | `bumpMap`, `bumpScale 0.05` | runtime, local |
| Mango roughness | `skinMaps().rough` | CanvasTexture | 1024×1024 | `roughnessMap` | runtime, local |
| Wood grain A | `woodTexture(0)` | CanvasTexture | 512×512 | tables, crate bases, home floor | runtime, local |
| Wood grain B | `woodTexture(1)` | CanvasTexture | 512×512 | crate slats, dark tables, chairs, beams | runtime, local |
| Fibre — paper | `fibreTexture(196,184,160, 60)` | CanvasTexture | 256×256 | crate liners, fruit wraps, paper stack | runtime, local |
| Fibre — cloth | `fibreTexture(96,104,88,130)` | CanvasTexture | 256×256 | table cloth, sleeves | runtime, local |
| Fibre — soil | `fibreTexture(56,47,34,40)` | CanvasTexture | 256×256 | 200×90 ground plane | runtime, local |
| Fibre — basket | `fibreTexture(126,100,66,120)` | CanvasTexture | 256×256 | baskets | runtime, local |
| Fibre — sack | `fibreTexture(122,108,80,140)` | CanvasTexture | 256×256 | sacks | runtime, local |
| Fibre — rug | `fibreTexture(120,108,88,150)` | CanvasTexture | 256×256 | home rug | runtime, local |
| Dawn sky | `skyEquirect()` | CanvasTexture (equirect) | 1024×512 | `scene.background` (intensity 0.55) + `PMREMGenerator` → `scene.environment` (intensity 0.34) | runtime, local |

Mango skin recipe (for reimplementation): green shoulder rgb(68,88,22) → gold rgb(176,106,24) ramped over v 0.06–0.56; blush band centred u 0.28 (+112 R, −40 G); fbm mottling ±20; 130× fine noise for pores; lenticels at ~0.35% pixel probability (+46/+40/+26); blemishes where `fbm(u*5+11, v*5+3) > 0.74` (up to −70 R). Bump = fine noise around 128. Roughness = 168 base, −46 on blush, +60 on blemish, −10 with ripeness.

## 4. Fonts

| Asset | Source | Weights | Used on | Local/External |
|---|---|---|---|---|
| Newsreader | `fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;1,6..72,300` | 300, 400, 300 italic (variable opsz 6–72) | body default; all headlines, hero statement, wordmark, italic lead | **External CDN** |
| IBM Plex Mono | same stylesheet request, `family=IBM+Plex+Mono:wght@400;500` | 400, 500 | nav, eyebrows, supporting copy, stats, rail labels, buttons | **External CDN** |
| — | `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` | — | font payload warm-up | External |

Fallbacks declared: `Newsreader, Georgia, serif` and `'IBM Plex Mono', monospace`. Weight 500 is requested but not used in the markup.

## 5. Icons & inline SVG

| Asset | Path | Type | Dimensions | Used | Local/External |
|---|---|---|---|---|---|
| Film grain | inline in `Cinematic Hero.dc.html` | data-URI SVG (`feTurbulence`, `fractalNoise`, baseFrequency 0.9, 3 octaves) | 180×180, tiled via `background-size` | z-index 3 overlay, `opacity .13`, `mix-blend-mode: overlay` | Local (inline) |
| Bundler splash thumbnail | inline in `CinematicHeroOffline.dc.html` | inline SVG `<template id="__bundler_thumbnail">` | 1200×800 viewBox | offline-bundle unpack screen only | Local (inline) |

**No icon set, no icon font, no SVG sprite.** The scroll prompt's arrow is a 1×34px gradient `<span>`; the chapter rail is a 1×200px div plus a scaled fill div.

## 6. Audio

**None.** No `<audio>`, no Web Audio, no media files.

## 7. Shaders

**No custom shaders.** No GLSL strings, no `ShaderMaterial`/`RawShaderMaterial`, no `onBeforeCompile`, no shader chunk patching, no postprocessing passes. All shading comes from stock three.js materials:

| Material class | Instances |
|---|---|
| `MeshPhysicalMaterial` | 1 (mango skin — clearcoat 0.22, sheen 0.35, sheenColor `#e9d7a8`) |
| `MeshStandardMaterial` | ~28 (wood ×2, paper, cloth, soil, leaf, hand, plaster, stone, road, floor, ceiling, counter, bowl, basket ×2, sack, rug, van ×5, tyre, scale ×2, loupe, shade, cord, mullion, city-near) |
| `MeshBasicMaterial` | 1 (window plane — unlit, `#e8d8b6`) |

Renderer-level image processing: `ACESFilmicToneMapping` with scrubbed exposure, `SRGBColorSpace`, `PCFSoftShadowMap`, `antialias: true`, `setPixelRatio(min(devicePixelRatio, 1.85))`, `PMREMGenerator` for IBL. The rest of the "grade" is CSS (`filter: saturate(1.08) contrast(1.07)` + vignette + soft-light split-tone + grain).

## 8. External libraries & CDN dependencies

| Asset | URL | Version | Type | Used for | Local/External |
|---|---|---|---|---|---|
| three.js | `https://unpkg.com/three@0.184.0/build/three.module.js` | 0.184.0 | ES module | entire 3D scene | **External CDN** (SRI `sha384-8FCZ1eVO6it4+pbec2aDtnTrwjWXZLJRC+MAGCIPDgsYnUrl/E0A2YlF8ioMKI/J`) |
| three core | `https://unpkg.com/three@0.184.0/build/three.core.js` | 0.184.0 | ES module (internal import) | pulled in by the above | **External CDN** (SRI `sha384-dw2ooPewaEIrAgl6oFDBmmBWCE9oW9LxRGcfwZ0hLvEprzo202wXl7vCYHRlSnOT`) |
| Google Fonts CSS | `https://fonts.googleapis.com/css2?...` | — | stylesheet | 2 families | **External CDN** |
| Google Fonts payload | `https://fonts.gstatic.com` (preconnect) | — | woff2 | glyphs | **External CDN** |
| `support.js` | project root | host runtime | Design Component template/logic runtime | Local, **prototype-only** |

three.js addons used: **none**. No `OrbitControls`, no loaders, no `EffectComposer`.

## 9. Totals

| Category | Count | Bytes shipped |
|---|---|---|
| Binary assets | 0 | 0 |
| Runtime-generated textures | 12 (≈9.4 MB GPU after upload) | 0 |
| Procedural meshes | ~200 objects, ~120k triangles | 0 |
| External CDN requests | 3 origins (unpkg ×2 modules, fonts.googleapis, fonts.gstatic) | ~1.3 MB three.js + fonts |
| Inline SVG | 2 (grain, offline splash) | <1 KB |
| Fully offline build | `CinematicHero-offline.html` | 1.2 MB, 0 network requests |
