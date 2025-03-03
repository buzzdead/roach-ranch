import React from 'react';
import { useFrame } from '@react-three/fiber';
import RoachBleed from '../RoachBleed';
import { useGameEffectsStore } from '../../../../context/gameEffectsStore';
import { useShallow } from 'zustand/react/shallow'; 

const RoachBleedEffect = ({ roachId }) => {
  const bleeds = useGameEffectsStore(
    useShallow((state) =>
      state.roaches.find((r) => r.id === roachId)?.effects.bleeds || []
    )
  );
  const removeBleed = useGameEffectsStore((state) => state.removeBleed);

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
        <RoachBleed
          key={bleed.id}
          position={bleed.pos}
          target={bleed.dir}
        />
      ))}
    </>
  );
};

export default React.memo(RoachBleedEffect);