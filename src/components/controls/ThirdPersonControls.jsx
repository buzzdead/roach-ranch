import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';

const ThirdPersonControls = () => {
  const { camera } = useThree();
  const moveRef = useRef({ forward: 0, backward: 0, left: 0, right: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const playerRef = useRef();
  const characterPos = useRef(new THREE.Vector3(0, 3, 5));
  
  const cameraOffset = useRef({
    distance: 3,
    height: 1,
    angle: -Math.PI,
  });

  useEffect(() => {
    const handleClick = () => document.body.requestPointerLock();
    
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === document.body) {
        rotationRef.current.x -= e.movementX * 0.002;
        rotationRef.current.y = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, rotationRef.current.y - e.movementY * 0.002)
        );
      }
    };

    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': moveRef.current.forward = 1; break;
        case 'KeyS': moveRef.current.backward = 1; break;
        case 'KeyA': moveRef.current.right = 1; break;
        case 'KeyD': moveRef.current.left = 1; break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': moveRef.current.forward = 0; break;
        case 'KeyS': moveRef.current.backward = 0; break;
        case 'KeyA': moveRef.current.right = 0; break;
        case 'KeyD': moveRef.current.left = 0; break;
        default: break;
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // Initial setup
    camera.position.copy(characterPos.current).add(new THREE.Vector3(
      -Math.sin(cameraOffset.current.angle) * cameraOffset.current.distance,
      cameraOffset.current.height,
      -Math.cos(cameraOffset.current.angle) * cameraOffset.current.distance
    ));
    camera.lookAt(characterPos.current);
    camera.userData.characterPos = characterPos.current.clone();
  }, [camera]);

  useFrame((_, delta) => {
    if (!playerRef.current) return;
    
    // Update camera angle from mouse movement
    cameraOffset.current.angle = rotationRef.current.x;

    // Get current rigid body position
    const physicsPosition = playerRef.current.translation();
  
    // Emergency fallback - if player gets too low, reset position
    if (physicsPosition.y < -1) {
      console.log("EMERGENCY RESET - player fell through ground");
      playerRef.current.setTranslation({ x: physicsPosition.x, y: 2, z: physicsPosition.z });
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 }); // Stop velocity
    }
    
    characterPos.current.set(physicsPosition.x, physicsPosition.y, physicsPosition.z);
    // Calculate move direction based on camera angle
    const moveSpeed = 5 * delta; // Adjust for delta time
    const direction = new THREE.Vector3();

    const horizontalQuat = new THREE.Quaternion();
    horizontalQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraOffset.current.angle);

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(horizontalQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(horizontalQuat);

    direction.x = moveRef.current.right - moveRef.current.left;
    direction.z = moveRef.current.forward - moveRef.current.backward;
    
    // Normalize if moving diagonally
    if (direction.length() > 1) direction.normalize();
    
    // Create movement vector
    const moveVec = new THREE.Vector3();
    if (direction.x !== 0) moveVec.add(right.clone().multiplyScalar(direction.x));
    if (direction.z !== 0) moveVec.add(forward.clone().multiplyScalar(direction.z));
    
    // Apply movement to physics body
    if (moveVec.length() > 0) {
      moveVec.normalize().multiplyScalar(moveSpeed * 50); // Scale up for physics impulse
      
      playerRef.current.applyImpulse({ 
        x: moveVec.x, 
        y: 0, 
        z: moveVec.z 
      });
      
      // Update character rotation to match movement direction (if moving)
      playerRef.current.setRotation({ 
        x: 0, 
        y: Math.sin(cameraOffset.current.angle / 2), 
        z: 0, 
        w: Math.cos(cameraOffset.current.angle / 2) 
      });
    }
    
    // Apply damping to slow down when not actively moving
    const linearVel = playerRef.current.linvel();
    playerRef.current.setLinvel({ 
      x: linearVel.x * 0.9, 
      y: linearVel.y, 
      z: linearVel.z * 0.9 
    });
    
    // Store for other components
    camera.userData.characterPos = characterPos.current.clone();
    camera.userData.lastAngle = cameraOffset.current.angle;

    // Update camera position to follow player
    const offset = new THREE.Vector3(
      -Math.sin(cameraOffset.current.angle) * cameraOffset.current.distance,
      cameraOffset.current.height,
      -Math.cos(cameraOffset.current.angle) * cameraOffset.current.distance
    );

    camera.position.copy(characterPos.current).add(offset);
    camera.lookAt(
      characterPos.current.x,
      characterPos.current.y + 1.6 + rotationRef.current.y * 3,
      characterPos.current.z
    );
  });

  return (
<RigidBody 
  ref={playerRef}
  position={[0, 2, 5]} // Start above the ground (y=2)
  enabledRotations={[false, true, false]}
  type="dynamic"
  mass={1}  // Not too heavy, not too light
  colliders={false}
  friction={0.7}
>
  <CapsuleCollider args={[1, 0.5]} position={[0, -1, 0]} />
</RigidBody>
  );
};

export default ThirdPersonControls;