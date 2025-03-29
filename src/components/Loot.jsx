import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import React, { memo, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Color, MeshStandardMaterial, Vector3 } from 'three';
import { useShallow } from 'zustand/shallow';
import { useSoundManager } from '../context/SoundContext';
import { useGameStore } from '../store/gameStore';
import { modelCache } from '../utils/Preloader';
import useFrameInterval from '../utils/useFrameInterval';

const LootItem = memo(({ id, position, type, model, autoCollect = false }) => {
  const { scene } = modelCache[model];
  const [removeLoot, pickupLoot] = useGameStore(
    useShallow((state) => [state.removeLoot, state.pickupLoot])
  );
  const itemRef = useRef();
  const glowRef = useRef();
  const time = useRef(0);
  const [isBeingCollected, setIsBeingCollected] = useState(false);
  const { camera, viewport } = useThree();

  // Animation properties
  const animProgress = useRef(0);
  const startPos = useRef(new Vector3(position[0], position[1], position[2]));
  const targetPos = useRef(new Vector3());

  // Handle auto-collect trigger from parent
  useEffect(() => {
    if (autoCollect && !isBeingCollected) {
      startCollection();
    }
  }, [autoCollect]);

  // Clone the scene with enhanced material
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = new MeshStandardMaterial({
          color: new Color(0xddf2ff),
          metalness: 0.5,
          roughness: 0.5,
          emissive: new Color('blue'),
          emissiveIntensity: 0.1,
        });
      }
    });

    return clone;
  }, [scene]);

  // Function to start collection animation
  const startCollection = () => {
    if (isBeingCollected) return;

    setIsBeingCollected(true);
    animProgress.current = 0;

    // Save exact current position as start position
    if (itemRef.current) {
      startPos.current.copy(itemRef.current.position);
    }

    // Set target position to upper-right corner (inventory location)
    // Convert screen position to world coordinates
    const inventoryUIPosition = new THREE.Vector3(0, 2.5, 0);
    // Project to get the world position

    targetPos.current.copy(inventoryUIPosition);
  };

  // Animation effect
  useFrame((state, delta) => {
    if (!itemRef.current) return;

    if (isBeingCollected) {
      // Collection animation
      animProgress.current += delta * 1.5; // Adjust speed here

      if (animProgress.current < 1) {
        // Calculate new position with easing
        const easedProgress = easeOutQuad(animProgress.current * 0.5);

        // Move toward inventory UI
        const newX = THREE.MathUtils.lerp(
          startPos.current.x,
          targetPos.current.x,
          easedProgress
        );
        const newZ = THREE.MathUtils.lerp(
          startPos.current.z,
          targetPos.current.z,
          easedProgress
        );

        // Add a nice arc to the Y movement
        const arcHeight = 0.7; // Maximum height of the arc
        const arcY = Math.sin(easedProgress * Math.PI) * arcHeight;
        const directY = THREE.MathUtils.lerp(
          startPos.current.y,
          targetPos.current.y,
          easedProgress
        );
        const newY = directY + arcY;

        // Update position
        itemRef.current.position.set(newX, newY, newZ);

        // Scale effect (shrink slightly then grow as it reaches inventory)
        const scaleMultiplier = 1 - easedProgress * 0.55;
        itemRef.current.scale.set(
          scaleMultiplier,
          scaleMultiplier,
          scaleMultiplier
        );

        // Spin faster during collection
        itemRef.current.rotation.y += delta * 8;

        // Increase glow intensity
        clonedScene.traverse((child) => {
          if (child.isMesh && child.material) {
            // Increase emissive intensity
            child.material.emissiveIntensity = 0.1 + easedProgress * 0.4;
            // Shift color from blue to white-gold
            if (easedProgress > 0.5) {
              const colorT = (easedProgress - 0.5) * 2; // 0 to 1 during second half
              child.material.emissive.lerp(new Color(0xffffaa), colorT);
            }
          }
        });

        // Make glow effect pulse faster and brighter
        if (glowRef.current && glowRef.current.material) {
          glowRef.current.material.uniforms.intensity.value =
            0.4 + easedProgress * 0.6;
          glowRef.current.material.uniforms.speed.value =
            2.5 + easedProgress * 5;
        }
      } else {
        // Animation complete - add to inventory THEN remove from world
        pickupLoot(id, type); // Add to inventory first
        removeLoot(type, id); // Then remove from world
      }
    } else {
      // Normal idle animation
      time.current += delta;
      itemRef.current.position.y =
        position[1] + Math.sin(time.current * 2) * 0.1 - 0.1;
      itemRef.current.rotation.y += delta * 0.8;

      clonedScene.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.emissiveIntensity =
            0.051 + Math.sin(time.current * 3) * 0.051;
        }
      });
    }

    // Update glow shader time value
    if (glowRef.current && glowRef.current.material) {
      glowRef.current.material.uniforms.time.value = time.current;
    }
  });

  // Easing function for smoother motion
  const easeOutQuad = (t) => t * (2 - t);
  position[1] = 0.5;
  return (
    <group position={position}>
      <group ref={itemRef} scale={0.8}>
        <primitive
          object={clonedScene}
          scale={[0.6, 0.6, 0.6]}
          onClick={() => startCollection()}
        />

        {/* Label that fades out during collection */}
        <Html
          position={[0, 0.7, 0]}
          center
          distanceFactor={10}
          style={{
            opacity: isBeingCollected
              ? Math.max(0, 1 - animProgress.current * 2)
              : 1,
          }}
        >
          <div
            style={{
              background: 'rgba(0,0,0,0.7)',
              padding: '3px 6px',
              borderRadius: '3px',
              color: '#fff',
              fontSize: '10px',
              whiteSpace: 'nowrap',
              fontFamily: 'Arial',
              textTransform: 'uppercase',
              pointerEvents: 'none',
            }}
          >
            {type}
          </div>
        </Html>
      </group>

      {/* Glow effect */}
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
            time: { value: 0 },
            intensity: { value: 0.4 },
            speed: { value: 2.5 },
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
              uniform float intensity;
              uniform float speed;
              varying vec2 vUv;
              void main() {
                float dist = distance(vUv, vec2(0.5, 0.5));
                float alpha = smoothstep(0.5, 0.0, dist);
                gl_FragColor = vec4(color, alpha * (intensity + sin(time * speed) * 0.1));
              }
            `}
        />
      </mesh>

      {/* Particle effect during collection */}
      {isBeingCollected && animProgress.current < 0.7 && (
        <ParticleEffect
          position={itemRef.current.position}
          progress={animProgress.current}
        />
      )}
    </group>
  );
});

// Simple particle effect component
const ParticleEffect = ({ position, progress }) => {
  const particles = useRef();
  const particleCount = 5; // Number of particles

  useFrame((state, delta) => {
    if (particles.current) {
      // Animate each particle outward
      for (let i = 0; i < particles.current.children.length; i++) {
        const particle = particles.current.children[i];
        particle.position.addScaledVector(
          particle.userData.direction,
          delta * 0.5
        );
        particle.scale.multiplyScalar(0.98); // Shrink gradually
      }
    }
  });

  // Create particles in different directions
  React.useEffect(() => {
    if (particles.current) {
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const direction = new Vector3(
          Math.cos(angle) * 0.5,
          0.2 + Math.random() * 0.3, // Slight upward bias
          Math.sin(angle) * 0.5
        );

        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshBasicMaterial({
            color: new Color(0x4d88ff),
            transparent: true,
            opacity: 0.7,
          })
        );

        particle.userData.direction = direction;
        particle.position.set(0, 0, 0);
        particles.current.add(particle);
      }
    }
  }, []);

  return <group ref={particles} position={position} />;
};

const Loot = () => {
  // Get all loot types from the store
  const { camera } = useThree();
  const soundManager = useSoundManager();
  const pickupSoundRef = useRef();
  const [loot, pickupLoot] = useGameStore(
    useShallow((state) => [state.loot, state.pickupLoot])
  );

  // Track which items are being automatically collected
  const [collectingItems, setCollectingItems] = useState({});

  useEffect(() => {
    if (soundManager) {
      // Create a global pickup sound (not tied to position)
      pickupSoundRef.current = soundManager.createSound('PickUp', {
        volume: 0.15,
        loop: false,
        playbackRate: 1.025, // Higher pitch and faster
      });

      return () => {
        // Clean up sound when component unmounts
        if (pickupSoundRef.current) {
          pickupSoundRef.current.remove();
        }
      };
    }
  }, [soundManager]);

  // Check for nearby loot every 10 frames
  useFrameInterval((state, delta) => {
    if (!camera.userData.characterPos) return;

    const playerPos = camera.userData.characterPos;
    const pickupRadius = 1.5; // How close player needs to be to pick up loot

    // Check each loot type
    Object.entries(loot).forEach(([type, items]) => {
      if (!items || !items.length) return;

      let newCollecting = false;
      const updatedCollecting = { ...collectingItems };

      items.forEach((item) => {
        // Skip if already being collected
        if (collectingItems[item.id]) return;

        // Convert item position to Vector3 if it's not already
        const itemPos = Array.isArray(item.position)
          ? new THREE.Vector3(
              item.position[0],
              item.position[1],
              item.position[2]
            )
          : item.position;

        // Calculate distance between player and item
        const distance = playerPos.distanceTo(itemPos);

        // If player is close enough, mark for collection
        if (distance < pickupRadius) {
          updatedCollecting[item.id] = true;
          newCollecting = true;
        }
      });

      // Only update state if there are new items to collect
      if (newCollecting) {
        setCollectingItems(updatedCollecting);
        if (pickupSoundRef.current) {
          // Stop if already playing (in case multiple pickups happen quickly)
          if (pickupSoundRef.current.isPlaying()) {
            pickupSoundRef.current.stop();
          }
          pickupSoundRef.current.play({ playbackRate: 1.025 });
        }
      }
    });
  }, 10);

  return (
    <>
      {Object.entries(loot).map(([type, items]) =>
        // Only render if items exist and it's an array
        items?.map((item) => (
          <LootItem
            key={item.id}
            id={item.id}
            position={item.position}
            type={type}
            model={item.model}
            autoCollect={collectingItems[item.id] || false}
          />
        ))
      )}
    </>
  );
};

export default React.memo(Loot);
