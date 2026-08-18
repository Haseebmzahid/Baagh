import React, { useMemo } from 'react';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';

export const Station9Home: React.FC = () => {
  const materials = useMemo(() => getSceneMaterials(), []);

  const mangoGeo0 = useMemo(() => mangoGeometry(0), []);
  const mangoGeo1 = useMemo(() => mangoGeometry(1.7), []);
  const mangoGeo2 = useMemo(() => mangoGeometry(3.4), []);

  return (
    <group name="station-9-home-group">
      {/* Interior Lighting */}
      {/* Pendant Lamp Bulb */}
      <pointLight
        color="#ffdfae"
        intensity={1.6}
        distance={4.2}
        decay={2}
        position={[40, 1.66, -0.4]}
        castShadow
      />

      {/* Warm Room Fill Light */}
      <pointLight
        color="#ffd9a4"
        intensity={2.2}
        distance={7}
        decay={2}
        position={[41.4, 1.9, -1.2]}
      />

      {/* Room Structure at X=40 */}
      {/* Wood Floor (9 x 7) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[40, 0.012, -1]}
        material={materials.floorWood}
        receiveShadow
      >
        <planeGeometry args={[9, 7]} />
      </mesh>

      {/* Ceiling (9 x 7) */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[40, 3.36, -1]}
        material={materials.ceiling}
      >
        <planeGeometry args={[9, 7]} />
      </mesh>

      {/* Back Wall */}
      <mesh position={[40, 1.7, -4.4]} material={materials.plaster} receiveShadow>
        <boxGeometry args={[9, 3.4, 0.12]} />
      </mesh>

      {/* Right Wall */}
      <mesh position={[44.3, 1.7, -1]} material={materials.plaster} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 7]} />
      </mesh>

      {/* Front Wall */}
      <mesh position={[40, 1.7, 2.4]} material={materials.plaster} receiveShadow>
        <boxGeometry args={[9, 3.4, 0.12]} />
      </mesh>

      {/* Left Wall (Split around doorway gap) */}
      <mesh position={[36.4, 1.7, -3.4]} material={materials.plaster} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 2.2]} />
      </mesh>
      <mesh position={[36.4, 1.7, 0.35]} material={materials.plaster} receiveShadow>
        <boxGeometry args={[0.12, 3.4, 4.3]} />
      </mesh>

      {/* Window at (38.6, 1.75, -4.32) */}
      <mesh position={[38.6, 1.75, -4.32]} material={materials.windowMat}>
        <planeGeometry args={[2.0, 1.9]} />
      </mesh>
      {/* Mullion frame */}
      <mesh position={[38.6, 1.75, -4.31]} material={materials.mullion}>
        <boxGeometry args={[0.04, 1.9, 0.02]} />
      </mesh>
      <mesh position={[38.6, 1.75, -4.31]} material={materials.mullion}>
        <boxGeometry args={[2.0, 0.04, 0.02]} />
      </mesh>

      {/* Rug at (40, 0.02, -0.5) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[40, 0.02, -0.5]}
        material={materials.clothMat}
        receiveShadow
      >
        <planeGeometry args={[3.2, 2.2]} />
      </mesh>

      {/* Dining Table at (40, 0, -0.4) */}
      <group position={[40, 0, -0.4]}>
        <mesh position={[0, 0.75, 0]} material={materials.woodDark} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.06, 1.1]} />
        </mesh>
        {[
          [-2.0 / 2 + 0.08, -1.1 / 2 + 0.08],
          [2.0 / 2 - 0.08, -1.1 / 2 + 0.08],
          [-2.0 / 2 + 0.08, 1.1 / 2 - 0.08],
          [2.0 / 2 - 0.08, 1.1 / 2 - 0.08],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.75 / 2, lz]} material={materials.woodDark} castShadow>
            <boxGeometry args={[0.07, 0.75, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* Bowl on Dining Table at (40, 0.86, -0.4) */}
      <mesh
        position={[40, 0.86, -0.4]}
        material={materials.bowl}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[0.24, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      </mesh>

      {/* 5 Mangoes in Fruit Bowl */}
      {/* 4 Radial Mangoes */}
      {[
        { pos: [40.095, 0.82, -0.4], rot: [0.4, 0.2, 0.5], geo: mangoGeo0 },
        { pos: [40, 0.82, -0.305], rot: [0.2, 1.6, 0.4], geo: mangoGeo1 },
        { pos: [39.905, 0.82, -0.4], rot: [-0.4, 3.1, 0.3], geo: mangoGeo2 },
        { pos: [40, 0.82, -0.495], rot: [-0.2, 4.6, 0.5], geo: mangoGeo0 },
      ].map((m, idx) => (
        <mesh
          key={idx}
          geometry={m.geo}
          material={materials.skinMat}
          position={m.pos as [number, number, number]}
          rotation={m.rot as [number, number, number]}
          scale={[0.95, 0.95, 0.95]}
          castShadow
          receiveShadow
        />
      ))}
      {/* 1 Hero Mango on Top of Bowl */}
      <mesh
        geometry={mangoGeo1}
        material={materials.skinMat}
        position={[40, 0.88, -0.4]}
        rotation={[0.15, 0.7, 0.3]}
        scale={[1.05, 1.05, 1.05]}
        castShadow
        receiveShadow
      />

      {/* Chair 1 at (40, 0, 0.42), facing table */}
      <group position={[40, 0, 0.42]} rotation={[0, Math.PI, 0]}>
        <mesh position={[0, 0.45, 0]} material={materials.woodDark} castShadow>
          <boxGeometry args={[0.45, 0.04, 0.45]} />
        </mesh>
        <mesh position={[0, 0.72, -0.2]} material={materials.woodDark} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.04]} />
        </mesh>
        {[
          [-0.18, -0.18],
          [0.18, -0.18],
          [-0.18, 0.18],
          [0.18, 0.18],
        ].map(([cx, cz], idx) => (
          <mesh key={idx} position={[cx, 0.45 / 2, cz]} material={materials.woodDark} castShadow>
            <boxGeometry args={[0.04, 0.45, 0.04]} />
          </mesh>
        ))}
      </group>

      {/* Chair 2 at (40, 0, -1.22), facing table */}
      <group position={[40, 0, -1.22]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.45, 0]} material={materials.woodDark} castShadow>
          <boxGeometry args={[0.45, 0.04, 0.45]} />
        </mesh>
        <mesh position={[0, 0.72, -0.2]} material={materials.woodDark} castShadow>
          <boxGeometry args={[0.45, 0.5, 0.04]} />
        </mesh>
        {[
          [-0.18, -0.18],
          [0.18, -0.18],
          [-0.18, 0.18],
          [0.18, 0.18],
        ].map(([cx, cz], idx) => (
          <mesh key={idx} position={[cx, 0.45 / 2, cz]} material={materials.woodDark} castShadow>
            <boxGeometry args={[0.04, 0.45, 0.04]} />
          </mesh>
        ))}
      </group>

      {/* Pendant Lamp Fixture */}
      <mesh position={[40, 2.5, -0.4]} material={materials.pendantCord}>
        <cylinderGeometry args={[0.008, 0.008, 1.5, 8]} />
      </mesh>
      <mesh position={[40, 1.78, -0.4]} rotation={[0, 0, 0]} material={materials.shade} castShadow>
        <coneGeometry args={[0.22, 0.16, 24, 1, true]} />
      </mesh>

      {/* Counter / Credenza at (40.6, 0.45, -3.6) */}
      <mesh position={[40.6, 0.45, -3.6]} material={materials.counter} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.9, 0.75]} />
      </mesh>
    </group>
  );
};
