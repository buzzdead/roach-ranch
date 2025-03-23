// Revolver.jsx
import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useAttachToObject } from '../../hooks/useAttachToObject';
import { usePlayerContext } from '../../context/PlayerContext';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import RevolverBullet from './RevolverBullet';
import RevolverAudio from './RevolverAudio';
import { modelCache } from '../../utils/Preloader'
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import { useShallow } from 'zustand/shallow';
// Constants for configuration
const REVOLVER_CONFIG = {
  modelPath: '/revolver.glb',
  position: [0.1, 0.20, -0.02],
  rotation: [Math.PI, Math.PI * 1.5, 0],
  scale: [0.25, 0.25, 0.25],
};

const PRIMITIVE_CONFIG = {
  position: [-0.25, -0.51, 0.2],
  rotation: [-1.2, 0, 0],
};

const MUZZLE_POSITION = [0.2, 0.2, 0]; // Position of the muzzle end

/**
 * Revolver component that attaches to a bone and displays a 3D revolver model
 */
export const Revolver = ({ bone }) => {
  const { scene } = modelCache[REVOLVER_CONFIG.modelPath];
  const revolverScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();
  const muzzleRef = useRef();
  const { animationState } = usePlayerContext();
  const [lastFireCount, setLastFireCount] = useState(0);
  const { camera } = useThree();
  const weapons = useGameEffectsStore(useShallow((state) => state.weapons))
  const { damage, shootingSpeed } = useMemo(() => {
    const damage = weapons.revolver.upgrades.damage
    const shootingSpeed = weapons.revolver.upgrades.shootingSpeed
    return { damage, shootingSpeed }
  }, [ weapons ] )

  // For firing animation/effects
  const [muzzleFlash, setMuzzleFlash] = useState(false);
  const [isFiring, setIsFiring] = useState(false);
  const [muzzlePosition, setMuzzlePosition] = useState([0, 0, 0]);
  const [bullets, setBullets] = useState([]);
  
  useAttachToObject(groupRef, bone);
  
  // Handle firing animation and bullet creation
  useEffect(() => {
    const createBullet = (muzzlePos, direction) => {
      const newBulletId = Date.now();
      setBullets(prevBullets => [
        ...prevBullets.slice(-5), // Only keep the 5 most recent bullets
        {
          id: newBulletId,
          position: muzzlePos.clone(),
          direction: direction.clone()
        }
      ]);
    };
    if (animationState.firing && animationState.fireCount !== lastFireCount && !isFiring) {
      setLastFireCount(animationState.fireCount);
      setMuzzleFlash(true);
      
      // Calculate bullet starting position and direction
      if (groupRef.current) {
        const muzzleWorldPos = new THREE.Vector3();
        const worldQuat = new THREE.Quaternion();
        
        // Get world position of the revolver's group
        groupRef.current.getWorldPosition(muzzleWorldPos);
        groupRef.current.getWorldQuaternion(worldQuat);
        
        // Adjust for muzzle position within the group
        const muzzleOffset = new THREE.Vector3(...MUZZLE_POSITION);
        muzzleOffset.applyQuaternion(worldQuat);
        muzzleWorldPos.add(muzzleOffset);
        
        // Update muzzle position for audio
        setMuzzlePosition([muzzleWorldPos.x, muzzleWorldPos.y, muzzleWorldPos.z]);
        
        // Direction is forward vector of the camera
        const bulletDirection = new THREE.Vector3(0, 0, -1);
        bulletDirection.applyQuaternion(camera.quaternion);
        
        // Create a ray from the muzzle position in the direction of the camera's forward vector
        const targetPoint = new THREE.Vector3().copy(camera.position);
        targetPoint.add(bulletDirection.clone().multiplyScalar(25));
        
        // Calculate direction from muzzle to this point on the camera's forward ray
        const firingDirection = new THREE.Vector3().subVectors(targetPoint, muzzleWorldPos).normalize();
        
        // Add new bullet with unique ID
        createBullet(muzzleWorldPos, firingDirection)
       
        
        // Trigger sound by setting isFiring to true
        setIsFiring(true);
        
        // Reset firing state after a short delay
        setTimeout(() => {
          setIsFiring(false);
        }, 750 * (1 - shootingSpeed.level * shootingSpeed.increment));
      }
      
      // Hide muzzle flash after a short delay
      setTimeout(() => {
        setMuzzleFlash(false);
      }, 100);
    }
  }, [animationState.firing, animationState.fireCount, lastFireCount, camera]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      revolverScene.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      });
    };
  }, [revolverScene]);
  const handleRemoveBullet = (id) => {
    setBullets(prevBullets => prevBullets.filter(pb => pb.id !== id))

  }
  return (
    <>
      <group ref={groupRef}>
        <group 
          position={REVOLVER_CONFIG.position}
          rotation={REVOLVER_CONFIG.rotation}
          scale={REVOLVER_CONFIG.scale}
        >
          <primitive 
            object={revolverScene} 
            position={PRIMITIVE_CONFIG.position} 
            rotation={PRIMITIVE_CONFIG.rotation} 
          />
          
          <group 
            ref={muzzleRef}
            position={MUZZLE_POSITION}
            visible={false}
          />
          
          {/* Muzzle flash */}
         
          {muzzleFlash && (
  <>
    <mesh position={[0, 0.75, -0.75]}>
      <sphereGeometry args={[0.05, 16, 16]} />
      <MuzzleFlash />
    </mesh>
    <mesh position={[0, 0.75, -0.5]} rotation={[0, 0, 0]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial 
        color="#ffaa00" 
        transparent={true}
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  </>
)}
{muzzleFlash && (
  <>
    {/* Existing muzzle flash code */}
    
    {/* Smoke puff */}
    <mesh position={[0, 0.75, -0.55]} scale={[0.1, 0.1, 0.1]}>
      <sphereGeometry args={[0.5, 8, 8]} />
      <meshStandardMaterial 
        color="#777777" 
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  </>
)}

        </group>
      </group>
      
      {/* Audio component for revolver sounds */}
      <RevolverAudio 
        position={muzzlePosition}
        isFiring={isFiring}
      />
      
      {/* Render bullets */}
      {bullets.map(bullet => (
        <RevolverBullet 
          key={bullet.id}
          bulletId={bullet.id}
          position={bullet.position}
          direction={bullet.direction}
          removeBullet={() => handleRemoveBullet(bullet.id)}
          bulletDamage={25 + (damage.level * damage.increment)}
        />
      ))}
    </>
  );
};

const MuzzleFlash = () => {
  const materialRef = useRef();
  
  // Define shader parameters without instantiating the material
  const shaderData = useMemo(() => {
    return {
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(1.0, 0.7, 0.3) }
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
      blending: THREE.AdditiveBlending
    };
  }, []);
  
  // Update time uniform
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  // Pass the shader parameters directly to the shaderMaterial component
  return <shaderMaterial 
    ref={materialRef} 
    attach="material" 
    {...shaderData}
  />;
};