import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRoachAnimations } from '../../../hooks/useRoachAnimations';
import { useGameEffectsStore } from '../../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import { resetAnimation, updateAttackCooldown, getActionRefs } from '../../../utils/animationUtil';
import { useScanForPlayer } from '../../../hooks/useScanForPlaer';

const MOVE_SPEED = 1.5;
const ROTATION_SPEED = 3;
const ATTACK_DISTANCE = 5;

const RoachActions = ({
  originalScene,
  animations,
  isAnimatingRef,
  position,
  camera,
  attackCooldownRef,
  isAttackingRef,
  deadRef,
  rigidBodyRef
}) => {
  // Animation setup
  const { actions, mixer } = useRoachAnimations(originalScene, animations, isAnimatingRef);
  const waveLevel = useGameEffectsStore(useShallow((state) => state.waveLevel));

  // State refs
  const { finished, initialize, isRotatingRef, isMovingRef, targetPositionRef, targetRotationRef } = getActionRefs();
  const actionRefs = { isRotatingRef, isMovingRef, targetPositionRef, targetRotationRef };
  const enemyRefs = { deadRef, rigidBodyRef, isAttackingRef, attackCooldownRef, isAnimatingRef };

  // Player detection
  const { scanForPlayer, updateScanTimer } = useScanForPlayer({
    camera,
    position,
    attackDistance: ATTACK_DISTANCE,
    ...enemyRefs,
    ...actionRefs,
    waveLevel
  });

  // Helper functions
  const syncPositionWithRigidBody = () => {
    if (rigidBodyRef.current) {
      const translation = rigidBodyRef.current.translation();
      position[0] = translation.x;
      position[1] = translation.y;
      position[2] = translation.z;
    }
  };

  const canProcessFrame = () => {
    if (finished.current || initialize.current < 50) return false;
    return !!camera.userData.characterPos;
  };

  const getPlayerInfo = () => {
    const playerPosition = camera.userData.characterPos;
    const currentPosition = new THREE.Vector3(position[0], position[1], position[2]);
    const playerPos = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    const distance = currentPosition.distanceTo(playerPos);
    const dx = playerPosition.x - position[0];
    const dz = playerPosition.z - position[2];
    const angleToPlayer = Math.atan2(dx, dz);

    return { distance, angleToPlayer, playerPos };
  };

  const handleAnimations = () => {
    // Move animation
    if (actions.Move) {
      const shouldPlayMove = isRotatingRef.current || isMovingRef.current;
      resetAnimation(actions.Move, shouldPlayMove);
    }

    // Wings flap animation
    if (actions.WingsFlap) {
      resetAnimation(actions.WingsFlap, isAttackingRef.current);
    }

    // Death animation
   
    if (deadRef.current && actions.Fold && !finished.current) {
      console.log("dying")
      // Stop all other animations
      Object.values(actions).forEach((action) => {
        if (action && action.isRunning() && action !== actions.Fold) {
          action.stop();
        }
      });

      // Play Fold animation
      if (!actions.Fold.isRunning()) {
        actions.Fold.reset();
        actions.Fold.play();
      }
      finished.current = true;
    }
  };

  const handleRotation = (delta, isForAttack) => {
    // Get current rotation
    const currentRotation = originalScene.rotation.y;

    // Calculate the shortest path to the target rotation
    let rotationDiff = targetRotationRef.current - currentRotation;

    // Normalize angle difference to [-PI, PI]
    while (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
    while (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

    if (Math.abs(rotationDiff) > 0.05) {
      originalScene.rotation.y += rotationDiff * Math.min(ROTATION_SPEED * delta, 1);
    } else {
      // We've reached the target rotation
      isRotatingRef.current = false;

      // If this rotation was for attack, start attacking
      if (isForAttack) {
        // Stop the Move animation
        if (actions.Move && actions.Move.isRunning()) {
          actions.Move.stop();
        }

        isAttackingRef.current = true;

        // Trigger attack animation
        if (actions.IdleMotion) {
          isAnimatingRef.current = true;
          actions.IdleMotion.reset();
          actions.IdleMotion.play();
        }
      }
      // Otherwise, start moving toward target
      else if (targetPositionRef.current) {
        isMovingRef.current = true;
      }
    }
  };

  const moveTowardsTarget = (delta) => {
    if (!targetPositionRef.current || !rigidBodyRef.current) return;

    // Check if player is now in attack range (they might have moved closer)
    const playerPosition = camera.userData.characterPos;
    if (playerPosition) {
      const { distance, angleToPlayer } = getPlayerInfo();

      if (distance < ATTACK_DISTANCE && attackCooldownRef.current <= 0) {
        isMovingRef.current = false;
        targetRotationRef.current = angleToPlayer;
        isRotatingRef.current = true;
        attackCooldownRef.current = 3;
        return;
      }
    }

    // Calculate direction vector
    const direction = new THREE.Vector3(
      targetPositionRef.current.x - position[0],
      0,
      targetPositionRef.current.z - position[2]
    );

    // Calculate distance to target
    const distanceToTarget = direction.length();

    // If we're close enough to the target, stop moving
    if (distanceToTarget < 0.5) {
      isMovingRef.current = false;
      if (actions.Move && actions.Move.isRunning()) {
        actions.Move.stop();
      }
      return;
    }

    // Normalize direction and apply speed
    direction.normalize();

    // Apply impulse to rigidBody in the movement direction
    const baseImpulse = waveLevel > 5 ? 0.177 : 0.168;
    const boostMultiplier = distanceToTarget > 20 ? 1.07 : 1;
    const impulseStrength = MOVE_SPEED * baseImpulse * boostMultiplier;

    rigidBodyRef.current.applyImpulse(
      { x: direction.x * impulseStrength, y: 0, z: direction.z * impulseStrength },
      true
    );
  };

  const handleBehavior = (delta) => {
    const { distance, angleToPlayer } = getPlayerInfo();

    // Check if we should start attacking
    if (
      distance < ATTACK_DISTANCE &&
      attackCooldownRef.current <= 0 &&
      !isAttackingRef.current &&
      !isAnimatingRef.current
    ) {
      // Stop all movement
      isMovingRef.current = false;

      // Face the player before attacking
      targetRotationRef.current = angleToPlayer;
      isRotatingRef.current = true;

      // Set attack cooldown
      attackCooldownRef.current = 3;
    }
    // Handle rotation (either for attack or movement)
    else if (isRotatingRef.current) {
      handleRotation(delta, distance < ATTACK_DISTANCE);
    }
    // Move towards target if not attacking or rotating
    else if (isMovingRef.current && targetPositionRef.current &&
      !isAttackingRef.current && !isAnimatingRef.current) {
      moveTowardsTarget(delta);
    }
    // If we're not doing anything, scan for player
    else if (!isAttackingRef.current && !isAnimatingRef.current &&
      !isRotatingRef.current && !isMovingRef.current) {
      scanForPlayer(true); // Force a scan
    }
  };

  // Main update loop for roach behavior
  useFrame((state, delta) => {
    initialize.current++;
    if (!canProcessFrame()) return;

    // Update animations
    handleAnimations();

    // Update timers
    updateAttackCooldown(attackCooldownRef, delta);
    updateScanTimer(delta);

    // Sync position with physics
    syncPositionWithRigidBody();

    // Handle AI behavior
    handleBehavior(delta);

    // Update the animation mixer
    if (mixer) mixer.update(delta);
  });

  return null;
};

export default RoachActions;
