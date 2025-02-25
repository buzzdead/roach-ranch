import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createGrassTextures } from '../../utils/TextureCreator';

const AnimatedGrassBillboards = ({ count = 15000 }) => {
  const instancedMeshRef = useRef();
  
  // Create the grass textures
  const grassTextures = useMemo(() => createGrassTextures(), []);
  
  // Create shader material
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        map: { value: grassTextures[0] }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vHeight;
        
        void main() {
          vUv = uv;
          vHeight = position.y;
          
          vec4 instancePosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec3 pos = position;
          
          if (pos.y > 0.3) {
            float windStrength = 0.15;
            float windSpeed = 1.2;
            
            float noiseX = sin(time * windSpeed + instancePosition.x * 5.0 + instancePosition.z * 2.0);
            float noiseZ = cos(time * 0.8 + instancePosition.x * 3.0 + instancePosition.z * 4.0);
            
            float heightFactor = min(1.0, (pos.y - 0.3) * 2.0);
            
            pos.x += noiseX * windStrength * heightFactor;
            pos.z += noiseZ * windStrength * 0.3 * heightFactor;
          }
          
          gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;
        varying float vHeight;
        
        void main() {
          vec4 texColor = texture2D(map, vUv);
          if (texColor.a < 0.1) discard;
          
          float darkness = 0.8 + vHeight * 0.4;
          vec3 finalColor = texColor.rgb * darkness;
          
          float noise = fract(sin(vUv.x * 100.0 + vUv.y * 10.0) * 43758.5453);
          finalColor += (noise * 0.05 - 0.025);
          
          gl_FragColor = vec4(finalColor, texColor.a * 0.05);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [grassTextures]);
  
  // Distribute grass
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    const tempObject = new THREE.Object3D();
    let validCount = 0;
    
    // Create cluster centers
    const clusterCenters = [];
    for (let i = 0; i < 30; i++) {
      clusterCenters.push({
        x: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 80,
        radius: 5 + Math.random() * 10
      });
    }
    
    // Distribute grass blades
    for (let i = 0; i < count; i++) {
      let x, z;
      
      if (Math.random() < 0.7) {
        const cluster = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 1.5) * cluster.radius;
        x = cluster.x + Math.cos(angle) * dist;
        z = cluster.z + Math.sin(angle) * dist;
      } else {
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() - 0.5) * 80;
      }
      
      // Skip grass inside the house
      if (x > -15 && x < 15 && z > -5 && z < 15) continue;
      
      // Height variation
      const heightDistribution = Math.random();
      let height;
      if (heightDistribution < 0.6) {
        height = 0.2 + Math.random() * 0.3;
      } else if (heightDistribution < 0.9) {
        height = 0.3 + Math.random() * 0.3;
      } else {
        height = 0.5 + Math.random() * 0.3;
      }
      
      const width = 0.2 + Math.random() * 0.2;
      
      tempObject.position.set(x, 0, z);
      tempObject.rotation.y = Math.random() * Math.PI;
      tempObject.scale.set(width, height, 1);
      tempObject.updateMatrix();
      
      instancedMeshRef.current.setMatrixAt(validCount, tempObject.matrix);
      
      validCount++;
      if (validCount >= count) break;
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    instancedMeshRef.current.count = validCount;
  }, [count]);
  
  // Animate wind
  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.getElapsedTime();
  });
  
  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[null, null, count]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 2]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
};

export default AnimatedGrassBillboards;