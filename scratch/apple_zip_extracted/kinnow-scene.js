// Kinnow — photoreal rebuild. Procedural geometry + painted maps, no external assets.
// Reference-driven: oblate asymmetric body, coarse oil-gland pores, matte-satin skin,
// greenish stem button in a shallow depression, thin peel that curls back over white
// pith, translucent segments, painted cross-section.
import * as THREE from 'three';

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const ramp = (p, a, b) => smooth(clamp((p - a) / (b - a), 0, 1));
const rnd = (a, b) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

/* ---------------------------------------------------------------- geometry */
// Per-fruit shape signature: low-frequency harmonics + one shallow dent, so no two
// fruits share a silhouette and none is a perfect ellipsoid.
function makeShape(seed) {
  const s = i => Math.sin(seed * (i * 12.9898) + i * 4.1) * 0.5 + 0.5;
  return {
    a1: 0.020 + 0.014 * s(1), p1: s(2) * TAU,
    a2: 0.014 + 0.012 * s(3), p2: s(4) * TAU,
    a3: 0.009 + 0.008 * s(5), p3: s(6) * TAU,
    dentAz: s(7) * TAU, dentV: 0.35 + 0.3 * s(8), dentD: 0.012 + 0.016 * s(9),
    squash: 0.83 + 0.06 * s(10),
    tilt: (s(11) - 0.5) * 0.06,
  };
}
const DEFAULT_SHAPE = makeShape(0.37);

function radiusAt(az, v, sh) {
  const dimpleTop = Math.pow(clamp((0.11 - v) / 0.11, 0, 1), 1.7) * 0.062;
  const dimpleBot = Math.pow(clamp((v - 0.89) / 0.11, 0, 1), 1.8) * 0.042;
  let r = 1 - dimpleTop - dimpleBot;
  r += sh.a1 * Math.sin(3 * az + sh.p1) * Math.sin(Math.PI * v);
  r += sh.a2 * Math.sin(2 * az + sh.p2 + v * 2.1);
  r += sh.a3 * Math.sin(5 * az + sh.p3 + v * 3.4);
  // one shallow dent, the kind a fruit picks up in a crate
  let dAz = az - sh.dentAz;
  while (dAz > Math.PI) dAz -= TAU;
  while (dAz < -Math.PI) dAz += TAU;
  const dv = v - sh.dentV;
  r -= sh.dentD * Math.exp(-(dAz * dAz * 2.4 + dv * dv * 26));
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

function fruitGeometry(segU, segV, R, sh) {
  const rows = [], uvs = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= segV; j++) {
    const row = [], uv = [];
    for (let i = 0; i <= segU; i++) {
      row.push(point((i / segU) * TAU, j / segV, R, sh, p).clone());
      uv.push([i / segU, 1 - j / segV]);
    }
    rows.push(row); uvs.push(uv);
  }
  return meshFromGrid(rows, uvs);
}

// A peel petal in TWO bands so the tip can curl back over the pith.
// Each band is returned with the pivot its parent should hinge it on.
function petalBands(halfWidth, segU, segV, rOuter, rInner, sh, splitV) {
  const p = new THREE.Vector3();
  const vTop = 0.05, vBot = 0.995;
  const bandOf = (v0, v1, pivot) => {
    const oRows = [], iRows = [], oUV = [], iUV = [];
    for (let j = 0; j <= segV; j++) {
      const v = lerp(v0, v1, j / segV);
      const oR = [], iR = [], ou = [], iu = [];
      for (let i = 0; i <= segU; i++) {
        const f = i / segU, az = lerp(-halfWidth, halfWidth, f);
        const o = point(az, v, rOuter, sh, p).clone();
        const n = point(az, v, rInner, sh, p).clone();
        o.sub(pivot); n.sub(pivot);
        oR.push(o); iR.push(n);
        const tv = lerp(v0, v1, j / segV);
        ou.push([f, 1 - tv]); iu.push([f, 1 - tv]);
      }
      oRows.push(oR); iRows.push(iR); oUV.push(ou); iUV.push(iu);
    }
    const inner = meshFromGrid(iRows.map(r => r.slice().reverse()), iUV.map(r => r.slice().reverse()));
    const edge = idx => {
      const o = [], n = [], uo = [], un = [];
      for (let j = 0; j <= segV; j++) { o.push(oRows[j][idx]); n.push(iRows[j][idx]); uo.push([0, j / segV]); un.push([1, j / segV]); }
      return { o, n, uo, un };
    };
    const e0 = edge(0), e1 = edge(segU);
    const rims = [
      meshFromGrid([e0.n, e0.o], [e0.un, e0.uo]),
      meshFromGrid([e1.o, e1.n], [e1.uo, e1.un]),
      meshFromGrid([oRows[segV], iRows[segV]], [oUV[segV], iUV[segV]]),
    ];
    return { outer: meshFromGrid(oRows, oUV), inner, rims };
  };
  const stemPivot = point(0, vTop, rOuter, sh, new THREE.Vector3()).clone();
  stemPivot.x = 0; stemPivot.z = 0;
  const splitPivot = point(0, splitV, (rOuter + rInner) / 2, sh, new THREE.Vector3()).clone();
  return {
    upper: bandOf(vTop, splitV, stemPivot),
    lower: bandOf(splitV, vBot, splitPivot),
    stemPivot, splitPivot,
  };
}

