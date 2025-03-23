// RoachEffects.jsx
import React from 'react';
import RoachAttackEffect from './RoachAttackEffect';
import BleedEffect from '../../BleedEffect';

const RoachEffects = ({
  position,
  camera,
  isAttackingRef,
  onAttackComplete,
  roachId,
  handleJump,
  modelRef,
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
      <BleedEffect roachId={roachId} />
    </>
  );
};

export default RoachEffects;
