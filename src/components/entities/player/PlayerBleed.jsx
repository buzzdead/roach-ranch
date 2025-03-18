// src/components/entities/player/PlayerBleedEffect.jsx
import React from 'react';
import { useFrame } from '@react-three/fiber';
import RoachBleed from '../roach/RoachBleed';
import { useShallow } from 'zustand/react/shallow';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';

const PlayerBleedEffect = () => {
  const bleeds = useGameEffectsStore(
    useShallow(
      (state) => state.player.effects.bleeds || []
    )
  );
  const removePlayerBleed = useGameEffectsStore(useShallow((state) => state.removePlayerBleed));

  useFrame(() => {
    const now = Date.now();
    bleeds.forEach((bleed) => {
      if (bleed.expiresAt <= now) {
        removePlayerBleed(bleed.id);
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

export default React.memo(PlayerBleedEffect);