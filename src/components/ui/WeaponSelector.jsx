// components/ui/WeaponSelector.jsx
import React from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import './weaponSelector.css'; // You'll need to create this CSS file

const PELLET_COUNT = 10;

const WeaponSelector = () => {
  const { weapons, equipWeapon, craftingBench, player, purchaseWeapon } =
    useGameEffectsStore(
      useShallow((state) => ({
        weapons: state.weapons,
        equipWeapon: state.equipWeapon,
        craftingBench: state.craftingBench,
        player: state.player,
        purchaseWeapon: state.purchaseWeapon,
      }))
    );

  // Whether shotgun is available to purchase
  const shotgunPurchased = weapons.shotgun && weapons.shotgun.purchased;
  const shotgunPrice = 30; // Price in chitin
  const canAffordShotgun = player.resources.chitin >= shotgunPrice;

  return (
    <div className="weapon-selector-container">
      <h3>Weapons</h3>
      <div className="weapon-list">
        {/* Revolver is always available */}
        <div
          className={`weapon-item ${
            weapons.revolver.equipped ? 'equipped' : ''
          }`}
          onClick={() => equipWeapon('revolver')}
        >
          <div className="weapon-name">Revolver</div>
          <div className="weapon-stats">
            <div>
              Damage:{' '}
              {weapons.revolver.baseDamage +
                weapons.revolver.upgrades.damage.level *
                  weapons.revolver.upgrades.damage.increment}
            </div>
            <div>
              Rate:{' '}
              {(
                weapons.revolver.baseShootingSpeed *
                (1 +
                  weapons.revolver.upgrades.shootingSpeed.level *
                    weapons.revolver.upgrades.shootingSpeed.increment)
              ).toFixed(1)}
            </div>
          </div>
        </div>

        {/* Shotgun - purchasable or already owned */}
        {shotgunPurchased ? (
          <div
            className={`weapon-item ${
              weapons.shotgun.equipped ? 'equipped' : ''
            }`}
            onClick={() => equipWeapon('shotgun')}
          >
            <div className="weapon-name">Shotgun</div>
            <div className="weapon-stats">
              <div>
                Damage:{' '}
                {weapons.shotgun.baseDamage +
                  weapons.shotgun.upgrades.damage.level *
                    weapons.shotgun.upgrades.damage.increment}{' '}
                × {PELLET_COUNT}
              </div>
              <div>
                Rate:{' '}
                {(
                  weapons.shotgun.baseShootingSpeed *
                  (1 +
                    weapons.shotgun.upgrades.shootingSpeed.level *
                      weapons.shotgun.upgrades.shootingSpeed.increment)
                ).toFixed(1)}
              </div>
              <div>
                Spread:{' '}
                {weapons.shotgun.upgrades.spread.level > 0
                  ? 'Improved'
                  : 'Wide'}
              </div>
            </div>
          </div>
        ) : (
          <div
            className={`weapon-item purchasable ${
              !canAffordShotgun ? 'disabled' : ''
            }`}
          >
            <div className="weapon-name">Shotgun</div>
            <div className="weapon-description">
              A powerful scatter weapon. Great for close encounters.
            </div>
            <button
              className="purchase-button"
              disabled={!canAffordShotgun}
              onClick={() => purchaseWeapon('shotgun', shotgunPrice)}
            >
              Purchase ({shotgunPrice} Chitin)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeaponSelector;
