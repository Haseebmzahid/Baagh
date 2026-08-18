export interface ScreenPoint {
  id: string;
  x: number;
  y: number;
  front: boolean;
}

export interface FruitAnchorDef {
  id: string;
  label: string;
  description: string;
  position: [number, number, number];
  actGroup: 'inspect' | 'anatomy' | 'trio';
  hostMesh?: string; // Host part identifier
  alwaysFront?: boolean;
}

export interface FruitAnchorGroup {
  id: string;
  keys: string[];
  minProgress: number;
  maxProgress: number;
  fadeDuration?: number;
}

export interface NarrativeAct {
  index: number;
  chapterNumber?: string;
  eyebrow: string;
  headline: string;
  body: string;
  isItalicHeadline?: boolean;
  isCentered?: boolean;
  hasCta?: boolean;
  minProgress: number;
  maxProgress: number;
  fadeDuration?: number;
}

export interface CameraStop {
  distance: number;
  y: number;
  heading: number;
  targetY: number;
}

export interface TrioSpec {
  id: 'good' | 'better' | 'best';
  label: string;
  x: number;
  ripeness: number;
  scale: number;
  rotationY: number;
  tilt: number;
}

export interface FallbackConfig {
  gradient: string;
  borderRadius: string;
  aspectRatio: string;
  summaryTitle: string;
  summaryText: string;
}

export interface FruitConfig {
  id: string;
  name: string;
  variety: string;
  chapterLabel: string;
  headline: string;
  subhead: string;
  scrollPaceScreens: number;
  defaultExposure: number;
  acts: NarrativeAct[];
  anchors: FruitAnchorDef[];
  anchorGroups?: FruitAnchorGroup[];
  trioSpecs: TrioSpec[];
  cameraStops: CameraStop[];
  cameraMarks: number[];
  fallback: FallbackConfig;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface FruitSceneOptions {
  lowPerformance?: boolean;
  onFrame?: (points: ScreenPoint[], progress: number) => void;
}

export interface FruitSceneEngine {
  setProgress(progress: number): void;
  addDrag(deltaX: number, deltaY: number): void;
  resize(): void;
  setExposure(exposure: number): void;
  renderAt(progress: number): void;
  dispose(): void;
}

export type FruitSceneFactory = (
  canvas: HTMLCanvasElement,
  options?: FruitSceneOptions
) => FruitSceneEngine;
