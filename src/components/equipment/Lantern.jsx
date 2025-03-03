// Lantern.jsx
import React, { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAttachToObject } from '../../hooks/useAttachToObject';
import { LanternLight } from './LanternLight';
import { modelCache } from '../../Preloader';

// Constants for configuration
const LANTERN_CONFIG = {
  modelPath: '/lantern.glb',
  position: [-0.05, 0.3, 0],
  rotation: [0, -Math.PI/2, Math.PI],
  scale: [0.25, 0.25, 0.25],
};

const LIGHT_CONFIG = {
  position: [-0.75, -0.5, 0.5],
  intensity: 2.5,
  distance: 20,
  decay: 1.8,
  color: "#ff9c50",
  castShadow: true,
};

/**
 * Lantern component that attaches to a bone and displays a 3D lantern model with light
 * 
 * @param {Object} props - Component props
 * @param {THREE.Bone} props.bone - The bone to attach the lantern to
 */
export const Lantern = ({ bone }) => {
  // Load and memoize the 3D model
  const { scene } = modelCache[LANTERN_CONFIG.modelPath];
  const lanternScene = useMemo(() => scene.clone(), [scene]);
  
  // Create refs for the component
  const groupRef = useRef();
  const lightRef = useRef();
  
  // Custom hook to handle attachment to bone
  useAttachToObject(groupRef, bone);
  
  // Optional: Add flickering effect to the lantern light
  useFrame(({ clock }) => {
    if (lightRef.current) {
      // Subtle intensity variation based on sine wave
      const flicker = Math.sin(clock.elapsedTime * 10) * 0.1 + 0.95;
      lightRef.current.intensity = LIGHT_CONFIG.intensity * flicker;
    }
  });
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      lanternScene.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      });
    };
  }, [lanternScene]);

  return (
    <group ref={groupRef}>
      <group 
        position={LANTERN_CONFIG.position}
        rotation={LANTERN_CONFIG.rotation}
        scale={LANTERN_CONFIG.scale}
      >
        <primitive object={lanternScene} />
        <LanternLight ref={lightRef} config={LIGHT_CONFIG} />
      </group>
    </group>
  );
};

// Preload the model for better performance
useGLTF.preload(LANTERN_CONFIG.modelPath);
