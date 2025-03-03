import { useRef, useMemo, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';

const MutantGoo = ({ position, target, onComplete, bleeding = false }) => {
  const particlesRef = useRef();
  const splashParticlesRef = useRef();
  const particleCount = bleeding ? 100 : 150;
  const texture = useLoader(THREE.TextureLoader, './textures/goo-particle1.png');
  
  // Track ground level
  const groundY = 0; // Set this to your actual ground height
  
  // Create flying particles
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const prevPositions = new Float32Array(particleCount * 3);
    const splashed = new Float32Array(particleCount); // Add splashed flag
    
    // Initialize particles in a small cluster at the emission point
    for (let i = 0; i < particleCount; i++) {
      // Position near the starting point with slight randomness
      const px = position[0] + (Math.random() - 0.5) * 0.1;
      const py = position[1] + (Math.random() - 0.5) * 0.1;
      const pz = position[2] + (Math.random() - 0.5) * 0.1;
      
      
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      
      // Store initial positions for trail calculation
      prevPositions[i * 3] = px;
      prevPositions[i * 3 + 1] = py;
      prevPositions[i * 3 + 2] = pz;
      
      // Calculate direction toward target with some randomness
      const dirX = target[0] - position[0] + (Math.random() - bleeding ? 0.25 :  0.5) * 0.2;
      const dirY = target[1] - position[1] + (Math.random() - bleeding ? 0.25 :  0.5) * 0.2;
      const dirZ = target[2] - position[2] + (Math.random() -  bleeding ? 0.25 : 0.5) * 0.2;
      
      // Normalize and set speed
      const length = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      const speed = bleeding ? 0.085 : 0.1 + Math.random() * 0.05;

      velocities[i * 3] = (dirX / length) * speed;
      velocities[i * 3 + 1] = (dirY / length) * speed - 0.005;
      velocities[i * 3 + 2] = (dirZ / length) * speed;
      
      // Random lifetime for each particle
      lifetimes[i] = 0.7 + Math.random() * 1.8;
      
      // Varied sizes for particles
      sizes[i] = 0.2 + Math.random() * 0.5;
      
      // Vary color slightly for more organic look
      colors[i * 3] = 0.05 + Math.random() * 0.05;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.05 + Math.random() * 0.05;
      
      // Initialize as not splashed
      splashed[i] = 0;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('splashed', new THREE.BufferAttribute(splashed, 1));
    geometry.userData.prevPositions = prevPositions;
    
    return geometry;
  }, [position, target]);
  
  // Splash particles are managed as a collection of independent systems
  const splashSystems = useRef([]);
  
  // Function to create a new splash system
  // Function to create a new splash system
const createSplash = (x, y, z) => {
    const splashSize = 12;
    const splashGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(splashSize * 3);
    const lifetimes = new Float32Array(splashSize);
    const sizes = new Float32Array(splashSize);
    const colors = new Float32Array(splashSize * 3);
    
    // Remove the reference to state.clock.elapsedTime here
    
    // Create splash particles in a tight cluster
    for (let i = 0; i < splashSize; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.07;
      
      positions[i * 3] = x + Math.cos(angle) * radius;
      positions[i * 3 + 1] = y + 0.005; // Just above ground
      positions[i * 3 + 2] = z + Math.sin(angle) * radius;
      
      // Longer lifetimes for splash particles
      lifetimes[i] = 1.5 + Math.random() * 1.5;
      
      // Smaller sizes for splash particles
      sizes[i] = 0.08 + Math.random() * 0.12;
      
      // Similar colors to flying goo
      colors[i * 3] = 0.05 + Math.random() * 0.05;
      colors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
      colors[i * 3 + 2] = 0.05 + Math.random() * 0.05;
    }
    
    splashGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    splashGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    splashGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    splashGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create material
    const splashMaterial = new THREE.PointsMaterial({
      size: 0.13,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.35,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      map: texture,
      color: bleeding ? 'red' : 'green',
      depthWrite: false
    });
    
    // Create points
    const splashPoints = new THREE.Points(splashGeometry, splashMaterial);
    splashPoints.position.set(0, 0, 0);
    
    // Add to scene
    splashParticlesRef.current.add(splashPoints);
    
    // Add to managed systems with creation time (now using Date.now() instead)
    splashSystems.current.push({
      points: splashPoints,
      geometry: splashGeometry,
      creationTime: Date.now() / 1000, // Current time in seconds
      totalLifetime: 3.0 // Total time splash should exist
    });
  };
  
  // Animation loop
  useFrame((state, delta) => {
    // Update flying particles
    const positions = particles.attributes.position.array;
    const velocities = particles.attributes.velocity.array;
    const lifetimes = particles.attributes.lifetime.array;
    const sizes = particles.attributes.size.array;
    const splashed = particles.attributes.splashed.array;
    const prevPositions = particles.userData.prevPositions;
    
    let allDead = true;
    
    for (let i = 0; i < particleCount; i++) {
      // Store previous position before updating
      prevPositions[i * 3] = positions[i * 3];
      prevPositions[i * 3 + 1] = positions[i * 3 + 1];
      prevPositions[i * 3 + 2] = positions[i * 3 + 2];
      
      // Update lifetime
      lifetimes[i] -= delta;
      
      // Check if particle is about to die while still in air
      if (lifetimes[i] <= 0 && positions[i * 3 + 1] > groundY && splashed[i] === 0) {
        // Force it to live until it hits the ground
        lifetimes[i] = 0.1;
      }
      
      if (lifetimes[i] > 0) {
        allDead = false;
        
        // Update position
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Add gravity effect
        velocities[i * 3 + 1] -= 0.002; // Increased gravity
        
        // Add subtle wobbling/jiggling
        positions[i * 3] += Math.sin(state.clock.elapsedTime * 10 + i) * 0.001;
        positions[i * 3 + 2] += Math.cos(state.clock.elapsedTime * 8 + i) * 0.001;
        
        // Calculate current speed for size adjustment
        const vx = velocities[i * 3];
        const vy = velocities[i * 3 + 1];
        const vz = velocities[i * 3 + 2];
        const speed = Math.sqrt(vx*vx + vy*vy + vz*vz);
        
        // Make faster particles larger
        sizes[i] = 0.2 + speed * 3;
        
        // Limited cohesion for better performance with high particle counts
        for (let k = 0; k < 3; k++) { // Only check a few particles
          const j = Math.floor(Math.random() * particleCount);
          if (i !== j) {
            const dx = positions[j * 3] - positions[i * 3];
            const dy = positions[j * 3 + 1] - positions[i * 3 + 1];
            const dz = positions[j * 3 + 2] - positions[i * 3 + 2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            
            if (dist < 0.4) { // Smaller range
              const attractionFactor = 0.0008;
              velocities[i * 3] += (dx / dist) * attractionFactor;
              velocities[i * 3 + 1] += (dy / dist) * attractionFactor;
              velocities[i * 3 + 2] += (dz / dist) * attractionFactor;
            }
          }
        }
        
        // Check if particle crossed the ground plane this frame
        if (prevPositions[i * 3 + 1] > groundY && positions[i * 3 + 1] <= groundY && splashed[i] === 0) {
          // This particle just crossed the ground plane
          positions[i * 3 + 1] = groundY; // Place it at ground level
          splashed[i] = 1;
          
          // Create splash
          createSplash(positions[i * 3], groundY, positions[i * 3 + 2]);
        }
        // Alternative detection if particle somehow got below ground without being detected
        else if (positions[i * 3 + 1] < groundY - 0.2 && splashed[i] === 0) {
          positions[i * 3 + 1] = groundY;
          splashed[i] = 1;
          createSplash(positions[i * 3], groundY, positions[i * 3 + 2]);
        }
        
        // Fade out particles near end of life
        if (lifetimes[i] < 0.3) {
          sizes[i] *= 0.95;
        }
      }
    }
    
    // Update splash systems
    const currentTime = state.clock.elapsedTime;
    
    // Process each splash system
    for (let i = splashSystems.current.length - 1; i >= 0; i--) {
      const system = splashSystems.current[i];
      const age = currentTime - system.creationTime;
      
      // Remove expired splash systems
      if (age > system.totalLifetime) {
        splashParticlesRef.current.remove(system.points);
        system.geometry.dispose();
        splashSystems.current.splice(i, 1);
        continue;
      }
      
      // Update splash particles
      const splashPositions = system.geometry.attributes.position.array;
      const splashLifetimes = system.geometry.attributes.lifetime.array;
      const splashSizes = system.geometry.attributes.size.array;
      
      for (let j = 0; j < splashLifetimes.length; j++) {
        // Update lifetime
        splashLifetimes[j] -= delta;
        
        if (splashLifetimes[j] > 0) {
          allDead = false;
          
          // Very subtle movement
          const fadeProgress = 1 - (splashLifetimes[j] / (1.5 + Math.random() * 1.5));
          
          // Slight spreading as they fade
          if (fadeProgress < 0.7) {
            const angle = Math.atan2(
              splashPositions[j * 3 + 2] - system.points.position.z,
              splashPositions[j * 3] - system.points.position.x
            );
            
            splashPositions[j * 3] += Math.cos(angle) * 0.0001;
            splashPositions[j * 3 + 2] += Math.sin(angle) * 0.0001;
          }
          
          // Subtle wobble
          splashPositions[j * 3] += Math.sin(currentTime * 1.5 + j) * 0.0001;
          splashPositions[j * 3 + 2] += Math.cos(currentTime * 1 + j) * 0.0001;
          
          // Fade out gradually
          if (fadeProgress > 0.7) {
            splashSizes[j] *= 0.98;
          }
        }
      }
      
      // Update buffer attributes
      system.geometry.attributes.position.needsUpdate = true;
      system.geometry.attributes.lifetime.needsUpdate = true;
      system.geometry.attributes.size.needsUpdate = true;
    }
    
    // Update flying particle attributes
    particles.attributes.position.needsUpdate = true;
    particles.attributes.lifetime.needsUpdate = true;
    particles.attributes.size.needsUpdate = true;
    particles.attributes.splashed.needsUpdate = true;
    
    if (allDead) {
      onComplete();
    }
  });
  
  return (
    <>
      {/* Flying goo particles */}
      <points ref={particlesRef}>
        <primitive object={particles} attach="geometry" />
        <pointsMaterial
          attach="material"
          size={bleeding ? 0.4 : 0.13}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.75}
          vertexColors={true}
          color={bleeding ? 'red' : 'green'}
          blending={THREE.AdditiveBlending}
          map={texture}
          depthWrite={false}
        />
      </points>
      
      {/* Splash particles container */}
      <group ref={splashParticlesRef} />
    </>
  );
};

export default MutantGoo;