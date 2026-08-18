import * as THREE from 'three';
import { lerp } from '../../core/mathUtils';

const TAU = Math.PI * 2;

export interface AppleShape {
  lobe: number;
  lobePh: number;
  a1: number;
  p1: number;
  a2: number;
  p2: number;
  dentAz: number;
  dentV: number;
  dentD: number;
  squash: number;
  waist: number;
  tilt: number;
}

export function makeShape(seed: number): AppleShape {
  const s = (i: number) => Math.sin(seed * (i * 12.9898) + i * 4.1) * 0.5 + 0.5;
  return {
    lobe: 0.006 + 0.005 * s(1),
    lobePh: s(2) * TAU,
    a1: 0.010 + 0.008 * s(3),
    p1: s(4) * TAU,
    a2: 0.007 + 0.006 * s(5),
    p2: s(6) * TAU,
    dentAz: s(7) * TAU,
    dentV: 0.4 + 0.3 * s(8),
    dentD: 0.006 + 0.010 * s(9),
    squash: 1.02 + 0.05 * s(10),
    waist: 0.42 + 0.05 * s(11),
    tilt: (s(12) - 0.5) * 0.04,
  };
}

export const DEFAULT_APPLE_SHAPE = makeShape(0.41);

// v: 0 at the stem basin, 1 at the calyx. Widest a little above the middle.
export function radiusAt(az: number, v: number, sh: AppleShape): number {
  const basin = 0.26 * Math.exp(-Math.pow(v / 0.17, 2)); // stem well
  const calyx = 0.13 * Math.exp(-Math.pow((1 - v) / 0.13, 2)); // blossom well
  const belly = 1 + 0.035 * Math.exp(-Math.pow((v - sh.waist) / 0.32, 2));
  let r = belly - basin - calyx;

  // soft ridging, visible around the two wells
  const lobeAmp =
    sh.lobe *
    (0.3 + 1.2 * (Math.exp(-Math.pow(v / 0.26, 2)) + Math.exp(-Math.pow((1 - v) / 0.24, 2))));
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

export function point(
  az: number,
  v: number,
  R: number,
  sh: AppleShape,
  out: THREE.Vector3
): THREE.Vector3 {
  const ph = v * Math.PI;
  const s = Math.sin(ph);
  const c = Math.cos(ph);
  const r = radiusAt(az, v, sh) * R;
  const x = Math.cos(az) * s * r;
  const z = Math.sin(az) * s * r;
  const y = c * r * sh.squash;
  out.set(x + sh.tilt * y * 0.4, y, z);
  return out;
}

export function meshFromGrid(rows: THREE.Vector3[][], uvs: number[][][]): THREE.BufferGeometry {
  const P: number[] = [];
  const U: number[] = [];
  for (let j = 0; j < rows.length - 1; j++) {
    for (let i = 0; i < rows[j].length - 1; i++) {
      const a = rows[j][i];
      const b = rows[j][i + 1];
      const c = rows[j + 1][i];
      const d = rows[j + 1][i + 1];

      const ua = uvs[j][i];
      const ub = uvs[j][i + 1];
      const uc = uvs[j + 1][i];
      const ud = uvs[j + 1][i + 1];

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

export function fruitGeometry(segU: number, segV: number, sh: AppleShape): THREE.BufferGeometry {
  const rows: THREE.Vector3[][] = [];
  const uvs: number[][][] = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= segV; j++) {
    const row: THREE.Vector3[] = [];
    const uv: number[][] = [];
    for (let i = 0; i <= segU; i++) {
      row.push(point((i / segU) * TAU, j / segV, 1, sh, p).clone());
      uv.push([i / segU, 1 - j / segV]);
    }
    rows.push(row);
    uvs.push(uv);
  }
  return meshFromGrid(rows, uvs);
}

// One wedge: curved skin band plus two flat cut faces running in to the core axis.
export function wedgeGeometry(
  halfWidth: number,
  segU: number,
  segV: number,
  sh: AppleShape,
  coreR: number
): { skin: THREE.BufferGeometry; faces: [THREE.BufferGeometry, THREE.BufferGeometry] } {
  const p = new THREE.Vector3();
  const rows: THREE.Vector3[][] = [];
  const uvs: number[][][] = [];
  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const row: THREE.Vector3[] = [];
    const uv: number[][] = [];
    for (let i = 0; i <= segU; i++) {
      const f = i / segU;
      const az = lerp(-halfWidth, halfWidth, f);
      row.push(point(az, v, 1, sh, p).clone());
      uv.push([f, 1 - v]);
    }
    rows.push(row);
    uvs.push(uv);
  }
  const skin = meshFromGrid(rows, uvs);

  // Cut face: u = 0 at core axis, u = 1 at skin
  const face = (idx: number, flip: boolean) => {
    const gr: THREE.Vector3[][] = [];
    const gu: number[][][] = [];
    const steps = 12;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps;
      const row: THREE.Vector3[] = [];
      const uv: number[][] = [];
      for (let j = 0; j <= segV; j++) {
        const edge = rows[j][idx];
        const axis = new THREE.Vector3(sh.tilt * edge.y * 0.4, edge.y, 0);
        row.push(axis.clone().lerp(edge, coreR + (1 - coreR) * t));
        uv.push([t, j / segV]);
      }
      gr.push(row);
      gu.push(uv);
    }
    return meshFromGrid(
      flip ? gr.map((r) => r.slice().reverse()) : gr,
      flip ? gu.map((r) => r.slice().reverse()) : gu
    );
  };

  return { skin, faces: [face(0, true), face(segU, false)] };
}

// Flat cap matching the body's own outline in the z = 0 plane.
export function crossFaceGeometry(sh: AppleShape, steps: number): THREE.BufferGeometry {
  const p = new THREE.Vector3();
  const outline: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) {
    outline.push(point(0, i / steps, 1, sh, p).clone());
  }
  for (let i = steps - 1; i >= 1; i--) {
    outline.push(point(Math.PI, i / steps, 1, sh, p).clone());
  }
  const P: number[] = [];
  const U: number[] = [];
  const pad = 1.004;
  const uvOf = (q: THREE.Vector3): [number, number] => [
    (q.x * pad) / 2 + 0.5,
    0.5 - (q.y * pad) / 2,
  ];

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i];
    const b = outline[(i + 1) % outline.length];
    P.push(0, 0, 0, a.x * pad, a.y * pad, 0, b.x * pad, b.y * pad, 0);
    U.push(0.5, 0.5);
    const uva = uvOf(a);
    const uvb = uvOf(b);
    U.push(uva[0], uva[1], uvb[0], uvb[1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.computeVertexNormals();
  return g;
}
