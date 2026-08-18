import * as THREE from 'three';
import { lerp, rnd } from '../../core/mathUtils';

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}

function createTexture(canvas: HTMLCanvasElement, srgb: boolean = true, repeat: boolean = false): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(canvas);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.anisotropy = 8;
  return t;
}

// ripeness 0 = greener/firm, 1 = deep golden honey stage
export function createSkinMaps(
  W: number,
  H: number,
  ripeness: number = 0.55
): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture; roughnessMap: THREE.CanvasTexture } {
  const base = createCanvas(W, H);
  const bump = createCanvas(W, H);
  const rough = createCanvas(W, H);

  const b = base.ctx;
  // ground colour, pale gold to golden-orange down the length
  const g = b.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, `rgb(${lerp(220, 232, ripeness) | 0},${lerp(190, 166, ripeness) | 0},${lerp(80, 52, ripeness) | 0})`);
  g.addColorStop(0.42, `rgb(${lerp(238, 246, ripeness) | 0},${lerp(190, 172, ripeness) | 0},${lerp(66, 48, ripeness) | 0})`);
  g.addColorStop(1, `rgb(${lerp(232, 242, ripeness) | 0},${lerp(174, 148, ripeness) | 0},${lerp(60, 40, ripeness) | 0})`);
  b.fillStyle = g;
  b.fillRect(0, 0, W, H);

  // green shoulder retained near the stem on less ripe fruit
  const sg = b.createLinearGradient(0, 0, 0, H * 0.36);
  sg.addColorStop(0, `rgba(168,178,72,${0.34 * (1 - ripeness) + 0.04})`);
  sg.addColorStop(1, 'rgba(168,178,72,0)');
  b.fillStyle = sg;
  b.fillRect(0, 0, W, H * 0.36);

  // sun-side blush
  b.save();
  const bl = b.createLinearGradient(W * 0.06, 0, W * 0.46, 0);
  bl.addColorStop(0, 'rgba(206,96,44,0)');
  bl.addColorStop(0.5, `rgba(205,88,36,${0.24 + 0.18 * ripeness})`);
  bl.addColorStop(1, 'rgba(206,96,44,0)');
  b.fillStyle = bl;
  b.fillRect(0, 0, W, H);
  b.restore();

  // large soft mottling
  for (let i = 0; i < 90; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.05, H * 0.3);
    const rg = b.createRadialGradient(x, y, 0, x, y, r);
    const warm = Math.random() > 0.45;
    rg.addColorStop(0, warm ? 'rgba(252,220,138,0.20)' : 'rgba(196,166,66,0.14)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = rg;
    b.beginPath();
    b.arc(x, y, r, 0, 7);
    b.fill();
  }

  const bm = bump.ctx;
  bm.fillStyle = '#7b7b7b';
  bm.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.04, H * 0.22);
    const rg = bm.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, Math.random() > 0.5 ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    bm.fillStyle = rg;
    bm.beginPath();
    bm.arc(x, y, r, 0, 7);
    bm.fill();
  }

  const rx = rough.ctx;
  rx.fillStyle = '#4a4a4a';
  rx.fillRect(0, 0, W, H);
  for (let i = 0; i < 60; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(H * 0.06, H * 0.3);
    const rg = rx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, Math.random() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    rx.fillStyle = rg;
    rx.beginPath();
    rx.arc(x, y, r, 0, 7);
    rx.fill();
  }

  // lenticels: pale speckling that gives realism to mango skin
  const dots = Math.round((W * H) / 300);
  for (let i = 0; i < dots; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(0.7, 2.4);
    const dark = Math.random() < 0.3;
    b.fillStyle = dark ? `rgba(124,86,36,${rnd(0.16, 0.42)})` : `rgba(255,246,214,${rnd(0.24, 0.62)})`;
    b.beginPath();
    b.arc(x, y, r, 0, 7);
    b.fill();
    bm.fillStyle = dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.60)';
    bm.beginPath();
    bm.arc(x, y, r * 0.9, 0, 7);
    bm.fill();
    rx.fillStyle = 'rgba(255,255,255,0.20)';
    rx.beginPath();
    rx.arc(x, y, r, 0, 7);
    rx.fill();
  }

  // genuine skin imperfections
  for (let i = 0; i < 7; i++) {
    const x = rnd(0, W), y = rnd(H * 0.15, H * 0.9), r = rnd(6, 26);
    const rg = b.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, `rgba(104,66,30,${rnd(0.10, 0.26)})`);
    rg.addColorStop(1, 'rgba(104,66,30,0)');
    b.fillStyle = rg;
    b.beginPath();
    b.arc(x, y, r, 0, 7);
    b.fill();
    bm.fillStyle = 'rgba(0,0,0,0.10)';
    bm.beginPath();
    bm.arc(x, y, r * 0.7, 0, 7);
    bm.fill();
  }

  return {
    map: createTexture(base.canvas, true, true),
    bumpMap: createTexture(bump.canvas, false, true),
    roughnessMap: createTexture(rough.canvas, false, true),
  };
}

