import * as THREE from 'three';
import { buildSpecimen } from './specimenScene';
import type { SpecimenFruit } from './specimenScene';
import { createEnvTexture } from '../fruit-intelligence/fruits/chaunsa/textures';

export interface CommerceStudy { id: string; fruit: SpecimenFruit }
export interface CommerceStageEngine {
  select(id: string): void;
  setPointer(x: number, y: number): void;
  setProgress(progress: number): void;
  setActive(active: boolean): void;
  setMotionEnabled(enabled: boolean): void;
  resize(): void;
  dispose(): void;
}

/** One renderer serves a live display and cached grid portraits. Whole-fruit
 * geometry/textures are shared with Fruit Intelligence; its scenes stay intact. */
export function createCommerceStage(canvas: HTMLCanvasElement, studies: CommerceStudy[], initialId: string, options: {
  low: boolean; reduced: boolean; onPortrait: (id: string, source: string) => void; onError: () => void;
}): CommerceStageEngine {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !options.low, powerPreference: options.low ? 'low-power' : 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, options.low ? 1.25 : 1.65));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const environment = createEnvTexture();
  scene.environment = environment;
  const camera = new THREE.PerspectiveCamera(34, 1, .1, 35);
  const display = new THREE.Group();
  scene.add(display);
  const resources = new Set<{ dispose(): void }>([environment]);
  const track = <T extends { dispose(): void }>(resource: T): T => { resources.add(resource); return resource; };

  const key = new THREE.DirectionalLight('#ffe4b7', 3.1);
  key.position.set(-3.5, 5.5, 4);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(options.low ? 512 : 1024);
  key.shadow.camera.left = key.shadow.camera.bottom = -3;
  key.shadow.camera.right = key.shadow.camera.top = 3;
  key.shadow.normalBias = .035;
  key.shadow.bias = -.0003;
  scene.add(key);
  const rim = new THREE.DirectionalLight('#f9dba8', 1.6);
  rim.position.set(2, 3, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight('#b6c4ce', .65);
  fill.position.set(3, 1.6, 4);
  scene.add(fill, new THREE.HemisphereLight('#a99a7c', '#18150e', .75));

  // A shallow, bevelled stone display. No floating fruit or decorative UI chrome.
  const profile = [[0,-.14],[1.73,-.14],[1.80,-.11],[1.82,-.06],[1.82,.06],[1.78,.13],[0,.13]].map(([x,y]) => new THREE.Vector2(x,y));
  const stoneCanvas = document.createElement('canvas');
  stoneCanvas.width = stoneCanvas.height = 256;
  const context = stoneCanvas.getContext('2d')!;
  const stonePixels = context.createImageData(256,256);
  for (let i = 0; i < stonePixels.data.length; i += 4) {
    const n = (Math.sin(i * 13.27) * 43758.54) % 1;
    const light = 68 + n * 8;
    stonePixels.data.set([light, light * .9, light * .73, 255], i);
  }
  context.putImageData(stonePixels,0,0);
  const stoneMap = track(new THREE.CanvasTexture(stoneCanvas));
  stoneMap.colorSpace = THREE.SRGBColorSpace;
  stoneMap.wrapS = stoneMap.wrapT = THREE.RepeatWrapping;
  stoneMap.repeat.set(3,3);
  const plinth = new THREE.Mesh(track(new THREE.LatheGeometry(profile, options.low ? 64 : 112)), track(new THREE.MeshStandardMaterial({ map:stoneMap, roughness:.94, bumpMap:stoneMap, bumpScale:.006 })));
  plinth.receiveShadow = true;
  display.add(plinth);
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(12,12)),track(new THREE.ShadowMaterial({opacity:.25})));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -.15;
  floor.receiveShadow = true;
  display.add(floor);

  const cache = new Map<string,THREE.Group>();
  let selected = initialId;
  let current: THREE.Group | undefined;
  function show(id: string) {
    const study = studies.find((entry) => entry.id === id);
    if (!study) return;
    let group = cache.get(id);
    if (!group) {
      // Three fruit share a display rather than filling an inspection viewport.
      // Bound texture generation to 1024px here; full inspection retains its
      // original detail. This also bounds the work behind cached card images.
      const built = buildSpecimen(study.fruit, id, true, environment);
      built.disposables.forEach((resource) => resources.add(resource));
      const bounds = new THREE.Box3().setFromObject(built.object);
      const size = bounds.getSize(new THREE.Vector3());
      const centre = bounds.getCenter(new THREE.Vector3());
      built.object.position.sub(centre);
      const fruit = new THREE.Group();
      fruit.add(built.object);
      fruit.scale.setScalar(1.45 / Math.max(size.x,size.y,size.z));
      group = new THREE.Group();
      const placements = [
        {x:.13,z:-.30,scale:1.12,roll:-.13,yaw:.25},
        {x:-.88,z:.42,scale:.87,roll:1.03,yaw:-.5},
        {x:.86,z:.55,scale:.78,roll:-.84,yaw:.8},
      ];
      placements.forEach((placement) => {
        const copy = fruit.clone(true);
        copy.scale.multiplyScalar(placement.scale);
        copy.rotation.set(.05,placement.yaw,placement.roll);
        copy.position.set(placement.x,0,placement.z);
        const minY = new THREE.Box3().setFromObject(copy,true).min.y;
        copy.position.y = .14 - minY;
        copy.traverse((object) => {
          if ((object as THREE.Mesh).isMesh) { object.castShadow = true; object.receiveShadow = true; }
        });
        group!.add(copy);
      });
      cache.set(id,group);
      display.add(group);
    }
    if (current) current.visible = false;
    group.visible = true;
    current = group;
  }

  let disposed = false;
  let active = true;
  let raf = 0;
  let idleTimer = 0;
  let pointerX = 0, pointerY = 0, shownX = 0, shownY = 0, progress = 0;
  let motion = !options.reduced;
  function frame(time: number) {
    raf = 0;
    if (disposed || !active || document.hidden) return;
    shownX += (pointerX - shownX) * .06;
    shownY += (pointerY - shownY) * .06;
    const drift = motion ? Math.sin(time * .00017) * .035 : 0;
    display.rotation.y = -.16 + drift + (motion ? shownX * .10 + progress * .08 : 0);
    camera.position.set(0,2.05 + (motion ? shownY * .10 : 0),5.5);
    camera.lookAt(0,.64,0);
    renderer.render(scene,camera);
    if (motion) requestFrame();
  }
  function requestFrame() { if (!raf && !disposed && active && !document.hidden) raf = requestAnimationFrame(frame); }
  function resize() {
    if (disposed) return;
    const width = canvas.clientWidth || 1, height = canvas.clientHeight || 1;
    renderer.setSize(width,height,false);
    camera.aspect = width / height;
    // Keep the entire display inside narrow phones instead of cropping fruit.
    camera.fov = Math.max(34,THREE.MathUtils.radToDeg(2 * Math.atan(2.12 / (5.5 * camera.aspect))));
    camera.updateProjectionMatrix();
    requestFrame();
  }
  const visibility = () => { if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else requestFrame(); };
  const lost = (event: Event) => { event.preventDefault(); cancelAnimationFrame(raf); raf = 0; options.onError(); };
  canvas.addEventListener('webglcontextlost',lost);
  document.addEventListener('visibilitychange',visibility);
  show(selected);
  resize();
  // Capture each portrait once, in the same renderer. Yield between studies so
  // expensive procedural textures do not initialize in one long task.
  let portraitIndex = 0;
  function portrait() {
    if (disposed) return;
    if (document.hidden) { idleTimer = window.setTimeout(portrait,500); return; }
    const study = studies[portraitIndex++];
    if (!study) return;
    try {
      show(study.id);
      renderer.setSize(420,420,false);
      camera.aspect = 1;
      camera.fov = 38;
      camera.position.set(0,2.05,5.5);
      camera.lookAt(0,.64,0);
      camera.updateProjectionMatrix();
      renderer.render(scene,camera);
      options.onPortrait(study.id,canvas.toDataURL('image/webp',.88));
    } catch { /* Portraits can stay illustrative without breaking shopping. */ }
    show(selected);
    resize();
    if (portraitIndex < studies.length) idleTimer = window.setTimeout(portrait,300);
  }
  idleTimer = window.setTimeout(portrait,180);
  return {
    select(id) { if (disposed) return; selected = id; show(id); requestFrame(); },
    setPointer(x,y) { pointerX = x; pointerY = y; requestFrame(); },
    setProgress(value) { progress = Math.min(1,Math.max(0,value)); },
    setActive(value) { active = value; if (!value) { cancelAnimationFrame(raf); raf = 0; } else requestFrame(); },
    setMotionEnabled(enabled) { motion = enabled && !options.reduced; requestFrame(); },
    resize,
    dispose() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      canvas.removeEventListener('webglcontextlost',lost);
      document.removeEventListener('visibilitychange',visibility);
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.isMesh) { resources.add(mesh.geometry); (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => resources.add(material)); }
      });
      resources.forEach((resource) => resource.dispose());
      key.shadow.dispose();
      scene.environment = null;
      renderer.dispose();
    },
  };
}
