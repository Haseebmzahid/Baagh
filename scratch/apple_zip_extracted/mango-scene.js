// Chaunsa 3D scene engine. Procedural geometry + procedurally painted maps
// (no external assets). Driven by a single scroll progress value 0..1.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
// eased 0..1 ramp between two progress marks
const ramp = (p, a, b) => smooth(clamp((p - a) / (b - a), 0, 1));

/* ---------------------------------------------------------------- geometry */
// Chaunsa silhouette: obliquely oval, laterally compressed, gently kidneyed,
// broad shoulder at the stem, rounded nose with a faint beak.
function mangoSurface(u, v, out) {
  const th = u * Math.PI * 2;
  const t = Math.pow(v, 0.94);
  let R = Math.pow(Math.max(Math.sin(Math.PI * t), 0.0001), 0.46);
  R *= 0.95 + 0.06 * (1 - v) + 0.05 * v;
  // stem shoulder is fuller, nose stays round
  R *= 1 - 0.05 * Math.pow(v, 3.0);
  let c = Math.cos(th), s = Math.sin(th);
  // dorsal side (c<0) is flatter than the belly
  const flat = c < 0 ? 1 - 0.13 * (-c) : 1;
  let x = R * c * flat;
  let z = R * s * 0.79;
  let y = 1 - 2 * v;
  // kidney bend of the long axis
  x += 0.135 * Math.sin(Math.PI * Math.pow(v, 0.94)) - 0.015;
  // faint beak near the nose, belly side
  const beak = Math.pow(clamp((v - 0.86) / 0.14, 0, 1), 2) * 0.035;
  x += beak * Math.max(0, c);
  y -= beak * 0.35;
  // stem sinus: shallow dimple at the top pole
  const sin = Math.pow(clamp((0.08 - v) / 0.08, 0, 1), 1.9);
  y -= sin * 0.035;
  out.set(x * 0.78, y * 1.04, z * 0.78);
  return out;
}

function grid(segU, segV) {
  const pos = [], uv = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= segV; j++) {
    for (let i = 0; i <= segU; i++) {
      mangoSurface(i / segU, j / segV, p);
      pos.push(p.x, p.y, p.z);
      uv.push(i / segU, 1 - j / segV);
    }
  }
  return { pos, uv, segU, segV };
}

function buildFromGrid(g, transform) {
  const { segU, segV } = g;
  const P = [], U = [];
  const push = (idx) => {
    const a = idx * 3;
    let x = g.pos[a], y = g.pos[a + 1], z = g.pos[a + 2];
    if (transform) { const r = transform(x, y, z); x = r[0]; y = r[1]; z = r[2]; }
    P.push(x, y, z); U.push(g.uv[idx * 2], g.uv[idx * 2 + 1]);
  };
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
      push(a); push(c); push(b); push(b); push(c); push(d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  geo.computeVertexNormals();
  return geo;
}

function wholeMangoGeometry(segU, segV) {
  return buildFromGrid(grid(segU, segV));
}

// A cut piece: everything on the wrong side of z = cutZ is projected onto the
// plane, so the mesh stays closed and gains a flat flesh face.
function cutPieceGeometry(cutZ, keepSign, segU, segV) {
  const g = grid(segU, segV);
  const { pos } = g;
  const inside = i => (pos[i * 3 + 2] - cutZ) * keepSign > 0;
  const shell = { P: [], U: [] }, cap = { P: [], U: [] };
  const put = (bucket, idx, planar) => {
    const a = idx * 3;
    let x = pos[a], y = pos[a + 1], z = pos[a + 2];
    if (planar && (z - cutZ) * keepSign < 0) z = cutZ;
    bucket.P.push(x, y, z);
    if (planar) bucket.U.push(x * 0.62 + 0.5, y * 0.42 + 0.5);
    else bucket.U.push(g.uv[idx * 2], g.uv[idx * 2 + 1]);
  };
  const tri = (i0, i1, i2) => {
    const n = (inside(i0) ? 1 : 0) + (inside(i1) ? 1 : 0) + (inside(i2) ? 1 : 0);
    const isCap = n === 0;
    const b = isCap ? cap : shell;
    put(b, i0, isCap); put(b, i1, isCap); put(b, i2, isCap);
  };
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
      tri(a, c, b); tri(b, c, d);
    }
  }
  const mk = (b, flat) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(b.P, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.U, 2));
    if (flat) {
      const n = [];
      for (let i = 0; i < b.P.length / 3; i++) n.push(0, 0, keepSign > 0 ? -1 : 1);
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
    } else geo.computeVertexNormals();
    return geo;
  };
  return { shell: mk(shell, false), cap: mk(cap, true) };
}

