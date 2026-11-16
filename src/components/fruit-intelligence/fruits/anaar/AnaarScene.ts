import { createSceneLoop } from '../../core/sceneLoop';
import { disposeScene } from '../../core/disposeScene';
import { damping } from '../../core/performance';
import * as THREE from 'three';
import { FruitSceneEngine, FruitSceneOptions, ScreenPoint } from '../../core/types';
import { clamp, lerp, ramp } from '../../core/mathUtils';
import {
  arilGeometry,
  bodyGeometry,
  crownGroup,
  cutFaceGeometry,
  packFace,
  rng,
  shapeFor,
  ShapeField,
} from './geometry';
import { AnaarTone, createEnvTexture, createFaceTexture, createSkinMaps } from './textures';
import { ANAAR_STAGES, anaarCameraKeys, anaarConfig } from './config';

interface AnaarAnchor {
  id: string;
  v: THREE.Vector3;
  host: string;
  alwaysFront: boolean;
}

interface OriginalAril {
  pos: THREE.Vector3;
  scale: THREE.Vector3;
}

export function createAnaarScene(
  canvas: HTMLCanvasElement,
  opts: FruitSceneOptions = {}
): FruitSceneEngine {
  const low = !!opts.lowPerformance;
  const onFrame = opts.onFrame || (() => {});
  const tone: AnaarTone = 'Garnet';

  // Everything allocated here is tracked and released in dispose().
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !low,
    alpha: true,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1 : 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = anaarConfig.defaultExposure;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0708, 0.052);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envSrc = createEnvTexture();
  const environment = pmrem.fromEquirectangular(envSrc);
  scene.environment = environment.texture;
  envSrc.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 120);
  camera.position.set(0.24, 0.38, 6.9);
  const lookAt = new THREE.Vector3(0, 0.02, 0);

  // Studio lighting from the prototype.
  const key = new THREE.SpotLight(0xfff2e4, 420, 0, 0.72, 0.95, 2);
  key.position.set(2.6, 3.6, 3.4);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 512 : 1024, low ? 512 : 1024);
  key.shadow.bias = -0.0009;
  key.shadow.radius = 2;
  scene.add(key, key.target);

  const soft = new THREE.DirectionalLight(0xffe6d2, 1.1);
  soft.position.set(-1.6, 1.2, 3.0);
  const rimL = new THREE.DirectionalLight(0xffc7a4, 2.2);
  rimL.position.set(-4.2, 1.4, -2.6);
  const rimR = new THREE.DirectionalLight(0xa9c3ff, 0.9);
  rimR.position.set(4.0, 0.7, -3.2);
  const fill = new THREE.DirectionalLight(0xffd9c4, 0.35);
  fill.position.set(0.4, -1.4, 2.4);
  scene.add(soft, rimL, rimR, fill, new THREE.AmbientLight(0x4a3630, 0.6));

  const groundGeo = track(new THREE.PlaneGeometry(40, 40));
  const groundMat = track(new THREE.ShadowMaterial({ opacity: 0.5 }));
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.22;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- Shared materials -------------------------------------------------
  const skinTex = createSkinMaps(11, tone, low ? 512 : 1024);
  track(skinTex.map);
  track(skinTex.bumpMap);
  const skinMat = track(
    new THREE.MeshPhysicalMaterial({
      map: skinTex.map,
      bumpMap: skinTex.bumpMap,
      bumpScale: 0.05,
      roughnessMap: skinTex.bumpMap,
      roughness: 0.62,
      metalness: 0,
      clearcoat: 0.14,
      clearcoatRoughness: 0.85,
      envMapIntensity: 0.32,
    })
  );

  const arilGeo = track(arilGeometry());
  const arilMat = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0,
      clearcoat: 0.34,
      clearcoatRoughness: 0.42,
      envMapIntensity: 0.35,
      emissive: new THREE.Color(0x220205),
      emissiveIntensity: 0.18,
      ior: 1.4,
    })
  );

  const fruitRoot = new THREE.Group();
  scene.add(fruitRoot);

  // ---- Whole fruit ------------------------------------------------------
  const shapeMain = shapeFor(21, 0.995);
  const wholeGroup = new THREE.Group();
  const wholeGeo = track(
    bodyGeometry(shapeMain, 0, Math.PI * 2, low ? 80 : 120, low ? 56 : 84)
  );
  const wholeMesh = new THREE.Mesh(wholeGeo, skinMat);
  wholeMesh.castShadow = true;
  wholeMesh.receiveShadow = true;
  wholeGroup.add(wholeMesh);
  const wholeCrown = crownGroup(21, 0.8, 0.165);
  wholeCrown.disposables.forEach(track);
  wholeGroup.add(wholeCrown.group);
  fruitRoot.add(wholeGroup);

  // ---- Cut halves -------------------------------------------------------
  const arilCount = low ? 105 : 155;
  const faceSize = low ? 512 : 768;
  const segA = low ? 64 : 96;
  const segV = low ? 68 : 104;

  function buildHalf(shape: ShapeField, seed: number): {
    group: THREE.Group;
    originals: OriginalAril[];
  } {
    const g = new THREE.Group();

    const skinGeo = track(bodyGeometry(shape, -Math.PI / 2, Math.PI / 2, segA, segV));
    const skinMesh = new THREE.Mesh(skinGeo, skinMat);
    skinMesh.castShadow = true;
    skinMesh.receiveShadow = true;
    g.add(skinMesh);

    const { pts, spokes } = packFace(seed, arilCount);
    const face = cutFaceGeometry(shape);
    track(face.geometry);
    const faceTex = track(createFaceTexture(seed, spokes, faceSize));
    const faceMat = track(
      new THREE.MeshPhysicalMaterial({
        map: faceTex,
        roughness: 0.86,
        clearcoat: 0.08,
        clearcoatRoughness: 0.72,
        envMapIntensity: 0.35,
      })
    );
    const faceMesh = new THREE.Mesh(face.geometry, faceMat);
    faceMesh.receiveShadow = true;
    g.add(faceMesh);

    const inst = track(new THREE.InstancedMesh(arilGeo, arilMat, pts.length));
    inst.castShadow = true;
    inst.receiveShadow = true;
    const dum = new THREE.Object3D();
    const col = new THREE.Color();
    const rnd = rng(seed + 88);
    const originals: OriginalAril[] = [];

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const fp = face.facePoint(p.t, p.psi);
      const r = p.r;
      fp.x -= r * 0.34 + 0.006;
      dum.position.copy(fp);
      dum.rotation.set(
        p.psi + (rnd() - 0.5) * 0.7,
        (rnd() - 0.5) * 0.34,
        (rnd() - 0.5) * 0.34
      );
      dum.scale.set(
        r * (1.14 + p.k * 0.3),
        r * (0.9 + p.k * 0.18),
        r * (0.94 + p.k * 0.16)
      );
      dum.updateMatrix();
      inst.setMatrixAt(i, dum.matrix);

      // Garnet through to deep ruby.
      col.setHSL((0.988 + (p.k - 0.5) * 0.016) % 1, 0.9 + p.k * 0.08, 0.072 + p.k * 0.072);
      inst.setColorAt(i, col);
      originals.push({ pos: fp.clone(), scale: dum.scale.clone() });
    }
    inst.instanceMatrix.needsUpdate = true;
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
    g.add(inst);

    return { group: g, originals };
  }

  const halfAData = buildHalf(shapeMain, 21);
  const halfA = halfAData.group;
  const crownA = crownGroup(21, 0.8, 0.165);
  crownA.disposables.forEach(track);
  halfA.add(crownA.group);

  const halfBData = buildHalf(shapeMain, 63);
  const halfB = halfBData.group;
  const crownB = crownGroup(63, 0.8, 0.165);
  crownB.disposables.forEach(track);
  halfB.add(crownB.group);
  halfB.rotation.y = Math.PI;

  const cutGroup = new THREE.Group();
  cutGroup.add(halfA, halfB);
  cutGroup.visible = false;
  fruitRoot.add(cutGroup);

  // ---- Floating arils ---------------------------------------------------
  const fCount = low ? 16 : 26;
  const floaters = track(new THREE.InstancedMesh(arilGeo, arilMat, fCount));
  floaters.castShadow = true;
  floaters.visible = false;
  const fData: {
    from: THREE.Vector3;
    to: THREE.Vector3;
    scale: THREE.Vector3;
    rot: THREE.Vector3;
    spin: number;
    ph: number;
  }[] = [];
  {
    const frnd = rng(909);
    const oa = halfAData.originals;
    const fc = new THREE.Color();
    for (let i = 0; i < fCount; i++) {
      const src = oa[Math.floor(frnd() * oa.length)];
      const from = src ? src.pos.clone() : new THREE.Vector3();
      from.x -= 0.02;
      const to = new THREE.Vector3(
        from.x - (0.35 + frnd() * 0.75),
        from.y + (frnd() - 0.35) * 0.85,
        from.z + (frnd() - 0.5) * 0.7
      );
      fData.push({
        from,
        to,
        scale: (src ? src.scale.clone() : new THREE.Vector3(0.03, 0.04, 0.03)).multiplyScalar(1.05),
        rot: new THREE.Vector3(frnd() * 6.28, frnd() * 6.28, frnd() * 6.28),
        spin: (frnd() - 0.5) * 0.5,
        ph: frnd() * 6.28,
      });
      const fk = frnd();
      fc.setHSL((0.988 + (fk - 0.5) * 0.016) % 1, 0.9 + fk * 0.08, 0.072 + fk * 0.072);
      floaters.setColorAt(i, fc);
    }
    if (floaters.instanceColor) floaters.instanceColor.needsUpdate = true;
  }
  halfA.add(floaters);

  // ---- Knife ------------------------------------------------------------
  const knife = new THREE.Group();
  const bladeGeo = track(new THREE.BoxGeometry(0.016, 1.5, 0.3));
  const bladeMat = track(
    new THREE.MeshPhysicalMaterial({ color: 0xc3c7cb, metalness: 1, roughness: 0.17, clearcoat: 1 })
  );
  const blade = new THREE.Mesh(bladeGeo, bladeMat);
  blade.position.y = 0.75;
  blade.castShadow = true;
  const handleGeo = track(new THREE.BoxGeometry(0.05, 0.55, 0.1));
  const handleMat = track(new THREE.MeshStandardMaterial({ color: 0x2a1d18, roughness: 0.7 }));
  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 1.78;
  knife.add(blade, handle);
  knife.rotation.z = 0.1;
  knife.visible = false;
  fruitRoot.add(knife);

  // ---- Selection trio ---------------------------------------------------
  const trioGroup = new THREE.Group();
  trioGroup.visible = false;
  scene.add(trioGroup);
  const trioMats: THREE.Material[] = [];
  const trioMeta: { seed: number; tone: AnaarTone; squat: number }[] = [
    { seed: 131, tone: 'Sun-blushed', squat: 1.02 },
    { seed: 277, tone: 'Garnet', squat: 0.995 },
    { seed: 419, tone: 'Oxblood', squat: 0.965 },
  ];

  anaarConfig.trioSpecs.forEach((spec, i) => {
    const meta = trioMeta[i];
    const tx = createSkinMaps(meta.seed, meta.tone, low ? 512 : 768);
    track(tx.map);
    track(tx.bumpMap);
    const mat = track(
      new THREE.MeshPhysicalMaterial({
        map: tx.map,
        bumpMap: tx.bumpMap,
        bumpScale: 0.02,
        roughnessMap: tx.bumpMap,
        roughness: 0.54,
        clearcoat: 0.15,
        clearcoatRoughness: 0.78,
        envMapIntensity: 0.55,
      })
    );
    trioMats.push(mat);

    const sh = shapeFor(meta.seed, meta.squat);
    const geo = track(bodyGeometry(sh, 0, Math.PI * 2, low ? 80 : 112, low ? 56 : 76));
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const grp = new THREE.Group();
    grp.add(mesh);
    const cr = crownGroup(meta.seed, 0.8, 0.165);
    cr.disposables.forEach(track);
    grp.add(cr.group);
    grp.position.set(spec.x, -0.12 + (1 - spec.scale) * 0.5, i === 1 ? -0.25 : 0);
    grp.scale.setScalar(spec.scale);
    grp.rotation.y = spec.rotationY;
    trioGroup.add(grp);
  });

  // ---- Opacity groups ---------------------------------------------------
  const wholeMats: THREE.Material[] = [skinMat];
  const cutMats: THREE.Material[] = [skinMat, arilMat];
  cutGroup.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (m && cutMats.indexOf(m) < 0) cutMats.push(m);
  });
  wholeGroup.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (m && wholeMats.indexOf(m) < 0) wholeMats.push(m);
  });

  function setOpacity(mats: THREE.Material[], o: number): void {
    for (const m of mats) {
      m.opacity = o;
      m.transparent = o < 0.995;
      m.depthWrite = o > 0.5;
    }
  }

  // ---- Anchors ----------------------------------------------------------
  const anchorDefs: AnaarAnchor[] = anaarConfig.anchors.map((a) => ({
    id: a.id,
    v: new THREE.Vector3(a.position[0], a.position[1], a.position[2]),
    host: a.hostMesh || (a.actGroup === 'trio' ? 'trio' : 'fruitRoot'),
    alwaysFront: !!a.alwaysFront,
  }));
  const anchorHosts: Record<string, THREE.Object3D> = {
    fruitRoot,
    halfA,
    trio: trioGroup,
  };

  // ---- State ------------------------------------------------------------
  let progress = 0;
  let shown = 0;
  let yaw = 0;
  let pitch = 0;
  let spin = 0;
  let dragging = false;
  let dragIdle = 0;
  let W = 1;
  let H = 1;

  const screenPts: ScreenPoint[] = [];
  const tmp = new THREE.Vector3();
  const hostCenter = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const dum = new THREE.Object3D();

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
    yaw += dx;
    pitch = clamp(pitch + dy, -0.42, 0.42);
    dragging = true;
    dragIdle = 0;
    loop.invalidate();
  }

  /** Applies the prototype's stage choreography at stage scalar s. */
  function layout(s: number, time: number, dt: number): void {
    const wholeOp = clamp((1 - ramp(s, 2.55, 3.0)) + ramp(s, 7.6, 8.0), 0, 1);
    const cutOp = clamp(ramp(s, 2.55, 3.0) - ramp(s, 6.55, 6.95), 0, 1);
    const trioOp = clamp(ramp(s, 6.6, 7.0) - ramp(s, 7.55, 7.9), 0, 1);
    const open = ramp(s, 3.05, 4.15);
    const flo = clamp(ramp(s, 4.55, 5.15) - 0.7 * ramp(s, 5.95, 6.45), 0, 1);

    wholeGroup.visible = wholeOp > 0.01;
    cutGroup.visible = cutOp > 0.01;
    trioGroup.visible = trioOp > 0.01;

    setOpacity(wholeMats, wholeOp);
    if (cutGroup.visible) setOpacity(cutMats, cutOp);
    if (trioGroup.visible) setOpacity(trioMats, trioOp);
    if (wholeOp > 0.01 && cutOp <= 0.01) skinMat.opacity = wholeOp;

    // Halves part along the fruit's own chambers.
    const sep = 0.02 + open * 0.8;
    const rot = open * 1.06;
    halfA.position.set(sep, -open * 0.04, 0);
    halfA.rotation.y = rot;
    halfB.position.set(-sep, -open * 0.04, 0);
    halfB.rotation.y = Math.PI - rot;

    // Knife pass.
    const kv = clamp(ramp(s, 2.7, 2.95) - ramp(s, 3.85, 4.1), 0, 1);
    knife.visible = kv > 0.02;
    if (knife.visible) {
      knife.position.y = lerp(1.75, -1.15, clamp((s - 2.85) / 1.05, 0, 1));
      bladeMat.transparent = true;
      bladeMat.opacity = kv;
      handleMat.transparent = true;
      handleMat.opacity = kv;
    }

    // Arils lifting away from the face.
    floaters.visible = flo > 0.02;
    if (floaters.visible) {
      const ease = flo * flo * (3 - 2 * flo);
      for (let i = 0; i < fData.length; i++) {
        const f = fData[i];
        dum.position.lerpVectors(f.from, f.to, ease);
        dum.position.y += Math.sin(time * 0.55 + f.ph) * 0.035 * ease;
        dum.position.z += Math.cos(time * 0.42 + f.ph) * 0.03 * ease;
        dum.rotation.set(
          f.rot.x + time * f.spin * 0.3,
          f.rot.y + time * f.spin * 0.4,
          f.rot.z
        );
        dum.scale.copy(f.scale);
        dum.updateMatrix();
        floaters.setMatrixAt(i, dum.matrix);
      }
      floaters.instanceMatrix.needsUpdate = true;
    }

    // Rotation: slow orbit on the whole fruit and the trio, damped when cut.
    const spinOK = (wholeOp > 0.5 || trioOp > 0.5) && !dragging;
    if (spinOK) spin += dt * 0.055;
    if (cutOp > 0.5) yaw *= 1 - Math.min(1, dt * 0.9);
    fruitRoot.rotation.y = yaw + spin;
    fruitRoot.rotation.x = pitch * (cutOp > 0.5 ? 0.35 : 1);
    trioGroup.rotation.y = yaw * 0.5 + spin * 0.25;

    // Camera: interpolate the prototype keyframes.
    const i0 = Math.min(anaarCameraKeys.length - 2, Math.floor(s));
    const i1 = i0 + 1;
    const raw = clamp(s - i0, 0, 1);
    const f = raw * raw * (3 - 2 * raw);
    const A = anaarCameraKeys[i0];
    const B = anaarCameraKeys[i1];

    camPos.set(lerp(A.p[0], B.p[0], f), lerp(A.p[1], B.p[1], f), lerp(A.p[2], B.p[2], f));
    camTarget.set(lerp(A.t[0], B.t[0], f), lerp(A.t[1], B.t[1], f), lerp(A.t[2], B.t[2], f));

    const dist = camPos.distanceTo(camTarget);
    const wide = W / H > 1.15;
    if (!wide) {
      camPos.sub(camTarget).multiplyScalar(1.28).add(camTarget);
    } else {
      // Bias the composition left so the narrative column stays clear.
      const off = -0.125 * dist;
      camPos.x += off;
      camTarget.x += off;
    }
    camPos.y += Math.sin(time * 0.21) * 0.012 * dist;
    camPos.x += Math.cos(time * 0.17) * 0.01 * dist;

    camera.position.lerp(camPos, Math.min(1, dt * 6));
    lookAt.lerp(camTarget, Math.min(1, dt * 6));
    camera.lookAt(lookAt);

    const fov = lerp(A.f, B.f, f) * (wide ? 1 : 1.06);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = lerp(camera.fov, fov, Math.min(1, dt * 6));
      camera.updateProjectionMatrix();
    }

    groundMat.opacity = lerp(0.5, 0.22, Math.max(cutOp, trioOp));
  }

  function collect(): ScreenPoint[] {
    screenPts.length = 0;
    for (const a of anchorDefs) {
      const host = anchorHosts[a.host] || fruitRoot;
      host.updateWorldMatrix(true, false);
      tmp.copy(a.v).applyMatrix4(host.matrixWorld);
      hostCenter.setFromMatrixPosition(host.matrixWorld);
      const depth = tmp.distanceTo(camera.position);
      const front = a.alwaysFront
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

  const loop = createSceneLoop((time, dt, publish) => {
    if (dragging) {
      dragIdle += dt;
      if (dragIdle > 0.25) dragging = false;
    }
    shown += (progress - shown) * (opts.reducedMotion ? 1 : damping(7, dt));
    layout(shown * ANAAR_STAGES, time, dt);
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
    setExposure(v: number) {
      renderer.toneMappingExposure = v;
    },
    renderAt(p: number) {
      progress = shown = clamp(p, 0, 1);
      layout(shown * ANAAR_STAGES, 9, 1);
      renderer.render(scene, camera);
      onFrame(collect(), shown);
    },
    dispose(): void {
      loop.dispose();
      disposeScene(scene, [environment, pmrem, envSrc, ...disposables]);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
