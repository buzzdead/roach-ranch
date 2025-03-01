// PlayerLighting.jsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PlayerLighting = ({ camera }) => {
  const lanternLightRef = useRef();
  
  // Flickering effect parameters
  const flickerParams = useMemo(() => ({
    intensity: { base: 5.5, variance: 0.4 },
    speed: 0.5,
    lastUpdate: 0
  }), []);
  
  useFrame((state, delta) => {
    if (!lanternLightRef.current || !camera.userData.characterPos) return;
    
    // Update lantern light position
    const rightHandOffset = new THREE.Vector3(0.7, 2.0, 0.3);
    rightHandOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), camera.userData.lastAngle || 0);
    
    lanternLightRef.current.position.set(
      camera.userData.characterPos.x + rightHandOffset.x,
      camera.userData.characterPos.y + rightHandOffset.y,
      camera.userData.characterPos.z + rightHandOffset.z
    );
    
    // Flickering effect
    flickerParams.lastUpdate += delta * flickerParams.speed;
    const flickerValue = Math.sin(flickerParams.lastUpdate * 10) * flickerParams.intensity.variance;
    lanternLightRef.current.intensity = flickerParams.intensity.base + flickerValue;
  });
  
  return (
    <group>
      <pointLight
        ref={lanternLightRef}
        position={[0, 3, 5]}
        intensity={3.5}
        distance={20}
        decay={1.8}
        color="#ff9c50"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
      />
      
      <pointLight
        position={[0, 3, 5]}
        intensity={1.2}
        distance={5}
        decay={2}
        color="#ff6a00"
      />
    </group>
  );
};
