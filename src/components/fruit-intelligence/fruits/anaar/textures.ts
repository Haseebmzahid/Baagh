import * as THREE from 'three';
import { AlbedoSpoke, rng } from './geometry';

const TAU = Math.PI * 2;

function cv(w: number, h: number): { c: HTMLCanvasElement; x: CanvasRenderingContext2D } {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return { c, x: c.getContext('2d') as CanvasRenderingContext2D };
}

function wrapX(t: THREE.CanvasTexture): THREE.CanvasTexture {
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.anisotropy = 4;
  return t;
}

export type AnaarTone = 'Garnet' | 'Oxblood' | 'Sun-blushed';

interface Palette {
  base: string;
  blobs: string[];
  blem: string;
}

const PALETTES: Record<AnaarTone, Palette> = {
  Garnet: {
    base: '#a8202c',
    blobs: ['#bd2c30', '#cf4436', '#7e1420', '#94222c', '#d15b3a'],
    blem: '#8d6144',
  },
  Oxblood: {
    base: '#8b1622',
    blobs: ['#9c1d24', '#b32c2a', '#6a0f19', '#7d1b26', '#a63a2c'],
    blem: '#7a5138',
  },
  'Sun-blushed': {
    base: '#bc2c28',
    blobs: ['#cf3c2c', '#e06438', '#941c24', '#b03330', '#ea8a52'],
    blem: '#9c6c46',
  },
};

export interface SkinMaps {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

/**
 * Pomegranate skin: uneven sun-worked colour laid down in overlapping blobs,
 * scattered blemishes, fine pores, and darkened poles. Matte, not painted.
 */
export function createSkinMaps(seed: number, tone: AnaarTone, size: number): SkinMaps {
  const pal = PALETTES[tone] || PALETTES.Garnet;
  const rnd = rng(seed + 991);
  const { c, x } = cv(size, size / 2);
  const W = c.width;
  const H = c.height;

  x.fillStyle = pal.base;
  x.fillRect(0, 0, W, H);

  const blob = (cx: number, cy: number, r: number, col: string, al: number, sy: number) => {
    x.save();
    x.translate(cx, cy);
    x.scale(1, sy || 1);
    const g = x.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = al;
    x.fillStyle = g;
    x.beginPath();
    x.arc(0, 0, r, 0, TAU);
    x.fill();
    x.restore();
    x.globalAlpha = 1;
  };

  for (let i = 0; i < 300; i++) {
    blob(
      rnd() * W,
      rnd() * H,
      24 + rnd() * (W * 0.16),
      pal.blobs[(rnd() * pal.blobs.length) | 0],
      0.16 + rnd() * 0.2,
      0.5 + rnd() * 1.4
    );
  }
  for (let i = 0; i < 160; i++) {
    blob(
      rnd() * W,
      rnd() * H,
      8 + rnd() * 26,
      pal.blobs[(rnd() * pal.blobs.length) | 0],
      0.14 + rnd() * 0.16,
      2.4 + rnd() * 3
    );
  }
  for (let i = 0; i < 26; i++) {
    blob(rnd() * W, H * (0.2 + rnd() * 0.6), 6 + rnd() * 18, pal.blem, 0.24 + rnd() * 0.22, 0.7 + rnd());
  }
  for (let i = 0; i < 9; i++) {
    blob(rnd() * W, H * (0.25 + rnd() * 0.5), 10 + rnd() * 16, '#3a0a10', 0.3, 0.8);
  }

  const pores = Math.floor(size * 22);
  for (let i = 0; i < pores; i++) {
    const px = rnd() * W;
    const py = rnd() * H;
    const r = 0.45 + rnd() * 1.2;
    x.globalAlpha = 0.14 + rnd() * 0.26;
    x.fillStyle = rnd() > 0.5 ? '#d0705c' : '#3c060e';
    x.beginPath();
    x.arc(px, py, r, 0, TAU);
    x.fill();
  }
  x.globalAlpha = 1;

  const gTop = x.createLinearGradient(0, 0, 0, H * 0.18);
  gTop.addColorStop(0, 'rgba(60,26,18,.85)');
  gTop.addColorStop(1, 'rgba(60,26,18,0)');
  x.fillStyle = gTop;
  x.fillRect(0, 0, W, H * 0.18);

  const gBot = x.createLinearGradient(0, H, 0, H * 0.86);
  gBot.addColorStop(0, 'rgba(38,8,14,.7)');
  gBot.addColorStop(1, 'rgba(38,8,14,0)');
  x.fillStyle = gBot;
  x.fillRect(0, H * 0.86, W, H * 0.14);

  // Bump: fine pore relief only — the skin is matte and finely pored.
  const bump = cv(size, size / 2);
  const bx = bump.x;
  bx.fillStyle = '#808080';
  bx.fillRect(0, 0, W, H);
  const bumpRnd = rng(seed + 1777);
  for (let i = 0; i < pores; i++) {
    const px = bumpRnd() * W;
    const py = bumpRnd() * H;
    const r = 0.5 + bumpRnd() * 1.4;
    bx.globalAlpha = 0.2 + bumpRnd() * 0.35;
    bx.fillStyle = bumpRnd() > 0.5 ? '#ffffff' : '#2a2a2a';
    bx.beginPath();
    bx.arc(px, py, r, 0, TAU);
    bx.fill();
  }
  bx.globalAlpha = 1;
  for (let i = 0; i < 90; i++) {
    const px = bumpRnd() * W;
    const py = bumpRnd() * H;
    const r = 10 + bumpRnd() * 40;
    const g = bx.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(150,150,150,0.5)');
    g.addColorStop(1, 'rgba(128,128,128,0)');
    bx.fillStyle = g;
    bx.beginPath();
    bx.arc(px, py, r, 0, TAU);
    bx.fill();
  }

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = new THREE.CanvasTexture(bump.c);

  return { map: wrapX(map), bumpMap: wrapX(bumpMap) };
}

/**
 * The cut face: pale membrane spokes dividing uneven chambers, a small pith
 * core, fine veins, and the rind rim seen edge-on.
 */
export function createFaceTexture(
  seed: number,
  spokes: AlbedoSpoke[],
  size: number
): THREE.CanvasTexture {
  const rnd = rng(seed + 313);
  const { c, x } = cv(size, size);
  const S = size;
  const C = S / 2;

  x.fillStyle = '#4d0f18';
  x.fillRect(0, 0, S, S);

  const px = (t: number, a: number): [number, number] => [
    C + Math.cos(a) * t * C,
    C + Math.sin(a) * t * C,
  ];

  // Juice-stained ground under the arils.
  for (let i = 0; i < 150; i++) {
    const t = Math.sqrt(rnd()) * 0.95;
    const a = rnd() * TAU;
    const [bx, by] = px(t, a);
    const r = S * (0.02 + rnd() * 0.055);
    const g = x.createRadialGradient(bx, by, 0, bx, by, r);
    g.addColorStop(0, rnd() > 0.5 ? 'rgba(150,14,32,0.5)' : 'rgba(96,6,22,0.55)');
    g.addColorStop(1, 'rgba(77,15,24,0)');
    x.fillStyle = g;
    x.beginPath();
    x.arc(bx, by, r, 0, TAU);
    x.fill();
  }

  // Membrane spokes — thin, pale, unbruised.
  x.save();
  const steps = 26;
  for (const s of spokes) {
    const pts: [number, number, number][] = [];
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const wob = Math.sin(t * 5.2 + s.a * 2.3) * 0.05;
      pts.push([t, s.a + wob, s.w * (0.55 + 0.9 * (1 - t))]);
    }
    x.fillStyle = '#c6ae8e';
    x.beginPath();
    const f0 = s.from || 0;
    let started = false;
    for (let k = 0; k <= steps; k++) {
      const [t, a, w] = pts[k];
      if (t < f0) continue;
      const [ax, ay] = px(t * 0.99, a + w * 1.6);
      if (started) x.lineTo(ax, ay);
      else {
        x.moveTo(ax, ay);
        started = true;
      }
    }
    for (let k = steps; k >= 0; k--) {
      const [t, a, w] = pts[k];
      if (t < f0) continue;
      const [ax, ay] = px(t * 0.99, a - w * 1.6);
      x.lineTo(ax, ay);
    }
    x.closePath();
    x.globalAlpha = 0.9;
    x.fill();
    x.globalAlpha = 1;
  }

