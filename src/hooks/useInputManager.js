// hooks/useInputManager.js
import { useEffect, useRef } from 'react';
import { usePlayerContext } from '../context/PlayerContext';

export const useInputManager = () => {
  const { setAnimationState } = usePlayerContext();
  const inputState = useRef({
    movement: { forward: 0, backward: 0, left: 0, right: 0 },
    actions: { jump: false, aim: false, fire: false },
    rotation: { x: 3.15, y: -0.3 },
    fireCount: 0 // Counter for firing events
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (document.pointerLockElement === document.body) {
        inputState.current.rotation.x -= e.movementX * 0.002;
        inputState.current.rotation.y = Math.max(
          -Math.PI / 4.5,
          Math.min(Math.PI / 4.5, inputState.current.rotation.y - e.movementY * 0.002)
        );
      }
    };

    const handleMouseDown = (e) => {
      // Right mouse button (button 2) for aiming
      if (e.button === 2) {
        inputState.current.actions.aim = true;
        setAnimationState(prev => ({ ...prev, aiming: true }));
      }
      // Left mouse button (button 0) for firing
      if (e.button === 0 && inputState.current.actions.aim) {
        inputState.current.actions.fire = true;
        inputState.current.fireCount++; // Increment fire counter
        setAnimationState(prev => ({ 
          ...prev, 
          firing: true,
          fireCount: inputState.current.fireCount 
        }));
        
        // Reset firing state after animation would complete
        setTimeout(() => {
          inputState.current.actions.fire = false;
          setAnimationState(prev => ({ ...prev, firing: false }));
        }, 300); // Duration of fire animation
      }
    };

    const handleMouseUp = (e) => {
      if (e.button === 2) {
        inputState.current.actions.aim = false;
        setAnimationState(prev => ({ ...prev, aiming: false }));
      }
    };

    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': inputState.current.movement.forward = 1; break;
        case 'KeyS': inputState.current.movement.backward = 1; break;
        case 'KeyA': inputState.current.movement.right = 1; break;
        case 'KeyD': inputState.current.movement.left = 1; break;
        case 'KeyQ': 
        case 'Space':
          inputState.current.actions.jump = true;
          setAnimationState(prev => ({ ...prev, jumping: true }));
          setTimeout(() => {
            setAnimationState(prev => ({ ...prev, jumping: false }));
            inputState.current.actions.jump = false;
          }, 1000);
          break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': inputState.current.movement.forward = 0; break;
        case 'KeyS': inputState.current.movement.backward = 0; break;
        case 'KeyA': inputState.current.movement.right = 0; break;
        case 'KeyD': inputState.current.movement.left = 0; break;
        default: break;
      }
    };

    const handleClick = () => document.body.requestPointerLock();
    
    const handleContextMenu = (e) => e.preventDefault();

    // Add event listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      // Remove event listeners
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setAnimationState]);

  return inputState;
};