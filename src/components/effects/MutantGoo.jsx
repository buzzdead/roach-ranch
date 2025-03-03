import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  CONSTANTS, 
  createParticleColor, 
  calculateDirection, 
  calculateVelocity, 
  createParticleMaterial,
  calculateSpeed,
  addWobbleMovement,
  checkGroundHit
} from '../../utils/particleUtils';
import { textureCache } from '../../Preloader';

const MutantGoo = ({ position, target, onComplete, bleeding = false }) => {
  const particlesRef = useRef();
  const splashParticlesRef = useRef();
  const splashSystems = useRef([]);
  const particleCount = bleeding ? CONSTANTS.BLEEDING_PARTICLE_COUNT : CONSTANTS.NORMAL_PARTICLE_COUNT;
  const texture = textureCache['/textures/goo-particle1.png'];

  // Make sure the texture exists
  useEffect(() => {
    if (!texture) {
      console.error('Goo particle texture not found in cache');
    }
  }, [texture]);

  // Create flying particles geometry
  const particles = useMemo(() => {
    return createParticlesGeometry();
  }, [position, target]);
  
  // Particle geometry creation logic
  function createParticlesGeometry() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const prevPositions = new Float32Array(particleCount * 3);
    const splashed = new Float32Array(particleCount);
    
    // Initialize particles in a small cluster at the emission point
    for (let i = 0; i < particleCount; i++) {
      initializeParticle(i, positions, prevPositions, velocities, lifetimes, sizes, colors, splashed);
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('splashed', new THREE.BufferAttribute(splashed, 1));
    geometry.userData.prevPositions = prevPositions;
    
    return geometry;
  }
  
  // Initialize a single particle
  function initializeParticle(i, positions, prevPositions, velocities, lifetimes, sizes, colors, splashed) {
    // Position near the starting point with slight randomness
    const positionSpread = bleeding ? 0.45 : 0.1;
    const px = position[0] + (Math.random() - 0.5) * positionSpread;
    const py = position[1] + (Math.random() - 0.5) * positionSpread;
    const pz = position[2] + (Math.random() - 0.5) * positionSpread;
    
    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
    
    // Store initial positions for trail calculation
    prevPositions[i * 3] = px;
    prevPositions[i * 3 + 1] = py;
    prevPositions[i * 3 + 2] = pz;
    
    // Calculate direction toward target with some randomness
    const randomFactor = bleeding ? 0.25 : 0.5;
    const directionRandomness = bleeding ? 0.35 : 0.2;
    
    const direction = calculateDirection(position, target, randomFactor, directionRandomness);
    
    // Set speed
    const speed = bleeding ? 
      CONSTANTS.BLEEDING_SPEED + Math.random() * 0.03 : 
      CONSTANTS.NORMAL_SPEED_BASE + Math.random() * CONSTANTS.NORMAL_SPEED_RANDOM;
    
    const velocity = calculateVelocity(direction, speed);
    
    velocities[i * 3] = velocity.x;
    velocities[i * 3 + 1] = velocity.y;
    velocities[i * 3 + 2] = velocity.z;
    
    // Random lifetime for each particle
    lifetimes[i] = CONSTANTS.PARTICLE_LIFETIME_BASE + Math.random() * CONSTANTS.PARTICLE_LIFETIME_RANDOM;
    
    // Varied sizes for particles
    sizes[i] = CONSTANTS.PARTICLE_SIZE_BASE + Math.random() * CONSTANTS.PARTICLE_SIZE_RANDOM;
    
    // Vary color slightly for more organic look
    createParticleColor(i, colors);
    
    // Initialize as not splashed
    splashed[i] = 0;
  }
  
  // Create a new splash particle system
  const createSplash = (x, y, z) => {
    const splashSize = CONSTANTS.SPLASH_SIZE;
    const splashGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(splashSize * 3);
    const lifetimes = new Float32Array(splashSize);
    const sizes = new Float32Array(splashSize);
    const colors = new Float32Array(splashSize * 3);
    
    // Create splash particles in a tight cluster
    for (let i = 0; i < splashSize; i++) {
      initializeSplashParticle(i, x, y, z, positions, lifetimes, sizes, colors);
    }
    
    splashGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    splashGeometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    splashGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    splashGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create material
    const splashMaterial = createParticleMaterial(
      texture, 
      bleeding ? 'red' : 'green', 
      0.13, 
      0.35
    );
    
    // Create points
    const splashPoints = new THREE.Points(splashGeometry, splashMaterial);
    splashPoints.position.set(0, 0, 0);
    
    // Add to scene
    splashParticlesRef.current.add(splashPoints);
    
    // Add to managed systems with creation time
    splashSystems.current.push({
      points: splashPoints,
      geometry: splashGeometry,
      creationTime: Date.now() / 1000, // Current time in seconds
      totalLifetime: CONSTANTS.SPLASH_LIFETIME
    });
  };
  
  // Initialize a single splash particle
  function initializeSplashParticle(i, x, y, z, positions, lifetimes, sizes, colors) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.07;
    
    positions[i * 3] = x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = y + 0.005; // Just above ground
    positions[i * 3 + 2] = z + Math.sin(angle) * radius;
    
    // Longer lifetimes for splash particles
    lifetimes[i] = CONSTANTS.SPLASH_PARTICLE_LIFETIME_BASE + Math.random() * CONSTANTS.SPLASH_PARTICLE_LIFETIME_RANDOM;
    
    // Smaller sizes for splash particles
    sizes[i] = 0.08 + Math.random() * 0.12;
    
    // Similar colors to flying goo
    createParticleColor(i, colors);
  }
  
  // Animation loop
  useFrame((state, delta) => {
    const allDead = updateParticles(state, delta) && updateSplashSystems(state, delta);
    
    if (allDead) {
      onComplete();
    }
  });
  
  // Update flying particles
  function updateParticles(state, delta) {
    const positions = particles.attributes.position.array;
    const velocities = particles.attributes.velocity.array;
    const lifetimes = particles.attributes.lifetime.array;
    const sizes = particles.attributes.size.array;
    const splashed = particles.attributes.splashed.array;
    const prevPositions = particles.userData.prevPositions;
    
    let allDead = true;
    
    for (let i = 0; i < particleCount; i++) {
      // Store previous position before updating
      storeParticlePreviousPosition(i, positions, prevPositions);
      
      // Update lifetime
      lifetimes[i] -= delta;
      
      // Check if particle is about to die while still in air
      if (lifetimes[i] <= 0 && positions[i * 3 + 1] > CONSTANTS.GROUND_Y && splashed[i] === 0) {
        // Force it to live until it hits the ground
        lifetimes[i] = 0.1;
      }
      
      if (lifetimes[i] > 0) {
        allDead = false;
        
        // Update particle position, velocity, and size
        updateParticleMovement(i, positions, velocities, sizes, state);
        
        // Apply limited cohesion with other particles
        applyParticleCohesion(i, positions, velocities);
        
        // Check for ground collision and create splash if needed
        checkGroundCollision(i, positions, prevPositions, splashed);
        
        // Fade out particles near end of life
        if (lifetimes[i] < 0.3) {
          sizes[i] *= 0.95;
        }
      }
    }
    
    // Update buffer attributes
    particles.attributes.position.needsUpdate = true;
    particles.attributes.lifetime.needsUpdate = true;
    particles.attributes.size.needsUpdate = true;
    particles.attributes.splashed.needsUpdate = true;
    
    return allDead;
  }
  
  // Store previous position for a particle
  function storeParticlePreviousPosition(i, positions, prevPositions) {
    prevPositions[i * 3] = positions[i * 3];
    prevPositions[i * 3 + 1] = positions[i * 3 + 1];
    prevPositions[i * 3 + 2] = positions[i * 3 + 2];
  }
  
  // Update particle position, velocity, and size
  function updateParticleMovement(i, positions, velocities, sizes, state) {
    // Update position
    positions[i * 3] += velocities[i * 3];
    positions[i * 3 + 1] += velocities[i * 3 + 1];
    positions[i * 3 + 2] += velocities[i * 3 + 2];
    
    // Add gravity effect
    velocities[i * 3 + 1] -= CONSTANTS.GRAVITY;
    
    // Add more randomness to bleeding particles motion
    const wobbleAmount = bleeding ? 0.0015 : 0.001;
    addWobbleMovement(positions, i, state.clock.elapsedTime, wobbleAmount);
    
    // For bleeding particles, add a small random drift to spread them out more
    if (bleeding) {
      velocities[i * 3] += (Math.random() - 0.5) * 0.0005;
      velocities[i * 3 + 2] += (Math.random() - 0.5) * 0.0005;
    }
    
    // Calculate current speed for size adjustment
    const speed = calculateSpeed(
      velocities[i * 3], 
      velocities[i * 3 + 1], 
      velocities[i * 3 + 2]
    );
    
    // Make faster particles larger
    sizes[i] = 0.2 + speed * 3;
  }
  
  // Apply limited cohesion with other particles
  function applyParticleCohesion(i, positions, velocities) {
    for (let k = 0; k < CONSTANTS.COHESION_CHECK_COUNT; k++) {
      const j = Math.floor(Math.random() * particleCount);
      if (i !== j) {
        const dx = positions[j * 3] - positions[i * 3];
        const dy = positions[j * 3 + 1] - positions[i * 3 + 1];
        const dz = positions[j * 3 + 2] - positions[i * 3 + 2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < CONSTANTS.COHESION_RANGE) {
          velocities[i * 3] += (dx / dist) * CONSTANTS.ATTRACTION_FACTOR;
          velocities[i * 3 + 1] += (dy / dist) * CONSTANTS.ATTRACTION_FACTOR;
          velocities[i * 3 + 2] += (dz / dist) * CONSTANTS.ATTRACTION_FACTOR;
        }
      }
    }
  }
  
  // Check for ground collision and create splash
  function checkGroundCollision(i, positions, prevPositions, splashed) {
    // Check if particle crossed the ground plane this frame
    if (checkGroundHit(prevPositions[i * 3 + 1], positions[i * 3 + 1], CONSTANTS.GROUND_Y, splashed[i])) {
      // This particle just crossed the ground plane
      positions[i * 3 + 1] = CONSTANTS.GROUND_Y; // Place it at ground level
      splashed[i] = 1;
      
      // Create splash
      createSplash(positions[i * 3], CONSTANTS.GROUND_Y, positions[i * 3 + 2]);
    }
    // Alternative detection if particle somehow got below ground without being detected
    else if (positions[i * 3 + 1] < CONSTANTS.GROUND_Y - 0.2 && splashed[i] === 0) {
      positions[i * 3 + 1] = CONSTANTS.GROUND_Y;
      splashed[i] = 1;
      createSplash(positions[i * 3], CONSTANTS.GROUND_Y, positions[i * 3 + 2]);
    }
  }
  
  // Update splash particle systems
  function updateSplashSystems(state, delta) {
    const currentTime = state.clock.elapsedTime;
    let allDead = true;
    
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
      allDead = updateSplashParticles(system, delta, currentTime) && allDead;
    }
    
    return allDead;
  }
  
  // Update individual splash particles within a system
  function updateSplashParticles(system, delta, currentTime) {
    const splashPositions = system.geometry.attributes.position.array;
    const splashLifetimes = system.geometry.attributes.lifetime.array;
    const splashSizes = system.geometry.attributes.size.array;
    let allDead = true;
    
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
        addWobbleMovement(splashPositions, j, currentTime, 0.0001);
        
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
    
    return allDead;
  }
  
  return (
    <>
      {/* Flying goo particles */}
      <points ref={particlesRef}>
        <primitive object={particles} attach="geometry" />
        <pointsMaterial
          attach="material"
          size={bleeding ? 0.5 : 0.13}
          sizeAttenuation={true}
          transparent={true}
          opacity={bleeding ? 1 : 0.75}
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