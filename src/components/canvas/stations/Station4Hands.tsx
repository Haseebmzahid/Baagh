import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../../../context/ScrollContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';
import { fibreTexture, hash } from '../procedural/proceduralTextures';
import { HandsAdapter } from './models/HandsAdapter';

export const Station4Hands: React.FC = () => {
  const { curProgressRef } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  const examinedRef = useRef<THREE.Mesh | null>(null);
  const spotTargetRef = useRef<THREE.Object3D | null>(null);

  const materials = useMemo(() => getSceneMaterials(), []);

  // Examined mango geometry memoized
  const examinedGeo = useMemo(() => mangoGeometry(0), []);

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

  // Frame Loop animation for examined fruit spin envelope around progress = 0.40
  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const cur = curProgressRef.current;

    // Spin envelope: dt * 0.25 * Math.max(0, 1 - Math.abs(cur - 0.40) * 7)
    if (examinedRef.current && !prefersReducedMotion) {
      const spinSpeed = dt * 0.25 * Math.max(0, 1 - Math.abs(cur - 0.40) * 7);
      examinedRef.current.rotation.y += spinSpeed;
    }
  });

  return (
    <group name="station-4-hands-group">
      {/* Backlight SpotLight at (8.7, 2.1, -1.6) -> (8.0, 0.9, 0.1) */}
      <object3D ref={spotTargetRef} position={[8.0, 0.9, 0.1]} />
      <spotLight
        color="#ffe6bd"
        intensity={26}
        distance={6}
        angle={0.7}
        penumbra={0.85}
        decay={1.7}
        position={[8.7, 2.1, -1.6]}
        target={spotTargetRef.current || undefined}
        castShadow
      />

      {/* Dark Table at X=8 (2.2 x 1.2, h=0.78) */}
      <group position={[8, 0, 0]}>
        <mesh position={[0, 0.78, 0]} material={materials.woodDark} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.06, 1.2]} />
        </mesh>
        {[
          [-2.2 / 2 + 0.1, -1.2 / 2 + 0.1],
          [2.2 / 2 - 0.1, -1.2 / 2 + 0.1],
          [-2.2 / 2 + 0.1, 1.2 / 2 - 0.1],
          [2.2 / 2 - 0.1, 1.2 / 2 - 0.1],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.78 / 2, lz]} material={materials.woodDark} castShadow>
            <boxGeometry args={[0.07, 0.78, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* Hand 1 */}
      <HandsAdapter position={[7.9, 0.86, 0.02]} rotation={[0, -0.35, 0]} scale={0.88} />

      {/* Hand 2 */}
      <HandsAdapter position={[8.42, 0.85, -0.16]} rotation={[0.1, 2.35, 0.05]} scale={0.88} />

      {/* Examined Mango */}
      <mesh
        ref={examinedRef}
        geometry={examinedGeo}
        material={materials.skinMat}
        position={[7.96, 0.95, 0.06]}
        rotation={[0.3, 0.9, 0.5]}
        scale={[1.02, 1.02, 1.02]}
        castShadow
        receiveShadow
      />

      {/* Surrounding props */}
      {/* Crate Stack at (7.0, 0.7, 2, -0.2) */}
      {[0, 1].map((i) => (
        <group
          key={i}
          position={[
            7.0 + (hash(i, 7.0) - 0.5) * 0.05,
            0.02 + i * 0.2 + 0.7,
            2.0,
          ]}
          rotation={[0, -0.2 + (hash(i, 2.0) - 0.5) * 0.2, 0]}
        >
          <mesh material={materials.woodMat} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.014, 0.42]} />
          </mesh>
        </group>
      ))}

      {/* Sack at (9.1, 0.9, 0.9) */}
      <mesh material={sackMat} position={[9.1, 0.3 * 0.9, 0.9]} scale={[0.9, 0.9 * 1.25, 0.9 * 0.85]} castShadow receiveShadow>
        <sphereGeometry args={[0.28, 20, 14]} />
      </mesh>

      {/* Basket at (8.9, -0.4, 0.9) */}
      <group position={[8.9, 0, -0.4]} scale={[0.9, 0.9, 0.9]}>
        <mesh position={[0, 0.1, 0]} material={basketMat} castShadow>
          <cylinderGeometry args={[0.26, 0.19, 0.2, 22, 1, true]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <circleGeometry args={[0.19, 22]} />
          <meshStandardMaterial color="#6d5636" roughness={1} />
        </mesh>
      </group>
    </group>
  );
};
