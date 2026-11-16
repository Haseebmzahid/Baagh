import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { createSceneLoop } from '../../core/sceneLoop';
import { disposeScene } from '../../core/disposeScene';
import { damping } from '../../core/performance';
import * as THREE from 'three';
import { FruitSceneEngine, FruitSceneOptions, ScreenPoint } from '../../core/types';
import { clamp, lerp, ramp, smooth } from '../../core/mathUtils';
import {
  DEFAULT_SHAPE,
  createCrossFaceGeometry,
  createFruitGeometry,
  createKinnowStemButton,
  createPetalBands,
  createSegmentGeometry,
  makeShape,
} from './geometry';
import {
  createCrossSectionMaps,
  createKinnowEnvTexture,
  createMembraneMap,
  createPithMap,
  createRindMaps,
  createVesicleMaps,
} from './textures';
import { kinnowConfig } from './config';

const TAU = Math.PI * 2;

export function createKinnowScene(
  canvas: HTMLCanvasElement,
  opts: FruitSceneOptions = {}
): FruitSceneEngine {
  const low = !!opts.lowPerformance;
  const onFrame = opts.onFrame || (() => {});
  const NP = 6, NS = 10, SPLIT = 0.56;
  const segU = low ? 32 : 46, segV = low ? 26 : 40;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = kinnowConfig.defaultExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = createKinnowEnvTexture();
  const environment = pmrem.fromEquirectangular(envTex);
  scene.environment = environment.texture;
  envTex.dispose();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const camTarget = new THREE.Vector3();

  // Studio lighting
  const key = new THREE.DirectionalLight(0xfff2dc, 2.35);
  key.position.set(2.4, 3.9, 3.0);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 512 : 1024, low ? 512 : 1024);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 26;
  key.shadow.camera.left = -5.5;
  key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5;
  key.shadow.camera.bottom = -5.5;
  key.shadow.bias = -0.0015;
  key.shadow.radius = 8;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc6d6e8, 0.42);
  fill.position.set(-3.4, 1.0, -1.4);
  scene.add(fill);

  const front = new THREE.DirectionalLight(0xffe2b8, 0.6);
  front.position.set(0.4, 0.5, 4.2);
  scene.add(front);

  const bounce = new THREE.DirectionalLight(0xffd9a8, 0.3);
  bounce.position.set(0.2, -2.6, 1.4);
  scene.add(bounce);

  scene.add(new THREE.HemisphereLight(0x6e5c46, 0x120e0b, 0.3));

  // Textures and materials
  const TW = low ? 512 : 1024, TH = low ? 256 : 512;
  const rm = createRindMaps(TW, TH, 0.72);
  const pith = createPithMap(low ? 256 : 512);
  const memb = createMembraneMap(low ? 256 : 512);
  const ves = createVesicleMaps(low ? 256 : 512);
  const cross = createCrossSectionMaps(low ? 512 : 768, NS);

  const rindMat = new THREE.MeshPhysicalMaterial({
    map: rm.map,
    bumpMap: rm.bumpMap,
    bumpScale: 1.55,
    roughnessMap: rm.roughnessMap,
    roughness: 1,
    metalness: 0,
    clearcoat: 0.10,
    clearcoatRoughness: 0.85,
    sheen: 0.22,
    sheenRoughness: 0.8,
    sheenColor: new THREE.Color(0xffcf96),
    envMapIntensity: 0.5,
    specularIntensity: 0.5,
  });

  const pithMat = new THREE.MeshStandardMaterial({
    color: 0xfdf7e8,
    map: pith,
    roughness: 1,
    metalness: 0,
    envMapIntensity: 0.22,
    side: THREE.DoubleSide,
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xf5e8cc,
    roughness: 0.95,
    metalness: 0,
    side: THREE.DoubleSide,
  });

  const membMat = new THREE.MeshPhysicalMaterial({
    map: memb,
    roughness: 0.46,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.4,
    envMapIntensity: 0.45,
    sheen: 0.3,
    sheenColor: new THREE.Color(0xffe0a8),
    // Flesh uses surface highlights; refraction would redraw the entire scene.
    transmission: 0,
    thickness: 0.5,
    ior: 1.36,
    side: THREE.DoubleSide,
  });

  const vesMat = new THREE.MeshPhysicalMaterial({
    map: ves.map,
    bumpMap: ves.bumpMap,
    bumpScale: 1.6,
    roughness: 0.36,
    metalness: 0,
    clearcoat: 0.32,
    clearcoatRoughness: 0.3,
    envMapIntensity: 0.4,
    // Flesh uses surface highlights; refraction would redraw the entire scene.
    transmission: 0,
    thickness: 0.35,
    ior: 1.36,
    side: THREE.DoubleSide,
  });

  const crossMat = new THREE.MeshPhysicalMaterial({
    map: cross.map,
    bumpMap: cross.bumpMap,
    bumpScale: 1.1,
    roughness: 0.34,
    metalness: 0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.22,
    envMapIntensity: 0.45,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const seedMat = new THREE.MeshStandardMaterial({ color: 0xf3e9cf, roughness: 0.62, metalness: 0 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x717c36, roughness: 0.9, metalness: 0 });

  const stage = new THREE.Group();
  scene.add(stage);

  const SH = DEFAULT_SHAPE;
  const wholeGeo = createFruitGeometry(low ? 72 : 112, low ? 48 : 76, 1, SH);

  // ---- 1. Whole fruit
  const whole = new THREE.Mesh(wholeGeo, rindMat);
  whole.castShadow = whole.receiveShadow = true;
  const wholeGroup = new THREE.Group();
  wholeGroup.add(whole, createKinnowStemButton(stemMat, SH));
  stage.add(wholeGroup);

  // ---- 2. Peel: 2-band petals that curl back
  const petalHalf = (Math.PI / NP) * 0.985;
  const pb = createPetalBands(petalHalf, segU, segV, 1, 0.945, SH, SPLIT);
  const peel = new THREE.Group();
  // Rim surfaces share a material and local coordinates: merge without changing shape.
  const upperRims = mergeGeometries(pb.upper.rims);
  const lowerRims = mergeGeometries(pb.lower.rims);
  interface PetalItem {
    hinge: THREE.Group;
    tip: THREE.Group;
  }
  const petals: PetalItem[] = [];

  for (let i = 0; i < NP; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / NP) * TAU;
    const hinge = new THREE.Group();
    hinge.position.copy(pb.stemPivot);

    const upper = new THREE.Group();
    const uo = new THREE.Mesh(pb.upper.outer, rindMat);
    uo.castShadow = true;
    upper.add(uo, new THREE.Mesh(pb.upper.inner, pithMat));
    (upperRims ? [upperRims] : pb.upper.rims).forEach(r => upper.add(new THREE.Mesh(r, rimMat)));

    // tip band hinges on the split ring so it can curl independently
    const tip = new THREE.Group();
    tip.position.copy(pb.splitPivot).sub(pb.stemPivot);
    const to = new THREE.Mesh(pb.lower.outer, rindMat);
    to.castShadow = true;
    tip.add(to, new THREE.Mesh(pb.lower.inner, pithMat));
    (lowerRims ? [lowerRims] : pb.lower.rims).forEach(r => tip.add(new THREE.Mesh(r, rimMat)));

    upper.add(tip);
    hinge.add(upper);
    yaw.add(hinge);
    peel.add(yaw);
    petals.push({ hinge, tip });
  }
  peel.visible = false;
  stage.add(peel);

  // ---- 3. Flesh segments
  const segHalf = (Math.PI / NS) * 0.80;
  const sg = createSegmentGeometry(segHalf, low ? 18 : 26, low ? 34 : 48, 0.80, SH);
  const segmentSides = mergeGeometries(sg.sides);
  const flesh = new THREE.Group();
  const segs: THREE.Group[] = [];

  for (let i = 0; i < NS; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / NS) * TAU;
    const arm = new THREE.Group();
    const o = new THREE.Mesh(sg.outer, membMat);
    o.castShadow = true;
    arm.add(o);
    (segmentSides ? [segmentSides] : sg.sides).forEach(s => arm.add(new THREE.Mesh(s, vesMat)));

    if (i === 0) {
      const seed = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), seedMat);
      seed.scale.set(0.6, 1, 0.34);
      seed.position.set(0.2, 0.1, 0);
      seed.rotation.z = 0.42;
      arm.add(seed);
      arm.userData.seed = seed;
    }
    yaw.add(arm);
    flesh.add(yaw);
    segs.push(arm);
  }
  flesh.visible = false;
  stage.add(flesh);

  // ---- 4. Cross-section: clipped half fruit with painted cut face
  const crossPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.001);
  const crossRind = rindMat.clone();
  crossRind.clippingPlanes = [crossPlane];
  const crossGroup = new THREE.Group();
  const crossShell = new THREE.Mesh(wholeGeo, crossRind);
  crossShell.castShadow = crossShell.receiveShadow = true;
  const face = new THREE.Mesh(createCrossFaceGeometry(SH, low ? 48 : 80), crossMat);
  face.position.z = 0.004;
  crossGroup.add(crossShell, face);
  crossGroup.visible = false;
  stage.add(crossGroup);

  // ---- 5. Selection trio: 3 genuinely distinct fruits
  const trio = new THREE.Group();
  kinnowConfig.trioSpecs.forEach((sp) => {
    const seedVal = sp.id === 'good' ? 0.71 : (sp.id === 'better' ? 0.19 : 0.53);
    const sh = makeShape(seedVal);
    const maps = createRindMaps(low ? 384 : 512, low ? 192 : 256, sp.ripeness, seedVal);
    const m = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 1.45,
      roughnessMap: maps.roughnessMap,
      roughness: 1,
      metalness: 0,
      clearcoat: lerp(0.05, 0.12, sp.ripeness),
      clearcoatRoughness: 0.85,
      sheen: 0.2,
      sheenRoughness: 0.8,
      sheenColor: new THREE.Color(0xffcf96),
      envMapIntensity: 0.48,
      specularIntensity: 0.5,
    });
    const mesh = new THREE.Mesh(createFruitGeometry(low ? 72 : 120, low ? 48 : 78, 1, sh), m);
    mesh.castShadow = mesh.receiveShadow = true;
    const btn = createKinnowStemButton(stemMat, sh);
    const gp = new THREE.Group();
    gp.add(mesh, btn);
    gp.position.set(sp.x, 0, 0);
    gp.scale.setScalar(sp.scale);
    gp.rotation.set(sp.tilt, sp.rotationY, sp.tilt * 0.5);
    trio.add(gp);
  });
  trio.visible = false;
  stage.add(trio);

  // ---- 6. Ground Shadow
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.86;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- Anchors
  interface InternalAnchor {
    id: string;
    v: THREE.Vector3;
    host?: THREE.Object3D;
    nearest?: boolean;
    alwaysFront?: boolean;
  }
  const anchorDefs: InternalAnchor[] = [
    { id: 'center', v: new THREE.Vector3(0, 0, 0) },
    { id: 'top', v: new THREE.Vector3(0, SH.squash, 0) },
    { id: 'edge', v: new THREE.Vector3(-1, 0, 0) },
    { id: 'colour', v: new THREE.Vector3(0.6, 0.4, 0.5) },
    { id: 'button', v: new THREE.Vector3(0.05, SH.squash * 0.95, 0.05) },
    { id: 'weight', v: new THREE.Vector3(-0.64, -0.28, 0.42) },
    { id: 'give', v: new THREE.Vector3(0.48, -0.5, 0.48) },
    { id: 'rind', v: new THREE.Vector3(0, -0.28, 0.42), host: petals[0].tip },
    { id: 'membrane', v: new THREE.Vector3(0.42, 0.34, 0.34), nearest: true },
    { id: 'juice', v: new THREE.Vector3(0.30, 0.02, 0.30), nearest: true },
    { id: 'seeds', v: new THREE.Vector3(0.2, 0.12, 0), host: segs[0], alwaysFront: true },
    { id: 'core', v: new THREE.Vector3(0.02, 0.04, 0.02), host: crossGroup, alwaysFront: true },
  ];

  const edgeAnchor = new THREE.Object3D();
  edgeAnchor.position.set(-1, 0, 0);
  stage.add(edgeAnchor);
  anchorDefs.find((a) => a.id === 'edge')!.host = edgeAnchor;

  ['good', 'better', 'best'].forEach((id, i) => {
    anchorDefs.push({
      id,
      v: new THREE.Vector3(0, 1.06, 0),
      host: trio.children[i],
      alwaysFront: true,
    });
  });

  const drag = { x: 0, y: 0 };
  const dragTarget = { x: 0, y: 0 };
  let progress = 0;
  let shown = 0;
  let W = 1;
  let H = 1;

  function resize(): void {
    W = canvas.clientWidth || 1;
    H = canvas.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    loop.invalidate();
  }

  function setProgress(p: number): void {
    progress = clamp(p, 0, 1);
    loop.invalidate();
  }

  function addDrag(dx: number, dy: number): void {
    dragTarget.x += dx;
    dragTarget.y = clamp(dragTarget.y + dy, -0.5, 0.5);
    loop.invalidate();
  }

  const screenPts: ScreenPoint[] = [];
  const tmp = new THREE.Vector3();
  const hostCenter = new THREE.Vector3();

  function layout(p: number, time: number): void {
    const open = ramp(p, 0.30, 0.435);
    const curl = ramp(p, 0.355, 0.50);
    const shed = ramp(p, 0.45, 0.53);
    const fan = ramp(p, 0.482, 0.552);
    const single = ramp(p, 0.515, 0.552);
    const crossIn = ramp(p, 0.552, 0.60);
    const crossOut = ramp(p, 0.655, 0.678);
    const trioIn = ramp(p, 0.685, 0.765);
    const trioOut = ramp(p, 0.80, 0.845);

    const peelOn = p > 0.285 && p < 0.60;
    const fleshOn = p > 0.285 && p < 0.60;
    peel.visible = peelOn;
    flesh.visible = fleshOn;
    crossGroup.visible = crossIn > 0.001 && crossOut < 0.999;
    wholeGroup.visible = p < 0.30 || p >= 0.848;
    trio.visible = trioIn > 0.001 && trioOut < 0.999;

    // rind: hinge opens, tip curls back, then sinks away
    petals.forEach((pt, i) => {
      const st = smooth(clamp(open * (1 + 0.2 * NP) - i * 0.18, 0, 1));
      const ct = smooth(clamp(curl * (1 + 0.2 * NP) - i * 0.18, 0, 1));
      pt.hinge.rotation.z = st * 0.66 + shed * 0.3;
      pt.hinge.rotation.x = shed * 0.05 * (i % 2 ? 1 : -1);
      pt.tip.rotation.z = ct * 1.35 + shed * 0.5;
      pt.tip.rotation.y = ct * 0.1 * (i % 2 ? 1 : -1);
    });
    peel.position.y = -(shed * 2.9 + fan * 1.4);
    peel.rotation.z = shed * 0.16 + fan * 0.14;
    peel.rotation.y = Math.PI / NP;

    flesh.position.y = shed * 0.44 + fan * 0.12;
    segs.forEach((arm, i) => {
      const lifted = i === 0 ? single : 0;
      const out = fan * 0.42 + lifted * 0.5;
      arm.position.set(out * 1.0, lifted * 0.5 + fan * 0.02 * Math.sin(i * 2.1), out * 0.08);
      arm.rotation.z = -fan * 0.1 - lifted * 0.3;
      arm.rotation.y = lifted * 0.45;
      if (arm.userData.seed) {
        arm.userData.seed.visible = single > 0.2;
      }
    });

    crossMat.opacity = crossIn * (1 - crossOut);
    crossGroup.rotation.x = -0.06 + drag.y * 0.4;
    crossGroup.rotation.y = 0.10 + drag.x * 0.3 + Math.sin(time * 0.08) * 0.02;

    trio.children.forEach((g, i) => {
      g.position.y = lerp(-0.4, 0, trioIn) + Math.sin(time * 0.35 + i * 1.7) * 0.006;
    });

    const spin = p * 2.4 + drag.x + time * 0.035;
    wholeGroup.rotation.set(0.05 + drag.y * 0.55, spin, 0.03);
    const bodySpin = spin * 0.3 * (1 - fan * 0.85) + drag.x * 0.22 * fan;
    peel.rotation.y = bodySpin + Math.PI / NP;
    peel.rotation.x = drag.y * 0.45;
    flesh.rotation.y = bodySpin + 0.3 * fan;
    flesh.rotation.x = drag.y * 0.45;
    trio.rotation.set(drag.y * 0.2, drag.x * 0.28, 0);

    // camera choreography
    const stops = kinnowConfig.cameraStops;
    const marks = kinnowConfig.cameraMarks;
    let i1 = 0;
    for (let i = 0; i < marks.length - 1; i++) {
      if (p >= marks[i]) i1 = i;
    }
    const i2 = Math.min(i1 + 1, stops.length - 1);
    const markRange = (marks[i2] - marks[i1]) || 1;
    const f = smooth(clamp((p - marks[i1]) / markRange, 0, 1));
    const d = lerp(stops[i1].distance, stops[i2].distance, f);
    const cy = lerp(stops[i1].y, stops[i2].y, f);
    const ch = lerp(stops[i1].heading, stops[i2].heading, f);
    const tY = lerp(stops[i1].targetY, stops[i2].targetY, f);

    const wide = W / H > 1.15;
    const centered = Math.max(trioIn * (1 - trioOut), ramp(p, 0.90, 0.95), fan * 0.4);
    const fo = wide ? -7.2 * (1 - centered) : 0;
    if (Math.abs(camera.filmOffset - fo) > 0.01) {
      camera.filmOffset = fo;
      camera.updateProjectionMatrix();
    }
    const dScale = wide ? 1 : 1.12 * lerp(1.34, 1.06, clamp((W / H - 0.55) / 0.6, 0, 1));
    const ang = ch + drag.x * 0.14 + Math.sin(time * 0.08) * 0.025;
    camera.position.set(
      Math.sin(ang) * d * dScale,
      cy + Math.sin(time * 0.12) * 0.018 + drag.y * 0.4,
      Math.cos(ang) * d * dScale
    );
    camTarget.set(0, tY + (wide ? 0 : -0.28), 0);
    camera.lookAt(camTarget);

    const openWidth = 1 + 0.72 * Math.max(open, shed) * (peel.visible ? 1 : 0);
    edgeAnchor.position.set(-openWidth, 0, 0);
    ground.material.opacity = lerp(0.3, 0.1, Math.max(fan, trioIn * (1 - trioOut) * 0.3));
    key.intensity = lerp(2.35, 2.95, trioIn * (1 - trioOut));
    front.intensity = lerp(0.6, 0.95, trioIn * (1 - trioOut));
  }

  function collect(): ScreenPoint[] {
    screenPts.length = 0;
    let nearSeg = segs[0], nearD = Infinity;
    for (const arm of segs) {
      arm.updateWorldMatrix(true, false);
      hostCenter.setFromMatrixPosition(arm.matrixWorld);
      const dd = hostCenter.distanceTo(camera.position);
      if (dd < nearD) {
        nearD = dd;
        nearSeg = arm;
      }
    }

    for (const a of anchorDefs) {
      tmp.copy(a.v);
      const host = a.nearest ? nearSeg : (a.host || wholeGroup);
      host.updateWorldMatrix(true, false);
      tmp.applyMatrix4(host.matrixWorld);
      hostCenter.setFromMatrixPosition(host.matrixWorld);
      const depth = tmp.distanceTo(camera.position);
      const front = a.nearest || a.alwaysFront ? true : depth < hostCenter.distanceTo(camera.position) + 0.12;
      tmp.project(camera);
      screenPts.push({
        id: a.id,
        x: (tmp.x * 0.5 + 0.5) * W,
        y: (-tmp.y * 0.5 + 0.5) * H,
        front,
      });
    }
    return screenPts;
  }

  const loop = createSceneLoop((time, dt, publish) => {
    const ease = opts.reducedMotion ? 1 : damping(7, dt);
    shown += (progress - shown) * ease;
    drag.x += (dragTarget.x - drag.x) * ease;
    drag.y += (dragTarget.y - drag.y) * ease;
    layout(shown, time);
    renderer.render(scene, camera);
    if (publish) onFrame(collect(), shown);
  }, opts.reducedMotion, () => {
    const currentRatio = renderer.getPixelRatio();
    const nextRatio = Math.max(.75, currentRatio * .8);
    if (nextRatio < currentRatio) {
      renderer.setPixelRatio(nextRatio);
      renderer.setSize(W, H, false);
    }
  });

  resize();
  loop.start();

  return {
    getDiagnostics() { return { geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures, drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles, progress: shown, contextLost: renderer.getContext().isContextLost() }; },
    setProgress,
    addDrag,
    resize,
    setExposure(v: number): void {
      renderer.toneMappingExposure = v;
    },
    renderAt(p: number): void {
      progress = shown = clamp(p, 0, 1);
      layout(shown, 9);
      renderer.render(scene, camera);
      onFrame(collect(), shown);
    },
    dispose(): void {
      loop.dispose();
      disposeScene(scene, [environment, pmrem, envTex]);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
