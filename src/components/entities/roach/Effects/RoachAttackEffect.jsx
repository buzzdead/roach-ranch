import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import RoachAttack from '../RoachAttack';

const RoachAttackEffect = ({ position, camera, isAttackingRef, onAttackComplete, handleJump }) => {
  const [showAttack, setShowAttack] = useState(false);
  const jumpTriggeredRef = useRef(false);
  useFrame(() => {
    // Starting attack
    if (isAttackingRef.current && !showAttack && !jumpTriggeredRef.current) {
      // Mark jump as triggered
      jumpTriggeredRef.current = true;
      
      // Trigger jump
      handleJump.trigger();
      
      // Delay attack animation
      setTimeout(() => {
        setShowAttack(true);
      }, 350);
    } 
    // Ending attack
    else if (!isAttackingRef.current && showAttack) {
      setShowAttack(false);
      jumpTriggeredRef.current = false;
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