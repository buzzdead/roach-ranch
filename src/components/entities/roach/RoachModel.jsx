// RoachModel.jsx
import React, { forwardRef, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import RoachLighting  from './RoachLighting'

const RoachModel = forwardRef(({ originalScene, position, triggerJump  }, ref) => {
  // Set up the base appearance
  const rbRef = useRef()

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
  useEffect(() => {
    if (triggerJump) {
      const handleJump = () => {
        if (rbRef.current) { // Ensure the rigid body is ready
          rbRef.current.applyImpulse({ x: 0, y: 5.5, z: 0 }, true); // `true` wakes the body
        }
      };
      
      triggerJump.subscribe(handleJump);
      return () => triggerJump.unsubscribe(handleJump);
    }
  }, [triggerJump]);

  return (
    <RigidBody   enabledRotations={[false, true, false]}
    type="dynamic"
    mass={1}  // Not too heavy, not too light
    colliders={"cuboid"}
    friction={0.7} ref={rbRef}>
    <primitive 
      ref={ref} 
      object={originalScene} 
      position={position} 
      scale={[1.25, 1.25, 1.25]} 
    >
        <RoachLighting position={position} />
    </primitive>
    </RigidBody>
  );
});

export default RoachModel;
