# Fruit Intelligence Architecture Specification

## 1. Executive Summary & Philosophy

The **Fruit Intelligence** subsystem is an educational, interactive 3D inspection experience designed for the BAAGH brand. It allows customers and connoisseurs to understand fruit quality through the eyes of an expert fruit buyer—reading exterior cues (aroma, skin, firmness, button), exploring internal anatomy (cutting, peeling, segments, flesh, stone), comparing quality tiers (Good, Better, Best), and understanding selection standards before ordering.

### Core Architectural Principle: Strict Separation of Concerns
```
┌────────────────────────────────────────────────────────────────────────┐
│                        SHARED EXPERIENCE SYSTEM                        │
│  (Brand Identity, Viewport Shell, Layout, Gestures, A11y, 2D Overlay)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes config & mounts scene
┌───────────────────────────────────▼────────────────────────────────────┐
│                    FRUIT-SPECIFIC SCENE & DATA MODEL                   │
│ (Procedural 3D Geometry, Physical Decomposition, Shaders, Annotations) │
└────────────────────────────────────────────────────────────────────────┘
```
The architecture strictly separates the **Shared Brand / Experience Shell** from **Fruit-Specific Physical Behaviors**. It prohibits hard-coding fruit-specific mechanics (such as mango-specific cutting logic or mandarin-specific peeling logic) into generic components. Every fruit operates as a modular, self-contained configuration and scene engine conforming to a standard lifecycle interface.

---

## 2. Shared vs. Fruit-Specific Matrix

