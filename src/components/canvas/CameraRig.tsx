import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { cameraKeyframes } from '../../config/cameraKeyframes';
import { tokens } from '../../config/tokens';
import { useScroll } from '../../context/ScrollContext';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useViewportTier } from '../../hooks/useViewportTier';

export interface CameraRigProps {
  keyLightRef?: React.RefObject<THREE.DirectionalLight | null>;
}

export const CameraRig: React.FC<CameraRigProps> = ({ keyLightRef }) => {
  const { camera, gl, scene } = useThree();
  const { curProgressRef, targetProgressRef } = useScroll();
  const prefersReducedMotion = useReducedMotion();
  const { tier } = useViewportTier();
  const isMobile = tier === 'mobile';

  // Vector constants & references
  const K = useRef(
    cameraKeyframes.map((k) => ({
      p: new THREE.Vector3(...k.position),
      t: new THREE.Vector3(...k.lookAt),
      fov: k.fov,
    }))
  ).current;

  const curPos = useRef<THREE.Vector3>(K[0].p.clone());
  const curTgt = useRef<THREE.Vector3>(K[0].t.clone());
  const curFov = useRef<number>(K[0].fov);
  const tmpP = useRef<THREE.Vector3>(new THREE.Vector3());
  const tmpT = useRef<THREE.Vector3>(new THREE.Vector3());

  const smoothstep = (x: number) => x * x * (3 - 2 * x);

  useFrame((_, delta) => {
    const dt = Math.min(0.05, delta);
    let cur = curProgressRef.current;

    if (prefersReducedMotion) {
      cur = targetProgressRef.current;
      curProgressRef.current = cur;
    }

    // Dynamic Tone Mapping Exposure: 0.6 + min(1, cur * 7) * 0.32 - max(0, cur - 0.82) * 0.1
    gl.toneMappingExposure = 0.6 + Math.min(1, cur * 7) * 0.32 - Math.max(0, cur - 0.82) * 0.1;

    // Dynamic Fog Density: 0.08 + (1 - min(1, cur * 3)) * 0.03 - max(0, cur - 0.8) * 0.09
    if (scene.fog && scene.fog instanceof THREE.FogExp2) {
      scene.fog.density = 0.08 + (1 - Math.min(1, cur * 3)) * 0.03 - Math.max(0, cur - 0.8) * 0.09;
    }

    const s = cur * (K.length - 1);
    const i = Math.min(K.length - 2, Math.floor(s));
    const f = smoothstep(Math.min(1, Math.max(0, s - i)));

    // Mobile adaptation: Widen FOV by +6°, shift macro Z distance from 0.155 to 0.19
    const fovOffset = isMobile ? 6 : 0;
    const p0 = isMobile ? new THREE.Vector3(0.02, 0.905, 0.19) : K[0].p;

    const kStartPos = i === 0 ? p0 : K[i].p;
    const kEndPos = i + 1 === 0 ? p0 : K[i + 1].p;

    tmpP.current.lerpVectors(kStartPos, kEndPos, f);
    tmpT.current.lerpVectors(K[i].t, K[i + 1].t, f);
    const fov = K[i].fov + (K[i + 1].fov - K[i].fov) * f + fovOffset;

    const kL = Math.min(1, dt * tokens.motion.cameraPosSmoothRate); // 6.0
    curPos.current.lerp(tmpP.current, kL);
    curTgt.current.lerp(tmpT.current, kL);

    const fovL = Math.min(1, dt * tokens.motion.cameraFovSmoothRate); // 5.0
    curFov.current += (fov - curFov.current) * fovL;

    // Handheld bob and roll
    const br = prefersReducedMotion
      ? 0
      : Math.sin(performance.now() * tokens.motion.bobFrequency) * tokens.motion.bobAmplitude * (1 - cur * 0.5);

    camera.position.copy(curPos.current);
    camera.position.y += br;
    camera.lookAt(curTgt.current);

    if (!prefersReducedMotion) {
      camera.rotation.z += Math.sin(performance.now() * tokens.motion.rollFrequency) * tokens.motion.rollAmplitude;
    }

    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - curFov.current) > 0.01) {
        camera.fov = curFov.current;
        camera.updateProjectionMatrix();
      }
    }

    // Key Light coupling
    if (keyLightRef && keyLightRef.current) {
      keyLightRef.current.position.x = camera.position.x - 4.5;
      keyLightRef.current.target.position.set(camera.position.x, 0.6, 0);
      keyLightRef.current.target.updateMatrixWorld();
    }
  });

  return null;
};