function seedGeometry(segU, segV) {
  const g = grid(segU, segV);
  return buildFromGrid(g, (x, y, z) => [x * 0.46, y * 0.54, z * 0.30]);
}

/* ---------------------------------------------------------------- textures */
function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, x: c.getContext('2d') };
}
function tex(canvas, srgb = true, rep = false) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  return t;
}
const rnd = (a, b) => a + Math.random() * (b - a);

// ripeness 0 = greener/firm, 1 = deep golden honey stage
function skinMaps(W, H, ripeness) {
  const base = cv(W, H), bump = cv(W, H), rough = cv(W, H);
  const b = base.x;
  // ground colour, pale gold to golden-orange down the length
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(220, 232, ripeness) | 0},${lerp(190, 166, ripeness) | 0},${lerp(80, 52, ripeness) | 0})`);
  g.addColorStop(0.42, `rgb(${lerp(238, 246, ripeness) | 0},${lerp(190, 172, ripeness) | 0},${lerp(66, 48, ripeness) | 0})`);
  g.addColorStop(1, `rgb(${lerp(232, 242, ripeness) | 0},${lerp(174, 148, ripeness) | 0},${lerp(60, 40, ripeness) | 0})`);
  b.fillStyle = g; b.fillRect(0, 0, W, H);
  // green shoulder retained near the stem on less ripe fruit
  const sg = b.createLinearGradient(0, 0, 0, H * 0.36);
  sg.addColorStop(0, `rgba(168,178,72,${0.34 * (1 - ripeness) + 0.04})`);
  sg.addColorStop(1, 'rgba(168,178,72,0)');
  b.fillStyle = sg; b.fillRect(0, 0, W, H * 0.36);
  // sun-side blush
  b.save();
  const bl = b.createLinearGradient(W * 0.06, 0, W * 0.46, 0);
  bl.addColorStop(0, 'rgba(206,96,44,0)');
  bl.addColorStop(0.5, `rgba(205,88,36,${0.24 + 0.18 * ripeness})`);
  bl.addColorStop(1, 'rgba(206,96,44,0)');
  b.fillStyle = bl; b.fillRect(0, 0, W, H);
  b.restore();
  // large soft mottling
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.3);
    const rg = b.createRadialGradient(x, y, 0, x, y, r);
    const warm = Math.random() > 0.45;
    rg.addColorStop(0, warm ? 'rgba(252,220,138,0.20)' : 'rgba(196,166,66,0.14)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = rg; b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
  }
  const bm = bump.x;
  bm.fillStyle = '#7b7b7b'; bm.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.04, H * 0.22);
    const rg = bm.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, Math.random() > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    bm.fillStyle = rg; bm.beginPath(); bm.arc(x, y, r, 0, 7); bm.fill();
  }
  const rx = rough.x;
  rx.fillStyle = '#4a4a4a'; rx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.06, H * 0.3);
    const rg = rx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, Math.random() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    rx.fillStyle = rg; rx.beginPath(); rx.arc(x, y, r, 0, 7); rx.fill();
  }
  // lenticels: the pale speckling that reads as real mango skin
  const dots = Math.round(W * H / 300);
  for (let i = 0; i < dots; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(0.7, 2.4);
    const dark = Math.random() < 0.30;
    b.fillStyle = dark ? `rgba(124,86,36,${rnd(0.16, 0.42)})` : `rgba(255,246,214,${rnd(0.24, 0.62)})`;
    b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
    bm.fillStyle = dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.60)';
    bm.beginPath(); bm.arc(x, y, r * 0.9, 0, 7); bm.fill();
    rx.fillStyle = 'rgba(255,255,255,0.20)';
    rx.beginPath(); rx.arc(x, y, r, 0, 7); rx.fill();
  }
  // a few honest imperfections
  for (let i = 0; i < 7; i++) {
    const x = rnd(0, W), y = rnd(H * 0.15, H * 0.9), r = rnd(6, 26);
    const rg = b.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(104,66,30,${rnd(0.10, 0.26)})`);
    rg.addColorStop(1, 'rgba(104,66,30,0)');
    b.fillStyle = rg; b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
    bm.fillStyle = 'rgba(0,0,0,0.10)'; bm.beginPath(); bm.arc(x, y, r * 0.7, 0, 7); bm.fill();
  }
  return { map: tex(base.c, true, true), bumpMap: tex(bump.c, false, true), roughnessMap: tex(rough.c, false, true) };
}

