import * as THREE from 'three';
import { fbm } from './proceduralTextures';

export function mangoGeometry(seed = 0, widthSegments = 110, heightSegments = 90): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(0.5, widthSegments, heightSegments);
  const p = g.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const t = v.y + 0.5; // 0 tip -> 1 stem
    v.y *= 1.52;
    const taper = 0.94 - Math.pow(Math.abs(v.y / 0.76), 3.1) * 0.30;
    v.x *= taper * 1.02;
    v.z *= taper * 0.86;

    // asymmetric belly + beak
    v.x += Math.pow(Math.max(0, 0.72 - t), 2) * 0.10 - 0.02;
    v.z += Math.sin(t * Math.PI) * 0.018;

    // organic imperfection
    const n = fbm(v.x * 6 + seed * 3.3, v.y * 6 + seed, 4) - 0.5;
    const d = 1 + n * 0.055;
    v.multiplyScalar(d);

    // stem dimple
    const dip = Math.max(0, 1 - Math.hypot(v.x - 0.02, (v.y - 0.74) * 1.1, v.z) / 0.20);
    v.y -= dip * dip * 0.055;

    p.setXYZ(i, v.x, v.y, v.z);
  }

  g.computeVertexNormals();
  g.scale(0.105, 0.105, 0.105);
  return g;
}
