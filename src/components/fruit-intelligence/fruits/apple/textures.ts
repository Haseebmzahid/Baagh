import * as THREE from 'three';
import { clamp, lerp, rnd } from '../../core/mathUtils';

const TAU = Math.PI * 2;

export function cv(w: number, h: number): { c: HTMLCanvasElement; x: CanvasRenderingContext2D } {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  if (!ctx) throw new Error('Failed to create 2d canvas context');
  return { c, x: ctx };
}

export function tex(
  canvas: HTMLCanvasElement,
  srgb: boolean = true,
  rep: boolean = true
): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = rep ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  return t;
}

// Scale finished canvas into proper albedo range to avoid ACES over-exposure clipping
export function toAlbedo(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  factor: number
): void {
  ctx.globalCompositeOperation = 'multiply';
  const v = Math.round(255 * factor);
  ctx.fillStyle = `rgb(${v},${v},${v})`;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
}

export function wrapX(
  W: number,
  x: number,
  margin: number,
  draw: (px: number) => void
): void {
  draw(x);
  if (x < margin) draw(x + W);
  else if (x > W - margin) draw(x - W);
}

// blush 0 = more gold shoulder / striped, 1 = deep even crimson
export function createSkinMaps(
  W: number,
  H: number,
  blush: number,
  seed?: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const base = cv(W, H);
  const bump = cv(W, H);
  const rough = cv(W, H);
  const b = base.x;
  const bm = bump.x;
  const rx = rough.x;

  // Ground: gold-green near stem basin, crimson over belly, warm at calyx
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(
    0,
    `rgb(${lerp(206, 176, blush) | 0},${lerp(168, 96, blush) | 0},${lerp(70, 44, blush) | 0})`
  );
  g.addColorStop(
    0.16,
    `rgb(${lerp(214, 186, blush) | 0},${lerp(156, 74, blush) | 0},${lerp(58, 36, blush) | 0})`
  );
  g.addColorStop(
    0.45,
    `rgb(${lerp(190, 166, blush) | 0},${lerp(58, 30, blush) | 0},${lerp(40, 30, blush) | 0})`
  );
  g.addColorStop(
    0.78,
    `rgb(${lerp(174, 146, blush) | 0},${lerp(44, 22, blush) | 0},${lerp(36, 26, blush) | 0})`
  );
  g.addColorStop(
    1,
    `rgb(${lerp(158, 126, blush) | 0},${lerp(56, 30, blush) | 0},${lerp(38, 26, blush) | 0})`
  );
  b.fillStyle = g;
  b.fillRect(0, 0, W, H);

  // Gold shoulder retained on the sun-shy side of the fruit
  const gold = b.createLinearGradient(W * 0.08, 0, W * 0.44, 0);
  gold.addColorStop(0, 'rgba(226,186,80,0)');
  gold.addColorStop(0.5, `rgba(224,178,72,${0.34 * (1 - blush) + 0.06})`);
  gold.addColorStop(1, 'rgba(226,186,80,0)');
  b.fillStyle = gold;
  b.fillRect(0, 0, W, H);

  // Vertical striping — soft streaked blush, never a painted stripe
  for (let i = 0; i < 340; i++) {
    const x = rnd(0, W);
    const w = rnd(6, 34);
    const y0 = rnd(-H * 0.1, H * 0.3);
    const h = rnd(H * 0.35, H * 0.95);
    const dark = Math.random() > 0.42;
    wrapX(W, x, w * 2, (px) => {
      const lg = b.createLinearGradient(px - w, 0, px + w, 0);
      const col = dark ? '150,26,30' : '226,158,70';
      lg.addColorStop(0, `rgba(${col},0)`);
      lg.addColorStop(0.5, `rgba(${col},${rnd(0.03, 0.09)})`);
      lg.addColorStop(1, `rgba(${col},0)`);
      b.fillStyle = lg;
      b.fillRect(px - w, y0, w * 2, h);
    });
  }

  // Broad colour zones
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, W);
    const y = rnd(0, H);
    const r = rnd(H * 0.06, H * 0.34);
    const pick = Math.random();
    const col =
      pick > 0.6
        ? 'rgba(214,60,44,0.16)'
        : pick > 0.3
        ? 'rgba(120,16,26,0.18)'
        : 'rgba(230,178,80,0.12)';
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

  // Glossy skin with waxy patches, drier near the wells
  rx.fillStyle = '#6e6e6e';
  rx.fillRect(0, 0, W, H);
  const dry = rx.createLinearGradient(0, 0, 0, H * 0.2);
  dry.addColorStop(0, 'rgba(255,255,255,0.42)');
  dry.addColorStop(1, 'rgba(255,255,255,0)');
  rx.fillStyle = dry;
  rx.fillRect(0, 0, W, H * 0.2);

  for (let i = 0; i < 110; i++) {
    const x = rnd(0, W);
    const y = rnd(0, H);
    const r = rnd(H * 0.05, H * 0.3);
    const light = Math.random() > 0.45;
    wrapX(W, x, r, (px) => {
      const rg = rx.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, light ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)');
      rg.addColorStop(1, 'rgba(0,0,0,0)');
      rx.fillStyle = rg;
      rx.beginPath();
      rx.arc(px, y, r, 0, 7);
      rx.fill();
    });
  }

  // Lenticels: fine pale freckling across the skin
  const SP = 32;
  const SPH = SP / 2;
  const sprite = (paint: (ctx: CanvasRenderingContext2D, center: number) => void) => {
    const s = cv(SP, SP);
    paint(s.x, SPH);
    return s.c;
  };

  const dotCol = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(246,226,192,0.95)');
    g2.addColorStop(0.5, 'rgba(238,206,164,0.35)');
    g2.addColorStop(1, 'rgba(238,206,164,0)');
    x.fillStyle = g2;
    x.beginPath();
    x.arc(c, c, c, 0, 7);
    x.fill();
  });

  const dotBump = sprite((x, c) => {
    const g2 = x.createRadialGradient(c, c, 0, c, c, c);
    g2.addColorStop(0, 'rgba(255,255,255,0.7)');
    g2.addColorStop(0.55, 'rgba(128,128,128,0.3)');
    g2.addColorStop(0.85, 'rgba(0,0,0,0.3)');
    g2.addColorStop(1, 'rgba(128,128,128,0)');
    x.fillStyle = g2;
    x.beginPath();
    x.arc(c, c, c, 0, 7);
    x.fill();
  });

  const dots = Math.round((W * H) / 300);
  for (let i = 0; i < dots; i++) {
    const x = rnd(0, W);
    const y = rnd(0, H);
    const r = rnd(1.0, 2.4);
    const a = rnd(0.24, 0.6);
    wrapX(W, x, 6, (px) => {
      b.globalAlpha = a;
      b.drawImage(dotCol, px - r, y - r, r * 2, r * 2);
      bm.globalAlpha = rnd(0.5, 0.9);
      bm.drawImage(dotBump, px - r * 1.2, y - r * 1.2, r * 2.4, r * 2.4);
      b.globalAlpha = 1;
      bm.globalAlpha = 1;
    });
  }

  // Micro grain + honest marks
  for (let i = 0; i < (W * H) / 1400; i++) {
    const x = rnd(0, W);
    const y = rnd(0, H);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    bm.beginPath();
    bm.arc(x, y, rnd(0.5, 1.5), 0, 7);
    bm.fill();
  }

  for (let i = 0; i < 7; i++) {
    const x = rnd(0, W);
    const y = rnd(H * 0.15, H * 0.85);
    const r = rnd(7, 26);
    wrapX(W, x, r, (px) => {
      const rg = b.createRadialGradient(px, y, 0, px, y, r);
      rg.addColorStop(0, 'rgba(96,44,26,0.22)');
      rg.addColorStop(1, 'rgba(96,44,26,0)');
      b.fillStyle = rg;
      b.beginPath();
      b.arc(px, y, r, 0, 7);
      b.fill();
      rx.fillStyle = 'rgba(255,255,255,0.2)';
      rx.beginPath();
      rx.arc(px, y, r * 0.7, 0, 7);
      rx.fill();
    });
  }

  if (seed !== undefined) {
    // Russet flecks around the stem well
    for (let i = 0; i < 3; i++) {
      const x = rnd(0, W);
      const y = rnd(0, H * 0.16);
      const r = rnd(5, 14);
      b.fillStyle = `rgba(140,96,52,${rnd(0.16, 0.34)})`;
      b.beginPath();
      b.arc(x, y, r, 0, 7);
      b.fill();
    }
  }

  return {
    map: tex(base.c),
    bumpMap: tex(bump.c, false),
    roughnessMap: tex(rough.c, false),
  };
}

