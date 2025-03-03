// Roach.jsx
import React, { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import RoachModel from './RoachModel';
import RoachAnimation from './RoachAnimation';
import RoachAudio from './RoachAudio';
import RoachAttack from './RoachAttack';
import RoachLighting from './RoachLighting';
import CollisionManager from '../../../utils/CollisionManager';
import { Vector3 } from 'three'
import RoachBleed from './RoachBleed';

const Roach = ({ position }) => {
  const { scene, animations } = useGLTF('/mutant-new.glb');
  const originalScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { camera } = useThree();
  const modelRef = useRef();
  const rbRef = useRef()
  const isAnimatingRef = useRef(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const attackCooldownRef = useRef(0);
  const [bleed, setBleed] = useState({doesBleed: false, pos: new Vector3()})
  const bleedRef = useRef(false)
  
  // Constants
  const attackDistance = 10; // Distance at which roach will attack

  const handleAttackComplete = () => {
    setIsAttacking(false);
    // Schedule the next attack
   
  };

  const jumpEvent = useMemo(() => {
    const subscribers = [];
    return {
      trigger: () => subscribers.forEach(fn => fn()),
      subscribe: (fn) => subscribers.push(fn),
      unsubscribe: (fn) => subscribers.splice(subscribers.indexOf(fn), 1)
    };
  }, []);

  const setHealth = (p, m) => {
    setBleed({doesBleed: true, pos: p.position.clone()});
    jumpEvent.trigger();
    setTimeout(() => {setBleed({doesBleed: false, pos: new Vector3()})}, 2000);
  }

  useEffect(() => {
    if (!modelRef.current) return;
    
    // Register with collision manager when mounted
    const unregister = CollisionManager.registerEnemy({
      mesh: modelRef.current,
      position,
      onHit: (p, m) => {
        setHealth(p, m);
        // Add hit effects, sound, etc.
      }
    });
    
    // Unregister when unmounted
    return unregister;
  }, [position]);

  return (
    <>
      <RoachLighting position={position} />
      <RoachModel 
        ref={modelRef}
        originalScene={originalScene}
        position={position}
        triggerJump={jumpEvent}
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
      {bleed.doesBleed && <Suspense><RoachBleed position={bleed.pos} /></Suspense>}
    </>
  );
};

export default Roach;
