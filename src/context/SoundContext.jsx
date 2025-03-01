// context/SoundContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import SoundManager from '../utils/SoundManager';

const SoundContext = createContext(null);

export const useSoundManager = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
  const { camera } = useThree();
  const [soundManager, setSoundManager] = useState(null);
  const initialized = useRef(false);
  
  useEffect(() => {
    if (camera && !initialized.current) {
      initialized.current = true;
      
      // Create sound manager
      const manager = new SoundManager(camera);
      
      // Preload sounds
      Promise.all([
        manager.preloadSound('roachScreech', '/soundeffects/screech.mp3'),
        manager.preloadSound('Intro1', 'soundeffects/Rancher-Intro1.mp3'),
        manager.preloadSound('Intro2', 'soundeffects/Rancher-Intro2.mp3'),
        manager.preloadSound('Intro3', 'soundeffects/Rancher-Intro3.mp3'),
        manager.preloadSound('roachAttack', 'soundeffects/Roach-Goo.mp3')
        // Preload other sounds as needed
      ]).then(() => {
        setSoundManager(manager);
      });
      
      return () => {
        manager.dispose();
      };
    }
  }, [camera]);
  
  return (
    <SoundContext.Provider value={soundManager}>
      {children}
    </SoundContext.Provider>
  );
};