// Ground.jsx - Let's make this absolutely reliable
import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { CuboidCollider } from '@react-three/rapier';
import { textureCache } from '../../Preloader';

const Ground = () => {
  const [maps, setMaps] = useState({
    diffuseMap: null,
    normalMap: null,
    ready: false
  });

  useEffect(() => {
    // Get textures from cache
    const diffuseMap = textureCache['/gravel_road_diff_1k.jpg'];
    const normalMap = textureCache['/gravel_road_nor_gl_1k.jpg'];
    
    if (diffuseMap && normalMap) {
      // Apply repeat settings
      [diffuseMap, normalMap].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
      });
      
      setMaps({
        diffuseMap,
        normalMap,
        ready: true
      });
    } else {
      console.error('Ground textures not found in cache:', {
        diffuseAvailable: !!diffuseMap,
        normalAvailable: !!normalMap
      });
    }
  }, []);

  return (
    <>
      {/* Visual ground */}
      {maps.ready && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            map={maps.diffuseMap}
            normalMap={maps.normalMap}
            normalScale={[0.5, 0.5]}
            roughness={0.8}
          />
        </mesh>
      )}

      {/* Use a direct collider instead of a RigidBody for the ground */}
      <CuboidCollider 
        position={[0, -0.5, 0]} 
        args={[100, 0.5, 100]} 
        sensor={false}
        friction={1}
      />
    </>
  );
};

export default Ground;