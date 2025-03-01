// PlayerAudio.jsx
import React, { useRef, useEffect } from 'react';
import { useSoundManager } from '../../../context/SoundContext';

export const PlayerAudio = () => {
  const introPlayedRef = useRef(false);
  const soundManager = useSoundManager();
  
  // Play random intro voice
  useEffect(() => {
    if (soundManager && !introPlayedRef.current) {
      introPlayedRef.current = true;
      const introNumber = Math.floor(Math.random() * 3) + 1;
      const introSoundName = `Intro${introNumber}`;
      
      const introSound = soundManager.createSound(introSoundName, {
        volume: 1.0,
        loop: false
      });
      
      setTimeout(() => {
        if (introSound) introSound.play();
      }, 500);
    }
  }, [soundManager]);
  
  return null;
};
