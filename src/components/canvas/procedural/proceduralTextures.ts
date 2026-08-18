import * as THREE from 'three';

const C = (w: number, h: number): HTMLCanvasElement => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
};

const tex = (canvas: HTMLCanvasElement, rep = 1): THREE.CanvasTexture => {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep, rep);
  t.anisotropy = 8;
  return t;
};

export function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function vnoise(x: number, y: number): number {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

export function fbm(x: number, y: number, oct = 5): number {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    v += a * vnoise(x * f, y * f);
    f *= 2.07;
    a *= 0.5;
  }
  return v;
}

export interface SkinMapsResult {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  rough: THREE.CanvasTexture;
}

export function skinMaps(): SkinMapsResult {
  const w = 1024, h = 1024;
  const base = C(w, h), bump = C(w, h), rough = C(w, h);
  const bc = base.getContext('2d')!, bpc = bump.getContext('2d')!, rc = rough.getContext('2d')!;
  const img = bc.createImageData(w, h), bimg = bpc.createImageData(w, h), rimg = rc.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const v = y / h; // v: 0 stem shoulder -> 1 tip
    for (let x = 0; x < w; x++) {
      const u = x / w;
      const n = fbm(u * 9, v * 9, 5);
      const fine = fbm(u * 130, v * 130, 3);

      // longitudinal colour ramp
      let r: number, g: number, b: number;
      const gold = Math.min(1, Math.max(0, (v - 0.06) / 0.5));
      r = 68 + gold * 108;
      g = 88 + gold * 18;
      b = 22 + gold * 2;

      // sun-facing blush band
      const blush = Math.max(0, 1 - Math.abs(u - 0.28) / 0.22) * Math.max(0, 1 - Math.abs(v - 0.42) / 0.42);
      r += blush * 112;
      g -= blush * 40;
      b -= blush * 2;

      // mottling + faint bloom
      const m = (n - 0.5) * 40;
      r += m;
      g += m * 0.85;
      b += m * 0.4;
      r += (fine - 0.5) * 14;
      g += (fine - 0.5) * 14;
      b += (fine - 0.5) * 10;

      // lenticels (tiny pale specks)
      const sp = hash(Math.floor(x * 0.9), Math.floor(y * 0.9));
      const isSpeck = sp > 0.9965;
      if (isSpeck) {
        r += 46;
        g += 40;
        b += 26;
      }

      // occasional natural blemish
      const bl = fbm(u * 5 + 11, v * 5 + 3, 3);
      const blem = bl > 0.74 ? (bl - 0.74) * 3.4 : 0;
      r -= blem * 70;
      g -= blem * 64;
      b -= blem * 34;

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

  bc.putImageData(img, 0, 0);
  bpc.putImageData(bimg, 0, 0);
  rc.putImageData(rimg, 0, 0);

  return { map: tex(base), bump: tex(bump), rough: tex(rough) };
}

export function woodTexture(tone = 0): THREE.CanvasTexture {
  const w = 512, h = 512, c = C(w, h), ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const grain = Math.sin((x * 0.06) + fbm(x * 0.012, y * 0.05, 4) * 9) * 0.5 + 0.5;
      const knot = fbm(x * 0.008, y * 0.008, 3);
      const v = 0.62 + grain * 0.2 + (knot - 0.5) * 0.22;
      const i = (y * w + x) * 4;
      img.data[i] = 176 * v + tone * 8;
      img.data[i + 1] = 141 * v;
      img.data[i + 2] = 100 * v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return tex(c);
}

export function fibreTexture(r: number, g: number, b: number, scale = 90): THREE.CanvasTexture {
  const w = 256, h = 256, c = C(w, h), ctx = c.getContext('2d')!;
  const img = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = fbm((x / 256) * scale, (y / 256) * scale, 4);
      const i = (y * w + x) * 4;
      const v = 0.78 + n * 0.36;
      img.data[i] = r * v;
      img.data[i + 1] = g * v;
      img.data[i + 2] = b * v;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return tex(c);
}

export function skyEquirect(): THREE.CanvasTexture {
  const w = 1024, h = 512, c = C(w, h), ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#5d6f74');
  g.addColorStop(0.42, '#c8b79a');
  g.addColorStop(0.55, '#f0dcbb');
  g.addColorStop(0.62, '#c2ab8c');
  g.addColorStop(1, '#3c3a33');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const sun = ctx.createRadialGradient(320, 250, 0, 320, 250, 260);
  sun.addColorStop(0, 'rgba(255,240,214,0.95)');
  sun.addColorStop(1, 'rgba(255,240,214,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
