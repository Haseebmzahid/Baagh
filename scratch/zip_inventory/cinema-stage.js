import * as THREE from 'three';

/* ---------- procedural texture helpers ---------- */
const C = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const tex = (canvas, rep = 1) => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  t.anisotropy = 8; return t;
};
function hash(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function fbm(x, y, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * vnoise(x * f, y * f); f *= 2.07; a *= 0.5; }
  return v;
}

/* mango skin: green shoulder -> gold body -> blush cheek, lenticels, blotches */
function skinMaps() {
  const w = 1024, h = 1024, base = C(w, h), bump = C(w, h), rough = C(w, h);
  const bc = base.getContext('2d'), bpc = bump.getContext('2d'), rc = rough.getContext('2d');
  const img = bc.createImageData(w, h), bimg = bpc.createImageData(w, h), rimg = rc.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const v = y / h;                       // v: 0 stem shoulder -> 1 tip
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const n = fbm(u * 9, v * 9, 5);
      const fine = fbm(u * 130, v * 130, 3);
      // longitudinal colour ramp
      let r, g, b;
      const gold = Math.min(1, Math.max(0, (v - 0.06) / 0.5));
      r = 68 + gold * 108; g = 88 + gold * 18; b = 22 + gold * 2;
      // sun-facing blush band
      const blush = Math.max(0, 1 - Math.abs(u - 0.28) / 0.22) * Math.max(0, 1 - Math.abs(v - 0.42) / 0.42);
      r += blush * 112; g -= blush * 40; b -= blush * 2;
      // mottling + faint bloom
      const m = (n - 0.5) * 40;
      r += m; g += m * 0.85; b += m * 0.4;
      r += (fine - 0.5) * 14; g += (fine - 0.5) * 14; b += (fine - 0.5) * 10;
      // lenticels (tiny pale specks)
      const sp = hash(Math.floor(x * 0.9), Math.floor(y * 0.9));
      const isSpeck = sp > 0.9965;
      if (isSpeck) { r += 46; g += 40; b += 26; }
      // occasional natural blemish
      const bl = fbm(u * 5 + 11, v * 5 + 3, 3);
      const blem = bl > 0.74 ? (bl - 0.74) * 3.4 : 0;
      r -= blem * 70; g -= blem * 64; b -= blem * 34;

      const i = (y * w + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, r));
      img.data[i + 1] = Math.max(0, Math.min(255, g));
      img.data[i + 2] = Math.max(0, Math.min(255, b));
      img.data[i + 3] = 255;

      const bv = 128 + (fine - 0.5) * 150 + (n - 0.5) * 40 + (isSpeck ? 55 : 0) - blem * 60;
      bimg.data[i] = bimg.data[i + 1] = bimg.data[i + 2] = Math.max(0, Math.min(255, bv));
      bimg.data[i + 3] = 255;

      // waxy where blushed, drier at stem, rougher on blemishes
      const rv = 168 - blush * 46 + (fine - 0.5) * 30 + blem * 60 - gold * 10;
      rimg.data[i] = rimg.data[i + 1] = rimg.data[i + 2] = Math.max(0, Math.min(255, rv));
      rimg.data[i + 3] = 255;
    }
  }
  bc.putImageData(img, 0, 0); bpc.putImageData(bimg, 0, 0); rc.putImageData(rimg, 0, 0);
  return { map: tex(base), bump: tex(bump), rough: tex(rough) };
}

function woodTexture(tone = 0) {
  const w = 512, h = 512, c = C(w, h), ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const grain = Math.sin((x * 0.06) + fbm(x * 0.012, y * 0.05, 4) * 9) * 0.5 + 0.5;
    const knot = fbm(x * 0.008, y * 0.008, 3);
    let v = 0.62 + grain * 0.2 + (knot - 0.5) * 0.22;
    const i = (y * w + x) * 4;
    img.data[i] = 176 * v + tone * 8; img.data[i + 1] = 141 * v; img.data[i + 2] = 100 * v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return tex(c);
}

function fibreTexture(r, g, b, scale = 90) {
  const w = 256, h = 256, c = C(w, h), ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const n = fbm(x / 256 * scale, y / 256 * scale, 4);
    const i = (y * w + x) * 4; const v = 0.78 + n * 0.36;
    img.data[i] = r * v; img.data[i + 1] = g * v; img.data[i + 2] = b * v; img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return tex(c);
}

