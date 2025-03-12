// RevolverBullet.jsx - Optimized version
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CollisionManager from '../../utils/CollisionManager';
import { modelCache } from '../../Preloader';

// Create a pre-calculated rotation matrix and quaternion outside component
const calculateBulletQuaternion = (direction) => {
  const bulletDirection = direction.clone().normalize();
  const upVector = new THREE.Vector3(0, 1, 0);
  const matrix = new THREE.Matrix4();
  
  const right = new THREE.Vector3().crossVectors(bulletDirection, upVector).normalize();
  const correctedUp = new THREE.Vector3().crossVectors(right, bulletDirection).normalize();
  
  matrix.makeBasis(right, correctedUp, bulletDirection.clone().negate());
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(matrix);
  return quaternion;
};

// Create a shared geometry for all bullets
const BULLET_CONFIG = {
  modelPath: '/bullet1.glb',
  scale: [0.1, 0.1, 0.1],
  speed: 25,
  maxDistance: 100,
};

// Cache the bullet model once, not per bullet
let cachedBulletModel = null;

const RevolverBullet = ({ position, direction, removeBullet, bulletDamage }) => {
  const bulletGroupRef = useRef();
  const startPosition = useRef(new THREE.Vector3().copy(position));
  const [isActive, setIsActive] = useState(true);
  
  // Only clone the model once and reuse it
  if (!cachedBulletModel) {
    const { scene } = modelCache[BULLET_CONFIG.modelPath];
    cachedBulletModel = scene.clone();
  }
  
  // Calculate rotation quaternion only once when bullet is created
  const initialQuaternion = useRef(calculateBulletQuaternion(direction));
  const bulletDirection = useRef(direction.clone().normalize());
  
  // Call removeBullet when bullet is no longer active
  useEffect(() => {
    if (!isActive) {
      removeBullet();
    }
  }, [isActive, removeBullet]);
  
  useFrame((_, delta) => {
    if (!bulletGroupRef.current || !isActive) return;
    
    // Move bullet in direction
    const moveAmount = BULLET_CONFIG.speed * delta;
    const bulletPosition = bulletGroupRef.current.position.clone();
    const bulletRadius = 0.03;
    
    const collisionResult = CollisionManager.checkBulletPhysicalCollision(
      bulletPosition,
      bulletRadius,
      bulletDirection.current,
      bulletDamage
    );
    
    if (collisionResult.hit) {
      setIsActive(false);
      return;
    }
    
    bulletGroupRef.current.position.add(
      bulletDirection.current.clone().multiplyScalar(moveAmount)
    );
    
    // Check if bullet has traveled too far
    const distance = startPosition.current.distanceTo(bulletGroupRef.current.position);
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
      <primitive 
        object={cachedBulletModel} 
        scale={BULLET_CONFIG.scale}
        rotation={[0, 0.5, -0.7]} 
      />
    </group>
  );
};

export default RevolverBullet;