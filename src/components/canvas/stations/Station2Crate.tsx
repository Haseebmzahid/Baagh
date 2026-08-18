import React from 'react';

/**
 * Station 2 — Crate Component
 *
 * Station 2 sits at the sorting table (X=0) alongside Station 1, representing the crate framing beat
 * as the camera pulls back from macro close-up (K1: 0.02, 0.905, 0.155, FOV 30) to crate framing (K2: 0.28, 1.36, 0.66, FOV 40).
 *
 * All 3D meshes (hero crate, paper liner, 5 mangoes, sorting table, near occluders) reside in the single
 * SceneWorld coordinate system at X=0. Camera interpolation and lighting decay are managed by CameraRig and SceneWorld.
 */
export const Station2Crate: React.FC = () => {
  return (
    <group name="station-2-crate-marker" position={[0, 0, 0]}>
      {/* Station 2 anchor marker in single coordinate system */}
    </group>
  );
};