// Wedge cut face: cream flesh, radial fibre, green core cast, red rind edge
export function createFleshMaps(
  S: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = cv(S, S);
  const bump = cv(S, S);
  const b = base.x;
  const bm = bump.x;

  // u across (0 = core axis, 1 = skin), v down the fruit
  const g = b.createLinearGradient(0, 0, S, 0);
  g.addColorStop(0, '#e4dba0');
  g.addColorStop(0.14, '#efe4a8');
  g.addColorStop(0.6, '#f2e49c');
  g.addColorStop(0.93, '#f0e0a4');
  b.fillStyle = g;
  b.fillRect(0, 0, S, S);

  // Green-yellow cast in core zone
  const core = b.createLinearGradient(0, 0, S * 0.22, 0);
  core.addColorStop(0, 'rgba(186,200,104,0.7)');
  core.addColorStop(1, 'rgba(206,214,140,0)');
  b.fillStyle = core;
  b.fillRect(0, 0, S * 0.22, S);

  // Fibre running out from the core
  for (let i = 0; i < 2400; i++) {
    const y = rnd(0, S);
    const x0 = rnd(S * 0.06, S * 0.62);
    const len = rnd(S * 0.05, S * 0.34);
    b.strokeStyle = `rgba(${rnd(226, 255) | 0},${rnd(220, 252) | 0},${rnd(186, 226) | 0},${rnd(
      0.14,
      0.45
    )})`;
    b.lineWidth = rnd(0.6, 2.2);
    b.beginPath();
    b.moveTo(x0, y);
    b.quadraticCurveTo(x0 + len * 0.6, y + rnd(-5, 5), x0 + len, y + rnd(-8, 8));
    b.stroke();
  }

  // Faint darker grain
  for (let i = 0; i < 900; i++) {
    const y = rnd(0, S);
    const x0 = rnd(S * 0.1, S * 0.85);
    const len = rnd(S * 0.04, S * 0.2);
    b.strokeStyle = `rgba(206,192,150,${rnd(0.06, 0.2)})`;
    b.lineWidth = rnd(0.6, 1.8);
    b.beginPath();
    b.moveTo(x0, y);
    b.lineTo(x0 + len, y + rnd(-5, 5));
    b.stroke();
  }

  // Moisture on the cut face
  for (let i = 0; i < 3400; i++) {
    const x = rnd(0, S);
    const y = rnd(0, S);
    b.fillStyle = `rgba(255,255,246,${rnd(0.1, 0.42)})`;
    b.beginPath();
    b.arc(x, y, rnd(0.6, 2.4), 0, 7);
    b.fill();
  }

  // Red rind edge
  const rind = b.createLinearGradient(S * 0.855, 0, S, 0);
  rind.addColorStop(0, 'rgba(196,44,44,0)');
  rind.addColorStop(0.35, 'rgba(190,40,42,0.55)');
  rind.addColorStop(0.7, 'rgba(168,28,34,0.96)');
  rind.addColorStop(1, 'rgba(132,20,28,1)');
  b.fillStyle = rind;
  b.fillRect(S * 0.855, 0, S * 0.145, S);
  b.fillStyle = 'rgba(250,240,206,0.55)';
  b.fillRect(S * 0.845, 0, S * 0.012, S);

  // Core notch
  const notch = b.createLinearGradient(0, 0, S * 0.1, 0);
  notch.addColorStop(0, 'rgba(176,186,110,0.6)');
  notch.addColorStop(1, 'rgba(176,186,110,0)');
  b.fillStyle = notch;
  b.fillRect(0, 0, S * 0.1, S);

  bm.fillStyle = '#808080';
  bm.fillRect(0, 0, S, S);
  for (let i = 0; i < 6000; i++) {
    const x = rnd(0, S);
    const y = rnd(0, S);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.26)' : 'rgba(0,0,0,0.24)';
    bm.beginPath();
    bm.arc(x, y, rnd(0.8, 3.0), 0, 7);
    bm.fill();
  }

  toAlbedo(b, S, S, 0.62);
  return { map: tex(base.c, true, false), bumpMap: tex(bump.c, false, false) };
}

