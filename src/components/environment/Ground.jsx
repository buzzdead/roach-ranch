// Ground.jsx - Let's make this absolutely reliable
import React, { useEffect } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

const Ground = () => {
  const [diffuseMap, normalMap] = useLoader(THREE.TextureLoader, [
    '/gravel_road_diff_1k.jpg', 
    '/gravel_road_nor_gl_1k.jpg'
  ], undefined, (error) => {
    console.error('Error loading textures:', error);
  });

  useEffect(() => {
    if (diffuseMap && normalMap) {
      [diffuseMap, normalMap].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
      });
    }
  }, [diffuseMap, normalMap]);

  return (
    <>
      {/* Visual ground */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          map={diffuseMap}
          normalMap={normalMap}
          normalScale={[0.5, 0.5]}
          roughness={0.8}
        />
      </mesh>

      {/* Use a direct collider instead of a RigidBody for the ground */}
      <CuboidCollider 
        position={[0, -0.5, 0]} 
        args={[100, 1, 100]} 
        sensor={false}
        friction={1}
      />

      {/* Add some debug visualization for the ground collider */}

    </>
  );
};

export default Ground;