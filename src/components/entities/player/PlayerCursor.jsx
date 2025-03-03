import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerContext } from '../../../context/PlayerContext';
import {Vector3 } from 'three'

const PlayerCursor = () => {
  const { animationState } = usePlayerContext();
  const { camera } = useThree();
  const crosshairRef = useRef();
  
  useFrame(() => {
    if (!crosshairRef.current || !animationState.aiming) return;
    
    // Position the crosshair in front of the camera
    // Calculate position in front of the camera
    const vector = new Vector3(0, 0, -1);
    vector.applyQuaternion(camera.quaternion);
    vector.multiplyScalar(2); // Distance from camera
    
    // Set the crosshair position relative to camera
    crosshairRef.current.position.copy(camera.position);
    crosshairRef.current.position.add(vector);
    
    // Make crosshair always face the camera
    crosshairRef.current.lookAt(camera.position);
  });

  if (!animationState.aiming) return null;
  
  return (
    <group ref={crosshairRef} scale={0.5}>
      {/* Horizontal line */}
      <mesh>
        <boxGeometry args={[0.1, 0.005, 0.001]} />
        <meshBasicMaterial color="lime" transparent opacity={0.9} depthTest={false} />
      </mesh>
      
      {/* Vertical line */}
      <mesh>
        <boxGeometry args={[0.005, 0.1, 0.001]} />
        <meshBasicMaterial color="lime" transparent opacity={0.9} depthTest={false} />
      </mesh>
      
      {/* Optional: Small dot in center */}
      <mesh>
        <circleGeometry args={[0.005, 16]} />
        <meshBasicMaterial color="white" transparent opacity={0.9} depthTest={false} />
      </mesh>
    </group>
  );
};

export default PlayerCursor;