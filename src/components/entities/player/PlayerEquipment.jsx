// PlayerEquipment.jsx
import React from 'react';
import { Lantern } from '../../equipment/Lantern';
import { Revolver } from '../../equipment/Revolver';

export const PlayerEquipment = ({ leftHandBone, rightHandBone }) => {
  return (
    <>
      {leftHandBone && <Lantern bone={leftHandBone} />}
      {rightHandBone && <Revolver bone={rightHandBone} />}
    </>
  );
};
