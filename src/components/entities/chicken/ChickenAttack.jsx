// ChickenAttack.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CollisionManager from '../../../utils/CollisionManager';
import { useSoundManager } from '../../../context/SoundContext';

const ChickenAttack = ({
    originalScene,
    isAttackingRef,
    position,
    actions
}) => {
    const hasHitRef = useRef(false);
    const clawRef = useRef(null);
    const attackSound = useRef(false);
    const soundManager = useSoundManager();
    
      // Play random intro voice
      useEffect(() => {
        if (soundManager) {
    
          attackSound.current = soundManager.createSound('chickenAttack', {
            volume: 0.3,
            loop: false,
          });
        }
      }, [soundManager]);

    // Find the claw mesh on mount
    useEffect(() => {
        if (originalScene) {
            originalScene.traverse(child => {
                if (child.name === 'LeftClaw') {
                    clawRef.current = child;
                    console.log("Found claw mesh:", child);
                }
            });
        }
    }, [originalScene]);

    useFrame(() => {
        // Only check for hits when attacking and we haven't hit yet
        if (isAttackingRef.current && !hasHitRef.current && clawRef.current) {
            // Check if we're in the attack phase where the claw would make contact
            const attackInStrikePhase = actions.Attack &&
                actions.Attack.time > 0.9 && actions.Attack.time < 1.0;

            if (attackInStrikePhase) {
                // Get world position of claw
                const clawPosition = new THREE.Vector3();
                clawRef.current.getWorldPosition(clawPosition);

                // Check collision using CollisionManager
                const result = CollisionManager.checkClawPlayerCollision(clawPosition, 1);

                if (result.hit) {
                    attackSound.current.play()
                    hasHitRef.current = true;
                }

            }
        }
        // Reset hit detection when attack ends
        if (!isAttackingRef.current && hasHitRef.current) {
            hasHitRef.current = false;
        }

    });

    return null; // This component doesn't render anything
};

export default ChickenAttack;