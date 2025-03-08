
export const createPlayerSlice = (set, get) => ({
  rigidBody: null,
  player: {
    baseHealth: 100,
    resources: {
      chitin: 12
    },
    upgrades: {
      maxHealth: {
        level: 0,
        maxLevel: 3,
        cost: { chitin: 8 },
        increment: 25,  // +25 health per level
        available: true,
        displayName: "Max Health"
      }
    }
  },
  setRigidBody: (rigidBodyRef) => set(() => ({
    rigidBody: rigidBodyRef,
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

  pickupLoot: (lootId, type) => {
    const lootItem = get().loot[type]?.find(item => item.id === lootId);

    if (lootItem) {
      set((state) => ({
        player: {
          ...state.player,
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