import * as THREE from 'three';
import { createWholeMangoGeometry } from '../fruit-intelligence/fruits/chaunsa/geometry';
import { createSkinMaps as createChaunsaSkinMaps } from '../fruit-intelligence/fruits/chaunsa/textures';
import {
  createFruitGeometry as createKinnowGeometry,
  DEFAULT_SHAPE as DEFAULT_KINNOW_SHAPE,
} from '../fruit-intelligence/fruits/kinnow/geometry';
import { createRindMaps as createKinnowRindMaps } from '../fruit-intelligence/fruits/kinnow/textures';
import {
  DEFAULT_APPLE_SHAPE,
  fruitGeometry as createAppleGeometry,
} from '../fruit-intelligence/fruits/apple/geometry';
import { createSkinMaps as createAppleSkinMaps } from '../fruit-intelligence/fruits/apple/textures';
import {
  bodyGeometry as createAnaarGeometry,
  crownGroup as createAnaarCrown,
  shapeFor as anaarShapeFor,
} from '../fruit-intelligence/fruits/anaar/geometry';
import { createSkinMaps as createAnaarSkinMaps } from '../fruit-intelligence/fruits/anaar/textures';

export interface SpecimenItem {
  id: 'chaunsa' | 'kinnow' | 'apple' | 'anaar';
  name: string;
  signature: string;
  secondary: string;
  route: string;
}

export const SPECIMENS: SpecimenItem[] = [
  {
    id: 'chaunsa',
    name: 'Chaunsa Mango',
    signature: 'CUT · FLESH · STONE',
    secondary: 'Judge it before you cut it.',
    route: '/fruit-intelligence/chaunsa',
  },
  {
    id: 'kinnow',
    name: 'Kinnow Mandarin',
    signature: 'PEEL · SEGMENTS · SEED',
    secondary: 'Judge it before you peel it.',
    route: '/fruit-intelligence/kinnow',
  },
  {
    id: 'apple',
    name: 'Apple',
    signature: 'SLICE · CORE · SEED',
    secondary: 'Look inside before you choose.',
    route: '/fruit-intelligence/apple',
  },
  {
    id: 'anaar',
    name: 'Anaar',
    signature: 'CROWN · CHAMBERS · ARILS',
    secondary: 'Read the crown before you open it.',
    route: '/fruit-intelligence/anaar',
  },
];

export interface SpecimenEngine {
  setActive(active: boolean): void;
  setPointer(normX: number, normY: number): void;
  triggerZoom(onComplete: () => void): void;
  resize(): void;
  dispose(): void;
}

