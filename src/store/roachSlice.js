import { nanoid } from 'nanoid';
const enemyConfigs = {
  roach: { health: 75 },
  chicken: { health: 100 },
  mootant: { health: 150 },
};
const createEnemy = (type, position) => {
  const config = enemyConfigs[type]
  return {
    id: nanoid(),
    type,
    position,
    ...config,
    effects: { bleeds: [] },
  };
};
export const createEnemySlice = (set, get) => ({
  // Store all enemies in a single array with a type property
  enemies: [
    // Example: { id: nanoid(), type: 'roach', position: [-2, 0.3, -14], health: 75, effects: { bleeds: [] } },
  ],

  addBleed: (enemyId, position, bulletDirection, damage = 25) => {
    let newHealth;
    set((state) => ({
      enemies: state.enemies.map((enemy) => {
        if (enemy.id === enemyId) {
          newHealth = Math.max(enemy.health - damage, -25);
          return {
            ...enemy,
            health: newHealth,
            effects: {
              ...enemy.effects,
              bleeds: [
                ...enemy.effects.bleeds,
                {
                  id: nanoid(),
                  pos: position.clone(),
                  dir: bulletDirection.clone(),
                  expiresAt: Date.now() + 3500,
                },
              ],
            },
          };
        }
        return enemy;
      }),
    }));
    return newHealth;
  },

  removeBleed: (bleedId) => set((state) => ({
    enemies: state.enemies.map((enemy) => ({
      ...enemy,
      effects: {
        ...enemy.effects,
        bleeds: enemy.effects.bleeds.filter((bleed) => bleed.id !== bleedId),
      },
    })),
  })),

  clearBleeds: () => set((state) => ({
    enemies: state.enemies.map((enemy) => ({
      ...enemy,
      effects: { ...enemy.effects, bleeds: [] },
    })),
  })),

addEnemy: (type, position) => set((state) => ({
  enemies: [...state.enemies, createEnemy(type, position)],
})),

  removeEnemy: (enemyId) => set((state) => ({
    enemies: state.enemies.filter(enemy => enemy.id !== enemyId)
  })),
  
  // Helper method to get enemies of a specific type
  getEnemiesByType: (type) => get().enemies.filter(enemy => enemy.type === type),
});