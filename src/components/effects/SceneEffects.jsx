// SceneEffects.jsx - Enhanced for better visibility
import React from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SSAO,
  ColorAverage
} from '@react-three/postprocessing';
import * as THREE from 'three';

const SceneEffects = () => {
  return (
    <EffectComposer enableNormalPass>
      {/* Enhanced bloom settings */}
       <Bloom
        luminanceThreshold={0.24} // Lowered to catch more emissive light
        luminanceSmoothing={0.65} // Slightly sharper transition
        intensity={0.6} // Slightly stronger bloom
      />
     
     <Vignette
    eskil={false}
    offset={0.1}
    darkness={0.75}
    blendFunction={THREE.NormalBlending}
  />
  
  {/* Add ambient occlusion for more depth */}
  <SSAO
  
    samples={21}
    radius={7}
    intensity={1}
  />
  
  {/* Add subtle color correction */}
 
    </EffectComposer>
  );
};

export default SceneEffects;
