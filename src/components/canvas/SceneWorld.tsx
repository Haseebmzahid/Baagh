import React, { useLayoutEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { tokens } from '../../config/tokens';
import { CameraRig } from './CameraRig';
import { getSceneMaterials } from './procedural/materials';
import { skyEquirect } from './procedural/proceduralTextures';
import { Station1Fruit } from './stations/Station1Fruit';
import { Station2Crate } from './stations/Station2Crate';
import { Station3Source } from './stations/Station3Source';
import { Station4Hands } from './stations/Station4Hands';
import { Station5Selection } from './stations/Station5Selection';
import { Station6Packing } from './stations/Station6Packing';
import { Station7City } from './stations/Station7City';
import { Station8Arrival } from './stations/Station8Arrival';
import { Station9Home } from './stations/Station9Home';

export const SceneWorld: React.FC = () => {
  const { scene, gl } = useThree();
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Setup PMREM sky environment & background
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const skyTex = skyEquirect();

    const envRT = pmrem.fromEquirectangular(skyTex);
    scene.background = skyTex;
    (scene as any).backgroundIntensity = 0.55;
    scene.environment = envRT.texture;
    (scene as any).environmentIntensity = 0.34;
    scene.fog = new THREE.FogExp2(tokens.world.fog, 0.08);

    return () => {
      pmrem.dispose();
      skyTex.dispose();
      envRT.dispose();
    };
  }, [scene, gl]);

  const materials = getSceneMaterials();

  return (
    <>
      {/* Centralized Camera Controller & Light Coupling */}
      <CameraRig keyLightRef={keyLightRef} />

      {/* Hemisphere Light (Sky/Ground) */}
      <hemisphereLight
        args={[tokens.world.hemiSky, tokens.world.hemiGround, 0.22]}
      />

      {/* Key Directional Light with Shadows */}
      <directionalLight
        ref={keyLightRef}
        args={[tokens.world.keyLight, 2.9]}
        position={[-4.5, 5.5, 4.2]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={10}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0006}
        shadow-normalBias={0.012}
      />

      {/* Rim Light */}
      <directionalLight
        args={['#bcd4dd', 0.5]}
        position={[7, 4, -6]}
      />

      {/* Unbroken Ground Plane (200 x 90) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        material={materials.soilMat}
        receiveShadow
      >
        <planeGeometry args={[200, 90]} />
      </mesh>

      {/* Complete Stations 1–9 World Assembly */}
      <Station1Fruit />
      <Station2Crate />
      <Station3Source />
      <Station4Hands />
      <Station5Selection />
      <Station6Packing />
      <Station7City />
      <Station8Arrival />
      <Station9Home />
    </>
  );
};
