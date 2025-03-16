import React, { memo } from 'react';
import { useGameEffectsStore } from './store/gameEffectsStore';
import Roach from './components/entities/roach/Roach';
import { useShallow } from 'zustand/shallow';
import Chicken from './components/entities/chicken/Chicken';

// Memoize the Roach component
const MemoizedRoach = memo(Roach);
const MemoizedChicken = memo(Chicken)

const Enemies = () => {
  const enemies = useGameEffectsStore(useShallow((state) => state.enemies));
 console.log(enemies)

  return (
    <>
      {enemies.map((enemy) => (
        enemy.type === "roach" ?  <MemoizedRoach key={enemy.id} id={enemy.id} position={enemy.position} /> : <MemoizedChicken id={enemy.id} pos={enemy.position} />
      ))}
    </>
  );
};

export default memo(Enemies);
