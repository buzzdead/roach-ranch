import { resetAnimation } from '../../utils/animationUtil';

export const animateEntity = (actions, entityType, refs, setTriggerKillSound) => {
  const { isAttackingRef, deadRef, isRotatingRef, isMovingRef, finished } = refs;
  
  if (entityType === 'roach') {
    // Move animation
    if (actions.Move) {
      resetAnimation(actions.Move, isRotatingRef.current || isMovingRef.current);
    }
    
    // Wings flap animation
    if (actions.WingsFlap) {
      resetAnimation(actions.WingsFlap, isAttackingRef.current);
    }
    
    // Death animation
    if (deadRef.current && actions.Fold && !finished.current) {
      Object.values(actions).forEach((action) => {
        if (action && action.isRunning() && action !== actions.Fold) {
          action.stop();
        }
      });
      
      if (!actions.Fold.isRunning()) {
        actions.Fold.reset();
        actions.Fold.play();
      }
      finished.current = true;
    }
  } 
  else if (entityType === "chicken") {
    if (actions.Walk) {
      resetAnimation(actions.Walk, isRotatingRef.current || isMovingRef.current);
    }
    
    if (actions.Attack) {
      resetAnimation(actions.Attack, isAttackingRef.current);
    }
    
    if (deadRef.current && actions.Dying && !finished.current) {
      Object.values(actions).forEach((action) => {
        if (action && action.isRunning() && action !== actions.Dying) {
          action.stop();
        }
      });

      if (!actions.Dying.isRunning()) {
        setTriggerKillSound("chicken");
        actions.Dying.reset();
        actions.Dying.play();
      }
      finished.current = true;
    }
  }
  else if (entityType === "mootant" || entityType === "warhog") {
    if (actions.Walk) {
      resetAnimation(actions.Walk, isRotatingRef.current || isMovingRef.current);
    }
    
    if (actions.Attack) {
      resetAnimation(actions.Attack, isAttackingRef.current);
    }
    
    if (deadRef.current && !finished.current) {
      Object.values(actions).forEach((action) => {
        if (action && action.isRunning()) {
          action.stop();
        }
      });
      
      if (actions.Idle) {
        actions.Idle.reset();
        actions.Idle.timeScale = 0.3;
        actions.Idle.play();
      }
      
      setTriggerKillSound("mootant");
      finished.current = true;
    }
  }
};