// Lengthwise cross-section: butterfly core, two seed chambers, cream flesh
export function createCrossMaps(
  S: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = cv(S, S);
  const bump = cv(S, S);
  const b = base.x;
  const bm = bump.x;
  const C = S / 2;

  bm.fillStyle = '#808080';
  bm.fillRect(0, 0, S, S);

  const g = b.createRadialGradient(C, C * 0.9, S * 0.06, C, C, S * 0.52);
  g.addColorStop(0, '#e6e2a2');
  g.addColorStop(0.34, '#f0e29c');
  g.addColorStop(0.8, '#f3e6a8');
  g.addColorStop(1, '#e8d998');
  b.fillStyle = g;
  b.fillRect(0, 0, S, S);

  // Fibre fanning from core line
  for (let i = 0; i < 2600; i++) {
    const a = rnd(0, TAU);
    const r0 = rnd(S * 0.05, S * 0.2);
    const r1 = r0 + rnd(S * 0.05, S * 0.28);
    b.strokeStyle = `rgba(255,253,232,${rnd(0.05, 0.18)})`;
    b.lineWidth = rnd(0.5, 1.5);
    b.beginPath();
    b.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
    b.lineTo(C + Math.cos(a + 0.03) * r1, C + Math.sin(a + 0.03) * r1);
    b.stroke();
  }

  // Vascular line
  b.strokeStyle = 'rgba(196,206,132,0.6)';
  b.lineWidth = S * 0.012;
  b.beginPath();
  b.moveTo(C, S * 0.1);
  b.quadraticCurveTo(C - S * 0.01, C, C, S * 0.9);
  b.stroke();

  // Two chamber walls (butterfly)
  const chamber = (dir: number) => {
    b.save();
    b.translate(C, C);
    b.scale(dir, 1);
    b.beginPath();
    b.moveTo(0, -S * 0.11);
    b.bezierCurveTo(S * 0.09, -S * 0.1, S * 0.115, -S * 0.02, S * 0.085, S * 0.05);
    b.bezierCurveTo(S * 0.06, S * 0.1, S * 0.02, S * 0.11, 0, S * 0.1);
    b.closePath();
    b.fillStyle = 'rgba(226,230,168,0.55)';
    b.fill();
    b.strokeStyle = 'rgba(178,186,110,0.75)';
    b.lineWidth = S * 0.006;
    b.stroke();

    // Seed: brown teardrop
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
    b.strokeStyle = 'rgba(60,26,8,0.6)';
    b.lineWidth = S * 0.003;
    b.stroke();
    b.restore();

    b.restore();

    bm.save();
    bm.translate(C + dir * S * 0.052, C - S * 0.005);
    bm.fillStyle = 'rgba(0,0,0,0.55)';
    bm.beginPath();
    bm.ellipse(0, 0, S * 0.026, S * 0.042, -0.35, 0, 7);
    bm.fill();
    bm.restore();
  };

  chamber(1);
  chamber(-1);

  // Moisture
  for (let i = 0; i < 2600; i++) {
    const a = rnd(0, TAU);
    const r = Math.sqrt(Math.random()) * S * 0.5;
    b.fillStyle = `rgba(255,255,244,${rnd(0.05, 0.2)})`;
    b.beginPath();
    b.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, rnd(0.5, 1.8), 0, 7);
    b.fill();
  }

  // Red rind edge
  b.lineWidth = S * 0.02;
  b.strokeStyle = 'rgba(158,26,32,0.9)';
  b.beginPath();
  b.arc(C, C, S * 0.492, 0, 7);
  b.stroke();

  b.lineWidth = S * 0.008;
  b.strokeStyle = 'rgba(236,220,176,0.8)';
  b.beginPath();
  b.arc(C, C, S * 0.474, 0, 7);
  b.stroke();

  toAlbedo(b, S, S, 0.62);
  return { map: tex(base.c, true, false), bumpMap: tex(bump.c, false, false) };
}