function skyEquirect() {
  const w = 1024, h = 512, c = C(w, h), ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#5d6f74'); g.addColorStop(0.42, '#c8b79a');
  g.addColorStop(0.55, '#f0dcbb'); g.addColorStop(0.62, '#c2ab8c'); g.addColorStop(1, '#3c3a33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  const sun = ctx.createRadialGradient(320, 250, 0, 320, 250, 260);
  sun.addColorStop(0, 'rgba(255,240,214,0.95)'); sun.addColorStop(1, 'rgba(255,240,214,0)');
  ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h);
  return new THREE.CanvasTexture(c);
}

/* ---------- mango ---------- */
function mangoGeometry(seed = 0) {
  const g = new THREE.SphereGeometry(0.5, 110, 90);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const t = (v.y + 0.5);                       // 0 tip -> 1 stem
    v.y *= 1.52;
    const taper = 0.94 - Math.pow(Math.abs(v.y / 0.76), 3.1) * 0.30;
    v.x *= taper * 1.02; v.z *= taper * 0.86;
    // asymmetric belly + beak
    v.x += Math.pow(Math.max(0, 0.72 - t), 2) * 0.10 - 0.02;
    v.z += Math.sin(t * Math.PI) * 0.018;
    // organic imperfection
    const n = fbm(v.x * 6 + seed * 3.3, v.y * 6 + seed, 4) - 0.5;
    const d = 1 + n * 0.055;
    v.multiplyScalar(d);
    // stem dimple
    const dip = Math.max(0, 1 - Math.hypot(v.x - 0.02, (v.y - 0.74) * 1.1, v.z) / 0.20);
    v.y -= dip * dip * 0.055;
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  g.scale(0.105, 0.105, 0.105);
  return g;
}

/* ---------- the stage ---------- */
class CinemaStage extends HTMLElement {
  connectedCallback() {
    if (this._up) return; this._up = true;
    Object.assign(this.style, { display: 'block', position: 'fixed', inset: '0', width: '100vw', height: '100vh' });
    this.build();
  }

