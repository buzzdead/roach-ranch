import { nanoid } from 'nanoid';

const LootTypeMap = {
  chitin: '/chitin.glb',
  talon: '/chicken-talon.glb',
  tail: '/cow-tail.glb',
  meat: '/warhog-meat.glb'
}
export const createLootSlice = (set, get) => ({
  loot: {
    chitin: [],
    talon: [],
    tail: [],
    meat: []
  },

  addLoot: (type, position) => set((state) => {
    const newLoot = {
      id: nanoid(),
      position: position.clone ? position.clone() : position,
      type: type,
      model: LootTypeMap[type],
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