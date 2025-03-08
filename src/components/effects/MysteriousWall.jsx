import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';

// Simple noise texture for mist effect (you can replace with a real texture later)
const createNoiseTexture = () => {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    const value = Math.random() * 255;
    data[i * 4] = value; // R
    data[i * 4 + 1] = value; // G
    data[i * 4 + 2] = value; // B
    data[i * 4 + 3] = 255; // A
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
};

const EnhancedMysteriousWall = ({
  radius = 49,
  triggerRadius = 40,
  repulsionStrength = 500,
  wallHeight = 2,
}) => {
  const rigidBody = useGameEffectsStore(useShallow((state) => state.rigidBody));
  const { camera } = useThree();
  const wallRef = useRef(null);
  const materialRef = useRef(null);

  useEffect(() => {
    camera.layers.enableAll();
  }, [camera]);

  useEffect(() => {
    if (!wallRef.current) {
      console.log('Creating wall geometry and material...');
      const geometry = new THREE.CylinderGeometry(
        radius - 0.5,
        radius * 0.8,
        wallHeight,
        64,
        1,
        true
      ); // Tapered top
      const material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        uniforms: {
          time: { value: 0 },
          colorBase: { value: new THREE.Color('#09061a') }, // Darker base
          colorTop: { value: new THREE.Color('#4B0082') }, // Dark purple top
          playerPosition: { value: new THREE.Vector2(0, 0) },
          radius: { value: radius },
          wallHeight: { value: wallHeight },
          noiseTexture: { value: createNoiseTexture() },
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vY;
          void main() {
            vUv = uv;
            vY = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
        uniform float time;
        uniform vec3 colorBase;
        uniform vec3 colorTop;
        uniform vec2 playerPosition;
        uniform float radius;
        uniform float wallHeight;
        uniform sampler2D noiseTexture;
        varying vec2 vUv;
        varying float vY;
      
        void main() {
          float distToPlayer = length(vec2(playerPosition.x, playerPosition.y));
          float proximityFactor = 1.0 - smoothstep(radius - 10.0, radius, distToPlayer);
          float verticalFade = smoothstep(0.0, wallHeight, vY);
          
          // Constant base opacity plus pulse
          float pulse = sin(time * 1.2) * 2.0; // More subtle pulse
          float noise = texture2D(noiseTexture, vUv * 2.0 + vec2(time * 0.1)).r;
          
          // Strong exponential fade with height
          float heightFactor = pow(1.0 - (vY / wallHeight), 2.0);
          
          // Combine various alpha factors, much stronger at bottom
          float alpha = 0.1 + pulse + (heightFactor * 0.5) + (noise * 0.2 * heightFactor);
          
          // Bottom part is consistently darker and more opaque
          vec3 finalColor = mix(colorBase, colorTop, verticalFade);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      });

      const mesh = new THREE.Mesh(geometry, material);
      wallRef.current = mesh;
      materialRef.current = material;
      console.log('Wall mesh created:', mesh);
    }
    wallRef.current.renderOrder = 5;

    return () => {
      if (wallRef.current) {
        wallRef.current.geometry.dispose();
        wallRef.current.material.dispose();
      }
    };
  }, [radius, wallHeight]);

  useFrame((state, delta) => {
    if (!rigidBody.current || !wallRef.current || !materialRef.current) return;

    materialRef.current.uniforms.time.value += delta;

    const playerPosition = camera.userData.characterPos;
    if (!playerPosition) return;

    const distanceToCenter = Math.sqrt(
      playerPosition.x * playerPosition.x + playerPosition.z * playerPosition.z
    );

    materialRef.current.uniforms.playerPosition.value.set(
      playerPosition.x,
      playerPosition.z
    );

    if (distanceToCenter > triggerRadius) {
      const dirX = -playerPosition.x / distanceToCenter;
      const dirZ = -playerPosition.z / distanceToCenter;
      const repulsionFactor = Math.min(
        1.0,
        (distanceToCenter - triggerRadius) / (radius - triggerRadius)
      );
      const force = repulsionStrength * repulsionFactor * delta;
      rigidBody.current.applyImpulse({
        x: dirX * force,
        y: 0,
        z: dirZ * force,
      });

      if (distanceToCenter > radius - 1) {
        console.log('Player hit boundary!');
      }
    }
  });

  return (
    <group position={[0, wallHeight / 2, 0]}>
      {wallRef.current && <primitive object={wallRef.current} />}
    </group>
  );
};

export default EnhancedMysteriousWall;
