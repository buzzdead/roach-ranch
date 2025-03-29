import React, { memo } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../store/gameStore';
import Chicken from './entities/chicken/Chicken';
import Mootant from './entities/mootant/Mootant';
import Roach from './entities/roach/Roach';
import Warhog from './entities/warhog/Warhog';

// Memoize the Roach component
const MemoizedRoach = memo(Roach);
const MemoizedChicken = memo(Chicken);
const MemoizedMootant = memo(Mootant);
const MemoizedWarhog = memo(Warhog);

// This is the container component that fetches data
const EnemiesContainer = () => {
  const enemies = useGameStore(useShallow((state) => state.enemies));

  return <MemoizedEnemies enemies={enemies} />;
};

// This is the memoized component that only re-renders when the array length changes
const Enemies = ({ enemies }) => {
  return (
    <>
      {enemies.map((enemy) =>
        enemy.type === 'roach' ? (
          <MemoizedRoach
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
          />
        ) : enemy.type === 'mootant' ? (
          <MemoizedMootant
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
          />
        ) : enemy.type === 'warhog' ? (
          <MemoizedWarhog
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
          />
        ) : (
          <MemoizedChicken key={enemy.id} id={enemy.id} pos={enemy.position} />
        )
      )}
    </>
  );
};

// Custom areEqual function that only checks array length
const areEqual = (prevProps, nextProps) => {
  return prevProps.enemies.length === nextProps.enemies.length;
};

// Memoize the Enemies component with custom comparison
const MemoizedEnemies = memo(Enemies, areEqual);

export default EnemiesContainer;
