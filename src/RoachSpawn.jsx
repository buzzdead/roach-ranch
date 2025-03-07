import React, { useEffect, useRef } from 'react';
import { useGameEffectsStore } from './store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';

/**
 * RoachSpawn - Spawns roaches periodically at the edge of the map
 */
const RoachSpawn = ({
  spawnRate = 5000, // Time between spawns in ms
  minX = -45,       // Minimum X position for spawning
  maxX = 45,        // Maximum X position for spawning
  zPosition = -48,  // Z position for spawning (edge of map)
  yPosition = 0.3,  // Height above ground
  batchSize = 1,    // How many roaches to spawn at once
  batchSpread = 2,  // How far apart roaches in a batch should be
  maxRoaches = 20,  // Maximum number of roaches allowed at once
  enabled = true,   // Whether spawning is active
  initialDelay = 3000, // Delay before first spawn
}) => {
  const { addRoach, roaches } = useGameEffectsStore(
    useShallow(state => ({
      addRoach: state.addRoach,
      roaches: state.roaches
    }))
  );
  
  const spawnTimerRef = useRef(null);
  
  // Spawn a batch of roaches along the northern edge
  const spawnRoachBatch = () => {
    // Don't spawn if we've reached the limit
    if (roaches.length >= maxRoaches) return;
    
    const actualBatchSize = Math.min(batchSize, maxRoaches - roaches.length);
    
    // Calculate a central spawn point
    const centerX = minX + Math.random() * (maxX - minX);
    
    // Spawn the batch
    for (let i = 0; i < actualBatchSize; i++) {
      // Calculate position with some spread if batching
      const offsetX = batchSize > 1 ? (Math.random() - 0.5) * batchSpread : 0;
      const spawnX = centerX + offsetX;
      
      // Ensure we stay within boundaries
      const clampedX = Math.max(minX, Math.min(maxX, spawnX));
      
      addRoach([clampedX, yPosition, zPosition]);
    }
  };
  
  useEffect(() => {
    if (!enabled) return;
    
    // Initial delay before starting spawn cycle
    const initialTimerRef = setTimeout(() => {
      // Set up recurring spawn timer
      spawnTimerRef.current = setInterval(() => {
        spawnRoachBatch();
      }, spawnRate * Math.max(roaches.length / 5, 1) );
    }, initialDelay);
    
    // Cleanup function
    return () => {
      clearTimeout(initialTimerRef);
      if (spawnTimerRef.current) {
        clearInterval(spawnTimerRef.current);
      }
    };
  }, [enabled, spawnRate, minX, maxX, zPosition, yPosition, batchSize, maxRoaches]);
  
  // This component doesn't render anything visible
  return null;
};

export default RoachSpawn;