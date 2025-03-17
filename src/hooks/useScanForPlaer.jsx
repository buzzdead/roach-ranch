// useScanForPlayer.js
import { useRef } from 'react';
import * as THREE from 'three';

export const useScanForPlayer = ({ 
  camera, 
  position, 
  attackDistance, 
  attackCooldownRef, 
  isAttackingRef, 
  isAnimatingRef, 
  isRotatingRef, 
  isMovingRef, 
  targetRotationRef, 
  targetPositionRef,
  waveLevel 
}) => {
  // Internal refs for scanning logic
  const scanTimerRef = useRef(0);
  const scanIntervalRef = useRef(waveLevel > 5 ? 1.5 : waveLevel > 3 ? 2.5 : 5); // Scan every 5 seconds
  
  // Scan for player function
  const scanForPlayer = (force = false) => {
    // Skip if we're busy attacking or dead
    if ((isAttackingRef.current || isAnimatingRef.current) && !force) {
      return;
    }
    
    const playerPosition = camera.userData.characterPos;
    if (!playerPosition) return;
    
    // Get current position and player position as vectors
    const currentPosition = new THREE.Vector3(position[0], position[1], position[2]);
    const playerPos = new THREE.Vector3(
      playerPosition.x + Math.random() * 5, 
      playerPosition.y, 
      playerPosition.z - Math.random() * 5
    );
    
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
  
  // Update scan timer function
  const updateScanTimer = (delta) => {
    scanTimerRef.current += delta;
    if (scanTimerRef.current >= scanIntervalRef.current) {
      scanForPlayer(false);
      scanTimerRef.current = 0;
    }
  };
  
  return {
    scanForPlayer,
    updateScanTimer
  };
};