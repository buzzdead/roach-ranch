// RoachModel.jsx
import React, { forwardRef, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RigidBody } from '@react-three/rapier';
import RoachLighting from './RoachLighting';
import useRoachDeathEffect from '../../../hooks/useRoachDeathEffect';

const RoachModel = forwardRef(
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
          child.material.metalness = 0.051; // Makes it slightly reflective
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
      modelRef: ref, // Renamed for clarity
      materialsRef,
      meshesRef,
      originalScene,
    });

    // Impact and jump handlers
    useEffect(() => {
      const cleanupFunctions = [];
      if (triggerImpact) {
        const handleImpact = (bulletDirection) => {
          if (rigidBodyRef.current) {
            const impulse = {
              x: bulletDirection?.x * 3 || 0,
              y: 5.5,
              z: bulletDirection?.z * 3 || 0,
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
            const jump = { x: 0, y: 21, z: 0 };
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

    // If almost fully faded out, make meshes invisible
    if (deathProgress.current > 0.99) {
      meshesRef.current.forEach((mesh) => {
        mesh.visible = false;
      });
    }

    return (
      <RigidBody
        enabledRotations={[true, true, true]}
        type="dynamic"
        mass={1}
        colliders="cuboid"
        friction={0.7}
        ref={rigidBodyRef}
      >
        <primitive
          ref={ref}
          object={originalScene}
          position={position}
          scale={[1.25, 1.25, 1.25]}
        />
      </RigidBody>
    );
  }
);

export default RoachModel;
