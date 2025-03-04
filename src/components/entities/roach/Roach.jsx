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
import { useGameEffectsStore } from '../../../context/gameEffectsStore'
import { useShallow } from 'zustand/react/shallow'; 
import { modelCache } from '../../../Preloader';

const Roach = ({id, position }) => {
  const { scene, animations } = modelCache['/mutant-new2.glb'];
  const originalScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { camera } = useThree();
  const modelRef = useRef();
  const deadRef = useRef(false)
  const isAnimatingRef = useRef(false);
  const attackCooldownRef = useRef(0);
  const addBleed = useGameEffectsStore(
    useShallow((state) => state.addBleed)
  );
  // References instead of state to prevent rerenders
  const isAttackingRef = useRef(false);
  
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
    jumpEvent.trigger();
    const newHealth = addBleed(id, p.position, p.bulletDirection);
    if(newHealth <= 0) deadRef.current = true
    console.log(newHealth)
    
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
  console.log("rerendering main")
  return (
    <>
      
      <RoachModel 
        ref={modelRef}
        originalScene={originalScene}
        position={position}
        triggerJump={jumpEvent}
      >
      
      </RoachModel>
      <RoachAnimation 
        originalScene={originalScene}
        animations={animations}
        isAnimatingRef={isAnimatingRef}
        position={position}
        camera={camera}
        attackDistance={attackDistance}
        attackCooldownRef={attackCooldownRef}
        isAttackingRef={isAttackingRef}
        deadRef={deadRef}
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
          onAttackComplete={handleAttackComplete}
          roachId={id}
        />
      </Suspense>
    </>
  );
};

export default Roach;