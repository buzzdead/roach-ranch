import { Vector3 } from 'three';
import { modelCache } from '../../../Preloader';
import { useEffect, useRef, useMemo, useState, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import CollisionManager from '../../../utils/CollisionManager';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import RoachBleedEffect from '../roach/Effects/RoachBleedEffect';
import ChickenModel from './ChickenModel';
import RoachActions from '../roach/RoachActions';
import ChickenAttack from './ChickenAttack';
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';

const Chicken = ({ id, pos }) => {
  const position = new Vector3([pos[0], pos[1], pos[2]]);
  const modelRef = useRef();
  const rigidBodyRef = useRef()
  const isAnimatingRef = useRef()
   const attackCooldownRef = useRef(0);
  const isAttackingRef = useRef(false);
  const deadRef = useRef()
  const { camera } = useThree()
  const { scene, animations } = modelCache['/chicken-opt.glb'];
   const originalScene = useMemo(() => {
      const cloned = SkeletonUtils.clone(scene);
  
      return cloned;
    }, [scene]);
  const [isDead, setIsDead] = useState(false);
  const addBleed = useGameEffectsStore(useShallow((state) => state.addBleed));
  const removeEnemy = useGameEffectsStore(
    useShallow((state) => state.removeEnemy))

  const setHealth = (p, m) => {
    
    const newHealth = addBleed(id, p.position, p.bulletDirection, p.damage);
    console.log(newHealth)
    if(newHealth > 0)  impactEvent.trigger(p.bulletDirection);
    if (newHealth === 0) deadRef.current = true;
    if (newHealth < 0) setIsDead(true);
  };
  useEffect(() => {
    if (!modelRef.current) return;

    // Register with collision manager when mounted
    const unregister = CollisionManager.registerEnemy({
      mesh: modelRef.current,
      position: pos,
      onHit: (p, m) => {
        setHealth(p, m);
      },
      type: 'chicken',
    });

    // Unregister when unmounted
    return unregister;
  }, [position]);
 

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

  // Update position and rotation each frame
  useFrame((state, delta) => {
    /*  if (modelRef.current) {
            // Update angle
            angleRef.current += delta * walkSpeed
            
            // Calculate new position on the circle
            const x = position.x + Math.cos(angleRef.current) * walkRadius
            const z = position.z + Math.sin(angleRef.current) * walkRadius
            
            // Update position
            modelRef.current.position.x = x
            modelRef.current.position.z = z
            
            // Make the chicken face the direction it's moving
            modelRef.current.rotation.y = angleRef.current + Math.PI / 2
        } */
  });
  const handleDeath = () => {
    if (Math.random() > 0.3) {
      // Add chitin at the roach's position
      const pos = modelRef.current.position.clone()
      //addLoot('chitin', position);
    }
    removeEnemy(id);
  };
  return (
    <Suspense>
     
      <RoachBleedEffect roachId={id} />{' '}
      <ChickenModel
        ref={modelRef}
        originalScene={originalScene}
        position={pos}
        triggerImpact={impactEvent}
        triggerJump={jumpEvent}
        isDead={isDead}
        onDeathComplete={handleDeath}
        rigidBodyRef={rigidBodyRef}
      />
    
      <RoachActions
        originalScene={originalScene}
        animations={animations}
        isAnimatingRef={isAnimatingRef}
        position={pos}
        camera={camera}
        attackCooldownRef={attackCooldownRef}
        isAttackingRef={isAttackingRef}
        deadRef={deadRef}
        rigidBodyRef={rigidBodyRef}
        entityType='chicken'
      />
    </Suspense>
  );
};

export default Chicken;
