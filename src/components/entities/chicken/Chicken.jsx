// entity/Chicken.jsx
import React, { Suspense } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../../../store/gameStore';
import BleedEffect from '../BleedEffect';
import { getEntityRefs, useEntityLogic } from '../entity';
import EntityActions from '../EntityActions';
import EntityModel from '../EntityModel';

const Chicken = ({ id, pos }) => {
  const refs = getEntityRefs();

  const {
    isDead,
    camera,
    originalScene,
    animations,
    impactEvent,
    jumpEvent,
    handleDeath: baseHandleDeath,
  } = useEntityLogic({
    id,
    position: pos,
    entityType: 'chicken',
    modelPath: '/chicken.glb',
    refs,
  });

  const addLoot = useGameStore(useShallow((state) => state.addLoot));

  const handleDeath = () => {
    if (Math.random() > 0.3) {
      // Add loot at chicken's position
      const position = refs.modelRef.current?.position.clone();
      addLoot('talon', pos);
    }
    baseHandleDeath();
  };

  return (
    <Suspense>
      <BleedEffect roachId={id} />
      <EntityModel
        ref={refs.modelRef}
        originalScene={originalScene}
        position={pos}
        triggerImpact={impactEvent}
        triggerJump={jumpEvent}
        isDead={isDead}
        onDeathComplete={handleDeath}
        rigidBodyRef={refs.rigidBodyRef}
        entityType="chicken"
      />
      <EntityActions
        originalScene={originalScene}
        animations={animations}
        isAnimatingRef={refs.isAnimatingRef}
        position={pos}
        camera={camera}
        attackCooldownRef={refs.attackCooldownRef}
        isAttackingRef={refs.isAttackingRef}
        deadRef={refs.deadRef}
        rigidBodyRef={refs.rigidBodyRef}
        entityType="chicken"
      />
    </Suspense>
  );
};

export default Chicken;