function fleshMaps(S) {
  const base = cv(S, S), bump = cv(S, S);
  const b = base.x, bm = bump.x;
  const rg = b.createRadialGradient(S * 0.5, S * 0.5, S * 0.04, S * 0.5, S * 0.5, S * 0.56);
  rg.addColorStop(0, '#f6cf6c');
  rg.addColorStop(0.55, '#f2be4c');
  rg.addColorStop(0.86, '#e9ad38');
  rg.addColorStop(1, '#d99a2c');
  b.fillStyle = rg; b.fillRect(0, 0, S, S);
  // very faint radial fibre — Chaunsa reads as near fibre-free
  b.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const a = rnd(0, 7), r0 = rnd(S * 0.06, S * 0.2), r1 = r0 + rnd(S * 0.06, S * 0.3);
    b.strokeStyle = `rgba(255,236,176,${rnd(0.05, 0.16)})`;
    b.beginPath();
    b.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0);
    b.quadraticCurveTo(S / 2 + Math.cos(a + 0.1) * (r0 + r1) / 2, S / 2 + Math.sin(a + 0.1) * (r0 + r1) / 2,
      S / 2 + Math.cos(a + 0.03) * r1, S / 2 + Math.sin(a + 0.03) * r1);
    b.stroke();
  }
  // juice glisten
  for (let i = 0; i < 500; i++) {
    const x = rnd(0, S), y = rnd(0, S);
    b.fillStyle = `rgba(255,250,224,${rnd(0.04, 0.16)})`;
    b.beginPath(); b.arc(x, y, rnd(0.5, 1.6), 0, 7); b.fill();
  }
  // thin skin edge is carried by the geometry rim, not the texture
  bm.fillStyle = '#808080'; bm.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const x = rnd(0, S), y = rnd(0, S);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
    bm.beginPath(); bm.arc(x, y, rnd(1, 4), 0, 7); bm.fill();
  }
  return { map: tex(base.c), bumpMap: tex(bump.c, false) };
}

function seedMaps(W, H) {
  const base = cv(W, H), bump = cv(W, H);
  const b = base.x, bm = bump.x;
  b.fillStyle = '#d9c795'; b.fillRect(0, 0, W, H);
  bm.fillStyle = '#7a7a7a'; bm.fillRect(0, 0, W, H);
  for (let i = 0; i < 1600; i++) {
    const x = rnd(0, W), y = rnd(0, H), len = rnd(H * 0.04, H * 0.26), a = rnd(-0.5, 0.5) + Math.PI / 2;
    const c1 = `rgba(${rnd(150, 210) | 0},${rnd(126, 178) | 0},${rnd(78, 116) | 0},${rnd(0.10, 0.38)})`;
    b.strokeStyle = c1; b.lineWidth = rnd(0.6, 2.0);
    b.beginPath(); b.moveTo(x, y);
    b.quadraticCurveTo(x + rnd(-8, 8), y + len / 2, x + Math.cos(a) * 4, y + len);
    b.stroke();
    bm.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)';
    bm.lineWidth = rnd(0.6, 2);
    bm.beginPath(); bm.moveTo(x, y); bm.lineTo(x + Math.cos(a) * 3, y + len); bm.stroke();
  }
  for (let i = 0; i < 40; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(10, 60);
    const rg = b.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(140,112,60,0.14)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = rg; b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
  }
  return { map: tex(base.c, true, true), bumpMap: tex(bump.c, false, true) };
}

