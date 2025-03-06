import React, { useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CollisionManager from '../../utils/CollisionManager';
import { modelCache } from '../../Preloader';

const BULLET_CONFIG = {
  modelPath: '/bullet1.glb',
  scale: [0.1, 0.1, 0.1],
  speed: 25, // Units per second
  maxDistance: 100, // Maximum travel distance before removal
  trailSegments: 15, // Number of trail points
  minDist: 0.051, // Minimum distance between trail points
  lerp: 0.5, // Interpolation factor for smooth trail
  flameColor: 0xff6600, // Orange-red for cartoonish flames
  waveAmplitude: 2, // Amplitude of the wave (up and down)
  waveFrequency: 20, // Frequency of the wave
};

function useTrail(n, ref, { lerp, minDist, waveAmplitude, waveFrequency }) {
  const [trailPositions, setTrailPositions] = useState(() => {
    const initialPos = ref.current ? ref.current.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
    return Float32Array.from({ length: n * 3 }, (_, i) => (i < 3 ? initialPos.getComponent(i % 3) : 0));
  });
  const p = new THREE.Vector3();
  const p2 = new THREE.Vector3();
  const [time, setTime] = useState(0);

  useEffect(() => {
    setTrailPositions((arr) =>
      Float32Array.from({ length: n * 3 }, (_, i) => {
        const initialPos = ref.current ? ref.current.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3();
        return i < 3 ? initialPos.getComponent(i % 3) : arr[i];
      })
    );
  }, [n, ref]);

  useFrame(() => {
    if (ref.current) {
      ref.current.getWorldPosition(p);
      setTime(prevTime => prevTime + 0.05); // Increment time for wave animation

      if (lerp) {
        p2.lerp(p, lerp);
      } else {
        p2.copy(p);
      }

      const newX = [p2.x, p2.y, p2.z];
      const distSqr = v3distSqr(trailPositions.slice(0, 3), newX);

      if (distSqr >= minDist * minDist) {
        shiftRight(trailPositions, 3);
        // Apply wave effect to Y-axis
        newX[1] += Math.sin(time * waveFrequency) * waveAmplitude * (1 - trailPositions.length / (n * 3)); // Fade wave amplitude
        trailPositions.set(newX);
      }
    }
  });

  return [trailPositions];
}

// Helper functions
const shiftRight = (collection, steps = 1) => {
  collection.set(collection.subarray(0, -steps), steps);
  collection.fill(-Infinity, 0, steps);
  return collection;
};

function v3distSqr(a, b) {
  const dx = a[0] - b[0],
    dy = a[1] - b[1],
    dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

const RevolverBullet = ({ position, direction }) => {
  const { scene } = modelCache[BULLET_CONFIG.modelPath];
  const bulletGroupRef = useRef();
  const bulletModelRef = useRef();
  const instancedMeshRef = useRef();
  const startPosition = useRef(new THREE.Vector3().copy(position));
  const initialQuaternion = useRef(new THREE.Quaternion());
  const [isActive, setIsActive] = useState(true);
  const [trailPositions] = useTrail(BULLET_CONFIG.trailSegments, bulletGroupRef, {
    lerp: BULLET_CONFIG.lerp,
    minDist: BULLET_CONFIG.minDist,
    waveAmplitude: BULLET_CONFIG.waveAmplitude,
    waveFrequency: BULLET_CONFIG.waveFrequency,
  });
  const dummy = useRef(new THREE.Object3D());

  const bulletDirection = direction.clone().normalize();

  useEffect(() => {
    const upVector = new THREE.Vector3(0, 1, 0);
    const matrix = new THREE.Matrix4();
    const right = new THREE.Vector3().crossVectors(bulletDirection, upVector).normalize();
    const correctedUp = new THREE.Vector3().crossVectors(right, bulletDirection).normalize();
    matrix.makeBasis(right, correctedUp, bulletDirection.clone().negate());
    initialQuaternion.current.setFromRotationMatrix(matrix);

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

    const moveAmount = BULLET_CONFIG.speed * delta;
    const bulletPosition = bulletGroupRef.current.position.clone();
    const bulletRadius = 0.03;

    const collisionResult = CollisionManager.checkBulletPhysicalCollision(
      bulletPosition,
      bulletRadius,
      bulletDirection
    );

    if (collisionResult.hit) {
      setIsActive(false);
      return;
    }

    bulletGroupRef.current.position.add(bulletDirection.clone().multiplyScalar(moveAmount));
    bulletGroupRef.current.quaternion.copy(initialQuaternion.current);

    const currentPos = bulletGroupRef.current.position;
    const distance = startPosition.current.distanceTo(currentPos);

    if (distance > BULLET_CONFIG.maxDistance) {
      setIsActive(false);
    }

    // Update instanced mesh positions
    if (bulletGroupRef.current && instancedMeshRef.current && trailPositions) {
      const quaternion = new THREE.Quaternion();
      bulletGroupRef.current.getWorldQuaternion(quaternion);
      for (let i = 0; i < BULLET_CONFIG.trailSegments; i++) {
        const posIndex = i * 3;
        if (isFinite(trailPositions[posIndex]) && isFinite(trailPositions[posIndex + 1]) && isFinite(trailPositions[posIndex + 2])) {
          dummy.current.position.set(
            trailPositions[posIndex],
            trailPositions[posIndex + 1],
            trailPositions[posIndex + 2]
          );
          dummy.current.scale.setScalar((1 - i / BULLET_CONFIG.trailSegments) * 0.5 + 0.1); // Ensure visible scale
          dummy.current.quaternion.copy(quaternion); // Match bullet rotation
          dummy.current.updateMatrixWorld();
          instancedMeshRef.current.setMatrixAt(i, dummy.current.matrixWorld);
        }
      }
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  if (!isActive) return null;

  return (
    <group ref={bulletGroupRef} position={position} quaternion={initialQuaternion.current}>
      <primitive object={scene.clone()} scale={BULLET_CONFIG.scale} rotation={[0, 0.5, -0.7]}>
        <instancedMesh ref={instancedMeshRef} args={[null, null, BULLET_CONFIG.trailSegments]}>
          <coneGeometry args={[0.5, 0.5, 20]} /> {/* Flame-like shape */}
          <meshBasicMaterial
            color={BULLET_CONFIG.flameColor}
            transparent={true}
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </instancedMesh>
      </primitive>
      
    </group>
  );
};

export default RevolverBullet;

useGLTF.preload(BULLET_CONFIG.modelPath);