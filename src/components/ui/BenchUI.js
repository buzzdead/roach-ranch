// components/ui/CraftingBenchUI.jsx
import React, { useEffect } from 'react';
import './craftingBench.css'
import { useShallow } from 'zustand/shallow';
import { useGameEffectsStore } from '../../store/gameEffectsStore';

export const CraftingBenchUI = () => {
    const {
        craftingBench,
        setCraftingActive,
        purchase,
        player: { resources: { chitin: playerChitin } }
    } = useGameEffectsStore(
        useShallow(state => ({
            craftingBench: state.craftingBench,
            setCraftingActive: state.setCraftingActive,
            purchase: state.purchase,
            player: state.player
        }))
    );

    const handleSetControls = () => {
        useGameEffectsStore.getState().setControlsEnabled(true);
        setCraftingActive(false);
        // Re-lock pointer
        document.body.requestPointerLock();
    }

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && craftingBench.active) {
                e.preventDefault()
                e.stopPropagation(); // Stop the event from bubbling up
                setTimeout(() => handleSetControls(), 150)
                return false
            }
        };

        window.addEventListener('keydown', handleEscape, { capture: true }); // Use capture phase
        return () => window.removeEventListener('keydown', handleEscape, { capture: true });
    }, [setCraftingActive, craftingBench.active]);

    if (!craftingBench.active) return null;

    const handlePurchase = (type) => {
        const success = purchase('upgrades', type);
        if (success) {
            // Maybe play a sound or show a success indicator
            console.log(`Purchased ${type} upgrade`);
        } else {
            // Maybe play a failure sound
            console.log(`Failed to purchase ${type} upgrade`);
        }
    };

    return (
        <div className="crafting-bench-ui">
            <div className="crafting-panel">
                <div className="crafting-header">
                    <h2>Crafting Bench</h2>
                    <div className="resource-display">
                        <span>Available Chitin:</span> {playerChitin}
                    </div>
                </div>

                <div className="upgrades-list">
                    {Object.entries(craftingBench.upgrades).map(([upgradeKey, upgrade]) => (
                        <div key={upgradeKey} className="upgrade-item">
                            <div className="upgrade-info">
                                <div className="upgrade-name">{upgradeKey.replace(/([A-Z])/g, ' $1')}</div>
                                <div className="upgrade-level">Level: {upgrade.level}/{upgrade.maxLevel}</div>
                            </div>
                            <div className="upgrade-action">
                                <div className="upgrade-cost">Cost: {upgrade.cost.chitin} chitin</div>
                                <button
                                    onClick={() => handlePurchase(upgradeKey)}
                                    disabled={upgrade.level >= upgrade.maxLevel || playerChitin < upgrade.cost.chitin}
                                    className={upgrade.level >= upgrade.maxLevel || playerChitin < upgrade.cost.chitin ? "btn-disabled" : "btn-upgrade"}
                                >
                                    {upgrade.level >= upgrade.maxLevel ? 'Max Level' : 'Upgrade'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="close-btn"
                    onClick={handleSetControls}
                >
                    Close
                </button>
            </div>
        </div>
    );
};