function envTexture() {
  const { c, x } = cv(1024, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#6d6252'); g.addColorStop(0.42, '#2b2521');
  g.addColorStop(0.62, '#14100d'); g.addColorStop(1, '#0b0908');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  // soft broad key window, warm — kept large so the sheen reads as studio silk
  const key = x.createRadialGradient(300, 96, 20, 300, 96, 520);
  key.addColorStop(0, 'rgba(255,242,220,1)');
  key.addColorStop(0.45, 'rgba(255,236,206,0.45)');
  key.addColorStop(1, 'rgba(255,240,214,0)');
  x.fillStyle = key; x.fillRect(0, 0, 1024, 512);
  // cool rim from behind
  const rim = x.createRadialGradient(824, 190, 10, 824, 190, 300);
  rim.addColorStop(0, 'rgba(200,216,232,0.55)'); rim.addColorStop(1, 'rgba(196,214,230,0)');
  x.fillStyle = rim; x.fillRect(0, 0, 1024, 512);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------- scene */
export function createExperience(canvas, opts = {}) {
  const low = !!opts.low;
  const onFrame = opts.onFrame || (() => {});
  const segU = low ? 96 : 168, segV = low ? 72 : 132;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(envTexture()).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
  const camTarget = new THREE.Vector3();

  const key = new THREE.DirectionalLight(0xfff0d6, 3.4);
  key.position.set(2.6, 4.2, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 26;
  key.shadow.camera.left = -5.5; key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5; key.shadow.camera.bottom = -5.5;
  key.shadow.bias = -0.0012; key.shadow.radius = 6;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xbfd2e6, 0.55);
  fill.position.set(-3.4, 1.2, -1.6); scene.add(fill);
  const front = new THREE.DirectionalLight(0xffdcac, 1.0);
  front.position.set(0.6, 0.8, 4.2); scene.add(front);
  const rim = new THREE.SpotLight(0xffe6c0, 12, 14, 0.7, 0.7, 1.6);
  rim.position.set(-1.4, 2.2, -3.4); scene.add(rim);
  scene.add(new THREE.HemisphereLight(0x6b5a44, 0x120e0b, 0.35));

  const sm = skinMaps(low ? 1024 : 2048, low ? 512 : 1024, 0.55);
  const fm = fleshMaps(low ? 512 : 1024);
  const dm = seedMaps(512, 512);

  const skinMat = new THREE.MeshPhysicalMaterial({
    map: sm.map, bumpMap: sm.bumpMap, bumpScale: 0.55, roughnessMap: sm.roughnessMap,
    roughness: 0.58, metalness: 0, clearcoat: 0.04, clearcoatRoughness: 0.8,
    sheen: 0.10, sheenColor: new THREE.Color(0xffe7b0), envMapIntensity: 0.82, side: THREE.DoubleSide,
  });
  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: fm.map, bumpMap: fm.bumpMap, bumpScale: 0.2, roughness: 0.46, metalness: 0, side: THREE.DoubleSide,
    clearcoat: 0.3, clearcoatRoughness: 0.38, envMapIntensity: 0.6,
  });
  const seedMat = new THREE.MeshStandardMaterial({
    color: 0xd6c096, map: dm.map, bumpMap: dm.bumpMap, bumpScale: 0.5, roughness: 0.92, metalness: 0, envMapIntensity: 0.4,
  });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xa8acb3, roughness: 0.28, metalness: 1, envMapIntensity: 1.1 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: 0.55, metalness: 0 });

  // ---- whole fruit
  const wholeGeo = wholeMangoGeometry(segU, segV);
  const wholeSkin = skinMat.clone();
  const whole = new THREE.Mesh(wholeGeo, wholeSkin);
  whole.castShadow = whole.receiveShadow = true;

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.032, 0.14, 12, 1),
    new THREE.MeshStandardMaterial({ color: 0x6b5a2c, roughness: 0.85 })
  );
  stem.position.set(-0.035, 1.06, 0.02);
  stem.rotation.z = 0.2; stem.castShadow = true;

  const wholeGroup = new THREE.Group();
  wholeGroup.add(whole, stem);

  // ---- cut pieces (cheek cut beside the stone)
  const CUT = 0.30;
  const cheek = cutPieceGeometry(CUT, 1, segU, segV);
  const body = cutPieceGeometry(CUT, -1, segU, segV);
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

  const seed = new THREE.Mesh(seedGeometry(low ? 64 : 96, low ? 48 : 72), seedMat);
  seed.position.set(0.02, -0.02, -0.02);
  seed.castShadow = true;
  bodyGroup.add(seed);

  const cutGroup = new THREE.Group();
  cutGroup.add(cheekGroup, bodyGroup);
  cutGroup.visible = false;

  // progressive-cut clipping: whole shows below the blade, pieces above it
  const planeBelow = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1.4);
  const planeAbove = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.4);
  wholeSkin.clippingPlanes = [planeBelow];
  [cheekSkin, bodySkin, cheekFlesh, bodyFlesh, seedMat].forEach(m => { m.clippingPlanes = [planeAbove]; });

  // ---- knife
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.78, -0.085);
  bladeShape.lineTo(0.92, -0.02);
  bladeShape.quadraticCurveTo(1.06, 0.015, 0.86, 0.085);
  bladeShape.lineTo(-0.78, 0.135);
  bladeShape.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bladeShape, { depth: 0.016, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 2 }),
    steelMat
  );
  blade.castShadow = true;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.062, 0.56, 16), handleMat);
  handle.rotation.z = Math.PI / 2; handle.position.set(-1.10, 0.02, 0.008);
  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.054, 0.054, 0.05, 16), steelMat);
  bolster.rotation.z = Math.PI / 2; bolster.position.set(-0.80, 0.02, 0.008);
  const knife = new THREE.Group();
  knife.add(blade, handle, bolster);
  knife.scale.setScalar(0.84);
  knife.rotation.x = -0.12;
  knife.visible = false;

  // ---- selection trio
  const trio = new THREE.Group();
  const trioSpecs = [
    { x: -3.05, ripe: 0.20, s: 0.88, rot: -0.4, tilt: 0.16 },
    { x: 0.0, ripe: 0.52, s: 0.94, rot: 0.5, tilt: -0.1 },
    { x: 3.1, ripe: 0.88, s: 1.02, rot: -0.15, tilt: 0.06 },
  ];
  const trioMats = [];
  trioSpecs.forEach((sp, i) => {
    const m = skinMat.clone();
    m.color = new THREE.Color().setHSL(lerp(0.16, 0.10, sp.ripe), lerp(0.22, 0.42, sp.ripe), lerp(0.62, 0.52, sp.ripe));
    m.roughness = lerp(0.56, 0.36, sp.ripe);
    m.clearcoat = lerp(0.2, 0.5, sp.ripe);
    trioMats.push(m);
    const mesh = new THREE.Mesh(wholeGeo, m);
    mesh.castShadow = mesh.receiveShadow = true;
    const gp = new THREE.Group();
    gp.add(mesh);
    gp.position.set(sp.x, 0, i === 2 ? 0.5 : -0.2);
    gp.scale.setScalar(sp.s);
    gp.rotation.set(sp.tilt, sp.rot, i === 2 ? -0.22 : 0.34);
    trio.add(gp);
  });
  trio.visible = false;

  // ---- ground shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ opacity: 0.34 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.12;
  ground.receiveShadow = true;

  const stage = new THREE.Group();
  stage.add(wholeGroup, cutGroup, knife, trio);
  scene.add(stage, ground);

  // ---- anchors projected to screen for the DOM annotations
  const anchorDefs = [
    { id: 'center', v: new THREE.Vector3(0, 0, 0) },
    { id: 'top', v: new THREE.Vector3(0, 1.04, 0) },
    { id: 'aroma', v: new THREE.Vector3(-0.12, 1.16, 0.08) },
    { id: 'skin', v: new THREE.Vector3(0.66, 0.30, 0.42) },
    { id: 'firmness', v: new THREE.Vector3(-0.62, -0.18, 0.30) },
    { id: 'ripeness', v: new THREE.Vector3(0.30, -0.98, 0.22) },
    { id: 'flesh', v: new THREE.Vector3(0.10, 0.20, -0.34) },
    { id: 'fibre', v: new THREE.Vector3(-0.34, -0.62, -0.30) },
    { id: 'seed', v: new THREE.Vector3(1.10, 0.05, 0.95) },
  ];
  const anchorHosts = { flesh: cheekGroup, fibre: cheekGroup, seed: bodyGroup };
  ['good', 'better', 'best'].forEach((id, i) => {
    anchorDefs.push({ id, v: new THREE.Vector3(0, 1.34, 0) });
    anchorHosts[id] = trio.children[i];
  });

  let drag = { x: 0, y: 0 }, dragTarget = { x: 0, y: 0 };
  let progress = 0, shown = 0, t0 = performance.now();
  let W = 1, H = 1, running = true;

  function resize() {
    W = canvas.clientWidth || 1; H = canvas.clientHeight || 1;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
  }

  function setProgress(p) { progress = clamp(p, 0, 1); }
  function addDrag(dx, dy) {
    dragTarget.x += dx;
    dragTarget.y = clamp(dragTarget.y + dy, -0.5, 0.5);
  }

  const screenPts = [];
  const tmp = new THREE.Vector3();

  function layout(p, time) {
    // ---------------- acts
    const inspect = ramp(p, 0.10, 0.26);
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

    // blade travel drives the progressive cut
    const bladeY = lerp(1.75, -1.5, cutting);
    planeBelow.constant = bladeY + 0.002;    // keep whole below the blade
    planeAbove.constant = -bladeY + 0.002;   // keep pieces above the blade
    if (!cutStage) { planeBelow.constant = 5; planeAbove.constant = 5; }
    if (p >= 0.42) { planeAbove.constant = 5; }

    knife.position.set(lerp(2.9, 0.62, ramp(p, 0.28, 0.335)), bladeY + 0.13, CUT + 0.012);
    knife.rotation.z = lerp(-0.55, -0.09, ramp(p, 0.28, 0.35));
    blade.material.opacity = 1;

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
    stage.position.x = lerp(0, 0, 1);

    // whole fruit gentle idle + drag
    const spin = p * 3.1 + drag.x + time * 0.045;
    wholeGroup.rotation.set(0.06 + drag.y * 0.7, spin, 0.06);
    cutGroup.rotation.set(0.05 + drag.y * 0.7, spin * 0.30 * (1 - explode * 0.85) + drag.x * 0.2 * explode, 0.03);
    trio.rotation.set(drag.y * 0.25, drag.x * 0.35, 0);

    // camera choreography
    const stops = [
      { d: 7.4, y: 0.30, h: 0.30, tY: 0 },    // hero
      { d: 5.6, y: 0.40, h: 0.60, tY: 0.05 }, // inspect
      { d: 5.9, y: 0.24, h: 0.20, tY: 0 },    // cut
      { d: 8.6, y: 0.38, h: 0.14, tY: 0.02 }, // exploded
      { d: 8.2, y: 0.30, h: 0.05, tY: 0.02 }, // intelligence
      { d: 11.6, y: 0.50, h: 0.10, tY: 0.02 },// trio
      { d: 8.4, y: 0.40, h: 0.45, tY: 0 },    // rejoin
      { d: 8.4, y: 0.44, h: 0.32, tY: -0.52 },   // cta
    ];
    const marks = [0.0, 0.14, 0.32, 0.46, 0.58, 0.70, 0.86, 0.95];
    let i1 = 0;
    for (let i = 0; i < marks.length - 1; i++) if (p >= marks[i]) i1 = i;
    const i2 = Math.min(i1 + 1, stops.length - 1);
    const f = smooth(clamp((p - marks[i1]) / ((marks[i2] - marks[i1]) || 1), 0, 1));
    const d = lerp(stops[i1].d, stops[i2].d, f);
    const cy = lerp(stops[i1].y, stops[i2].y, f);
    const ch = lerp(stops[i1].h, stops[i2].h, f);
    const tY = lerp(stops[i1].tY, stops[i2].tY, f);

    const ang = ch + drag.x * 0.18 + Math.sin(time * 0.09) * 0.03;
    const wide = W / H > 1.15;
    const centered = Math.max(trioIn * (1 - trioOut), ramp(p, 0.925, 0.965), explode * (1 - rejoin) * 0.5);
    const fo = wide ? -9.5 * (1 - centered) : 0;
    if (Math.abs(camera.filmOffset - fo) > 0.01) { camera.filmOffset = fo; camera.updateProjectionMatrix(); }
    const dScale = wide ? 1 : lerp(1.34, 1.06, clamp((W / H - 0.55) / 0.6, 0, 1));
    camera.position.set(Math.sin(ang) * d * dScale, cy + Math.sin(time * 0.13) * 0.02 + drag.y * 0.5, Math.cos(ang) * d * dScale);
    camTarget.set(0, tY + (wide ? 0 : 0.62), 0);
    camera.lookAt(camTarget);

    ground.material.opacity = lerp(0.34, 0.13, Math.max(explode * (1 - rejoin), trioIn * (1 - trioOut) * 0.3));
    key.intensity = lerp(2.5, 2.9, trioIn * (1 - trioOut));
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

  function collect() {
    screenPts.length = 0;
    for (const a of anchorDefs) {
      tmp.copy(a.v);
      const host = anchorHosts[a.id] || wholeGroup;
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

  resize();
  frame();

  return {
    setProgress, addDrag, resize,
    setExposure(v) { renderer.toneMappingExposure = v; },
    // synchronous jump + single frame, used for inspection/captures
    renderAt(p) {
      progress = shown = clamp(p, 0, 1);
      layout(shown, 9);
      renderer.render(scene, camera);
      onFrame(collect(), shown);
    },
    dispose() { running = false; renderer.dispose(); pmrem.dispose(); },
  };
}
