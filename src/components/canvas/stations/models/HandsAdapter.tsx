import React from 'react';
import { ProceduralHandGroup, ProceduralHandGroupProps } from './ProceduralHandGroup';

export interface HandsAdapterProps extends ProceduralHandGroupProps {
  usePhotorealAsset?: boolean;
}

/**
 * HandsAdapter: Decoupled interface wrapping Station 4 hand model representation.
 * For V1, uses ProceduralHandGroup.
 * Allows seamless swapping to PhotorealHandAdapter in V2 without changing Station 4 scene parameters.
 */
export const HandsAdapter: React.FC<HandsAdapterProps> = ({
  usePhotorealAsset = false,
  position,
  rotation,
  scale,
}) => {
  if (usePhotorealAsset) {
    // V2 Photoreal slot fallback to procedural
    return <ProceduralHandGroup position={position} rotation={rotation} scale={scale} />;
  }

  return <ProceduralHandGroup position={position} rotation={rotation} scale={scale} />;
};
