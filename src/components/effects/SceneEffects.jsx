// SceneEffects.jsx - Enhanced for better visibility
import React from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

const SceneEffects = () => {
  return (
    <EffectComposer>
      {/* Enhanced bloom settings */}
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={0.6} 
      />
      
      {/* Slightly reduced vignette darkness */}
      <Vignette
        offset={0.5}
        darkness={0.6}
        eskil={false}
      />
    </EffectComposer>
  );
};

export default SceneEffects;