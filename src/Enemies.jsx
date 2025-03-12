import React, { memo } from 'react';
import { useGameEffectsStore } from './store/gameEffectsStore';
import Roach from './components/entities/roach/Roach';
import { useShallow } from 'zustand/shallow';

// Memoize the Roach component
const MemoizedRoach = memo(Roach);

const Enemies = () => {
  const roaches = useGameEffectsStore(useShallow((state) => state.roaches));

  return (
    <>
      {roaches.map((roach) => (
        <MemoizedRoach key={roach.id} id={roach.id} position={roach.position} skeleton={roach.skeleton ? roach.skeleton : null}/>
      ))}
    </>
  );
};

export default memo(Enemies);
