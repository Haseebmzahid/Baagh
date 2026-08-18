import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '../../../context/ScrollContext';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { mangoGeometry } from '../procedural/mangoGeometry';
import { getSceneMaterials } from '../procedural/materials';
import { fibreTexture, hash, fbm } from '../procedural/proceduralTextures';

export const Station5Selection: React.FC = () => {
  const { curProgressRef } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  const materials = useMemo(() => getSceneMaterials(), []);

  // Graded fruit meshes refs array
  const fruitRefs = useRef<Array<THREE.Mesh | null>>([]);

  // Loupe material
  const loupeMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#5d5a52', roughness: 0.4, metalness: 0.8 }),
    []
  );

  // Paper Liner Geometry for Crates
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

  // Basket & Sack materials
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

  // 9 Graded fruit base configurations (home position, rotation, ok flag)
  const gradedFruitConfigs = useMemo(() => {
    const geoM = [mangoGeometry(0), mangoGeometry(1.7), mangoGeometry(3.4)];
    const items = [];
    for (let i = 0; i < 9; i++) {
      const ok = i % 3 !== 2; // 6 accepted (indices 0,1, 3,4, 6,7), 3 rejected (2, 5, 8)
      const scale = 0.94 + hash(i, 3) * 0.12;
      const homePos: [number, number, number] = [
        15.82 + (i % 5) * 0.19,
        0.845,
        -0.14 + Math.floor(i / 5) * 0.26,
      ];
      const initialRot: [number, number, number] = [
        hash(i, 1) * 1.2,
        hash(i, 2) * 6,
        0.8 + hash(i, 4),
      ];
      const geo = geoM[i % 3];
      items.push({ i, ok, scale, homePos, initialRot, geo });
    }
    return items;
  }, []);

  const smoothstep = (x: number) => x * x * (3 - 2 * x);

  // Frame loop animating accept / reject sorting motion based on progress
  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    const cur = curProgressRef.current;

    // Grading beat: gp = clamp((cur - 0.47) * 8, 0, 1)
    const gp = Math.max(0, Math.min(1, (cur - 0.47) * 8));

    gradedFruitConfigs.forEach(({ i, ok, homePos, initialRot }) => {
      const m = fruitRefs.current[i];
      if (!m) return;

      const staggerVal = Math.max(0, Math.min(1, gp * 1.4 - i * 0.05));
      const e = smoothstep(staggerVal);

      if (ok) {
        // Accepted (6 of 9): shift toward accept tray crate
        m.position.x = homePos[0] - e * 0.22;
        m.position.y = homePos[1] + e * 0.03;
        m.position.z = homePos[2] - e * 0.13;
        m.rotation.x = initialRot[0];
      } else {
        // Rejected (3 of 9): drop into reject crate with rotation
        m.position.x = homePos[0] + e * 0.50;
        m.position.y = homePos[1] - e * 0.006;
        m.position.z = homePos[2] + e * 0.30;
        if (!prefersReducedMotion) {
          m.rotation.x = initialRot[0] + dt * 0.5 * e;
        }
      }
    });
  });

  return (
    <group name="station-5-selection-group">
      {/* Table at X=16 (3.0 x 1.4, h=0.76) */}
      <group position={[16, 0, 0]}>
        <mesh position={[0, 0.76, 0]} material={materials.woodMat} castShadow receiveShadow>
          <boxGeometry args={[3.0, 0.06, 1.4]} />
        </mesh>
        {[
          [-3.0 / 2 + 0.1, -1.4 / 2 + 0.1],
          [3.0 / 2 - 0.1, -1.4 / 2 + 0.1],
          [-3.0 / 2 + 0.1, 1.4 / 2 - 0.1],
          [3.0 / 2 - 0.1, 1.4 / 2 - 0.1],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.76 / 2, lz]} material={materials.woodDark} castShadow>
            <boxGeometry args={[0.07, 0.76, 0.07]} />
          </mesh>
        ))}
      </group>

      {/* Reject Crate at (16.66, 0.8, 0.2, s=0.62, ry=-0.28) */}
      <group position={[16.66, 0.8, 0.2]} rotation={[0, -0.28, 0]} scale={[0.62, 0.62, 0.62]}>
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

      {/* Accept Tray Crate at (15.42, 0.8, -0.06, s=0.68, ry=0.16) */}
      <group position={[15.42, 0.8, -0.06]} rotation={[0, 0.16, 0]} scale={[0.68, 0.68, 0.68]}>
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

      {/* 9 Graded Mangoes */}
      {gradedFruitConfigs.map((cfg) => (
        <mesh
          key={cfg.i}
          ref={(el) => (fruitRefs.current[cfg.i] = el)}
          geometry={cfg.geo}
          material={materials.skinMat}
          position={cfg.homePos}
          rotation={cfg.initialRot}
          scale={[cfg.scale, cfg.scale, cfg.scale]}
          castShadow
          receiveShadow
        />
      ))}

      {/* Loupe at (16.3, 0.8, -0.32) */}
      <mesh
        material={loupeMat}
        position={[16.3, 0.8, -0.32]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.05, 0.008, 10, 30]} />
      </mesh>

      {/* Surrounding props */}
      {/* Crate Stack at (15.0, 0.95, 3) */}
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          position={[
            15.0 + (hash(i, 15.0) - 0.5) * 0.05,
            0.02 + i * 0.2 + 0.95,
            3.0,
          ]}
          rotation={[0, 0.15 + (hash(i, 3.0) - 0.5) * 0.2, 0]}
        >
          <mesh material={materials.woodMat} castShadow receiveShadow>
            <boxGeometry args={[0.62, 0.014, 0.42]} />
          </mesh>
        </group>
      ))}

      {/* Basket at (17.1, 0.85, 1.0) */}
      <group position={[17.1, 0, 1.0]} scale={[1, 1, 1]}>
        <mesh position={[0, 0.1, 0]} material={basketMat} castShadow>
          <cylinderGeometry args={[0.26, 0.19, 0.2, 22, 1, true]} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
          <circleGeometry args={[0.19, 22]} />
          <meshStandardMaterial color="#6d5636" roughness={1} />
        </mesh>
      </group>

      {/* Sack at (14.6, 1.4, 0.95) */}
      <mesh material={sackMat} position={[14.6, 0.3 * 0.95, 0.95]} scale={[0.95, 0.95 * 1.25, 0.95 * 0.85]} castShadow receiveShadow>
        <sphereGeometry args={[0.28, 20, 14]} />
      </mesh>

      {/* Overhead Beam at (16.1, 1.72, 1.7, len=5.4) */}
      <mesh material={materials.woodDark} position={[16.1, 1.72, 1.7]} rotation={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[5.4, 0.12, 0.12]} />
      </mesh>
    </group>
  );
};
