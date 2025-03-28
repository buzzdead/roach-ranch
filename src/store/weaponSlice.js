export const createWeaponsSlice = (set, get) => ({
  weapons: {
    revolver: {
      type: 'revolver',
      name: "Revolver",
      baseDamage: 20,
      baseShootingSpeed: 1.0,
      equipped: true,
      upgrades: {
        damage: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 6 },
          increment: 5,  // +5 damage per level
          available: true,
          displayName: "Damage"
        },
        shootingSpeed: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 6 },
          increment: 0.13,  // 20% increase per level
          available: true,
          displayName: "Firing Rate"
        }
      }
    },
    shotgun: {
      type: 'shotgun',
      name: "Shotgun",
      baseDamage: 15,  // Per pellet, lower than revolver but multiplied by pellet count
      baseShootingSpeed: 0.7, // Slower base rate than revolver
      equipped: false, // Initially not equipped
      upgrades: {
        damage: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 10 }, // More expensive upgrades
          increment: 4,  // +4 damage per pellet per level
          available: true,
          displayName: "Damage"
        },
        shootingSpeed: {
          level: 0,
          maxLevel: 3,
          cost: { chitin: 10 },
          increment: 0.10,  // Slightly less improvement per level than revolver
          available: true,
          displayName: "Firing Rate"
        },
        spread: {  // New upgrade type specific to shotgun
          level: 0,
          maxLevel: 2,
          cost: { chitin: 15 },
          increment: 0.2,  // Reduced spread (tighter grouping) per level
          available: true,
          displayName: "Tighter Spread"
        }
      }
    }
  },
  equipWeapon: (weaponType) => set((state) => {
    // Create new weapons object with all weapons unequipped
    const updatedWeapons = Object.entries(state.weapons).reduce((acc, [type, weapon]) => {
      acc[type] = {
        ...weapon,
        equipped: type === weaponType
      };
      return acc;
    }, {});
    
    return { weapons: updatedWeapons };
  })
})