// PlayerPhysics.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useInputManager } from '../../../hooks/useInputManager';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';

const PlayerPhysics = ({ playerRef }) => {
  const inputState = useInputManager();
  const jumpCooldownRef = useRef(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);
  
  const setRigidBody = useGameEffectsStore(
    useShallow((state) => state.setRigidBody)
  );

  useEffect(() => {
    setRigidBody(playerRef);
  }, [playerRef, setRigidBody]);

  useFrame((_, delta) => {
    if(loading || !playerRef.current) return;
    
    // Get current rigid body position
    const physicsPosition = playerRef.current.translation();
    
    // Check if player is on or near the ground
    const isGrounded = physicsPosition.y <= -1;

    // Handle jump
    if (jumpCooldownRef.current > 0) {
      jumpCooldownRef.current -= delta;
    }

    if (inputState.current.actions.jump && jumpCooldownRef.current <= 0) {
      playerRef.current.applyImpulse({ x: 0, y: 7.5, z: 0 });
      jumpCooldownRef.current = 1;
    }

    // Emergency fallback
    if (physicsPosition.y < -1) {
      playerRef.current.setTranslation({
        x: physicsPosition.x,
        y: 2,
        z: physicsPosition.z,
      });
      playerRef.current.setLinvel({ x: 0, y: 0, z: 0 });
    }

    // Calculate move direction based on camera angle
    const moveSpeed = 2 * delta;
    const direction = new THREE.Vector3();
    const cameraAngle = inputState.current.rotation.x;

    const horizontalQuat = new THREE.Quaternion();
    horizontalQuat.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      cameraAngle
    );

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(horizontalQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(horizontalQuat);

    direction.x =
      inputState.current.movement.right - inputState.current.movement.left;
    direction.z =
      inputState.current.movement.forward -
      inputState.current.movement.backward;

    // Normalize if moving diagonally
    if (direction.length() > 1) direction.normalize();

    // Create movement vector
    const moveVec = new THREE.Vector3();
    if (direction.x !== 0)
      moveVec.add(right.clone().multiplyScalar(direction.x));
    if (direction.z !== 0)
      moveVec.add(forward.clone().multiplyScalar(direction.z));

    // Apply movement to physics body
    if (moveVec.length() > 0) {
      moveVec.normalize().multiplyScalar(moveSpeed * 50); // Scale up for physics impulse

      playerRef.current.applyImpulse({
        x: moveVec.x,
        y: 0,
        z: moveVec.z,
      });

      // Update character rotation to match movement direction (if moving)
      playerRef.current.setRotation({
        x: 0,
        y: Math.sin(cameraAngle / 2),
        z: 0,
        w: Math.cos(cameraAngle / 2),
      });
    }

    // Apply damping to slow down when not actively moving
    const linearVel = playerRef.current.linvel();
    playerRef.current.setLinvel({
      x: linearVel.x * 0.9,
      y: linearVel.y,
      z: linearVel.z * 0.9,
    });
  });

  return loading ? null : (
    <RigidBody
      ref={playerRef}
      position={[0, 2, 5]}
      enabledRotations={[false, true, false]}
      type="dynamic"
      mass={1}
      colliders={false}
      friction={0.7}
    >
      <CapsuleCollider args={[1, 0.5]} position={[0, 0, 0]} />
    </RigidBody>
  );
};

export default PlayerPhysics;