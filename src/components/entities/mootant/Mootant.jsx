// entity/Mootant.jsx
import React, { Suspense } from 'react';
import { getEntityRefs, useEntityLogic } from '../entity';
import MootantAttack from './MootantAttack';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import EntityModel from '../EntityModel';
import EntityActions from '../EntityActions';
import BleedEffect from '../BleedEffect';

const Mootant = ({ id, position }) => {
  const refs = getEntityRefs();

  const {
    isDead,
    camera,
    originalScene,
    animations,
    impactEvent,
    jumpEvent,
    handleDeath: baseHandleDeath,
    handleAttackComplete
  } = useEntityLogic({
    id,
    position,
    entityType: 'mootant',
    modelPath: '/mootant.glb',
    refs
  });

  // Add custom loot logic
  const addLoot = useGameEffectsStore(useShallow(state => state.addLoot));

  const handleDeath = () => {
    if (Math.random() > 0.01) {
      addLoot('tail', position);
    }
    baseHandleDeath();
  };

  return (
    <>
      <EntityModel
        ref={refs.modelRef}
        entityType="mootant"
        originalScene={originalScene}
        position={position}
        triggerImpact={impactEvent}
        triggerJump={jumpEvent}
        isDead={isDead}
        onDeathComplete={handleDeath}
        rigidBodyRef={refs.rigidBodyRef}
      />
      <EntityActions
        originalScene={originalScene}
        animations={animations}
        isAnimatingRef={refs.isAnimatingRef}
        position={position}
        camera={camera}
        attackCooldownRef={refs.attackCooldownRef}
        isAttackingRef={refs.isAttackingRef}
        deadRef={refs.deadRef}
        rigidBodyRef={refs.rigidBodyRef}
        entityType='mootant'
      />
      <Suspense fallback={null}>
        <BleedEffect roachId={id} />
        <MootantAttack
          position={position}
          camera={camera}
          isAttackingRef={refs.isAttackingRef}
          onAttackComplete={handleAttackComplete}
          handleJump={jumpEvent}
          modelRef={refs.modelRef}
        />
      </Suspense>
    </>
  );
};

export default Mootant;