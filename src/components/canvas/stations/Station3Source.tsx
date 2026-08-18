import React from 'react';

/**
 * Station 3 — Source Component
 *
 * Station 3 represents the widest outdoor orchard framing beat as the camera moves to K3 (0.05, 1.5, 2.55, FOV 45)
 * looking across the sorting table into the 88 orchard trees receding into the atmospheric fog.
 *
 * All 3D meshes (orchard trees, ground plane, sky environment) reside in the single SceneWorld coordinate system.
 * Camera interpolation and atmospheric density modulation are driven by CameraRig and SceneWorld.
 */
export const Station3Source: React.FC = () => {
  return (
    <group name="station-3-source-marker" position={[0, 0, 0]}>
      {/* Station 3 anchor marker in single coordinate system */}
    </group>
  );
};
