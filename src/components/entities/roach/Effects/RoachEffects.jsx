// RoachEffects.jsx
import React from 'react';
import RoachAttackEffect from './RoachAttackEffect';
import RoachBleedEffect from './RoachBleedEffect';

const RoachEffects = ({ 
  position, 
  camera, 
  isAttackingRef, 
  onAttackComplete,
  roachId,
  handleJump
}) => {
  
  return (
    <>
      <RoachAttackEffect
        position={position}
        camera={camera}
        isAttackingRef={isAttackingRef}
        onAttackComplete={onAttackComplete}
        handleJump={handleJump}
      />
      <RoachBleedEffect 
        roachId={roachId}
      />
    </>
  );
};

export default RoachEffects;