// components/entities/Tree.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Tree = ({ position, height = 10, trunkRadius = 0.5, foliageSize = 3.5, type = 'normal', scale = 1 }) => {
  const treeRef = useRef();
  const foliageGroupRef = useRef();
  
  // Create bark texture with lighter colors
  const barkTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Lighter base brown color
    ctx.fillStyle = '#6B4423';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Bark patterns
    ctx.fillStyle = '#583919';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = 2 + Math.random() * 8;
      const height = 10 + Math.random() * 30;
      ctx.fillRect(x, y, width, height);
    }
    
    // Highlights for better visibility
    ctx.fillStyle = '#8B5A2B';
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const width = 1 + Math.random() * 3;
      const height = 5 + Math.random() * 20;
      ctx.fillRect(x, y, width, height);
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);
  
  // Foliage material with emissive properties for better visibility
  const foliageMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a6b29',
      roughness: 0.8,
      metalness: 0.1,
      emissive: '#0e3b15', // Add emissive for better visibility in dark scenes
      emissiveIntensity: 0.3,
      flatShading: true,
    });
  }, []);
  
  // Generate random foliage placement for a more natural look
  const foliageClusters = useMemo(() => {
    const clusters = [];
    const clusterCount = type === 'dense' ? 12 : 8;
    
    // Main central cluster
    clusters.push({
      position: [0, height, 0],
      scale: [foliageSize * 1.2, foliageSize, foliageSize * 1.2],
      rotation: [0, Math.random() * Math.PI, 0]
    });
    
    // Additional clusters
    for (let i = 0; i < clusterCount; i++) {
      const angle = (i / clusterCount) * Math.PI * 2;
      const radiusVariation = 0.5 + Math.random() * 0.5;
      const heightVariation = 0.7 + Math.random() * 0.6;
      
      clusters.push({
        position: [
          Math.sin(angle) * foliageSize * 0.6 * radiusVariation,
          height * heightVariation,
          Math.cos(angle) * foliageSize * 0.6 * radiusVariation
        ],
        scale: [
          foliageSize * (0.5 + Math.random() * 0.5),
          foliageSize * (0.5 + Math.random() * 0.5),
          foliageSize * (0.5 + Math.random() * 0.5)
        ],
        rotation: [
          Math.random() * 0.3,
          Math.random() * Math.PI * 2,
          Math.random() * 0.3
        ]
      });
    }
    
    return clusters;
  }, [height, foliageSize, type]);
  
  // Animate the foliage
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    // Subtle whole tree sway
    if (treeRef.current) {
      treeRef.current.rotation.x = Math.sin(time * 0.15) * 0.01;
      treeRef.current.rotation.z = Math.cos(time * 0.1) * 0.01;
    }
    
    // More dynamic foliage movement
    if (foliageGroupRef.current) {
      foliageGroupRef.current.children.forEach((cluster, i) => {
        // Each cluster moves slightly differently
        const offset = i * 0.1;
        const speedFactor = 0.2 + (i % 3) * 0.1;
        
        cluster.rotation.x = Math.sin(time * speedFactor + offset) * 0.03;
        cluster.rotation.y = Math.sin(time * speedFactor * 0.7 + offset) * 0.02;
        cluster.rotation.z = Math.cos(time * speedFactor * 0.5 + offset) * 0.03;
        
        // Subtle scale pulsing for "breathing" effect
        const scalePulse = Math.sin(time * 0.3 + i) * 0.02 + 1;
        cluster.scale.x = cluster.userData.originalScale[0] * scalePulse;
        cluster.scale.y = cluster.userData.originalScale[1] * scalePulse;
        cluster.scale.z = cluster.userData.originalScale[2] * scalePulse;
      });
    }
  });

  return (
    <group position={position} scale={scale}>
      <group ref={treeRef}>
        {/* Trunk - with lighter material and emission */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[trunkRadius * 0.8, trunkRadius, height, 8]} />
          <meshStandardMaterial 
            map={barkTexture} 
            roughness={0.9}
            color="#6B4423"
            emissive="#3b2507"
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Randomly generated branches */}
        {[...Array(5)].map((_, i) => {
          const angle = (i / 5) * Math.PI * 2;
          const branchHeight = height * (0.3 + Math.random() * 0.5);
          const branchLength = trunkRadius * (3 + Math.random() * 2);
          const branchAngle = Math.random() * 0.3 + 0.3;
          
          return (
            <mesh 
              key={`branch-${i}`}
              position={[0, branchHeight, 0]}
              rotation={[0, angle, branchAngle]}
              castShadow
            >
              <cylinderGeometry 
                args={[trunkRadius * 0.25, trunkRadius * 0.4, branchLength, 6]} 
                rotation={[0, 0, Math.PI / 2]}
                translate={[branchLength/2, 0, 0]}
              />
              <meshStandardMaterial 
                map={barkTexture} 
                roughness={0.9} 
                color="#6B4423"
                emissive="#3b2507"
                emissiveIntensity={0.2}
              />
            </mesh>
          );
        })}
        
        {/* Foliage clusters for more natural shape */}
        <group ref={foliageGroupRef}>
          {foliageClusters.map((cluster, i) => {
            // Use different geometries for variety
            const GeometryComponent = i % 3 === 0 
              ? THREE.DodecahedronGeometry 
              : i % 3 === 1 
                ? THREE.IcosahedronGeometry 
                : THREE.SphereGeometry;
            
            const detail = i % 3 === 0 ? 1 : i % 3 === 1 ? 1 : 8;
            
            return (
              <mesh
                key={`foliage-${i}`}
                position={cluster.position}
                rotation={cluster.rotation}
                scale={cluster.scale}
                castShadow
                userData={{ originalScale: [...cluster.scale] }}
              >
                <primitive 
                  object={new GeometryComponent(1, detail)} 
                  attach="geometry" 
                />
                <meshStandardMaterial 
                  color={i % 2 === 0 ? '#1a6b29' : '#0e5a1c'}
                  roughness={0.8}
                  metalness={0.1}
                  emissive={i % 2 === 0 ? '#0e3b15' : '#0e2e10'}
                  emissiveIntensity={0.4}
                  flatShading={true}
                />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
};

export default Tree;