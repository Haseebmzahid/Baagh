import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';
import { fibreTexture, hash, fbm } from '../procedural/proceduralTextures';

export const Station6Packing: React.FC = () => {
  const materials = useMemo(() => getSceneMaterials(), []);

  const geoM = useMemo(() => [
    mangoGeometry(0),
    mangoGeometry(1.7),
    mangoGeometry(3.4),
  ], []);

  // Scale materials
  const scalePlateMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7d786c', roughness: 0.45, metalness: 0.7 }),
    []
  );

  const scaleBodyMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#4a463f', roughness: 0.6 }),
    []
  );

  // Sack material
  const sackMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: fibreTexture(122, 108, 80, 140),
        roughness: 1,
      }),
    []
  );

  // Paper Liner Geometry for Pack Crate
  const linerGeo = useMemo(() => {
    const W = 0.62 * 1.05 * 0.94;
    const D = 0.42 * 1.05 * 0.9;
    const geo = new THREE.PlaneGeometry(W, D, 12, 8);
    const lp = geo.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      lp.setZ(i, (fbm(lp.getX(i) * 14, lp.getY(i) * 14, 3) - 0.5) * 0.02);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // 5 Orchard trees data behind Station 6
  const stationTrees = useMemo(() => {
    const trees: Array<{ x: number; z: number; s: number; canopies: Array<{ pos: [number, number, number]; r: number }> }> = [];
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * 3.4;
      const z = -7 - hash(i, 2) * 3;
      const s = 0.9;
      const canopies: Array<{ pos: [number, number, number]; r: number }> = [];

      for (let cIdx = 0; cIdx < 9; cIdx++) {
        const r0 = 0.42 * s * (0.55 + hash(x + cIdx, z) * 0.7);
        const cx = (hash(x, z + cIdx) - 0.5) * 1.5 * s;
        const cy = (1.25 + hash(cIdx, x) * 1.1) * s;
        const cz = (hash(z, x + cIdx) - 0.5) * 1.5 * s;
        canopies.push({ pos: [cx, cy, cz], r: r0 });
      }

      trees.push({ x, z, s, canopies });
    }
    return trees;
  }, []);

  return (
    <group name="station-6-packing-group">
      {/* Dark Table at X=24 (2.8 x 1.3, h=0.76) */}
      <group position={[24, 0, 0]}>
        <mesh position={[0, 0.76, 0]} material={materials.woodDark} castShadow receiveShadow>
          <boxGeometry args={[2.8, 0.06, 1.3]} />
        </mesh>
        {[
          [-2.8 / 2 + 0.1, -1.3 / 2 + 0.1],
          [2.8 / 2 - 0.1, -1.3 / 2 + 0.1],
          [-2.8 / 2 + 0.1, 1.3 / 2 - 0.1],
          [2.8 / 2 - 0.1, 1.3 / 2 - 0.1],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.76 / 2, lz]} material={materials.woodDark} castShadow>
            <boxGeometry args={[0.07, 0.76, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* Pack Crate at (24, 0.79, 0, scale 1.05) */}
      <group position={[24, 0.79, 0]} scale={[1.05, 1.05, 1.05]}>
        <mesh material={materials.woodMat} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.014, 0.42]} />
        </mesh>
        {[1, -1].map((dir, idx) => (
          <React.Fragment key={idx}>
            <mesh position={[0, 0.19 / 2, dir * (0.42 / 2)]} material={materials.woodDark} castShadow receiveShadow>
              <boxGeometry args={[0.62, 0.19, 0.014]} />
            </mesh>
            <mesh position={[dir * (0.62 / 2), 0.19 / 2, 0]} material={materials.woodDark} castShadow receiveShadow>
              <boxGeometry args={[0.014, 0.19, 0.42]} />
            </mesh>
          </React.Fragment>
        ))}
        <mesh geometry={linerGeo} material={materials.paperMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow />
      </group>

      {/* 6 Wrapped Mangoes in 3x2 grid */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const mx = 23.76 + (i % 3) * 0.24;
        const mz = -0.09 + Math.floor(i / 3) * 0.2;
        return (
          <React.Fragment key={i}>
            {/* Mango */}
            <mesh
              geometry={geoM[i % 3]}
              material={materials.skinMat}
              position={[mx, 0.885, mz]}
              rotation={[0.2, i * 1.1, 0.9]}
              scale={[0.95, 0.95, 0.95]}
              castShadow
              receiveShadow
            />
            {/* Paper disc wrap */}
            <mesh
              material={materials.paperMat}
              position={[mx, 0.80, mz]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <circleGeometry args={[0.10, 20]} />
            </mesh>
          </React.Fragment>
        );
      })}

      {/* Scale Group at (24.95, 0.81, 0.18) */}
      <group position={[24.95, 0.81, 0.18]}>
        <mesh position={[0, 0, 0]} material={scaleBodyMat} castShadow>
          <boxGeometry args={[0.3, 0.1, 0.24]} />
        </mesh>
        <mesh position={[0, 0.1, 0]} material={scalePlateMat} castShadow>
          <cylinderGeometry args={[0.19, 0.19, 0.012, 36]} />
        </mesh>
      </group>

      {/* Paper Stack at (23.1, 0.81, 0.2) */}
      <mesh material={materials.paperMat} position={[23.1, 0.81, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.05, 0.3]} />
      </mesh>

      {/* Surrounding props */}
      {/* Crate Stack at (22.9, 0.8, 4) (4 crates) */}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          position={[
            22.9 + (hash(i, 22.9) - 0.5) * 0.05,
            0.02 + i * 0.2 + 0.8,
            4.0,
          ]}
          rotation={[0, 0.1 + (hash(i, 4.0) - 0.5) * 0.2, 0]}
        >
          <mesh material={materials.woodMat} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.014, 0.42]} />
          </mesh>
        </group>
      ))}

      {/* Crate Stack at (25.3, 0.75, 2) (2 crates) */}
      {[0, 1].map((i) => (
        <group
          key={i}
          position={[
            25.3 + (hash(i, 25.3) - 0.5) * 0.05,
            0.02 + i * 0.2 + 0.75,
            2.0,
          ]}
          rotation={[0, -0.35 + (hash(i, 2.0) - 0.5) * 0.2, 0]}
        >
          <mesh material={materials.woodMat} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.014, 0.42]} />
          </mesh>
        </group>
      ))}

      {/* Sack at (24.9, 1.5, 1.0) */}
      <mesh material={sackMat} position={[24.9, 0.3, 1.0]} scale={[1, 1.25, 0.85]} castShadow receiveShadow>
        <sphereGeometry args={[0.28, 20, 14]} />
      </mesh>

      {/* 5 Orchard trees behind Station 6 */}
      <group name="station-6-trees-group">
        {stationTrees.map((t, idx) => (
          <group key={idx} position={[t.x, 0, t.z]}>
            <mesh position={[0, 0.75 * t.s, 0]} material={materials.woodDark} castShadow>
              <cylinderGeometry args={[0.09 * t.s, 0.15 * t.s, 1.5 * t.s, 9]} />
            </mesh>
            {t.canopies.map((c, cIdx) => (
              <mesh key={cIdx} position={c.pos} material={materials.leafMat} castShadow>
                <icosahedronGeometry args={[c.r, 1]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};
