// WarhogAttack.jsx
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../../../store/gameStore';
import CollisionManager from '../../../utils/CollisionManager';

const WarhogAttack = ({
  position,
  camera,
  isAttackingRef,
  onAttackComplete,
  handleJump,
  modelRef,
}) => {
  const [attackActive, setAttackActive] = useState(false);
  const jumpTriggeredRef = useRef(false);
  const attackTimeoutRef = useRef(null);
  const attackProgress = useRef(0);
  const damageDealt = useRef(false);

  const rigidBody = useGameStore(useShallow((state) => state.rigidBody));

  useEffect(() => {
    return () => {
      if (attackTimeoutRef.current) {
        clearTimeout(attackTimeoutRef.current);
      }
    };
  }, []);

  useFrame((_, delta) => {
    // Start attack
    if (isAttackingRef.current && !attackActive && !jumpTriggeredRef.current) {
      jumpTriggeredRef.current = true;
      setAttackActive(true);
      attackProgress.current = 0;
      damageDealt.current = false;

      // Trigger jump/charge animation
      handleJump.trigger();
    }

    // Handle active attack
    if (attackActive) {
      attackProgress.current += delta * 0.8; // Faster than mootant

      // Check for player collision during attack window
      if (
        !damageDealt.current &&
        attackProgress.current > 0.4 &&
        attackProgress.current < 0.7
      ) {
        if (camera.userData.characterPos && modelRef.current) {
          const playerPos = new THREE.Vector3(
            camera.userData.characterPos.x,
            camera.userData.characterPos.y,
            camera.userData.characterPos.z
          );

          const warhogPos = new THREE.Vector3(
            modelRef.current.position.x,
            modelRef.current.position.y,
            modelRef.current.position.z
          );

          const distanceToPlayer = warhogPos.distanceTo(playerPos);

          // Deal damage if close enough
          if (distanceToPlayer < 2.5) {
            !damageDealt.current && CollisionManager.justDealDamageToPlayer();
            damageDealt.current = true;

            if (rigidBody && rigidBody.current) {
              // Calculate knockback direction
              const knockbackDir = new THREE.Vector3()
                .subVectors(playerPos, warhogPos)
                .normalize();

              // Apply stronger horizontal knockback
              rigidBody.current.applyImpulse(
                {
                  x: knockbackDir.x * 15,
                  y: 2, // Less vertical than mootant
                  z: knockbackDir.z * 15,
                },
                true
              );
            }
          }
        }
      }

      // End attack
      if (attackProgress.current >= 1.0) {
        setAttackActive(false);
        isAttackingRef.current = false;
        jumpTriggeredRef.current = false;
        onAttackComplete();
      }
    }
  });

  return null;
};

export default WarhogAttack;