  build() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.85));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, { display: 'block', width: '100%', height: '100%' });

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2('#7d6e55', 0.08);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.008, 260);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const skyTex = skyEquirect();
    skyTex.mapping = THREE.EquirectangularReflectionMapping;
    skyTex.colorSpace = THREE.SRGBColorSpace;
    const envRT = pmrem.fromEquirectangular(skyTex);
    scene.background = skyTex;
    scene.backgroundIntensity = 0.55;
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.34;

    /* lights */
    const key = new THREE.DirectionalLight('#ffd7a2', 2.9);
    key.position.set(-4.5, 5.5, 4.2); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 40;
    key.shadow.camera.left = -14; key.shadow.camera.right = 14;
    key.shadow.camera.top = 10; key.shadow.camera.bottom = -6;
    key.shadow.bias = -0.0006; key.shadow.normalBias = 0.012;
    scene.add(key);
    scene.add(new THREE.HemisphereLight('#9fb3bd', '#3a2f22', 0.22));
    const rim = new THREE.DirectionalLight('#bcd4dd', 0.5); rim.position.set(7, 4, -6); scene.add(rim);
    scene.add(key.target);
    const macro = new THREE.PointLight('#ffe0b4', 0.3, 1.2, 2); macro.position.set(-0.16, 1.02, 0.2); scene.add(macro);

    /* materials */
    const sk = skinMaps();
    const skinMat = new THREE.MeshPhysicalMaterial({
      map: sk.map, bumpMap: sk.bump, bumpScale: 0.05, roughnessMap: sk.rough,
      roughness: 0.72, clearcoat: 0.22, clearcoatRoughness: 0.55, sheen: 0.35,
      sheenColor: new THREE.Color('#e9d7a8'), sheenRoughness: 0.7
    });
    const woodMat = new THREE.MeshStandardMaterial({ map: woodTexture(), color: '#a8845c', roughness: 0.85, metalness: 0 });
    const woodDark = new THREE.MeshStandardMaterial({ map: woodTexture(1), color: '#7a5c3c', roughness: 0.9 });
    const paperMat = new THREE.MeshStandardMaterial({ map: fibreTexture(196, 184, 160, 60), roughness: 0.95, side: THREE.DoubleSide });
    const clothMat = new THREE.MeshStandardMaterial({ map: fibreTexture(96, 104, 88, 130), roughness: 1 });
    const soilMat = new THREE.MeshStandardMaterial({ map: fibreTexture(56, 47, 34, 40), roughness: 1 });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#22301d', roughness: 1, flatShading: true });
    const skinTone = new THREE.MeshStandardMaterial({ color: '#33241a', roughness: 0.95 });
    const plaster = new THREE.MeshStandardMaterial({ color: '#8e8269', roughness: 0.96 });
    const stone = new THREE.MeshStandardMaterial({ color: '#6f6759', roughness: 0.9 });

    const geoM = [mangoGeometry(0), mangoGeometry(1.7), mangoGeometry(3.4)];
    const mango = (s = 1, i = 0) => {
      const m = new THREE.Mesh(geoM[i % 3], skinMat);
      m.castShadow = true; m.receiveShadow = true; m.scale.setScalar(s);
      return m;
    };

    /* ground */
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 90, 1, 1), soilMat);
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    const table = (x, w = 2.4, d = 1.3, h = 0.76, mat = woodMat) => {
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.06, d), mat);
      top.position.y = h; top.castShadow = true; top.receiveShadow = true; g.add(top);
      [[-w / 2 + 0.1, -d / 2 + 0.1], [w / 2 - 0.1, -d / 2 + 0.1], [-w / 2 + 0.1, d / 2 - 0.1], [w / 2 - 0.1, d / 2 - 0.1]]
        .forEach(([lx, lz]) => {
          const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, h, 0.07), woodDark);
          l.position.set(lx, h / 2, lz); l.castShadow = true; g.add(l);
        });
      g.position.x = x; scene.add(g); return g;
    };

    const crate = (x, y, z, s = 1) => {
      const g = new THREE.Group();
      const W = 0.62 * s, D = 0.42 * s, H = 0.19 * s, t = 0.014 * s;
      const base = new THREE.Mesh(new THREE.BoxGeometry(W, t, D), woodMat);
      base.receiveShadow = true; base.castShadow = true; g.add(base);
      for (let i = 0; i < 2; i++) {
        const sl = new THREE.Mesh(new THREE.BoxGeometry(W, H, t), woodDark);
        sl.position.set(0, H / 2, (i ? 1 : -1) * (D / 2)); sl.castShadow = true; sl.receiveShadow = true; g.add(sl);
        const se = new THREE.Mesh(new THREE.BoxGeometry(t, H, D), woodDark);
        se.position.set((i ? 1 : -1) * (W / 2), H / 2, 0); se.castShadow = true; se.receiveShadow = true; g.add(se);
      }
      const liner = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.94, D * 0.9, 12, 8), paperMat);
      const lp = liner.geometry.attributes.position;
      for (let i = 0; i < lp.count; i++) lp.setZ(i, (fbm(lp.getX(i) * 14, lp.getY(i) * 14, 3) - 0.5) * 0.02);
      liner.geometry.computeVertexNormals();
      liner.rotation.x = -Math.PI / 2; liner.position.y = 0.012 * s; liner.receiveShadow = true; g.add(liner);
      g.position.set(x, y, z); scene.add(g); return g;
    };

    /* ---- station 0/1/2: the crate on the sorting table, hero mango ---- */
    table(0, 2.6, 1.4);
    const heroCrate = crate(0, 0.79, 0);
    const hero = mango(1.0); hero.position.set(0, 0.885, 0); hero.rotation.set(0.1, 0.6, 0.28); scene.add(hero);
    [[-0.19, 0.86, 0.06, 0.94, 1], [0.2, 0.86, -0.05, 0.9, 2], [0.06, 0.86, 0.13, 0.86, 0], [-0.09, 0.86, -0.12, 0.92, 2]]
      .forEach(([x, y, z, s, i]) => { const m = mango(s, i); m.position.set(x, y, z); m.rotation.set(0.4, x * 6, 0.9 + z); scene.add(m); });
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), clothMat);
    cloth.rotation.x = -Math.PI / 2; cloth.position.set(0.95, 0.795, 0.12); scene.add(cloth);

    /* ---- orchard behind station 0 ---- */
    const tree = (x, z, s) => {
      const g = new THREE.Group();
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.09 * s, 0.15 * s, 1.5 * s, 9), woodDark);
      tr.position.y = 0.75 * s; tr.castShadow = true; g.add(tr);
      for (let i = 0; i < 9; i++) {
        const r0 = 0.42 * s * (0.55 + hash(x + i, z) * 0.7);
        const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r0, 1), leafMat);
        c.position.set((hash(x, z + i) - 0.5) * 1.5 * s, (1.25 + hash(i, x) * 1.1) * s, (hash(z, x + i) - 0.5) * 1.5 * s);
        c.castShadow = true; g.add(c);
      }
      g.position.set(x, 0, z); scene.add(g);
    };
    for (let r = 0; r < 8; r++) for (let i = 0; i < 11; i++)
      tree(-14 + i * 2.7 + r * 0.7 + hash(i, r) * 0.5, -4.5 - r * 3.4 - hash(r, i) * 0.8, 0.8 + hash(i, r) * 0.5);

    /* ---- station 4 (x=8): the expert hands ---- */
    table(8, 2.2, 1.2, 0.78, woodDark);
    const handGroup = new THREE.Group();
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24), skinTone);
    palm.scale.set(1.15, 0.5, 1.0); palm.castShadow = true; handGroup.add(palm);
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.10, 4, 12), skinTone);
      f.position.set(0.10 - i * 0.032, 0.03, 0.10);
      f.rotation.set(-1.05 + i * 0.06, 0, 0.1 - i * 0.06); f.castShadow = true; handGroup.add(f);
    }
    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.021, 0.07, 4, 12), skinTone);
    thumb.position.set(0.13, 0.02, -0.02); thumb.rotation.set(-0.4, 0, -1.15); thumb.castShadow = true; handGroup.add(thumb);
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.3, 18), clothMat);
    sleeve.position.set(-0.20, -0.01, -0.02); sleeve.rotation.z = Math.PI / 2; sleeve.castShadow = true; handGroup.add(sleeve);
    const backlight = new THREE.SpotLight('#ffe6bd', 26, 6, 0.7, 0.85, 1.7);
    backlight.position.set(8.7, 2.1, -1.6); backlight.target.position.set(8.0, 0.9, 0.1);
    scene.add(backlight); scene.add(backlight.target);
    handGroup.position.set(7.9, 0.86, 0.02); handGroup.rotation.y = -0.35; handGroup.scale.setScalar(0.88); scene.add(handGroup);
    const examined = mango(1.02); examined.position.set(7.96, 0.95, 0.06); examined.rotation.set(0.3, 0.9, 0.5); scene.add(examined);
    const hand2 = handGroup.clone(); hand2.position.set(8.42, 0.85, -0.16); hand2.rotation.set(0.1, 2.35, 0.05); hand2.scale.setScalar(0.88); scene.add(hand2);

    /* ---- station 5 (x=16): grading — accepted / rejected ---- */
    table(16, 3.0, 1.4, 0.76);
    const rejected = crate(16.66, 0.8, 0.2, 0.62); rejected.rotation.y = -0.28;
    const acceptTray = crate(15.42, 0.8, -0.06, 0.68); acceptTray.rotation.y = 0.16;
    const graded = [];
    for (let i = 0; i < 9; i++) {
      const ok = i % 3 !== 2;
      const m = mango(0.94 + hash(i, 3) * 0.12, i);
      m.position.set(15.82 + (i % 5) * 0.19, 0.845, -0.14 + Math.floor(i / 5) * 0.26);
      m.rotation.set(hash(i, 1) * 1.2, hash(i, 2) * 6, 0.8 + hash(i, 4));
      scene.add(m); graded.push({ m, ok, home: m.position.clone(), i });
    }
    const loupe = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.008, 10, 30), new THREE.MeshStandardMaterial({ color: '#5d5a52', roughness: 0.4, metalness: 0.8 }));
    loupe.position.set(16.3, 0.8, -0.32); loupe.rotation.x = -Math.PI / 2; scene.add(loupe);

    /* ---- station 6 (x=24): packing ---- */
    table(24, 2.8, 1.3, 0.76, woodDark);
    const packCrate = crate(24, 0.79, 0, 1.05);
    for (let i = 0; i < 6; i++) {
      const m = mango(0.95, i);
      m.position.set(23.76 + (i % 3) * 0.24, 0.885, -0.09 + Math.floor(i / 3) * 0.2);
      m.rotation.set(0.2, i * 1.1, 0.9); scene.add(m);
      const wrap = new THREE.Mesh(new THREE.CircleGeometry(0.10, 20), paperMat);
      wrap.position.copy(m.position); wrap.position.y = 0.80; wrap.rotation.x = -Math.PI / 2; scene.add(wrap);
    }
    const scale = new THREE.Group();
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.012, 36), new THREE.MeshStandardMaterial({ color: '#7d786c', roughness: 0.45, metalness: 0.7 }));
    plate.position.y = 0.1; scale.add(plate);
    scale.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.24), new THREE.MeshStandardMaterial({ color: '#4a463f', roughness: 0.6 })));
    scale.position.set(24.95, 0.81, 0.18); scene.add(scale);
    const paperStack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.3), paperMat);
    paperStack.position.set(23.1, 0.81, 0.2); scene.add(paperStack);

    /* ---- station 7 (x=32): the city at dawn ---- */
    const cityG = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const w = 0.9 + hash(i, 9) * 1.7, h = 1.6 + hash(i, 4) * 5.4, d = 0.9 + hash(i, 7) * 1.6;
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), i % 3 ? plaster : stone);
      b.position.set(29 + hash(i, 2) * 9, h / 2, -3 - hash(i, 5) * 16);
      b.castShadow = true; b.receiveShadow = true; cityG.add(b);
    }
    const road = new THREE.Mesh(new THREE.PlaneGeometry(26, 3.2), new THREE.MeshStandardMaterial({ color: '#6b6459', roughness: 0.95 }));
    road.rotation.x = -Math.PI / 2; road.position.set(34, 0.005, 1.2); cityG.add(road);
    scene.add(cityG);
    const travelCrate = crate(30.5, 0.62, 1.2, 1.1);
    const van = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.15, 1.35), new THREE.MeshStandardMaterial({ color: '#2f3a31', roughness: 0.5, metalness: 0.1 }));
    body.position.y = 0.78; body.castShadow = true; van.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 1.3), new THREE.MeshStandardMaterial({ color: '#33402f', roughness: 0.4, metalness: 0.2 }));
    cab.position.set(1.5, 0.72, 0); cab.castShadow = true; van.add(cab);
    for (let i = 0; i < 4; i++) {
      const wl = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 20), new THREE.MeshStandardMaterial({ color: '#22201d', roughness: 0.85 }));
      wl.rotation.x = Math.PI / 2; wl.position.set(i < 2 ? 1.2 : -0.9, 0.24, i % 2 ? 0.62 : -0.62); van.add(wl);
    }
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 1.16), new THREE.MeshStandardMaterial({ color: '#2b3138', roughness: 0.18, metalness: 0.6 }));
    glass.position.set(1.96, 0.86, 0); van.add(glass);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 1.3), new THREE.MeshStandardMaterial({ color: '#26251f', roughness: 0.7 }));
    bumper.position.set(2.0, 0.34, 0); van.add(bumper);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.62, 0.05, 1.37), new THREE.MeshStandardMaterial({ color: '#20261f', roughness: 0.6 }));
    stripe.position.set(0, 0.52, 0); van.add(stripe);
    van.position.set(33.9, 0, 0.5); van.rotation.y = -0.5; scene.add(van);
    travelCrate.position.set(32.6, 0.72, 1.5); travelCrate.rotation.y = -0.5;

    /* ---- station 8/9 (x=40): the home ---- */
    const homeG = new THREE.Group();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshStandardMaterial({ map: woodTexture(), color: '#7d6042', roughness: 0.5 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(40, 0.012, -1); floor.receiveShadow = true; homeG.add(floor);
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(9, 3.4, 0.12), plaster);
    backWall.position.set(40, 1.7, -4.4); backWall.receiveShadow = true; homeG.add(backWall);
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 7), plaster);
    sideWall.position.set(44.3, 1.7, -1); sideWall.receiveShadow = true; homeG.add(sideWall);
    const leftWallA = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 2.0), plaster);
    leftWallA.position.set(36.4, 1.7, -3.4); leftWallA.receiveShadow = true; homeG.add(leftWallA);
    const leftWallB = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 2.3), plaster);
    leftWallB.position.set(36.4, 1.7, 0.35); leftWallB.receiveShadow = true; homeG.add(leftWallB);
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(9, 7), new THREE.MeshStandardMaterial({ color: '#8b8069', roughness: 1 }));
    ceiling.rotation.x = Math.PI / 2; ceiling.position.set(40, 3.36, -1); homeG.add(ceiling);
    const frontWall = new THREE.Mesh(new THREE.BoxGeometry(9, 3.4, 0.12), plaster);
    frontWall.position.set(40, 1.7, 2.4); homeG.add(frontWall);
    const window_ = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.9), new THREE.MeshBasicMaterial({ color: '#e8d8b6' }));
    window_.position.set(38.6, 1.75, -4.32); homeG.add(window_);
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), new THREE.MeshStandardMaterial({ map: fibreTexture(120, 108, 88, 150), roughness: 1 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(40, 0.02, -0.5); rug.receiveShadow = true; homeG.add(rug);
    const doorway = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.5, 1.3), plaster);
    doorway.position.set(37.3, 1.25, -3.0); homeG.add(doorway);
    const warmFill = new THREE.PointLight('#ffd9a4', 2.2, 7, 2); warmFill.position.set(41.4, 1.9, -1.2); homeG.add(warmFill);
    const pendantCord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1.1, 6), new THREE.MeshStandardMaterial({ color: '#3a342b' }));
    pendantCord.position.set(40, 2.4, -0.4); homeG.add(pendantCord);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.24, 28, 1, true), new THREE.MeshStandardMaterial({ color: '#d9cdb4', roughness: 0.7, side: THREE.DoubleSide }));
    shade.position.set(40, 1.78, -0.4); homeG.add(shade);
    const bulb = new THREE.PointLight('#ffdfae', 1.6, 4.2, 2); bulb.position.set(40, 1.66, -0.4); homeG.add(bulb);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.9, 0.75), new THREE.MeshStandardMaterial({ color: '#8f8571', roughness: 0.7 }));
    counter.position.set(40.6, 0.45, -3.6); counter.castShadow = true; counter.receiveShadow = true; homeG.add(counter);
    scene.add(homeG);
    const dining = table(40, 2.0, 1.1, 0.75, woodDark); dining.position.z = -0.4;
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.24, 40, 24, 0, Math.PI * 2, Math.PI * 0.52, Math.PI * 0.48), new THREE.MeshStandardMaterial({ color: '#cbbfa6', roughness: 0.6, side: THREE.DoubleSide }));
    bowl.position.set(40, 0.86, -0.4); bowl.castShadow = true; bowl.receiveShadow = true; scene.add(bowl);
    for (let i = 0; i < 5; i++) {
      const m = mango(0.92, i);
      const a = i / 5 * Math.PI * 2;
      m.position.set(40 + Math.cos(a) * 0.1, 0.845 + (i === 4 ? 0.055 : 0), -0.4 + Math.sin(a) * 0.085);
      m.rotation.set(1.45, a, 0.3); scene.add(m);
    }
    const arrivedCrate = crate(40.45, 0.815, -0.62, 0.7); arrivedCrate.rotation.y = 0.22; arrivedCrate.visible = false;
    const doorLight = new THREE.SpotLight('#ffe8c4', 22, 9, 0.6, 0.7, 1.6);
    doorLight.position.set(37.6, 3.0, -3.0); doorLight.target.position.set(40, 0.8, -0.6);
    scene.add(doorLight); scene.add(doorLight.target);

    /* ---------- props: density, layering, foreground occluders ---------- */
    const basket = (x, z, s = 1) => {
      const g = new THREE.Group();
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.26 * s, 0.19 * s, 0.2 * s, 22, 1, true), new THREE.MeshStandardMaterial({ map: fibreTexture(126, 100, 66, 120), roughness: 1, side: THREE.DoubleSide }));
      b.position.y = 0.1 * s; b.castShadow = true; g.add(b);
      const bot = new THREE.Mesh(new THREE.CircleGeometry(0.19 * s, 22), new THREE.MeshStandardMaterial({ color: '#6d5636', roughness: 1 }));
      bot.rotation.x = -Math.PI / 2; bot.position.y = 0.002; g.add(bot);
      g.position.set(x, 0, z); scene.add(g); return g;
    };
    const sack = (x, z, s = 1) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 20, 14), new THREE.MeshStandardMaterial({ map: fibreTexture(122, 108, 80, 140), roughness: 1 }));
      m.scale.set(1, 1.25, 0.85); m.position.set(x, 0.3 * s, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
    };
    const crateStack = (x, z, n = 3, ry = 0) => {
      for (let i = 0; i < n; i++) { const c = crate(x + (hash(i, x) - 0.5) * 0.05, 0.02 + i * 0.2, z, 1); c.rotation.y = ry + (hash(i, z) - 0.5) * 0.2; }
    };
    // near-camera occluders (dark, out of focus by proximity)
    const beam = (x, y, z, len, ry = 0) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(len, 0.12, 0.12), woodDark);
      b.position.set(x, y, z); b.rotation.y = ry; b.castShadow = true; scene.add(b); return b;
    };
    crateStack(-1.35, 0.9, 3, 0.3); basket(1.5, 1.0, 1.1); sack(-2.1, 1.6, 1.0);
    beam(0.2, 2.15, 1.7, 6, 0.06);
    crateStack(7.0, 0.7, 2, -0.2); sack(9.1, 0.9, 0.9); basket(8.9, -0.4, 0.9);
    crateStack(15.0, 0.95, 3, 0.15); basket(17.1, 0.85, 1.0); sack(14.6, 1.4, 0.95);
    beam(16.1, 1.72, 1.7, 5.4, -0.05);
    crateStack(22.9, 0.8, 4, 0.1); crateStack(25.3, 0.75, 2, -0.35); sack(24.9, 1.5, 1.0);
    for (let i = 0; i < 5; i++) tree(20 + i * 3.4, -7 - hash(i, 2) * 3, 0.9);
    // city: dark near-frame silhouettes
    [[26.4, 2.3, -5.2, 6.4], [38.2, 2.6, -6.4, 7.2]].forEach(([bx, bw, bz, bh]) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 2.6), new THREE.MeshStandardMaterial({ color: '#4a4438', roughness: 0.95 }));
      b.position.set(bx, bh / 2, bz); b.castShadow = true; scene.add(b);
    });
    for (let i = 0; i < 4; i++) tree(29.6 + i * 2.6, -3.4 - hash(i, 5) * 1.2, 0.7);
    // home: seating + window mullion
    const chair = (x, z, ry) => {
      const g = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.05, 0.42), woodDark);
      seat.position.y = 0.45; seat.castShadow = true; g.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.5, 0.05), woodDark);
      back.position.set(0, 0.7, -0.19); back.castShadow = true; g.add(back);
      [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(([lx, lz]) => {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.45, 0.04), woodDark);
        l.position.set(lx, 0.225, lz); g.add(l);
      });
      g.position.set(x, 0.02, z); g.rotation.y = ry; scene.add(g);
    };
    chair(40.0, 0.42, Math.PI); chair(40.0, -1.22, 0);
    const mull = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.95, 0.05), new THREE.MeshStandardMaterial({ color: '#6a6252', roughness: 0.8 }));
    mull.position.set(38.6, 1.75, -4.28); scene.add(mull);

    /* ---------- camera choreography ---------- */
    const K = [
      { p: [0.02, 0.905, 0.155], t: [0, 0.888, 0], fov: 30 },   // 1 macro
      { p: [0.28, 1.36, 0.66], t: [0.02, 0.885, -0.02], fov: 40 }, // 2 crate
      { p: [0.05, 1.5, 2.55], t: [0.0, 0.98, -2.6], fov: 45 },   // 3 source / orchard
      { p: [7.74, 1.06, 0.5], t: [8.02, 0.95, 0.05], fov: 26 }, // 4 hands
      { p: [15.86, 1.5, 1.14], t: [16.12, 0.85, -0.04], fov: 30 }, // 5 grading
      { p: [23.66, 1.5, 1.22], t: [24.16, 0.86, -0.02], fov: 37 }, // 6 packing
      { p: [30.6, 4.3, 8.8], t: [34.6, 1.0, -0.6], fov: 44 },    // 7 delivery
      { p: [38.25, 1.66, 1.85], t: [40.05, 1.0, -1.5], fov: 36 }, // 8 arrival
      { p: [40.02, 1.06, 0.44], t: [40.0, 0.885, -0.42], fov: 30 } // 9 hero message
    ].map(k => ({ p: new THREE.Vector3(...k.p), t: new THREE.Vector3(...k.t), fov: k.fov }));

    const smooth = x => x * x * (3 - 2 * x);
    const curPos = K[0].p.clone(), curTgt = K[0].t.clone();
    let curFov = K[0].fov, target = 0, cur = 0;

    const cues = [...document.querySelectorAll('[data-in]')].map(el => ({
      el, a: parseFloat(el.dataset.in), b: parseFloat(el.dataset.out)
    }));
    const chapters = [...document.querySelectorAll('[data-chapter]')];
    const bar = document.querySelector('[data-progress]');

    const scrollP = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    };

    const resize = () => {
      const w = innerWidth, h = innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize(); addEventListener('resize', resize);
    addEventListener('scroll', () => { target = scrollP(); }, { passive: true });
    target = cur = scrollP();

    const tmpP = new THREE.Vector3(), tmpT = new THREE.Vector3();
    let clock = new THREE.Clock();

    window.__cine = { f: 0, err: null, step: null };
    let raf = 0, snap = false;
    const tick = (sched = true) => {
     try {
      window.__cine.f++;
      const dt = Math.min(clock.getDelta(), 0.05);
      cur += (target - cur) * Math.min(1, dt * 3.4);      // weighted camera inertia
      const s = cur * (K.length - 1);
      const i = Math.min(K.length - 2, Math.floor(s));
      const f = smooth(Math.min(1, Math.max(0, s - i)));
      tmpP.lerpVectors(K[i].p, K[i + 1].p, f);
      tmpT.lerpVectors(K[i].t, K[i + 1].t, f);
      const fov = K[i].fov + (K[i + 1].fov - K[i].fov) * f;
      const kL = snap ? 1 : Math.min(1, dt * 6);
      curPos.lerp(tmpP, kL); curTgt.lerp(tmpT, kL);
      curFov += (fov - curFov) * (snap ? 1 : Math.min(1, dt * 5));
      const br = Math.sin(performance.now() * 0.00042) * 0.0035 * (1 - cur * 0.5);
      camera.position.copy(curPos); camera.position.y += br;
      camera.lookAt(curTgt);
      camera.rotation.z += Math.sin(performance.now() * 0.00031) * 0.0022;
      if (Math.abs(camera.fov - curFov) > 0.01) { camera.fov = curFov; camera.updateProjectionMatrix(); }

      // fruit breathes / turns slowly while we are close on it
      hero.rotation.y += dt * 0.045 * (1 - Math.min(1, cur * 4));
      examined.rotation.y += dt * 0.25 * Math.max(0, 1 - Math.abs(cur - 0.40) * 7);

      // grading beat: rejected fruit is set aside, accepted lifted forward
      const gp = Math.max(0, Math.min(1, (cur - 0.47) * 8));
      graded.forEach(({ m, ok, home, i }) => {
        const e = smooth(Math.max(0, Math.min(1, gp * 1.4 - i * 0.05)));
        m.position.y = home.y + (ok ? e * 0.03 : -e * 0.006);
        m.position.z = home.z + (ok ? -e * 0.13 : e * 0.30);
        m.position.x = home.x + (ok ? -e * 0.22 : e * 0.5);
        m.rotation.x += ok ? 0 : dt * 0.5 * e;
      });

      // atmosphere: the world opens up as we travel
      scene.fog.density = 0.08 + (1 - Math.min(1, cur * 3)) * 0.03 - Math.max(0, cur - 0.8) * 0.09;
      renderer.toneMappingExposure = 0.6 + Math.min(1, cur * 7) * 0.32 - Math.max(0, cur - 0.82) * 0.1;
      arrivedCrate.visible = cur > 0.78 && cur < 0.94;
      macro.intensity = 0.3 * Math.max(0, 1 - cur * 6);

      // typographic cues
      for (const c of cues) {
        const f1 = c.a <= 0.006 ? 1 : Math.min(1, Math.max(0, (cur - c.a) / 0.028));
        const f2 = c.b >= 1 ? 1 : Math.min(1, Math.max(0, (c.b - cur) / 0.028));
        const o = Math.min(f1, f2);
        c.el.style.opacity = o;
        c.el.style.transform = `translateY(${(1 - o) * 14}px)`;
        c.el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      }
      const act = Math.round(cur * (K.length - 1));
      chapters.forEach((el, n) => { el.style.opacity = n === act ? 1 : 0.28; });
      if (bar) bar.style.transform = `scaleY(${cur})`;

      key.position.x = camera.position.x - 4.5; key.target.position.set(camera.position.x, 0.6, 0);
      key.target.updateMatrixWorld();
      renderer.render(scene, camera);
     } catch (e) { window.__cine.err = String(e && e.stack || e); console.error(e); }
      if (sched) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    };
    window.__cine.step = (n = 1) => { for (let i = 0; i < n; i++) tick(false); };
    window.__cine.jump = (p) => { target = cur = p; snap = true; tick(false); snap = false; };
    tick();
  }
}
if (!customElements.get('cinema-stage')) customElements.define('cinema-stage', CinemaStage);
