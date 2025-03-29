import { useFrame } from '@react-three/fiber';
import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import RoachBleed from './roach/RoachBleed';

const BleedEffect = ({ roachId }) => {
  const bleeds = useGameEffectsStore(
    useShallow(
      (state) =>
        state.enemies.find((r) => r.id === roachId)?.effects.bleeds || []
    )
  );
  const removeBleed = useGameEffectsStore(
    useShallow((state) => state.removeBleed)
  );
  console.log(roachId, bleeds);
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
