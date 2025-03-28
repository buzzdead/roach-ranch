// context/SoundContext.jsx
import { useThree } from '@react-three/fiber';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
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
        manager.preloadSound('roachAttack', 'soundeffects/Roach-Goo.mp3'),
        manager.preloadSound('Revolver-Fire', 'soundeffects/revolver-fire.mp3'),
        manager.preloadSound('Shotgun-Fire', 'soundeffects/shotgun-fire.mp3'),
        manager.preloadSound('PickUp', 'soundeffects/Pickup.mp3'),
        manager.preloadSound(
          'UpgradeWeapon',
          'soundeffects/weapon-upgrade.mp3'
        ),
        manager.preloadSound('UpgradeOther', 'soundeffects/other-upgrade.mp3'),
        manager.preloadSound(
          'UpgradeUnlock',
          'soundeffects/unlock-upgrade.mp3'
        ),
        manager.preloadSound('Kill1', 'soundeffects/Rancher-Kill1.mp3'),
        manager.preloadSound('Kill2', 'soundeffects/Rancher-Kill2.mp3'),
        manager.preloadSound('Kill3', 'soundeffects/Rancher-Kill3.mp3'),
        manager.preloadSound('Chicken-Kill1', 'soundeffects/Chicken-Kill1.mp3'),
        manager.preloadSound('Chicken-Kill2', 'soundeffects/Chicken-Kill2.mp3'),
        manager.preloadSound('Chicken-Kill3', 'soundeffects/Chicken-Kill3.mp3'),
        manager.preloadSound(
          'chickenAttack',
          'soundeffects/chicken-attack.mp3'
        ),
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
