// RoachAttackEffect.jsx
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import RoachAttack from '../RoachAttack';

const RoachAttackEffect = ({ 
  position, 
  camera, 
  isAttackingRef, 
  onAttackComplete 
}) => {
  const [showAttack, setShowAttack] = useState(false);

  // Check ref and update local state for rendering
  useFrame(() => {
    // Update attack state
    if (isAttackingRef.current !== showAttack) {
      setShowAttack(isAttackingRef.current);
    }
  });

  const handleAttackComplete = () => {
    isAttackingRef.current = false;
    onAttackComplete();
  };

  return (
    <>
      {showAttack && camera.userData.characterPos && (
        <RoachAttack 
          position={position}
          playerPosition={camera.userData.characterPos}
          onComplete={handleAttackComplete}
        />
      )}
    </>
  );
};

export default React.memo(RoachAttackEffect);