function segmentGeometry(halfWidth, segU, segV, R, sh) {
  const p = new THREE.Vector3();
  const rows = [], uvs = [];
  const vTop = 0.06, vBot = 0.95;
  for (let j = 0; j <= segV; j++) {
    const v = lerp(vTop, vBot, j / segV);
    const row = [], uv = [];
    for (let i = 0; i <= segU; i++) {
      const f = i / segU, az = lerp(-halfWidth, halfWidth, f);
      row.push(point(az, v, R, sh, p).clone());
      uv.push([f, 1 - j / segV]);
    }
    rows.push(row); uvs.push(uv);
  }
  const outer = meshFromGrid(rows, uvs);
  const side = (idx, flip) => {
    const gr = [], gu = [], steps = 10;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, row = [], uv = [];
      for (let j = 0; j <= segV; j++) {
        const edgePt = rows[j][idx];
        const axis = new THREE.Vector3(0, edgePt.y * 0.55, 0);
        row.push(axis.clone().lerp(edgePt, 0.1 + 0.9 * t));
        uv.push([t, j / segV]);
      }
      gr.push(row); gu.push(uv);
    }
    return meshFromGrid(flip ? gr.map(r => r.slice().reverse()) : gr, flip ? gu.map(r => r.slice().reverse()) : gu);
  };
  return { outer, sides: [side(0, true), side(segU, false)] };
}

