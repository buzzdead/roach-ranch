// MootantAttack.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import CollisionManager from '../../../utils/CollisionManager';

const MootantAttack = ({
  position,
  camera,
  isAttackingRef,
  onAttackComplete,
  handleJump,
  modelRef,
}) => {
  const [attackActive, setAttackActive] = useState(false);
  const jumpTriggeredRef = useRef(false);
  const attackTimeoutRef = useRef(null);
  const attackProgress = useRef(0);
  const damageDealt = useRef(false);
  
  // For charge attack
  const startPosition = useRef(new THREE.Vector3());
  const targetPosition = useRef(new THREE.Vector3());
  const attackDirection = useRef(new THREE.Vector3());
  
  const rigidBody = useGameEffectsStore(useShallow((state) => state.rigidBody));

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
      }
    };
  }, []);

  useFrame((_, delta) => {
    // Starting attack
    if (isAttackingRef.current && !attackActive && !jumpTriggeredRef.current) {
      // Mark attack as triggered
      jumpTriggeredRef.current = true;
      
      // Store current position for charge calculation
      if (modelRef.current) {
        startPosition.current.copy(modelRef.current.position);
      }
      
      // Calculate target position (player position)
      if (camera.userData.characterPos) {
        targetPosition.current.set(
          camera.userData.characterPos.x, 
          camera.userData.characterPos.y, 
          camera.userData.characterPos.z
        );
        
        // Calculate direction
        attackDirection.current.subVectors(targetPosition.current, startPosition.current).normalize();
      }
      
      // Trigger the mootant attack animation
      setAttackActive(true);
      attackProgress.current = 0;
      damageDealt.current = false;
      
      // Trigger a jump/charge forward
      handleJump.trigger();
    }
    
    // Handle active attack
    if (attackActive) {
      attackProgress.current += delta * 0.65; // Controls attack speed
      
      // Handle the charge attack logic
      if (attackProgress.current > 0.3 && attackProgress.current < 0.8) {
        // During the main part of the charge
        if (modelRef.current && modelRef.current.position) {
          // Apply forward momentum in the direction of the player
          const chargeSpeed = 5.0 * delta; // Adjust for desired charge speed
          const movement = attackDirection.current.clone().multiplyScalar(chargeSpeed);
          
          // Apply manually to the model and physics
          if (modelRef.current.position) {
            modelRef.current.position.add(movement);
          }
        }
        
        // Check for player collision during charge
        if (!damageDealt.current && camera.userData.characterPos && modelRef.current) {
          const playerPos = new THREE.Vector3(
            camera.userData.characterPos.x,
            camera.userData.characterPos.y,
            camera.userData.characterPos.z
          );
          
          const mootantPos = new THREE.Vector3(
            modelRef.current.position.x,
            modelRef.current.position.y,
            modelRef.current.position.z
          );
          
          // Calculate distance to player
          const distanceToPlayer = mootantPos.distanceTo(playerPos);
          
          // If close enough, deal damage
          if (distanceToPlayer < 3.0) {
            if(!damageDealt.current) CollisionManager.justDealDamageToPlayer()
            damageDealt.current = true;
            
            // Deal damage to player (if you have a damage system)
            if (rigidBody && rigidBody.current) {
              // Apply a knockback impulse to the player
              const knockbackDir = attackDirection.current.clone();
              rigidBody.current.applyImpulse({
                x: knockbackDir.x * 25,
                y: 10,
                z: knockbackDir.z * 25
              }, true);
              
              // Deal damage (adjust your damage system accordingly)
              // Implement your damage code here
            }
          }
        }
      }
      
      // End attack after animation completes
      if (attackProgress.current >= 1.2) {
        setAttackActive(false);
        isAttackingRef.current = false;
        jumpTriggeredRef.current = false;
        onAttackComplete();
      }
    }
  });

  // No visual component needed - just logic
  return null;
};

export default MootantAttack;