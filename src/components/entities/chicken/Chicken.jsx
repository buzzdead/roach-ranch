// entity/Chicken.jsx
import React, { Suspense } from 'react';
import { getEntityRefs, useEntityLogic } from '../entity';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import EntityModel from '../EntityModel';
import EntityActions from '../EntityActions';
import BleedEffect from '../BleedEffect';

const Chicken = ({ id, pos }) => {
 const refs = getEntityRefs();
 
 const {
   isDead,
   camera,
   originalScene,
   animations,
   impactEvent,
   jumpEvent,
   handleDeath: baseHandleDeath
 } = useEntityLogic({
   id,
   position: pos,
   entityType: 'chicken',
   modelPath: '/chicken.glb',
   refs
 });
 
 const addLoot = useGameEffectsStore(useShallow(state => state.addLoot));
 
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
       entityType='chicken' 
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
       entityType='chicken'
     />
   </Suspense>
 );
};

export default Chicken;