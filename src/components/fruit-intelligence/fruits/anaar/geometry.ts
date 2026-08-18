import * as THREE from 'three';
import { clamp } from '../../core/mathUtils';

const TAU = Math.PI * 2;

/** Deterministic PRNG so every rebuild produces the identical fruit. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type ShapeField = (dir: THREE.Vector3) => THREE.Vector3;

/**
 * Pomegranate silhouette as a radial displacement field over the unit sphere:
 * broad lobes, fine ripples, a few soft dents, a squared shoulder and the
 * characteristic taper up into the neck.
 */
export function shapeFor(seed: number, squat = 0.955): ShapeField {
  const rnd = rng(seed);
  const rd = () => {
    const v = new THREE.Vector3(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    if (v.lengthSq() < 1e-4) v.set(1, 0, 0);
    return v.normalize();
  };

  const waves: { d: THREE.Vector3; f: number; a: number; p: number }[] = [];
  const fine: { d: THREE.Vector3; f: number; a: number; p: number }[] = [];
  const dents: { d: THREE.Vector3; s: number; depth: number }[] = [];

  for (let i = 0; i < 7; i++) {
    waves.push({ d: rd(), f: 1.1 + rnd() * 2.0, a: 0.021 / (1 + i * 0.4), p: rnd() * TAU });
  }
  for (let i = 0; i < 6; i++) {
    fine.push({ d: rd(), f: 4 + rnd() * 6, a: 0.005, p: rnd() * TAU });
  }
  const nd = 2 + Math.floor(rnd() * 3);
  for (let i = 0; i < nd; i++) {
    dents.push({ d: rd(), s: 0.26 + rnd() * 0.3, depth: 0.018 + rnd() * 0.032 });
  }
  const lobes = 5 + Math.floor(rnd() * 3);
  const lp = rnd() * TAU;

  return (dir: THREE.Vector3): THREE.Vector3 => {
    let r = 1;
    for (const w of waves) r += w.a * Math.sin(w.f * dir.dot(w.d) * 2.2 + w.p);
    for (const w of fine) r += w.a * Math.sin(w.f * dir.dot(w.d) * 2.2 + w.p);

    const az = Math.atan2(dir.z, dir.x);
    const eq = 1 - dir.y * dir.y;
    r += 0.023 * Math.cos(lobes * az + lp) * eq;

    for (const d of dents) {
      const ang = Math.acos(clamp(dir.dot(d.d), -1, 1));
      r -= d.depth * Math.exp(-(ang * ang) / (2 * d.s * d.s));
    }

    const p = dir.clone().multiplyScalar(r);
    p.y *= squat;

    // Taper into the neck, then flatten the crown and base shoulders.
    const ty = clamp((p.y - 0.4) / 0.6, 0, 1);
    const taper = 1 - 0.63 * Math.pow(ty, 1.65);
    p.x *= taper;
    p.z *= taper;
    if (p.y > 0.48) p.y = 0.48 + (p.y - 0.48) * 0.84;
    if (p.y < -0.74) p.y = -0.74 + (p.y + 0.74) * 0.88;
    return p;
  };
}

/** Sweeps the shape field between two azimuths — full sphere or a cut half. */
export function bodyGeometry(
  shape: ShapeField,
  a0: number,
  a1: number,
  segA: number,
  segV: number
): THREE.BufferGeometry {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  const d = new THREE.Vector3();

  for (let j = 0; j <= segV; j++) {
    const v = j / segV;
    const phi = v * Math.PI;
    for (let i = 0; i <= segA; i++) {
      const u = i / segA;
      const a = a0 + u * (a1 - a0);
      d.set(Math.sin(phi) * Math.cos(a), Math.cos(phi), Math.sin(phi) * Math.sin(a));
      const p = shape(d);
      pos.push(p.x, p.y, p.z);
      uv.push((a / TAU + 1) % 1, 1 - v);
    }
  }

  const row = segA + 1;
  for (let j = 0; j < segV; j++) {
    for (let i = 0; i < segA; i++) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row;
      const e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** A single aril: teardrop-tapered icosahedron with slight irregularity. */
export function arilGeometry(): THREE.BufferGeometry {
  const g = new THREE.IcosahedronGeometry(1, 3);
  const p = g.attributes.position as THREE.BufferAttribute;
  const rnd = rng(5);
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const t = (y + 1) / 2;
    const sh = 0.72 + 0.42 * t;
    p.setX(i, p.getX(i) * sh * (0.95 + rnd() * 0.1));
    p.setZ(i, p.getZ(i) * sh * (0.95 + rnd() * 0.1));
    p.setY(i, y * 1.02);
  }
  g.computeVertexNormals();
  return g;
}

export interface AlbedoSpoke {
  a: number;
  w: number;
  from: number;
}

export interface PackedAril {
  px: number;
  py: number;
  t: number;
  psi: number;
  r: number;
  k: number;
}

/**
 * Poisson-ish packing of arils across the cut face, avoiding the membrane
 * spokes and the central core so chambers read as uneven rooms.
 */
export function packFace(
  seed: number,
  count: number
): { pts: PackedAril[]; spokes: AlbedoSpoke[] } {
  const rnd = rng(seed + 4242);
  const n = 5 + Math.floor(rnd() * 3);
  const spokes: AlbedoSpoke[] = [];
  for (let i = 0; i < n; i++) {
    spokes.push({
      a: (i / n) * TAU + (rnd() - 0.5) * 0.75,
      w: 0.017 + rnd() * 0.015,
      from: rnd() > 0.6 ? 0.3 + rnd() * 0.3 : 0,
    });
  }

  const pts: PackedAril[] = [];
  const rMin = 0.113;
  let tries = 0;
  const ad = (a: number, b: number): number => {
    const d = Math.abs(a - b) % TAU;
    return d > Math.PI ? TAU - d : d;
  };

  while (pts.length < count && tries < count * 70) {
    tries++;
    const t = Math.sqrt(rnd()) * 0.93;
    const psi = rnd() * TAU;
    if (t < 0.12) continue;

    let bad = false;
    for (const s of spokes) {
      if (t > s.from && ad(psi, s.a) * Math.max(t, 0.22) < s.w) {
        bad = true;
        break;
      }
    }
    if (bad) continue;

    const px = t * Math.cos(psi);
    const py = t * Math.sin(psi);
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].px - px;
      const dy = pts[i].py - py;
      if (dx * dx + dy * dy < rMin * rMin) {
        bad = true;
        break;
      }
    }
    if (bad) continue;

    pts.push({ px, py, t, psi, r: 0.05 + rnd() * 0.014, k: rnd() });
  }

  return { pts, spokes };
}

