// RoachAnimation.jsx (refactored)
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRoachAnimations } from '../../../hooks/useRoachAnimations';

const RoachAnimation = ({
  originalScene,
  animations,
  isAnimatingRef,
  position,
  camera,
  attackDistance,
  attackCooldownRef,
  isAttackingRef,
  deadRef,
}) => {
  const { actions, mixer } = useRoachAnimations(originalScene, animations, isAnimatingRef);
  const finished = useRef(false);
  const isRotatingRef = useRef(false);
  const targetRotationRef = useRef(0);
  
  // Handle animation states
  useFrame(() => {
    if (deadRef.current) return;
    
    // Handle Move animation during rotation
    handleMoveAnimation();
    
    // Handle WingsFlap animation during attack
    handleWingsFlapAnimation();
  });

  // Main update loop for attack logic and rotation
  useFrame((state, delta) => {
    if (deadRef.current) return;
    
    updateAttackCooldown(delta);
    
    const playerPosition = camera.userData.characterPos;
    if (!playerPosition) return;

    const { distance, angleToPlayer } = calculateDistanceAndAngle(playerPosition, position);
    
    // Handle rotation towards player
    if (isRotatingRef.current) {
      handleRotation(angleToPlayer, delta);
    }

    // Check if should start targeting player
    checkForTargetingPlayer(distance, angleToPlayer);

    // Update the animation mixer
    if (mixer) mixer.update(delta);
  });

  // Handle death animation
  useFrame(() => {
    handleDeathAnimation();
  });
  
  // Helper functions
  const handleMoveAnimation = () => {
    if (!actions.Move) return;
    
    if (isRotatingRef.current) {
      if (!actions.Move.isRunning()) {
        actions.Move.reset();
        actions.Move.play();
      }
    } else if (actions.Move.isRunning()) {
      actions.Move.reset();
      actions.Move.stop();
    }
  };
  
  const handleWingsFlapAnimation = () => {
    if (!actions.WingsFlap) return;
    
    if (isAttackingRef.current) {
      if (!actions.WingsFlap.isRunning()) {
        actions.WingsFlap.reset();
        actions.WingsFlap.play();
      }
    } else if (actions.WingsFlap.isRunning()) {
      actions.WingsFlap.reset();
      actions.WingsFlap.stop();
    }
  };
  
  const updateAttackCooldown = (delta) => {
    if (attackCooldownRef.current > 0) {
      attackCooldownRef.current -= delta;
    }
  };
  
  const calculateDistanceAndAngle = (playerPosition, position) => {
    const dx = playerPosition.x - position[0];
    const dy = playerPosition.y - position[1];
    const dz = playerPosition.z - position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const angleToPlayer = Math.atan2(dx, dz);
    
    return { distance, angleToPlayer };
  };
  
  const handleRotation = (angleToPlayer, delta) => {
    // Get current rotation
    const currentRotation = originalScene.rotation.y;
    
    // Calculate the shortest path to the target rotation
    let rotationDiff = targetRotationRef.current - currentRotation;
    
    // Normalize angle difference to [-PI, PI]
    while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;
    
    // Rotate with smooth interpolation
    const rotationSpeed = 3.0;
    if (Math.abs(rotationDiff) > 0.05) {
      originalScene.rotation.y += rotationDiff * Math.min(rotationSpeed * delta, 1);
    } else {
      // We've reached the target rotation, now attack
      isRotatingRef.current = false;
      
      // Stop the Move animation
      if (actions.Move && actions.Move.isRunning()) {
        actions.Move.stop();
      }
      
      isAttackingRef.current = true;
      
      // Trigger attack animation
      if (actions.IdleMotion) {
        isAnimatingRef.current = true;
        actions.IdleMotion.reset();
        actions.IdleMotion.play();
      }
    }
  };
  
  const checkForTargetingPlayer = (distance, angleToPlayer) => {
    if (
      distance < attackDistance &&
      attackCooldownRef.current <= 0 &&
      !isAttackingRef.current &&
      !isAnimatingRef.current &&
      !isRotatingRef.current
    ) {
      // Start rotation toward player before attacking
      targetRotationRef.current = angleToPlayer;
      isRotatingRef.current = true;
      
      // Reset attack cooldown
      attackCooldownRef.current = 3;
    }
  };
  
  const handleDeathAnimation = () => {
    if (deadRef.current && actions.Fold && !finished.current) {
      // Stop all other animations
      Object.values(actions).forEach((action) => {
        if (action && action.isRunning() && action !== actions.Fold) {
          action.stop();
        }
      });

      // Play Fold animation if not already running
      if (!actions.Fold.isRunning()) {
        actions.Fold.reset();
        actions.Fold.play();
      }
      finished.current = true;
    }
  };

  return null;
};

export default RoachAnimation;