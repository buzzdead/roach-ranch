// Roach.jsx
import React, { Suspense, useMemo, useRef, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import RoachModel from './RoachModel';
import RoachAnimation from './RoachAnimation';
import RoachAudio from './RoachAudio';
import RoachAttack from './RoachAttack';
import RoachLighting from './RoachLighting';

const Roach = ({ position }) => {
  const { scene, animations } = useGLTF('/mutant-new.glb');
  const originalScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { camera } = useThree();
  
  const modelRef = useRef();
  const isAnimatingRef = useRef(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const attackCooldownRef = useRef(0);
  
  // Constants
  const attackDistance = 10; // Distance at which roach will attack

  const handleAttackComplete = () => {
    setIsAttacking(false);
    // Schedule the next attack
   
  };

  return (
    <>
      <RoachLighting position={position} />
      
      <RoachModel 
        ref={modelRef}
        originalScene={originalScene}
        position={position}
      />
      
      <RoachAnimation 
        originalScene={originalScene}
        animations={animations}
        isAnimatingRef={isAnimatingRef}
        position={position}
        camera={camera}
        attackDistance={attackDistance}
        attackCooldownRef={attackCooldownRef}
        isAttacking={isAttacking}
        setIsAttacking={setIsAttacking}
      />
      
      <RoachAudio 
        position={position}
        isAnimatingRef={isAnimatingRef}
        isAttacking={isAttacking}
      />
      
      {isAttacking && camera.userData.characterPos && (
        <Suspense>
        <RoachAttack 
          position={position}
          playerPosition={camera.userData.characterPos}
          onComplete={handleAttackComplete}
        />
        </Suspense>
      )}
    </>
  );
};

export default Roach;