// Core seen from outside: 5 chamber walls through pale casing
export function createCoreMaps(
  W: number,
  H: number
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = cv(W, H);
  const bump = cv(W, H);
  const b = base.x;
  const bm = bump.x;

  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#cfc884');
  g.addColorStop(0.22, '#e6dc9e');
  g.addColorStop(0.5, '#ece2a6');
  g.addColorStop(0.8, '#e2d694');
  g.addColorStop(1, '#c8bf7c');
  b.fillStyle = g;
  b.fillRect(0, 0, W, H);

  bm.fillStyle = '#808080';
  bm.fillRect(0, 0, W, H);

  for (let i = 0; i < 5; i++) {
    const cx = (i + 0.5) * (W / 5);
    const cw = (W / 5) * 0.34;
    const ch = H * 0.19;

    b.save();
    b.translate(cx, H * 0.5);
    const cg = b.createRadialGradient(0, 0, 0, 0, 0, cw * 1.6);
    cg.addColorStop(0, 'rgba(150,120,58,0.55)');
    cg.addColorStop(0.6, 'rgba(196,186,120,0.34)');
    cg.addColorStop(1, 'rgba(214,210,150,0)');
    b.fillStyle = cg;
    b.beginPath();
    b.ellipse(0, 0, cw * 1.5, ch, 0, 0, 7);
    b.fill();
    b.strokeStyle = 'rgba(166,168,104,0.7)';
    b.lineWidth = W * 0.004;
    b.beginPath();
    b.ellipse(0, 0, cw, ch * 0.82, 0, 0, 7);
    b.stroke();
    b.restore();

    bm.save();
    bm.translate(cx, H * 0.5);
    const bg = bm.createRadialGradient(0, 0, 0, 0, 0, cw * 1.4);
    bg.addColorStop(0, 'rgba(0,0,0,0.7)');
    bg.addColorStop(0.75, 'rgba(128,128,128,0.3)');
    bg.addColorStop(1, 'rgba(128,128,128,0)');
    bm.fillStyle = bg;
    bm.beginPath();
    bm.ellipse(0, 0, cw * 1.4, ch, 0, 0, 7);
    bm.fill();
    bm.restore();

    b.strokeStyle = 'rgba(158,168,96,0.5)';
    b.lineWidth = W * 0.003;
    b.beginPath();
    b.moveTo(cx, H * 0.32);
    b.lineTo(cx + W * 0.006, 0);
    b.stroke();
    b.beginPath();
    b.moveTo(cx, H * 0.68);
    b.lineTo(cx - W * 0.006, H);
    b.stroke();
  }

  for (let i = 0; i < 2600; i++) {
    const x = rnd(0, W);
    const y = rnd(0, H);
    const len = rnd(3, 18);
    b.strokeStyle = `rgba(${rnd(226, 252) | 0},${rnd(224, 248) | 0},${rnd(184, 214) | 0},${rnd(
      0.08,
      0.3
    )})`;
    b.lineWidth = rnd(0.5, 1.6);
    b.beginPath();
    b.moveTo(x, y);
    b.lineTo(x + rnd(-4, 4), y + len);
    b.stroke();
  }

  toAlbedo(b, W, H, 0.58);
  return { map: tex(base.c), bumpMap: tex(bump.c, false) };
}

