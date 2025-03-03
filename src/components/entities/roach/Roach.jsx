// Roach.jsx (modified)
import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import RoachModel from './RoachModel';
import RoachAnimation from './RoachAnimation';
import RoachAudio from './RoachAudio';
import RoachEffects from './Effects/RoachEffects';
import RoachLighting from './RoachLighting';
import CollisionManager from '../../../utils/CollisionManager';
import { Vector3 } from 'three'

const Roach = ({ position }) => {
  const { scene, animations } = useGLTF('/mutant-new.glb');
  const originalScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { camera } = useThree();
  const modelRef = useRef();
  const isAnimatingRef = useRef(false);
  const attackCooldownRef = useRef(0);
  
  // References instead of state to prevent rerenders
  const isAttackingRef = useRef(false);
  const bleedRef = useRef({ doesBleed: false, pos: new Vector3(), bulletDirection: new Vector3() });
  
  // Constants
  const attackDistance = 10;

  const handleAttackComplete = () => {
    isAttackingRef.current = false;
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
    console.log(p)
    bleedRef.current = { doesBleed: true, pos: p.position.clone(), bulletDirection: p.bulletDirection.clone() };
    jumpEvent.trigger();
    setTimeout(() => {
      bleedRef.current = { doesBleed: false, pos: new Vector3(), direction: new Vector3() };
    }, 2000);
  }

  useEffect(() => {
    if (!modelRef.current) return;
    
    // Register with collision manager when mounted
    const unregister = CollisionManager.registerEnemy({
      mesh: modelRef.current,
      position,
      onHit: (p, m) => {
        setHealth(p, m);
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
        isAttackingRef={isAttackingRef}
      />
      
      <RoachAudio 
        position={position}
        isAnimatingRef={isAnimatingRef}
        isAttackingRef={isAttackingRef}
      />
      
      <Suspense fallback={null}>
        <RoachEffects
          position={position}
          camera={camera}
          isAttackingRef={isAttackingRef}
          bleedRef={bleedRef}
          onAttackComplete={handleAttackComplete}
        />
      </Suspense>
    </>
  );
};

export default Roach;