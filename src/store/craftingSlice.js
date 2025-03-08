export const createCraftingSlice = (set, get) => ({
  craftingBench: {
    active: false,
    position: [1.75, 1.1, 7.25],
    selectedCategory: "weapons", // Can be "weapons" or "player"
    selectedWeapon: "revolver"   // Currently selected weapon to upgrade
  },

  setCraftingActive: (active) => set((state) => ({
    craftingBench: {
      ...state.craftingBench,
      active: active,
    }
  })),

  setSelectedCategory: (category) => set((state) => ({
    craftingBench: {
      ...state.craftingBench,
      selectedCategory: category
    }
  })),

  setSelectedWeapon: (weaponType) => set((state) => ({
    craftingBench: {
      ...state.craftingBench,
      selectedWeapon: weaponType
    }
  })),

  // Universal purchase method that works for both weapons and player upgrades
  purchaseUpgrade: (upgradeType) => {
    const state = get();
    const { selectedCategory, selectedWeapon } = state.craftingBench;

    // Determine what we're upgrading
    let upgradePath;
    let upgradeObject;

    if (selectedCategory === "weapons") {
      upgradePath = `weapons.${selectedWeapon}.upgrades.${upgradeType}`;
      upgradeObject = state.weapons[selectedWeapon]?.upgrades[upgradeType];
    } else if (selectedCategory === "player") {
      upgradePath = `player.upgrades.${upgradeType}`;
      upgradeObject = state.player.upgrades[upgradeType];
    }

    // Check if valid upgrade
    if (!upgradeObject?.available) {
      return false;
    }

    // Check if maxed out
    if (upgradeObject.level >= upgradeObject.maxLevel) {
      return false;
    }

    // Check if can afford
    const cost = upgradeObject.cost.chitin;
    if (state.player.resources.chitin < cost) {
      return false;
    }

    // Perform the upgrade based on category
    if (selectedCategory === "weapons") {
      set((state) => ({
        weapons: {
          ...state.weapons,
          [selectedWeapon]: {
            ...state.weapons[selectedWeapon],
            upgrades: {
              ...state.weapons[selectedWeapon].upgrades,
              [upgradeType]: {
                ...state.weapons[selectedWeapon].upgrades[upgradeType],
                level: state.weapons[selectedWeapon].upgrades[upgradeType].level + 1
              }
            }
          }
        }
      }));
    } else if (selectedCategory === "player") {
      set((state) => ({
        player: {
          ...state.player,
          upgrades: {
            ...state.player.upgrades,
            [upgradeType]: {
              ...state.player.upgrades[upgradeType],
              level: state.player.upgrades[upgradeType].level + 1
            }
          }
        }
      }));
    }

    // Deduct resources
    get().updatePlayerResource('chitin', -cost);
    return true;
  },

  // Helper to get available upgrades for the current selection
  getAvailableUpgrades: () => {
    const state = get();
    const { selectedCategory, selectedWeapon } = state.craftingBench;

    if (selectedCategory === "weapons" && state.weapons[selectedWeapon]) {
      return state.weapons[selectedWeapon].upgrades;
    } else if (selectedCategory === "player") {
      return state.player.upgrades;
    }

    return {};
  }
});