import { Vector3 } from 'three';
import { modelCache } from '../../../Preloader';
import { useEffect, useRef, useMemo, useState } from 'react';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import CollisionManager from '../../../utils/CollisionManager';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import RoachBleedEffect from '../roach/Effects/RoachBleedEffect';
import ChickenModel from './ChickenModel';
import RoachActions from '../roach/RoachActions';

const Chicken = ({ id, pos }) => {
  const position = new Vector3([pos[0], pos[1], pos[2]]);
  const modelRef = useRef();
  const rigidBodyRef = useRef()
  const isAnimatingRef = useRef()
   const attackCooldownRef = useRef(0);
  const isAttackingRef = useRef(false);
  const deadRef = useRef()
  const { camera } = useThree()
  const { scene, animations } = modelCache['/chicken2.glb'];
  const [isDead, setIsDead] = useState(false);
  const addBleed = useGameEffectsStore(useShallow((state) => state.addBleed));
  // Use animations hook to access and control animations
  const { actions, mixer } = useAnimations(animations, modelRef);
  const setHealth = (p, m) => {
    console.log(p);
    
    const newHealth = addBleed(id, p.position, p.bulletDirection, p.damage);
    if(newHealth <= 0) setIsDead(true); else impactEvent.trigger(p.bulletDirection);
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
  // State for circular movement
  const walkRadius = 5; // radius of circle
  const walkSpeed = 0.5; // speed of rotation
  const angleRef = useRef(0);

  // Configure and play the "Walk" animation
  useEffect(() => {
    if (actions.Idle) {
      // Configure animation properties
      actions.Idle.loop = THREE.LoopRepeat;
      actions.Idle.timeScale = 1.75;

      // Play the animation
      actions.Idle.play();
    }
  }, [actions]);

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
    console.log("dying")
  }
  return (
    <>
     
      <RoachBleedEffect roachId={id} />{' '}
      <ChickenModel
        ref={modelRef}
        originalScene={scene}
        position={pos}
        triggerImpact={impactEvent}
        triggerJump={jumpEvent}
        isDead={isDead}
        onDeathComplete={handleDeath}
        rigidBodyRef={rigidBodyRef}
      />
      <RoachActions
        originalScene={scene}
        animations={animations}
        isAnimatingRef={isAnimatingRef}
        position={pos}
        camera={camera}
        attackCooldownRef={attackCooldownRef}
        isAttackingRef={isAttackingRef}
        deadRef={deadRef}
        rigidBodyRef={rigidBodyRef}
      />
    </>
  );
};

export default Chicken;
