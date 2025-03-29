import { memo, useEffect, useRef } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../store/gameStore';

// Extracted enemy selection logic into a separate hook
const useEnemySelection = (waveLevel) => {
  // Dynamic probability distribution based on wave level
  const getEnemyDistribution = () => {
    // Base probabilities that evolve with wave level
    if (waveLevel <= 1) {
      return { roach: 1, chicken: 0, warhog: 0, mootant: 0 };
    } else if (waveLevel === 2) {
      return { roach: 0.9, chicken: 0.1, warhog: 0, mootant: 0 };
    } else if (waveLevel === 3) {
      return { roach: 0.7, chicken: 0.3, warhog: 0, mootant: 0 };
    } else if (waveLevel === 4) {
      return { roach: 0.6, chicken: 0.4, warhog: 0, mootant: 0 };
    } else if (waveLevel === 5) {
      return { roach: 0.5, chicken: 0.35, warhog: 0.15, mootant: 0 };
    } else if (waveLevel === 6) {
      return { roach: 0.4, chicken: 0.35, warhog: 0.25, mootant: 0 };
    } else if (waveLevel === 7) {
      return { roach: 0.3, chicken: 0.3, warhog: 0.3, mootant: 0.1 };
    } else if (waveLevel >= 8) {
      return { roach: 0.2, chicken: 0.2, warhog: 0.4, mootant: 0.2 };
    }
    return { roach: 1, chicken: 0, warhog: 0, mootant: 0 }; // Fallback
  };

  // Weighted random selection based on probabilities
  const selectEnemyType = () => {
    const distribution = getEnemyDistribution();
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (const [type, probability] of Object.entries(distribution)) {
      cumulativeProbability += probability;
      if (rand <= cumulativeProbability) {
        return type;
      }
    }

    return 'roach'; // Default fallback
  };

  return { selectEnemyType };
};

/**
 * EnemyGenerator - Spawns enemies periodically based on wave level
 * Implements progressive difficulty scaling and enemy type diversity
 */
const EnemyGenerator = ({
  baseSpawnRate = 5000, // Base time between spawns in ms
  minX = -45, // Minimum X position for spawning
  maxX = 45, // Maximum X position for spawning
  zPosition = -48, // Z position for spawning (edge of map)
  yPosition = 0.3, // Height above ground
  batchSize = 1, // How many enemies to spawn at once
  batchSpread = 2, // How far apart enemies in a batch should be
  maxEnemies = 12, // Maximum number of enemies allowed at once
  initialDelay = 2500, // Delay before first spawn
  spawnRateReduction = 200, // ms reduction per wave level
  minSpawnRate = 1000, // Minimum spawn rate in ms
}) => {
  const { addEnemy, enemies, waveActive, waveLevel } = useGameStore(
    useShallow((state) => ({
      addEnemy: state.addEnemy,
      enemies: state.enemies,
      waveActive: state.waveActive,
      waveLevel: state.waveLevel,
    }))
  );

  const { selectEnemyType } = useEnemySelection(waveLevel);
  const spawnTimerRef = useRef(null);

  // Calculate actual spawn rate based on wave level with more gradual scaling
  const getSpawnRate = () => {
    return Math.max(
      minSpawnRate,
      baseSpawnRate - spawnRateReduction * waveLevel
    );
  };

  // Calculate dynamic batch size based on wave level
  const getDynamicBatchSize = () => {
    // Increase batch size in later waves for more challenging gameplay
    const scaledBatch = batchSize + Math.floor(waveLevel / 3);
    return Math.min(scaledBatch, 2); // Cap at 5 for balance
  };

  // Spawn a batch of enemies along the northern edge
  const spawnEnemyBatch = () => {
    // Don't spawn if we've reached the limit or if wave is not active
    if (enemies.length >= maxEnemies || !waveActive) return;

    const currentBatchSize = getDynamicBatchSize();
    const actualBatchSize = Math.min(
      currentBatchSize,
      maxEnemies - enemies.length
    );

    // Calculate a central spawn point
    const centerX = minX + Math.random() * (maxX - minX);

    // Spawn the batch
    for (let i = 0; i < actualBatchSize; i++) {
      // Calculate position with some spread if batching
      const offsetX =
        actualBatchSize > 1 ? (Math.random() - 0.5) * batchSpread : 0;
      const spawnX = centerX + offsetX + 5;

      // Ensure we stay within boundaries
      const clampedX = Math.max(minX, Math.min(maxX, spawnX));

      // Select enemy type based on wave probability
      const enemyType = selectEnemyType();

      addEnemy(enemyType, [clampedX, yPosition, zPosition]);
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
        // Initial spawn to kick things off
        spawnEnemyBatch();

        // Set up recurring spawn timer with dynamic rate
        spawnTimerRef.current = setInterval(() => {
          spawnEnemyBatch();
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
  }, [waveActive, waveLevel]);

  // This component doesn't render anything visible
  return null;
};

export default memo(EnemyGenerator);
