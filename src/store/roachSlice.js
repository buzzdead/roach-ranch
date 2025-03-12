
import { nanoid } from 'nanoid';

export const createRoachSlice = (set, get) => ({
  roaches: [
    //{ id: nanoid(), position: [-2, 0.3, -14], health: 75, effects: { bleeds: [] } },
  ],

  addBleed: (roachId, position, bulletDirection, damage = 25) => {
    let newHealth;
    set((state) => ({
      roaches: state.roaches.map((roach) => {
        if (roach.id === roachId) {
          newHealth = Math.max(roach.health - damage, -25);
          return {
            ...roach,
            health: newHealth,
            effects: {
              ...roach.effects,
              bleeds: [
                ...roach.effects.bleeds,
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
        return roach;
      }),
    }));
    return newHealth;
  },

  removeBleed: (bleedId) => set((state) => ({
    roaches: state.roaches.map((roach) => ({
      ...roach,
      effects: {
        ...roach.effects,
        bleeds: roach.effects.bleeds.filter((bleed) => bleed.id !== bleedId),
      },
    })),
  })),

  clearBleeds: () => set((state) => ({
    roaches: state.roaches.map((roach) => ({
      ...roach,
      effects: { ...roach.effects, bleeds: [] },
    })),
  })),

  addRoach: (position) => set((state) => ({
    roaches: [...state.roaches, { id: nanoid(), position, health: 75, effects: { bleeds: [] } }],
  })),

  removeRoach: (roachId) => set((state) => ({
    roaches: state.roaches.filter(r => r.id !== roachId)
  })),
});