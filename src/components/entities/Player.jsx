// Player.jsx - Updated with random intro voice
import React, { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSoundManager } from '../../context/SoundContext';

const Player = () => {
  const { scene } = useGLTF('/rancher.glb');
  const { camera } = useThree();
  const modelRef = useRef();
  const lanternLightRef = useRef();
  const introPlayedRef = useRef(false);
  
  const soundManager = useSoundManager();
  
  // Play random intro voice when the game starts
  useEffect(() => {
    if (soundManager && !introPlayedRef.current) {
      introPlayedRef.current = true;
      
      // Pick a random intro sound (1, 2, or 3)
      const introNumber = Math.floor(Math.random() * 3) + 1;
      const introSoundName = `Intro${introNumber}`;
      
      // Create a non-positional sound (attached to listener) for the intro voice
      const introSound = soundManager.createSound(introSoundName, {
        volume: 1.0,
        loop: false
      });
      
      // Add slight delay before playing
      setTimeout(() => {
        if (introSound) {
          introSound.play();
        }
      }, 500);
    }
  }, [soundManager]);
  
  // Flickering effect as before
  const flickerParams = useMemo(() => ({
    intensity: { base: 5.5, variance: 0.4 },
    speed: 0.5,
    lastUpdate: 0
  }), []);
  
  useFrame((state, delta) => {
    if (modelRef.current && camera.userData.characterPos) {
      // Just update visual model position based on physics position from ThirdPersonControls
      modelRef.current.position.set(
        camera.userData.characterPos.x,
        camera.userData.characterPos.y - 1.3,
        camera.userData.characterPos.z
      );
      
      if (camera.userData.lastAngle !== undefined) {
        modelRef.current.rotation.y = camera.userData.lastAngle;
      }
      
      // Update lantern light position
      if (lanternLightRef.current) {
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
      }
    }
  });
  
  return (
    <>
      <primitive
        ref={modelRef}
        object={scene}
        position={[0, 0, 5]}
        scale={[1, 1, 1]}
        castShadow
      />
      
      {/* Lantern lights */}
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
    </>
  );
};

export default Player;