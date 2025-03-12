import React, { Suspense, useState } from 'react';
import RoachSpawn from './RoachSpawn';
import NextWaveCircle from './components/NextWave';
import { useGameEffectsStore } from './store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';

// Memoize the Roach component

const Game = () => {

  return (
    <>
     <NextWaveCircle 
        position={[0, 0, -10]} // Position in front of the cabin
        radius={3} 
      />
      <RoachSpawn />
    </>
  );
};

export default Game
