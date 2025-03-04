// PlayerModel.jsx
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export const PlayerModel = forwardRef(({ scene, camera }, ref) => {
  const localRef = useRef();
  
  useImperativeHandle(ref, () => localRef.current);
  
  useFrame(() => {
    if (!localRef.current || !camera.userData.characterPos) return;
    
    // Update model position based on physics position
    localRef.current.position.set(
      camera.userData.characterPos.x,
      camera.userData.characterPos.y - 1.5,
      camera.userData.characterPos.z
    );
    
    if (camera.userData.lastAngle !== undefined) {
      localRef.current.rotation.y = camera.userData.lastAngle;
    }
  });
  
  return (
    <primitive
      ref={localRef}
      object={scene}
      position={[0, 0, 5]}
      scale={[1, 1, 1]}
      castShadow
    />
  );
});