Based on detailed analysis of the production prototypes (`D:\karamat\Design prototype\fruit intelligence\chaunsa\` and `D:\karamat\Design prototype\fruit intelligence\kinnow\`):

| Subsystem / Feature | Shared Brand / Experience Layer | Fruit-Specific Implementation Layer |
|---|---|---|
| **Experience Shell** | Fixed background radial lighting gradients, 8-dot right-side chapter rail, bottom floating scroll/drag hint, scroll height manager (e.g. 820vh spacer). | Specific chapter designation (e.g. "Chapter Two" vs "Chapter Three"), headline text, body copy. |
| **Typography & Fonts** | Font definitions: `Cormorant Garamond` (display serif, 300/400/500 italic/normal) and `Work Sans` (sans-serif uppercase tracking .30em-.34em). Color tokens: Gold (`#e8b45c`, `#f6d79a`), Paper (`#f2e8d8`), Ink background (`#100d0a`). | Fruit-specific text hierarchies, character lengths, and localized line-wrapping. |
| **Viewport & Interaction** | Pointer & touch drag event binding with dampening inertia, passive scroll progress normalization ($p \in [0, 1]$), drag hint auto-fade upon user interaction. | Drag rotation target mapping (e.g., degree of tilt/yaw per fruit geometry), spin velocity. |
| **Annotation Engine** | Screen projection of 3D world anchors ($v \in \mathbb{R}^3 \to \text{px}_{x,y}$), dynamic left-column layout algorithm with vertical collision repulsion, animated gradient hairline connectors ($L = \sqrt{\Delta x^2 + \Delta y^2}$, angle $= \text{atan2}(\Delta y, \Delta x)$). | Anchor coordinate definitions, callout labels, descriptions, host 3D mesh attachments. |
| **Camera Controller** | PerspectiveCamera (FOV $32^{\circ}-34^{\circ}$), smoothstep multi-stop keyframe interpolation, responsive `filmOffset` (-9.5 to 0 on desktop, 0 on mobile), responsive camera distance scaling. | Camera keyframe stops (distance, height, orbit angle, target offset) tailored to fruit scale and anatomy layout. |
| **3D Rendering Stage** | WebGLRenderer setup (ACESFilmicToneMapping, exposure control, PCF shadow maps, PMREM environment generation, local clipping planes, devicePixelRatio clamping). | Fruit 3D geometries, custom shaders/materials, internal organs (knife vs peel vs seeds), mesh hierarchy. |
| **Physical Decomposition** | Windowing/ramp activation curves ($p \to [0, 1]$ with smoothstep ease-in/out). | **Chaunsa**: Chef knife cutting cheek + exploded flesh/stone.<br>**Kinnow**: 6-petal curling peel + 10-segment fan + single segment lift + cross-section. |
| **Selection Comparison** | Staggered 3-item row layout ("GOOD", "BETTER", "BEST") with animated screen badges and floating bob. | 3 specific fruit instances with varied procedural ripeness, blush, squash, and tilt parameters. |
| **CTA System** | Dual-button hierarchy: Primary solid gold (`#e8b45c`) + Secondary outlined button (`1px solid rgba(242,232,216,0.28)`) with hover lifts and keyboard focus. | Destination URLs, product collection labels, fruit-specific subtitle context. |
| **Accessibility & Fallback**| WebGL context failure detection, automatic graceful 2D graphic & copy fallback, `prefers-reduced-motion` compliance, full semantic HTML structure. | Stylized CSS silhouette gradient representing the fruit's silhouette and physical color tones. |

---

## 3. Detailed Architectural Specifications

### 3.1 Shared Experience Shell (`FruitExperienceShell`)
The shell provides the fixed full-viewport canvas and DOM overlays:
1. **Atmospheric Backdrops**: Two fixed full-screen radial gradient layers producing subtle ambient warm lighting (`#2b2118` to `#0d0a08` base, plus a soft golden glow at `#ffd696`).
2. **WebGL Stage Container**: Captures pointer/touch gestures (`touch-action: pan-y`, `cursor: grab / grabbing`) while allowing native vertical page scrolling.
3. **Fixed Narrative Overlay**: Bottom-aligned typographic layout presenting 8 synchronized acts with cubic easing windowing.
4. **Right Chapter Rail**: 8 dot indicators indicating progress through the 8 inspection acts, scaling and highlighting the active act.
5. **Interactive Hint**: Animated pulsing pill (`SCROLL · DRAG TO TURN`) that fades out immediately upon user scroll or drag.
6. **Native Scroll Spacer**: Configurable height spacer (e.g. `820vh`) providing smooth native scrolling across desktop, trackpads, and touch devices.

### 3.2 Fruit Data & Scene Interface (`types.ts`)
Each fruit is declared as a strongly-typed configuration object conforming to `FruitConfig`:

```typescript
export interface FruitConfig {
  id: string;                      // e.g. 'chaunsa', 'kinnow', 'apple'
  name: string;                    // 'Chaunsa Mango'
  variety: string;                 // 'Summer Honey Chaunsa'
  chapterLabel: string;            // 'CHAPTER TWO — FRUIT INTELLIGENCE'
  headline: string;                // 'Read a Chaunsa\nthe way a buyer reads it.'
  subhead: string;                 // 'One fruit, examined properly...'
  scrollPaceScreens: number;       // Default: 8.2 (820vh)
  defaultExposure: number;         // Default: 1.16
  
  // Narrative Acts (8 stages: 0 to 7)
  acts: NarrativeAct[];

  // Dynamic 3D Anchor Definitions
  anchors: FruitAnchorDef[];

  // 3-Fruit Selection Benchmark Specs
  selectionSpecs: TrioSpec[];

  // Camera Path Choreography
  cameraStops: CameraStop[];
  cameraMarks: number[];

  // Fallback 2D Representation
  fallback: {
    cssGradient: string;
    borderRadius: string;
    aspectRatio: string;
    summaryText: string;
  };

  // CTA Configuration
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}
```

And its 3D scene engine must implement the unified `FruitSceneEngine` contract:
```typescript
export interface FruitSceneEngine {
  setProgress(progress: number): void;
  addDrag(deltaX: number, deltaY: number): void;
  resize(): void;
  setExposure(exposure: number): void;
  renderAt(progress: number): void; // Synchronous snapshot for testing/preview
  dispose(): void;
}
```

### 3.3 Shared Dynamic Annotation System (`FruitAnnotations`)
To achieve floating editorial callouts connected to 3D points in real time:
1. **Projection**: 3D anchors are transformed via `anchor.matrixWorld`, tested for camera forward occlusion, and projected through `camera.project()` to screen coordinates $(x, y)$.
2. **Intelligent Column Layout**: Callouts are grouped and sorted by projected $y$ position. A collision-resolution pass ensures a minimum vertical gap (80px) and keeps all text above the lower narrative copy zone.
3. **Dynamic Gradient Hairlines**: A 1px connector line with linear gradient (`rgba(232,180,92,0.5)` to transparent) is translated to the callout border and rotated by $\theta = \operatorname{atan2}(\Delta y, \Delta x)$ with length $L = \sqrt{\Delta x^2 + \Delta y^2}$.

### 3.4 Shared Camera & Choreography System (`cameraSystem`)
The camera system uses smooth cubic Hermite interpolation between piecewise keyframe stops:
- **Orbital Position**: Spherical coordinates $(d, \text{pitch}, \text{yaw})$ orbiting the stage with inertia and drag influence.
- **Dynamic Framing & Film Offset**: For wide desktop screens ($W/H > 1.15$), the camera applies a negative `filmOffset` (e.g. $-9.5$) to place the fruit majestically in the right two-thirds of the viewport, leaving the left third for editorial copy. In centered acts (Selection Trio and Final CTA), the film offset smoothly returns to `0`.
- **Responsive Mobile Scaling**: On narrow portrait viewports ($W/H < 1.15$), distance $d$ is scaled up by $1.06\times - 1.34\times$ and the vertical lookAt target is biased upward so the fruit sits above the thumb navigation zone.

### 3.5 Fruit-Specific Physical Anatomy System
Each fruit requires dedicated physical modeling:
- **Chaunsa Mango Anatomy**:
  - Parametric kidneyed mesh with stem dimple sinus and nose beak.
  - Planar cut clipping with a moving Japanese chef's knife blade.
  - Separation into two distinct parts: sliced cheek with golden fleshy cap and main body holding the fibrous stone.
  - Exploded view reveals inner fibrelessness and stone proportions.
- **Kinnow Mandarin Anatomy**:
  - Oblate squashed parametric sphere with crate dent harmonics.
  - 6-petal two-band peel mesh that hinges open and curls its tip backwards to expose white pith.
  - 10-segment internal rosette that fans out into individual wedges, lifting a single segment with visible seed.
  - Planar cross-section showing 10 wedges, juice vesicles, core, and seed cross-sections.

### 3.6 Performance & Rendering Strategy
- **Procedural construction**: Geometry and textures are generated in memory; no GLTF/GLB download is required. Generation, texture uploads and shader compilation still cost time. No sub-100ms initialization or zero-network-latency guarantee is made. Each selected scene engine is now dynamically imported.
- **Hardware-adaptive detail**: Constrained viewport, CPU, memory and data-saving signals select bounded texture, geometry and pixel-ratio budgets. Sustained slow frames can reduce rendering resolution further without replacing the anatomy or inspection sequence.
- **Render lifecycle**: A shared cancellable loop uses elapsed-time damping, bounded DOM publication and a 60 Hz render ceiling. Hidden tabs pause and reduced-motion scenes render on demand. Drawing-buffer preservation is disabled. Resources and the owned graphics context are explicitly released on exit.
- **Current verification**: See [performance and information sprint](PERFORMANCE_AND_INFORMATION_PAGES.md) and its recorded browser measurements; physical-device profiling remains a launch check.

---

## 4. Step-by-Step Extensibility Guide: Adding New Fruits (e.g., Apple)

To add a new fruit without modifying the core system:
1. **Create Directory**: `src/components/fruit-intelligence/fruits/apple/`
2. **Define Configuration (`config.ts`)**: Supply narrative acts, educational inspection points (e.g., bloom, calyx, lenticels, starch conversion), camera keyframes, and selection criteria.
3. **Build Parametric Geometry & Textures (`geometry.ts`, `textures.ts`)**: Create mathematical surface formulation for the apple silhouette (e.g., 5-lobed crown, deep stem basin) and procedural skin maps (russeting, striations, wax sheen).
4. **Implement Scene Engine (`AppleScene.ts`)**: Implement `FruitSceneEngine` handling apple-specific physical interactions (e.g., longitudinal quartering or core extraction).
5. **Register Fruit**: Add `'apple'` to the fruit registry in `src/components/fruit-intelligence/fruits/index.ts`.

---

## 5. Architectural Review & Compliance Checklist

- [x] **No hard-coded Chaunsa assumptions** in generic shell/viewer components.
- [x] **Pluggable physical interaction models** (cutting, peeling, quartering).
- [x] **Unified typography & brand token inheritance** from BAAGH brand guidelines.
- [x] **Full WebGL fallback & screen-reader compatibility**.
- [x] **Ready for immediate Chaunsa implementation and future Kinnow / Apple rollout**.
