import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

const MysteriousBoundary = ({ radius = 50, height = 15, intensity = 4.0 }) => {
  const groupRef = useRef();
  const timeRef = useRef(0);
  

  useEffect(() => {
    if (groupRef.current) {
      // Set a higher render order so boundary renders after blood particles
      groupRef.current.layers.set(10);
    }
  }, [])
  
  // Create particles for a more organic-looking fog
  const particles = useMemo(() => {
    // Create two distinct layers of particles
    const lowLayerCount = 1200;  // Dense bottom layer
    const highLayerCount = 600;  // Sparser, higher layer
    const totalCount = lowLayerCount + highLayerCount;
    
    const particlePositions = [];
    const particleSizes = [];
    const particleOpacities = [];
    const particlePhases = [];
    const particleColors = [];
    
    // Dark colors for bottom layer
    const bottomColor = new THREE.Color('#030509'); // Almost black
    const midColor = new THREE.Color('#090F24');    // Very dark blue
    const topColor = new THREE.Color('#131730');    // Dark blue-ish
    
    // 1. Create dense bottom layer - concentrated at the horizon line
    for (let i = 0; i < lowLayerCount; i++) {
      // Distribute evenly around perimeter
      const angle = (i / lowLayerCount) * Math.PI * 2;
      // Small random variation to avoid perfect circle
      const finalAngle = angle + (Math.random() * 0.08 - 0.04);
      
      // Vary radius slightly
      const radiusVariation = radius * (0.97 + Math.random() * 0.06);
      
      // Keep these particles very low
      const y = Math.pow(Math.random(), 4) * (height * 0.2); // Very strong concentration at bottom
      
      const x = Math.cos(finalAngle) * radiusVariation;
      const z = Math.sin(finalAngle) * radiusVariation;
      
      particlePositions.push(x, y, z);
      
      // Large particles with high opacity at the bottom
      particleSizes.push(20 + Math.random() * 40); // Larger particles
      particleOpacities.push(0.5 + Math.random() * 0.5); // More opaque
      particlePhases.push(Math.random() * Math.PI * 2);
      
      // Darkest color at the bottom
      particleColors.push(
        bottomColor.r,
        bottomColor.g,
        bottomColor.b
      );
    }
    
    // 2. Create sparser high layer - for occasional wisps above the wall
    for (let i = 0; i < highLayerCount; i++) {
      const angle = (i / highLayerCount) * Math.PI * 2;
      const finalAngle = angle + (Math.random() * 0.1 - 0.05);
      
      // Wider radius variation for upper layer
      const radiusVariation = radius * (0.9 + Math.random() * 0.2);
      
      // Position these higher up
      const heightPos = height * 0.2 + Math.random() * (height * 0.8);
      
      const x = Math.cos(finalAngle) * radiusVariation;
      const z = Math.sin(finalAngle) * radiusVariation;
      
      particlePositions.push(x, heightPos, z);
      
      // Height-based properties
      const heightRatio = 1 - (heightPos / height);
      
      particleSizes.push(10 + Math.random() * 25); // Smaller particles higher up
      particleOpacities.push(0.1 + Math.random() * 0.3 * heightRatio); // More transparent higher up
      particlePhases.push(Math.random() * Math.PI * 2);
      
      // Gradient from mid to top color based on height
      const color = new THREE.Color().lerpColors(
        midColor, 
        topColor, 
        1 - heightRatio
      );
      
      particleColors.push(color.r, color.g, color.b);
    }
    
    return {
      positions: new Float32Array(particlePositions),
      sizes: new Float32Array(particleSizes),
      opacities: new Float32Array(particleOpacities),
      phases: new Float32Array(particlePhases),
      colors: new Float32Array(particleColors)
    };
  }, [radius, height]);

  // Create particle material with custom shader
  const particleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation,
      blending: THREE.NormalBlending, // Normal blending to allow darkness
      vertexColors: true,
      uniforms: {
        time: { value: 0 },
        fogIntensity: { value: intensity }
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float phase;
        
        varying float vOpacity;
        varying vec3 vColor;
        
        uniform float time;
        uniform float fogIntensity;
        
        void main() {
          vec3 pos = position;
          
          // Motion decreases exponentially as y approaches 0
          float yFactor = min(1.0, position.y / 3.0);
          float motionFactor = yFactor * yFactor * 0.8 + 5.0;
          
          // Very minimal motion at bottom, increasing with height
          float verticalMotion = sin(time * 0.1 + phase) * 1.2 * motionFactor;
          pos.y += verticalMotion;
          
          // Horizontal motion
          float horizontalMotion = cos(time * 0.07 + phase * 1.5) * 2.0 * motionFactor;
          pos.x += horizontalMotion;
          pos.z += sin(time * 0.08 + phase) * 2.0 * motionFactor;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size attenuation for fog particles
          gl_PointSize = size * fogIntensity * (200.0 / -mvPosition.z);
          
          vOpacity = opacity;
          vColor = color;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vOpacity;
        uniform float time;
        
        void main() {
          // Create a soft, circular shape for each particle
          vec2 uv = gl_PointCoord.xy - 0.5;
          float dist = length(uv);
          float circle = 1.0 - smoothstep(0.0, 0.5, dist);
          
          // Add subtle internal texture
          float noise = sin(uv.x * 5.0 + time * 0.2) * sin(uv.y * 5.0 + time * 0.15) * 0.03;
          
          float alpha = circle * vOpacity * (1.0 + noise);
          
          // Darken the colors slightly for a more mysterious effect
          gl_FragColor = vec4(vColor * 0.85, alpha);
        }
      `
    });
  }, [intensity]);

  // Animate with very slow movement for bottom particles
  useFrame((state, delta) => {
    timeRef.current += delta * 1.0; // Slower animation 
    particleMaterial.uniforms.time.value = timeRef.current;
    
    // Very slow rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
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
          <bufferAttribute
            attach="attributes-color"
            array={particles.colors}
            count={particles.colors.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={particleMaterial} attach="material" />
      </points>
    </group>
  );
};

export default MysteriousBoundary;