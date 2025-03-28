// Revolver.jsx
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

const MuzzleFlash = () => {
  const materialRef = useRef();

  // Define shader parameters without instantiating the material
  const shaderData = useMemo(() => {
    return {
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(1.0, 0.8, 0.3) },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        
        void main() {
          float dist = distance(vUv, vec2(0.5, 0.5));
          float flicker = 0.95 + 0.05 * sin(time * 30.0);
          float innerGlow = smoothstep(0.5, 0.0, dist) * flicker;
          float outerGlow = smoothstep(1.0, 0.5, dist) * 0.5 * flicker;
          float brightness = innerGlow + outerGlow;
          vec3 finalColor = color * brightness;
          float alpha = brightness * 1.5;
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <>
      <mesh position={[0, 0.15, 0.05]} scale={[0.1, 0.1, 0.1]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial
          color="#777777"
          transparent={true}
          opacity={0.3}
        />
        <shaderMaterial ref={materialRef} attach="material" {...shaderData} />
      </mesh>
      <mesh position={[0, 0.75, -0.5]} rotation={[0, 0, 0]}>
        <meshBasicMaterial
          color="#ffaa00"
          transparent={true}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
};

export default MuzzleFlash;
