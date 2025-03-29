import { useEffect } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from './store/gameStore';

const Test = () => {
  const addEnemy = useGameStore(useShallow((state) => state.addEnemy));
  useEffect(() => {
    addEnemy('roach', [0, 0, -10]);
    addEnemy('chicken', [5, 0, -10]);
    addEnemy('mootant', [10, 0, -10]);
    addEnemy('warhog', [15, 0, -10]);
  }, []);
  return null;
};

export default Test;