export interface CutFace {
  geometry: THREE.BufferGeometry;
  facePoint: (t: number, psi: number) => THREE.Vector3;
  center: THREE.Vector3;
}

/**
 * The flat interior face of a half, built from the silhouette's own boundary
 * so the rind outline matches the skin exactly.
 */
export function cutFaceGeometry(shape: ShapeField, rings = 12, radials = 132): CutFace {
  const dir = new THREE.Vector3();
  const bnd: THREE.Vector3[] = [];
  for (let i = 0; i < radials; i++) {
    const psi = (i / radials) * TAU;
    dir.set(0, Math.cos(psi), Math.sin(psi));
    bnd.push(shape(dir).clone());
  }

  let cy = 0;
  let cz = 0;
  for (const p of bnd) {
    cy += p.y;
    cz += p.z;
  }
  cy /= radials;
  cz /= radials;
  const center = new THREE.Vector3(0, cy, cz);

  const facePoint = (t: number, psi: number): THREE.Vector3 => {
    const fi = (psi / TAU) * radials;
    const i0 = Math.floor(fi) % radials;
    const i1 = (i0 + 1) % radials;
    const f = fi - Math.floor(fi);
    const b = bnd[i0].clone().lerp(bnd[i1], f);
    const p = center.clone().lerp(b, t);
    p.x = 0.05 * (1 - t * t);
    return p;
  };

  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let k = 0; k <= rings; k++) {
    const t = k / rings;
    for (let i = 0; i <= radials; i++) {
      const psi = (i / radials) * TAU;
      const p = facePoint(t, psi);
      pos.push(p.x, p.y, p.z);
      uv.push(0.5 + 0.5 * t * Math.cos(psi), 0.5 + 0.5 * t * Math.sin(psi));
    }
  }

  const row = radials + 1;
  for (let k = 0; k < rings; k++) {
    for (let i = 0; i < radials; i++) {
      const a = k * row + i;
      const b = a + 1;
      const c = a + row;
      const e = c + 1;
      idx.push(a, b, c, b, e, c);
    }
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();

  // Face must look down -X; flip winding if the normals came out inverted.
  const normal = g.attributes.normal as THREE.BufferAttribute;
  if (normal.getX(20) > 0 && g.index) {
    const arr = g.index.array as unknown as number[];
    for (let i = 0; i < arr.length; i += 3) {
      const t = arr[i];
      arr[i] = arr[i + 2];
      arr[i + 2] = t;
    }
    g.index.needsUpdate = true;
    g.computeVertexNormals();
  }

  return { geometry: g, facePoint, center };
}

