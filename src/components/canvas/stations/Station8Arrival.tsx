import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../../../context/ScrollContext';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';
import { fbm } from '../procedural/proceduralTextures';

export const Station8Arrival: React.FC = () => {
  const { curProgressRef } = useScroll();
  const arrivedCrateRef = useRef<THREE.Group | null>(null);
  const spotTargetRef = useRef<THREE.Object3D | null>(null);

  const materials = useMemo(() => getSceneMaterials(), []);

  // Liner geometry for arrived crate
  const linerGeo = useMemo(() => {
    const W = 0.62 * 0.94;
    const D = 0.42 * 0.9;
    const geo = new THREE.PlaneGeometry(W, D, 10, 6);
    const lp = geo.attributes.position;
    for (let i = 0; i < lp.count; i++) {
      lp.setZ(i, (fbm(lp.getX(i) * 14, lp.getY(i) * 14, 3) - 0.5) * 0.02);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  const mangoGeo = useMemo(() => mangoGeometry(0), []);

  // Frame loop driving arrived crate visibility (cur > 0.78 && cur < 0.94)
  useFrame(() => {
    const cur = curProgressRef.current;
    if (arrivedCrateRef.current) {
      arrivedCrateRef.current.visible = cur > 0.78 && cur < 0.94;
    }
  });

  return (
    <group name="station-8-arrival-group">
      {/* Door Spotlight at (37.6, 3, -3) -> (40, 0.8, -0.6) */}
      <object3D ref={spotTargetRef} position={[40, 0.8, -0.6]} />
      <spotLight
        color="#ffe8c4"
        intensity={22}
        distance={9}
        angle={0.6}
        penumbra={0.7}
        decay={1.6}
        position={[37.6, 3, -3]}
        target={spotTargetRef.current || undefined}
        castShadow
      />

      {/* Doorway step/threshold slab at (37.3, 0.02, -3.0) */}
      <mesh position={[37.3, 0.02, -3.0]} material={materials.stone} receiveShadow>
        <boxGeometry args={[1.2, 0.04, 1.4]} />
      </mesh>

      {/* Arrived crate on dining table (visible only cur > 0.78 && cur < 0.94) */}
      <group
        ref={arrivedCrateRef}
        position={[40.45, 0.815, -0.62]}
        rotation={[0, 0.22, 0]}
        scale={[0.85, 0.85, 0.85]}
      >
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
        {/* Fruit inside arrived crate */}
        {[-0.14, 0, 0.14].map((fx, idx) => (
          <mesh
            key={idx}
            geometry={mangoGeo}
            material={materials.skinMat}
            position={[fx, 0.09, 0]}
            scale={[0.85, 0.85, 0.85]}
            rotation={[0.2, idx * 0.9, 0.3]}
            castShadow
          />
        ))}
      </group>
    </group>
  );
};
