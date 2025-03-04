// RoachModel.jsx
import React, { forwardRef, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import RoachLighting  from './RoachLighting'

const RoachModel = forwardRef(({ originalScene, position, triggerImpact, triggerJump }, ref) => {
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
    const cleanupFunctions = [];
    
    if (triggerImpact) {
      const handleImpact = (bulletDirection) => {
        if (rbRef.current) {
          const impulse = {
            x: bulletDirection?.x * 3 || 0,
            y: 5.5,
            z: bulletDirection?.z * 3 || 0
          };
          rbRef.current.applyImpulse(impulse, true);
        }
      };
      
      triggerImpact.subscribe(handleImpact);
      cleanupFunctions.push(() => triggerImpact.unsubscribe(handleImpact));
    }
  
    if (triggerJump) {
      const handleJump = () => {
        if (rbRef.current) {
          const jump = {
            x: 0,
            y: 21,
            z: 0
          };
          rbRef.current.applyImpulse(jump, true);
        }
      };
      
      triggerJump.subscribe(handleJump);
      cleanupFunctions.push(() => triggerJump.unsubscribe(handleJump));
    }
    
    return () => cleanupFunctions.forEach(cleanup => cleanup());
  }, [triggerImpact, triggerJump]);

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
