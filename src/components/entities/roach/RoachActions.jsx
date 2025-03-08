// RoachActions.jsx (corrected version)
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoachAnimations } from '../../../hooks/useRoachAnimations';


const RoachActions = ({
  originalScene,
  animations,
  isAnimatingRef,
  position,
  camera,
  attackDistance,
  attackCooldownRef,
  isAttackingRef,
  deadRef,
  rigidBodyRef
}) => {
  const { actions, mixer } = useRoachAnimations(originalScene, animations, isAnimatingRef);
  const finished = useRef(false);
  const isRotatingRef = useRef(false);
  const isMovingRef = useRef(false);
  const targetRotationRef = useRef(0);
  const targetPositionRef = useRef(null);
  const scanTimerRef = useRef(0);
  const scanIntervalRef = useRef(5); // Scan every 5 seconds
  const moveSpeedRef = useRef(1.5); // Units per second
  
  // Handle animation states
  useFrame(() => {
    if (deadRef.current) return;
    
    // Handle Move animation during rotation or movement
    handleMoveAnimation();
    
    // Handle WingsFlap animation during attack
    handleWingsFlapAnimation();
  });

  // Main update loop for roach behavior
  useFrame((state, delta) => {
    if (deadRef.current) return;
    
    updateAttackCooldown(delta);
    updateScanTimer(delta);
    
    const playerPosition = camera.userData.characterPos;
    if (!playerPosition) return;

    const currentPosition = new THREE.Vector3(position[0], position[1], position[2]);
    const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    const distance = currentPosition.distanceTo(playerPos);
    
    // Calculate angle to player
    const dx = playerPosition.x - position[0];
    const dz = playerPosition.z - position[2];
    const angleToPlayer = Math.atan2(dx, dz);
    
    // Check if we should start attacking
    if (
      distance < attackDistance &&
      attackCooldownRef.current <= 0 &&
      !isAttackingRef.current &&
      !isAnimatingRef.current
    ) {
      // Stop all movement
      isMovingRef.current = false;
      
      // Face the player before attacking
      targetRotationRef.current = angleToPlayer;
      isRotatingRef.current = true;
      
      // Set attack cooldown
      attackCooldownRef.current = 3;
      
      console.log("Roach preparing to attack - in range", distance, attackDistance);
    }
    // Handle rotation (either for attack or movement)
    else if (isRotatingRef.current) {
      handleRotation(delta, distance < attackDistance);
    }
    // Move towards target if not attacking or rotating
    else if (isMovingRef.current && targetPositionRef.current && 
             !isAttackingRef.current && !isAnimatingRef.current) {
      moveTowardsTarget(delta);
    }
    // If we're not doing anything, scan for player
    else if (!isAttackingRef.current && !isAnimatingRef.current && !isRotatingRef.current && !isMovingRef.current) {
      scanForPlayer(true); // Force a scan
    }

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
    
    if (isRotatingRef.current || isMovingRef.current) {
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
  
  const updateScanTimer = (delta) => {
    scanTimerRef.current += delta;
    
    // Time to scan for player position
    if (scanTimerRef.current >= scanIntervalRef.current) {
      scanForPlayer(false);
      scanTimerRef.current = 0;
    }
  };
  
  const scanForPlayer = (force = false) => {
    // Skip if we're busy attacking or dead
    if ((isAttackingRef.current || isAnimatingRef.current) && !force) {
      return;
    }
    
    const playerPosition = camera.userData.characterPos;
    if (!playerPosition) return;
    
    // Get current position and player position as vectors
    const currentPosition = new THREE.Vector3(position[0], position[1], position[2]);
    const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    
    // Calculate distance to player
    const distance = currentPosition.distanceTo(playerPos);
    
    // If player is within attack range and cooldown is ready, prepare to attack
    if (distance < attackDistance && attackCooldownRef.current <= 0) {
      // Calculate angle to player
      const dx = playerPosition.x - position[0];
      const dz = playerPosition.z - position[2];
      targetRotationRef.current = Math.atan2(dx, dz);
      
      // Start rotating for attack
      isRotatingRef.current = true;
      isMovingRef.current = false;
      attackCooldownRef.current = 3;
      
      console.log("Roach preparing to attack from scan", distance, attackDistance);
      return;
    }
    
    // Otherwise, set target position to player's current position
    targetPositionRef.current = new THREE.Vector3(
      playerPosition.x,
      position[1], // Keep same y level
      playerPosition.z
    );
    
    // Calculate angle to face target
    const dx = targetPositionRef.current.x - position[0];
    const dz = targetPositionRef.current.z - position[2];
    targetRotationRef.current = Math.atan2(dx, dz);
    
    // Start rotation towards target
    isRotatingRef.current = true;
    isMovingRef.current = false;
  };
  
  const handleRotation = (delta, isForAttack) => {
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
      // We've reached the target rotation
      isRotatingRef.current = false;
      
      // If this rotation was for attack, start attacking
      if (isForAttack) {
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
        
        console.log("Roach starting attack");
      }
      // Otherwise, start moving toward target
      else if (targetPositionRef.current) {
        isMovingRef.current = true;
      }
    }
  };
  
  const moveTowardsTarget = (delta) => {
    if (!targetPositionRef.current ) return;
    
    // Check if player is now in attack range (they might have moved closer)
    const playerPosition = camera.userData.characterPos;
    if (playerPosition) {
      const currentPosition = new THREE.Vector3(position[0], position[1], position[2]);
      const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
      const distance = currentPosition.distanceTo(playerPos);
      
      if (distance < attackDistance && attackCooldownRef.current <= 0) {
        isMovingRef.current = false;
        
        // Calculate angle to player for attack
        const dx = playerPosition.x - position[0];
        const dz = playerPosition.z - position[2];
        targetRotationRef.current = Math.atan2(dx, dz);
        
        // Start rotating to face player before attacking
        isRotatingRef.current = true;
        attackCooldownRef.current = 3;
        
        console.log("Roach interrupting movement to attack", distance, attackDistance);
        return;
      }
    }
    
    // Calculate direction vector
    const direction = new THREE.Vector3(
      targetPositionRef.current.x - position[0],
      0,
      targetPositionRef.current.z - position[2]
    );
    
    // Calculate distance to target
    const distanceToTarget = direction.length();
    
    // If we're close enough to the target, stop moving
    if (distanceToTarget < 0.5) {
      isMovingRef.current = false;
      if (actions.Move && actions.Move.isRunning()) {
        actions.Move.stop();
      }
      return;
    }
    
    // Normalize direction and apply speed
    direction.normalize();
    direction.multiplyScalar(moveSpeedRef.current * delta);
    
    // Update position
    position[0] += direction.x;
    position[2] += direction.z;
    
    // Update originalScene position
    originalScene.position.set(position[0], position[1], position[2]);
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

export default RoachActions;