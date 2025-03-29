import { create } from 'zustand';

import { createCraftingSlice } from './craftingSlice';
import { createEnemySlice } from './enemySlice';
import { createLootSlice } from './lootSlice';
import { createPlayerSlice } from './playerSlice';
import { createSettingSlice } from './settingSlice';
import { createWeaponsSlice } from './weaponSlice';

export const useGameStore = create((set, get) => ({
  ...createEnemySlice(set, get),
  ...createLootSlice(set, get),
  ...createPlayerSlice(set, get),
  ...createCraftingSlice(set, get),
  ...createSettingSlice(set, get),
  ...createWeaponsSlice(set, get)
}));