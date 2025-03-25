// useEnemyAnimations.js
import { useEffect } from 'react';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export const useEnemyAnimations = (originalScene, animations, isAnimatingRef, isAttackingRef, entityType = 'roach') => {
  const { actions, mixer } = useAnimations(animations, originalScene);

  // Configure animations based on entity type
  useEffect(() => {
    if (entityType === 'roach') {
      configureRoachAnimations(actions, mixer, isAnimatingRef);
    } else if (entityType === 'chicken') {
      configureChickenAnimations(actions, mixer, isAnimatingRef, isAttackingRef);
    } else if (entityType === 'mootant' || entityType === 'warhog') {
      configureMootantAnimations(actions, mixer, isAnimatingRef, isAttackingRef);
    }
  }, [actions, mixer, isAnimatingRef, isAttackingRef, entityType]);

  return { actions, mixer };
};

// Configure roach-specific animations
function configureRoachAnimations(actions, mixer, isAnimatingRef) {
  // Configure IdleMotion animation
  if (actions.IdleMotion) {
    actions.IdleMotion.loop = THREE.LoopOnce;
    actions.IdleMotion.clampWhenFinished = true;
    actions.IdleMotion.timeScale = 1.5;

    mixer.addEventListener('finished', (e) => {
      if (e.action === actions.IdleMotion) {
        isAnimatingRef.current = false;
      }
    });
  }

  // Configure WingsFlap animation
  if (actions.WingsFlap) {
    actions.WingsFlap.timeScale = 15;
    actions.WingsFlap.clampWhenFinished = true;
    actions.WingsFlap.loop = THREE.LoopRepeat;
  }

  // Configure Fold animation
  if (actions.Fold) {
    actions.Fold.loop = THREE.LoopOnce;
    actions.Fold.clampWhenFinished = true;
    actions.Fold.timeScale = 5;
  }

  // Configure Move animation
  if (actions.Move) {
    actions.Move.loop = THREE.LoopRepeat;
    actions.Move.timeScale = 4.5;
  }
}

// Configure chicken-specific animations
function configureChickenAnimations(actions, mixer, isAnimatingRef, isAttackingRef) {
  // Configure Idle animation
  if (actions.Idle) {
    actions.Idle.loop = THREE.LoopRepeat;
    actions.Idle.timeScale = 1.0;
  }
  
  // Configure Walk animation
  if (actions.Walk) {
    actions.Walk.loop = THREE.LoopRepeat;
    actions.Walk.timeScale = 1.5;
  }
  
  // Configure Attack animation
  if (actions.Attack) {
    actions.Attack.loop = THREE.LoopOnce;
    actions.Attack.clampWhenFinished = true;
    actions.Attack.timeScale = 1.2;
    
    mixer.addEventListener('finished', (e) => {
      if (e.action === actions.Attack) {
        isAnimatingRef.current = false;
        isAttackingRef.current = false; // Reset attack state when animation completes
      }
    });
  }
  
  // If there's a Death animation
  if (actions.Dying) {
    actions.Dying.loop = THREE.LoopOnce;
    actions.Dying.clampWhenFinished = true;
    actions.Dying.timeScale = 2.0;
  }
}

function configureMootantAnimations(actions, mixer, isAnimatingRef, isAttackingRef) {
  // Configure Idle animation
  if (actions.Idle) {
    actions.Idle.loop = THREE.LoopRepeat;
    actions.Idle.timeScale = 0.9; // Slightly slower for a larger creature
    actions.Idle.play();
  }
  
  // Configure Walk animation
  if (actions.Walk) {
    actions.Walk.loop = THREE.LoopRepeat;
    actions.Walk.timeScale = 1.0; // Normal speed movement
  }
  if (actions.Move) {
    actions.Move.loop = THREE.LoopRepeat;
    actions.Move.timeScale = 1.0; // Normal speed movement
  }
  
  // Configure Attack animation
  if (actions.Attack) {
    actions.Attack.loop = THREE.LoopOnce;
    actions.Attack.clampWhenFinished = true;
    actions.Attack.timeScale = 1.1; // Slightly faster attack
    
    mixer.addEventListener('finished', (e) => {
      if (e.action === actions.Attack) {
        isAnimatingRef.current = false;
        isAttackingRef.current = false; // Reset attack state when animation completes
      }
    });
  }
}