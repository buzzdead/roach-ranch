import { useRef } from 'react'

export function resetAnimation(action, shouldPlay) {
    if (!action) {
        console.error("Action is undefined");
        return;
    }

    if (shouldPlay) {
        if (!action.isRunning()) {
            action.reset();
            action.play();
        }
    } else {
        if (action.isRunning()) {
            action.reset();
            action.stop();
        }
    }
}

/**
 * Updates the attack cooldown timer.
 * @param {React.MutableRefObject<number>} attackCooldownRef - Ref to attack cooldown time.
 * @param {number} delta - Time elapsed since last frame.
 */
export function updateAttackCooldown(attackCooldownRef, delta) {
    if (attackCooldownRef.current > 0) {
        attackCooldownRef.current -= delta;
    }
}

export const getActionRefs = () => {
      const finished = useRef(false);
      const initialize = useRef(0);
      const isRotatingRef = useRef(false);
      const isMovingRef = useRef(false);
      const targetRotationRef = useRef(0);
      const targetPositionRef = useRef(null);

      return {
          finished,
          initialize,
          isRotatingRef,
          isMovingRef,
          targetRotationRef,
          targetPositionRef
      }
}