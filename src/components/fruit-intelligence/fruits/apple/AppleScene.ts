import * as THREE from 'three';
import { FruitSceneEngine, FruitSceneOptions, ScreenPoint } from '../../core/types';
import { clamp, lerp, ramp, smooth } from '../../core/mathUtils';
import {
  AppleShape,
  DEFAULT_APPLE_SHAPE,
  crossFaceGeometry,
  fruitGeometry,
  makeShape,
  radiusAt,
  wedgeGeometry,
} from './geometry';
import {
  createCoreMaps,
  createCoreSectionMap,
  createCrossMaps,
  createEnvTexture,
  createFleshMaps,
  createSkinMaps,
} from './textures';
import { appleConfig } from './config';

const TAU = Math.PI * 2;

export function createAppleScene(
  canvas: HTMLCanvasElement,
  opts: FruitSceneOptions = {}
): FruitSceneEngine {
  const low = !!opts.lowPerformance;
  const onFrame = opts.onFrame || (() => {});
  const NW = 6;
  const CORE_R = 0.17;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = appleConfig.defaultExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(createEnvTexture()).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const camTarget = new THREE.Vector3();

  // Studio lighting
  const key = new THREE.DirectionalLight(0xfff4e2, 2.5);
  key.position.set(2.3, 3.8, 3.1);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 26;
  key.shadow.camera.left = -5.5;
  key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5;
  key.shadow.camera.bottom = -5.5;
  key.shadow.bias = -0.0015;
  key.shadow.radius = 8;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xc4d4e8, 0.4);
  fill.position.set(-3.4, 1.0, -1.4);
  scene.add(fill);

  const front = new THREE.DirectionalLight(0xffe6c6, 0.55);
  front.position.set(0.4, 0.5, 4.2);
  scene.add(front);

  const bounce = new THREE.DirectionalLight(0xffd6b0, 0.26);
  bounce.position.set(0.2, -2.6, 1.4);
  scene.add(bounce);

  scene.add(new THREE.HemisphereLight(0x6e5c46, 0x120e0b, 0.28));

  const SH = DEFAULT_APPLE_SHAPE;
  const sm = createSkinMaps(low ? 1024 : 2048, low ? 512 : 1024, 0.74);
  const fm = createFleshMaps(low ? 640 : 1024);
  const cm = createCrossMaps(low ? 768 : 1280);

  const skinMat = new THREE.MeshPhysicalMaterial({
    map: sm.map,
    bumpMap: sm.bumpMap,
    bumpScale: 0.32,
    roughnessMap: sm.roughnessMap,
    roughness: 1,
    metalness: 0,
    clearcoat: 0.34,
    clearcoatRoughness: 0.34,
    envMapIntensity: 0.6,
    specularIntensity: 0.6,
  });

  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: fm.map,
    bumpMap: fm.bumpMap,
    bumpScale: 0.5,
    roughness: 0.62,
    metalness: 0,
    clearcoat: 0,
    specularIntensity: 0.12,
    envMapIntensity: 0.1,
    transmission: low ? 0 : 0.1,
    thickness: 0.4,
    ior: 1.35,
    side: THREE.DoubleSide,
  });

  const crossMat = new THREE.MeshPhysicalMaterial({
    map: cm.map,
    bumpMap: cm.bumpMap,
    bumpScale: 0.55,
    roughness: 0.6,
    metalness: 0,
    clearcoat: 0,
    specularIntensity: 0.12,
    envMapIntensity: 0.1,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const coreMat = new THREE.MeshStandardMaterial({
    roughness: 0.94,
    metalness: 0,
    envMapIntensity: 0.08,
    side: THREE.DoubleSide,
  });

  const seedMat = new THREE.MeshPhysicalMaterial({
    color: 0x150800,
    roughness: 0.45,
    metalness: 0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.35,
    envMapIntensity: 0.1,
  });

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x6b4a2a,
    roughness: 0.92,
    metalness: 0,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xacb0b6,
    roughness: 0.26,
    metalness: 1,
    envMapIntensity: 1.05,
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x241a12,
    roughness: 0.6,
    metalness: 0,
  });

  const cm2 = createCoreMaps(low ? 512 : 1024, low ? 256 : 512);
  coreMat.map = cm2.map;
  coreMat.bumpMap = cm2.bumpMap;
  coreMat.bumpScale = 0.7;

  const stage = new THREE.Group();
  scene.add(stage);

  const makeStem = (sh: AppleShape) => {
    const g = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.012, 0.1, 0.008),
      new THREE.Vector3(0.03, 0.19, 0.015),
      new THREE.Vector3(0.055, 0.26, 0.02),
    ]);
    const stem = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.017, 8, false), stemMat);
    stem.castShadow = true;
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), stemMat);
    cap.position.set(0.055, 0.26, 0.02);
    g.add(stem, cap);
    g.position.set(0, radiusAt(0, 0, sh) * sh.squash - 0.02, 0);
    return g;
  };

  // ---- Whole fruit
  const wholeGeo = fruitGeometry(low ? 104 : 176, low ? 72 : 120, SH);
  const whole = new THREE.Mesh(wholeGeo, skinMat);
  whole.castShadow = whole.receiveShadow = true;
  const wholeGroup = new THREE.Group();
  wholeGroup.add(whole, makeStem(SH));
  stage.add(wholeGroup);

  // ---- Wedges (the slice)
  const wedgeHalf = (Math.PI / NW) * 0.985;
  const wg = wedgeGeometry(wedgeHalf, low ? 20 : 30, low ? 40 : 60, SH, CORE_R);
  const wedges: THREE.Group[] = [];
  const sliced = new THREE.Group();
  for (let i = 0; i < NW; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / NW) * TAU;
    const arm = new THREE.Group();
    const skin = new THREE.Mesh(wg.skin, skinMat);
    skin.castShadow = true;
    arm.add(skin);
    wg.faces.forEach((f) => arm.add(new THREE.Mesh(f, fleshMat)));
    yaw.add(arm);
    sliced.add(yaw);
    wedges.push(arm);
  }
  sliced.visible = false;
  stage.add(sliced);

  // ---- Core + seeds
  const coreProfile: THREE.Vector2[] = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const r = CORE_R * Math.pow(Math.sin(Math.PI * clamp(t, 0.02, 0.98)), 0.55);
    coreProfile.push(new THREE.Vector2(Math.max(0.004, r), lerp(0.42, -0.44, t)));
  }

  const coreClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.02);
  const coreGroup = new THREE.Group();
  const coreMesh = new THREE.Mesh(new THREE.LatheGeometry(coreProfile, 36), coreMat);
  coreMesh.castShadow = true;
  coreGroup.add(coreMesh);

  const sectionFace = new THREE.Mesh(
    new THREE.CircleGeometry(CORE_R * 1.02, 64),
    new THREE.MeshStandardMaterial({
      map: createCoreSectionMap(low ? 640 : 1024),
      roughness: 0.62,
      metalness: 0,
      envMapIntensity: 0.1,
      transparent: true,
      side: THREE.DoubleSide,
    })
  );
  sectionFace.rotation.x = -Math.PI / 2;
  sectionFace.position.y = 0.02;
  sectionFace.visible = false;
  coreGroup.add(sectionFace);

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0x241f0c,
    roughness: 0.95,
    metalness: 0,
    envMapIntensity: 0.05,
    side: THREE.DoubleSide,
  });
  const wallShape = new THREE.Shape();
  wallShape.moveTo(0, 0.3);
  wallShape.quadraticCurveTo(CORE_R * 1.05, 0.16, CORE_R * 1.02, -0.02);
  wallShape.quadraticCurveTo(CORE_R * 0.9, -0.22, 0, -0.32);
  wallShape.closePath();
  const wallGeo = new THREE.ShapeGeometry(wallShape, 16);
  for (let i = 0; i < 5; i++) {
    const w = new THREE.Mesh(wallGeo, wallMat);
    w.rotation.y = -(i / 5) * TAU - Math.PI / 2;
    w.visible = false;
    coreGroup.add(w);
  }

  const seeds: THREE.Mesh[] = [];
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), seedMat);
    s.scale.set(0.5, 1.15, 0.34);
    const a = (i / 5) * TAU + TAU / 10;
    s.position.set(Math.cos(a) * 0.055, i % 2 ? 0.015 : -0.012, Math.sin(a) * 0.055);
    s.rotation.set(0.16, -a, 0.26);
    s.castShadow = true;
    s.visible = false;
    coreGroup.add(s);
    seeds.push(s);
  }
  coreGroup.visible = false;
  stage.add(coreGroup);

  // ---- Cross-section
  const crossPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.001);
  const crossSkin = skinMat.clone();
  crossSkin.clippingPlanes = [crossPlane];
  const crossGroup = new THREE.Group();
  const crossShell = new THREE.Mesh(wholeGeo, crossSkin);
  crossShell.castShadow = crossShell.receiveShadow = true;
  const face = new THREE.Mesh(crossFaceGeometry(SH, low ? 56 : 90), crossMat);
  face.position.z = 0.004;
  const crossStem = makeStem(SH);
  crossGroup.add(crossShell, face, crossStem);
  crossGroup.visible = false;
  stage.add(crossGroup);

  // ---- Knife
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.82, -0.075);
  bladeShape.lineTo(0.94, -0.016);
  bladeShape.quadraticCurveTo(1.08, 0.014, 0.88, 0.078);
  bladeShape.lineTo(-0.82, 0.125);
  bladeShape.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bladeShape, {
      depth: 0.014,
      bevelEnabled: true,
      bevelSize: 0.007,
      bevelThickness: 0.005,
      bevelSegments: 2,
    }),
    steelMat
  );
  blade.castShadow = true;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.54, 16), handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-1.12, 0.024, 0.007);
  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.045, 16), steelMat);
  bolster.rotation.z = Math.PI / 2;
  bolster.position.set(-0.83, 0.024, 0.007);
  const knife = new THREE.Group();
  knife.add(blade, handle, bolster);
  knife.scale.setScalar(0.8);
  knife.rotation.x = -0.1;
  knife.visible = false;
  stage.add(knife);

  // ---- Selection trio
  const trio = new THREE.Group();
  const trioSpecs = [
    { x: -2.5, blush: 0.42, s: 0.86, seed: 0.83, tilt: 0.14, rot: 0.6 },
    { x: 0.02, blush: 0.66, s: 0.93, seed: 0.27, tilt: -0.08, rot: 2.4 },
    { x: 2.54, blush: 0.9, s: 1.0, seed: 0.61, tilt: 0.05, rot: 4.1 },
  ];
  trioSpecs.forEach((sp) => {
    const sh = makeShape(sp.seed);
    const maps = createSkinMaps(low ? 768 : 1024, low ? 384 : 512, sp.blush, sp.seed);
    const m = new THREE.MeshPhysicalMaterial({
      map: maps.map,
      bumpMap: maps.bumpMap,
      bumpScale: 0.3,
      roughnessMap: maps.roughnessMap,
      roughness: 1,
      metalness: 0,
      clearcoat: lerp(0.26, 0.4, sp.blush),
      clearcoatRoughness: 0.36,
      envMapIntensity: 0.58,
      specularIntensity: 0.6,
    });
    const mesh = new THREE.Mesh(fruitGeometry(low ? 76 : 124, low ? 52 : 84, sh), m);
    mesh.castShadow = mesh.receiveShadow = true;
    const gp = new THREE.Group();
    gp.add(mesh, makeStem(sh));
    gp.position.set(sp.x, 0, 0);
    gp.scale.setScalar(sp.s);
    gp.rotation.set(sp.tilt, sp.rot, sp.tilt * 0.5);
    trio.add(gp);
  });
  trio.visible = false;
  stage.add(trio);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.95;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- Anchors
  interface AnchorDef {
    id: string;
    v: THREE.Vector3;
    nearest?: boolean;
    alwaysFront?: boolean;
  }
  const anchorDefs: AnchorDef[] = [
    { id: 'center', v: new THREE.Vector3(0, 0, 0) },
    { id: 'top', v: new THREE.Vector3(0, SH.squash * 0.9, 0) },
    { id: 'edge', v: new THREE.Vector3(-1, 0, 0) },
    { id: 'skin', v: new THREE.Vector3(0.62, 0.2, 0.5) },
    { id: 'colour', v: new THREE.Vector3(0.5, 0.46, 0.5) },
    { id: 'stem', v: new THREE.Vector3(0.05, SH.squash * 0.95, 0.05) },
    { id: 'firmness', v: new THREE.Vector3(-0.6, -0.3, 0.44) },
    { id: 'cut', v: new THREE.Vector3(0.4, 0.1, 0.1), nearest: true },
    { id: 'flesh', v: new THREE.Vector3(-0.3, 0.3, 0.03), alwaysFront: true },
    { id: 'core', v: new THREE.Vector3(0.02, 0.05, 0.03), alwaysFront: true },
    { id: 'seeds', v: new THREE.Vector3(0.09, 0.02, 0.16), alwaysFront: true },
    { id: 'chamber', v: new THREE.Vector3(-0.02, 0.24, 0.02), alwaysFront: true },
  ];

  const anchorHosts: Record<string, THREE.Object3D> = {
    flesh: crossGroup,
    core: crossGroup,
    seeds: coreGroup,
    chamber: coreGroup,
  };

  const edgeAnchor = new THREE.Object3D();
  edgeAnchor.position.set(-1, 0, 0);
  stage.add(edgeAnchor);
  anchorHosts.edge = edgeAnchor;

  ['good', 'better', 'best'].forEach((id, i) => {
    anchorDefs.push({ id, v: new THREE.Vector3(0, 1.16, 0), alwaysFront: true });
    anchorHosts[id] = trio.children[i];
  });

  const drag = { x: 0, y: 0 };
  const dragTarget = { x: 0, y: 0 };
  let progress = 0;
  let shown = 0;
  const t0 = performance.now();
  let W = 1;
  let H = 1;
  let running = true;
  const screenPts: ScreenPoint[] = [];
  const tmp = new THREE.Vector3();
  const hostCenter = new THREE.Vector3();

  function resize() {
    W = canvas.clientWidth || 1;
    H = canvas.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function setProgress(p: number) {
    progress = clamp(p, 0, 1);
  }

  function addDrag(dx: number, dy: number) {
    dragTarget.x += dx;
    dragTarget.y = clamp(dragTarget.y + dy, -0.5, 0.5);
  }

  function layout(p: number, time: number) {
    const cutting = ramp(p, 0.305, 0.4); // knife passes through
    const part = ramp(p, 0.4, 0.475); // wedges ease apart
    const fan = ramp(p, 0.455, 0.53); // wedges lay out
    const crossIn = ramp(p, 0.545, 0.6);
    const crossOut = ramp(p, 0.655, 0.678);
    const coreIn = ramp(p, 0.672, 0.7);
    const coreOut = ramp(p, 0.8, 0.83);
    const trioIn = ramp(p, 0.845, 0.9);
    const trioOut = ramp(p, 0.925, 0.945);

    sliced.visible = p > 0.3 && p < 0.6;
    crossGroup.visible = crossIn > 0.001 && crossOut < 0.999;
    coreGroup.visible = (coreIn > 0.001 && coreOut < 0.999) || (p > 0.3 && p < 0.6);
    trio.visible = trioIn > 0.001 && trioOut < 0.999;
    wholeGroup.visible = p < 0.305 || p >= 0.946;
    knife.visible = p > 0.29 && p < 0.42;

    // Knife travels down through the fruit
    const bladeY = lerp(1.5, -1.35, cutting);
    knife.position.set(lerp(2.6, 0.5, ramp(p, 0.29, 0.345)), bladeY + 0.12, 0.02);
    knife.rotation.z = lerp(-0.5, -0.07, ramp(p, 0.29, 0.35));

    const sep = Math.max(part, fan * 0.6);
    wedges.forEach((arm, i) => {
      const stagger = clamp(sep * (1 + 0.16 * NW) - i * 0.1, 0, 1);
      const a = smooth(stagger);
      const out = a * 0.34 + fan * 0.26;
      arm.position.set(out, fan * 0.03 * Math.sin(i * 2.3), out * 0.1);
      arm.rotation.z = -fan * 0.1;
      arm.rotation.y = fan * 0.12 * (i % 2 ? 1 : -1);
    });
    sliced.position.y = -cutting * 0.02;

    crossMat.opacity = Math.max(crossIn * (1 - crossOut), 0);
    crossGroup.rotation.x = -0.05 + drag.y * 0.4;
    crossGroup.rotation.y = 0.08 + drag.x * 0.28 + Math.sin(time * 0.08) * 0.02;

    const sectioned = coreIn > 0.001 && coreOut < 0.999;
    coreMat.clippingPlanes = sectioned ? [coreClip] : null;
    sectionFace.visible = sectioned;
    coreGroup.rotation.set(0, drag.x * 0.3 + Math.sin(time * 0.05) * 0.05, 0);
    coreMat.transparent = false;
    coreMat.opacity = 1;
    coreGroup.scale.setScalar(1.4);

    trio.children.forEach((g, i) => {
      g.position.y = lerp(-0.4, 0, trioIn) + Math.sin(time * 0.35 + i * 1.7) * 0.006;
    });

    const spin = p * 1.5 + drag.x + time * 0.03;
    wholeGroup.rotation.set(0.05 + drag.y * 0.5, spin, 0.03);
    sliced.rotation.y = spin * 0.35 * (1 - fan * 0.8) + drag.x * 0.22 * fan;
    sliced.rotation.x = drag.y * 0.4;
    trio.rotation.set(drag.y * 0.18, drag.x * 0.26, 0);

    const stops = appleConfig.cameraStops;
    const marks = appleConfig.cameraMarks;
    let i1 = 0;
    for (let i = 0; i < marks.length - 1; i++) {
      if (p >= marks[i]) i1 = i;
    }
    const i2 = Math.min(i1 + 1, stops.length - 1);
    const f = smooth(clamp((p - marks[i1]) / ((marks[i2] - marks[i1]) || 1), 0, 1));
    const d = lerp(stops[i1].distance, stops[i2].distance, f);
    const cy = lerp(stops[i1].y, stops[i2].y, f);
    const ch = lerp(stops[i1].heading, stops[i2].heading, f);
    const tY = lerp(stops[i1].targetY, stops[i2].targetY, f);

    const wide = W / H > 1.15;
    const centered = Math.max(trioIn * (1 - trioOut), ramp(p, 0.955, 0.98), fan * 0.4);
    const fo = wide ? -7.2 * (1 - centered) : 0;
    if (Math.abs(camera.filmOffset - fo) > 0.01) {
      camera.filmOffset = fo;
      camera.updateProjectionMatrix();
    }
    const dScale = wide ? 1 : lerp(1.34, 1.06, clamp((W / H - 0.55) / 0.6, 0, 1));
    const ang = ch + drag.x * 0.12 + Math.sin(time * 0.07) * 0.022;
    camera.position.set(
      Math.sin(ang) * d * dScale,
      cy + Math.sin(time * 0.11) * 0.016 + drag.y * 0.38,
      Math.cos(ang) * d * dScale
    );
    camTarget.set(0, tY + (wide ? 0 : 0.46), 0);
    camera.lookAt(camTarget);

    edgeAnchor.position.set(-(1 + 0.55 * fan), 0, 0);
    if (ground.material instanceof THREE.ShadowMaterial) {
      ground.material.opacity = lerp(0.3, 0.1, Math.max(fan, trioIn * (1 - trioOut) * 0.3));
    }
    key.intensity = lerp(2.5, 3.0, trioIn * (1 - trioOut));
  }

  function collect(): ScreenPoint[] {
    screenPts.length = 0;
    let nearW: THREE.Object3D = wedges[0];
    let nearD = Infinity;
    for (const arm of wedges) {
      arm.updateWorldMatrix(true, false);
      hostCenter.setFromMatrixPosition(arm.matrixWorld);
      const dd = hostCenter.distanceTo(camera.position);
      if (dd < nearD) {
        nearD = dd;
        nearW = arm;
      }
    }

    for (const a of anchorDefs) {
      tmp.copy(a.v);
      const host = a.nearest ? nearW : (anchorHosts[a.id] || wholeGroup);
      host.updateWorldMatrix(true, false);
      tmp.applyMatrix4(host.matrixWorld);
      hostCenter.setFromMatrixPosition(host.matrixWorld);
      const depth = tmp.distanceTo(camera.position);
      const front =
        a.nearest || a.alwaysFront
          ? true
          : depth < hostCenter.distanceTo(camera.position) + 0.12;
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

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const time = (performance.now() - t0) / 1000;
    shown += (progress - shown) * 0.085;
    drag.x += (dragTarget.x - drag.x) * 0.09;
    drag.y += (dragTarget.y - drag.y) * 0.09;
    layout(shown, time);
    renderer.render(scene, camera);
    onFrame(collect(), shown);
  }

  resize();
  frame();

  return {
    setProgress,
    addDrag,
    resize,
    setExposure(v: number) {
      renderer.toneMappingExposure = v;
    },
    renderAt(p: number) {
      progress = shown = clamp(p, 0, 1);
      layout(shown, 9);
      renderer.render(scene, camera);
      onFrame(collect(), shown);
    },
    dispose() {
      running = false;
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
