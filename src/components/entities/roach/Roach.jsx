// Roach.jsx (modified)
import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import RoachModel from './RoachModel';
import RoachAnimation from './RoachAnimation';
import RoachAudio from './RoachAudio';
import RoachEffects from './Effects/RoachEffects';
import CollisionManager from '../../../utils/CollisionManager';
import { useGameEffectsStore } from '../../../context/gameEffectsStore'
import { useShallow } from 'zustand/react/shallow'; 
import { modelCache } from '../../../Preloader';

const Roach = ({id, position }) => {
  const { scene, animations } = modelCache['/mutant-new3.glb'];
  const originalScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { camera } = useThree();
  const modelRef = useRef();
  const deadRef = useRef(false)
  const isAnimatingRef = useRef(false);
  const [isDead, setIsDead] = useState(false)
  const attackCooldownRef = useRef(0);
  const addBleed = useGameEffectsStore(
    useShallow((state) => state.addBleed)
  );
  const removeRoach = useGameEffectsStore(
    useShallow((state) => state.removeRoach)
  );
  const addLoot = useGameEffectsStore(
    useShallow((state) => state.addLoot)
  )
  // References instead of state to prevent rerenders
  const isAttackingRef = useRef(false);
  
  // Constants
  const attackDistance = 10;

  const handleAttackComplete = () => {
    isAttackingRef.current = false;
    // Schedule the next attack
  };

  const impactEvent = useMemo(() => {
    const subscribers = [];
    return {
      trigger: (direction) => subscribers.forEach(fn => fn(direction)),
      subscribe: (fn) => subscribers.push(fn),
      unsubscribe: (fn) => subscribers.splice(subscribers.indexOf(fn), 1)
    };
  }, []);

  const jumpEvent = useMemo(() => {
    const subscribers = [];
    return {
      trigger: () => subscribers.forEach(fn => fn()),
      subscribe: (fn) => subscribers.push(fn),
      unsubscribe: (fn) => subscribers.splice(subscribers.indexOf(fn), 1)
    };
  }, []);

  const setHealth = (p, m) => {
    impactEvent.trigger(p.bulletDirection);
    const newHealth = addBleed(id, p.position, p.bulletDirection);
    if(newHealth <= 0) deadRef.current = true
    console.log(newHealth)
    if(newHealth < 0) setIsDead(true)
    
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
  const handleDeath = () => {
    if (Math.random() > 0) {
      
      // Add chitin at the roach's position
      position[1] += 0.25
      addLoot('chitin', position);
    }
    removeRoach(id)
  }
  return (
    <>
      
      <RoachModel 
        ref={modelRef}
        originalScene={originalScene}
        position={position}
        triggerImpact={impactEvent}
        triggerJump={jumpEvent}
        isDead={isDead}
        onDeathComplete={handleDeath}
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
          handleJump={jumpEvent}
        />
      </Suspense>
    </>
  );
};

export default Roach;