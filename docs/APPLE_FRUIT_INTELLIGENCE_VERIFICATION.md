# APPLE FRUIT INTELLIGENCE VERIFICATION REPORT

**Date:** 2026-08-16  
**Authoritative Prototype Source:**  
- `D:\karamat\Design prototype\fruit intelligence\Apple\Apple Fruit Intelligence.html`  
- `D:\karamat\Design prototype\fruit intelligence\Apple\3D Chaunsa mango scene (2).zip` (`apple-scene.js`, `Apple Fruit Intelligence.dc.html`)  
**Production System Target:** Karamat Fruit Intelligence Platform (Chapter Four — Apple)

---

## 1. EXECUTIVE STATUS EVALUATION

| Criterion | Evaluation | Notes |
|---|---|---|
| **ARCHITECTURE** | **PASS** | Registered cleanly via `fruitRegistry` using shared `FruitIntelligence`, `FruitViewer`, `FruitAnnotations`, `FruitExperienceShell`, `FruitFallback`, and `cameraSystem`. Zero duplicated infrastructure. |
| **APPLE VISUAL PARITY** | **PASS** | Procedural 5-lobe asymmetry, stem & calyx wells, crimson blush striping, lenticels freckling, waxy clearcoat roughness, moisture droplets, cream flesh with green vascular core, butterfly core cross-section, and 5-point transverse star cut match prototype. |
| **APPLE INTERACTION PARITY** | **PASS** | 11 camera stops, 9 narrative acts (Acts 00-08), knife downward slice pass, 6 wedge radial parting around central lathe core, lengthwise butterfly cross-section, top casing clipping for transverse star inspection, selection trio (Good/Better/Best), whole reassembly, and final CTA state. |
| **RESPONSIVE** | **PASS** | Dynamic aspect ratio scaling (`dScale`), adaptive film offset (`camera.filmOffset = -7.2 * (1 - centered)`), stack collision handling for mobile & tablet viewports. |
| **ACCESSIBILITY** | **PASS** | WebGL fallback CSS silhouette + complete editorial summary card, WCAG AA contrast on editorial typography, aria-label story chapter rail navigation. |
| **PERFORMANCE** | **PASS** | Linear float DataTexture for environment irradiance, single unified requestAnimationFrame loop with lerped inertia, zero per-frame buffer allocations, adaptive mesh tessellation (low-perf flag). |
| **CROSS-FRUIT REGRESSION** | **PASS** | Chaunsa Mango (Chapter Two) and Kinnow Mandarin (Chapter Three) verified fully operational and completely unaffected. |

---

## 2. FILES CREATED & MODIFIED

### Files Created
1. `D:\karamat\src\components\fruit-intelligence\fruits\apple\geometry.ts`
   - Procedural apple shape parameters generator (`makeShape`, `DEFAULT_APPLE_SHAPE`).
   - Radius profiling with stem & calyx basins, belly waist, 5-lobe ridging, and harmonic dents (`radiusAt`, `point`).
   - Whole apple mesh (`fruitGeometry`), 6-wedge slicing geometry with core notch cut faces (`wedgeGeometry`), and lengthwise cross-section face (`crossFaceGeometry`).
2. `D:\karamat\src\components\fruit-intelligence\fruits\apple\textures.ts`
   - ACES tone mapping albedo normalizer (`toAlbedo`).
   - High-fidelity skin maps (base map with 340 blush stripes, 90 tone zones, bump map, roughness map with waxy patches, dual-sprite lenticel freckling, micro-grain, and stem russet flecks).
   - Cut face flesh maps (cream flesh, green core cast, 2400 radial fibres, 900 grain lines, 3400 moisture droplets, red rind edge, core notch).
   - Lengthwise cross-section maps (butterfly core, 2 seed chambers, teardrop seeds, radial fibres, moisture, red rind edge).
   - Core barrel maps (5 chamber walls and vertical fibres).
   - Transverse cut core section map (5-point chamber star, 5 chambers, 2 dark pips per chamber, central axis).
   - 2048×1024 Linear float DataTexture HDR studio lighting environment.
3. `D:\karamat\src\components\fruit-intelligence\fruits\apple\config.ts`
   - Complete configuration for Apple Fruit Intelligence: 9 narrative acts (Acts 00–08), 12 3D anchors, 5 anchor groups (`inspect`, `wedges`, `crossSection`, `coreSeeds`, `trio`), selection trio specifications (blush 0.42, 0.66, 0.90), 11 camera stops & marks, CSS fallback gradient & summary text, and primary/secondary CTAs.
4. `D:\karamat\src\components\fruit-intelligence\fruits\apple\AppleScene.ts`
   - Complete Three.js engine implementing `FruitSceneEngine`.
   - Studio lighting (warm key, cool fill, front, bounce, hemisphere).
   - Physical materials: `skinMat` (`MeshPhysicalMaterial`, clearcoat 0.34, bumpScale 0.32), `fleshMat` (subsurface transmission 0.1, thickness 0.4, ior 1.35), `crossMat`, `coreMat`, `seedMat`, `stemMat`, `steelMat`, `handleMat`.
   - 3D stage hierarchy: `wholeGroup`, `sliced` (6 wedges), `coreGroup` (lathe core, transverse section face, 5 chamber walls, 5 seeds), `crossGroup` (half shell + butterfly cross face), `knife`, `trio` (3 apple models), and `ground` shadow receiver.
   - 11-stop camera interpolation, film offset, and screen anchor projection collection.
5. `D:\karamat\docs\APPLE_FRUIT_INTELLIGENCE_VERIFICATION.md` (This document).

### Files Modified
1. `D:\karamat\src\components\fruit-intelligence\fruits\index.ts`
   - Added Apple configuration and scene factory to the central `fruitRegistry`.
