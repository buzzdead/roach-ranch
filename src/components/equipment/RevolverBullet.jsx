// RevolverBullet.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import CollisionManager from '../../utils/CollisionManager';

const BULLET_CONFIG = {
  modelPath: '/bullet.glb',
  scale: [0.1, 0.1, 0.1],
  speed: 25,  // Units per second
  maxDistance: 100,  // Maximum travel distance before removal
};

const RevolverBullet = ({ position, direction }) => {
  const { scene } = useGLTF(BULLET_CONFIG.modelPath);
  const bulletGroupRef = useRef();
  const bulletModelRef = useRef();
  const startPosition = useRef(new THREE.Vector3().copy(position));
  const initialQuaternion = useRef(new THREE.Quaternion());
  const { scene: threeScene } = useThree();
  const [isActive, setIsActive] = useState(true);
  
  // Calculate rotation to face direction
  const bulletDirection = direction.clone().normalize();
  
  useEffect(() => {
    
    // Calculate proper rotation quaternion from direction vector (only once at creation)
    const upVector = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4();
    
    // Find perpendicular vector for the up direction
    const right = new THREE.Vector3().crossVectors(bulletDirection, upVector).normalize();
    // Recalculate up to ensure orthogonality
    const correctedUp = new THREE.Vector3().crossVectors(right, bulletDirection).normalize();
    
    // Build rotation matrix from the three orthogonal vectors
    matrix.makeBasis(right, correctedUp, bulletDirection.clone().negate());
    initialQuaternion.current.setFromRotationMatrix(matrix);
    
    // Set the initial quaternion on the group
    if (bulletGroupRef.current) {
      bulletGroupRef.current.quaternion.copy(initialQuaternion.current);
    }
    
    const bulletModel = scene.clone();
    bulletModelRef.current = bulletModel;
    
    return () => {
      
      if (bulletModelRef.current) {
        bulletModelRef.current.traverse(child => {
          if (child.isMesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material && child.material.dispose) child.material.dispose();
          }
        });
      }
    };
  }, [position, scene, bulletDirection]);
  
  useFrame((_, delta) => {
    if (!bulletGroupRef.current || !isActive) return;
    
    // Move bullet in direction
    const moveAmount = BULLET_CONFIG.speed * delta;

    const bulletPosition = bulletGroupRef.current.position.clone();
    const bulletRadius = 0.03; // Adjust based on your bullet size
    
    const collisionResult = CollisionManager.checkBulletPhysicalCollision(
      bulletPosition,
      bulletRadius
    );
    
    // If hit something, deactivate bullet
    if (collisionResult.hit) {
      setIsActive(false);
      return;
    }
    
    bulletGroupRef.current.position.add(bulletDirection.clone().multiplyScalar(moveAmount));
    
    // Ensure orientation stays fixed
    bulletGroupRef.current.quaternion.copy(initialQuaternion.current);
    
    // Check if bullet has traveled too far
    const currentPos = bulletGroupRef.current.position;
    const distance = startPosition.current.distanceTo(currentPos);
    
    if (distance > BULLET_CONFIG.maxDistance) {
      setIsActive(false);
    }
  });
  
  if (!isActive) return null;
  
  return (
    <group 
      ref={bulletGroupRef} 
      position={position}
      quaternion={initialQuaternion.current}
    >
      {/* The actual bullet model */}
      <primitive 
        object={scene.clone()} 
        scale={BULLET_CONFIG.scale}
        rotation={[0, 0.5, -0.7]} // Your working rotation values
      />
    </group>
  );
};

export default RevolverBullet;

useGLTF.preload(BULLET_CONFIG.modelPath);