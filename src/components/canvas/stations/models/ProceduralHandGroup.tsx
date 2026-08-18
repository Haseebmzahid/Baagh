import React, { useMemo } from 'react';
import * as THREE from 'three';
import { getSceneMaterials } from '../../procedural/materials';

export interface ProceduralHandGroupProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const ProceduralHandGroup: React.FC<ProceduralHandGroupProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  const materials = useMemo(() => getSceneMaterials(), []);

  // Hand materials from prototype: skinTone (#33241a, rough 0.95)
  const skinToneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#33241a', roughness: 0.95 }),
    []
  );

  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Palm */}
      <mesh position={[0, 0, 0]} scale={[1.15, 0.5, 1.0]} material={skinToneMat} castShadow>
        <sphereGeometry args={[0.115, 32, 24]} />
      </mesh>

      {/* 4 Fingers */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[0.10 - i * 0.032, 0.03, 0.10]}
          rotation={[-1.05 + i * 0.06, 0, 0.1 - i * 0.06]}
          material={skinToneMat}
          castShadow
        >
          <capsuleGeometry args={[0.018, 0.10, 4, 12]} />
        </mesh>
      ))}

      {/* Thumb */}
      <mesh
        position={[0.13, 0.02, -0.02]}
        rotation={[-0.4, 0, -1.15]}
        material={skinToneMat}
        castShadow
      >
        <capsuleGeometry args={[0.021, 0.07, 4, 12]} />
      </mesh>

      {/* Sleeve */}
      <mesh
        position={[-0.20, -0.01, -0.02]}
        rotation={[0, 0, Math.PI / 2]}
        material={materials.clothMat}
        castShadow
      >
        <cylinderGeometry args={[0.075, 0.085, 0.3, 18]} />
      </mesh>
    </group>
  );
};
