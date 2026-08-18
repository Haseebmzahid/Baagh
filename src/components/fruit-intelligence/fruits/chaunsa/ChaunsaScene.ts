import * as THREE from 'three';
import { FruitSceneEngine, FruitSceneOptions, ScreenPoint } from '../../core/types';
import { clamp, lerp, ramp, smooth } from '../../core/mathUtils';
import {
  createCutPieceGeometry,
  createKnifeBladeGeometry,
  createSeedGeometry,
  createWholeMangoGeometry,
} from './geometry';
import {
  createEnvTexture,
  createFleshMaps,
  createSeedMaps,
  createSkinMaps,
} from './textures';
import { chaunsaConfig } from './config';

export function createChaunsaScene(
  canvas: HTMLCanvasElement,
  opts: FruitSceneOptions = {}
): FruitSceneEngine {
  const low = !!opts.lowPerformance;
  const onFrame = opts.onFrame || (() => {});
  const segU = low ? 96 : 168;
  const segV = low ? 72 : 132;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = chaunsaConfig.defaultExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = createEnvTexture();
  const env = pmrem.fromEquirectangular(envTex).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const camTarget = new THREE.Vector3();

  // Studio lighting setup
  const key = new THREE.DirectionalLight(0xfff0d6, 3.4);
  key.position.set(2.6, 4.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 26;
  key.shadow.camera.left = -5.5;
  key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5;
  key.shadow.camera.bottom = -5.5;
  key.shadow.bias = -0.0012;
  key.shadow.radius = 6;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xbfd2e6, 0.55);
  fill.position.set(-3.4, 1.2, -1.6);
  scene.add(fill);

  const front = new THREE.DirectionalLight(0xffdcac, 1.0);
  front.position.set(0.6, 0.8, 4.2);
  scene.add(front);

  const rim = new THREE.SpotLight(0xffe6c0, 12, 14, 0.7, 0.7, 1.6);
  rim.position.set(-1.4, 2.2, -3.4);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0x6b5a44, 0x120e0b, 0.35));

  // Textures and materials
  const sm = createSkinMaps(low ? 1024 : 2048, low ? 512 : 1024, 0.55);
  const fm = createFleshMaps(low ? 512 : 1024);
  const dm = createSeedMaps(512, 512);

  const skinMat = new THREE.MeshPhysicalMaterial({
    map: sm.map,
    bumpMap: sm.bumpMap,
    bumpScale: 0.55,
    roughnessMap: sm.roughnessMap,
    roughness: 0.58,
    metalness: 0,
    clearcoat: 0.04,
    clearcoatRoughness: 0.8,
    sheen: 0.10,
    sheenColor: new THREE.Color(0xffe7b0),
    envMapIntensity: 0.82,
    side: THREE.DoubleSide,
  });

  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: fm.map,
    bumpMap: fm.bumpMap,
    bumpScale: 0.2,
    roughness: 0.46,
    metalness: 0,
    side: THREE.DoubleSide,
    clearcoat: 0.3,
    clearcoatRoughness: 0.38,
    envMapIntensity: 0.6,
  });

  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xd6c096,
    map: dm.map,
    bumpMap: dm.bumpMap,
    bumpScale: 0.5,
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.4,
  });

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xa8acb3,
    roughness: 0.28,
    metalness: 1,
    envMapIntensity: 1.1,
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x2a1d14,
    roughness: 0.55,
    metalness: 0,
  });

  // ---- 1. Whole fruit
  const wholeGeo = createWholeMangoGeometry(segU, segV);
  const wholeSkin = skinMat.clone();
  const whole = new THREE.Mesh(wholeGeo, wholeSkin);
  whole.castShadow = whole.receiveShadow = true;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.032, 0.14, 12, 1),
    new THREE.MeshStandardMaterial({ color: 0x6b5a2c, roughness: 0.85 })
  );
  stem.position.set(-0.035, 1.06, 0.02);
  stem.rotation.z = 0.2;
  stem.castShadow = true;

  const wholeGroup = new THREE.Group();
  wholeGroup.add(whole, stem);

  // ---- 2. Cut pieces (cheek cut beside stone)
  const CUT = 0.30;
  const cheek = createCutPieceGeometry(CUT, 1, segU, segV);
  const body = createCutPieceGeometry(CUT, -1, segU, segV);
  const cheekSkin = skinMat.clone(), bodySkin = skinMat.clone();
  const cheekFlesh = fleshMat.clone(), bodyFlesh = fleshMat.clone();

  const cheekGroup = new THREE.Group();
  const cheekShell = new THREE.Mesh(cheek.shell, cheekSkin);
  const cheekCap = new THREE.Mesh(cheek.cap, cheekFlesh);
  cheekShell.castShadow = cheekShell.receiveShadow = true;
  cheekGroup.add(cheekShell, cheekCap);

  const bodyGroup = new THREE.Group();
  const bodyShell = new THREE.Mesh(body.shell, bodySkin);
  const bodyCap = new THREE.Mesh(body.cap, bodyFlesh);
  bodyShell.castShadow = bodyShell.receiveShadow = true;
  bodyGroup.add(bodyShell, bodyCap);

  const seed = new THREE.Mesh(createSeedGeometry(low ? 64 : 96, low ? 48 : 72), seedMat);
  seed.position.set(0.02, -0.02, -0.02);
  seed.castShadow = true;
  bodyGroup.add(seed);

  const cutGroup = new THREE.Group();
  cutGroup.add(cheekGroup, bodyGroup);
  cutGroup.visible = false;

  // progressive-cut clipping planes
  const planeBelow = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.4);
  const planeAbove = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.4);
  wholeSkin.clippingPlanes = [planeBelow];
  [cheekSkin, bodySkin, cheekFlesh, bodyFlesh, seedMat].forEach((m) => {
    m.clippingPlanes = [planeAbove];
  });

  // ---- 3. Knife
  const blade = new THREE.Mesh(createKnifeBladeGeometry(), steelMat);
  blade.castShadow = true;

  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.56, 16), handleMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(-1.10, 0.02, 0.008);

  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.05, 16), steelMat);
  bolster.rotation.z = Math.PI / 2;
  bolster.position.set(-0.80, 0.02, 0.008);

  const knife = new THREE.Group();
  knife.add(blade, handle, bolster);
  knife.scale.setScalar(0.84);
  knife.rotation.x = -0.12;
  knife.visible = false;

  // ---- 4. Selection trio
  const trio = new THREE.Group();
  const trioMats: THREE.MeshPhysicalMaterial[] = [];
  chaunsaConfig.trioSpecs.forEach((sp, i) => {
    const m = skinMat.clone();
    m.color = new THREE.Color().setHSL(
      lerp(0.16, 0.10, sp.ripeness),
      lerp(0.22, 0.42, sp.ripeness),
      lerp(0.62, 0.52, sp.ripeness)
    );
    m.roughness = lerp(0.56, 0.36, sp.ripeness);
    m.clearcoat = lerp(0.2, 0.5, sp.ripeness);
    trioMats.push(m);

    const mesh = new THREE.Mesh(wholeGeo, m);
    mesh.castShadow = mesh.receiveShadow = true;
    const gp = new THREE.Group();
    gp.add(mesh);
    gp.position.set(sp.x, 0, i === 2 ? 0.5 : -0.2);
    gp.scale.setScalar(sp.scale);
    gp.rotation.set(sp.tilt, sp.rotationY, i === 2 ? -0.22 : 0.34);
    trio.add(gp);
  });
  trio.visible = false;

  // ---- 5. Ground Shadow
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(24, 24),
    new THREE.ShadowMaterial({ opacity: 0.34 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.12;
  ground.receiveShadow = true;

  const stage = new THREE.Group();
  stage.add(wholeGroup, cutGroup, knife, trio);
  scene.add(stage, ground);

  // ---- Anchors projected to screen for DOM annotations
  interface InternalAnchor {
    id: string;
    v: THREE.Vector3;
    host?: THREE.Object3D;
  }
  const anchorList: InternalAnchor[] = [
    { id: 'center', v: new THREE.Vector3(0, 0, 0) },
    { id: 'top', v: new THREE.Vector3(0, 1.04, 0) },
    { id: 'aroma', v: new THREE.Vector3(-0.12, 1.16, 0.08) },
    { id: 'skin', v: new THREE.Vector3(0.66, 0.30, 0.42) },
    { id: 'firmness', v: new THREE.Vector3(-0.62, -0.18, 0.30) },
    { id: 'ripeness', v: new THREE.Vector3(0.30, -0.98, 0.22) },
    { id: 'flesh', v: new THREE.Vector3(0.10, 0.20, -0.34), host: cheekGroup },
    { id: 'fibre', v: new THREE.Vector3(-0.34, -0.62, -0.30), host: cheekGroup },
    { id: 'seed', v: new THREE.Vector3(1.10, 0.05, 0.95), host: bodyGroup },
  ];

  ['good', 'better', 'best'].forEach((id, i) => {
    anchorList.push({
      id,
      v: new THREE.Vector3(0, 1.34, 0),
      host: trio.children[i],
    });
  });

  const drag = { x: 0, y: 0 };
  const dragTarget = { x: 0, y: 0 };
  let progress = 0;
  let shown = 0;
  const t0 = performance.now();
  let W = 1;
  let H = 1;
  let running = true;

  function resize(): void {
    W = canvas.clientWidth || 1;
    H = canvas.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function setProgress(p: number): void {
    progress = clamp(p, 0, 1);
  }

  function addDrag(dx: number, dy: number): void {
    dragTarget.x += dx;
    dragTarget.y = clamp(dragTarget.y + dy, -0.5, 0.5);
  }

  const screenPts: ScreenPoint[] = [];
  const tmp = new THREE.Vector3();

  function layout(p: number, time: number): void {
    // ---------------- Acts progression
    const cutting = ramp(p, 0.30, 0.42);
    const explode = ramp(p, 0.44, 0.58);
    const trioIn = ramp(p, 0.68, 0.76);
    const trioOut = ramp(p, 0.80, 0.845);
    const rejoin = ramp(p, 0.848, 0.906);

    const cutStage = (p > 0.295 && p < 0.672) || (p > 0.848 && p < 0.932);
    cutGroup.visible = cutStage;
    wholeGroup.visible = p < 0.42 || p >= 0.928;
    trio.visible = trioIn > 0.001 && trioOut < 0.999;
    knife.visible = p > 0.28 && p < 0.45;

    // blade travel drives progressive cut
    const bladeY = lerp(1.75, -1.5, cutting);
    planeBelow.constant = bladeY + 0.002;
    planeAbove.constant = -bladeY + 0.002;
    if (!cutStage) {
      planeBelow.constant = 5;
      planeAbove.constant = 5;
    }
    if (p >= 0.42) {
      planeAbove.constant = 5;
    }

    knife.position.set(lerp(2.9, 0.62, ramp(p, 0.28, 0.335)), bladeY + 0.13, CUT + 0.012);
    knife.rotation.z = lerp(-0.55, -0.09, ramp(p, 0.28, 0.35));

    // separation + explosion
    const sep = Math.max(explode, ramp(p, 0.415, 0.46) * 0.30) * (1 - rejoin);
    cheekGroup.position.set(lerp(0, 1.30, sep), lerp(0, 0.18, sep), lerp(0, 0.25, sep));
    cheekGroup.rotation.set(lerp(0, 0.10, sep), lerp(0, Math.PI * 0.94, sep), lerp(0, -0.08, sep));
    bodyGroup.position.set(lerp(0, -1.15, sep), lerp(0, -0.06, sep), lerp(0, 0.05, sep));
    bodyGroup.rotation.y = lerp(0, -0.14, sep);
    seed.position.set(lerp(0.02, 1.22, sep), lerp(-0.02, 0.02, sep), lerp(-0.02, 0.95, sep));
    seed.rotation.z = lerp(0, 0.22, sep);
    seed.rotation.y = lerp(0, 0.18, sep);

    // trio arrangement
    trio.position.set(0, 0, 0);
    trio.scale.setScalar(lerp(0.86, 1, trioIn));
    trio.children.forEach((g, i) => {
      const o = trioIn * (1 - trioOut);
      g.position.y = lerp(-0.5, 0, o) + Math.sin(time * 0.4 + i) * 0.008;
    });

    // whole fruit gentle idle + drag
    const spin = p * 3.1 + drag.x + time * 0.045;
    wholeGroup.rotation.set(0.06 + drag.y * 0.7, spin, 0.06);
    cutGroup.rotation.set(
      0.05 + drag.y * 0.7,
      spin * 0.30 * (1 - explode * 0.85) + drag.x * 0.2 * explode,
      0.03
    );
    trio.rotation.set(drag.y * 0.25, drag.x * 0.35, 0);

    // camera choreography
    const stops = chaunsaConfig.cameraStops;
    const marks = chaunsaConfig.cameraMarks;
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

    const ang = ch + drag.x * 0.18 + Math.sin(time * 0.09) * 0.03;
    const wide = W / H > 1.15;
    const centered = Math.max(trioIn * (1 - trioOut), ramp(p, 0.925, 0.965), explode * (1 - rejoin) * 0.5);
    const fo = wide ? -9.5 * (1 - centered) : 0;
    if (Math.abs(camera.filmOffset - fo) > 0.01) {
      camera.filmOffset = fo;
      camera.updateProjectionMatrix();
    }
    const dScale = wide ? 1 : lerp(1.34, 1.06, clamp((W / H - 0.55) / 0.6, 0, 1));
    camera.position.set(
      Math.sin(ang) * d * dScale,
      cy + Math.sin(time * 0.13) * 0.02 + drag.y * 0.5,
      Math.cos(ang) * d * dScale
    );
    camTarget.set(0, tY + (wide ? 0 : 0.62), 0);
    camera.lookAt(camTarget);

    ground.material.opacity = lerp(
      0.34,
      0.13,
      Math.max(explode * (1 - rejoin), trioIn * (1 - trioOut) * 0.3)
    );
    key.intensity = lerp(2.5, 2.9, trioIn * (1 - trioOut));
  }

  function collect(): ScreenPoint[] {
    screenPts.length = 0;
    for (const a of anchorList) {
      tmp.copy(a.v);
      const host = a.host || wholeGroup;
      host.updateWorldMatrix(true, false);
      tmp.applyMatrix4(host.matrixWorld);
      const depth = tmp.clone().sub(camera.position).length();
      tmp.project(camera);
      screenPts.push({
        id: a.id,
        x: (tmp.x * 0.5 + 0.5) * W,
        y: (-tmp.y * 0.5 + 0.5) * H,
        front: depth < camera.position.length() + 0.05,
      });
    }
    return screenPts;
  }

  function frame(): void {
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
      running = false;
      renderer.dispose();
      pmrem.dispose();
    },
  };
}
