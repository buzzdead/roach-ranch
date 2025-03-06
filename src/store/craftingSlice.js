export const createCraftingSlice = (set, get) => ({
    craftingBench: {
      active: false,
      position: [1.75, 1.1, 7.25],
      upgrades: {
        shootingSpeed: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 5 },
          increment: 0.2,  // 20% increase per level
          available: true
        },
        maxHealth: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 8 },
          increment: 25,  // +25 health per level
          available: true
        },
        damage: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 6 },
          increment: 5,  // +5 damage per level
          available: true
        }
      },
    },
    
    setCraftingActive: (active) => set((state) => ({
      craftingBench: {
        ...state.craftingBench,
        active: active,
      }
    })),
    
    purchase: (category, type) => {
        const state = get();
        
        if (!state.craftingBench[category]?.[type]?.available) {
          return false;
        }
    
        const cost = state.craftingBench[category][type].cost.chitin;
        
        if (state.player.resources.chitin < cost) {
          return false;
        }
    
        set((state) => ({
          craftingBench: {
            ...state.craftingBench,
            [category]: {
              ...state.craftingBench[category],
              [type]: {
                ...state.craftingBench[category][type],
                level: state.craftingBench[category][type].level + 1
              }
            }
          }
        }));

        get().updatePlayerResource('chitin', -cost);
    
        return true;
      },
    });