// Cut face built from the BODY's own outline in the z=0 plane, so the cap always
// covers the clipped rim no matter what the shape harmonics do to the radius.
function crossFaceGeometry(sh, steps) {
  const p = new THREE.Vector3();
  const outline = [];
  for (let i = 0; i <= steps; i++) outline.push(point(0, i / steps, 1, sh, p).clone());
  for (let i = steps - 1; i >= 1; i--) outline.push(point(Math.PI, i / steps, 1, sh, p).clone());
  const P = [], U = [];
  const pad = 1.003;
  const uvOf = q => [(q.x * pad) / 2 + 0.5, (q.y * pad) / 2 + 0.5];
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
// stamps a draw call again on the far side of the canvas so the map tiles
// horizontally and the fruit shows no seam where the UV wraps
function wrapX(W, x, margin, draw) {
  draw(x);
  if (x < margin) draw(x + W);
  else if (x > W - margin) draw(x - W);
}

// ripeness 0 = paler, slightly green-shouldered; 1 = deep even orange
function rindMaps(W, H, ripeness, seed) {
  const base = cv(W, H), bump = cv(W, H), rough = cv(W, H);
  const b = base.x, bm = bump.x, rx = rough.x;
  // ground colour sampled from the references: saturated mid-orange, warmer low down
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(240, 246, ripeness) | 0},${lerp(142, 128, ripeness) | 0},${lerp(40, 26, ripeness) | 0})`);
  g.addColorStop(0.4, `rgb(${lerp(248, 253, ripeness) | 0},${lerp(142, 132, ripeness) | 0},${lerp(34, 24, ripeness) | 0})`);
  g.addColorStop(0.78, `rgb(${lerp(242, 250, ripeness) | 0},${lerp(132, 120, ripeness) | 0},${lerp(30, 20, ripeness) | 0})`);
  g.addColorStop(1, `rgb(${lerp(234, 243, ripeness) | 0},${lerp(122, 110, ripeness) | 0},${lerp(28, 18, ripeness) | 0})`);
  b.fillStyle = g; b.fillRect(0, 0, W, H);
  // green cast held around the stem on less mature fruit
  const sg = b.createLinearGradient(0, 0, 0, H * 0.22);
  sg.addColorStop(0, `rgba(154,158,52,${0.5 * (1 - ripeness) + 0.06})`);
  sg.addColorStop(1, 'rgba(154,158,52,0)');
  b.fillStyle = sg; b.fillRect(0, 0, W, H * 0.22);
  // broad uneven colour zones — real skin is never one flat orange
  for (let i = 0; i < 110; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.34);
    const pick = Math.random();
    const col = pick > 0.62 ? 'rgba(255,168,66,0.20)' : pick > 0.3 ? 'rgba(198,86,12,0.18)' : 'rgba(226,150,58,0.14)';
    wrapX(W, x, r, px => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, col);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = rg; b.beginPath(); b.arc(px, y, r, 0, 7); b.fill();
    });
  }
  bm.fillStyle = '#808080'; bm.fillRect(0, 0, W, H);
  // matte base: citrus skin is only satin, and glossier on the gland rims
  rx.fillStyle = '#b4b4b4'; rx.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.3);
    const light = Math.random() > 0.5;
    wrapX(W, x, r, px => {
      const rg = rx.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, light ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      rx.fillStyle = rg; rx.beginPath(); rx.arc(px, y, r, 0, 7); rx.fill();
    });
  }
  // oil glands — the coarse pitting that identifies the fruit at macro distance
  // Pore sprites: pre-rendered once, then stamped. Drawing tens of thousands of
  // radial gradients directly is orders of magnitude slower.
  const SP = 32, SPH = SP / 2;
  const sprite = (paint) => { const s = cv(SP, SP); paint(s.x, SPH); return s.c; };
  const pitCol = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(186,88,12,0.95)');
    g2.addColorStop(0.65, 'rgba(212,112,22,0.32)');
    g2.addColorStop(1, 'rgba(212,112,22,0)');
    x.fillStyle = g2; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
  });
  const rimCol = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(255,206,136,0.85)');
    g2.addColorStop(1, 'rgba(255,206,136,0)');
    x.fillStyle = g2; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
  });
  const pitBump = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(0,0,0,0.8)');
    g2.addColorStop(0.6, 'rgba(128,128,128,0.3)');
    g2.addColorStop(0.85, 'rgba(255,255,255,0.42)');
    g2.addColorStop(1, 'rgba(128,128,128,0)');
    x.fillStyle = g2; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
  });
  const rimBump = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(255,255,255,0.6)');
    g2.addColorStop(0.7, 'rgba(150,150,150,0.22)');
    g2.addColorStop(1, 'rgba(128,128,128,0)');
    x.fillStyle = g2; x.beginPath(); x.arc(c, c, c, 0, 7); x.fill();
  });
  const glands = Math.round(W * H / 34);
  for (let i = 0; i < glands; i++) {
    const x = rnd(0, W), y = rnd(0, H);
    const r = rnd(1.2, 2.7);
    const pit = Math.random() < 0.88;
    const aC = pit ? rnd(0.42, 0.7) : rnd(0.16, 0.32);
    const aB = rnd(0.7, 1);
    wrapX(W, x, 6, px => {
      b.globalAlpha = aC;
      b.drawImage(pit ? pitCol : rimCol, px - r, y - r, r * 2, r * 2);
      bm.globalAlpha = aB;
      bm.drawImage(pit ? pitBump : rimBump, px - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
      b.globalAlpha = 1; bm.globalAlpha = 1;
      rx.fillStyle = pit ? `rgba(255,255,255,${0.09})` : `rgba(0,0,0,${0.1})`;
      rx.beginPath(); rx.arc(px, y, r * 0.9, 0, 7); rx.fill();
    });
  }
  // fine micro-grain between the glands
  for (let i = 0; i < W * H / 900; i++) {
    const x = rnd(0, W), y = rnd(0, H);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
    bm.beginPath(); bm.arc(x, y, rnd(0.5, 1.6), 0, 7); bm.fill();
  }
  // honest marks: rub patches, a healed scar, a couple of freckles
  for (let i = 0; i < 9; i++) {
    const x = rnd(0, W), y = rnd(H * 0.12, H * 0.88), r = rnd(9, 40);
    wrapX(W, x, r, px => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, 'rgba(150,76,16,0.2)');
      rg.addColorStop(1, 'rgba(150,76,16,0)');
      b.fillStyle = rg; b.beginPath(); b.arc(px, y, r, 0, 7); b.fill();
      rx.fillStyle = 'rgba(255,255,255,0.12)';
      rx.beginPath(); rx.arc(px, y, r * 0.7, 0, 7); rx.fill();
    });
  }
  if (seed !== undefined) {
    for (let i = 0; i < 2; i++) {
      const x = rnd(0, W), y = rnd(H * 0.2, H * 0.8), r = rnd(4, 11);
      b.fillStyle = `rgba(126,66,18,${rnd(0.2, 0.4)})`;
      b.beginPath(); b.arc(x, y, r, 0, 7); b.fill();
    }
  }
  return { map: tex(base.c), bumpMap: tex(bump.c, false), roughnessMap: tex(rough.c, false) };
}

function pithMap(S) {
  const { c, x } = cv(S, S);
  x.fillStyle = '#f6ecd8'; x.fillRect(0, 0, S, S);
  // albedo pith: spongy, fibrous, faintly warm where it met the rind
  for (let i = 0; i < 3200; i++) {
    const px = rnd(0, S), py = rnd(0, S), len = rnd(4, 26);
    x.strokeStyle = `rgba(${rnd(220, 252) | 0},${rnd(204, 240) | 0},${rnd(168, 210) | 0},${rnd(0.1, 0.42)})`;
    x.lineWidth = rnd(0.6, 2.4);
    x.beginPath(); x.moveTo(px, py); x.lineTo(px + rnd(-6, 6), py + len); x.stroke();
  }
  for (let i = 0; i < 60; i++) {
    const px = rnd(0, S), py = rnd(0, S), r = rnd(18, 90);
    const rg = x.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, Math.random() > 0.5 ? 'rgba(232,204,150,0.2)' : 'rgba(255,252,244,0.22)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
  return tex(c);
}

function membraneMap(S) {
  const { c, x } = cv(S, S);
  const g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#f7b661'); g.addColorStop(0.5, '#f4a341'); g.addColorStop(1, '#ec9330');
  x.fillStyle = g; x.fillRect(0, 0, S, S);
  // pale membrane veining and the whitish ridge along each segment's back
  for (let i = 0; i < 220; i++) {
    const px = rnd(0, S);
    x.strokeStyle = `rgba(255,238,202,${rnd(0.05, 0.2)})`;
    x.lineWidth = rnd(0.6, 3);
    x.beginPath(); x.moveTo(px, 0);
    x.quadraticCurveTo(px + rnd(-20, 20), S / 2, px + rnd(-12, 12), S);
    x.stroke();
  }
  const ridge = x.createLinearGradient(S * 0.42, 0, S * 0.58, 0);
  ridge.addColorStop(0, 'rgba(255,246,224,0)');
  ridge.addColorStop(0.5, 'rgba(255,246,224,0.4)');
  ridge.addColorStop(1, 'rgba(255,246,224,0)');
  x.fillStyle = ridge; x.fillRect(S * 0.42, 0, S * 0.16, S);
  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(255,244,218,${rnd(0.04, 0.16)})`;
    x.beginPath(); x.arc(rnd(0, S), rnd(0, S), rnd(0.6, 2.4), 0, 7); x.fill();
  }
  return tex(c);
}

