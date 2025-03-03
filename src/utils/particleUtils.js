import * as THREE from 'three';

// Constants
export const CONSTANTS = {
  GRAVITY: 0.002,
  GROUND_Y: 0, // Default ground level
  
  // Flying particles
  PARTICLE_LIFETIME_BASE: 0.7,
  PARTICLE_LIFETIME_RANDOM: 1.8,
  PARTICLE_SIZE_BASE: 0.2,
  PARTICLE_SIZE_RANDOM: 0.5,
  
  // Bleeding specific
  BLEEDING_PARTICLE_COUNT: 150,
  NORMAL_PARTICLE_COUNT: 150,
  BLEEDING_SPEED: 0.085,
  BLEEDING_SPEED_RADOM: 0.02,
  NORMAL_SPEED_BASE: 0.1,
  NORMAL_SPEED_RANDOM: 0.05,
  
  // Splash particles
  SPLASH_SIZE: 12,
  SPLASH_LIFETIME: 3.0,
  SPLASH_PARTICLE_LIFETIME_BASE: 1.5,
  SPLASH_PARTICLE_LIFETIME_RANDOM: 1.5,
  
  // Cohesion
  ATTRACTION_FACTOR: 0.0008,
  COHESION_RANGE: 0.4,
  COHESION_CHECK_COUNT: 3
};

// Create particle color
export function createParticleColor(index, colors) {
  colors[index * 3] = 0.05 + Math.random() * 0.05;
  colors[index * 3 + 1] = 0.5 + Math.random() * 0.2;
  colors[index * 3 + 2] = 0.05 + Math.random() * 0.05;
}

// Calculate particle direction with randomness
export function calculateDirection(position, target, randomFactor, randomnessAmount) {
  return {
    x: target[0] - position[0] + (Math.random() - randomFactor) * randomnessAmount,
    y: target[1] - position[1] + (Math.random() - randomFactor) * randomnessAmount,
    z: target[2] - position[2] + (Math.random() - randomFactor) * randomnessAmount
  };
}

// Calculate normalized velocity
export function calculateVelocity(direction, speed) {
  const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y + direction.z * direction.z);
  return {
    x: (direction.x / length) * speed,
    y: (direction.y / length) * speed - 0.005,
    z: (direction.z / length) * speed
  };
}

// Create material for particles
export function createParticleMaterial(texture, color, size, opacity = 0.75) {
  return new THREE.PointsMaterial({
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    vertexColors: true,
    color,
    blending: THREE.AdditiveBlending,
    map: texture,
    depthWrite: false
  });
}

// Calculate particle speed
export function calculateSpeed(vx, vy, vz) {
  return Math.sqrt(vx*vx + vy*vy + vz*vz);
}

// Add wobble movement to particle
export function addWobbleMovement(positions, index, elapsedTime, amount) {
  positions[index * 3] += Math.sin(elapsedTime * 10 + index) * amount;
  positions[index * 3 + 2] += Math.cos(elapsedTime * 8 + index) * amount;
}

// Check if particle hit ground
export function checkGroundHit(prevY, currentY, groundY, splashed) {
  return prevY > groundY && currentY <= groundY && splashed === 0;
}