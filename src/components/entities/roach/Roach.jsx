// Roach.jsx (modified)
import React, { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import RoachModel from './RoachModel';
import RoachAudio from './RoachAudio';
import RoachEffects from './Effects/RoachEffects';
import CollisionManager from '../../../utils/CollisionManager';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/react/shallow';
import { modelCache } from '../../../utils/Preloader';
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';
import EntityActions from '../EntityActions';

const Roach = ({ id, position }) => {
  const { scene, animations } = modelCache['/roach.glb'];
  
  // Clone the scene
  const originalScene = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);

    return cloned;
  }, [scene]);

  const { camera } = useThree();
  const modelRef = useRef();
  const rigidBodyRef = useRef()
  const deadRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const [isDead, setIsDead] = useState(false);
  const attackCooldownRef = useRef(0);
  const addBleed = useGameEffectsStore(useShallow((state) => state.addBleed));
  const removeEnemy = useGameEffectsStore(
    useShallow((state) => state.removeEnemy)
  );
  const addLoot = useGameEffectsStore(useShallow((state) => state.addLoot));
  // References instead of state to prevent rerenders
  const isAttackingRef = useRef(false);

  const handleAttackComplete = () => {
    isAttackingRef.current = false;
    // Schedule the next attack
  };

  const impactEvent = useMemo(() => {
    const subscribers = [];
    return {
      trigger: (direction) => subscribers.forEach((fn) => fn(direction)),
      subscribe: (fn) => subscribers.push(fn),
      unsubscribe: (fn) => subscribers.splice(subscribers.indexOf(fn), 1),
    };
  }, []);

  const jumpEvent = useMemo(() => {
    const subscribers = [];
    return {
      trigger: () => subscribers.forEach((fn) => fn()),
      subscribe: (fn) => subscribers.push(fn),
      unsubscribe: (fn) => subscribers.splice(subscribers.indexOf(fn), 1),
    };
  }, []);

  const setHealth = (p, m) => {
    impactEvent.trigger(p.bulletDirection);
    const newHealth = addBleed(id, p.position, p.bulletDirection, p.damage);
    if (newHealth <= 0) deadRef.current = true;
    if (newHealth < 0) setIsDead(true);
  };

  useEffect(() => {
    if (!modelRef.current) return;

    // Register with collision manager when mounted
    const unregister = CollisionManager.registerEnemy({
      mesh: modelRef.current,
      position,
      onHit: (p, m) => {
        setHealth(p, m);
      },
    });

    // Unregister when unmounted
    return unregister;
  }, [position]);
  const handleDeath = () => {
    if (Math.random() > 0.3) {
      addLoot('chitin', position);
    }
    removeEnemy(id);
  };
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
        rigidBodyRef={rigidBodyRef}
      />
      <EntityActions
        originalScene={originalScene}
        animations={animations}
        isAnimatingRef={isAnimatingRef}
        position={position}
        camera={camera}
        attackCooldownRef={attackCooldownRef}
        isAttackingRef={isAttackingRef}
        deadRef={deadRef}
        rigidBodyRef={rigidBodyRef}
      />

      <RoachAudio
        position={position}
        isAnimatingRef={isAnimatingRef}
        isAttackingRef={isAttackingRef}
        deadRef={deadRef}
      />

      <Suspense fallback={null}>
        <RoachEffects
          position={position}
          camera={camera}
          isAttackingRef={isAttackingRef}
          onAttackComplete={handleAttackComplete}
          roachId={id}
          handleJump={jumpEvent}
          modelRef={modelRef}
        />
      </Suspense>
    </>
  );
};

export default Roach;
