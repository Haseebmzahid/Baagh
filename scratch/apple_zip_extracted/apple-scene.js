// Apple — Fruit Intelligence chapter four. Procedural geometry + painted maps.
// Reference-driven: lobed body with a deep calyx basin and woody stem, crimson skin
// grading to a gold shoulder with fine lenticels, cream flesh with a green cast at
// the core, red skin edge on every cut face, two brown teardrop seeds.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const ramp = (p, a, b) => smooth(clamp((p - a) / (b - a), 0, 1));
const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

/* ---------------------------------------------------------------- geometry */
function makeShape(seed) {
  const s = i => Math.sin(seed * (i * 12.9898) + i * 4.1) * 0.5 + 0.5;
  return {
    lobe: 0.006 + 0.005 * s(1), lobePh: s(2) * TAU,
    a1: 0.010 + 0.008 * s(3), p1: s(4) * TAU,
    a2: 0.007 + 0.006 * s(5), p2: s(6) * TAU,
    dentAz: s(7) * TAU, dentV: 0.4 + 0.3 * s(8), dentD: 0.006 + 0.010 * s(9),
    squash: 1.02 + 0.05 * s(10),
    waist: 0.42 + 0.05 * s(11),
    tilt: (s(12) - 0.5) * 0.04,
  };
}
const DEFAULT_SHAPE = makeShape(0.41);

// v: 0 at the stem basin, 1 at the calyx. Widest a little above the middle.
function radiusAt(az, v, sh) {
  const basin = 0.26 * Math.exp(-Math.pow(v / 0.17, 2));        // stem well
  const calyx = 0.13 * Math.exp(-Math.pow((1 - v) / 0.13, 2));  // blossom well
  const belly = 1 + 0.035 * Math.exp(-Math.pow((v - sh.waist) / 0.32, 2));
  let r = belly - basin - calyx;
  // soft ridging, only really visible around the two wells
  const lobeAmp = sh.lobe * (0.3 + 1.2 * (Math.exp(-Math.pow(v / 0.26, 2)) + Math.exp(-Math.pow((1 - v) / 0.24, 2))));
  r += lobeAmp * Math.cos(5 * az + sh.lobePh);
  r += sh.a1 * Math.sin(3 * az + sh.p1) * Math.sin(Math.PI * v);
  r += sh.a2 * Math.sin(2 * az + sh.p2 + v * 2.3);
  let dAz = az - sh.dentAz;
  while (dAz > Math.PI) dAz -= TAU;
  while (dAz < -Math.PI) dAz += TAU;
  const dv = v - sh.dentV;
  r -= sh.dentD * Math.exp(-(dAz * dAz * 2.6 + dv * dv * 30));
  return r;
}

function point(az, v, R, sh, out) {
  const ph = v * Math.PI;
  const s = Math.sin(ph), c = Math.cos(ph);
  const r = radiusAt(az, v, sh) * R;
  const x = Math.cos(az) * s * r, z = Math.sin(az) * s * r;
  const y = c * r * sh.squash;
  out.set(x + sh.tilt * y * 0.4, y, z);
  return out;
}

function meshFromGrid(rows, uvs) {
  const P = [], U = [];
  for (let j = 0; j < rows.length - 1; j++) {
    for (let i = 0; i < rows[j].length - 1; i++) {
      const a = rows[j][i], b = rows[j][i + 1], c = rows[j + 1][i], d = rows[j + 1][i + 1];
      const ua = uvs[j][i], ub = uvs[j][i + 1], uc = uvs[j + 1][i], ud = uvs[j + 1][i + 1];
      P.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      U.push(ua[0], ua[1], ub[0], ub[1], uc[0], uc[1]);
      P.push(b.x, b.y, b.z, d.x, d.y, d.z, c.x, c.y, c.z);
      U.push(ub[0], ub[1], ud[0], ud[1], uc[0], uc[1]);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.computeVertexNormals();
  return g;
}

function fruitGeometry(segU, segV, sh) {
  const rows = [], uvs = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= segV; j++) {
    const row = [], uv = [];
    for (let i = 0; i <= segU; i++) {
      row.push(point((i / segU) * TAU, j / segV, 1, sh, p).clone());
      uv.push([i / segU, 1 - j / segV]);
    }
    rows.push(row); uvs.push(uv);
  }
  return meshFromGrid(rows, uvs);
}

// One wedge: curved skin band plus two flat cut faces running in to the core axis.
function wedgeGeometry(halfWidth, segU, segV, sh, coreR) {
  const p = new THREE.Vector3();
  const rows = [], uvs = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const row = [], uv = [];
    for (let i = 0; i <= segU; i++) {
      const f = i / segU, az = lerp(-halfWidth, halfWidth, f);
      row.push(point(az, v, 1, sh, p).clone());
      uv.push([f, 1 - v]);
    }
    rows.push(row); uvs.push(uv);
  }
  const skin = meshFromGrid(rows, uvs);
  // cut face: u = 0 at the core axis, u = 1 at the skin, so the painted map can put
  // the red rind edge and the core notch in the right places
  const face = (idx, flip) => {
    const gr = [], gu = [], steps = 12;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, row = [], uv = [];
      for (let j = 0; j <= segV; j++) {
        const edge = rows[j][idx];
        const axis = new THREE.Vector3(sh.tilt * edge.y * 0.4, edge.y, 0);
        row.push(axis.clone().lerp(edge, coreR + (1 - coreR) * t));
        uv.push([t, j / segV]);
      }
      gr.push(row); gu.push(uv);
    }
    return meshFromGrid(flip ? gr.map(r => r.slice().reverse()) : gr, flip ? gu.map(r => r.slice().reverse()) : gu);
  };
  return { skin, faces: [face(0, true), face(segU, false)] };
}

