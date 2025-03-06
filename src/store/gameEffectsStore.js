import { create } from 'zustand';

import { createRoachSlice } from './roachSlice';
import { createLootSlice } from './lootSlice';
import { createPlayerSlice } from './playerSlice';
import { createCraftingSlice } from './craftingSlice';
import { createControlsSlice } from './controlsSlice';

export const useGameEffectsStore = create((set, get) => ({
  ...createRoachSlice(set, get),
  ...createLootSlice(set, get),
  ...createPlayerSlice(set, get),
  ...createCraftingSlice(set, get),
  ...createControlsSlice(set, get),
}));