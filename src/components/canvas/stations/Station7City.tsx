import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';
import { hash, fbm } from '../procedural/proceduralTextures';

export const Station7City: React.FC = () => {
  const materials = useMemo(() => getSceneMaterials(), []);

  // 26 procedural buildings between X in [29, 38], Z in [-3, -19]
  const buildings = useMemo(() => {
    const list: Array<{
      key: number;
      x: number;
      z: number;
      w: number;
      h: number;
      d: number;
      isPlaster: boolean;
    }> = [];
    for (let i = 0; i < 26; i++) {
      const x = 29 + hash(i, 1) * 9;
      const z = -3 - hash(i, 2) * 16;
      const w = 0.9 + hash(i, 3) * 1.7;
      const h = 1.6 + hash(i, 4) * 5.4;
      const d = 0.9 + hash(i, 5) * 1.6;
      list.push({ key: i, x, z, w, h, d, isPlaster: i % 2 === 0 });
    }
    return list;
  }, []);

  // Liner geometry for travel crate
  const linerGeo = useMemo(() => {
    const W = 0.62 * 0.75 * 0.94;
    const D = 0.42 * 0.75 * 0.9;
    const geo = new THREE.PlaneGeometry(W, D, 10, 6);
    const lp = geo.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      lp.setZ(i, (fbm(lp.getX(i) * 14, lp.getY(i) * 14, 3) - 0.5) * 0.015);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const mangoGeo = useMemo(() => mangoGeometry(0), []);

  return (
    <group name="station-7-city-group">
      {/* 26 City Buildings */}
      {buildings.map((b) => (
        <mesh
          key={b.key}
          position={[b.x, b.h / 2, b.z]}
          material={b.isPlaster ? materials.plaster : materials.stone}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[b.w, b.h, b.d]} />
        </mesh>
      ))}

      {/* Two dark near-frame framing blocks */}
      <mesh position={[26.4, 3.5, -5.2]} material={materials.stone} castShadow receiveShadow>
        <boxGeometry args={[2.2, 7.0, 2.2]} />
      </mesh>
      <mesh position={[38.2, 3.0, -6.4]} material={materials.stone} castShadow receiveShadow>
        <boxGeometry args={[2.5, 6.0, 2.5]} />
      </mesh>

      {/* Road Plane at (34, 0.005, 1.2) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[34, 0.005, 1.2]}
        material={materials.road}
        receiveShadow
      >
        <planeGeometry args={[26, 3.2]} />
      </mesh>

      {/* Delivery Van Group at (33.9, 0, 0.5), rotation.y = -0.5 */}
      <group position={[33.9, 0, 0.5]} rotation={[0, -0.5, 0]}>
        {/* Main Body */}
        <mesh position={[0, 0.45, 0]} material={materials.vanBody} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.6, 0.85]} />
        </mesh>

        {/* Cab */}
        <mesh position={[0.65, 0.55, 0]} material={materials.vanCab} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.55, 0.82]} />
        </mesh>

        {/* Windshield */}
        <mesh position={[0.85, 0.62, 0]} material={materials.vanGlass} castShadow>
          <boxGeometry args={[0.22, 0.35, 0.78]} />
        </mesh>

        {/* Bumper */}
        <mesh position={[0.98, 0.22, 0]} material={materials.vanBumper} castShadow>
          <boxGeometry args={[0.12, 0.14, 0.84]} />
        </mesh>

        {/* Stripe */}
        <mesh position={[0, 0.45, 0]} material={materials.vanStripe} castShadow>
          <boxGeometry args={[1.82, 0.08, 0.86]} />
        </mesh>

        {/* 4 Tyres */}
        {[
          [0.55, 0.16, 0.44],
          [-0.55, 0.16, 0.44],
          [0.55, 0.16, -0.44],
          [-0.55, 0.16, -0.44],
        ].map(([tx, ty, tz], idx) => (
          <mesh
            key={idx}
            position={[tx, ty, tz]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materials.tyre}
            castShadow
          >
            <cylinderGeometry args={[0.16, 0.16, 0.12, 16]} />
          </mesh>
        ))}

        {/* Travel Crate on Van Bed */}
        <group position={[-0.25, 0.76, 0]} scale={[0.75, 0.75, 0.75]}>
          <mesh material={materials.woodMat} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.014, 0.42]} />
          </mesh>
          {[1, -1].map((dir, idx) => (
            <React.Fragment key={idx}>
              <mesh position={[0, 0.19 / 2, dir * (0.42 / 2)]} material={materials.woodDark} castShadow>
                <boxGeometry args={[0.62, 0.19, 0.014]} />
              </mesh>
              <mesh position={[dir * (0.62 / 2), 0.19 / 2, 0]} material={materials.woodDark} castShadow>
                <boxGeometry args={[0.014, 0.19, 0.42]} />
              </mesh>
            </React.Fragment>
          ))}
          <mesh geometry={linerGeo} material={materials.paperMat} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} />
          {/* 3 small fruit on crate bed */}
          {[-0.14, 0, 0.14].map((fx, idx) => (
            <mesh
              key={idx}
              geometry={mangoGeo}
              material={materials.skinMat}
              position={[fx, 0.08, 0]}
              scale={[0.7, 0.7, 0.7]}
              rotation={[0.2, idx * 0.8, 0.4]}
              castShadow
            />
          ))}
        </group>
      </group>
    </group>
  );
};
