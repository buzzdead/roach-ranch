// components/environment/RanchHouse.jsx
import React, { useMemo, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { RigidBody, CuboidCollider } from '@react-three/rapier';

const RanchHouse = ({ position = [0, 0, 0], dilapidated = true }) => {
  const houseRef = useRef();
  
  // Create procedural textures for the house
  const textures = useMemo(() => {
    // Wood planks texture for walls
    const createWoodTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Base color
      ctx.fillStyle = '#51341a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw wood planks
      const plankCount = 12;
      const plankHeight = canvas.height / plankCount;
      
      for (let i = 0; i < plankCount; i++) {
        // Vary plank color slightly
        const colorVariation = Math.random() * 20 - 10;
        const r = 81 + colorVariation;
        const g = 52 + colorVariation;
        const b = 26 + colorVariation;
        
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, i * plankHeight, canvas.width, plankHeight - 2);
        
        // Add wood grain
        ctx.strokeStyle = `rgba(0, 0, 0, 0.2)`;
        ctx.lineWidth = 1;
        
        for (let j = 0; j < 8; j++) {
          const y = i * plankHeight + Math.random() * plankHeight;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(
            canvas.width * 0.3, y + Math.random() * 10 - 5,
            canvas.width * 0.6, y + Math.random() * 10 - 5,
            canvas.width, y + Math.random() * 10 - 5
          );
          ctx.stroke();
        }
        
        // Add some nail holes and details
        ctx.fillStyle = '#3a2712';
        for (let n = 0; n < 6; n++) {
          const x = 30 + (n * 80) + Math.random() * 20;
          const y = i * plankHeight + plankHeight / 2 + Math.random() * 6 - 3;
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Add weathering if dilapidated
      if (dilapidated) {
        // Water stains
        ctx.fillStyle = 'rgba(40, 30, 20, 0.3)';
        for (let i = 0; i < 5; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const width = 30 + Math.random() * 70;
          const height = 100 + Math.random() * 200;
          
          // Create uneven streak
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(
            x - width/2, y + height/3,
            x + width/2, y + height*2/3,
            x, y + height
          );
          ctx.bezierCurveTo(
            x + width/2, y + height*2/3,
            x - width/2, y + height/3,
            x + width, y
          );
          ctx.fill();
        }
        
        // Cracks and holes
        ctx.fillStyle = '#1a1208';
        for (let i = 0; i < 8; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = 5 + Math.random() * 15;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + size, y + size/2);
          ctx.lineTo(x + size/2, y + size);
          ctx.lineTo(x - size/2, y + size/2);
          ctx.fill();
        }
      }
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // Roof shingles texture
    const createRoofTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Base color
      ctx.fillStyle = '#331a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw shingles
      const rows = 20;
      const cols = 10;
      const shingleWidth = canvas.width / cols;
      const shingleHeight = canvas.height / rows;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Offset every other row
          const offset = row % 2 === 0 ? 0 : shingleWidth / 2;
          
          // Vary shingle color
          const darken = Math.random() * 30;
          const r = Math.max(30, 51 - darken);
          const g = Math.max(10, 26 - darken);
          const b = Math.max(10, 26 - darken);
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          
          // Draw individual shingle with slight randomization
          const x = col * shingleWidth + offset;
          const y = row * shingleHeight;
          const width = shingleWidth - 2;
          const height = shingleHeight - 2;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + width, y);
          ctx.lineTo(x + width - 2, y + height);
          ctx.lineTo(x + 2, y + height);
          ctx.closePath();
          ctx.fill();
          
          // Add weathering details for dilapidated look
          if (dilapidated && Math.random() > 0.85) {
            ctx.fillStyle = '#111';
            ctx.beginPath();
            ctx.arc(x + width/2, y + height/2, 3 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      // Add moss patches for dilapidated look
      if (dilapidated) {
        for (let i = 0; i < 10; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = 10 + Math.random() * 40;
          
          // Draw moss patch
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, 'rgba(40, 80, 40, 0.6)');
          gradient.addColorStop(1, 'rgba(40, 80, 40, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // Floor texture
    const createFloorTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      // Base color
      ctx.fillStyle = '#3e3e3e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw floorboards
      const boardCount = 16;
      const boardWidth = canvas.width / boardCount;
      
      for (let i = 0; i < boardCount; i++) {
        // Vary board color
        const colorVar = Math.random() * 15;
        const color = 62 - colorVar;
        ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
        ctx.fillRect(i * boardWidth, 0, boardWidth - 1, canvas.height);
        
        // Add wood grain
        ctx.strokeStyle = `rgba(20, 20, 20, 0.2)`;
        ctx.lineWidth = 1;
        
        for (let j = 0; j < canvas.height; j += 10) {
          const x = i * boardWidth + Math.random() * 5;
          ctx.beginPath();
          ctx.moveTo(x, j);
          ctx.lineTo(x, j + 5 + Math.random() * 5);
          ctx.stroke();
        }
        
        // Add cracks and details for dilapidated look
        if (dilapidated && Math.random() > 0.7) {
          ctx.fillStyle = '#111';
          ctx.beginPath();
          ctx.moveTo(i * boardWidth + boardWidth/2, Math.random() * canvas.height);
          ctx.lineTo(i * boardWidth + boardWidth/2 + 2, Math.random() * canvas.height);
          ctx.lineTo(i * boardWidth + boardWidth/2 + 1, Math.random() * canvas.height);
          ctx.fill();
        }
      }
      
      // Add stains and wear patterns
      for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = 20 + Math.random() * 60;
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        gradient.addColorStop(0, 'rgba(20, 20, 20, 0.3)');
        gradient.addColorStop(1, 'rgba(20, 20, 20, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      return new THREE.CanvasTexture(canvas);
    };
    
    return {
      wood: createWoodTexture(),
      roof: createRoofTexture(),
      floor: createFloorTexture()
    };
  }, [dilapidated]);
  
  // Handle gentle house creaking/swaying if dilapidated
  useFrame(({ clock }) => {
    if (dilapidated && houseRef.current) {
      const time = clock.getElapsedTime();
      // Subtle random creaking movements
      houseRef.current.rotation.x = Math.sin(time * 0.1) * 0.002;
      houseRef.current.rotation.z = Math.cos(time * 0.07) * 0.003;
      
      // Occasional more pronounced movement (like from wind)
      if (Math.sin(time * 0.05) > 0.95) {
        houseRef.current.rotation.z += Math.sin(time * 2) * 0.001;
      }
    }
  });
  
  // Create windows with transparency
  const windowMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#a0c0ff',  // Slightly blue tint for glass
      metalness: 0.1,    // Reduce metalness
      roughness: 0.05,   // Make smoother
      transparent: true,
      opacity: 0.3,      // More transparent
      reflectivity: 0.5,
      transmission: 0.95, // Higher light transmission
      ior: 1.5           // Index of refraction for glass
    });
  }, []);
  
  // Apply textures to materials
  const materials = useMemo(() => {
    return {
      walls: new THREE.MeshStandardMaterial({
        map: textures.wood,
        roughness: 0.9,
        metalness: 0.1,
        bumpMap: textures.wood,
        bumpScale: 0.05,
      }),
      roof: new THREE.MeshStandardMaterial({
        map: textures.roof,
        roughness: 0.8,
        metalness: 0.2,
        bumpMap: textures.roof,
        bumpScale: 0.05,
      }),
      floor: new THREE.MeshStandardMaterial({
        map: textures.floor,
        roughness: 0.9,
        metalness: 0.1,
        bumpMap: textures.floor,
        bumpScale: 0.03,
      })
    };
  }, [textures]);

  const doorFrame = () => {
    return (
        <>
        {/* Door frame */}
        <mesh position={[0, 5, 0.025]} castShadow>
          <boxGeometry args={[2.2, 8, 0.5]} />
          <meshStandardMaterial color="#2e2216" roughness={0.9} />
        </mesh>
        
        {/* Door (slightly ajar for creepy effect) */}
        <mesh position={[-0.5, 5, 0.5]} rotation={[0, Math.PI / 12, 0]} castShadow>
          <boxGeometry args={[2, 7.5, 0.3]} />
          <meshStandardMaterial color="#1e1912" roughness={0.9} />
        </mesh>
        
        {/* Door handle */}
        <mesh position={[-1.2, 5, 0.7]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.5} />
        </mesh>
        </>
    )
  }

  return (
    <group position={position} ref={houseRef}>
      {/* Structure */}
      <group>
        {/* Front wall with door gap */}
        <mesh position={[-5.5, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 10, 0.5]} />
          <primitive object={materials.walls} attach="material" />
        </mesh>
        <mesh position={[5.5, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[9, 10, 0.5]} />
          <primitive object={materials.walls} attach="material" />
        </mesh>
        <pointLight position={[-6, 6, 8]} intensity={1.2} color="#ff6830" distance={25} decay={2} />
    <pointLight position={[6, 6, 8]} intensity={1.2} color="#ff6830" distance={25} decay={2} />
    
    {/* Porch light attached to the porch */}
    <spotLight 
      position={[0, 5, -5.5]} 
      intensity={1.5} 
      angle={0.6} 
      penumbra={0.7} 
      distance={20} 
      color="#ff9c50" 
      castShadow 
    />
    
    {/* Light coming from doorway */}
    <pointLight position={[0, 5, 0.5]} intensity={5.0} color="#ff9c50" distance={15} decay={2} />
    
    {/* Additional glow to make the house more visible from distance */}
    <pointLight position={[0, 8, 5]} intensity={0.8} color="#ff4400" distance={30} decay={1.5} />
     <RigidBody type="fixed" colliders={false}>
    {/* Front wall colliders (with door gap) */}
    <CuboidCollider args={[4.5, 5, 0.25]} position={[-5.5, 5, 0]} />
    <CuboidCollider args={[4.5, 5, 0.25]} position={[5.5, 5, 0]} />
    
    {/* Door top */}
    <CuboidCollider args={[2, 1, 0.25]} position={[0, 9, 0]} />
    
    {/* Back wall */}
    <CuboidCollider args={[10, 5, 0.25]} position={[0, 5, 10]} />
    
    {/* Side walls */}
    <CuboidCollider args={[0.25, 5, 5]} position={[-10, 5, 5]} />
    <CuboidCollider args={[0.25, 5, 5]} position={[10, 5, 5]} />
    
    {/* Floor */}
    <CuboidCollider args={[10, 0.25, 5]} position={[0, 0, 5]} />
  </RigidBody>
        {/* Back wall with windows */}
        <mesh position={[0, 5, 10]} castShadow receiveShadow>
          <boxGeometry args={[20, 10, 0.5]} />
          <primitive object={materials.walls} attach="material" />
        </mesh>
        
        {/* Windows in back wall */}
        <mesh position={[-6, 6, 9.8]} castShadow>
          <boxGeometry args={[3, 3, 0.1]} />
          <primitive object={windowMaterial} attach="material" />
        </mesh>
        <mesh position={[6, 6, 9.8]} castShadow>
          <boxGeometry args={[3, 3, 0.1]} />
          <primitive object={windowMaterial} attach="material" />
        </mesh>
        
        {/* Window frames */}
        <mesh position={[-6, 6, 9.7]}>
          <boxGeometry args={[3.3, 3.3, 0.1]} />
          <meshStandardMaterial color="#2e2216" />
        </mesh>
        <mesh position={[6, 6, 9.7]}>
          <boxGeometry args={[3.3, 3.3, 0.1]} />
          <meshStandardMaterial color="#2e2216" />
        </mesh>
        
        {/* Side walls */}
        <mesh position={[-10, 5, 5]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 10, 10]} />
          <primitive object={materials.walls} attach="material" />
        </mesh>
        <mesh position={[10, 5, 5]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 10, 10]} />
          <primitive object={materials.walls} attach="material" />
        </mesh>
        
        {/* Pitched roof instead of flat */}
        <group position={[0, 10, 5]}>
          {/* Left roof face */}
          <mesh position={[-5, 2.5, 0]} rotation={[0, 0, Math.PI / 4]} castShadow receiveShadow>
            <boxGeometry args={[14, 0.5, 20]} />
            <primitive object={materials.roof} attach="material" />
          </mesh>
          
          {/* Right roof face */}
          <mesh position={[5, 2.5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow receiveShadow>
            <boxGeometry args={[14, 0.5, 20]} />
            <primitive object={materials.roof} attach="material" />
          </mesh>
        </group>
        
        {/* Interior floor */}
        <mesh position={[0, 0, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 10]} />
          <primitive object={materials.floor} attach="material" />
        </mesh>
        
        {/* Porch */}
        <mesh position={[0, 0, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 6]} />
          <primitive object={materials.floor} attach="material" />
        </mesh>
        
        {/* Porch posts */}
        {[-8, -4, 0, 4, 8].map((x, i) => (
          <mesh key={`post-${i}`} position={[x, 2.5, -6]} castShadow>
            <cylinderGeometry args={[0.3, 0.3, 5, 8]} />
            <meshStandardMaterial color="#2e2216" roughness={0.9} />
          </mesh>
        ))}
        
        {/* Porch roof */}
        <mesh position={[0, 5.2, -3]} rotation={[-Math.PI / 6, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 0.5, 7]} />
          <primitive object={materials.roof} attach="material" />
        </mesh>
        
        {/* Door frame */}
     
        
        {/* Door (slightly ajar for creepy effect) */}
      
        {/* Door handle */}
        <mesh position={[-1.2, 5, 0.7]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.5} />
        </mesh>
      </group>
      
      {/* If dilapidated, add some weathering details */}
      {dilapidated && (
        <>
          {/* Some hanging/broken boards */}
          <mesh position={[-9, 3, 0.5]} rotation={[0, 0, Math.PI / 6]} castShadow>
            <boxGeometry args={[4, 0.5, 0.2]} />
            <primitive object={materials.walls} attach="material" />
          </mesh>
          
          <mesh position={[8, 4, 9]} rotation={[Math.PI / 12, 0, Math.PI / 12]} castShadow>
            <boxGeometry args={[4, 0.5, 0.2]} />
            <primitive object={materials.walls} attach="material" />
          </mesh>
          
          {/* Broken window */}
          <mesh position={[-6, 6, 9.75]}>
            <shapeGeometry args={[createBrokenWindowShape()]} />
            <primitive object={windowMaterial} attach="material" />
          </mesh>
          
          {/* Some debris/fragments */}
          {[...Array(8)].map((_, i) => {
            const x = (Math.random() - 0.5) * 18;
            const z = 2 + Math.random() * 8;
            return (
              <mesh 
                key={`debris-${i}`} 
                position={[x, 0.1, z]} 
                rotation={[
                  Math.random() * Math.PI, 
                  Math.random() * Math.PI, 
                  Math.random() * Math.PI
                ]}
              >
                <boxGeometry args={[0.5 + Math.random() * 0.5, 0.1, 0.5 + Math.random() * 0.5]} />
                <primitive object={materials.walls} attach="material" />
              </mesh>
            );
          })}
        </>
      )}
    </group>
  );
};

// Utility function to create a broken window shape
function createBrokenWindowShape() {
  const shape = new THREE.Shape();
  
  // Start at top left
  shape.moveTo(-1.5, 1.5);
  
  // Top edge with a break
  shape.lineTo(-0.5, 1.5);
  shape.lineTo(-0.2, 1.2);
  shape.lineTo(0.3, 1.5);
  shape.lineTo(1.5, 1.5);
  
  // Right edge with jagged break
  shape.lineTo(1.5, 0.3);
  shape.lineTo(1.2, 0.0);
  shape.lineTo(1.5, -0.3);
  shape.lineTo(1.5, -1.5);
  
  // Bottom edge
  shape.lineTo(-1.5, -1.5);
  
  // Left edge
  shape.lineTo(-1.5, 1.5);
  
  return shape;
}

export default RanchHouse;