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
          cost: { chitin: 5 },
          increment: 0.2,  // 20% increase per level
          available: true,
          displayName: "Firing Rate"
        }
      }
    }
    // Add more weapons later
  }
});