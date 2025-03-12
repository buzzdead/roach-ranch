// RevolverAudio.jsx
import React, { useEffect, useRef } from 'react';
import { useSoundManager } from '../../context/SoundContext';

const RevolverAudio = ({ position, isFiring }) => {
  const soundRef = useRef(null);
  const soundManager = useSoundManager();
  
  // Set up sound
  useEffect(() => {
    if (soundManager) {
      soundRef.current = soundManager.createPositionalSound('Revolver-Fire', position, {
        poolSize: 3,
  minInterval: 1000,    // At least 1 second between growls
  randomizePitch: true,
  refDistance: 3,
  maxDistance: 30,
  rate: 1.15,
  volume: 0.4,
      });
      
      return () => {
        // Clean up sound when component unmounts
        if (soundRef.current) {
          soundRef.current.remove();
        }
      };
    }
  }, [soundManager, position]);
  
  // Handle firing sound
  useEffect(() => {
    if (isFiring && soundRef.current) {
      // Update sound position before playing
      if (position && position.length === 3) {
        soundRef.current.setPosition(position[0], position[1], position[2]);
      }
      soundRef.current.play();
    }
  }, [isFiring, position]);
  
  return null;
};

export default RevolverAudio;