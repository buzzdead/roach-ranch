// SceneEffects.jsx - Enhanced with tuning suggestions
import React from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SSAO,
  Noise,
  HueSaturation, // Added for color correction
  // Noise, // Example: Could add noise
  // DepthOfField // Example: Could add DoF
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing'; // Import BlendFunction if needed
import * as THREE from 'three'; // Keep for Vignette blend function if using THREE constants

const SceneEffects = () => {
  return (
    <EffectComposer enableNormalPass>
      {/* SSAO often works well earlier */}
      <SSAO
        samples={21} // Balance quality/perf
        radius={5} // Adjust based on scene scale! Maybe use worldRadius={true}?
        intensity={0.6} // Start lower, increase carefully
         worldRadius={true} // Consider enabling this
         distanceThreshold={0.01} // Fine tune falloff (advanced)
         distanceFalloff={0.0}    // Fine tune falloff (advanced)
      />

      {/* Bloom - tune threshold and intensity based on desired look */}
      <Bloom
        mipmapBlur // Often looks smoother and performs well
        luminanceThreshold={0.6} // Adjust: Higher=only brightest bloom, Lower=more haze
        luminanceSmoothing={0.2} // Adjust: Lower=sharper cutoff, Higher=softer
        intensity={0.5} // Adjust strength
        radius={0.5} // Adjust blur radius when using mipmapBlur
      />

      {/* Subtle Color Correction */}
      <HueSaturation
        hue={0} // Shift hue (e.g., 0.1 for slight shift)
        saturation={0.05} // Slightly boost/reduce saturation (e.g., -0.1 for desaturation)
      />

      {/* Optional: Subtle noise */}
      <Noise
        premultiply // Needed if Noise is before transparent elements/effects
        blendFunction={BlendFunction.AVERAGE} // Subtle blend mode
        opacity={0.05} // Very subtle amount
      /> 

     

      {/* Vignette usually last */}
      <Vignette
        eskil={true} // Try Eskil's vignette
        offset={0.1} // Adjust for Eskil or desired start point
        darkness={0.6} // Adjust darkness level
         blendFunction={BlendFunction.NORMAL} // Default usually fine
      />
    </EffectComposer>
  );
};

export default SceneEffects;