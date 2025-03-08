// SceneEffects.jsx - Enhanced for better visibility
import React from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import * as THREE from 'three';

const SceneEffects = () => {
  return (
    <EffectComposer>
      {/* Enhanced bloom settings */}
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={0.6}
      />
      <ToneMapping opacity={.5} blendFunction={THREE.AdditiveBlending} />
      {/* Slightly reduced vignette darkness */}
      <Vignette offset={0.5} darkness={0.65} eskil={false} />
    </EffectComposer>
  );
};

export default SceneEffects;