export function createSpecimenScene(
  canvas: HTMLCanvasElement,
  fruitId: 'chaunsa' | 'kinnow' | 'apple' | 'anaar',
  options: { prefersReducedMotion?: boolean } = {}
): SpecimenEngine {
  const reducedMotion = !!options.prefersReducedMotion;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 30);
  camera.position.set(0, 0.1, 4.8);
  camera.lookAt(0, 0, 0);

  // Studio lighting
  const hemi = new THREE.HemisphereLight(0x7a664e, 0x140f0c, 0.5);
  scene.add(hemi);

  const mainKey = new THREE.DirectionalLight(0xfff5e6, 2.4);
  mainKey.position.set(2.2, 3.5, 3.0);
  scene.add(mainKey);

  const fillLight = new THREE.DirectionalLight(0xcadbee, 0.7);
  fillLight.position.set(-2.5, 1.2, 1.0);
  scene.add(fillLight);

  const bounceLight = new THREE.DirectionalLight(0xffe0ba, 0.4);
  bounceLight.position.set(0.0, -2.5, 1.5);
  scene.add(bounceLight);

  const spot = new THREE.SpotLight(0xffe8c6, 1.4, 7, 0.7, 0.5, 1.2);
  spot.position.set(0, 2.5, 2.0);
  spot.target.position.set(0, 0, 0);
  scene.add(spot);
  scene.add(spot.target);

  // Specimen Fruit Mesh & Materials
  const group = new THREE.Group();
  const baseRotation = new THREE.Euler();
  let baseScale = 1.0;

  const disposables: { dispose(): void }[] = [];

  if (fruitId === 'chaunsa') {
    const maps = createChaunsaSkinMaps(512, 256, 0.55);
    const mat = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 0.45,
      roughnessMap: maps.roughnessMap,
      roughness: 0.58,
      metalness: 0,
      clearcoat: 0.06,
      clearcoatRoughness: 0.7,
    });
    const geo = createWholeMangoGeometry(48, 36);
    const mesh = new THREE.Mesh(geo, mat);
    baseScale = 1.05;
    mesh.scale.setScalar(baseScale);
    group.add(mesh);
    baseRotation.set(0.12, 0.4, -0.08);
    disposables.push(geo, mat, maps.map, maps.bumpMap, maps.roughnessMap);
  } else if (fruitId === 'kinnow') {
    const maps = createKinnowRindMaps(512, 256, 0.8);
    const mat = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 0.4,
      roughnessMap: maps.roughnessMap,
      roughness: 0.52,
      metalness: 0,
      clearcoat: 0.12,
      clearcoatRoughness: 0.45,
    });
    const buttonMat = new THREE.MeshStandardMaterial({
      color: 0x4a4428,
      roughness: 0.9,
      metalness: 0,
    });
    const geo = createKinnowGeometry(48, 36, 1.0, DEFAULT_KINNOW_SHAPE);
    const mesh = new THREE.Mesh(geo, mat);
    const buttonGeo = new THREE.CylinderGeometry(0.035, 0.055, 0.025, 8);
    const buttonMesh = new THREE.Mesh(buttonGeo, buttonMat);
    buttonMesh.position.set(0, 0.81, 0);

    baseScale = 1.08;
    mesh.scale.setScalar(baseScale);
    buttonMesh.scale.setScalar(baseScale);
    group.add(mesh, buttonMesh);
    baseRotation.set(-0.05, -0.25, 0.04);
    disposables.push(geo, mat, buttonGeo, buttonMat, maps.map, maps.bumpMap, maps.roughnessMap);
  } else if (fruitId === 'apple') {
    const maps = createAppleSkinMaps(512, 256, 0.74);
    const mat = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 0.32,
      roughnessMap: maps.roughnessMap,
      roughness: 0.65,
      metalness: 0,
      clearcoat: 0.32,
      clearcoatRoughness: 0.34,
    });
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x6b4a2a,
      roughness: 0.92,
      metalness: 0,
    });
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.012, 0.1, 0.008),
      new THREE.Vector3(0.03, 0.19, 0.015),
      new THREE.Vector3(0.055, 0.26, 0.02),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 10, 0.018, 6, false);
    const capGeo = new THREE.SphereGeometry(0.024, 8, 6);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    const stemCap = new THREE.Mesh(capGeo, stemMat);
    stemCap.position.set(0.055, 0.26, 0.02);
    const stemGroup = new THREE.Group();
    stemGroup.add(stem, stemCap);
    stemGroup.position.set(0, 0.84, 0);

    const geo = createAppleGeometry(48, 36, DEFAULT_APPLE_SHAPE);
    const mesh = new THREE.Mesh(geo, mat);

    baseScale = 1.08;
    mesh.scale.setScalar(baseScale);
    stemGroup.scale.setScalar(baseScale);
    group.add(mesh, stemGroup);
    baseRotation.set(0.08, 0.6, 0.05);
    disposables.push(geo, mat, stemGeo, capGeo, stemMat, maps.map, maps.bumpMap, maps.roughnessMap);
  } else if (fruitId === 'anaar') {
    const maps = createAnaarSkinMaps(11, 'Garnet', 512);
    const mat = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 0.05,
      roughnessMap: maps.bumpMap,
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.14,
      clearcoatRoughness: 0.85,
    });
    const geo = createAnaarGeometry(anaarShapeFor(21, 0.995), 0, Math.PI * 2, 48, 36);
    const mesh = new THREE.Mesh(geo, mat);
    const crown = createAnaarCrown(21, 0.8, 0.165);

    baseScale = 1.02;
    mesh.scale.setScalar(baseScale);
    crown.group.scale.setScalar(baseScale);
    group.add(mesh, crown.group);
    baseRotation.set(0.06, 0.35, -0.04);
    disposables.push(geo, mat, maps.map, maps.bumpMap, ...crown.disposables);
  }

  group.rotation.copy(baseRotation);
  scene.add(group);

  // Soft shadow disk beneath specimen
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d');
  if (sCtx) {
    const rad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 58);
    rad.addColorStop(0, 'rgba(0,0,0,0.65)');
    rad.addColorStop(0.5, 'rgba(0,0,0,0.2)');
    rad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = rad;
    sCtx.fillRect(0, 0, 128, 128);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5);
  const shadowDisk = new THREE.Mesh(shadowGeo, shadowMat);
  shadowDisk.rotation.x = -Math.PI / 2;
  shadowDisk.position.set(0, -1.02, 0);
  scene.add(shadowDisk);
  disposables.push(shadowGeo, shadowMat, shadowTex);

  let isActive = false;
  let isZooming = false;
  let zoomProgress = 0;
  let onZoomComplete: (() => void) | null = null;

  const targetPointer = { x: 0, y: 0 };
  const currentPointer = { x: 0, y: 0 };

  let isRunning = true;
  let animFrameId = 0;
  const startTime = performance.now();

  function resize() {
    const w = canvas.clientWidth || 240;
    const h = canvas.clientHeight || 180;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function setActive(active: boolean) {
    isActive = active;
  }

  function setPointer(normX: number, normY: number) {
    targetPointer.x = normX;
    targetPointer.y = normY;
  }

  function triggerZoom(onComplete: () => void) {
    isZooming = true;
    zoomProgress = 0;
    onZoomComplete = onComplete;
  }

  function renderFrame() {
    if (!isRunning) return;

    const time = (performance.now() - startTime) / 1000;

    // Smooth pointer easing
    currentPointer.x += (targetPointer.x - currentPointer.x) * 0.1;
    currentPointer.y += (targetPointer.y - currentPointer.y) * 0.1;

    if (isZooming) {
      zoomProgress = Math.min(1, zoomProgress + 0.05);
      const ease = Math.sin((zoomProgress * Math.PI) / 2);
      group.position.z = THREE.MathUtils.lerp(0, 2.5, ease);
      group.scale.setScalar(THREE.MathUtils.lerp(baseScale, baseScale * 1.5, ease));
      group.rotation.y += 0.03;

      if (zoomProgress >= 1) {
        isZooming = false;
        if (onZoomComplete) {
          const cb = onZoomComplete;
          onZoomComplete = null;
          cb();
        }
      }
    } else {
      const targetZ = isActive ? 0.28 : 0;
      const targetScale = isActive ? baseScale * 1.08 : baseScale;

      group.position.z += (targetZ - group.position.z) * 0.1;
      const curScale = group.scale.x;
      group.scale.setScalar(curScale + (targetScale - curScale) * 0.1);

      if (!reducedMotion) {
        const idleRoll = Math.sin(time * 0.85) * 0.035;
        const idleYaw = Math.cos(time * 0.65) * 0.045;
        const tiltX = currentPointer.y * 0.18;
        const tiltY = currentPointer.x * 0.28;

        const targetRotX = baseRotation.x + (isActive ? tiltX : 0) + idleRoll;
        const targetRotY = baseRotation.y + (isActive ? tiltY : 0) + idleYaw;
        const targetRotZ = baseRotation.z - (isActive ? currentPointer.x * 0.06 : 0);

        group.rotation.x += (targetRotX - group.rotation.x) * 0.09;
        group.rotation.y += (targetRotY - group.rotation.y) * 0.09;
        group.rotation.z += (targetRotZ - group.rotation.z) * 0.09;
      }

      const targetSpotIntensity = isActive ? 2.4 : 1.3;
      spot.intensity += (targetSpotIntensity - spot.intensity) * 0.1;
    }

    renderer.render(scene, camera);
    animFrameId = requestAnimationFrame(renderFrame);
  }

  resize();
  animFrameId = requestAnimationFrame(renderFrame);

  return {
    setActive,
    setPointer,
    triggerZoom,
    resize,
    dispose() {
      isRunning = false;
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
      disposables.forEach((d) => {
        try {
          d.dispose();
        } catch {
          // ignore
        }
      });
    },
  };
}
