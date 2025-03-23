import { useRef, useState, useMemo, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useShallow } from 'zustand/shallow';
import { SkeletonUtils } from 'three/examples/jsm/Addons.js';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import { modelCache } from '../../utils/Preloader';
import CollisionManager from '../../utils/CollisionManager';
import useRoachDeathEffect from '../../hooks/useRoachDeathEffect';

const ENTITY_CONFIG = {
    chicken: {
      mass: 1,
      collider: [0.2, 0.5],
      colliderPosition: [0, 0.75, 0],
      scale: 1
    },
    mootant: {
      mass: 3,
      collider: [0.8, 1.0],
      colliderPosition: [0, 1.5, 0],
      scale: 1.75
    },
    roach: {
      mass: 1,
      collider: [0.2, 0.5],
      colliderPosition: [0, 0.2, 0],
      scale: 1.25
    },
    warhog: {
        mass: 2,
        collider: [0.6, 0.8],
        colliderPosition: [0, 0.5, 0],
        scale: 1
    }
  };

// utils/entityUtils.js
export function getEntityRefs() {
    const modelRef = useRef();
    const rigidBodyRef = useRef();
    const isAnimatingRef = useRef(false);
    const attackCooldownRef = useRef(0);
    const isAttackingRef = useRef(false);
    const deadRef = useRef(false);
    
    return {
      modelRef,
      rigidBodyRef,
      isAnimatingRef,
      attackCooldownRef,
      isAttackingRef,
      deadRef
    };
  }
  
  // hooks/useEntityLogic.js
  export function useEntityLogic({ id, position, entityType, modelPath, refs }) {
    const [isDead, setIsDead] = useState(false);
    const { camera } = useThree();
    
    const { addBleed, removeEnemy } = useGameEffectsStore(
      useShallow(state => ({
        addBleed: state.addBleed,
        removeEnemy: state.removeEnemy
      }))
    );
    
    // Load and clone model
    const { scene, animations } = modelCache[modelPath];
    const originalScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    
    // Event handlers
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
    
    // Health management
    const handleHit = (p) => {
      const newHealth = addBleed(id, p.position, p.bulletDirection, p.damage);
      if (newHealth > 0) impactEvent.trigger(p.bulletDirection);
      if (newHealth <= 0) refs.deadRef.current = true;
      if (newHealth < 0) setIsDead(true);
      return newHealth;
    };
    
    // Register with collision system
    useEffect(() => {
      if (!refs.modelRef.current) return;
      
      const unregister = CollisionManager.registerEnemy({
        mesh: refs.modelRef.current,
        position: position,
        onHit: handleHit,
        type: entityType
      });
      
      return unregister;
    }, [position, entityType, id, refs.modelRef]);
    
    // Default death handler
    const handleDeath = () => {
      removeEnemy(id);
    };
    
    // Attack completion handler
    const handleAttackComplete = () => {
      refs.isAttackingRef.current = false;
    };
    
    return {
      isDead,
      camera,
      originalScene,
      animations,
      impactEvent,
      jumpEvent,
      handleHit,
      handleDeath,
      handleAttackComplete
    };
  }


  export function useEntityModel({
    entityType = 'roach',
    originalScene,
    position,
    triggerImpact,
    triggerJump,
    isDead,
    onDeathComplete,
    rigidBodyRef,
    ref
  }) {
    const materialsRef = useRef([]);
    const meshesRef = useRef([]);
    const config = ENTITY_CONFIG[entityType];
  
    // Store materials and meshes for death effect
    useEffect(() => {
      const materials = [];
      const meshes = [];
      originalScene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.metalness = 0.051;
          child.material.roughness = 0.7;
          child.material.transparent = true;
          child.material.needsUpdate = true;
          materials.push(child.material);
          meshes.push(child);
        }
      });
      materialsRef.current = materials;
      meshesRef.current = meshes;
    }, [originalScene]);
  
    // Use death effect
    const { deathProgress } = useRoachDeathEffect({
      isDead,
      onDeathComplete,
      rbRef: rigidBodyRef,
      modelRef: ref,
      materialsRef,
      meshesRef,
      originalScene,
    });
  
    // Set up event handlers
    useEffect(() => {
      const cleanupFunctions = [];
      
      if (triggerImpact) {
        const handleImpact = (bulletDirection) => {
          if (rigidBodyRef.current) {
            const impulse = {
              x: bulletDirection?.x * 2 || 0,
              y: 1.5,
              z: bulletDirection?.z * 2 || 0,
            };
            rigidBodyRef.current.applyImpulse(impulse, true);
          }
        };
        triggerImpact.subscribe(handleImpact);
        cleanupFunctions.push(() => triggerImpact.unsubscribe(handleImpact));
      }
  
      if (triggerJump) {
        const handleJump = () => {
          if (rigidBodyRef.current) {
            // Entity-specific jump height
            const jumpHeight = entityType === 'mootant' ? 2.25 : 6.25;
            const jump = { x: 0, y: jumpHeight, z: 0 };
            rigidBodyRef.current.applyImpulse(jump, true);
          }
        };
        triggerJump.subscribe(handleJump);
        cleanupFunctions.push(() => triggerJump.unsubscribe(handleJump));
      }
  
      return () => cleanupFunctions.forEach(cleanup => cleanup());
    }, [triggerImpact, triggerJump, entityType, rigidBodyRef]);
  
    // Dispose materials on unmount
    useEffect(() => {
      return () => {
        materialsRef.current.forEach(material => material.dispose());
      };
    }, []);
  
    // Update position
    useFrame(() => {
      if (rigidBodyRef.current && ref.current) {
        const translation = rigidBodyRef.current.translation();
        ref.current.position.set(translation.x, translation.y, translation.z);
      }
    });
  
    // Handle visibility based on death
    if (deathProgress.current > 0.99) {
      meshesRef.current.forEach(mesh => {
        mesh.visible = false;
      });
    }
  
    // Initial position adjustment
    useEffect(() => {
      position[1] += 0.1;
    }, [position]);
  
    return {
      config,
      materialsRef,
      meshesRef
    };
  }