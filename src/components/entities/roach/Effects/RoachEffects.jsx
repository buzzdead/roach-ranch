// RoachEffects.jsx
import React from 'react';
import RoachAttackEffect from './RoachAttackEffect';
import RoachBleedEffect from './RoachBleedEffect';

const RoachEffects = ({ 
  position, 
  camera, 
  isAttackingRef, 
  onAttackComplete,
  roachId
}) => {
  console.log("rendedring effects")
  return (
    <>
      <RoachAttackEffect
        position={position}
        camera={camera}
        isAttackingRef={isAttackingRef}
        onAttackComplete={onAttackComplete}
      />
      <RoachBleedEffect 
        roachId={roachId}
      />
    </>
  );
};

export default RoachEffects;