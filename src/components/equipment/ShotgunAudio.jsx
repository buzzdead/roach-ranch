// ShotgunAudio.jsx
import React, { useEffect, useRef } from 'react';
import { useSoundManager } from '../../context/SoundContext';

const ShotgunAudio = ({ position, isFiring }) => {
  const soundRef = useRef(null);
  const soundManager = useSoundManager();
  
  // Set up sound
  useEffect(() => {
    if (soundManager) {
      // You'll need to preload this sound in your SoundContext
      soundRef.current = soundManager.createPositionalSound('Shotgun-Fire', position, {
        poolSize: 3,
        minInterval: 1200,    // Longer interval between shots
        randomizePitch: true,
        refDistance: 5,
        maxDistance: 40,      // Higher range than revolver
        rate: 0.95,           // Slightly slower/deeper sound
        volume: 0.6,          // Louder than revolver
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

export default ShotgunAudio;