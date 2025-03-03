// RoachEffects.jsx
import React from 'react';
import RoachAttackEffect from './RoachAttackEffect';
import RoachBleedEffect from './RoachBleedEffect';

const RoachEffects = ({ 
  position, 
  camera, 
  isAttackingRef, 
  bleedRef, 
  onAttackComplete 
}) => {
  console.log("rendering")
  return (
    <>
      <RoachAttackEffect
        position={position}
        camera={camera}
        isAttackingRef={isAttackingRef}
        onAttackComplete={onAttackComplete}
      />
      <RoachBleedEffect 
        bleedRef={bleedRef}
      />
    </>
  );
};

export default RoachEffects;