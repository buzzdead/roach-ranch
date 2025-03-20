import React, { memo } from 'react';
import { useGameEffectsStore } from './store/gameEffectsStore';
import Roach from './components/entities/roach/Roach';
import { useShallow } from 'zustand/shallow';
import Chicken from './components/entities/chicken/Chicken';

// Memoize the Roach component
const MemoizedRoach = memo(Roach);
const MemoizedChicken = memo(Chicken);

// This is the container component that fetches data
const EnemiesContainer = () => {
  const enemies = useGameEffectsStore(useShallow((state) => state.enemies));
  console.log("E container")
  return <MemoizedEnemies enemies={enemies} />;
};

// This is the memoized component that only re-renders when the array length changes
const Enemies = ({ enemies }) => {
  console.log("EEE")
  return (
    <>
      {enemies.map((enemy) => (
        enemy.type === "roach" 
          ? <MemoizedRoach key={enemy.id} id={enemy.id} position={enemy.position} /> 
          : <MemoizedChicken key={enemy.id} id={enemy.id} pos={enemy.position} />
      ))}
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