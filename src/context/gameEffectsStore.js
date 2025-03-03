// gameEffectsStore.js
import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useGameEffectsStore = create((set) => ({
  roaches: [
    { id: nanoid(), position: [-2, 0.3, -14], effects: { bleeds: [] } },
    { id: nanoid(), position: [-1, 0.3, -14], effects: { bleeds: [] } },
    { id: nanoid(), position: [-5, 0.3, -14], effects: { bleeds: [] } },
    { id: nanoid(), position: [3, 0.3, -14], effects: { bleeds: [] } },
  ],

  // Add a bleed to a specific roach
  addBleed: (roachId, position, bulletDirection) =>
    set((state) => ({
      roaches: state.roaches.map((roach) =>
        roach.id === roachId
          ? {
              ...roach,
              effects: {
                ...roach.effects,
                bleeds: [
                  ...roach.effects.bleeds,
                  {
                    id: nanoid(),
                    pos: position.clone(),
                    dir: bulletDirection.clone(),
                    expiresAt: Date.now() + 3500, // Bleed lasts 2 second
                  },
                ],
              },
            }
          : roach
      ),
    })),

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
      roaches: [...state.roaches, { id: nanoid(), position, effects: { bleeds: [] } }],
    })),
}));