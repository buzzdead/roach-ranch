import { create } from 'zustand';

import { createEnemySlice } from './roachSlice';
import { createLootSlice } from './lootSlice';
import { createPlayerSlice } from './playerSlice';
import { createCraftingSlice } from './craftingSlice';
import { createControlsSlice } from './controlsSlice';
import { createWeaponsSlice } from './weaponSlice';

export const useGameEffectsStore = create((set, get) => ({
  ...createEnemySlice(set, get),
  ...createLootSlice(set, get),
  ...createPlayerSlice(set, get),
  ...createCraftingSlice(set, get),
  ...createControlsSlice(set, get),
  ...createWeaponsSlice(set, get)
}));