import React, { useEffect, useRef } from 'react';
import { useGameEffectsStore } from './store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';

/**
 * RoachSpawn - Spawns roaches periodically based on wave level and activity
 */
const RoachSpawn = ({
  baseSpawnRate = 5000, // Base time between spawns in ms
  minX = -45,          // Minimum X position for spawning
  maxX = 45,           // Maximum X position for spawning
  zPosition = -48,     // Z position for spawning (edge of map)
  yPosition = 0.3,     // Height above ground
  batchSize = 1,       // How many roaches to spawn at once
  batchSpread = 2,     // How far apart roaches in a batch should be
  maxRoaches = 20,     // Maximum number of roaches allowed at once
  initialDelay = 0, // Delay before first spawn
}) => {
  const { addEnemy, enemies, waveActive, waveLevel } = useGameEffectsStore(
    useShallow(state => ({
      addEnemy: state.addEnemy,
      enemies: state.enemies,
      waveActive: state.waveActive,
      waveLevel: state.waveLevel
    }))
  );
  
  const spawnTimerRef = useRef(null);
  
  // Calculate actual spawn rate based on wave level
  const getSpawnRate = () => {
    // Reduce spawn rate by 500ms per level, with a minimum of 1000ms
    return Math.max(1000, baseSpawnRate - (750 * waveLevel));
  };
  
  // Spawn a batch of roaches along the northern edge
  const spawnRoachBatch = () => {
    // Don't spawn if we've reached the limit or if wave is not active
    if (enemies.length >= maxRoaches || !waveActive) return;
    
    const actualBatchSize = Math.min(batchSize, maxRoaches - enemies.length);
    
    // Calculate a central spawn point
    const centerX = minX + Math.random() * (maxX - minX);
    
    // Spawn the batch
    for (let i = 0; i < actualBatchSize; i++) {
      // Calculate position with some spread if batching
      const offsetX = batchSize > 1 ? (Math.random() - 0.5) * batchSpread : 0;
      const spawnX = centerX + offsetX;
      
      // Ensure we stay within boundaries
      const clampedX = Math.max(minX, Math.min(maxX, spawnX));
      const isRoach = Math.random() > 0.5;
      addEnemy(isRoach ? "roach" : "chicken", [clampedX, yPosition, zPosition]);
    }
  };
  
  // Setup or clear spawn timer based on wave activity
  useEffect(() => {
    // Clear any existing timers
    if (spawnTimerRef.current) {
      clearInterval(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
    
    // Only setup spawning if wave is active
    if (waveActive) {
      // Initial delay before starting spawn cycle
      const initialTimerRef = setTimeout(() => {
        // Set up recurring spawn timer with dynamic rate
        spawnTimerRef.current = setInterval(() => {
          spawnRoachBatch();
        }, getSpawnRate());
      }, initialDelay);
      
      // Cleanup function
      return () => {
        clearTimeout(initialTimerRef);
        if (spawnTimerRef.current) {
          clearInterval(spawnTimerRef.current);
        }
      };
    }
  }, [waveActive, waveLevel, baseSpawnRate]);
  
  // This component doesn't render anything visible
  return null;
};

export default RoachSpawn;