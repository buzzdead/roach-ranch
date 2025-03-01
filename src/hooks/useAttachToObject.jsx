// hooks/useAttachToObject.js
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

export const useAttachToObject = (targetRef, sourceObject) => {
  const position = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const lastUpdateTimeRef = useRef(0);
  
  // Use a higher priority to ensure this runs AFTER animations
  useFrame((state) => {
    if (!sourceObject || !targetRef.current) return;
    
    // Throttle updates slightly to ensure animation system has time to update
    if (state.clock.elapsedTime - lastUpdateTimeRef.current < 0.005) return;
    lastUpdateTimeRef.current = state.clock.elapsedTime;
    
    sourceObject.getWorldPosition(position);
    sourceObject.getWorldQuaternion(quaternion);
    
    targetRef.current.position.copy(position);
    targetRef.current.quaternion.copy(quaternion);
  }, 1); // Higher priority number means it runs later in the frame
};
