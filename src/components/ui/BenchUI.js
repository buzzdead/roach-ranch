// components/ui/CraftingBenchUI.jsx
import React, { useEffect, useRef, useState } from 'react';
import './craftingBench.css'
import { useShallow } from 'zustand/shallow';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import { useSoundManager } from '../../context/SoundContext';
import UISoundManager from '../../utils/UISoundManager';
import WeaponSelector from './WeaponSelector';

export const CraftingBenchUI = () => {
  const {
    craftingBench,
    setCraftingActive,
    setSelectedCategory,
    setSelectedWeapon,
    purchaseUpgrade,
    weapons,
    player,
    availableUpgrades,
    playerChitin
  } = useGameEffectsStore(
    useShallow(state => ({
      // Crafting bench controls
      craftingBench: state.craftingBench,
      setCraftingActive: state.setCraftingActive,
      setSelectedCategory: state.setSelectedCategory,
      setSelectedWeapon: state.setSelectedWeapon,
      purchaseUpgrade: state.purchaseUpgrade,

      // Data
      weapons: state.weapons,
      player: state.player,
      availableUpgrades: state.getAvailableUpgrades(),
      playerChitin: state.player.resources.chitin
    }))
  );

  const [uiSoundManager, setUISoundManager] = useState(null);
  const weaponUpgradeSound = useRef()
  const otherUpgradeSound = useRef()
 
 useEffect(() => {
    const soundMgr = new UISoundManager();
    
    // Preload your sounds
    Promise.all([
      soundMgr.preloadSound('UpgradeWeapon', '/soundeffects/weapon-upgrade.mp3'),
      soundMgr.preloadSound('UpgradeOther', '/soundeffects/other-upgrade.mp3')
    ]).then(() => {
      setUISoundManager(soundMgr);
    });
    
    return () => {
      if (soundMgr) {
        soundMgr.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (uiSoundManager) {
      weaponUpgradeSound.current = uiSoundManager.createSound('UpgradeWeapon', {
        volume: 0.75,
        playbackRate: 1.025
      });
      
      otherUpgradeSound.current = uiSoundManager.createSound('UpgradeOther', {
        volume: 0.25,
        playbackRate: 1.025
      });
    }
  }, [uiSoundManager]);

  const handleSetControls = () => {
    useGameEffectsStore.getState().setControlsEnabled(true);
    setCraftingActive(false);
    // Re-lock pointer
    document.body.requestPointerLock();
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && craftingBench.active) {
        e.preventDefault()
        e.stopPropagation(); // Stop the event from bubbling up
        setTimeout(() => handleSetControls(), 150)
        return false
      }
    };

    window.addEventListener('keydown', handleEscape, { capture: true }); // Use capture phase
    return () => window.removeEventListener('keydown', handleEscape, { capture: true });
  }, [setCraftingActive, craftingBench.active]);

  if (!craftingBench.active) return null;

  const handlePurchase = (upgradeType) => {
    const success = purchaseUpgrade(upgradeType)
    if (success) {
      // Maybe play a sound or show a success indicator
      craftingBench.selectedCategory === "weapons" ? weaponUpgradeSound.current.play() : otherUpgradeSound.current.play()
      console.log(`Purchased ${upgradeType} upgrade`);

    } else {
      // Maybe play a failure sound
      console.log(`Failed to purchase ${upgradeType} upgrade`);
    }
  };

  return (
    <div className="crafting-station">
      {/* Category selection */}
      <div className="category-tabs">
        <button
          className={craftingBench.selectedCategory === "weapons" ? "active" : ""}
          onClick={() => setSelectedCategory("weapons")}
        >
          Weapons
        </button>
        <button
          className={craftingBench.selectedCategory === "player" ? "active" : ""}
          onClick={() => setSelectedCategory("player")}
        >
          Player
        </button>
      </div>

      {/* Weapon selection (only shown if on weapons tab) */}
      {craftingBench.selectedCategory === "weapons" && (
       <WeaponSelector />
      )}

      {/* Available upgrades */}
      <div className="available-upgrades">
        {Object.entries(availableUpgrades).map(([upgradeType, upgrade]) => (
          <div key={upgradeType} className="upgrade-item">
            <div className="upgrade-info">
              <h3>{upgrade.displayName}</h3>
              <p>Level: {upgrade.level} / {upgrade.maxLevel}</p>
              <p>Cost: {upgrade.cost.chitin} Chitin</p>
            </div>
            <button
              disabled={upgrade.level >= upgrade.maxLevel || playerChitin < upgrade.cost.chitin}
              onClick={() => handlePurchase(upgradeType)}
            >
              Upgrade
            </button>
          </div>
        ))}
      </div>
      <button
        className="leave-button"
        onClick={handleSetControls}
      >
        Leave bench
      </button>
    </div>
  );
}