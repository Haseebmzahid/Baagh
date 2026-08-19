import * as THREE from 'three';

import { createWholeMangoGeometry } from '../fruit-intelligence/fruits/chaunsa/geometry';
import {
  createSkinMaps as createMangoSkin,
  createEnvTexture as createStudioEnv,
} from '../fruit-intelligence/fruits/chaunsa/textures';

import { createFruitGeometry as createKinnowGeometry, DEFAULT_SHAPE as KINNOW_SHAPE } from '../fruit-intelligence/fruits/kinnow/geometry';
import { createRindMaps } from '../fruit-intelligence/fruits/kinnow/textures';

import { fruitGeometry as createAppleGeometry, DEFAULT_APPLE_SHAPE } from '../fruit-intelligence/fruits/apple/geometry';
import { createSkinMaps as createAppleSkin } from '../fruit-intelligence/fruits/apple/textures';

import { bodyGeometry, crownGroup, shapeFor } from '../fruit-intelligence/fruits/anaar/geometry';
import { createSkinMaps as createAnaarSkin } from '../fruit-intelligence/fruits/anaar/textures';

/**
 * COMMERCIAL PRODUCT SPECIMEN — a lightweight derivative of Fruit Intelligence
 * ==========================================================================
 *
 * Product Detail needs a specimen the reader can inspect, not a second Fruit
 * Intelligence. This module reuses the SAME geometry and texture builders the
 * frozen Fruit Intelligence scenes use, but composes only the whole fruit, in
 * a contained canvas, under restrained studio light.
 *
 * Deliberate constraints:
 *   - ONE renderer per Product Detail page. Never one per product card.
 *   - No global render loop is added; the loop lives and dies with the scene
 *     and idles whenever the specimen is scrolled out of view.
 *   - No shadow maps, no PMREM, far fewer segments than the full scenes.
 *   - Every geometry, material and texture created here is disposed.
 *   - The existing Fruit Intelligence scenes are not touched.
 *
 * Motion is L1 but restrained: a slow idle drift, plus a small pointer tilt on
 * devices with a fine pointer. Touch devices get swipe instead of tilt.
 */

export interface SpecimenOptions {
  lowPerformance?: boolean;
  /** Reduced motion drops the idle drift to a still frame. */
  reducedMotion?: boolean;
  onContextLost?: () => void;
}

export interface SpecimenEngine {
  /** Pointer position in the range -0.5 … 0.5. Ignored on touch. */
  setPointer(x: number, y: number): void;
  /** Horizontal swipe, in pixels. Adds spin with inertia. */
  addSwipe(deltaX: number): void;
  /** Pause the loop while the specimen is off screen. */
  setActive(active: boolean): void;
  resize(): void;
  dispose(): void;
}

/** Fruits with a reusable whole-fruit representation. */
export type SpecimenFruit = 'chaunsa' | 'kinnow' | 'apple' | 'anaar';

const SPECIMEN_FRUITS: SpecimenFruit[] = ['chaunsa', 'kinnow', 'apple', 'anaar'];

/**
 * Maps a catalogue product onto an existing fruit representation. Products
 * without one fall back to the CSS specimen plate — we do not model a new
 * fruit just to fill a page.
 */
export function specimenFruitFor(productId: string, categoryId: string): SpecimenFruit | null {
  const id = productId.toLowerCase();
  if ((SPECIMEN_FRUITS as string[]).includes(id)) return id as SpecimenFruit;

  // Every mango variety can be shown on the mango body; the skin tint is
  // varied below so Sindhri does not render as a Chaunsa clone.
  if (categoryId === 'mangoes') return 'chaunsa';
  if (categoryId === 'citrus') return 'kinnow';
  if (categoryId === 'apples') return 'apple';
  return null;
}

/** Per-variety ripeness so the shared body does not read as one fruit. */
const RIPENESS: Record<string, number> = {
  chaunsa: 0.62,
  sindhri: 0.44,
  langra: 0.22,
  dasehri: 0.5,
  'anwar-ratol': 0.72,
};

interface BuiltSpecimen {
  object: THREE.Object3D;
  disposables: { dispose(): void }[];
}

