import { useState, useRef, useEffect, memo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import * as THREE from 'three'
import { useGameEffectsStore } from '../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
import useFrameInterval from '../utils/useFrameInterval';

const NextWaveCircle = ({ position = [0, 0, 0], radius = 5, onActivateWave }) => {
  const { camera } = useThree()
  const [playerInside, setPlayerInside] = useState(false)
  const activationTimer = useRef(0)
  const meshRef = useRef()
  const materialRef = useRef()
  const { waveActive, waveEndTime, setNextLevel, setWaveActive } = useGameEffectsStore(
    useShallow(state => ({
      waveActive: state.waveActive,
      waveEndTime: state.waveEndTime,
      setNextLevel: state.setNextLevel,
      setWaveActive: state.setWaveActive
    }))
  );

  const handleStart = () => {
    setWaveActive()
  }
  const handleEnd = () => {
    setNextLevel()
  }

  useFrameInterval(() => {
    if (waveActive && Date.now() >= waveEndTime) {
        setNextLevel();
      }
  }, 30)
  // Create shader material with uniforms
  useEffect(() => {
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec2 vUv;
        
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float playerInside;
        uniform float activationProgress;
        uniform float waveActive;
        uniform float dissipateTime;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          float thickness = 0.05;
          float outerRadius = 0.5;
          float innerRadius = outerRadius - thickness;
          
          // Create ray effect when wave is active
          float rayEffect = 0.0;
            if (waveActive > 0.0) {
            // Calculate angle from center
            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            
            // Create more pronounced rays with sine pattern
            float rayIntensity = sin(angle * 15.0) * 0.5 + 0.5; // Reduced frequency for wider rays
            
            // Animate rays outward more slowly
            float rayAnimation = min(1.0, dissipateTime * 1.5); // Slower animation
            float rayDist = mix(dist, dist * (1.0 + rayAnimation * 4.0), rayAnimation);
            
            // Fade rays more gradually
            rayEffect = rayIntensity * smoothstep(1.5, 0.0, rayDist) * smoothstep(0.0, 0.2, rayDist);
            
            // Add stronger turbulence
            rayEffect *= (0.7 + 0.3 * sin(time * 8.0 + angle * 5.0));
            
            // Boost ray effect strength
            rayEffect *= 2.0;
            }
          
          // Standard ring calculation
          float inRing = step(dist, outerRadius) - step(dist, innerRadius);
          
          // Fade out the ring when wave is active
          float ringVisibility = 1.0 - min(1.0, dissipateTime * 2.0);
          inRing *= ringVisibility;
          
          float pulseSpeed = 2.0;
          float pulseIntensity = 0.2 * (1.0 - playerInside);
          float pulse = pulseIntensity * sin(time * pulseSpeed);
          
          // Color transition based on playerInside uniform
          vec3 inactiveColor = vec3(0.0, 0.5, 1.0);  // Blue
          vec3 activeColor = vec3(0.0, 1.0, 0.5);    // Green
          vec3 baseColor = mix(inactiveColor, activeColor, playerInside);
          
          // Ray color (brighter version of active color)
          vec3 rayColor = mix(vec3(0.0, 1.0, 0.8), vec3(1.0, 1.0, 1.0), 0.7);
          
          // Activation progress indicator
          float progressAngle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float normalizedAngle = (progressAngle + 3.14159) / (2.0 * 3.14159);
          float progressMask = step(normalizedAngle, activationProgress);
          
          vec3 activatingColor = mix(baseColor, vec3(1.0, 1.0, 1.0), 0.3);
          vec3 finalColor = mix(baseColor, activatingColor, activationProgress * progressMask);
          
          float glow = smoothstep(thickness, 0.0, abs(dist - innerRadius - thickness/2.0));
          finalColor += glow * 0.5 * (1.0 + pulse) * ringVisibility;
          
          // Add ray effect to color
          finalColor = mix(finalColor, rayColor, rayEffect);
          
          float alpha = (inRing + (1.0 - inRing) * glow * 0.7) * ringVisibility;
          alpha = max(alpha, rayEffect * (1.0 - min(1.0, dissipateTime - 0.5))); // Allow rays to have their own opacity
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      uniforms: {
        time: { value: 0 },
        playerInside: { value: 0 },
        activationProgress: { value: 0 },
        waveActive: { value: 0 },
        dissipateTime: { value: 0 }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
    
    materialRef.current = shaderMaterial;
    
    if (meshRef.current) {
      meshRef.current.material = shaderMaterial;
    }
  }, []);
  
  // Add a ref to track when dissipation started
  const dissipateStartTime = useRef(0);
  const dissipatingRef = useRef(false);
  
  useFrame((state, delta) => {
    if (!camera.userData.characterPos || !materialRef.current) return;
    
    const playerPos = new Vector3(
      camera.userData.characterPos.x,
      camera.userData.characterPos.y,
      camera.userData.characterPos.z
    );
    
    const circlePos = new Vector3(position[0], position[1], position[2]);
    const distance = playerPos.distanceTo(circlePos);
    
    const isInside = distance < radius;
    
    // Handle wave activation
    if (isInside !== playerInside) {
      setPlayerInside(isInside);
      if (isInside && !waveActive) {
        activationTimer.current = 0;
      }
    }
    
    // Update activation timer
    if (isInside && !waveActive) {
      activationTimer.current += delta;
      if (activationTimer.current >= 2) {
        // Mark when we started the dissipation effect
        if (!dissipatingRef.current) {
          dissipateStartTime.current = state.clock.getElapsedTime();
          dissipatingRef.current = true;
        }
        handleStart();
      }
    } else if (!isInside || waveActive) {
      activationTimer.current = 0;
    }
    
    // Calculate dissipation progress
    let dissipateProgress = 0;
    if (dissipatingRef.current) {
        const timeSinceDissipate = state.clock.getElapsedTime() - dissipateStartTime.current;
        dissipateProgress = Math.min(timeSinceDissipate / 3.0, 1.0); // Complete over 3 seconds instead of 2
        
        // Reset effect when completed or when wave ends
        if (dissipateProgress >= 1.0 || !waveActive) {
          if (!waveActive) {
            dissipatingRef.current = false;
          }
        }
      }
    
    // Update shader uniforms
    materialRef.current.uniforms.time.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.playerInside.value = (isInside && !waveActive) ? 1.0 : 0.0;
    materialRef.current.uniforms.activationProgress.value = (!waveActive && isInside) ? Math.min(activationTimer.current / 2, 1.0) : 0.0;
    materialRef.current.uniforms.waveActive.value = waveActive ? 1.0 : 0.0;
    materialRef.current.uniforms.dissipateTime.value = dissipateProgress;
  });
  
  return (
    <mesh 
      ref={meshRef}
      position={[position[0], position[1] + 0.1, position[2]]} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[radius - 0.5, radius, 64]} />
      {/* Material is set via the useEffect hook */}
    </mesh>
  );
};

export default memo(NextWaveCircle);