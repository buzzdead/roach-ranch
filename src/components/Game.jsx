import React from 'react';
import NextWaveCircle from './NextWave';
import EnemyGenerator from './EnemyGenerator';

// Memoize the Roach component

const Game = () => {

  return (
    <>
     <NextWaveCircle 
        position={[0, 0, -10]} // Position in front of the cabin
        radius={3} 
      />
      <EnemyGenerator />
    </>
  );
};

export default Game
