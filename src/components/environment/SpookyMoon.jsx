import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const HorrorMoon = () => {
  const moonRef = useRef();
  const { camera } = useThree();
  
  const moonMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;
      
      float distortedCircle(vec2 uv, vec2 center, float radius) {
        float dist = distance(uv, center);
        float wobble = sin(uv.x * 8.0 + time) * sin(uv.y * 6.0 + time * 0.7) * 0.02;
        return smoothstep(radius + wobble, radius - 0.01 + wobble, dist);
      }
      
      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        
        // Create slightly distorted moon body
        float pulseEffect = sin(time * 0.2) * 0.01;
        float moon = distortedCircle(vUv, center, 0.4 + pulseEffect);
        
        // Create eerie glow
        float glow = smoothstep(0.8, 0.2, dist) * 0.7;
        
        // Eyes
        float leftEyeSize = 0.07 + sin(time * 0.3) * 0.01;
        float leftEye = distortedCircle(vUv, center + vec2(-0.15, 0.1), leftEyeSize);
        
        float rightEyeSize = 0.08 + cos(time * 0.3) * 0.01;
        float rightEye = distortedCircle(vUv, center + vec2(0.15, 0.1), rightEyeSize);
        
        // Create creepy blood drip
        float blood = smoothstep(0.01, 0.0, abs(vUv.x - 0.5) - 0.02) 
                    * smoothstep(0.35, 0.33, vUv.y)
                    * step(vUv.y, 0.37);
        
        // Colors
        vec3 moonColor = vec3(0.98, 0.97, 0.9);
        vec3 glowColor = vec3(0.0, 0.0, 0.0) * (0.7 + pulseEffect * 5.0);
        vec3 bloodColor = vec3(0.7, 0.0, 0.0);
        
        // Final color calculation
        vec3 finalColor = mix(moonColor, vec3(0.0), leftEye + rightEye);
        finalColor = mix(finalColor, bloodColor, blood);
        finalColor = mix(glowColor, finalColor, moon);
        
        // The key change: only allow non-zero alpha where there's either moon or glow
        float alpha = moon + glow * (1.0 - moon);
        
        // Make background completely transparent - critical fix!
        if (alpha < 0.01) alpha = 0.0;
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  
  useFrame((state, delta) => {
    if (moonMaterial) {
      moonMaterial.uniforms.time.value += delta;
    }
    
    if (moonRef.current) {
      const worldPosition = new THREE.Vector3();
      camera.getWorldPosition(worldPosition);
      
      moonRef.current.position.x = worldPosition.x + 250;
      moonRef.current.position.y = worldPosition.y + 350;
      moonRef.current.position.z = worldPosition.z - 450;
      
      moonRef.current.lookAt(camera.position);
    }
  });
  
  return (
    <mesh ref={moonRef} renderOrder={10000}>
      <planeGeometry args={[200, 200]} />
      <primitive object={moonMaterial} attach="material" />
      <pointLight color="#ff9c50" intensity={1.5} distance={500} decay={2} />
    </mesh>
  );
};

export default HorrorMoon;