  // Small pith core — soft bite.
  const cg = x.createRadialGradient(C, C, 0, C, C, C * 0.16);
  cg.addColorStop(0, '#cdb896');
  cg.addColorStop(0.7, '#bda684');
  cg.addColorStop(1, 'rgba(189,166,132,0)');
  x.fillStyle = cg;
  x.beginPath();
  x.arc(C, C, C * 0.16, 0, TAU);
  x.fill();

  const sh = x.createRadialGradient(C, C, C * 0.35, C, C, C);
  sh.addColorStop(0, 'rgba(60,10,16,0.10)');
  sh.addColorStop(1, 'rgba(44,7,13,0.7)');
  x.fillStyle = sh;
  x.beginPath();
  x.arc(C, C, C * 0.995, 0, TAU);
  x.fill();

  for (let i = 0; i < 70; i++) {
    const a = rnd() * TAU;
    const t0 = 0.15 + rnd() * 0.5;
    const t1 = t0 + 0.1 + rnd() * 0.3;
    x.strokeStyle = `rgba(238,226,206,${0.1 + rnd() * 0.2})`;
    x.lineWidth = 0.8 + rnd() * 2.2;
    x.beginPath();
    const [x0, y0] = px(t0, a);
    const [x1, y1] = px(t1, a + (rnd() - 0.5) * 0.25);
    x.moveTo(x0, y0);
    x.lineTo(x1, y1);
    x.stroke();
  }
  x.restore();

  // Pith layer and skin rim.
  x.lineWidth = S * 0.042;
  x.strokeStyle = '#ecdcc3';
  x.beginPath();
  x.arc(C, C, C * 0.955, 0, TAU);
  x.stroke();

  x.lineWidth = S * 0.03;
  x.strokeStyle = '#6f1a22';
  x.beginPath();
  x.arc(C, C, C * 0.982, 0, TAU);
  x.stroke();

  x.lineWidth = S * 0.012;
  x.strokeStyle = 'rgba(58,10,16,.7)';
  x.beginPath();
  x.arc(C, C, C * 0.93, 0, TAU);
  x.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/** Warm studio environment matching the prototype's lighting treatment. */
export function createEnvTexture(): THREE.CanvasTexture {
  const { c, x } = cv(512, 256);
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#2b2420');
  g.addColorStop(0.45, '#141010');
  g.addColorStop(1, '#070505');
  x.fillStyle = g;
  x.fillRect(0, 0, 512, 256);

  const soft = (cx: number, cy: number, r: number, col: string, al: number) => {
    const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    rg.addColorStop(0, col);
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    x.globalAlpha = al;
    x.fillStyle = rg;
    x.beginPath();
    x.arc(cx, cy, r, 0, TAU);
    x.fill();
    x.globalAlpha = 1;
  };
  soft(118, 54, 132, '#fff3e2', 0.95);
  soft(402, 88, 104, '#ffd6b6', 0.45);
  soft(268, 206, 150, '#3b2a24', 0.55);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
