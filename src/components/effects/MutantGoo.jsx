import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import CollisionManager from '../../utils/CollisionManager';
import {
  addWobbleMovement,
  calculateDirection,
  calculateSpeed,
  calculateVelocity,
  checkGroundHit,
  CONSTANTS,
  createParticleColor,
  createParticleMaterial,
} from '../../utils/particleUtils';
import { textureCache } from '../../utils/Preloader';

const MutantGoo = ({ position, target, onComplete, bleeding = false }) => {
  const particlesRef = useRef();
  const splashParticlesRef = useRef();
  const splashSystems = useRef([]);
  const splashPool = useRef(null); // Initialize as null, set up once
  const particleCount = bleeding
    ? CONSTANTS.BLEEDING_PARTICLE_COUNT
    : CONSTANTS.NORMAL_PARTICLE_COUNT;
  const texture = bleeding
    ? textureCache['/blood.png']
    : textureCache['/goo-particle1.png'];
  const SPLASH_DISTANCE_THRESHOLD = 0.3;
  const SPLASH_POOL_SIZE = 10;
  const splashMaterial = createParticleMaterial(
    texture,
    bleeding ? '#880808' : 'green',
    bleeding ? 0.23 : 0.33,
    bleeding ? 0.06 : 0.1
  );
  let splashCreationCount = 0;

  // Texture validation (no cleanup needed here)
  if (!texture) {
    console.error('Goo particle texture not found in cache');
  }

  // Initialize splash pool once
  if (!splashPool.current) {
    splashPool.current = [];
    for (let i = 0; i < SPLASH_POOL_SIZE; i++) {
      const splashGeometry = createSplashGeometry();
      const splashPoints = new THREE.Points(splashGeometry, splashMaterial);
      splashPoints.visible = false;
      splashPool.current.push({
        points: splashPoints,
        geometry: splashGeometry,
        active: false,
        creationTime: 0,
        totalLifetime: CONSTANTS.SPLASH_LIFETIME,
      });
    }
  }

  // Add splash pool objects to the scene once mounted
  const splashPoolInitialized = useRef(false);
  if (splashParticlesRef.current && !splashPoolInitialized.current) {
    splashPool.current.forEach((s) => {
      splashParticlesRef.current.add(s.points);
    });
    splashPoolInitialized.current = true;
  }

  const particles = useMemo(
    () => createParticlesGeometry(),
    [position, target, bleeding]
  );

  function createParticlesGeometry() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const lifetimes = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);
    const colors = new Float32Array(particleCount * 3);
    const prevPositions = new Float32Array(particleCount * 3);
    const splashed = new Float32Array(particleCount);
    const active = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      initializeParticle(
        i,
        positions,
        prevPositions,
        velocities,
        lifetimes,
        sizes,
        colors,
        splashed,
        active
      );
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('splashed', new THREE.BufferAttribute(splashed, 1));
    geometry.setAttribute('active', new THREE.BufferAttribute(active, 1));
    geometry.userData.prevPositions = prevPositions;

    return geometry;
  }

  function initializeParticle(
    i,
    positions,
    prevPositions,
    velocities,
    lifetimes,
    sizes,
    colors,
    splashed,
    active
  ) {
    const positionSpread = bleeding ? 0.45 : 0.1;
    const px = position[0] + (Math.random() - 0.5) * positionSpread;
    const py = position[1] + (Math.random() - 0.5) * positionSpread;
    const pz = position[2] + (Math.random() - 0.5) * positionSpread;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;
    prevPositions[i * 3] = px;
    prevPositions[i * 3 + 1] = py;
    prevPositions[i * 3 + 2] = pz;

    const randomFactor = bleeding ? 0.25 : 0.5;
    const directionRandomness = bleeding ? 0.35 : 0.2;
    const direction = calculateDirection(
      position,
      target,
      randomFactor,
      directionRandomness
    );

    const speed = bleeding
      ? CONSTANTS.BLEEDING_SPEED + Math.random() * 0.03
      : CONSTANTS.NORMAL_SPEED_BASE +
        Math.random() * CONSTANTS.NORMAL_SPEED_RANDOM;
    const velocity = calculateVelocity(direction, speed);

    velocities[i * 3] = velocity.x;
    velocities[i * 3 + 1] = velocity.y;
    velocities[i * 3 + 2] = velocity.z;

    lifetimes[i] =
      CONSTANTS.PARTICLE_LIFETIME_BASE +
      Math.random() * CONSTANTS.PARTICLE_LIFETIME_RANDOM;
    sizes[i] =
      CONSTANTS.PARTICLE_SIZE_BASE +
      Math.random() * CONSTANTS.PARTICLE_SIZE_RANDOM;
    createParticleColor(i, colors);
    splashed[i] = 0;
    active[i] = 1;
  }

  function createSplashGeometry() {
    const splashSize = CONSTANTS.SPLASH_SIZE;
    const positions = new Float32Array(splashSize * 3);
    const lifetimes = new Float32Array(splashSize);
    const sizes = new Float32Array(splashSize);
    const colors = new Float32Array(splashSize * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }

  const createSplash = (x, y, z) => {
    const available = splashPool.current.find((s) => !s.active);
    if (!available || splashCreationCount >= 5) return;

    for (let i = 0; i < splashSystems.current.length; i++) {
      const system = splashSystems.current[i];
      const distance = Math.hypot(
        system.points.position.x - x,
        system.points.position.z - z
      );
      if (distance < SPLASH_DISTANCE_THRESHOLD) return;
    }

    splashCreationCount++;
    available.active = true;
    available.points.position.set(x, y, z);
    available.points.visible = true;
    available.creationTime = Date.now() / 1000;

    const splashGeometry = available.geometry;
    const positions = splashGeometry.attributes.position.array;
    const lifetimes = splashGeometry.attributes.lifetime.array;
    const sizes = splashGeometry.attributes.size.array;
    const colors = splashGeometry.attributes.color.array;

    for (let i = 0; i < CONSTANTS.SPLASH_SIZE; i++) {
      initializeSplashParticle(i, x, y, z, positions, lifetimes, sizes, colors);
    }

    splashGeometry.attributes.position.needsUpdate = true;
    splashGeometry.attributes.lifetime.needsUpdate = true;
    splashGeometry.attributes.size.needsUpdate = true;
    splashGeometry.attributes.color.needsUpdate = true;

    splashSystems.current.push(available);
  };

  function initializeSplashParticle(
    i,
    x,
    y,
    z,
    positions,
    lifetimes,
    sizes,
    colors
  ) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.07;

    positions[i * 3] = x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = y + 0.005;
    positions[i * 3 + 2] = z + Math.sin(angle) * radius;

    lifetimes[i] =
      CONSTANTS.SPLASH_PARTICLE_LIFETIME_BASE +
      Math.random() * CONSTANTS.SPLASH_PARTICLE_LIFETIME_RANDOM;
    sizes[i] = 0.08 + Math.random() * 0.12;
    createParticleColor(i, colors);
  }

  useFrame((state, delta) => {
    const allDead =
      updateParticles(state, delta) && updateSplashSystems(state, delta);
    splashCreationCount = 0;
    if (allDead) onComplete();
  });

  function updateParticles(state, delta) {
    const positions = particles.attributes.position.array;
    const velocities = particles.attributes.velocity.array;
    const lifetimes = particles.attributes.lifetime.array;
    const sizes = particles.attributes.size.array;
    const splashed = particles.attributes.splashed.array;
    const active = particles.attributes.active.array;
    const prevPositions = particles.userData.prevPositions;

    let allDead = true;
    let needsUpdate = false;

    for (let i = 0; i < particleCount; i++) {
      if (active[i] === 0) continue;

      storeParticlePreviousPosition(i, positions, prevPositions);
      lifetimes[i] -= delta;

      if (
        lifetimes[i] <= 0 &&
        positions[i * 3 + 1] > CONSTANTS.GROUND_Y &&
        splashed[i] === 0
      ) {
        lifetimes[i] = 0.1;
      }

      if (lifetimes[i] > 0) {
        allDead = false;
        updateParticleMovement(i, positions, velocities, sizes, state);
        applyParticleCohesion(i, positions, velocities);
        checkGroundCollision(i, positions, prevPositions, splashed);

        if (splashed[i]) {
          lifetimes[i] = 0;
          sizes[i] = 0;
          positions[i * 3 + 1] = 0;
          active[i] = 0;
        }
        if (lifetimes[i] < 0.3) sizes[i] *= 0.95;

        needsUpdate = true;
      } else {
        active[i] = 0;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      particles.attributes.position.needsUpdate = true;
      particles.attributes.lifetime.needsUpdate = true;
      particles.attributes.size.needsUpdate = true;
      particles.attributes.splashed.needsUpdate = true;
      particles.attributes.active.needsUpdate = true;
    }

    return allDead;
  }

  function storeParticlePreviousPosition(i, positions, prevPositions) {
    prevPositions[i * 3] = positions[i * 3];
    prevPositions[i * 3 + 1] = positions[i * 3 + 1];
    prevPositions[i * 3 + 2] = positions[i * 3 + 2];
  }

  function updateParticleMovement(i, positions, velocities, sizes, state) {
    positions[i * 3] += velocities[i * 3];
    positions[i * 3 + 1] += velocities[i * 3 + 1];
    positions[i * 3 + 2] += velocities[i * 3 + 2];

    velocities[i * 3 + 1] -= CONSTANTS.GRAVITY;
    const wobbleAmount = bleeding ? 0.0015 : 0.001;
    addWobbleMovement(positions, i, state.clock.elapsedTime, wobbleAmount);

    if (bleeding) {
      velocities[i * 3] += (Math.random() - 0.5) * 0.0005;
      velocities[i * 3 + 2] += (Math.random() - 0.5) * 0.0005;
    }

    const speed = calculateSpeed(
      velocities[i * 3],
      velocities[i * 3 + 1],
      velocities[i * 3 + 2]
    );
    sizes[i] = 0.2 + speed * 3;
  }

  function applyParticleCohesion(i, positions, velocities) {
    const cohesionCheckCount = 2;
    for (let k = 0; k < cohesionCheckCount; k++) {
      const j = Math.floor(Math.random() * particleCount);
      if (i !== j) {
        const dx = positions[j * 3] - positions[i * 3];
        const dy = positions[j * 3 + 1] - positions[i * 3 + 1];
        const dz = positions[j * 3 + 2] - positions[i * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONSTANTS.COHESION_RANGE) {
          velocities[i * 3] += (dx / dist) * CONSTANTS.ATTRACTION_FACTOR;
          velocities[i * 3 + 1] += (dy / dist) * CONSTANTS.ATTRACTION_FACTOR;
          velocities[i * 3 + 2] += (dz / dist) * CONSTANTS.ATTRACTION_FACTOR;
        }
      }
    }
  }

  function checkGroundCollision(i, positions, prevPositions, splashed) {
    const particlePosition = new THREE.Vector3(
      positions[i * 3],
      positions[i * 3 + 1],
      positions[i * 3 + 2]
    );
    const particleRadius = 0.05;

    if (!bleeding) {
      const playerCollision = CollisionManager.checkParticlePlayerCollision(
        particlePosition,
        particleRadius
      );
      if (playerCollision.hit && splashed[i] === 0) {
        splashed[i] = 1;
        createSplash(
          playerCollision.position.x,
          playerCollision.position.y,
          playerCollision.position.z
        );
        return true;
      }
    }

    if (
      checkGroundHit(
        prevPositions[i * 3 + 1],
        positions[i * 3 + 1],
        CONSTANTS.GROUND_Y,
        splashed[i]
      )
    ) {
      positions[i * 3 + 1] = CONSTANTS.GROUND_Y;
      splashed[i] = 1;
      createSplash(positions[i * 3], CONSTANTS.GROUND_Y, positions[i * 3 + 2]);
      return true;
    } else if (
      positions[i * 3 + 1] < CONSTANTS.GROUND_Y - 0.2 &&
      splashed[i] === 0
    ) {
      positions[i * 3 + 1] = CONSTANTS.GROUND_Y;
      splashed[i] = 1;
      createSplash(positions[i * 3], CONSTANTS.GROUND_Y, positions[i * 3 + 2]);
      return true;
    }

    return false;
  }

  function updateSplashSystems(state, delta) {
    const currentTime = state.clock.elapsedTime;
    let allDead = true;

    for (let i = splashSystems.current.length - 1; i >= 0; i--) {
      const system = splashSystems.current[i];
      const age = currentTime - system.creationTime;

      if (age > system.totalLifetime) {
        system.points.visible = false;
        system.active = false;
        splashSystems.current.splice(i, 1);
        continue;
      }

      allDead = updateSplashParticles(system, delta, currentTime) && allDead;
    }

    return allDead;
  }

  function updateSplashParticles(system, delta, currentTime) {
    const splashPositions = system.geometry.attributes.position.array;
    const splashLifetimes = system.geometry.attributes.lifetime.array;
    const splashSizes = system.geometry.attributes.size.array;
    let allDead = true;
    let needsUpdate = false;

    for (let j = 0; j < splashLifetimes.length; j++) {
      if (splashPositions[j * 3 + 1] > CONSTANTS.GROUND_Y) {
        splashPositions[j * 3 + 1] -= 0.05 * Math.random();
        if (splashPositions[j * 3 + 1] < CONSTANTS.GROUND_Y) {
          splashPositions[j * 3 + 1] = CONSTANTS.GROUND_Y;
        }
        needsUpdate = true;
      }

      splashLifetimes[j] -= delta;
      if (splashLifetimes[j] > 0) {
        allDead = false;
        const fadeProgress =
          1 - splashLifetimes[j] / (1.5 + Math.random() * 1.5);

        if (fadeProgress < 0.7) {
          const angle = Math.atan2(
            splashPositions[j * 3 + 2] - system.points.position.z,
            splashPositions[j * 3] - system.points.position.x
          );
          splashPositions[j * 3] += Math.cos(angle) * 0.0001;
          splashPositions[j * 3 + 2] += Math.sin(angle) * 0.0001;
          needsUpdate = true;
        }

        addWobbleMovement(splashPositions, j, currentTime, 0.0001);
        if (fadeProgress > 0.7) splashSizes[j];

        splashSizes[j] *= 0.98;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      system.geometry.attributes.position.needsUpdate = true;
      system.geometry.attributes.lifetime.needsUpdate = true;
      system.geometry.attributes.size.needsUpdate = true;
    }

    return allDead;
  }

  return (
    <>
      <points renderOrder={9} ref={particlesRef}>
        <primitive object={particles} attach="geometry" />
        <pointsMaterial
          attach="material"
          size={bleeding ? 0.64171 : 0.53}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={bleeding ? 1 : 0.35}
          blending={THREE.AdditiveBlending}
          color={bleeding ? '#880808' : 'green'}
          map={texture}
          depthWrite={false}
        />
      </points>
      <group ref={splashParticlesRef} />
    </>
  );
};

export default MutantGoo;
