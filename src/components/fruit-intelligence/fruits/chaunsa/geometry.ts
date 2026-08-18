import * as THREE from 'three';
import { clamp } from '../../core/mathUtils';

// Chaunsa silhouette: obliquely oval, laterally compressed, gently kidneyed,
// broad shoulder at the stem, rounded nose with a faint beak.
export function mangoSurface(u: number, v: number, out: THREE.Vector3): THREE.Vector3 {
  const th = u * Math.PI * 2;
  const t = Math.pow(v, 0.94);
  let R = Math.pow(Math.max(Math.sin(Math.PI * t), 0.0001), 0.46);
  R *= 0.95 + 0.06 * (1 - v) + 0.05 * v;
  // stem shoulder is fuller, nose stays round
  R *= 1 - 0.05 * Math.pow(v, 3.0);
  const c = Math.cos(th), s = Math.sin(th);
  // dorsal side (c<0) is flatter than the belly
  const flat = c < 0 ? 1 - 0.13 * (-c) : 1;
  let x = R * c * flat;
  const z = R * s * 0.79;
  let y = 1 - 2 * v;
  // kidney bend of the long axis
  x += 0.135 * Math.sin(Math.PI * Math.pow(v, 0.94)) - 0.015;
  // faint beak near the nose, belly side
  const beak = Math.pow(clamp((v - 0.86) / 0.14, 0, 1), 2) * 0.035;
  x += beak * Math.max(0, c);
  y -= beak * 0.35;
  // stem sinus: shallow dimple at the top pole
  const sinus = Math.pow(clamp((0.08 - v) / 0.08, 0, 1), 1.9);
  y -= sinus * 0.035;
  out.set(x * 0.78, y * 1.04, z * 0.78);
  return out;
}

export interface GridData {
  pos: number[];
  uv: number[];
  segU: number;
  segV: number;
}

export function buildGrid(segU: number, segV: number): GridData {
  const pos: number[] = [], uv: number[] = [];
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

export function buildFromGrid(
  g: GridData,
  transform?: (x: number, y: number, z: number) => [number, number, number]
): THREE.BufferGeometry {
  const { segU, segV } = g;
  const P: number[] = [], U: number[] = [];
  const push = (idx: number) => {
    const a = idx * 3;
    let x = g.pos[a], y = g.pos[a + 1], z = g.pos[a + 2];
    if (transform) {
      const r = transform(x, y, z);
      x = r[0]; y = r[1]; z = r[2];
    }
    P.push(x, y, z);
    U.push(g.uv[idx * 2], g.uv[idx * 2 + 1]);
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

export function createWholeMangoGeometry(segU: number, segV: number): THREE.BufferGeometry {
  return buildFromGrid(buildGrid(segU, segV));
}

// A cut piece: everything on the wrong side of z = cutZ is projected onto the
// plane, so the mesh stays closed and gains a flat flesh face.
export function createCutPieceGeometry(
  cutZ: number,
  keepSign: number,
  segU: number,
  segV: number
): { shell: THREE.BufferGeometry; cap: THREE.BufferGeometry } {
  const g = buildGrid(segU, segV);
  const { pos } = g;
  const inside = (i: number) => (pos[i * 3 + 2] - cutZ) * keepSign > 0;
  const shell = { P: [] as number[], U: [] as number[] };
  const cap = { P: [] as number[], U: [] as number[] };

  const put = (bucket: { P: number[]; U: number[] }, idx: number, planar: boolean) => {
    const a = idx * 3;
    let x = pos[a], y = pos[a + 1], z = pos[a + 2];
    if (planar && (z - cutZ) * keepSign < 0) z = cutZ;
    bucket.P.push(x, y, z);
    if (planar) {
      bucket.U.push(x * 0.62 + 0.5, y * 0.42 + 0.5);
    } else {
      bucket.U.push(g.uv[idx * 2], g.uv[idx * 2 + 1]);
    }
  };

  const tri = (i0: number, i1: number, i2: number) => {
    const n = (inside(i0) ? 1 : 0) + (inside(i1) ? 1 : 0) + (inside(i2) ? 1 : 0);
    const isCap = n === 0;
    const b = isCap ? cap : shell;
    put(b, i0, isCap);
    put(b, i1, isCap);
    put(b, i2, isCap);
  };

  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segU; i++) {
      const a = j * (segU + 1) + i, b = a + 1, c = a + segU + 1, d = c + 1;
      tri(a, c, b);
      tri(b, c, d);
    }
  }

  const mk = (b: { P: number[]; U: number[] }, flat: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(b.P, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.U, 2));
    if (flat) {
      const n: number[] = [];
      for (let i = 0; i < b.P.length / 3; i++) {
        n.push(0, 0, keepSign > 0 ? -1 : 1);
      }
      geo.setAttribute('normal', new THREE.Float32BufferAttribute(n, 3));
    } else {
      geo.computeVertexNormals();
    }
    return geo;
  };

  return { shell: mk(shell, false), cap: mk(cap, true) };
}

export function createSeedGeometry(segU: number, segV: number): THREE.BufferGeometry {
  const g = buildGrid(segU, segV);
  return buildFromGrid(g, (x, y, z) => [x * 0.46, y * 0.54, z * 0.30]);
}

export function createKnifeBladeGeometry(): THREE.BufferGeometry {
  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(-0.78, -0.085);
  bladeShape.lineTo(0.92, -0.02);
  bladeShape.quadraticCurveTo(1.06, 0.015, 0.86, 0.085);
  bladeShape.lineTo(-0.78, 0.135);
  bladeShape.closePath();

  return new THREE.ExtrudeGeometry(bladeShape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelSize: 0.008,
    bevelThickness: 0.006,
    bevelSegments: 2,
  });
}