/**
 * How much of the frame's half-height the specimen is allowed to occupy.
 * Rule 06: "Single specimen, room around it."
 */
const FRAMING = 0.74;
const FOV_DEG = 30;

function buildSpecimen(
  fruit: SpecimenFruit,
  productId: string,
  low: boolean,
  env: THREE.Texture
): BuiltSpecimen {
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(x: T): T => {
    disposables.push(x);
    return x;
  };

  const texSize = low ? 1024 : 2048;

  if (fruit === 'chaunsa') {
    const ripeness = RIPENESS[productId] ?? 0.55;
    const geo = track(createWholeMangoGeometry(low ? 84 : 132, low ? 64 : 104));
    const skin = createMangoSkin(texSize, texSize / 2, ripeness);
    track(skin.map);
    track(skin.bumpMap);
    track(skin.roughnessMap);

    const mat = track(
      new THREE.MeshPhysicalMaterial({
        map: skin.map,
        bumpMap: skin.bumpMap,
        bumpScale: 0.012,
        roughnessMap: skin.roughnessMap,
        roughness: 0.62,
        clearcoat: 0.34,
        clearcoatRoughness: 0.55,
        envMap: env,
        envMapIntensity: 0.75,
      })
    );

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.z = 0.22;
    return { object: mesh, disposables };
  }

  if (fruit === 'kinnow') {
    const geo = track(createKinnowGeometry(low ? 84 : 128, low ? 60 : 96, 1, KINNOW_SHAPE));
    const rind = createRindMaps(texSize, texSize / 2, 0.74);
    track(rind.map);
    track(rind.bumpMap);
    track(rind.roughnessMap);

    const mat = track(
      new THREE.MeshPhysicalMaterial({
        map: rind.map,
        bumpMap: rind.bumpMap,
        bumpScale: 0.02,
        roughnessMap: rind.roughnessMap,
        roughness: 0.72,
        clearcoat: 0.2,
        clearcoatRoughness: 0.62,
        envMap: env,
        envMapIntensity: 0.7,
      })
    );

    return { object: new THREE.Mesh(geo, mat), disposables };
  }

  if (fruit === 'apple') {
    const geo = track(createAppleGeometry(low ? 84 : 128, low ? 60 : 96, DEFAULT_APPLE_SHAPE));
    const skin = createAppleSkin(texSize, texSize / 2, 0.7);
    track(skin.map);
    track(skin.bumpMap);
    track(skin.roughnessMap);

    const mat = track(
      new THREE.MeshPhysicalMaterial({
        map: skin.map,
        bumpMap: skin.bumpMap,
        bumpScale: 0.01,
        roughnessMap: skin.roughnessMap,
        roughness: 0.44,
        clearcoat: 0.5,
        clearcoatRoughness: 0.38,
        envMap: env,
        envMapIntensity: 0.85,
      })
    );

    return { object: new THREE.Mesh(geo, mat), disposables };
  }

  // Anaar — body plus the calyx crown, which is the fruit's signature.
  const shape = shapeFor(0.37);
  const geo = track(bodyGeometry(shape, 0, Math.PI * 2, low ? 96 : 148, low ? 72 : 112));
  const skin = createAnaarSkin(0.37, 'Garnet', texSize);
  track(skin.map);
  track(skin.bumpMap);

  const mat = track(
    new THREE.MeshPhysicalMaterial({
      map: skin.map,
      bumpMap: skin.bumpMap,
      bumpScale: 0.008,
      roughness: 0.58,
      clearcoat: 0.26,
      clearcoatRoughness: 0.5,
      envMap: env,
      envMapIntensity: 0.7,
    })
  );

  const group = new THREE.Group();
  const body = new THREE.Mesh(geo, mat);
  group.add(body);

  // The crown sits on the neck; the body field gives us the neck radius.
  const top = shape(new THREE.Vector3(0, 1, 0));
  const crown = crownGroup(0.37, top.y * 0.97, 0.17);
  group.add(crown.group);
  disposables.push(...crown.disposables);

  return { object: group, disposables };
}

