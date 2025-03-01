// RoachModel.jsx
import React, { forwardRef, useEffect } from 'react';
import * as THREE from 'three';

const RoachModel = forwardRef(({ originalScene, position }, ref) => {
  // Set up the base appearance
  useEffect(() => {
    originalScene.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.roughness = 1;
        child.material.metalness = 1;
        child.material.envMapIntensity = 5.5;
        
        // Base emissive properties
        child.material.emissive = new THREE.Color(0x220000);
        child.material.emissiveIntensity = 0.2;
        child.material.needsUpdate = true;
      }
    });
  }, [originalScene]);

  return (
    <primitive 
      ref={ref} 
      object={originalScene} 
      position={position} 
      scale={[1.25, 1.25, 1.25]} 
    />
  );
});

export default RoachModel;