export function createFleshMaps(S: number): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = createCanvas(S, S);
  const bump = createCanvas(S, S);
  const b = base.ctx, bm = bump.ctx;

  const rg = b.createRadialGradient(S * 0.5, S * 0.5, S * 0.04, S * 0.5, S * 0.5, S * 0.56);
  rg.addColorStop(0, '#f6cf6c');
  rg.addColorStop(0.55, '#f2be4c');
  rg.addColorStop(0.86, '#e9ad38');
  rg.addColorStop(1, '#d99a2c');
  b.fillStyle = rg;
  b.fillRect(0, 0, S, S);

  // very faint radial fibres — Chaunsa is known for being virtually fibre-free
  b.lineWidth = 1;
  for (let i = 0; i < 260; i++) {
    const a = rnd(0, 7), r0 = rnd(S * 0.06, S * 0.2), r1 = r0 + rnd(S * 0.06, S * 0.3);
    b.strokeStyle = `rgba(255,236,176,${rnd(0.05, 0.16)})`;
    b.beginPath();
    b.moveTo(S / 2 + Math.cos(a) * r0, S / 2 + Math.sin(a) * r0);
    b.quadraticCurveTo(
      S / 2 + Math.cos(a + 0.1) * (r0 + r1) / 2,
      S / 2 + Math.sin(a + 0.1) * (r0 + r1) / 2,
      S / 2 + Math.cos(a + 0.03) * r1,
      S / 2 + Math.sin(a + 0.03) * r1
    );
    b.stroke();
  }

  // juice glisten highlights
  for (let i = 0; i < 500; i++) {
    const x = rnd(0, S), y = rnd(0, S);
    b.fillStyle = `rgba(255,250,224,${rnd(0.04, 0.16)})`;
    b.beginPath();
    b.arc(x, y, rnd(0.5, 1.6), 0, 7);
    b.fill();
  }

  bm.fillStyle = '#808080';
  bm.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const x = rnd(0, S), y = rnd(0, S);
    bm.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)';
    bm.beginPath();
    bm.arc(x, y, rnd(1, 4), 0, 7);
    bm.fill();
  }

  return {
    map: createTexture(base.canvas, true, false),
    bumpMap: createTexture(bump.canvas, false, false),
  };
}

export function createSeedMaps(W: number, H: number): { map: THREE.CanvasTexture; bumpMap: THREE.CanvasTexture } {
  const base = createCanvas(W, H);
  const bump = createCanvas(W, H);
  const b = base.ctx, bm = bump.ctx;

  b.fillStyle = '#d9c795';
  b.fillRect(0, 0, W, H);
  bm.fillStyle = '#7a7a7a';
  bm.fillRect(0, 0, W, H);

  for (let i = 0; i < 1600; i++) {
    const x = rnd(0, W), y = rnd(0, H), len = rnd(H * 0.04, H * 0.26), a = rnd(-0.5, 0.5) + Math.PI / 2;
    const c1 = `rgba(${rnd(150, 210) | 0},${rnd(126, 178) | 0},${rnd(78, 116) | 0},${rnd(0.10, 0.38)})`;
    b.strokeStyle = c1;
    b.lineWidth = rnd(0.6, 2.0);
    b.beginPath();
    b.moveTo(x, y);
    b.quadraticCurveTo(x + rnd(-8, 8), y + len / 2, x + Math.cos(a) * 4, y + len);
    b.stroke();

    bm.strokeStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)';
    bm.lineWidth = rnd(0.6, 2);
    bm.beginPath();
    bm.moveTo(x, y);
    bm.lineTo(x + Math.cos(a) * 3, y + len);
    bm.stroke();
  }

  for (let i = 0; i < 40; i++) {
    const x = rnd(0, W), y = rnd(0, H), r = rnd(10, 60);
    const rg = b.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(140,112,60,0.14)');
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    b.fillStyle = rg;
    b.beginPath();
    b.arc(x, y, r, 0, 7);
    b.fill();
  }

  return {
    map: createTexture(base.canvas, true, true),
    bumpMap: createTexture(bump.canvas, false, true),
  };
}

export function createEnvTexture(): THREE.CanvasTexture {
  const { canvas, ctx } = createCanvas(1024, 512);
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#6d6252');
  g.addColorStop(0.42, '#2b2521');
  g.addColorStop(0.62, '#14100d');
  g.addColorStop(1, '#0b0908');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 512);

  // soft broad key window, warm studio sheen
  const key = ctx.createRadialGradient(300, 96, 20, 300, 96, 520);
  key.addColorStop(0, 'rgba(255,242,220,1)');
  key.addColorStop(0.45, 'rgba(255,236,206,0.45)');
  key.addColorStop(1, 'rgba(255,240,214,0)');
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, 1024, 512);

  // cool rim from behind
  const rim = ctx.createRadialGradient(824, 190, 10, 824, 190, 300);
  rim.addColorStop(0, 'rgba(200,216,232,0.55)');
  rim.addColorStop(1, 'rgba(196,214,230,0)');
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, 1024, 512);

  const t = new THREE.CanvasTexture(canvas);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
