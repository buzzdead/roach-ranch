// components/LanternLight.jsx
import React, { forwardRef } from 'react';

/**
 * A specialized point light component for lanterns
 */
export const LanternLight = forwardRef(({ config }, ref) => {
  return (
    <pointLight
      ref={ref}
      position={config.position}
      intensity={config.intensity}
      distance={config.distance}
      decay={config.decay}
      color={config.color}
      castShadow={config.castShadow}
    />
  );
});

LanternLight.displayName = 'LanternLight';
