// src/components/entities/player/PlayerBleedEffect.jsx
import { useFrame } from '@react-three/fiber';
import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../../store/gameStore';
import RoachBleed from '../roach/RoachBleed';

const PlayerBleedEffect = () => {
  const bleeds = useGameStore(
    useShallow((state) => state.player.effects.bleeds || [])
  );
  const removePlayerBleed = useGameStore(
    useShallow((state) => state.removePlayerBleed)
  );

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
