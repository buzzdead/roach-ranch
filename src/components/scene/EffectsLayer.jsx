// components/scene/EffectsLayer.jsx
import React, { Suspense } from 'react';
import MysteriousWall from '../effects/MysteriousWall';
import MysteriousBoundary from '../effects/AtmosphericBoundary';
import HorrorMoon from '../environment/SpookyMoon';
import SceneEffects from '../effects/SceneEffects';
import SoundEffects from '../effects/SoundEffects';

const EffectsLayer = () => {
  return (
    <>
      <MysteriousWall />
      <HorrorMoon />
      <MysteriousBoundary intensity={1.5} />
      <SoundEffects />
      
      <Suspense fallback={null}>
        <SceneEffects />
      </Suspense>
    </>
  );
};

export default EffectsLayer;