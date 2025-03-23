// MootantModel.jsx
import React, { forwardRef, Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import useRoachDeathEffect from '../../../hooks/useRoachDeathEffect';
import { useFrame } from '@react-three/fiber';

const MootantModel = forwardRef(
  (
    {
      originalScene,
      position,
      triggerImpact,
      triggerJump,
      isDead = false,
      onDeathComplete,
      rigidBodyRef
    },
    ref
  ) => {
    const materialsRef = useRef([]);
    const meshesRef = useRef([]);

    // Store original materials and meshes on first render
    useEffect(() => {
      const materials = [];
      const meshes = [];
      originalScene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material = child.material.clone();
          child.material.metalness = 0.051;
          child.material.roughness = 0.7;
          child.material.transparent = true;
          child.material.needsUpdate = true;
          materials.push(child.material);
          meshes.push(child);
        }
      });
      materialsRef.current = materials;
      meshesRef.current = meshes;
    }, [originalScene]);

    // Use the death effect hook
    const { deathProgress } = useRoachDeathEffect({
      isDead,
      onDeathComplete,
      rbRef: rigidBodyRef,
      modelRef: ref,
      materialsRef,
      meshesRef,
      originalScene,
    });

    // Sync model position with physics body
    useEffect(() => {
      if (!originalScene || !rigidBodyRef.current) return;
      
      return () => {
        // Cleanup logic
      };
    }, [originalScene]);

    // Impact and jump handlers
    useEffect(() => {
      const cleanupFunctions = [];
      if (triggerImpact) {
        const handleImpact = (bulletDirection) => {
          if (rigidBodyRef.current) {
            const impulse = {
              x: bulletDirection?.x * 2 || 0,
              y: 1.5,
              z: bulletDirection?.z * 2 || 0,
            };
            rigidBodyRef.current.applyImpulse(impulse, true);
          }
        };
        triggerImpact.subscribe(handleImpact);
        cleanupFunctions.push(() => triggerImpact.unsubscribe(handleImpact));
      }

      if (triggerJump) {
        const handleJump = () => {
          if (rigidBodyRef.current) {
            const jump = { x: 0, y: 2.25, z: 0 };
            rigidBodyRef.current.applyImpulse(jump, true);
          }
        };
        triggerJump.subscribe(handleJump);
        cleanupFunctions.push(() => triggerJump.unsubscribe(handleJump));
      }

      return () => cleanupFunctions.forEach((cleanup) => cleanup());
    }, [triggerImpact, triggerJump]);

    // Clean up resources when component unmounts
    useEffect(() => {
      return () => {
        materialsRef.current.forEach((material) => {
          material.dispose();
        });
      };
    }, []);

    // Handle visibility based on death progress
    if (deathProgress.current > 0.99) {
      meshesRef.current.forEach((mesh) => {
        mesh.visible = false;
      });
    }

    // Sync the model position with the physics body in each frame
    useFrame(() => {
      if (rigidBodyRef.current && ref.current) {
        const translation = rigidBodyRef.current.translation();
        ref.current.position.set(translation.x, translation.y, translation.z);
      }
    });
    
    useEffect(() => {
      position[1] += 0.1
    }, []);
    
    return (
      <Suspense>
        <RigidBody
          ref={rigidBodyRef}
          position={position}
          enabledRotations={[false, true, false]}
          type="dynamic"
          mass={3} // Higher mass for a larger creature
          gravityScale={2}
          colliders={false}
          friction={0.7}
        >
          {/* Adjust collider shape/size for Mootant */}
          <CapsuleCollider args={[0.8, 1.0]} position={[0, 1.5, 0]} />
        </RigidBody>

        {/* The visual model, separate from the physics body */}
        <primitive
        scale={1.75}
          ref={ref}
          object={originalScene}
          position={position}
           // Adjust scale as needed for the mootant model
        />
      </Suspense>
    );
  }
);

export default MootantModel;