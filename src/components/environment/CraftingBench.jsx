import React, { useMemo, useState, useEffect } from 'react';
import { RigidBody } from '@react-three/rapier';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import { useThree } from '@react-three/fiber';
import useFrameInterval from '../../utils/useFrameInterval';
import { modelCache } from '../../utils/Preloader';
import { Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/web'; // You'll need to install this

const pickupRadius = 3.5; // How close player needs to be to pick up loot
export const CraftingBench = () => {
    const { scene } = modelCache["/crafting-bench.glb"]
    const [toggleInquire, setToggleInquire] = useState(false)
    const { camera } = useThree()
    const craftingBench = useGameEffectsStore(useShallow((state) => state.craftingBench))
    const setCraftingActive = useGameEffectsStore(useShallow((state) => state.setCraftingActive))
    const setControlsEnabled = useGameEffectsStore(useShallow((state) => state.setControlsEnabled))

    // Animation spring
    const springProps = useSpring({
        scale: toggleInquire && !craftingBench.active ? 1 : 0,
        config: {
            tension: 100,  // Lower tension (was 280)
            friction: 14,  // Lower friction value (was 18)
            mass: 1.5      // Higher mass makes it feel "heavier"
        }
    });

    const benchVector = useMemo(() => {
        return new Vector3(craftingBench.position[0], craftingBench.position[1], craftingBench.position[2])
    }, [craftingBench])

    useFrameInterval(() => {
        const playerPos = camera.userData.characterPos;
        if(!playerPos) return 
        if (playerPos.distanceTo(benchVector) <= pickupRadius && !toggleInquire)
            setToggleInquire(true)
        else if (toggleInquire && playerPos.distanceTo(benchVector) > pickupRadius) {
            setToggleInquire(false)
        }
    }, 25)

    // Listen for E key press
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key.toLowerCase() === 'e' && toggleInquire) {
                const newActiveState = !craftingBench.active;
                setCraftingActive(newActiveState);

                // Enable/disable controls
                setControlsEnabled(!newActiveState);

                // Handle pointer lock
                if (newActiveState) {
                    // Unlock cursor when opening the UI
                    if (document.pointerLockElement === document.body) {
                        document.exitPointerLock();
                    }
                } else {
                    // Lock cursor when closing the UI
                    document.body.requestPointerLock();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [toggleInquire, craftingBench.active, setCraftingActive, setControlsEnabled]);

    return (
        <RigidBody type="fixed">
            <primitive object={scene} scale={1.5} rotation={[0, Math.PI * 1.5, 0]} position={craftingBench.position} />

            <Html
                position={[
                    craftingBench.position[0],
                    craftingBench.position[1] + 1.5,
                    craftingBench.position[2]
                ]}
                center
                distanceFactor={10}
                // Only render when needed AND crafting UI is not active
                visible={toggleInquire && !craftingBench.active}
                // Add this to ensure it doesn't interfere with pointer events at all
                zIndexRange={[0, 0]}
                // Set portal to null to avoid it being rendered into an overlay
                portal={null}
            >
                <animated.div style={{
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    userSelect: 'none',
                    transform: springProps.scale.to(s => `scale(${s})`),
                    opacity: springProps.scale,
                    pointerEvents: 'none',
                    // Add position absolute to take it out of the flow
                    position: 'absolute'
                }}>
                    E
                </animated.div>
            </Html>
        </RigidBody>
    )
}