// Transverse cut through the core: five-point chamber star face-on
export function createCoreSectionMap(S: number): THREE.CanvasTexture {
  const { c, x } = cv(S, S);
  const C = S / 2;
  const R = S * 0.5;

  x.clearRect(0, 0, S, S);
  const ring = x.createRadialGradient(C, C, R * 0.2, C, C, R);
  ring.addColorStop(0, '#efe4a4');
  ring.addColorStop(0.62, '#f2e6a6');
  ring.addColorStop(0.93, '#e6d68e');
  ring.addColorStop(1, '#c9b76c');
  x.fillStyle = ring;
  x.beginPath();
  x.arc(C, C, R, 0, TAU);
  x.fill();

  for (let i = 0; i < 2200; i++) {
    const a = rnd(0, TAU);
    const r0 = rnd(R * 0.3, R * 0.62);
    const r1 = r0 + rnd(R * 0.05, R * 0.28);
    x.strokeStyle = `rgba(255,250,214,${rnd(0.05, 0.2)})`;
    x.lineWidth = rnd(0.5, 1.6);
    x.beginPath();
    x.moveTo(C + Math.cos(a) * r0, C + Math.sin(a) * r0);
    x.lineTo(C + Math.cos(a + 0.02) * r1, C + Math.sin(a + 0.02) * r1);
    x.stroke();
  }

  // Five chambers on a star
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    x.save();
    x.translate(C + Math.cos(a) * R * 0.3, C + Math.sin(a) * R * 0.3);
    x.rotate(a + Math.PI / 2);
    x.beginPath();
    x.moveTo(0, -R * 0.2);
    x.bezierCurveTo(R * 0.14, -R * 0.11, R * 0.12, R * 0.1, 0, R * 0.16);
    x.bezierCurveTo(-R * 0.12, R * 0.1, -R * 0.14, -R * 0.11, 0, -R * 0.2);
    x.closePath();
    const cg = x.createLinearGradient(0, -R * 0.2, 0, R * 0.16);
    cg.addColorStop(0, '#cdbe80');
    cg.addColorStop(1, '#9d9058');
    x.fillStyle = cg;
    x.fill();
    x.strokeStyle = 'rgba(108,96,52,0.9)';
    x.lineWidth = R * 0.014;
    x.stroke();
    x.restore();
  }

  // Two dark pips per chamber
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * TAU - Math.PI / 2;
    [-1, 1].forEach((side) => {
      x.save();
      x.translate(C + Math.cos(a) * R * 0.3, C + Math.sin(a) * R * 0.3);
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
      x.strokeStyle = 'rgba(16,6,1,0.8)';
      x.lineWidth = R * 0.007;
      x.stroke();
      x.restore();
    });
  }

  const ax = x.createRadialGradient(C, C, 0, C, C, R * 0.08);
  ax.addColorStop(0, '#b3a463');
  ax.addColorStop(1, 'rgba(179,164,99,0)');
  x.fillStyle = ax;
  x.beginPath();
  x.arc(C, C, R * 0.08, 0, TAU);
  x.fill();

  for (let i = 0; i < 1800; i++) {
    const a = rnd(0, TAU);
    const r = Math.sqrt(Math.random()) * R;
    x.fillStyle = `rgba(255,252,226,${rnd(0.04, 0.16)})`;
    x.beginPath();
    x.arc(C + Math.cos(a) * r, C + Math.sin(a) * r, rnd(0.5, 1.7), 0, 7);
    x.fill();
  }

  toAlbedo(x, S, S, 0.62);
  return tex(c, true, false);
}

