import { nanoid } from 'nanoid';
export const createLootSlice = (set, get) => ({
    loot: {
      chitin: []
    },
    
    addLoot: (type, position) => set((state) => {
      const newLoot = {
        id: nanoid(),
        position: position.clone ? position.clone() : position,
        type: type,
        model: type === 'chitin' ? 'Roach-Chitin.glb' : null,
        createdAt: Date.now()
      };
      
      return {
        loot: {
          ...state.loot,
          [type]: [...(state.loot[type] || []), newLoot]
        }
      };
    }),
    
    removeLoot: (type, lootId) => set((state) => ({
      loot: {
        ...state.loot,
        [type]: (state.loot[type] || []).filter(item => item.id !== lootId)
      }
    })),
  });