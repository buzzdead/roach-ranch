import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three';
import { useSoundManager } from '../../context/SoundContext'; // Adjust path as needed

const Roach = ({ position }) => {
  const { scene } = useGLTF('/mutant.glb');
  const modelRef = useRef();
  const lightRef = useRef();

  const soundRef = useRef(null);
  const nextScreechRef = useRef(Math.random() * 10); // Random initial time
  const soundManager = useSoundManager();
  // Set up the base appearance
  useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.roughness = 1;
        child.material.metalness = 1;
        child.material.envMapIntensity = 5.5;
        
        // Base emissive properties
        child.material.emissive = new THREE.Color(0x220000);
        child.material.emissiveIntensity = 0.2;
        child.material.needsUpdate = true;
      }
    });
  }, [scene]);
  useEffect(() => {
    if (soundManager) {
      // Create a sound object for this roach
      soundRef.current = soundManager.createPositionalSound('roachScreech', position, {
        refDistance: 5,
        maxDistance: 50,
        volume: 0.5
      });
      
      return () => {
        // Clean up sound when component unmounts
        if (soundRef.current) {
          soundRef.current.remove();
        }
      };
    }
  }, [soundManager, position]);
  // Add dynamic glow based on nearby lights
  useFrame((state) => {
    // Find nearby lights in the scene
    /* 
    state.scene.traverse((obj) => {
      if (obj.isLight && obj !== lightRef.current) {
        const distance = new THREE.Vector3().copy(obj.position).distanceTo(modelRef.current.position);
        if (distance < 10) { // Adjust this threshold as needed
          nearbyLights.push({ light: obj, distance });
        }
      }
    });
    
    // Adjust emissive intensity based on proximity to lights
    if (modelRef.current) {
      modelRef.current.traverse(child => {
        if (child.isMesh && child.material) {
          // Reset to base emissive
          let intensity = 0.2;
          
          // Increase intensity based on nearby lights
          nearbyLights.forEach(({ light, distance }) => {
            // Calculate intensity boost based on distance and light intensity
            const boost = (1 - distance/10) * light.intensity * 0.1;
            intensity += boost;
          });
          
          // Apply the new intensity (with a reasonable cap)
          child.material.emissiveIntensity = Math.min(intensity, 1.5);
          child.material.needsUpdate = true;
        }
      });
    } */
  });

  useFrame((state, delta) => {
    // Update the timer
    nextScreechRef.current -= delta;
    
    // If it's time to screech and we have a sound reference
    if (nextScreechRef.current <= 0 && soundRef.current && !soundRef.current.isPlaying()) {
      // Update sound position in case roach has moved
      soundRef.current.setPosition(position[0], position[1], position[2]);
      
      // Play the sound
      soundRef.current.play();
      
      // Visual feedback - briefly increase emissive intensity
      // Reset timer with random interval (5-15 seconds)
      nextScreechRef.current = 5 + Math.random() * 15;
    }
  });

  return (
    <>
      {/* Optional: Add a small point light to the roach itself */}
      <pointLight
        ref={lightRef}
        position={[position[0] + 0.2, position[1] + 0.55, position[2] + 0.35]}
        intensity={.151}
        color="white"
      />
      <primitive 
        ref={modelRef} 
        object={scene.clone()} 
        position={position} 
        scale={[1.25, 1.25, 1.25]} 
      />
    </>
  );
};

export default Roach;