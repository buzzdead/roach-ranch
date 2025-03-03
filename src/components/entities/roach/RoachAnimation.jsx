// RoachAnimation.jsx (modified)
import React, { useEffect } from 'react';
import { useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RoachAnimation = ({ 
  originalScene, 
  animations, 
  isAnimatingRef, 
  position, 
  camera, 
  attackDistance, 
  attackCooldownRef, 
  isAttackingRef
}) => {
  const { actions, mixer } = useAnimations(animations, originalScene);

  // Configure animations
  useEffect(() => {
    if (actions && actions.IdleMotion) {
      actions.IdleMotion.loop = THREE.LoopOnce;
      actions.IdleMotion.clampWhenFinished = true;
      actions.IdleMotion.timeScale = 1.5;
      
      mixer.addEventListener('finished', (e) => {
        if (e.action === actions.IdleMotion) {
          isAnimatingRef.current = false;
        }
      });
    }
    if(actions && actions.WingsFlap) {
      actions.WingsFlap.timeScale = 15;
      actions.WingsFlap.clampWhenFinished = true;
      actions.WingsFlap.loop = THREE.LoopRepeat;
    }
  }, [actions, mixer, isAnimatingRef]);

  // Animation update based on attack state
  useFrame(() => {
    if (actions.WingsFlap) {
      if (isAttackingRef.current) {
        if (!actions.WingsFlap.isRunning()) {
          actions.WingsFlap.reset();
          actions.WingsFlap.play();
        }
      } else if (actions.WingsFlap.isRunning()) {
        actions.WingsFlap.reset();
        actions.WingsFlap.stop();
      }
    }
  });
  
  // Animation and attack logic
  useFrame((state, delta) => {
    // Update attack cooldown
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current -= delta;
    }
    
    const playerPosition = camera.userData.characterPos;
    if (!playerPosition) return;
    
    // Calculate distance to player
    const dx = playerPosition.x - position[0];
    const dy = playerPosition.y - position[1];
    const dz = playerPosition.z - position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // Check if player is in range and cooldown is finished
    if (distance < attackDistance && 
        attackCooldownRef.current <= 0 && 
        !isAttackingRef.current && 
        !isAnimatingRef.current) {
      
      isAttackingRef.current = true;
      // Trigger attack animation
      if (actions.IdleMotion) {
        isAnimatingRef.current = true;
        actions.IdleMotion.reset();
        actions.IdleMotion.play();
      }
      
      attackCooldownRef.current = 3; // 3 seconds cooldown
    }
    
    // Update the animation mixer
    if (mixer) {
      mixer.update(delta);
    }
  });
  
  return null;
};

export default RoachAnimation;