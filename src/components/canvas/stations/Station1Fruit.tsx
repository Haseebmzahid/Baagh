import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../../../context/ScrollContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';
import { fibreTexture, hash, fbm } from '../procedural/proceduralTextures';

export const Station1Fruit: React.FC = () => {
  const { curProgressRef } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  const heroRef = useRef<THREE.Mesh | null>(null);
  const macroLightRef = useRef<THREE.PointLight | null>(null);

  const materials = useMemo(() => getSceneMaterials(), []);

  // Procedural Geometries Memoized
  const geoM = useMemo(() => [
    mangoGeometry(0),
    mangoGeometry(1.7),
    mangoGeometry(3.4),
  ], []);

  // Paper Liner Geometry for Hero Crate with vertex jitter
  const linerGeo = useMemo(() => {
    const W = 0.62 * 0.94;
    const D = 0.42 * 0.9;
    const geo = new THREE.PlaneGeometry(W, D, 12, 8);
    const lp = geo.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      lp.setZ(i, (fbm(lp.getX(i) * 14, lp.getY(i) * 14, 3) - 0.5) * 0.02);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Basket & Sack textures/materials memoized
  const basketMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: fibreTexture(126, 100, 66, 120),
        roughness: 1,
        side: THREE.DoubleSide,
      }),
    []
  );

  const sackMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: fibreTexture(122, 108, 80, 140),
        roughness: 1,
      }),
    []
  );

  // Companion mango config table
  const companionConfigs: Array<[number, number, number, number, number]> = [
    [-0.19, 0.86, 0.06, 0.94, 1],
    [0.2, 0.86, -0.05, 0.9, 2],
    [0.06, 0.86, 0.13, 0.86, 0],
    [-0.09, 0.86, -0.12, 0.92, 2],
  ];

  // 88 Orchard trees layout data
  const orchardTrees = useMemo(() => {
    const trees: Array<{ x: number; z: number; s: number; canopies: Array<{ pos: [number, number, number]; r: number }> }> = [];
    for (let r = 0; r < 8; r++) {
      for (let i = 0; i < 11; i++) {
        const x = -14 + i * 2.7 + r * 0.7 + hash(i, r) * 0.5;
        const z = -4.5 - r * 3.4 - hash(r, i) * 0.8;
        const s = 0.8 + hash(i, r) * 0.5;
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
    }
    return trees;
  }, []);

  // Frame Loop animation for hero fruit idle rotation & macro point light decay
  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const cur = curProgressRef.current;

    // Macro light decay: 0.3 * max(0, 1 - cur * 6)
    if (macroLightRef.current) {
      macroLightRef.current.intensity = 0.3 * Math.max(0, 1 - cur * 6);
    }

    // Hero fruit turn creep: dt * 0.045 * (1 - min(1, cur * 4))
    if (heroRef.current && !prefersReducedMotion) {
      heroRef.current.rotation.y += dt * 0.045 * (1 - Math.min(1, cur * 4));
    }
  });

  return (
    <group name="station-1-group">
      {/* Macro Point Light */}
      <pointLight
        ref={macroLightRef}
        color="#ffe0b4"
        intensity={0.3}
        distance={1.2}
        decay={2}
        position={[-0.16, 1.02, 0.2]}
      />

      {/* Sorting Table at x=0 (2.6 x 1.4, h=0.76) */}
      <group position={[0, 0, 0]}>
        {/* Table top */}
        <mesh position={[0, 0.76, 0]} material={materials.woodMat} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.06, 1.4]} />
        </mesh>
        {/* 4 Legs */}
        {[
          [-2.6 / 2 + 0.1, -1.4 / 2 + 0.1],
          [2.6 / 2 - 0.1, -1.4 / 2 + 0.1],
          [-2.6 / 2 + 0.1, 1.4 / 2 - 0.1],
          [2.6 / 2 - 0.1, 1.4 / 2 - 0.1],
        ].map(([lx, lz], idx) => (
          <mesh
            key={idx}
            position={[lx, 0.76 / 2, lz]}
            material={materials.woodDark}
            castShadow
          >
            <boxGeometry args={[0.07, 0.76, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* Hero Crate at (0, 0.79, 0) */}
      <group position={[0, 0.79, 0]}>
        {/* Base */}
        <mesh position={[0, 0, 0]} material={materials.woodMat} castShadow receiveShadow>
          <boxGeometry args={[0.62, 0.014, 0.42]} />
        </mesh>
        {/* Slats */}
        {[1, -1].map((dir, idx) => (
          <React.Fragment key={idx}>
            <mesh
              position={[0, 0.19 / 2, dir * (0.42 / 2)]}
              material={materials.woodDark}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.62, 0.19, 0.014]} />
            </mesh>
            <mesh
              position={[dir * (0.62 / 2), 0.19 / 2, 0]}
              material={materials.woodDark}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.014, 0.19, 0.42]} />
            </mesh>
          </React.Fragment>
        ))}
        {/* Paper Liner */}
        <mesh
          geometry={linerGeo}
          material={materials.paperMat}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.012, 0]}
          receiveShadow
        />
      </group>

      {/* Hero Mango at (0, 0.885, 0) */}
      <mesh
        ref={heroRef}
        geometry={geoM[0]}
        material={materials.skinMat}
        position={[0, 0.885, 0]}
        rotation={[0.1, 0.6, 0.28]}
        castShadow
        receiveShadow
      />

      {/* 4 Companion Mangoes */}
      {companionConfigs.map(([x, y, z, s, i], idx) => (
        <mesh
          key={idx}
          geometry={geoM[i % 3]}
          material={materials.skinMat}
          position={[x, y, z]}
          rotation={[0.4, x * 6, 0.9 + z]}
          scale={[s, s, s]}
          castShadow
          receiveShadow
        />
      ))}

      {/* Cloth on table */}
      <mesh
        material={materials.clothMat}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0.95, 0.795, 0.12]}
      >
        <planeGeometry args={[1.1, 0.7]} />
      </mesh>

      {/* Near-camera Occluders & Crate Stack */}
      {/* Crate Stack (-1.35, 0.9, 3) */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[
            -1.35 + (hash(i, -1.35) - 0.5) * 0.05,
            0.02 + i * 0.2 + 0.79,
            0.9,
          ]}
          rotation={[0, 0.3 + (hash(i, 0.9) - 0.5) * 0.2, 0]}
        >
          <mesh material={materials.woodMat} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.014, 0.42]} />
          </mesh>
        </group>
      ))}

      {/* Basket at (1.5, 1.0, 1.1) */}
      <group position={[1.5, 0, 1.0]} scale={[1.1, 1.1, 1.1]}>
        <mesh position={[0, 0.1, 0]} material={basketMat} castShadow>
          <cylinderGeometry args={[0.26, 0.19, 0.2, 22, 1, true]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <circleGeometry args={[0.19, 22]} />
          <meshStandardMaterial color="#6d5636" roughness={1} />
        </mesh>
      </group>

      {/* Sack at (-2.1, 1.6, 1.0) */}
      <mesh
        material={sackMat}
        position={[-2.1, 0.3, 1.0]}
        scale={[1, 1.25, 0.85]}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.28, 20, 14]} />
      </mesh>

      {/* Overhead Beam at (0.2, 2.15, 1.7) */}
      <mesh
        material={materials.woodDark}
        position={[0.2, 2.15, 1.7]}
        rotation={[0, 0.06, 0]}
        castShadow
      >
        <boxGeometry args={[6, 0.12, 0.12]} />
      </mesh>

      {/* 88 Orchard Trees behind Station 1 */}
      <group name="orchard-group">
        {orchardTrees.map((t, idx) => (
          <group key={idx} position={[t.x, 0, t.z]}>
            {/* Trunk */}
            <mesh position={[0, 0.75 * t.s, 0]} material={materials.woodDark} castShadow>
              <cylinderGeometry args={[0.09 * t.s, 0.15 * t.s, 1.5 * t.s, 9]} />
            </mesh>
            {/* Canopy blobs */}
            {t.canopies.map((c, cIdx) => (
              <mesh
                key={cIdx}
                position={c.pos}
                material={materials.leafMat}
                castShadow
              >
                <icosahedronGeometry args={[c.r, 1]} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
};