// Flat cap matching the body's own outline in the z = 0 plane.
function crossFaceGeometry(sh, steps) {
  const p = new THREE.Vector3();
  const outline = [];
  for (let i = 0; i <= steps; i++) outline.push(point(0, i / steps, 1, sh, p).clone());
  for (let i = steps - 1; i >= 1; i--) outline.push(point(Math.PI, i / steps, 1, sh, p).clone());
  const P = [], U = [], pad = 1.004;
  const uvOf = q => [(q.x * pad) / 2 + 0.5, 0.5 - (q.y * pad) / 2];
  for (let i = 0; i < outline.length; i++) {
    const a = outline[i], b = outline[(i + 1) % outline.length];
    P.push(0, 0, 0, a.x * pad, a.y * pad, 0, b.x * pad, b.y * pad, 0);
    U.push(0.5, 0.5);
    U.push.apply(U, uvOf(a));
    U.push.apply(U, uvOf(b));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.computeVertexNormals();
  return g;
}

/* ---------------------------------------------------------------- textures */
function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return { c, x: c.getContext('2d') };
}
function tex(canvas, srgb = true, rep = true) {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  return t;
}
// Cut surfaces are painted near-white for legibility while authoring, but the scene
// runs ~3.7 total direct irradiance — anything above ~0.5 albedo clips to flat white
// through ACES and loses every painted detail. Scale the finished canvas into range.
function toAlbedo(ctx, W, H, factor) {
  ctx.globalCompositeOperation = 'multiply';
  const v = Math.round(255 * factor);
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

function wrapX(W, x, margin, draw) {
  draw(x);
  if (x < margin) draw(x + W);
  else if (x > W - margin) draw(x - W);
}

// blush 0 = more gold shoulder / striped, 1 = deep even crimson
function skinMaps(W, H, blush, seed) {
  const base = cv(W, H), bump = cv(W, H), rough = cv(W, H);
  const b = base.x, bm = bump.x, rx = rough.x;
  // ground: gold-green near the stem basin, crimson over the belly, warm at the calyx
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(206, 176, blush) | 0},${lerp(168, 96, blush) | 0},${lerp(70, 44, blush) | 0})`);
  g.addColorStop(0.16, `rgb(${lerp(214, 186, blush) | 0},${lerp(156, 74, blush) | 0},${lerp(58, 36, blush) | 0})`);
  g.addColorStop(0.45, `rgb(${lerp(190, 166, blush) | 0},${lerp(58, 30, blush) | 0},${lerp(40, 30, blush) | 0})`);
  g.addColorStop(0.78, `rgb(${lerp(174, 146, blush) | 0},${lerp(44, 22, blush) | 0},${lerp(36, 26, blush) | 0})`);
  g.addColorStop(1, `rgb(${lerp(158, 126, blush) | 0},${lerp(56, 30, blush) | 0},${lerp(38, 26, blush) | 0})`);
  b.fillStyle = g; b.fillRect(0, 0, W, H);
  // gold shoulder retained on the sun-shy side of the fruit
  const gold = b.createLinearGradient(W * 0.08, 0, W * 0.44, 0);
  gold.addColorStop(0, 'rgba(226,186,80,0)');
  gold.addColorStop(0.5, `rgba(224,178,72,${0.34 * (1 - blush) + 0.06})`);
  gold.addColorStop(1, 'rgba(226,186,80,0)');
  b.fillStyle = gold; b.fillRect(0, 0, W, H);
  // vertical striping — soft streaked blush, never a painted stripe
  for (let i = 0; i < 340; i++) {
    const x = rnd(0, W), w = rnd(6, 34), y0 = rnd(-H * 0.1, H * 0.3), h = rnd(H * 0.35, H * 0.95);
    const dark = Math.random() > 0.42;
    wrapX(W, x, w * 2, px => {
      const lg = b.createLinearGradient(px - w, 0, px + w, 0);
      const col = dark ? '150,26,30' : '226,158,70';
      lg.addColorStop(0, `rgba(${col},0)`);
      lg.addColorStop(0.5, `rgba(${col},${rnd(0.03, 0.09)})`);
      lg.addColorStop(1, `rgba(${col},0)`);
      b.fillStyle = lg; b.fillRect(px - w, y0, w * 2, h);
    });
  }
  // broad colour zones
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.06, H * 0.34);
    const pick = Math.random();
    const col = pick > 0.6 ? 'rgba(214,60,44,0.16)' : pick > 0.3 ? 'rgba(120,16,26,0.18)' : 'rgba(230,178,80,0.12)';
    wrapX(W, x, r, px => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, col); rg.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = rg; b.beginPath(); b.arc(px, y, r, 0, 7); b.fill();
    });
  }
  bm.fillStyle = '#808080'; bm.fillRect(0, 0, W, H);
  // apple skin is glossy but unevenly so — waxy patches, drier near the wells
  rx.fillStyle = '#6e6e6e'; rx.fillRect(0, 0, W, H);
  const dry = rx.createLinearGradient(0, 0, 0, H * 0.2);
  dry.addColorStop(0, 'rgba(255,255,255,0.42)');
  dry.addColorStop(1, 'rgba(255,255,255,0)');
  rx.fillStyle = dry; rx.fillRect(0, 0, W, H * 0.2);
  for (let i = 0; i < 110; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.3);
    const light = Math.random() > 0.45;
    wrapX(W, x, r, px => {
      const rg = rx.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, light ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      rx.fillStyle = rg; rx.beginPath(); rx.arc(px, y, r, 0, 7); rx.fill();
    });
  }
  // lenticels: the fine pale freckling across the skin
  const SP = 32, SPH = SP / 2;
  const sprite = paint => { const s = cv(SP, SP); paint(s.x, SPH); return s.c; };
  const dotCol = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(246,226,192,0.95)');
    g2.addColorStop(0.5, 'rgba(238,206,164,0.35)');
    g2.addColorStop(1, 'rgba(238,206,164,0)');
    x.fillStyle = g2; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
  });
  const dotBump = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(255,255,255,0.7)');
    g2.addColorStop(0.55, 'rgba(128,128,128,0.3)');
    g2.addColorStop(0.85, 'rgba(0,0,0,0.3)');
    g2.addColorStop(1, 'rgba(128,128,128,0)');
    x.fillStyle = g2; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
  });
  const dots = Math.round(W * H / 300);
  for (let i = 0; i < dots; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(1.0, 2.4);
    const a = rnd(0.24, 0.6);
    wrapX(W, x, 6, px => {
      b.globalAlpha = a;
      b.drawImage(dotCol, px - r, y - r, r * 2, r * 2);
      bm.globalAlpha = rnd(0.5, 0.9);
      bm.drawImage(dotBump, px - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
      b.globalAlpha = 1; bm.globalAlpha = 1;
    });
  }
  // micro grain plus a few honest marks
  for (let i = 0; i < W * H / 1400; i++) {
    const x = rnd(0, W), y = rnd(0, H);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    bm.beginPath(); bm.arc(x, y, rnd(0.5, 1.5), 0, 7); bm.fill();
  }
  for (let i = 0; i < 7; i++) {
    const x = rnd(0, W), y = rnd(H * 0.15, H * 0.85), r = rnd(7, 26);
    wrapX(W, x, r, px => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, 'rgba(96,44,26,0.22)');
      rg.addColorStop(1, 'rgba(96,44,26,0)');
      b.fillStyle = rg; b.beginPath(); b.arc(px, y, r, 0, 7); b.fill();
      rx.fillStyle = 'rgba(255,255,255,0.2)';
      rx.beginPath(); rx.arc(px, y, r * 0.7, 0, 7); rx.fill();
    });
  }
  if (seed !== undefined) {
    // a russet fleck or two around the stem well, as fruit off a real tree carries
    for (let i = 0; i < 3; i++) {
      const x = rnd(0, W), y = rnd(0, H * 0.16), r = rnd(5, 14);
      b.fillStyle = `rgba(140,96,52,${rnd(0.16, 0.34)})`;
      b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
    }
  }
  return { map: tex(base.c), bumpMap: tex(bump.c, false), roughnessMap: tex(rough.c, false) };
}

// A wedge's cut face: cream flesh, radial fibre, green cast at the core, red rind edge.
function fleshMaps(S) {
  const base = cv(S, S), bump = cv(S, S);
  const b = base.x, bm = bump.x;
  // u across (0 = core axis, 1 = skin), v down the fruit
  const g = b.createLinearGradient(0, 0, S, 0);
  g.addColorStop(0, '#e4dba0');
  g.addColorStop(0.14, '#efe4a8');
  g.addColorStop(0.6, '#f2e49c');
  g.addColorStop(0.93, '#f0e0a4');
  b.fillStyle = g; b.fillRect(0, 0, S, S);
  // green-yellow cast in the core zone
  const core = b.createLinearGradient(0, 0, S * 0.22, 0);
  core.addColorStop(0, 'rgba(186,200,104,0.7)');
  core.addColorStop(1, 'rgba(206,214,140,0)');
  b.fillStyle = core; b.fillRect(0, 0, S * 0.22, S);
  // fibre running out from the core
  for (let i = 0; i < 2400; i++) {
    const y = rnd(0, S), x0 = rnd(S * 0.06, S * 0.62), len = rnd(S * 0.05, S * 0.34);
    b.strokeStyle = `rgba(${rnd(226, 255) | 0},${rnd(220, 252) | 0},${rnd(186, 226) | 0},${rnd(0.14, 0.45)})`;
    b.lineWidth = rnd(0.6, 2.2);
    b.beginPath(); b.moveTo(x0, y);
    b.quadraticCurveTo(x0 + len * 0.6, y + rnd(-5, 5), x0 + len, y + rnd(-8, 8));
    b.stroke();
  }
  // faint darker grain so the face is never a flat slab
  for (let i = 0; i < 900; i++) {
    const y = rnd(0, S), x0 = rnd(S * 0.1, S * 0.85), len = rnd(S * 0.04, S * 0.2);
    b.strokeStyle = `rgba(206,192,150,${rnd(0.06, 0.2)})`;
    b.lineWidth = rnd(0.6, 1.8);
    b.beginPath(); b.moveTo(x0, y); b.lineTo(x0 + len, y + rnd(-5, 5)); b.stroke();
  }
  // moisture on the cut face
  for (let i = 0; i < 3400; i++) {
    const x = rnd(0, S), y = rnd(0, S);
    b.fillStyle = `rgba(255,255,246,${rnd(0.1, 0.42)})`;
    b.beginPath(); b.arc(x, y, rnd(0.6, 2.4), 0, 7); b.fill();
  }
  // the red rind edge every apple slice carries
  const rind = b.createLinearGradient(S * 0.855, 0, S, 0);
  rind.addColorStop(0, 'rgba(196,44,44,0)');
  rind.addColorStop(0.35, 'rgba(190,40,42,0.55)');
  rind.addColorStop(0.7, 'rgba(168,28,34,0.96)');
  rind.addColorStop(1, 'rgba(132,20,28,1)');
  b.fillStyle = rind; b.fillRect(S * 0.855, 0, S * 0.145, S);
  b.fillStyle = 'rgba(250,240,206,0.55)';
  b.fillRect(S * 0.845, 0, S * 0.012, S);
  // the core notch: green-tinged wall at the axis end of every face
  const notch = b.createLinearGradient(0, 0, S * 0.1, 0);
  notch.addColorStop(0, 'rgba(176,186,110,0.6)');
  notch.addColorStop(1, 'rgba(176,186,110,0)');
  b.fillStyle = notch; b.fillRect(0, 0, S * 0.1, S);
  bm.fillStyle = '#808080'; bm.fillRect(0, 0, S, S);
  for (let i = 0; i < 6000; i++) {
    const x = rnd(0, S), y = rnd(0, S);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.24)';
    bm.beginPath(); bm.arc(x, y, rnd(0.8, 3.0), 0, 7); bm.fill();
  }
  toAlbedo(b, S, S, 0.62);
  return { map: tex(base.c, true, false), bumpMap: tex(bump.c, false, false) };
}

// The lengthwise cross-section: butterfly core, two seed chambers, cream flesh.
function crossMaps(S) {
  const base = cv(S, S), bump = cv(S, S);
  const b = base.x, bm = bump.x;
  const C = S / 2;
  bm.fillStyle = '#808080'; bm.fillRect(0, 0, S, S);
  const g = b.createRadialGradient(C, C * 0.9, S * 0.06, C, C, S * 0.52);
  g.addColorStop(0, '#e6e2a2');
  g.addColorStop(0.34, '#f0e29c');
  g.addColorStop(0.8, '#f3e6a8');
  g.addColorStop(1, '#e8d998');
  b.fillStyle = g; b.fillRect(0, 0, S, S);
  // fibre fanning from the core line
  for (let i = 0; i < 2600; i++) {
    const a = rnd(0, TAU), r0 = rnd(S * 0.05, S * 0.2), r1 = r0 + rnd(S * 0.05, S * 0.28);
    b.strokeStyle = `rgba(255,253,232,${rnd(0.05, 0.18)})`;
    b.lineWidth = rnd(0.5, 1.5);
    b.beginPath();
    b.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
    b.lineTo(C + Math.cos(a + 0.03) * r1, C + Math.sin(a + 0.03) * r1);
    b.stroke();
  }
  // vascular line: stem well down through the core to the calyx
  b.strokeStyle = 'rgba(196,206,132,0.6)'; b.lineWidth = S * 0.012;
  b.beginPath(); b.moveTo(C, S * 0.1); b.quadraticCurveTo(C - S * 0.01, C, C, S * 0.9); b.stroke();
  // the two chamber walls, drawn as the classic butterfly
  const chamber = (dir) => {
    b.save();
    b.translate(C, C);
    b.scale(dir, 1);
    b.beginPath();
    b.moveTo(0, -S * 0.11);
    b.bezierCurveTo(S * 0.09, -S * 0.10, S * 0.115, -S * 0.02, S * 0.085, S * 0.05);
    b.bezierCurveTo(S * 0.06, S * 0.10, S * 0.02, S * 0.11, 0, S * 0.10);
    b.closePath();
    b.fillStyle = 'rgba(226,230,168,0.55)'; b.fill();
    b.strokeStyle = 'rgba(178,186,110,0.75)'; b.lineWidth = S * 0.006; b.stroke();
    // seed: brown teardrop, tip toward the stem
    b.save();
    b.translate(S * 0.052, -S * 0.005);
    b.rotate(-0.35);
    const sgd = b.createLinearGradient(-S * 0.02, -S * 0.03, S * 0.02, S * 0.03);
    sgd.addColorStop(0, '#a4551f');
    sgd.addColorStop(0.5, '#8c3f16');
    sgd.addColorStop(1, '#5e2a0e');
    b.fillStyle = sgd;
    b.beginPath();
    b.moveTo(0, -S * 0.042);
    b.bezierCurveTo(S * 0.026, -S * 0.016, S * 0.022, S * 0.03, 0, S * 0.042);
    b.bezierCurveTo(-S * 0.022, S * 0.03, -S * 0.026, -S * 0.016, 0, -S * 0.042);
    b.fill();
    b.strokeStyle = 'rgba(60,26,8,0.6)'; b.lineWidth = S * 0.003; b.stroke();
    b.restore();
    b.restore();
    bm.save();
    bm.translate(C + dir * S * 0.052, C - S * 0.005);
    bm.fillStyle = 'rgba(0,0,0,0.55)';
    bm.beginPath(); bm.ellipse(0, 0, S * 0.026, S * 0.042, -0.35, 0, 7); bm.fill();
    bm.restore();
  };
  chamber(1); chamber(-1);
  // moisture across the face
  for (let i = 0; i < 2600; i++) {
    const a = rnd(0, TAU), r = Math.sqrt(Math.random()) * S * 0.5;
    b.fillStyle = `rgba(255,255,244,${rnd(0.05, 0.2)})`;
    b.beginPath(); b.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, rnd(0.5, 1.8), 0, 7); b.fill();
  }
  // red rind edge around the whole silhouette
  b.lineWidth = S * 0.02;
  b.strokeStyle = 'rgba(158,26,32,0.9)';
  b.beginPath(); b.arc(C, C, S * 0.492, 0, 7); b.stroke();
  b.lineWidth = S * 0.008;
  b.strokeStyle = 'rgba(236,220,176,0.8)';
  b.beginPath(); b.arc(C, C, S * 0.474, 0, 7); b.stroke();
  toAlbedo(b, S, S, 0.62);
  return { map: tex(base.c, true, false), bumpMap: tex(bump.c, false, false) };
}

// The core seen from outside: five chamber walls showing through the pale casing.
function coreMaps(W, H) {
  const base = cv(W, H), bump = cv(W, H);
  const b = base.x, bm = bump.x;
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#cfc884');
  g.addColorStop(0.22, '#e6dc9e');
  g.addColorStop(0.5, '#ece2a6');
  g.addColorStop(0.8, '#e2d694');
  g.addColorStop(1, '#c8bf7c');
  b.fillStyle = g; b.fillRect(0, 0, W, H);
  bm.fillStyle = '#808080'; bm.fillRect(0, 0, W, H);
  for (let i = 0; i < 5; i++) {
    const cx = (i + 0.5) * (W / 5);
    const cw = W / 5 * 0.34, ch = H * 0.19;
    b.save(); b.translate(cx, H * 0.5);
    const cg = b.createRadialGradient(0, 0, 0, 0, 0, cw * 1.6);
    cg.addColorStop(0, 'rgba(150,120,58,0.55)');
    cg.addColorStop(0.6, 'rgba(196,186,120,0.34)');
    cg.addColorStop(1, 'rgba(214,210,150,0)');
    b.fillStyle = cg;
    b.beginPath(); b.ellipse(0, 0, cw * 1.5, ch, 0, 0, 7); b.fill();
    b.strokeStyle = 'rgba(166,168,104,0.7)'; b.lineWidth = W * 0.004;
    b.beginPath(); b.ellipse(0, 0, cw, ch * 0.82, 0, 0, 7); b.stroke();
    b.restore();
    bm.save(); bm.translate(cx, H * 0.5);
    const bg = bm.createRadialGradient(0, 0, 0, 0, 0, cw * 1.4);
    bg.addColorStop(0, 'rgba(0,0,0,0.7)');
    bg.addColorStop(0.75, 'rgba(128,128,128,0.3)');
    bg.addColorStop(1, 'rgba(128,128,128,0)');
    bm.fillStyle = bg;
    bm.beginPath(); bm.ellipse(0, 0, cw * 1.4, ch, 0, 0, 7); bm.fill();
    bm.restore();
    b.strokeStyle = 'rgba(158,168,96,0.5)'; b.lineWidth = W * 0.003;
    b.beginPath(); b.moveTo(cx, H * 0.32); b.lineTo(cx + W * 0.006, 0); b.stroke();
    b.beginPath(); b.moveTo(cx, H * 0.68); b.lineTo(cx - W * 0.006, H); b.stroke();
  }
  for (let i = 0; i < 2600; i++) {
    const x = rnd(0, W), y = rnd(0, H), len = rnd(3, 18);
    b.strokeStyle = `rgba(${rnd(226, 252) | 0},${rnd(224, 248) | 0},${rnd(184, 214) | 0},${rnd(0.08, 0.3)})`;
    b.lineWidth = rnd(0.5, 1.6);
    b.beginPath(); b.moveTo(x, y); b.lineTo(x + rnd(-4, 4), y + len); b.stroke();
  }
  toAlbedo(b, W, H, 0.58);
  return { map: tex(base.c), bumpMap: tex(bump.c, false) };
}

// Environment as a float DataTexture. An 8-bit canvas quantises these very shallow
// gradients into plateaus that PMREM + ACES + clearcoat magnify into visible blocks
// on the skin, so the radiance is computed per texel in linear float instead.
// Transverse cut through the core: the five-point chamber star seen face-on.
// Painted rather than modelled — interior geometry sits in an unlit cavity and
// collapses to one flat tone whatever albedo it is given.
function coreSectionMap(S) {
  const { c, x } = cv(S, S);
  const C = S / 2, R = S * 0.5;
  x.clearRect(0, 0, S, S);
  const ring = x.createRadialGradient(C, C, R * 0.2, C, C, R);
  ring.addColorStop(0, '#efe4a4');
  ring.addColorStop(0.62, '#f2e6a6');
  ring.addColorStop(0.93, '#e6d68e');
  ring.addColorStop(1, '#c9b76c');
  x.fillStyle = ring;
  x.beginPath(); x.arc(C, C, R, 0, TAU); x.fill();
  for (let i = 0; i < 2200; i++) {
    const a = rnd(0, TAU), r0 = rnd(R * 0.3, R * 0.62), r1 = r0 + rnd(R * 0.05, R * 0.28);
    x.strokeStyle = `rgba(255,250,214,${rnd(0.05, 0.2)})`;
    x.lineWidth = rnd(0.5, 1.6);
    x.beginPath();
    x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
    x.lineTo(C + Math.cos(a + 0.02) * r1, C + Math.sin(a + 0.02) * r1);
    x.stroke();
  }
  // five chambers on a star
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    x.save();
    x.translate(C + Math.cos(a) * R * 0.30, C + Math.sin(a) * R * 0.30);
    x.rotate(a + Math.PI / 2);
    x.beginPath();
    x.moveTo(0, -R * 0.20);
    x.bezierCurveTo(R * 0.14, -R * 0.11, R * 0.12, R * 0.10, 0, R * 0.16);
    x.bezierCurveTo(-R * 0.12, R * 0.10, -R * 0.14, -R * 0.11, 0, -R * 0.20);
    x.closePath();
    const cg = x.createLinearGradient(0, -R * 0.20, 0, R * 0.16);
    cg.addColorStop(0, '#cdbe80');
    cg.addColorStop(1, '#9d9058');
    x.fillStyle = cg; x.fill();
    x.strokeStyle = 'rgba(108,96,52,0.9)'; x.lineWidth = R * 0.014; x.stroke();
    x.restore();
  }
  // two dark pips per chamber, drawn above every outline
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    [-1, 1].forEach(side => {
      x.save();
      x.translate(C + Math.cos(a) * R * 0.30, C + Math.sin(a) * R * 0.30);
      x.rotate(a + Math.PI / 2);
      x.translate(side * R * 0.044, R * 0.005);
      x.rotate(side * 0.28);
      const sg = x.createLinearGradient(-R * 0.03, -R * 0.055, R * 0.03, R * 0.055);
      sg.addColorStop(0, '#6d3413');
      sg.addColorStop(0.45, '#411b07');
      sg.addColorStop(1, '#210d03');
      x.fillStyle = sg;
      x.beginPath();
      x.moveTo(0, -R * 0.058);
      x.bezierCurveTo(R * 0.033, -R * 0.023, R * 0.029, R * 0.04, 0, R * 0.058);
      x.bezierCurveTo(-R * 0.029, R * 0.04, -R * 0.033, -R * 0.023, 0, -R * 0.058);
      x.fill();
      x.strokeStyle = 'rgba(16,6,1,0.8)'; x.lineWidth = R * 0.007; x.stroke();
      x.restore();
    });
  }
  const ax = x.createRadialGradient(C, C, 0, C, C, R * 0.08);
  ax.addColorStop(0, '#b3a463');
  ax.addColorStop(1, 'rgba(179,164,99,0)');
  x.fillStyle = ax; x.beginPath(); x.arc(C, C, R * 0.08, 0, TAU); x.fill();
  for (let i = 0; i < 1800; i++) {
    const a = rnd(0, TAU), r = Math.sqrt(Math.random()) * R;
    x.fillStyle = `rgba(255,252,226,${rnd(0.04, 0.16)})`;
    x.beginPath(); x.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, rnd(0.5, 1.7), 0, 7); x.fill();
  }
  toAlbedo(x, S, S, 0.62);
  return tex(c, true, false);
}

function envTexture() {
  const W = 2048, H = 1024;
  const data = new Float32Array(W * H * 4);
  const lights = [
    { u: 0.29, v: 0.20, r: 0.62, c: [1.00, 0.965, 0.90], i: 3.1 },
    { u: 0.75, v: 0.32, r: 0.46, c: [0.80, 0.86, 0.93], i: 1.05 },
    { u: 0.51, v: 0.84, r: 0.44, c: [0.59, 0.43, 0.27], i: 0.7 },
  ];
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    // vertical falloff: warm ceiling down to a near-black floor
    const sky = Math.pow(clamp(1 - v * 1.24, 0, 1), 1.55);
    const base = [0.030 + 0.30 * sky, 0.024 + 0.255 * sky, 0.019 + 0.205 * sky];
    for (let x = 0; x < W; x++) {
      const u = x / (W - 1);
      let r = base[0], g = base[1], bl = base[2];
      for (const L of lights) {
        let du = u - L.u;
        if (du > 0.5) du -= 1;
        if (du < -0.5) du += 1;
        // horizontal distance compresses toward the poles, as on a real equirect
        du *= Math.max(0.25, Math.sin(Math.PI * v));
        const dv = v - L.v;
        const d = Math.sqrt(du * du + dv * dv) / L.r;
        if (d < 1) {
          const f = Math.pow(1 - d * d, 2.2) * L.i;
          r += L.c[0] * f; g += L.c[1] * f; bl += L.c[2] * f;
        }
      }
      const i = (y * W + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = bl; data[i + 3] = 1;
    }
  }
  const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.LinearSRGBColorSpace;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = true;
  t.needsUpdate = true;
  return t;
}

/* ------------------------------------------------------------------- scene */
export function createExperience(canvas, opts = {}) {
  const low = !!opts.low;
  const onFrame = opts.onFrame || (() => {});
  const NW = 6, CORE_R = 0.17;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTexture()).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const camTarget = new THREE.Vector3();

  const key = new THREE.DirectionalLight(0xfff4e2, 2.5);
  key.position.set(2.3, 3.8, 3.1);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 26;
  key.shadow.camera.left = -5.5; key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5; key.shadow.camera.bottom = -5.5;
  key.shadow.bias = -0.0015; key.shadow.radius = 8;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc4d4e8, 0.4);
  fill.position.set(-3.4, 1.0, -1.4); scene.add(fill);
  const front = new THREE.DirectionalLight(0xffe6c6, 0.55);
  front.position.set(0.4, 0.5, 4.2); scene.add(front);
  const bounce = new THREE.DirectionalLight(0xffd6b0, 0.26);
  bounce.position.set(0.2, -2.6, 1.4); scene.add(bounce);
  scene.add(new THREE.HemisphereLight(0x6e5c46, 0x120e0b, 0.28));

  const SH = DEFAULT_SHAPE;
  const sm = skinMaps(low ? 1024 : 2048, low ? 512 : 1024, 0.74);
  const fm = fleshMaps(low ? 640 : 1024);
  const cm = crossMaps(low ? 768 : 1280);

  const skinMat = new THREE.MeshPhysicalMaterial({
    map: sm.map, bumpMap: sm.bumpMap, bumpScale: 0.32, roughnessMap: sm.roughnessMap,
    roughness: 1, metalness: 0, clearcoat: 0.34, clearcoatRoughness: 0.34,
    envMapIntensity: 0.6, specularIntensity: 0.6,
  });
  const fleshMat = new THREE.MeshPhysicalMaterial({
    map: fm.map, bumpMap: fm.bumpMap, bumpScale: 0.5, roughness: 0.62, metalness: 0,
    clearcoat: 0, specularIntensity: 0.12, envMapIntensity: 0.1,
    transmission: low ? 0 : 0.1, thickness: 0.4, ior: 1.35, side: THREE.DoubleSide,
  });
  const crossMat = new THREE.MeshPhysicalMaterial({
    map: cm.map, bumpMap: cm.bumpMap, bumpScale: 0.55, roughness: 0.6, metalness: 0,
    clearcoat: 0, specularIntensity: 0.12, envMapIntensity: 0.1,
    transparent: true, side: THREE.DoubleSide,
  });
  const coreMat = new THREE.MeshStandardMaterial({ roughness: 0.94, metalness: 0, envMapIntensity: 0.08, side: THREE.DoubleSide });
  const seedMat = new THREE.MeshPhysicalMaterial({ color: 0x150800, roughness: 0.45, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.35, envMapIntensity: 0.1 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.92, metalness: 0 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xacb0b6, roughness: 0.26, metalness: 1, envMapIntensity: 1.05 });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0x241a12, roughness: 0.6, metalness: 0 });

  const cm2 = coreMaps(low ? 512 : 1024, low ? 256 : 512);
  coreMat.map = cm2.map;
  coreMat.bumpMap = cm2.bumpMap;
  coreMat.bumpScale = 0.7;

  const stage = new THREE.Group();
  scene.add(stage);

  const makeStem = (sh) => {
    const g = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.012, 0.10, 0.008),
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

  // ---- whole fruit
  const wholeGeo = fruitGeometry(low ? 104 : 176, low ? 72 : 120, SH);
  const whole = new THREE.Mesh(wholeGeo, skinMat);
  whole.castShadow = whole.receiveShadow = true;
  const wholeGroup = new THREE.Group();
  wholeGroup.add(whole, makeStem(SH));
  stage.add(wholeGroup);

  // ---- wedges (the slice)
  const wedgeHalf = (Math.PI / NW) * 0.985;
  const wg = wedgeGeometry(wedgeHalf, low ? 20 : 30, low ? 40 : 60, SH, CORE_R);
  const wedges = [];
  const sliced = new THREE.Group();
  for (let i = 0; i < NW; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / NW) * TAU;
    const arm = new THREE.Group();
    const skin = new THREE.Mesh(wg.skin, skinMat);
    skin.castShadow = true;
    arm.add(skin);
    wg.faces.forEach(f => arm.add(new THREE.Mesh(f, fleshMat)));
    yaw.add(arm);
    sliced.add(yaw);
    wedges.push(arm);
  }
  sliced.visible = false;
  stage.add(sliced);

  // ---- core + seeds
  // core: a short barrel with pointed ends, roughly a third of the fruit
  const coreProfile = [];
  for (let i = 0; i <= 18; i++) {
    const t = i / 18;
    const r = CORE_R * Math.pow(Math.sin(Math.PI * clamp(t, 0.02, 0.98)), 0.55);
    coreProfile.push(new THREE.Vector2(Math.max(0.004, r), lerp(0.42, -0.44, t)));
  }
  // Act 05 is a transverse cut: the top of the casing is clipped away and a painted
  // face sits at the cut, read by a camera looking down on it. The clip is enabled
  // only for that act, so act 03 still shows a solid core between the wedges.
  const coreClip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.02);
  const coreGroup = new THREE.Group();
  const coreMesh = new THREE.Mesh(new THREE.LatheGeometry(coreProfile, 36), coreMat);
  coreMesh.castShadow = true;
  coreGroup.add(coreMesh);
  const sectionFace = new THREE.Mesh(
    new THREE.CircleGeometry(CORE_R * 1.02, 64),
    new THREE.MeshStandardMaterial({
      map: coreSectionMap(low ? 640 : 1024), roughness: 0.62, metalness: 0,
      envMapIntensity: 0.1, transparent: true, side: THREE.DoubleSide,
    })
  );
  sectionFace.rotation.x = -Math.PI / 2;
  sectionFace.position.y = 0.02;
  sectionFace.visible = false;
  coreGroup.add(sectionFace);
  // five chamber walls radiating from the axis, the real structure of a core
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x241f0c, roughness: 0.95, metalness: 0, envMapIntensity: 0.05, side: THREE.DoubleSide });
  const wallShape = new THREE.Shape();
  wallShape.moveTo(0, 0.30);
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
  const seeds = [];
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 12), seedMat);
    s.scale.set(0.5, 1.15, 0.34);
    const a = (i / 5) * TAU + TAU / 10;
    // seated between two chamber walls, inside the casing
    s.position.set(Math.cos(a) * 0.055, (i % 2 ? 0.015 : -0.012), Math.sin(a) * 0.055);
    s.rotation.set(0.16, -a, 0.26);
    s.castShadow = true;
    s.visible = false;
    coreGroup.add(s);
    seeds.push(s);
  }
  coreGroup.visible = false;
  stage.add(coreGroup);

  // ---- cross-section
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

  // ---- knife
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.82, -0.075);
  bladeShape.lineTo(0.94, -0.016);
  bladeShape.quadraticCurveTo(1.08, 0.014, 0.88, 0.078);
  bladeShape.lineTo(-0.82, 0.125);
  bladeShape.closePath();
  const blade = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bladeShape, { depth: 0.014, bevelEnabled: true, bevelSize: 0.007, bevelThickness: 0.005, bevelSegments: 2 }),
    steelMat
  );
  blade.castShadow = true;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.058, 0.54, 16), handleMat);
  handle.rotation.z = Math.PI / 2; handle.position.set(-1.12, 0.024, 0.007);
  const bolster = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.045, 16), steelMat);
  bolster.rotation.z = Math.PI / 2; bolster.position.set(-0.83, 0.024, 0.007);
  const knife = new THREE.Group();
  knife.add(blade, handle, bolster);
  knife.scale.setScalar(0.8);
  knife.rotation.x = -0.1;
  knife.visible = false;
  stage.add(knife);

  // ---- selection trio
  const trio = new THREE.Group();
  const trioSpecs = [
    { x: -2.5, blush: 0.42, s: 0.86, seed: 0.83, tilt: 0.14, rot: 0.6 },
    { x: 0.02, blush: 0.66, s: 0.93, seed: 0.27, tilt: -0.08, rot: 2.4 },
    { x: 2.54, blush: 0.9, s: 1.0, seed: 0.61, tilt: 0.05, rot: 4.1 },
  ];
  trioSpecs.forEach(sp => {
    const sh = makeShape(sp.seed);
    const maps = skinMaps(low ? 768 : 1024, low ? 384 : 512, sp.blush, sp.seed);
    const m = new THREE.MeshPhysicalMaterial({
      map: maps.map, bumpMap: maps.bumpMap, bumpScale: 0.3, roughnessMap: maps.roughnessMap,
      roughness: 1, metalness: 0, clearcoat: lerp(0.26, 0.4, sp.blush), clearcoatRoughness: 0.36,
      envMapIntensity: 0.58, specularIntensity: 0.6,
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

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.95;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- anchors
  const anchorDefs = [
    { id: 'center', v: new THREE.Vector3(0, 0, 0) },
    { id: 'top', v: new THREE.Vector3(0, SH.squash * 0.9, 0) },
    { id: 'edge', v: new THREE.Vector3(-1, 0, 0) },
    { id: 'skin', v: new THREE.Vector3(0.62, 0.2, 0.5) },
    { id: 'colour', v: new THREE.Vector3(0.5, 0.46, 0.5) },
    { id: 'stem', v: new THREE.Vector3(0.05, SH.squash * 0.95, 0.05) },
    { id: 'firmness', v: new THREE.Vector3(-0.6, -0.3, 0.44) },
  ];
  const anchorHosts = {};
  anchorDefs.push({ id: 'cut', v: new THREE.Vector3(0.4, 0.1, 0.1), nearest: true });
  anchorDefs.push({ id: 'flesh', v: new THREE.Vector3(-0.3, 0.3, 0.03), alwaysFront: true });
  anchorHosts.flesh = crossGroup;
  anchorDefs.push({ id: 'core', v: new THREE.Vector3(0.02, 0.05, 0.03), alwaysFront: true });
  anchorHosts.core = crossGroup;
  anchorDefs.push({ id: 'seeds', v: new THREE.Vector3(0.09, 0.02, 0.16), alwaysFront: true });
  anchorHosts.seeds = coreGroup;
  anchorDefs.push({ id: 'chamber', v: new THREE.Vector3(-0.02, 0.24, 0.02), alwaysFront: true });
  anchorHosts.chamber = coreGroup;
  const edgeAnchor = new THREE.Object3D();
  edgeAnchor.position.set(-1, 0, 0);
  stage.add(edgeAnchor);
  anchorHosts.edge = edgeAnchor;
  ['good', 'better', 'best'].forEach((id, i) => {
    anchorDefs.push({ id, v: new THREE.Vector3(0, 1.16, 0), alwaysFront: true });
    anchorHosts[id] = trio.children[i];
  });

  let drag = { x: 0, y: 0 }, dragTarget = { x: 0, y: 0 };
  let progress = 0, shown = 0, t0 = performance.now();
  let W = 1, H = 1, running = true;
  const screenPts = [], tmp = new THREE.Vector3(), hostCenter = new THREE.Vector3();

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

  function layout(p, time) {
    const cutting = ramp(p, 0.305, 0.40);      // knife passes through
    const part = ramp(p, 0.40, 0.475);         // wedges ease apart
    const fan = ramp(p, 0.455, 0.53);          // wedges lay out
    const crossIn = ramp(p, 0.545, 0.60);
    const crossOut = ramp(p, 0.655, 0.678);
    const coreIn = ramp(p, 0.672, 0.70);
    const coreOut = ramp(p, 0.80, 0.83);
    const seedOut = ramp(p, 0.70, 0.76);
    const trioIn = ramp(p, 0.845, 0.90);
    const trioOut = ramp(p, 0.925, 0.945);

    sliced.visible = p > 0.30 && p < 0.60;
    crossGroup.visible = crossIn > 0.001 && crossOut < 0.999;
    // the core stays in place through the slice, so the fruit is never hollow
    coreGroup.visible = (coreIn > 0.001 && coreOut < 0.999) || (p > 0.30 && p < 0.60);
    trio.visible = trioIn > 0.001 && trioOut < 0.999;
    wholeGroup.visible = p < 0.305 || (p >= 0.946 && true);
    knife.visible = p > 0.29 && p < 0.42;

    // knife travels down through the fruit; the wedges appear behind the blade
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

    // core and seeds drift apart, organically rather than as a diagram
    // the cut exists only in act 05; every other act shows a solid core
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

    // a buyer turning fruit in the hand: slow, never a showroom spin
    const spin = p * 1.5 + drag.x + time * 0.03;
    wholeGroup.rotation.set(0.05 + drag.y * 0.5, spin, 0.03);
    sliced.rotation.y = spin * 0.35 * (1 - fan * 0.8) + drag.x * 0.22 * fan;
    sliced.rotation.x = drag.y * 0.4;
    trio.rotation.set(drag.y * 0.18, drag.x * 0.26, 0);

    const stops = [
      { d: 5.6, y: 0.22, h: 0.30, tY: 0 },     // hero
      { d: 3.8, y: 0.28, h: 0.60, tY: 0.02 },  // inspection, macro
      { d: 5.0, y: 0.26, h: 0.20, tY: -0.04 }, // slice
      { d: 5.6, y: 0.30, h: 0.08, tY: 0 },     // wedges
      { d: 4.6, y: 0.24, h: 0.02, tY: 0.02 },  // cross-section
      { d: 0.5, y: 1.5, h: 0.04, tY: 0.02 },   // core, looking down onto the cut
      { d: 0.5, y: 1.5, h: 0.10, tY: 0.02 },   // core hold — framing persists to 0.80
      { d: 9.2, y: 0.38, h: 0.0, tY: -0.62 },  // trio in — negative target lifts the
      { d: 9.2, y: 0.38, h: 0.0, tY: -0.62 },  // trio hold  row clear of the copy
      { d: 5.6, y: 0.26, h: 0.38, tY: 0 },     // whole again
      { d: 7.0, y: 0.36, h: 0.28, tY: -0.72 }, // cta
    ];
    const marks = [0.0, 0.14, 0.32, 0.48, 0.58, 0.70, 0.80, 0.865, 0.925, 0.955, 0.98];
    let i1 = 0;
    for (let i = 0; i < marks.length - 1; i++) if (p >= marks[i]) i1 = i;
    const i2 = Math.min(i1 + 1, stops.length - 1);
    const f = smooth(clamp((p - marks[i1]) / ((marks[i2] - marks[i1]) || 1), 0, 1));
    const d = lerp(stops[i1].d, stops[i2].d, f);
    const cy = lerp(stops[i1].y, stops[i2].y, f);
    const ch = lerp(stops[i1].h, stops[i2].h, f);
    const tY = lerp(stops[i1].tY, stops[i2].tY, f);

    const wide = W / H > 1.15;
    const centered = Math.max(trioIn * (1 - trioOut), ramp(p, 0.955, 0.98), fan * 0.4);
    const fo = wide ? -7.2 * (1 - centered) : 0;
    if (Math.abs(camera.filmOffset - fo) > 0.01) { camera.filmOffset = fo; camera.updateProjectionMatrix(); }
    const dScale = wide ? 1 : lerp(1.34, 1.06, clamp((W / H - 0.55) / 0.6, 0, 1));
    const ang = ch + drag.x * 0.12 + Math.sin(time * 0.07) * 0.022;
    camera.position.set(Math.sin(ang) * d * dScale, cy + Math.sin(time * 0.11) * 0.016 + drag.y * 0.38, Math.cos(ang) * d * dScale);
    camTarget.set(0, tY + (wide ? 0 : 0.46), 0);
    camera.lookAt(camTarget);

    edgeAnchor.position.set(-(1 + 0.55 * fan), 0, 0);
    ground.material.opacity = lerp(0.3, 0.1, Math.max(fan, trioIn * (1 - trioOut) * 0.3));
    key.intensity = lerp(2.5, 3.0, trioIn * (1 - trioOut));
  }

  function collect() {
    screenPts.length = 0;
    let nearW = wedges[0], nearD = Infinity;
    for (const arm of wedges) {
      arm.updateWorldMatrix(true, false);
      hostCenter.setFromMatrixPosition(arm.matrixWorld);
      const dd = hostCenter.distanceTo(camera.position);
      if (dd < nearD) { nearD = dd; nearW = arm; }
    }
    for (const a of anchorDefs) {
      tmp.copy(a.v);
      const host = a.nearest ? nearW : (anchorHosts[a.id] || wholeGroup);
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
    setProgress, addDrag, resize,
    setExposure(v) { renderer.toneMappingExposure = v; },
    renderAt(p) {
      progress = shown = clamp(p, 0, 1);
      layout(shown, 9);
      renderer.render(scene, camera);
      onFrame(collect(), shown);
    },
    dispose() { running = false; renderer.dispose(); pmrem.dispose(); },
  };
}