2. `D:\karamat\src\App.tsx`
   - Added `?fruit=apple` and `#apple` query/hash route handling.
3. `D:\karamat\src\components\fruit-intelligence\FruitAnnotations.tsx`
   - Made `trioOn` dynamically derived from active fruit configuration acts and groups.
   - Refined `colX` calculation and stack boundary limit to support all fruit shapes dynamically.

---

## 3. APPLE-SPECIFIC COMPONENTS VS REUSED SHARED ARCHITECTURE

### Reused Shared Infrastructure
- `FruitIntelligence`: Top-level controller, lifecycle management, fallback detection, debug hooks.
- `FruitExperienceShell`: Narrative overlay, 8/9-dot chapter rail, interaction hint, background studio gradients, scroll spacer.
- `FruitViewer`: Unified WebGL canvas hosting, drag gesture binding with inertia, scroll progress sync.
- `FruitAnnotations`: 3D projected callout cards, dynamic connector lines, selection tier badges.
- `FruitFallback`: WebGL unsupported fallback view with CSS fruit silhouette and full text summary.
- `fruitRegistry`: Central registry mapping fruit ID -> `{ config, factory }`.
- `mathUtils`: `clamp`, `lerp`, `ramp`, `smooth`, `win`, `rnd`.
- Design tokens and typography (`Work Sans`, `Cormorant Garamond`).

### Apple-Specific Implementations
- Procedural apple geometry (lobed asymmetric silhouette, calyx well, stem well, 6 wedges with radial core notches, butterfly cross-section cap).
- Apple texture generators (crimson striping, gold shoulder, lenticels, cream-green flesh, butterfly core, 5-point star transverse cut).
- 9 narrative acts and 11-stop camera timeline.
- Knife slicing animation with vertical blade passage and wedge separation.
- Transverse clipping plane for Act 05 (top casing clipped away while camera looks down on 5-point star).

---

## 4. INTERACTION TIMELINE VERIFICATION

| Progress Range | Act / Beat | Visual State | Camera State |
|---|---|---|---|
| **0.00 – 0.08** | **00 — Chapter Four Hero** | Whole apple with curved woody stem. | Distance: 5.6, Y: 0.22, Heading: 0.30 |
| **0.08 – 0.28** | **01 — The Inspection** | Whole apple turns slowly in light; SKIN, COLOUR, STEM, FIRMNESS callouts appear. | Distance: 3.8, Y: 0.28, Heading: 0.60 (Macro) |
| **0.29 – 0.44** | **02 — The Slice** | Knife appears at top right, slices straight down through core; wedges begin parting. | Distance: 5.0, Y: 0.26, Heading: 0.20 |
| **0.45 – 0.55** | **03 — The Wedges** | 6 wedges fan outward around the intact central core barrel; CUT FACE callout appears. | Distance: 5.6, Y: 0.30, Heading: 0.08 |
| **0.56 – 0.67** | **04 — The Cross Section** | Lengthwise butterfly cross-section with 2 seeds; FLESH and CORE callouts appear. | Distance: 4.6, Y: 0.24, Heading: 0.02 |
| **0.68 – 0.81** | **05 — Core and Seeds** | Core barrel casing clipped at $y=0.02$, camera looks down at 5-point star; SEEDS and CHAMBERS callouts appear. | Distance: 0.5, Y: 1.50, Heading: 0.04 (Overhead) |
| **0.84 – 0.94** | **06 — The Selection Test** | Trio of apples (Good, Better, Best) float into row with quality tier badges. | Distance: 9.2, Y: 0.38, Heading: 0.00, TargetY: -0.62 |
| **0.95 – 0.98** | **07 — Whole Again** | Apple reassembles into whole fruit. | Distance: 5.6, Y: 0.26, Heading: 0.38 |
| **0.98 – 1.00** | **08 — The Apple We Choose** | Final framed apple position with EXPLORE EVERYDAY FRESH & EXPLORE SIGNATURE COLLECTION CTAs. | Distance: 7.0, Y: 0.36, Heading: 0.28, TargetY: -0.72 |

---

## 5. CROSS-FRUIT REGRESSION VERIFICATION

| Fruit | Route | Verification Status | Notes |
|---|---|---|---|
| **Chaunsa Mango** | `/?fruit=chaunsa` or `#chaunsa` | **PASS** | Cheek separation, fibrous flesh, stone inspection, aroma/skin/firmness/ripeness callouts, selection test trio, 8-stop camera timeline remain 100% identical. |
| **Kinnow Mandarin** | `/?fruit=kinnow` or `#kinnow` | **PASS** | Peeling rind ribbon, 10-segment parting, transverse juice vesicles cross-section, weight/button/colour/give callouts, 8-stop camera timeline remain 100% identical. |
| **Apple** | `/?fruit=apple` or `#apple` | **PASS** | 6-wedge slicing, butterfly core cross-section, transverse 5-point star overhead inspection, 9 acts, 11-stop camera timeline fully functional. |

---

## 6. DISCREPANCIES, FIXES & REMAINING ISSUES

- **Visual Discrepancies:** None. All procedural textures, lenticels, blush striping, material shaders, and studio lighting match the approved Claude Design prototype.
- **Interaction Discrepancies:** None. Slicing pass, camera stops, drag responsiveness, and selection trio match prototype specifications.
- **Fixes Applied:**
  1. Updated `FruitAnnotations` to dynamically compute `trioOn` windowing from the active fruit configuration acts/groups rather than assuming hard-coded progress intervals.
  2. Enhanced `FruitAnnotations` column X positioning to handle varying fruit bounds across all 3 fruit shapes.
  3. Added Apple routing support to `App.tsx`.
- **Remaining Issues:** None. Ready for founder review.
