// Revolver.jsx
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useAttachToObject } from '../../hooks/useAttachToObject';
import { usePlayerContext } from '../../context/PlayerContext';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import RevolverBullet from './RevolverBullet';
import RevolverAudio from './RevolverAudio';

// Constants for configuration
const REVOLVER_CONFIG = {
  modelPath: '/revolver.glb',
  position: [0.1, 0.20, -0.02],
  rotation: [Math.PI, Math.PI * 1.5, 0],
  scale: [0.25, 0.25, 0.25],
};

const PRIMITIVE_CONFIG = {
  position: [-0.25, -0.51, 0.2],
  rotation: [-1.2, 0, 0],
};

const MUZZLE_POSITION = [0.2, 0.2, 0]; // Position of the muzzle end

/**
 * Revolver component that attaches to a bone and displays a 3D revolver model
 */
export const Revolver = ({ bone }) => {
  const { scene } = useGLTF(REVOLVER_CONFIG.modelPath);
  const revolverScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();
  const muzzleRef = useRef();
  const { animationState } = usePlayerContext();
  const [lastFireCount, setLastFireCount] = useState(0);
  const { camera } = useThree();
  
  // For firing animation/effects
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [muzzlePosition, setMuzzlePosition] = useState([0, 0, 0]);
  const [bullets, setBullets] = useState([]);
  
  useAttachToObject(groupRef, bone);
  
  // Handle firing animation and bullet creation
  useEffect(() => {
    if (animationState.firing && animationState.fireCount !== lastFireCount) {
      setLastFireCount(animationState.fireCount);
      setMuzzleFlash(true);
      
      // Calculate bullet starting position and direction
      if (groupRef.current) {
        const muzzleWorldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        
        // Get world position of the revolver's group
        groupRef.current.getWorldPosition(muzzleWorldPos);
        groupRef.current.getWorldQuaternion(worldQuat);
        
        // Adjust for muzzle position within the group
        const muzzleOffset = new THREE.Vector3(...MUZZLE_POSITION);
        muzzleOffset.applyQuaternion(worldQuat);
        muzzleWorldPos.add(muzzleOffset);
        
        // Update muzzle position for audio
        setMuzzlePosition([muzzleWorldPos.x, muzzleWorldPos.y, muzzleWorldPos.z]);
        
        // Direction is forward vector of the camera
        const bulletDirection = new THREE.Vector3(0, 0, -1);
        bulletDirection.applyQuaternion(camera.quaternion);
        
        // Add new bullet with unique ID
        const newBulletId = Date.now();
        setBullets(prevBullets => [
          ...prevBullets,
          {
            id: newBulletId,
            position: muzzleWorldPos,
            direction: bulletDirection
          }
        ]);
        
        // Trigger sound by setting isFiring to true
        setIsFiring(true);
        
        // Reset firing state after a short delay
        setTimeout(() => {
          setIsFiring(false);
        }, 100);
      }
      
      // Hide muzzle flash after a short delay
      setTimeout(() => {
        setMuzzleFlash(false);
      }, 100);
    }
  }, [animationState.firing, animationState.fireCount, lastFireCount, camera]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      revolverScene.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      });
    };
  }, [revolverScene]);

  return (
    <>
      <group ref={groupRef}>
        <group 
          position={REVOLVER_CONFIG.position}
          rotation={REVOLVER_CONFIG.rotation}
          scale={REVOLVER_CONFIG.scale}
        >
          <primitive 
            object={revolverScene} 
            position={PRIMITIVE_CONFIG.position} 
            rotation={PRIMITIVE_CONFIG.rotation} 
          />
          
          <group 
            ref={muzzleRef}
            position={MUZZLE_POSITION}
            visible={false}
          />
          
          {/* Muzzle flash */}
          {muzzleFlash && (
            <pointLight
              position={MUZZLE_POSITION}
              intensity={5}
              distance={2}
              color="#ffaa00"
            />
          )}
          {muzzleFlash && (
            <mesh position={MUZZLE_POSITION}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color="#ffff00" />
            </mesh>
          )}
        </group>
      </group>
      
      {/* Audio component for revolver sounds */}
      <RevolverAudio 
        position={muzzlePosition}
        isFiring={isFiring}
      />
      
      {/* Render bullets */}
      {bullets.map(bullet => (
        <RevolverBullet 
          key={bullet.id}
          position={bullet.position}
          direction={bullet.direction}
        />
      ))}
    </>
  );
};

useGLTF.preload(REVOLVER_CONFIG.modelPath);