// Linear float DataTexture HDR environment lighting
export function createEnvTexture(): THREE.DataTexture {
  const W = 2048;
  const H = 1024;
  const data = new Float32Array(W * H * 4);
  const lights = [
    { u: 0.29, v: 0.2, r: 0.62, c: [1.0, 0.965, 0.9], i: 3.1 },
    { u: 0.75, v: 0.32, r: 0.46, c: [0.8, 0.86, 0.93], i: 1.05 },
    { u: 0.51, v: 0.84, r: 0.44, c: [0.59, 0.43, 0.27], i: 0.7 },
  ];

  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);
    const sky = Math.pow(clamp(1 - v * 1.24, 0, 1), 1.55);
    const base = [0.03 + 0.3 * sky, 0.024 + 0.255 * sky, 0.019 + 0.205 * sky];
    for (let x = 0; x < W; x++) {
      const u = x / (W - 1);
      let r = base[0];
      let g = base[1];
      let bl = base[2];
      for (const L of lights) {
        let du = u - L.u;
        if (du > 0.5) du -= 1;
        if (du < -0.5) du += 1;
        du *= Math.max(0.25, Math.sin(Math.PI * v));
        const dv = v - L.v;
        const d = Math.sqrt(du * du + dv * dv) / L.r;
        if (d < 1) {
          const f = Math.pow(1 - d * d, 2.2) * L.i;
          r += L.c[0] * f;
          g += L.c[1] * f;
          bl += L.c[2] * f;
        }
      }
      const i = (y * W + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = bl;
      data[i + 3] = 1;
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
