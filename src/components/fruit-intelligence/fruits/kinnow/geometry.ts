import * as THREE from 'three';
import { clamp, lerp } from '../../core/mathUtils';

const TAU = Math.PI * 2;

export interface KinnowShape {
  a1: number;
  p1: number;
  a2: number;
  p2: number;
  a3: number;
  p3: number;
  dentAz: number;
  dentV: number;
  dentD: number;
  squash: number;
  tilt: number;
}

export function makeShape(seed: number): KinnowShape {
  const s = (i: number) => Math.sin(seed * (i * 12.9898) + i * 4.1) * 0.5 + 0.5;
  return {
    a1: 0.020 + 0.014 * s(1),
    p1: s(2) * TAU,
    a2: 0.014 + 0.012 * s(3),
    p2: s(4) * TAU,
    a3: 0.009 + 0.008 * s(5),
    p3: s(6) * TAU,
    dentAz: s(7) * TAU,
    dentV: 0.35 + 0.3 * s(8),
    dentD: 0.012 + 0.016 * s(9),
    squash: 0.83 + 0.06 * s(10),
    tilt: (s(11) - 0.5) * 0.06,
  };
}

export const DEFAULT_SHAPE: KinnowShape = makeShape(0.37);

export function radiusAt(az: number, v: number, sh: KinnowShape): number {
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

export function evaluatePoint(
  az: number,
  v: number,
  R: number,
  sh: KinnowShape,
  out: THREE.Vector3
): THREE.Vector3 {
  const ph = v * Math.PI;
  const s = Math.sin(ph), c = Math.cos(ph);
  const r = radiusAt(az, v, sh) * R;
  const x = Math.cos(az) * s * r, z = Math.sin(az) * s * r;
  const y = c * r * sh.squash;
  out.set(x + sh.tilt * y * 0.4, y, z);
  return out;
}

export function meshFromGrid(rows: THREE.Vector3[][], uvs: number[][][]): THREE.BufferGeometry {
  const P: number[] = [], U: number[] = [];
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

export function createFruitGeometry(
  segU: number,
  segV: number,
  R: number,
  sh: KinnowShape = DEFAULT_SHAPE
): THREE.BufferGeometry {
  const rows: THREE.Vector3[][] = [], uvs: number[][][] = [];
  const p = new THREE.Vector3();
  for (let j = 0; j <= segV; j++) {
    const row: THREE.Vector3[] = [], uv: number[][] = [];
    for (let i = 0; i <= segU; i++) {
      row.push(evaluatePoint((i / segU) * TAU, j / segV, R, sh, p).clone());
      uv.push([i / segU, 1 - j / segV]);
    }
    rows.push(row);
    uvs.push(uv);
  }
  return meshFromGrid(rows, uvs);
}

export interface PetalBand {
  outer: THREE.BufferGeometry;
  inner: THREE.BufferGeometry;
  rims: THREE.BufferGeometry[];
}

export interface PetalBandsResult {
  upper: PetalBand;
  lower: PetalBand;
  stemPivot: THREE.Vector3;
  splitPivot: THREE.Vector3;
}

export function createPetalBands(
  halfWidth: number,
  segU: number,
  segV: number,
  rOuter: number,
  rInner: number,
  sh: KinnowShape,
  splitV: number
): PetalBandsResult {
  const p = new THREE.Vector3();
  const vTop = 0.05, vBot = 0.995;

  const bandOf = (v0: number, v1: number, pivot: THREE.Vector3): PetalBand => {
    const oRows: THREE.Vector3[][] = [], iRows: THREE.Vector3[][] = [];
    const oUV: number[][][] = [], iUV: number[][][] = [];

    for (let j = 0; j <= segV; j++) {
      const v = lerp(v0, v1, j / segV);
      const oR: THREE.Vector3[] = [], iR: THREE.Vector3[] = [];
      const ou: number[][] = [], iu: number[][] = [];

      for (let i = 0; i <= segU; i++) {
        const f = i / segU, az = lerp(-halfWidth, halfWidth, f);
        const o = evaluatePoint(az, v, rOuter, sh, p).clone();
        const n = evaluatePoint(az, v, rInner, sh, p).clone();
        o.sub(pivot);
        n.sub(pivot);
        oR.push(o);
        iR.push(n);
        const tv = lerp(v0, v1, j / segV);
        ou.push([f, 1 - tv]);
        iu.push([f, 1 - tv]);
      }
      oRows.push(oR);
      iRows.push(iR);
      oUV.push(ou);
      iUV.push(iu);
    }

    const inner = meshFromGrid(
      iRows.map((r) => r.slice().reverse()),
      iUV.map((r) => r.slice().reverse())
    );

    const edge = (idx: number) => {
      const o: THREE.Vector3[] = [], n: THREE.Vector3[] = [];
      const uo: number[][] = [], un: number[][] = [];
      for (let j = 0; j <= segV; j++) {
        o.push(oRows[j][idx]);
        n.push(iRows[j][idx]);
        uo.push([0, j / segV]);
        un.push([1, j / segV]);
      }
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

  const stemPivot = evaluatePoint(0, vTop, rOuter, sh, new THREE.Vector3()).clone();
  stemPivot.x = 0;
  stemPivot.z = 0;
  const splitPivot = evaluatePoint(0, splitV, (rOuter + rInner) / 2, sh, new THREE.Vector3()).clone();

  return {
    upper: bandOf(vTop, splitV, stemPivot),
    lower: bandOf(splitV, vBot, splitPivot),
    stemPivot,
    splitPivot,
  };
}

export function createSegmentGeometry(
  halfWidth: number,
  segU: number,
  segV: number,
  R: number,
  sh: KinnowShape
): { outer: THREE.BufferGeometry; sides: THREE.BufferGeometry[] } {
  const p = new THREE.Vector3();
  const rows: THREE.Vector3[][] = [], uvs: number[][][] = [];
  const vTop = 0.06, vBot = 0.95;

  for (let j = 0; j <= segV; j++) {
    const v = lerp(vTop, vBot, j / segV);
    const row: THREE.Vector3[] = [], uv: number[][] = [];
    for (let i = 0; i <= segU; i++) {
      const f = i / segU, az = lerp(-halfWidth, halfWidth, f);
      row.push(evaluatePoint(az, v, R, sh, p).clone());
      uv.push([f, 1 - j / segV]);
    }
    rows.push(row);
    uvs.push(uv);
  }

  const outer = meshFromGrid(rows, uvs);

  const side = (idx: number, flip: boolean) => {
    const gr: THREE.Vector3[][] = [], gu: number[][][] = [], steps = 10;
    for (let k = 0; k <= steps; k++) {
      const t = k / steps, row: THREE.Vector3[] = [], uv: number[][] = [];
      for (let j = 0; j <= segV; j++) {
        const edgePt = rows[j][idx];
        const axis = new THREE.Vector3(0, edgePt.y * 0.55, 0);
        row.push(axis.clone().lerp(edgePt, 0.1 + 0.9 * t));
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

  return { outer, sides: [side(0, true), side(segU, false)] };
}

export function createCrossFaceGeometry(sh: KinnowShape, steps: number): THREE.BufferGeometry {
  const p = new THREE.Vector3();
  const outline: THREE.Vector3[] = [];
  for (let i = 0; i <= steps; i++) outline.push(evaluatePoint(0, i / steps, 1, sh, p).clone());
  for (let i = steps - 1; i >= 1; i--) outline.push(evaluatePoint(Math.PI, i / steps, 1, sh, p).clone());

  const P: number[] = [], U: number[] = [];
  const pad = 1.003;
  const uvOf = (q: THREE.Vector3) => [(q.x * pad) / 2 + 0.5, (q.y * pad) / 2 + 0.5];

  for (let i = 0; i < outline.length; i++) {
    const a = outline[i], b = outline[(i + 1) % outline.length];
    P.push(0, 0, 0, a.x * pad, a.y * pad, 0, b.x * pad, b.y * pad, 0);
    U.push(0.5, 0.5);
    const uva = uvOf(a), uvb = uvOf(b);
    U.push(uva[0], uva[1], uvb[0], uvb[1]);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2));
  g.computeVertexNormals();
  return g;
}

export function createKinnowStemButton(stemMat: THREE.Material, sh: KinnowShape): THREE.Group {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.062, 0.028, 16), stemMat);
  const nub = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.036, 0.05, 12), stemMat);
  nub.position.y = 0.03;
  g.add(disc, nub);
  g.position.set(0, sh.squash * 0.93, 0);
  return g;
}
