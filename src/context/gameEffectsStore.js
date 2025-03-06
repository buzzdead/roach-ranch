// gameEffectsStore.js
import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useGameEffectsStore = create((set, get) => ({
  roaches: [
    { id: nanoid(), position: [-2, 0.3, -14], health: 75, effects: { bleeds: [] } },
    { id: nanoid(), position: [-1, 0.3, -14], health: 75, effects: { bleeds: [] } },
    { id: nanoid(), position: [-5, 0.3, -14], health: 75, effects: { bleeds: [] } },
    { id: nanoid(), position: [3, 0.3, -14], health: 75, effects: { bleeds: [] } },
  ],
  loot: {
    chitin: [
    ]
  },

  player: {
    resources: {
      chitin: 0
    }
  },

  pickupLoot: (lootId, type) => {
    const state = get();
    
    // Find the loot item
    const lootItem = state.loot[type]?.find(item => item.id === lootId);
    
    if (lootItem) {
      // Add to player resources
      set((state) => ({
        player: {
          ...state.player,
          resources: {
            ...state.player.resources,
            [type]: (state.player.resources[type] || 0) + 1
          }
        },
        // Remove the item from the world
        loot: {
          ...state.loot,
          [type]: state.loot[type].filter(item => item.id !== lootId)
        }
      }));
      
      return true;
    }
    
    return false;
  },

  // Add a bleed to a specific roach
  addBleed: (roachId, position, bulletDirection, damage = 25) => {
    let newHealth; // Variable to store the updated health
    set((state) => ({
      roaches: state.roaches.map((roach) => {
        if (roach.id === roachId) {
          newHealth = Math.max(roach.health - damage, -25); // Reduce health by 25, min 0
          return {
            ...roach,
            health: newHealth, // Update health
            effects: {
              ...roach.effects,
              bleeds: [
                ...roach.effects.bleeds,
                {
                  id: nanoid(),
                  pos: position.clone(),
                  dir: bulletDirection.clone(),
                  expiresAt: Date.now() + 3500, // Bleed lasts 3.5 seconds
                },
              ],
            },
          };
        }
        return roach;
      }),
    }));
    return newHealth; // Return the new health value
  },
  // Remove a bleed from a specific roach by bleed ID
  removeBleed: (bleedId) =>
    set((state) => ({
      roaches: state.roaches.map((roach) => ({
        ...roach,
        effects: {
          ...roach.effects,
          bleeds: roach.effects.bleeds.filter((bleed) => bleed.id !== bleedId),
        },
      })),
    })),

  // Clear all bleeds from all roaches
  clearBleeds: () =>
    set((state) => ({
      roaches: state.roaches.map((roach) => ({
        ...roach,
        effects: { ...roach.effects, bleeds: [] },
      })),
    })),

  // Add a new roach dynamically
  addRoach: (position) =>
    set((state) => ({
      roaches: [...state.roaches, { id: nanoid(), position, health: 75, effects: { bleeds: [] } }],
    })),
  removeRoach: (roachId) => 
    set((state) => ({
      roaches: state.roaches.filter(r => r.id !== roachId)
    })),
    addLoot: (type, position) => 
      set((state) => {
        // Create a new loot item
        const newLoot = {
          id: nanoid(),
          position: position.clone ? position.clone() : position, // Handle both Vector3 and array positions
          type: type, // 'chitin' or other future loot types
          model: type === 'chitin' ? 'Roach-Chitin.glb' : null, // Map type to model
          createdAt: Date.now()
        };
        
        // Add to the appropriate loot array
        return {
          loot: {
            ...state.loot,
            [type]: [...(state.loot[type] || []), newLoot]
          }
        };
      }),
    
    // Remove a specific loot item by ID
    removeLoot: (type, lootId) => 
      set((state) => ({
        loot: {
          ...state.loot,
          [type]: (state.loot[type] || []).filter(item => item.id !== lootId)
        }
      }))
}));