import React, { memo, useRef } from 'react';
import { useGameEffectsStore } from './context/gameEffectsStore';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial, Color } from 'three';
import { Html } from '@react-three/drei';
import { useShallow } from 'zustand/shallow';
import { modelCache } from './Preloader';

const LootItem = memo(({ id, position, type }) => {
    const { scene } = modelCache['/Roach-Chitin.glb'];
    const removeLoot = useGameEffectsStore(useShallow((state) => state.removeLoot));
    const itemRef = useRef();
    const glowRef = useRef()
    const time = useRef(0);
  
    // Clone the scene with enhanced material
    const clonedScene = React.useMemo(() => {
      const clone = scene.clone();
      
      clone.traverse((child) => {
        if (child.isMesh) {
          // Create a material that's visually striking but doesn't require a light
          child.material = new MeshStandardMaterial({
            color: new Color(0xddf2ff),
            metalness: 0.5,
            roughness: 0.5,
            emissive: new Color("#1B03A3"),
            emissiveIntensity: 0.25, // Using emissive to create a glow without lights
          });
        }
      });
      
      return clone;
    }, [scene]);
  
    // Animation effect
    useFrame((state, delta) => {
      if (itemRef.current) {
        time.current += delta;
        itemRef.current.position.y = position[1] + Math.sin(time.current * 2) * 0.1;
        itemRef.current.rotation.y += delta * 0.8;
        
        // Pulse the emissive intensity for a glow effect without using lights
        clonedScene.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.emissiveIntensity = 0.15 + Math.sin(time.current * 3) * 0.1;
          }
        });
      }
    });
  
    return (
      <group position={position}>
        <group ref={itemRef}>
          <primitive 
            object={clonedScene}
            scale={1}
            onClick={() => removeLoot(type, id)}
          />
          
          {/* Keep the label for clear identification */}
          <Html
            position={[0, 0.7, 0]}
            center
            distanceFactor={10}
          >
            <div style={{
              background: 'rgba(0,0,0,0.7)',
              padding: '3px 6px',
              borderRadius: '3px',
              color: '#fff',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              fontFamily: 'Arial',
              textTransform: 'uppercase',
              pointerEvents: 'none'
            }}>
              {type}
            </div>
          </Html>
        </group>
        
        {/* Optional: Add a simple circular sprite instead of 3D plane + light */}
        <mesh 
  ref={glowRef}
  rotation={[-Math.PI / 2, 0, 0]} 
  position={[0, 0.1, 0]}
>
  <planeGeometry args={[1.5, 1.5]} />
  <shaderMaterial
    transparent
    depthWrite={false}
    uniforms={{
      color: { value: new Color(0x4d88ff) },
      time: { value: 0 }
    }}
    vertexShader={`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `}
    fragmentShader={`
      uniform vec3 color;
      uniform float time;
      varying vec2 vUv;
      void main() {
        float dist = distance(vUv, vec2(0.5, 0.5));
        float alpha = smoothstep(0.5, 0.0, dist);
        gl_FragColor = vec4(color, alpha * (0.4 + sin(time * 2.5) * 0.1));
      }
    `}
    onUpdate={(material) => {
      material.uniforms.time.value = time.current;
    }}
  />
</mesh>
      </group>
    );
  });

const Loot = () => {
  // Get all loot types from the store
  const loot = useGameEffectsStore(
    useShallow((state) => state.loot)
  );

  return (
    <>
      {/* Render chitin loot */}
      {loot.chitin?.map((item) => (
        <LootItem
          key={item.id}
          id={item.id}
          position={item.position}
          type="chitin"
          model="Roach-Chitin.glb"
        />
      ))}
      
      {/* Add other loot types here as you expand your game */}
    </>
  );
};

export default React.memo(Loot);