// cut face of a segment: juice vesicles packed in rows, fanning from the core
function vesicleMaps(S) {
  const base = cv(S, S), bump = cv(S, S);
  const b = base.x, bm = bump.x;
  b.fillStyle = '#ef9226'; b.fillRect(0, 0, S, S);
  bm.fillStyle = '#6e6e6e'; bm.fillRect(0, 0, S, S);
  const rows = Math.round(S / 13);
  for (let r = 0; r < rows; r++) {
    const y0 = (r + 0.5) * (S / rows) + rnd(-2, 2);
    let x = rnd(0, S * 0.05);
    while (x < S) {
      const u = x / S;
      const w = rnd(5, 9) * (0.55 + 0.75 * u), h = (S / rows) * rnd(0.36, 0.5);
      const y = y0 + rnd(-1.5, 1.5);
      b.save(); b.translate(x + w, y); b.rotate(rnd(-0.1, 0.1));
      const rg = b.createLinearGradient(-w, -h, w, h);
      rg.addColorStop(0, `rgba(255,216,146,${rnd(0.72, 0.95)})`);
      rg.addColorStop(0.6, `rgba(247,166,52,${rnd(0.6, 0.85)})`);
      rg.addColorStop(1, `rgba(198,102,16,${rnd(0.5, 0.75)})`);
      b.fillStyle = rg;
      b.beginPath(); b.ellipse(0, 0, w, h, 0, 0, 7); b.fill();
      b.strokeStyle = 'rgba(152,72,10,0.32)'; b.lineWidth = 0.9;
      b.beginPath(); b.ellipse(0, 0, w, h, 0, 0, 7); b.stroke();
      b.restore();
      bm.save(); bm.translate(x + w, y);
      const bg = bm.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h));
      bg.addColorStop(0, 'rgba(255,255,255,0.95)');
      bg.addColorStop(0.75, 'rgba(120,120,120,0.5)');
      bg.addColorStop(1, 'rgba(0,0,0,0.85)');
      bm.fillStyle = bg;
      bm.beginPath(); bm.ellipse(0, 0, w, h, 0, 0, 7); bm.fill();
      bm.restore();
      x += w * rnd(1.5, 1.9);
    }
  }
  const cg = b.createLinearGradient(0, 0, S * 0.1, 0);
  cg.addColorStop(0, 'rgba(252,240,210,0.9)'); cg.addColorStop(1, 'rgba(252,240,210,0)');
  b.fillStyle = cg; b.fillRect(0, 0, S * 0.1, S);
  return { map: tex(base.c, true, false), bumpMap: tex(bump.c, false, false) };
}

