
export const createPlayerSlice = (set, get) => ({
  rigidBody: null,
  player: {
    totalLoot: 0,
    maxHealth: 100,
    resources: {
      chitin: 100
    },
    effects: {
      bleeds: [] // Add this to track player bleeds
    },
    upgrades: {
      maxHealth: {
        level: 0,
        maxLevel: 3,
        cost: { chitin: 1 },
        increment: 25,  // +25 health per level
        available: true,
        displayName: "Max Health"
      }
    }
  },
  setRigidBody: (rigidBodyRef) => set(() => ({
    rigidBody: rigidBodyRef,
  })),
  takeDamage: (damage) => set(() => ({
    
  })),
  updatePlayerResource: (resourceType, amount) => {
    if (get().player.resources[resourceType]) {
      const newAmount = get().player.resources[resourceType] + amount
      if (newAmount >= 0) {
        set((state) => ({
          player: {
            ...state.player,
            resources: {
              ...state.player.resources,
              [resourceType]: newAmount
            }
          }
        }))
        return true;
      }
    }
    return false
  },

  addPlayerBleed: (position, direction, damage = 10) => {
    const { nanoid } = require('nanoid');
    set((state) => ({
      player: {
        ...state.player,
        effects: {
          ...state.player.effects,
          bleeds: [
            ...state.player.effects.bleeds,
            {
              id: nanoid(),
              pos: position.clone(),
              dir: direction.clone(),
              expiresAt: Date.now() + 3500,
            },
          ],
        }
      }
    }));
    
    // Return current health after damage for UI updates
    return get().player.maxHealth - damage;
  },

  removePlayerBleed: (bleedId) => set((state) => ({
    player: {
      ...state.player,
      effects: {
        ...state.player.effects,
        bleeds: state.player.effects.bleeds.filter((bleed) => bleed.id !== bleedId),
      },
    }
  })),

  clearPlayerBleeds: () => set((state) => ({
    player: {
      ...state.player,
      effects: { 
        ...state.player.effects, 
        bleeds: [] 
      },
    }
  })),

  pickupLoot: (lootId, type) => {
    const lootItem = get().loot[type]?.find(item => item.id === lootId);

    if (lootItem) {
      set((state) => ({
        player: {
          ...state.player,
          totalLoot: state.player.totalLoot + 1,
          resources: {
            ...state.player.resources,
            [type]: (state.player.resources[type] || 0) + 1
          }
        }
      }));

      // Call the removeLoot method from the loot slice
      get().removeLoot(type, lootId);
      return true;
    }

    return false;
  },
});