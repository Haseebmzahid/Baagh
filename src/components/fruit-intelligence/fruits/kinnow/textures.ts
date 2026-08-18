import * as THREE from 'three';
import { lerp, rnd } from '../../core/mathUtils';

const TAU = Math.PI * 2;

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function createTexture(canvas: HTMLCanvasElement, srgb: boolean = true, rep: boolean = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  return t;
}

function wrapX(W: number, x: number, margin: number, draw: (px: number) => void): void {
  draw(x);
  if (x < margin) draw(x + W);
  else if (x > W - margin) draw(x - W);
}

// ripeness 0 = paler, slightly green-shouldered; 1 = deep even orange
export function createRindMaps(
  W: number,
  H: number,
  ripeness: number = 0.72,
  seed?: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const base = createCanvas(W, H);
  const bump = createCanvas(W, H);
  const rough = createCanvas(W, H);
  const b = base.ctx, bm = bump.ctx, rx = rough.ctx;

  // ground colour: saturated mid-orange, warmer low down
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(240, 246, ripeness) | 0},${lerp(142, 128, ripeness) | 0},${lerp(40, 26, ripeness) | 0})`);
  g.addColorStop(0.4, `rgb(${lerp(248, 253, ripeness) | 0},${lerp(142, 132, ripeness) | 0},${lerp(34, 24, ripeness) | 0})`);
  g.addColorStop(0.78, `rgb(${lerp(242, 250, ripeness) | 0},${lerp(132, 120, ripeness) | 0},${lerp(30, 20, ripeness) | 0})`);
  g.addColorStop(1, `rgb(${lerp(234, 243, ripeness) | 0},${lerp(122, 110, ripeness) | 0},${lerp(28, 18, ripeness) | 0})`);
  b.fillStyle = g;
  b.fillRect(0, 0, W, H);

  // green cast held around stem on less mature fruit
  const sg = b.createLinearGradient(0, 0, 0, H * 0.22);
  sg.addColorStop(0, `rgba(154,158,52,${0.5 * (1 - ripeness) + 0.06})`);
  sg.addColorStop(1, 'rgba(154,158,52,0)');
  b.fillStyle = sg;
  b.fillRect(0, 0, W, H * 0.22);

  // broad uneven colour zones
  for (let i = 0; i < 110; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.34);
    const pick = Math.random();
    const col = pick > 0.62 ? 'rgba(255,168,66,0.20)' : pick > 0.3 ? 'rgba(198,86,12,0.18)' : 'rgba(226,150,58,0.14)';
    wrapX(W, x, r, (px) => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, col);
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      b.fillStyle = rg;
      b.beginPath();
      b.arc(px, y, r, 0, 7);
      b.fill();
    });
  }

  bm.fillStyle = '#808080';
  bm.fillRect(0, 0, W, H);

  // matte base: citrus skin is satin, glossier on gland rims
  rx.fillStyle = '#b4b4b4';
  rx.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.3);
    const light = Math.random() > 0.5;
    wrapX(W, x, r, (px) => {
      const rg = rx.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, light ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      rx.fillStyle = rg;
      rx.beginPath();
      rx.arc(px, y, r, 0, 7);
      rx.fill();
    });
  }

  // Pre-rendered pore sprites for massive draw call performance speedup
  const SP = 32, SPH = SP / 2;
  const createSprite = (paint: (x: CanvasRenderingContext2D, c: number) => void) => {
    const s = createCanvas(SP, SP);
    paint(s.ctx, SPH);
    return s.canvas;
  };

  const pitCol = createSprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(186,88,12,0.95)');
    g2.addColorStop(0.65, 'rgba(212,112,22,0.32)');
    g2.addColorStop(1, 'rgba(212,112,22,0)');
    x.fillStyle = g2;
    x.beginPath();
    x.arc(c, c, c, 0, 7);
    x.fill();
  });

  const rimCol = createSprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(255,206,136,0.85)');
    g2.addColorStop(1, 'rgba(255,206,136,0)');
    x.fillStyle = g2;
    x.beginPath();
    x.arc(c, c, c, 0, 7);
    x.fill();
  });

  const pitBump = createSprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(0,0,0,0.8)');
    g2.addColorStop(0.6, 'rgba(128,128,128,0.3)');
    g2.addColorStop(0.85, 'rgba(255,255,255,0.42)');
    g2.addColorStop(1, 'rgba(128,128,128,0)');
    x.fillStyle = g2;
    x.beginPath();
    x.arc(c, c, c, 0, 7);
    x.fill();
  });

  const rimBump = createSprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(255,255,255,0.6)');
    g2.addColorStop(0.7, 'rgba(150,150,150,0.22)');
    g2.addColorStop(1, 'rgba(128,128,128,0)');
    x.fillStyle = g2;
    x.beginPath();
    x.arc(c, c, c, 0, 7);
    x.fill();
  });

  const glands = Math.round((W * H) / 34);
  for (let i = 0; i < glands; i++) {
    const x = rnd(0, W), y = rnd(0, H);
    const r = rnd(1.2, 2.7);
    const pit = Math.random() < 0.88;
    const aC = pit ? rnd(0.42, 0.7) : rnd(0.16, 0.32);
    const aB = rnd(0.7, 1);
    wrapX(W, x, 6, (px) => {
      b.globalAlpha = aC;
      b.drawImage(pit ? pitCol : rimCol, px - r, y - r, r * 2, r * 2);
      bm.globalAlpha = aB;
      bm.drawImage(pit ? pitBump : rimBump, px - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
      b.globalAlpha = 1;
      bm.globalAlpha = 1;
      rx.fillStyle = pit ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
      rx.beginPath();
      rx.arc(px, y, r * 0.9, 0, 7);
      rx.fill();
    });
  }

  // micro-grain between glands
  for (let i = 0; i < (W * H) / 900; i++) {
    const x = rnd(0, W), y = rnd(0, H);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
    bm.beginPath();
    bm.arc(x, y, rnd(0.5, 1.6), 0, 7);
    bm.fill();
  }

  // honest marks: rub patches, healed scar, freckles
  for (let i = 0; i < 9; i++) {
    const x = rnd(0, W), y = rnd(H * 0.12, H * 0.88), r = rnd(9, 40);
    wrapX(W, x, r, (px) => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, 'rgba(150,76,16,0.2)');
      rg.addColorStop(1, 'rgba(150,76,16,0)');
      b.fillStyle = rg;
      b.beginPath();
      b.arc(px, y, r, 0, 7);
      b.fill();
      rx.fillStyle = 'rgba(255,255,255,0.12)';
      rx.beginPath();
      rx.arc(px, y, r * 0.7, 0, 7);
      rx.fill();
    });
  }

  if (seed !== undefined) {
    for (let i = 0; i < 2; i++) {
      const x = rnd(0, W), y = rnd(H * 0.2, H * 0.8), r = rnd(4, 11);
      b.fillStyle = `rgba(126,66,18,${rnd(0.2, 0.4)})`;
      b.beginPath();
      b.arc(x, y, r, 0, 7);
      b.fill();
    }
  }

  return {
    map: createTexture(base.canvas),
    bumpMap: createTexture(bump.canvas, false),
    roughnessMap: createTexture(rough.canvas, false),
  };
}

export function createPithMap(S: number): THREE.CanvasTexture {
  const { canvas, ctx: x } = createCanvas(S, S);
  x.fillStyle = '#f6ecd8';
  x.fillRect(0, 0, S, S);

  // albedo pith: spongy, fibrous, warm where it met rind
  for (let i = 0; i < 3200; i++) {
    const px = rnd(0, S), py = rnd(0, S), len = rnd(4, 26);
    x.strokeStyle = `rgba(${rnd(220, 252) | 0},${rnd(204, 240) | 0},${rnd(168, 210) | 0},${rnd(0.1, 0.42)})`;
    x.lineWidth = rnd(0.6, 2.4);
    x.beginPath();
    x.moveTo(px, py);
    x.lineTo(px + rnd(-6, 6), py + len);
    x.stroke();
  }
  for (let i = 0; i < 60; i++) {
    const px = rnd(0, S), py = rnd(0, S), r = rnd(18, 90);
    const rg = x.createRadialGradient(px, py, 0, px, py, r);
    rg.addColorStop(0, Math.random() > 0.5 ? 'rgba(232,204,150,0.2)' : 'rgba(255,252,244,0.22)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = rg;
    x.beginPath();
    x.arc(px, py, r, 0, 7);
    x.fill();
  }
  return createTexture(canvas);
}

export function createMembraneMap(S: number): THREE.CanvasTexture {
  const { canvas, ctx: x } = createCanvas(S, S);
  const g = x.createLinearGradient(0, 0, 0, S);
  g.addColorStop(0, '#f7b661');
  g.addColorStop(0.5, '#f4a341');
  g.addColorStop(1, '#ec9330');
  x.fillStyle = g;
  x.fillRect(0, 0, S, S);

  // pale membrane veining and whitish ridge
  for (let i = 0; i < 220; i++) {
    const px = rnd(0, S);
    x.strokeStyle = `rgba(255,238,202,${rnd(0.05, 0.2)})`;
    x.lineWidth = rnd(0.6, 3);
    x.beginPath();
    x.moveTo(px, 0);
    x.quadraticCurveTo(px + rnd(-20, 20), S / 2, px + rnd(-12, 12), S);
    x.stroke();
  }
  const ridge = x.createLinearGradient(S * 0.42, 0, S * 0.58, 0);
  ridge.addColorStop(0, 'rgba(255,246,224,0)');
  ridge.addColorStop(0.5, 'rgba(255,246,224,0.4)');
  ridge.addColorStop(1, 'rgba(255,246,224,0)');
  x.fillStyle = ridge;
  x.fillRect(S * 0.42, 0, S * 0.16, S);

  for (let i = 0; i < 900; i++) {
    x.fillStyle = `rgba(255,244,218,${rnd(0.04, 0.16)})`;
    x.beginPath();
    x.arc(rnd(0, S), rnd(0, S), rnd(0.6, 2.4), 0, 7);
    x.fill();
  }
  return createTexture(canvas);
}

export function createVesicleMaps(S: number): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = createCanvas(S, S);
  const bump = createCanvas(S, S);
  const b = base.ctx, bm = bump.ctx;

  b.fillStyle = '#ef9226';
  b.fillRect(0, 0, S, S);
  bm.fillStyle = '#6e6e6e';
  bm.fillRect(0, 0, S, S);

  const rows = Math.round(S / 13);
  for (let r = 0; r < rows; r++) {
    const y0 = (r + 0.5) * (S / rows) + rnd(-2, 2);
    let x = rnd(0, S * 0.05);
    while (x < S) {
      const u = x / S;
      const w = rnd(5, 9) * (0.55 + 0.75 * u);
      const h = (S / rows) * rnd(0.36, 0.5);
      const y = y0 + rnd(-1.5, 1.5);

      b.save();
      b.translate(x + w, y);
      b.rotate(rnd(-0.1, 0.1));
      const rg = b.createLinearGradient(-w, -h, w, h);
      rg.addColorStop(0, `rgba(255,216,146,${rnd(0.72, 0.95)})`);
      rg.addColorStop(0.6, `rgba(247,166,52,${rnd(0.6, 0.85)})`);
      rg.addColorStop(1, `rgba(198,102,16,${rnd(0.5, 0.75)})`);
      b.fillStyle = rg;
      b.beginPath();
      b.ellipse(0, 0, w, h, 0, 0, 7);
      b.fill();
      b.strokeStyle = 'rgba(152,72,10,0.32)';
      b.lineWidth = 0.9;
      b.beginPath();
      b.ellipse(0, 0, w, h, 0, 0, 7);
      b.stroke();
      b.restore();

      bm.save();
      bm.translate(x + w, y);
      const bg = bm.createRadialGradient(0, 0, 0, 0, 0, Math.max(w, h));
      bg.addColorStop(0, 'rgba(255,255,255,0.95)');
      bg.addColorStop(0.75, 'rgba(120,120,120,0.5)');
      bg.addColorStop(1, 'rgba(0,0,0,0.85)');
      bm.fillStyle = bg;
      bm.beginPath();
      bm.ellipse(0, 0, w, h, 0, 0, 7);
      bm.fill();
      bm.restore();

      x += w * rnd(1.5, 1.9);
    }
  }

  const cg = b.createLinearGradient(0, 0, S * 0.1, 0);
  cg.addColorStop(0, 'rgba(252,240,210,0.9)');
  cg.addColorStop(1, 'rgba(252,240,210,0)');
  b.fillStyle = cg;
  b.fillRect(0, 0, S * 0.1, S);

  return {
    map: createTexture(base.canvas, true, false),
    bumpMap: createTexture(bump.canvas, false, false),
  };
}

export function createCrossSectionMaps(
  S: number,
  NS: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = createCanvas(S, S);
  const bump = createCanvas(S, S);
  const b = base.ctx, bm = bump.ctx;

  b.clearRect(0, 0, S, S);
  bm.clearRect(0, 0, S, S);

  const C = S / 2, Rout = S * 0.5;
  const rRind = Rout * 0.985, rPith = Rout * 0.945, rFlesh = Rout * 0.915, rCore = Rout * 0.075;

  bm.fillStyle = '#7a7a7a';
  bm.beginPath();
  bm.arc(C, C, Rout, 0, 7);
  bm.fill();

  // rind ring
  b.beginPath();
  b.arc(C, C, rRind, 0, 7);
  b.fillStyle = '#e8760f';
  b.fill();

  // pith ring
  b.beginPath();
  b.arc(C, C, rPith, 0, 7);
  b.fillStyle = '#f8f0dd';
  b.fill();

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
    const gg = b.createLinearGradient(
      C + Math.cos(am) * rCore,
      C + Math.sin(am) * rCore,
      C + Math.cos(am) * rFlesh,
      C + Math.sin(am) * rFlesh
    );
    gg.addColorStop(0, '#fac36b');
    gg.addColorStop(0.45, '#f4a03a');
    gg.addColorStop(1, '#e5871f');
    b.fillStyle = gg;
    b.fill();

    // vesicles inside wedge
    b.save();
    b.clip();
    for (let k = 0; k < 460; k++) {
      const t = Math.pow(Math.random(), 0.6);
      const rr = lerp(rCore * 1.1, rFlesh * 0.99, t);
      const aa = lerp(a0, a1, Math.random());
      const x = C + Math.cos(aa) * rr, y = C + Math.sin(aa) * rr;
      const w = lerp(1.6, 4.6, t), h = lerp(1.2, 2.6, t);
      b.save();
      b.translate(x, y);
      b.rotate(aa);
      const vg = b.createLinearGradient(-w, 0, w, 0);
      vg.addColorStop(0, `rgba(255,222,158,${rnd(0.3, 0.7)})`);
      vg.addColorStop(1, `rgba(214,124,26,${rnd(0.2, 0.5)})`);
      b.fillStyle = vg;
      b.beginPath();
      b.ellipse(0, 0, w, h, 0, 0, 7);
      b.fill();
      b.restore();

      bm.save();
      bm.translate(x, y);
      bm.rotate(aa);
      bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
      bm.beginPath();
      bm.ellipse(0, 0, w, h, 0, 0, 7);
      bm.fill();
      bm.restore();
    }

    // seeds sit in only some wedges
    if (seedWedges.indexOf(i) !== -1) {
      const rr = rCore + (rFlesh - rCore) * 0.24;
      const x = C + Math.cos(am) * rr, y = C + Math.sin(am) * rr;
      b.save();
      b.translate(x, y);
      b.rotate(am);
      const sgd = b.createLinearGradient(-rFlesh * 0.06, 0, rFlesh * 0.06, 0);
      sgd.addColorStop(0, '#fffaee');
      sgd.addColorStop(1, '#e2d3ae');
      b.fillStyle = sgd;
      b.beginPath();
      b.ellipse(0, 0, rFlesh * 0.075, rFlesh * 0.042, 0, 0, 7);
      b.fill();
      b.strokeStyle = 'rgba(180,158,110,0.6)';
      b.lineWidth = 1.1;
      b.stroke();
      b.restore();

      bm.save();
      bm.translate(x, y);
      bm.rotate(am);
      bm.fillStyle = 'rgba(255,255,255,0.9)';
      bm.beginPath();
      bm.ellipse(0, 0, rFlesh * 0.075, rFlesh * 0.042, 0, 0, 7);
      bm.fill();
      bm.restore();
    }
    b.restore();

    // membrane wall on wedge boundary
    b.strokeStyle = 'rgba(252,244,224,0.5)';
    b.lineWidth = S * 0.0022;
    b.beginPath();
    b.moveTo(C + Math.cos(a0) * rCore, C + Math.sin(a0) * rCore);
    b.lineTo(C + Math.cos(a0) * rFlesh, C + Math.sin(a0) * rFlesh);
    b.stroke();

    bm.strokeStyle = 'rgba(255,255,255,0.6)';
    bm.lineWidth = S * 0.0032;
    bm.beginPath();
    bm.moveTo(C + Math.cos(a0) * rCore, C + Math.sin(a0) * rCore);
    bm.lineTo(C + Math.cos(a0) * rFlesh, C + Math.sin(a0) * rFlesh);
    bm.stroke();
  }

  // central core
  const cg = b.createRadialGradient(C, C, 0, C, C, rCore);
  cg.addColorStop(0, '#fffaec');
  cg.addColorStop(1, '#eee0c0');
  b.fillStyle = cg;
  b.beginPath();
  b.arc(C, C, rCore, 0, 7);
  b.fill();

  // moisture: fine glints
  const vg2 = b.createRadialGradient(C, C, rFlesh * 0.45, C, C, rFlesh);
  vg2.addColorStop(0, 'rgba(120,54,4,0)');
  vg2.addColorStop(1, 'rgba(120,54,4,0.22)');
  b.fillStyle = vg2;
  b.beginPath();
  b.arc(C, C, rFlesh, 0, 7);
  b.fill();

  for (let i = 0; i < 1400; i++) {
    const aa = rnd(0, TAU), rr = Math.sqrt(Math.random()) * rFlesh;
    b.fillStyle = `rgba(255,252,236,${rnd(0.05, 0.26)})`;
    b.beginPath();
    b.arc(C + Math.cos(aa) * rr, C + Math.sin(aa) * rr, rnd(0.5, 1.7), 0, 7);
    b.fill();
  }

  return {
    map: createTexture(base.canvas, true, false),
    bumpMap: createTexture(bump.canvas, false, false),
  };
}

export function createKinnowEnvTexture(): THREE.CanvasTexture {
  const { canvas, ctx: x } = createCanvas(1024, 512);
  const g = x.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#7a6e5c');
  g.addColorStop(0.4, '#2e2823');
  g.addColorStop(0.62, '#15110e');
  g.addColorStop(1, '#0b0908');
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 512);

  const soft = (cx: number, cy: number, r: number, col: string, a: number) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, col.replace('A', String(a)));
    rg.addColorStop(0.5, col.replace('A', String(a * 0.4)));
    rg.addColorStop(1, col.replace('A', '0'));
    x.fillStyle = rg;
    x.fillRect(0, 0, 1024, 512);
  };

  soft(300, 110, 560, 'rgba(255,244,224,A)', 0.95);
  soft(760, 170, 420, 'rgba(206,220,236,A)', 0.4);
  soft(520, 430, 380, 'rgba(150,110,70,A)', 0.3);

  const t = new THREE.CanvasTexture(canvas);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
