import { useFrame } from '@react-three/fiber';
import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../store/gameStore';
import RoachBleed from './roach/RoachBleed';

const BleedEffect = ({ roachId }) => {
  const bleeds = useGameStore(
    useShallow(
      (state) =>
        state.enemies.find((r) => r.id === roachId)?.effects.bleeds || []
    )
  );
  const removeBleed = useGameStore(useShallow((state) => state.removeBleed));
  useFrame(() => {
    const now = Date.now();
    bleeds.forEach((bleed) => {
      if (bleed.expiresAt <= now) {
        removeBleed(bleed.id);
      }
    });
  });

  return (
    <>
      {bleeds.map((bleed) => (
        <RoachBleed key={bleed.id} position={bleed.pos} target={bleed.dir} />
      ))}
    </>
  );
};

export default React.memo(BleedEffect);
