// useRoachAnimations.js
import { useEffect } from 'react';
import { useAnimations } from '@react-three/drei';
import * as THREE from 'three';

export const useRoachAnimations = (originalScene, animations, isAnimatingRef) => {
  const { actions, mixer } = useAnimations(animations, originalScene);

  // Configure all animations
  useEffect(() => {
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
  }, [actions, mixer, isAnimatingRef]);

  return { actions, mixer };
};