// Revolver.jsx
import React, { useRef, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useAttachToObject } from '../../hooks/useAttachToObject';

// Constants for configuration
const REVOLVER_CONFIG = {
  modelPath: '/revolver.glb',
  position: [0.1, 0.20, -0.02],
  rotation: [Math.PI, Math.PI * 1.5, 0],
  scale: [0.25, 0.25, 0.25],
};

const PRIMITIVE_CONFIG = {
  position: [-0.25, -0.51, 0.2],
  rotation: [-1.2, 0, 0],
};

/**
 * Revolver component that attaches to a bone and displays a 3D revolver model
 * 
 * @param {Object} props - Component props
 * @param {THREE.Bone} props.bone - The bone to attach the revolver to
 */
export const Revolver = ({ bone }) => {
  // Load and memoize the 3D model
  const { scene } = useGLTF(REVOLVER_CONFIG.modelPath);
  const revolverScene = useMemo(() => scene.clone(), [scene]);
  
  // Create ref for the component
  const groupRef = useRef();
  
  // Custom hook to handle attachment to bone
  useAttachToObject(groupRef, bone);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      revolverScene.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      });
    };
  }, [revolverScene]);

  return (
    <group ref={groupRef}>
      <group 
        position={REVOLVER_CONFIG.position}
        rotation={REVOLVER_CONFIG.rotation}
        scale={REVOLVER_CONFIG.scale}
      >
        <primitive 
          object={revolverScene} 
          position={PRIMITIVE_CONFIG.position} 
          rotation={PRIMITIVE_CONFIG.rotation} 
        />
      </group>
    </group>
  );
};

// Preload the model for better performance
useGLTF.preload(REVOLVER_CONFIG.modelPath);