// Painted cross-section: ten wedges, pale membranes, central core, seeds, moisture.
function crossSectionMaps(S, NS) {
  const base = cv(S, S), bump = cv(S, S);
  const b = base.x, bm = bump.x;
  b.clearRect(0, 0, S, S); bm.clearRect(0, 0, S, S);
  const C = S / 2, Rout = S * 0.5;
  const rRind = Rout * 0.985, rPith = Rout * 0.945, rFlesh = Rout * 0.915, rCore = Rout * 0.075;
  bm.fillStyle = '#7a7a7a'; bm.beginPath(); bm.arc(C, C, Rout, 0, 7); bm.fill();
  // rind ring
  b.beginPath(); b.arc(C, C, rRind, 0, 7); b.fillStyle = '#e8760f'; b.fill();
  // pith ring
  b.beginPath(); b.arc(C, C, rPith, 0, 7); b.fillStyle = '#f8f0dd'; b.fill();
  const seedWedges = [1, 4, 7];
  for (let i = 0; i < NS; i++) {
    const a0 = (i / NS) * TAU + 0.012, a1 = ((i + 1) / NS) * TAU - 0.012;
    // flesh wedge
    b.beginPath();
    b.moveTo(C + Math.cos(a0) * rCore, C + Math.sin(a0) * rCore);
    b.lineTo(C + Math.cos(a0) * rFlesh, C + Math.sin(a0) * rFlesh);
    b.arc(C, C, rFlesh, a0, a1);
    b.lineTo(C + Math.cos(a1) * rCore, C + Math.sin(a1) * rCore);
    b.arc(C, C, rCore, a1, a0, true);
    b.closePath();
    const am = (a0 + a1) / 2;
    const gg = b.createLinearGradient(C + Math.cos(am) * rCore, C + Math.sin(am) * rCore, C + Math.cos(am) * rFlesh, C + Math.sin(am) * rFlesh);
    gg.addColorStop(0, '#fac36b');
    gg.addColorStop(0.45, '#f4a03a');
    gg.addColorStop(1, '#e5871f');
    b.fillStyle = gg; b.fill();
    // vesicles inside the wedge, fanning outward
    b.save(); b.clip();
    for (let k = 0; k < 460; k++) {
      const t = Math.pow(Math.random(), 0.6);
      const rr = lerp(rCore * 1.1, rFlesh * 0.99, t);
      const aa = lerp(a0, a1, Math.random());
      const x = C + Math.cos(aa) * rr, y = C + Math.sin(aa) * rr;
      const w = lerp(1.6, 4.6, t), h = lerp(1.2, 2.6, t);
      b.save(); b.translate(x, y); b.rotate(aa);
      const vg = b.createLinearGradient(-w, 0, w, 0);
      vg.addColorStop(0, `rgba(255,222,158,${rnd(0.3, 0.7)})`);
      vg.addColorStop(1, `rgba(214,124,26,${rnd(0.2, 0.5)})`);
      b.fillStyle = vg;
      b.beginPath(); b.ellipse(0, 0, w, h, 0, 0, 7); b.fill();
      b.restore();
      bm.save(); bm.translate(x, y); bm.rotate(aa);
      bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
      bm.beginPath(); bm.ellipse(0, 0, w, h, 0, 0, 7); bm.fill();
      bm.restore();
    }
    // seeds sit in only some wedges, near the core
    if (seedWedges.indexOf(i) !== -1) {
      const rr = rCore + (rFlesh - rCore) * 0.24;
      const x = C + Math.cos(am) * rr, y = C + Math.sin(am) * rr;
      b.save(); b.translate(x, y); b.rotate(am);
      const sgd = b.createLinearGradient(-rFlesh * 0.06, 0, rFlesh * 0.06, 0);
      sgd.addColorStop(0, '#fffaee'); sgd.addColorStop(1, '#e2d3ae');
      b.fillStyle = sgd;
      b.beginPath(); b.ellipse(0, 0, rFlesh * 0.075, rFlesh * 0.042, 0, 0, 7); b.fill();
      b.strokeStyle = 'rgba(180,158,110,0.6)'; b.lineWidth = 1.1; b.stroke();
      b.restore();
      bm.save(); bm.translate(x, y); bm.rotate(am);
      bm.fillStyle = 'rgba(255,255,255,0.9)';
      bm.beginPath(); bm.ellipse(0, 0, rFlesh * 0.075, rFlesh * 0.042, 0, 0, 7); bm.fill();
      bm.restore();
    }
    b.restore();
    // membrane wall on the wedge boundary
    b.strokeStyle = 'rgba(252,244,224,0.5)'; b.lineWidth = S * 0.0022;
    b.beginPath();
    b.moveTo(C + Math.cos(a0) * rCore, C + Math.sin(a0) * rCore);
    b.lineTo(C + Math.cos(a0) * rFlesh, C + Math.sin(a0) * rFlesh);
    b.stroke();
    bm.strokeStyle = 'rgba(255,255,255,0.6)'; bm.lineWidth = S * 0.0032;
    bm.beginPath();
    bm.moveTo(C + Math.cos(a0) * rCore, C + Math.sin(a0) * rCore);
    bm.lineTo(C + Math.cos(a0) * rFlesh, C + Math.sin(a0) * rFlesh);
    bm.stroke();
  }
  // central core
  const cg = b.createRadialGradient(C, C, 0, C, C, rCore);
  cg.addColorStop(0, '#fffaec'); cg.addColorStop(1, '#eee0c0');
  b.fillStyle = cg; b.beginPath(); b.arc(C, C, rCore, 0, 7); b.fill();
  // moisture: fine glints across the whole face
  const vg2 = b.createRadialGradient(C, C, rFlesh * 0.45, C, C, rFlesh);
  vg2.addColorStop(0, 'rgba(120,54,4,0)');
  vg2.addColorStop(1, 'rgba(120,54,4,0.22)');
  b.fillStyle = vg2; b.beginPath(); b.arc(C, C, rFlesh, 0, 7); b.fill();
  for (let i = 0; i < 1400; i++) {
    const aa = rnd(0, TAU), rr = Math.sqrt(Math.random()) * rFlesh;
    b.fillStyle = `rgba(255,252,236,${rnd(0.05, 0.26)})`;
    b.beginPath(); b.arc(C + Math.cos(aa) * rr, C + Math.sin(aa) * rr, rnd(0.5, 1.7), 0, 7); b.fill();
  }
  return { map: tex(base.c, true, false), bumpMap: tex(bump.c, false, false) };
}

