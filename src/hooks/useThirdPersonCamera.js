// useThirdPersonCamera.js
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useInputManager } from './useInputManager';

export const useThirdPersonCamera = (playerRef) => {
  const { camera } = useThree();
  const inputState = useInputManager();
  
  const cameraOffset = useRef({
    distance: 3,
    height: 1,
    angle: -Math.PI,
  });

  // Initial camera setup
  useEffect(() => {
    document.body.requestPointerLock();
  }, []);

  // Update camera on each frame
  useFrame(() => {
    if (!playerRef.current) return;
    
    // Update camera angle from mouse movement
    cameraOffset.current.angle = inputState.current.rotation.x;
    
    // Get current character position from physics body
    const physicsPosition = playerRef.current.translation();
    const characterPos = new THREE.Vector3(
      physicsPosition.x,
      physicsPosition.y,
      physicsPosition.z
    );
    
    // Store for other components
    camera.userData.characterPos = characterPos.clone();
    camera.userData.lastAngle = cameraOffset.current.angle;
    camera.userData.isJumping = physicsPosition.y > -1; // Using the same ground check as original
    
    // Update camera position to follow player
    const offset = new THREE.Vector3(
      -Math.sin(cameraOffset.current.angle) * cameraOffset.current.distance,
      cameraOffset.current.height,
      -Math.cos(cameraOffset.current.angle) * cameraOffset.current.distance
    );

    camera.position.copy(characterPos).add(offset);
    camera.lookAt(
      characterPos.x,
      characterPos.y + 1.6 + inputState.current.rotation.y * 3,
      characterPos.z
    );
  });

  return cameraOffset.current.angle;
};