export interface CrownParts {
  group: THREE.Group;
  disposables: { dispose(): void }[];
}

/**
 * Calyx: short neck, dark opening and six-to-eight dried sepals splayed
 * outward — the earliest honest signal the fruit gives.
 */
export function crownGroup(seed: number, neckY: number, neckR: number): CrownParts {
  const rnd = rng(seed + 55);
  const group = new THREE.Group();
  const disposables: { dispose(): void }[] = [];

  const dryMat = new THREE.MeshPhysicalMaterial({
    color: 0x7a4228,
    roughness: 0.96,
    clearcoat: 0.04,
    envMapIntensity: 0.35,
    sheen: 0.2,
    sheenColor: new THREE.Color(0xa87a52),
    side: THREE.DoubleSide,
  });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x24100b, roughness: 1 });
  const neckMat = new THREE.MeshPhysicalMaterial({
    color: 0x3a1013,
    roughness: 1,
    clearcoat: 0,
    envMapIntensity: 0.2,
  });
  disposables.push(dryMat, darkMat, neckMat);

  const lathePts: THREE.Vector2[] = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    lathePts.push(
      new THREE.Vector2(neckR * (1 - 0.36 * t + 0.07 * Math.sin(t * 3.1)), neckY + t * 0.075)
    );
  }
  const neckGeo = new THREE.LatheGeometry(lathePts, 28);
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.castShadow = true;
  group.add(neck);
  disposables.push(neckGeo);

  const holeGeo = new THREE.CircleGeometry(neckR * 0.62, 20);
  const hole = new THREE.Mesh(holeGeo, darkMat);
  hole.rotation.x = -Math.PI / 2;
  hole.position.y = neckY + 0.09;
  group.add(hole);
  disposables.push(holeGeo);

  const n = 6 + Math.floor(rnd() * 3);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU + (rnd() - 0.5) * 0.28;
    const len = 0.115 + rnd() * 0.085;
    const wid = 0.044 + rnd() * 0.022;

    const geo = new THREE.ConeGeometry(wid, len, 5, 4, false);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    for (let v = 0; v < pos.count; v++) {
      const py = pos.getY(v);
      const t = (py + len / 2) / len;
      pos.setZ(v, pos.getZ(v) * 0.42);
      pos.setX(v, pos.getX(v) * (1 - 0.25 * t));
      pos.setY(v, py - 0.05 * t * t);
    }
    geo.computeVertexNormals();
    disposables.push(geo);

    const m = new THREE.Mesh(geo, dryMat);
    m.castShadow = true;
    const tilt = 0.34 + rnd() * 0.5;
    m.position.set(Math.cos(a) * neckR * 0.72, neckY + 0.1, Math.sin(a) * neckR * 0.72);
    m.quaternion.setFromUnitVectors(
      up,
      new THREE.Vector3(Math.cos(a) * Math.sin(tilt), Math.cos(tilt), Math.sin(a) * Math.sin(tilt))
    );
    m.translateY(len * 0.42);
    group.add(m);
  }

  return { group, disposables };
}
