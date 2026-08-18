import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useViewportTier } from '../../hooks/useViewportTier';
import { SceneWorld } from './SceneWorld';

export interface CinemaStageProps {
  onContextLost?: () => void;
}

export const CinemaStage: React.FC<CinemaStageProps> = ({ onContextLost }) => {
  const { pixelRatio } = useViewportTier();
  const isMountedRef = useRef(true);

  // Navigating into Fruit Intelligence tears this stage down while its GPU
  // context may still be evicted moments later. That late event must not be
  // reported, or it would force the whole app into the static fallback and
  // destroy the fruit experience that just loaded.
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        filter: 'saturate(1.08) contrast(1.07)',
        backgroundColor: '#16150f',
      }}
    >
      <Canvas
        shadows="soft"
        dpr={pixelRatio}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.6,
          outputColorSpace: THREE.SRGBColorSpace,
          powerPreference: 'high-performance',
        }}
        camera={{
          fov: 38,
          near: 0.008,
          far: 260,
          position: [0.02, 0.905, 0.155],
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#16150f', 1);
          const domEl = gl.domElement;
          const handleContextLost = (e: Event) => {
            e.preventDefault();
            if (isMountedRef.current && onContextLost) onContextLost();
          };
          domEl.addEventListener('webglcontextlost', handleContextLost, false);
        }}
      >
        <SceneWorld />
      </Canvas>
    </div>
  );
};
