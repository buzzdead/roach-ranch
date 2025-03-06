
export const createPlayerSlice = (set, get) => ({
    player: {
      resources: {
        chitin: 0
      }
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