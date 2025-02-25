import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

const MysteriousBoundary = ({ radius = 50, height = 35, intensity = 4.0 }) => {
  const groupRef = useRef();
  const timeRef = useRef(0);
  
  // Create particles for a more organic-looking fog
  const particles = useMemo(() => {
    const particleCount = 400;
    const particlePositions = [];
    const particleSizes = [];
    const particleOpacities = [];
    const particlePhases = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in a ring pattern
      const angle = Math.random() * Math.PI * 2;
      const radiusVariation = radius * (0.85 + Math.random() * 0.3); // Vary the distance from center
      const x = Math.cos(angle) * radiusVariation;
      const z = Math.sin(angle) * radiusVariation;
      const y = Math.random() * height;
      
      particlePositions.push(x, y, z);
      particleSizes.push(10 + Math.random() * 20); // Random size for each fog particle
      particleOpacities.push(0.2 + Math.random() * 0.5); // Random opacity
      particlePhases.push(Math.random() * Math.PI * 2); // Random phase for animation
    }
    
    return {
      positions: new Float32Array(particlePositions),
      sizes: new Float32Array(particleSizes),
      opacities: new Float32Array(particleOpacities),
      phases: new Float32Array(particlePhases)
    };
  }, [radius, height]);

  // Create particle material with custom shader
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#131730') }, // Dark blue-ish fog
        fogIntensity: { value: intensity }
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float phase;
        
        varying float vOpacity;
        
        uniform float time;
        uniform float fogIntensity;
        
        void main() {
          vec3 pos = position;
          
          // Add subtle vertical motion
          float verticalMotion = sin(time * 0.2 + phase) * 2.0;
          pos.y += verticalMotion;
          
          // Add subtle horizontal drift
          float horizontalMotion = cos(time * 0.15 + phase * 2.0) * 2.0;
          pos.x += horizontalMotion;
          pos.z += sin(time * 0.17 + phase) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation for fog particles
          gl_PointSize = size * fogIntensity * (150.0 / -mvPosition.z);
          
          vOpacity = opacity;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        
        varying float vOpacity;
        
        void main() {
          // Create a soft, circular shape for each particle
          vec2 uv = gl_PointCoord.xy - 0.5;
          float dist = length(uv);
          float circle = 1.0 - smoothstep(0.0, 0.5, dist);
          
          // Add some internal texture to the fog
          float noise = sin(uv.x * 10.0 + time * 0.3) * sin(uv.y * 10.0 + time * 0.2) * 0.05;
          
          float alpha = circle * vOpacity * (1.0 + noise);
          
          gl_FragColor = vec4(color, alpha);
        }
      `
    });
  }, [intensity]);

  // Animate the fog particles
  useFrame((state, delta) => {
    timeRef.current += delta;
    particleMaterial.uniforms.time.value = timeRef.current;
    
    // Slowly rotate the entire fog system
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles.positions}
            count={particles.positions.length / 3}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={particles.sizes}
            count={particles.sizes.length}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-opacity"
            array={particles.opacities}
            count={particles.opacities.length}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-phase"
            array={particles.phases}
            count={particles.phases.length}
            itemSize={1}
          />
        </bufferGeometry>
        <primitive object={particleMaterial} attach="material" />
      </points>
    </group>
  );
};

export default MysteriousBoundary;