// Soft-box studio: broad low-contrast sources, no hard specular pinpoints.
function envTexture() {
  const { c, x } = cv(1024, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#7a6e5c'); g.addColorStop(0.4, '#2e2823');
  g.addColorStop(0.62, '#15110e'); g.addColorStop(1, '#0b0908');
  x.fillStyle = g; x.fillRect(0, 0, 1024, 512);
  const soft = (cx, cy, r, col, a) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, col.replace('A', a));
    rg.addColorStop(0.5, col.replace('A', a * 0.4));
    rg.addColorStop(1, col.replace('A', 0));
    x.fillStyle = rg; x.fillRect(0, 0, 1024, 512);
  };
  soft(300, 110, 560, 'rgba(255,244,224,A)', 0.95);
  soft(760, 170, 420, 'rgba(206,220,236,A)', 0.4);
  soft(520, 430, 380, 'rgba(150,110,70,A)', 0.3);
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------- scene */
export function createExperience(canvas, opts = {}) {
  const low = !!opts.low;
  const onFrame = opts.onFrame || (() => {});
  const NP = 6, NS = 10, SPLIT = 0.56;
  const segU = low ? 32 : 46, segV = low ? 26 : 40;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromEquirectangular(envTexture()).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
  const camTarget = new THREE.Vector3();

  // soft key + broad bounce; nothing hard enough to read as plastic
  const key = new THREE.DirectionalLight(0xfff2dc, 2.35);
  key.position.set(2.4, 3.9, 3.0);
  key.castShadow = true;
  key.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
  key.shadow.camera.near = 1; key.shadow.camera.far = 26;
  key.shadow.camera.left = -5.5; key.shadow.camera.right = 5.5;
  key.shadow.camera.top = 5.5; key.shadow.camera.bottom = -5.5;
  key.shadow.bias = -0.0015; key.shadow.radius = 8;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc6d6e8, 0.42);
  fill.position.set(-3.4, 1.0, -1.4); scene.add(fill);
  const front = new THREE.DirectionalLight(0xffe2b8, 0.6);
  front.position.set(0.4, 0.5, 4.2); scene.add(front);
  const bounce = new THREE.DirectionalLight(0xffd9a8, 0.3);
  bounce.position.set(0.2, -2.6, 1.4); scene.add(bounce);
  scene.add(new THREE.HemisphereLight(0x6e5c46, 0x120e0b, 0.3));

  const TW = low ? 1024 : 2048, TH = low ? 512 : 1024;
  const rm = rindMaps(TW, TH, 0.72);
  const pith = pithMap(low ? 512 : 1024);
  const memb = membraneMap(low ? 512 : 1024);
  const ves = vesicleMaps(low ? 512 : 1024);
  const cross = crossSectionMaps(low ? 768 : 1280, NS);

  const rindMat = new THREE.MeshPhysicalMaterial({
    map: rm.map, bumpMap: rm.bumpMap, bumpScale: 1.55, roughnessMap: rm.roughnessMap,
    roughness: 1, metalness: 0, clearcoat: 0.10, clearcoatRoughness: 0.85,
    sheen: 0.22, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xffcf96),
    envMapIntensity: 0.5, specularIntensity: 0.5,
  });
  const pithMat = new THREE.MeshStandardMaterial({ color: 0xfdf7e8, map: pith, roughness: 1, metalness: 0, envMapIntensity: 0.22, side: THREE.DoubleSide });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xf5e8cc, roughness: 0.95, metalness: 0, side: THREE.DoubleSide });
  const membMat = new THREE.MeshPhysicalMaterial({
    map: memb, roughness: 0.46, metalness: 0, clearcoat: 0.2, clearcoatRoughness: 0.4,
    envMapIntensity: 0.45, sheen: 0.3, sheenColor: new THREE.Color(0xffe0a8),
    transmission: low ? 0 : 0.22, thickness: 0.5, ior: 1.36, side: THREE.DoubleSide,
  });
  const vesMat = new THREE.MeshPhysicalMaterial({
    map: ves.map, bumpMap: ves.bumpMap, bumpScale: 1.6, roughness: 0.36, metalness: 0,
    clearcoat: 0.32, clearcoatRoughness: 0.3, envMapIntensity: 0.4,
    transmission: low ? 0 : 0.16, thickness: 0.35, ior: 1.36, side: THREE.DoubleSide,
  });
  const crossMat = new THREE.MeshPhysicalMaterial({
    map: cross.map, bumpMap: cross.bumpMap, bumpScale: 1.1, roughness: 0.34, metalness: 0,
    clearcoat: 0.4, clearcoatRoughness: 0.22, envMapIntensity: 0.45,
    transparent: true, side: THREE.DoubleSide,
  });
  const seedMat = new THREE.MeshStandardMaterial({ color: 0xf3e9cf, roughness: 0.62, metalness: 0 });
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x717c36, roughness: 0.9, metalness: 0 });

  const stage = new THREE.Group();
  scene.add(stage);

  const SH = DEFAULT_SHAPE;
  const wholeGeo = fruitGeometry(low ? 100 : 168, low ? 66 : 110, 1, SH);

  const makeButton = () => {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.062, 0.028, 16), stemMat);
    const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, 0.05, 12), stemMat);
    nub.position.y = 0.03;
    g.add(disc, nub);
    g.position.set(0, SH.squash * 0.93, 0);
    return g;
  };

  const whole = new THREE.Mesh(wholeGeo, rindMat);
  whole.castShadow = whole.receiveShadow = true;
  const wholeGroup = new THREE.Group();
  wholeGroup.add(whole, makeButton());
  stage.add(wholeGroup);

  // ---- peel: two-band petals that curl back off the flesh
  const petalHalf = (Math.PI / NP) * 0.985;
  const pb = petalBands(petalHalf, segU, segV, 1, 0.945, SH, SPLIT);
  const peel = new THREE.Group();
  const petals = [];
  for (let i = 0; i < NP; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / NP) * TAU;
    const hinge = new THREE.Group();
    hinge.position.copy(pb.stemPivot);
    const upper = new THREE.Group();
    const uo = new THREE.Mesh(pb.upper.outer, rindMat);
    uo.castShadow = true;
    upper.add(uo, new THREE.Mesh(pb.upper.inner, pithMat));
    pb.upper.rims.forEach(r => upper.add(new THREE.Mesh(r, rimMat)));
    // tip band hinges on the split ring so it can curl independently
    const tip = new THREE.Group();
    tip.position.copy(pb.splitPivot).sub(pb.stemPivot);
    const to = new THREE.Mesh(pb.lower.outer, rindMat);
    to.castShadow = true;
    tip.add(to, new THREE.Mesh(pb.lower.inner, pithMat));
    pb.lower.rims.forEach(r => tip.add(new THREE.Mesh(r, rimMat)));
    upper.add(tip);
    hinge.add(upper);
    yaw.add(hinge);
    peel.add(yaw);
    petals.push({ hinge, tip });
  }
  peel.visible = false;
  stage.add(peel);

  // ---- flesh segments
  const segHalf = (Math.PI / NS) * 0.80;
  const sg = segmentGeometry(segHalf, low ? 18 : 26, low ? 34 : 48, 0.80, SH);
  const flesh = new THREE.Group();
  const segs = [];
  for (let i = 0; i < NS; i++) {
    const yaw = new THREE.Group();
    yaw.rotation.y = (i / NS) * TAU;
    const arm = new THREE.Group();
    const o = new THREE.Mesh(sg.outer, membMat);
    o.castShadow = true;
    arm.add(o);
    sg.sides.forEach(s => arm.add(new THREE.Mesh(s, vesMat)));
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

  // ---- cross-section: clipped half fruit with a painted cut face
  const crossPlane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0.001);
  const crossRind = rindMat.clone();
  crossRind.clippingPlanes = [crossPlane];
  const crossGroup = new THREE.Group();
  const crossShell = new THREE.Mesh(wholeGeo, crossRind);
  crossShell.castShadow = crossShell.receiveShadow = true;
  const face = new THREE.Mesh(crossFaceGeometry(SH, low ? 48 : 80), crossMat);
  face.position.z = 0.004;
  crossGroup.add(crossShell, face);
  crossGroup.visible = false;
  stage.add(crossGroup);

  // ---- selection trio: three genuinely different fruits
  const trio = new THREE.Group();
  const trioSpecs = [
    { x: -2.52, ripe: 0.6, s: 0.86, seed: 0.71, tilt: 0.16, rot: 0.7 },
    { x: 0.02, ripe: 0.78, s: 0.93, seed: 0.19, tilt: -0.1, rot: 2.1 },
    { x: 2.56, ripe: 0.95, s: 1.0, seed: 0.53, tilt: 0.05, rot: 4.2 },
  ];
  trioSpecs.forEach(sp => {
    const sh = makeShape(sp.seed);
    const maps = rindMaps(low ? 768 : 1024, low ? 384 : 512, sp.ripe, sp.seed);
    const m = new THREE.MeshPhysicalMaterial({
      map: maps.map, bumpMap: maps.bumpMap, bumpScale: 1.45, roughnessMap: maps.roughnessMap,
      roughness: 1, metalness: 0, clearcoat: lerp(0.05, 0.12, sp.ripe), clearcoatRoughness: 0.85,
      sheen: 0.2, sheenRoughness: 0.8, sheenColor: new THREE.Color(0xffcf96),
      envMapIntensity: 0.48, specularIntensity: 0.5,
    });
    const mesh = new THREE.Mesh(fruitGeometry(low ? 72 : 120, low ? 48 : 78, 1, sh), m);
    mesh.castShadow = mesh.receiveShadow = true;
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.026, 14), stemMat);
    btn.position.set(0, sh.squash * 0.93, 0);
    const gp = new THREE.Group();
    gp.add(mesh, btn);
    gp.position.set(sp.x, 0, 0);
    gp.scale.setScalar(sp.s);
    gp.rotation.set(sp.tilt, sp.rot, sp.tilt * 0.5);
    trio.add(gp);
  });
  trio.visible = false;
  stage.add(trio);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), new THREE.ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.86;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---- anchors
  const anchorDefs = [
    { id: 'center', v: new THREE.Vector3(0, 0, 0) },
    { id: 'top', v: new THREE.Vector3(0, SH.squash, 0) },
    { id: 'edge', v: new THREE.Vector3(-1, 0, 0) },
    { id: 'colour', v: new THREE.Vector3(0.6, 0.4, 0.5) },
    { id: 'button', v: new THREE.Vector3(0.05, SH.squash * 0.95, 0.05) },
    { id: 'weight', v: new THREE.Vector3(-0.64, -0.28, 0.42) },
    { id: 'give', v: new THREE.Vector3(0.48, -0.5, 0.48) },
  ];
  const anchorHosts = {};
  anchorDefs.push({ id: 'rind', v: new THREE.Vector3(0, -0.28, 0.42) });
  anchorHosts.rind = petals[0].tip;
  anchorDefs.push({ id: 'membrane', v: new THREE.Vector3(0.42, 0.34, 0.34), nearest: true });
  anchorDefs.push({ id: 'juice', v: new THREE.Vector3(0.30, 0.02, 0.30), nearest: true });
  anchorDefs.push({ id: 'seeds', v: new THREE.Vector3(0.2, 0.12, 0), alwaysFront: true });
  anchorHosts.seeds = segs[0];
  anchorDefs.push({ id: 'core', v: new THREE.Vector3(0.02, 0.04, 0.02), alwaysFront: true });
  anchorHosts.core = crossGroup;
  const edgeAnchor = new THREE.Object3D();
  edgeAnchor.position.set(-1, 0, 0);
  stage.add(edgeAnchor);
  anchorHosts.edge = edgeAnchor;
  ['good', 'better', 'best'].forEach((id, i) => {
    anchorDefs.push({ id, v: new THREE.Vector3(0, 1.06, 0), alwaysFront: true });
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

    // rind: hinge opens, then the tip curls back over the pith, then it sinks away
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
      if (arm.userData.seed) arm.userData.seed.visible = single > 0.2;
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

    // macro-leaning camera: close on the skin during inspection, wide only for the row
    const stops = [
      { d: 5.8, y: 0.24, h: 0.30, tY: 0 },     // hero
      { d: 3.9, y: 0.30, h: 0.62, tY: 0.02 },  // inspection, close enough to read pores
      { d: 5.0, y: 0.28, h: 0.24, tY: -0.05 }, // peel
      { d: 5.2, y: 0.32, h: 0.10, tY: 0 },     // segments
      { d: 3.5, y: 0.22, h: 0.03, tY: 0.02 },  // cross-section, macro
      { d: 9.4, y: 0.40, h: 0.0, tY: 0.02 },   // trio in
      { d: 9.4, y: 0.40, h: 0.0, tY: 0.02 },   // trio hold
      { d: 5.4, y: 0.28, h: 0.40, tY: 0 },     // rejoin
      { d: 7.0, y: 0.38, h: 0.30, tY: -0.72 }, // cta
    ];
    const marks = [0.0, 0.14, 0.32, 0.50, 0.60, 0.70, 0.845, 0.90, 0.95];
    let i1 = 0;
    for (let i = 0; i < marks.length - 1; i++) if (p >= marks[i]) i1 = i;
    const i2 = Math.min(i1 + 1, stops.length - 1);
    const f = smooth(clamp((p - marks[i1]) / ((marks[i2] - marks[i1]) || 1), 0, 1));
    const d = lerp(stops[i1].d, stops[i2].d, f);
    const cy = lerp(stops[i1].y, stops[i2].y, f);
    const ch = lerp(stops[i1].h, stops[i2].h, f);
    const tY = lerp(stops[i1].tY, stops[i2].tY, f);

    const wide = W / H > 1.15;
    const centered = Math.max(trioIn * (1 - trioOut), ramp(p, 0.90, 0.95), fan * 0.4);
    const fo = wide ? -7.2 * (1 - centered) : 0;
    if (Math.abs(camera.filmOffset - fo) > 0.01) { camera.filmOffset = fo; camera.updateProjectionMatrix(); }
    const dScale = wide ? 1 : lerp(1.34, 1.06, clamp((W / H - 0.55) / 0.6, 0, 1));
    const ang = ch + drag.x * 0.14 + Math.sin(time * 0.08) * 0.025;
    camera.position.set(Math.sin(ang) * d * dScale, cy + Math.sin(time * 0.12) * 0.018 + drag.y * 0.4, Math.cos(ang) * d * dScale);
    camTarget.set(0, tY + (wide ? 0 : 0.46), 0);
    camera.lookAt(camTarget);

    const openWidth = 1 + 0.72 * Math.max(open, shed) * (peel.visible ? 1 : 0);
    edgeAnchor.position.set(-openWidth, 0, 0);
    ground.material.opacity = lerp(0.3, 0.1, Math.max(fan, trioIn * (1 - trioOut) * 0.3));
    key.intensity = lerp(2.35, 2.95, trioIn * (1 - trioOut));
    front.intensity = lerp(0.6, 0.95, trioIn * (1 - trioOut));
  }

  function collect() {
    screenPts.length = 0;
    let nearSeg = segs[0], nearD = Infinity;
    for (const arm of segs) {
      arm.updateWorldMatrix(true, false);
      hostCenter.setFromMatrixPosition(arm.matrixWorld);
      const dd = hostCenter.distanceTo(camera.position);
      if (dd < nearD) { nearD = dd; nearSeg = arm; }
    }
    for (const a of anchorDefs) {
      tmp.copy(a.v);
      const host = a.nearest ? nearSeg : (anchorHosts[a.id] || wholeGroup);
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
