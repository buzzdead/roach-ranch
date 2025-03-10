import React, { memo, useState } from 'react';
import { useGameEffectsStore } from './store/gameEffectsStore';
import Roach from './components/entities/roach/Roach';
import { useShallow } from 'zustand/shallow';
import RoachSpawn from './RoachSpawn';

// Memoize the Roach component
const MemoizedRoach = memo(Roach);

const Enemies = () => {
  const [spawn, setSpawn] = useState(false)
  const roaches = useGameEffectsStore(useShallow((state) => state.roaches));
  return (
    <>
      {roaches.map((roach) => (
        <MemoizedRoach key={roach.id} id={roach.id} position={roach.position} />
      ))}
      {spawn && <RoachSpawn />}
    </>
  );
};

export default memo(Enemies)