export function createSpecimenScene(
  canvas: HTMLCanvasElement,
  fruit: SpecimenFruit,
  productId: string,
  options: SpecimenOptions = {}
): SpecimenEngine {
  const low = !!options.lowPerformance;
  const reduced = !!options.reducedMotion;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    powerPreference: low ? 'low-power' : 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.4 : 1.85));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  // No shadow map — the plate is lit, not staged.
  renderer.shadowMap.enabled = false;

  const scene = new THREE.Scene();

  // The studio environment is shared with Fruit Intelligence, used directly
  // as an equirect env map rather than through PMREM — much cheaper, and
  // enough for a single body under soft light.
  const envTex = createStudioEnv();
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = envTex;

  const camera = new THREE.PerspectiveCamera(FOV_DEG, 1, 0.1, 40);

  // Restrained lighting: one key, one cool fill, one rim. No more.
  const key = new THREE.DirectionalLight(0xfff0d6, 2.5);
  key.position.set(2.4, 3.6, 3.0);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbfd2e6, 0.45);
  fill.position.set(-3.0, 0.6, 1.6);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffe6c0, 0.9);
  rim.position.set(-1.4, 2.0, -3.4);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0x6b5a44, 0x120e0b, 0.3));

  const built = buildSpecimen(fruit, productId, low, envTex);

  // Frame the specimen from its own bounds rather than a per-fruit guess, so
  // every product plate gives the fruit the same room regardless of which
  // body it borrows.
  const bounds = new THREE.Box3().setFromObject(built.object);
  const size = bounds.getSize(new THREE.Vector3());
  const centre = bounds.getCenter(new THREE.Vector3());
  built.object.position.sub(centre);

  const radius = Math.max(size.x, size.y, size.z) * 0.5 || 1;
  const distance = radius / (FRAMING * Math.tan((FOV_DEG * Math.PI) / 360));

  const pivot = new THREE.Group();
  pivot.add(built.object);
  scene.add(pivot);

  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);

  // ---- interaction state -------------------------------------------------
  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let spin = 0;
  let spinVelocity = 0;
  let active = true;
  let disposed = false;
  let raf = 0;
  let lastTime = 0;

  const onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    if (options.onContextLost) options.onContextLost();
  };
  canvas.addEventListener('webglcontextlost', onContextLost as EventListener);

  function resize() {
    if (disposed) return;
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function frame(time: number) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);

    const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;

    // Pointer tilt, damped. Kept small — this is inspection, not a toy.
    const targetX = pointerX * 0.12;
    const targetY = -pointerY * 0.09;
    tiltX += (targetX - tiltX) * Math.min(1, dt * 5);
    tiltY += (targetY - tiltY) * Math.min(1, dt * 5);

    // Swipe inertia.
    spin += spinVelocity * dt;
    spinVelocity *= Math.pow(0.02, dt);

    // Idle drift, L1. A still frame under reduced motion.
    const drift = reduced ? 0 : Math.sin(time * 0.00016) * 0.10;
    const bob = reduced ? 0 : Math.sin(time * 0.00021) * 0.014;

    pivot.rotation.y = tiltX + spin + drift;
    pivot.rotation.x = tiltY;
    pivot.position.y = bob;

    renderer.render(scene, camera);
  }

  resize();
  renderer.render(scene, camera);
  raf = requestAnimationFrame(frame);

  return {
    setPointer(x: number, y: number) {
      pointerX = x;
      pointerY = y;
    },
    addSwipe(deltaX: number) {
      spinVelocity += deltaX * 0.012;
    },
    setActive(next: boolean) {
      if (next === active || disposed) return;
      active = next;
      if (active) {
        lastTime = 0;
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('webglcontextlost', onContextLost as EventListener);

      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });

      built.disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // a disposable may already have been released by the traverse above
        }
      });

      envTex.dispose();
      scene.environment = null;
      // dispose() only — the same convention the Fruit Intelligence scenes
      // use. forceContextLoss() would permanently poison this canvas element,
      // so a remount (StrictMode's double effect, a product change) could
      // never get a context on it again.
      renderer.dispose();
    },
  };
}
