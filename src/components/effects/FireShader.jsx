import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Fire3D() {
  // Using refs for persistent references
  const fireRef = useRef()
  const uniformsRef = useRef({
    time: { value: 0 },
    intensity: { value: 2.0 } // Increased intensity
  })
  
  useFrame(({ clock }) => {
    // Make sure time updates properly
    uniformsRef.current.time.value = clock.getElapsedTime() * 3.0 // Faster animation
  })
  
  const createFireMaterial = () => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float intensity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Better noise function
        float hash(float n) {
          return fract(sin(n) * 43758.5453123);
        }
        
        float noise(vec3 x) {
          vec3 p = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          
          float n = p.x + p.y * 57.0 + p.z * 113.0;
          float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                             mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                         mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                             mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
          return res;
        }
        
        float fbm(vec3 p) {
          float result = 0.0;
          float amp = 0.5;
          for(int i=0; i<6; i++) {
            result += noise(p) * amp;
            p *= 2.1;
            amp *= 0.5;
          }
          return result;
        }
        
        void main() {
          // Dynamic time for animation
          float t = time;
          
          // Get coordinates for flame calculation
          vec2 p = vUv;
          float y = 1.0 - p.y;
          
          // Create 3D position for more dynamic movement
          vec3 pos = vec3(vPosition.x, vPosition.y, vPosition.z);
          
          // Base flame shape
           float flameShape = pow(y, 0.6) * (1.0 - pow(abs(p.x * 2.0 - 1.0), 1.8));
          

           float edgeDetail = fbm(vec3(pos.x * 12.0, pos.y * 15.0 - t * 4.0, pos.z * 12.0)) * 0.15;

          // Create turbulent, animated fire
          float noise1 = fbm(vec3(pos.x * 2.5, pos.y * 3.0 - t * 1.5, pos.z * 2.5));
          float noise2 = fbm(vec3(pos.x * 4.0, pos.y * 6.0 - t * 2.2, pos.z * 4.0 + t));
          float noise3 = fbm(vec3(pos.x * 8.0 + t * 0.5, pos.y * 10.0 - t * 3.0, pos.z * 8.0));
          
          // Combine noises for dynamic flame effect
          float flameNoise = noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1;
          
          // Apply noise to flame shape
          float flame = flameShape;
          flame -= flameNoise * 0.5 * (1.0 - p.y);
          
          // Dynamic flickering
          flame -= edgeDetail * (1.0 - abs(p.x * 2.0 - 1.0)) * (1.0 - p.y);
          flame += sin(t * 15.0 + p.y * 40.0) * 0.07 * y;
          flame += cos(t * 8.0 + p.x * 20.0) * 0.04 * y;
          
          // Shape adjustments
          flame *= smoothstep(0.0, 0.4, y);
          flame *= smoothstep(0.0, 0.1, 1.0 - p.y);
          
          // Brightness and intensity
          float brightness = smoothstep(0.0, 0.6, flame) * intensity;
          
          // Fire color gradient with more vibrant yellows
          vec3 baseColor = mix(
            vec3(1.0, 0.2, 0.0), // Deep red core
            vec3(1.0, 0.6, 0.0), // Orange middle
            brightness
          );
          
          baseColor = mix(
            baseColor,
            vec3(1.0, 0.95, 0.3), // Bright yellow-white tip
            pow(brightness, 1.5)
          );
          
          // Apply flame intensity with stronger effect
          vec3 color = baseColor * (flame * 1.8);
          
          // Add stronger glow effect
          color += baseColor * pow(flame, 2.0) * 1.0;
          
          // Better alpha blending
          float alpha = smoothstep(0.02, 0.2, flame);
          
          // Output final color
          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: uniformsRef.current,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  }
  
  return (
    <group ref={fireRef}>
    {/* Main flame with geometry tweaks */}
    <mesh position={[0, 0.3, 0]}>
      {/* Lower segment count but higher height segments for better vertical detail */}
      <coneGeometry args={[0.25, 1.4, 16, 24]} /> 
      <primitive object={createFireMaterial()} />
    </mesh>
    
    {/* Add more varied tendrils that extend beyond the cone slightly */}
    {Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const radius = 0.1 + Math.random() * 0.05
      const x = Math.sin(angle) * radius
      const z = Math.cos(angle) * radius
      const height = 1.0 + Math.random() * 0.8
      const thickness = 0.03 + Math.random() * 0.03
      
      return (
        <mesh 
          key={i}
          position={[x, 0.5, z]}
          rotation={[Math.random() * 0.3 - 0.15, angle, 0]}
        >
          <coneGeometry args={[thickness, height, 6, 4]} />
          <primitive object={createFireMaterial()} />
        </mesh>
      )
    })}
      
      {/* Fire base with more detail */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.3, 3, 3, 0, Math.PI * 2, 0, Math.PI * 2.6]} />
        <primitive object={createFireMaterial()} />
      </mesh>
    </group>
  )
}

export default Fire3D