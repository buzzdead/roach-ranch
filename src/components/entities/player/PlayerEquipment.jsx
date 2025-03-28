// Update in PlayerEquipment.jsx
import React from 'react';
import { Lantern } from '../../equipment/Lantern';
import { Revolver } from '../../equipment/Revolver';
import { Shotgun } from '../../equipment/Shotgun';
import { useShallow } from 'zustand/shallow';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';

export const PlayerEquipment = ({ leftHandBone, rightHandBone }) => {
  const { weapons } = useGameEffectsStore(
    useShallow(state => ({
      weapons: state.weapons
    }))
  );
  
  // Determine which weapon to show based on equipped status
  const showRevolver = weapons.revolver && weapons.revolver.equipped;
  const showShotgun = weapons.shotgun && weapons.shotgun.equipped;
  
  return (
    <>
      {leftHandBone && <Lantern bone={leftHandBone} />}
      {rightHandBone && showRevolver && <Revolver bone={rightHandBone} />}
      {rightHandBone && showShotgun && <Shotgun bone={rightHandBone} />}
    </>
  );
};