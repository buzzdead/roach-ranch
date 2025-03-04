// gameEffectsStore.js
import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useGameEffectsStore = create((set) => ({
  roaches: [
    { id: nanoid(), position: [-2, 0.3, -14], health: 75, effects: { bleeds: [] } },
    { id: nanoid(), position: [-1, 0.3, -14], health: 75, effects: { bleeds: [] } },
    { id: nanoid(), position: [-5, 0.3, -14], health: 75, effects: { bleeds: [] } },
    { id: nanoid(), position: [3, 0.3, -14], health: 75, effects: { bleeds: [] } },
  ],

  // Add a bleed to a specific roach
  addBleed: (roachId, position, bulletDirection, damage = 25) => {
    let newHealth; // Variable to store the updated health
    set((state) => ({
      roaches: state.roaches.map((roach) => {
        if (roach.id === roachId) {
          newHealth = Math.max(roach.health - damage, 0); // Reduce health by 25, min 0
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
}));