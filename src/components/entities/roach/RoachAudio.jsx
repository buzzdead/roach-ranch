// RoachAudio.jsx
import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSoundManager } from '../../../context/SoundContext';

const RoachAudio = ({ position, isAnimatingRef, isAttacking }) => {
  const soundsRef = useRef({
    screech: null,
    attack: null
  });
  const nextScreechRef = useRef(Math.random() * 10); // Random initial time
  const soundManager = useSoundManager();
  
  // Set up sounds
  useEffect(() => {
    if (soundManager) {
      // Create multiple sound objects for this roach
      soundsRef.current = {
        screech: soundManager.createPositionalSound('roachScreech', position, {
          refDistance: 5,
          maxDistance: 50,
          volume: 0.5
        }),
        attack: soundManager.createPositionalSound('roachAttack', position, {
          refDistance: 5,
          maxDistance: 50,
          volume: 0.7 // Maybe slightly louder for attack
        })
      };
      
      return () => {
        // Clean up sounds when component unmounts
        Object.values(soundsRef.current).forEach(sound => {
          if (sound) sound.remove();
        });
      };
    }
  }, [soundManager, position]);
  
  // Handle attack sound
  useEffect(() => {
    if (isAttacking && soundsRef.current.attack) {
      soundsRef.current.attack.setPosition(position[0], position[1], position[2]);
      soundsRef.current.attack.play();
    }
  }, [isAttacking, position]);
  
  // Handle periodic screeching
  useFrame((state, delta) => {
    // Update the timer
    nextScreechRef.current -= delta;
    
    // If it's time to screech and we have a sound reference
    if (nextScreechRef.current <= 0 && 
        soundsRef.current.screech && 
        !soundsRef.current.screech.isPlaying() && 
        !isAttacking) {
      
      // Update sound position
      soundsRef.current.screech.setPosition(position[0], position[1], position[2]);
      soundsRef.current.screech.play();
      
      // Reset timer with random interval (5-15 seconds)
      nextScreechRef.current = 5 + Math.random() * 15;
    }
  });
  
  return null;
};

export default RoachAudio;
