import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import CollisionManager from '../../../utils/CollisionManager';

export const PlayerModel = forwardRef(({ scene, camera, showHitbox = false }, ref) => {
  const localRef = useRef();
  const coneHelperRef = useRef();
  
  useImperativeHandle(ref, () => localRef.current);
  
  useEffect(() => {
    if (localRef.current && showHitbox) {
      // Create cone frustum geometry
      const coneHeight = 1.7;
      const topRadius = 0.3;
      const bottomRadius = 0.3;
      
      // Create a custom geometry for the cone frustum
      const geometry = new THREE.CylinderGeometry(bottomRadius, topRadius, coneHeight, 16);
      geometry.rotateX(Math.PI); // Flip to match your collision calculation
      
      // Create mesh for the cone
      const material = new THREE.MeshBasicMaterial({ 
        color: 0xff0000, 
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });
      
      const coneMesh = new THREE.Mesh(geometry, material);
      
      // Position the cone relative to the player (center offset)
      coneMesh.position.y = 1.75 - coneHeight/2;
      
      // Create a helper group to manage the cone position
      const helper = new THREE.Group();
      helper.add(coneMesh);
      coneHelperRef.current = helper;
      
      // Add to scene
      scene.parent?.add(helper);
      
      return () => {
        scene.parent?.remove(helper);
      };
    }
  }, [scene, showHitbox]);
  
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
    
    // Update cone helper position to follow the player
    if (coneHelperRef.current) {
      coneHelperRef.current.position.copy(localRef.current.position);
      coneHelperRef.current.rotation.y = localRef.current.rotation.y;
    }
  });

  useEffect(() => {
    if(localRef.current)
      CollisionManager.registerPlayer(localRef);
      
    return () => {
      // Cleanup when component unmounts
      CollisionManager.unregisterPlayer && CollisionManager.unregisterPlayer();
    };
  }, [localRef]);
  
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