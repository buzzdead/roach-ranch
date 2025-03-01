// PlayerAnimation.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePlayerContext } from '../../../context/PlayerContext';

export const PlayerAnimation = ({ actions, mixer, modelRef, camera, isInitializedRef }) => {
  const prevPositionRef = useRef(new THREE.Vector3());
  const isMovingRef = useRef(false);
  const movementBufferRef = useRef([false, false, false]); // Buffer to track recent movement states
  const frameCountRef = useRef(0);
  const prevAimingRef = useRef(false);
  const { animationState, setAnimationState } = usePlayerContext();

  // Initialize animations
  useEffect(() => {
    if (actions) {
      console.log(actions)
      if (actions.Idle) {
        actions.Idle.setEffectiveWeight(1)
        actions.Idle.play();
        actions.Idle.setEffectiveTimeScale(1);
      }
      
      if (actions.Walking) {
        actions.Walking.setEffectiveWeight(1)
        actions.Walking.stop();
        actions.Walking.loop = THREE.LoopRepeat;
        actions.Walking.repetitions = Infinity;
        actions.Walking.clampWhenFinished = false;
        actions.Walking.timeScale = 0.5;
      }
      if(actions.Jump) {
        actions.Jump.setEffectiveWeight(0.75);
      }
      if(actions.Aim) {
        actions.Aim.setEffectiveWeight(5.5);
    }
    if(actions["Mesh1_Mesh1.025Action"]) {
      actions["Mesh1_Mesh1.025Action"].setEffectiveWeight(0);
    }
  }
  }, [actions]);

  useEffect(() => {
    if (animationState.jumping && actions.Jump) {
      actions.Jump.timeScale = 0.75;
      actions.Jump.reset().play();
      actions.Jump.clampWhenFinished = true;
      actions.Jump.loop = THREE.LoopOnce;
    }
    
    // For the aim animation, we need different behavior
    if (actions.Aim) {
      if (animationState.aiming) {
        // If we weren't previously aiming, start the animation
        if (!prevAimingRef.current) {

          actions.Aim.reset(); // Reset to start
          actions.Aim.clampWhenFinished = true; // Ensure it stays at the final frame
          actions.Aim.loop = THREE.LoopOnce; // Play once and stop
          actions.Aim.play();
        }
      } else {
        // If we're no longer aiming, transition back to idle/walk
        if (prevAimingRef.current) {
          actions.Aim.fadeOut(0.3);
          
          // Return to the appropriate animation based on movement state
          if (isMovingRef.current && actions.Walking) {
            actions.Walking.reset().fadeIn(0.3).play();
          } else if (actions.Idle) {
            actions.Idle.reset().fadeIn(0.3).play();
          }
        }
      }
      
      // Track previous aiming state
      prevAimingRef.current = animationState.aiming;
    }
  }, [animationState, actions]);
  
  useFrame((state, delta) => {
    if (!modelRef.current || !camera.userData.characterPos || !mixer) return;
    
    // Initialize on first frame if not already done
    if (!isInitializedRef.current && mixer) {
      mixer.update(1/60); // Force an update
      isInitializedRef.current = true;
      
      // Initialize prevPosition with current position to avoid initial jump
      prevPositionRef.current.set(
        camera.userData.characterPos.x,
        camera.userData.characterPos.y - 1.5,
        camera.userData.characterPos.z
      );
    }
    
    // Only check movement every 2 frames to reduce sensitivity
    frameCountRef.current = (frameCountRef.current + 1) % 2;
    if (frameCountRef.current === 0) {
      const currentPosition = new THREE.Vector3(
        camera.userData.characterPos.x,
        camera.userData.characterPos.y - 1.5,
        camera.userData.characterPos.z 
      );
      
      // Calculate movement distance since last frame
      const movementDistance = currentPosition.distanceTo(prevPositionRef.current);
      
      // Use a slightly higher threshold to detect movement
      const isMovingNow = movementDistance > 0.015; // Increased threshold
      
      // Add current movement state to buffer
      movementBufferRef.current.shift(); // Remove oldest entry
      movementBufferRef.current.push(isMovingNow); // Add newest entry
      
      // Only consider a state change if all buffer entries match
      const isConsistentlyMoving = movementBufferRef.current.every(state => state === true);
      const isConsistentlyStopped = movementBufferRef.current.every(state => state === false);
      
      // Determine if we need to change animation state
      let shouldStartWalking = isConsistentlyMoving && !isMovingRef.current;
      let shouldStopWalking = isConsistentlyStopped && isMovingRef.current;
      
      // Apply animation changes if needed
      if (shouldStartWalking) {
        console.log("Starting to walk");
        isMovingRef.current = true;
        
        // Switch to walking animation
        if (actions.Idle) actions.Idle.stop();
        if (actions.Walking) actions.Walking.reset().play();
      } 
      else if (shouldStopWalking) {
        console.log("Stopping walk");
        isMovingRef.current = false;
        
        // Switch to idle animation
        if (actions.Walking) actions.Walking.fadeOut(0.3);
        if (actions.Idle) actions.Idle.reset().fadeIn(0.3).play();
      }
      
      // Store current position for next comparison
      prevPositionRef.current.copy(currentPosition);
    }
    
    // CRITICAL: Update mixer BEFORE updating bone attachments
    mixer.update(delta);
  });
  
  return null;
};
