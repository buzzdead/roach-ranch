import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { PointerLockControls, PerspectiveCamera, useGLTF, CameraControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

function ThirdPersonControls() {
  const { camera } = useThree();
  const moveRef = useRef({ forward: 0, backward: 0, left: 0, right: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);

  const characterPos = useRef(new THREE.Vector3(0, 0, 5));

  const cameraOffset = useRef({
    distance: 2,
    height: 3,
    angle: -Math.PI ,
  });

  useEffect(() => {
    const handleClick = () => {
      document.body.requestPointerLock();
    };

    const handleLockChange = () => {
      setIsLocked(document.pointerLockElement === document.body);
    };

    const handleMouseMove = (e) => {
      if (document.pointerLockElement === document.body) {
        rotationRef.current.x -= e.movementX * 0.002;
        rotationRef.current.y = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, rotationRef.current.y - e.movementY * 0.002)
        );
      }
    };

    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW': moveRef.current.forward = 1; break;
        case 'KeyS': moveRef.current.backward = 1; break;
        case 'KeyA': moveRef.current.right = 1; break;
        case 'KeyD': moveRef.current.left = 1; break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW': moveRef.current.forward = 0; break;
        case 'KeyS': moveRef.current.backward = 0; break;
        case 'KeyA': moveRef.current.right = 0; break;
        case 'KeyD': moveRef.current.left = 0; break;
        default: break;
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handleLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handleLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return useFrame(({ camera }, delta) => {
    cameraOffset.current.angle = rotationRef.current.x; // Left/right rotation

    const moveSpeed = 0.15;
    const direction = new THREE.Vector3();

    const horizontalQuat = new THREE.Quaternion();
    horizontalQuat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraOffset.current.angle);

    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(horizontalQuat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(horizontalQuat);

    direction.x = moveRef.current.right - moveRef.current.left;
    direction.z = moveRef.current.forward - moveRef.current.backward;

    if (direction.x !== 0) characterPos.current.addScaledVector(right, direction.x * moveSpeed);
    if (direction.z !== 0) characterPos.current.addScaledVector(forward, direction.z * moveSpeed);

    camera.userData.characterPos = characterPos.current.clone();
    camera.userData.lastAngle = cameraOffset.current.angle;

    const offset = new THREE.Vector3(
        -Math.sin(cameraOffset.current.angle) * cameraOffset.current.distance,
        cameraOffset.current.height,
        -Math.cos(cameraOffset.current.angle) * cameraOffset.current.distance
    );

    camera.position.copy(characterPos.current).add(offset);

    // 🎯 Apply mouse-driven vertical tilt to lookAt Y
    camera.lookAt(
        characterPos.current.x,
        characterPos.current.y + 1.6 + rotationRef.current.y * 3, // Adjust vertical tilt
        characterPos.current.z
    );
});

}


function Player() {
  const { scene } = useGLTF('/rancher.glb');
  const { camera } = useThree();
  const modelRef = useRef();
  
  useFrame(() => {
    if (modelRef.current && camera.userData.characterPos) {
      // Update model position to follow character position
      // Important: y position should be adjusted based on model height
      modelRef.current.position.set(
        camera.userData.characterPos.x,
        1, // Keep at ground level
        camera.userData.characterPos.z
      );
      
      // Make model face the direction of movement
      if (camera.userData.lastAngle !== undefined) {
        modelRef.current.rotation.y = camera.userData.lastAngle;
      }
    }
  });
  
  return (
    <primitive
      ref={modelRef}
      object={scene}
      position={[0, 0, 5]} // Initial position, y=0 to be at ground level
      scale={[1, 1, 1]}
    />
  );
}

// Roach component (assuming GLTF model is provided)
function Roach({ position }) {
  const { scene } = useGLTF('/mutant.glb'); // Replace with actual path
  return <primitive object={scene} position={position} scale={[0.5, 0.5, 0.5]} />;
}

// Simple tree component
function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[0, 10, 0]}>
        <sphereGeometry args={[2, 16, 16]} />
        <meshStandardMaterial color="green" />
      </mesh>
    </group>
  );
}

// Ranch house component
function RanchHouse() {
  return (
    <group>
      {/* Front wall with door gap (between x=-1 and x=1) */}
      <mesh position={[-5.5, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 10, 0.5]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[5.5, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[9, 10, 0.5]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 5, 10]} castShadow receiveShadow>
        <boxGeometry args={[20, 10, 0.5]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Side walls */}
      <mesh position={[-10, 5, 5]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      <mesh position={[10, 5, 5]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 10, 10]} />
        <meshStandardMaterial color="brown" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 10, 5]} castShadow receiveShadow>
        <boxGeometry args={[20, 0.5, 20]} />
        <meshStandardMaterial color="darkred" />
      </mesh>
      {/* Interior floor */}
      <mesh position={[0, 0, 5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
}

function Ground() {
  const [diffuseMap, normalMap] = useLoader(THREE.TextureLoader, [
    '/gravel_road_diff_1k.jpg', 
    '/gravel_road_nor_gl_1k.jpg'
  ], undefined, (error) => {
    console.error('Error loading textures:', error);
  });
  
  useEffect(() => {
    if (diffuseMap && normalMap) {
      [diffuseMap, normalMap].forEach(texture => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(20, 20);
      });
    }
  }, [diffuseMap, normalMap]);
  
  return (
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial 
        map={diffuseMap}
        normalMap={normalMap}
        normalScale={[0.5, 0.5]}
        roughness={0.8}
      />
    </mesh>
  );
}

// Add this new GrassBillboards component
function AnimatedGrassBillboards({ count = 15000 }) {
  const instancedMeshRef = useRef();
  const tempObject = new THREE.Object3D();
  
  // Create the grass texture
  const grassTextures = useMemo(() => {
    return [1, 2, 3].map((_, idx) => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 64, 128);
      
      // Slightly different grass shapes for each texture
      if (idx === 0) {
        // Tall thin grass
        ctx.fillStyle = '#3a6f20';
        ctx.beginPath();
        ctx.moveTo(20, 128);
        ctx.lineTo(32, 20);
        ctx.lineTo(44, 128);
        ctx.closePath();
        ctx.fill();
      } else if (idx === 1) {
        // Wider shorter grass
        ctx.fillStyle = '#4d8f2a';
        ctx.beginPath();
        ctx.moveTo(8, 128);
        ctx.lineTo(32, 40);
        ctx.lineTo(56, 128);
        ctx.closePath();
        ctx.fill();
      } else {
        // Curved grass
        ctx.fillStyle = '#3d7825';
        ctx.beginPath();
        ctx.moveTo(15, 128);
        ctx.bezierCurveTo(15, 60, 50, 60, 45, 30);
        ctx.bezierCurveTo(42, 60, 55, 90, 50, 128);
        ctx.closePath();
        ctx.fill();
      }
      
      return new THREE.CanvasTexture(canvas);
    });
  }, []);
  
  // Modified shader material that works with instanced meshes
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        map: { value: grassTextures[0] } // You'll need to handle multiple textures differently
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vHeight; // To pass height to fragment shader
        
        void main() {
          vUv = uv;
          vHeight = position.y; // Pass height to fragment shader for color variation
          
          // Get the instance position from the instanceMatrix
          vec4 instancePosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          
          // Apply wind animation, using the instance position for variation
          vec3 pos = position;
          
          // Only move the top parts of the grass
          if (pos.y > 0.3) {
            float windStrength = 0.15;
            float windSpeed = 1.2;
            
            // Use instance position to create unique wind pattern for each blade
            float noiseX = sin(time * windSpeed + instancePosition.x * 5.0 + instancePosition.z * 2.0);
            float noiseZ = cos(time * 0.8 + instancePosition.x * 3.0 + instancePosition.z * 4.0);
            
            // Make taller grass bend more
            float heightFactor = min(1.0, (pos.y - 0.3) * 2.0);
            
            // Apply to x-position for side-to-side motion
            pos.x += noiseX * windStrength * heightFactor;
            
            // Subtle forward/backward motion
            pos.z += noiseZ * windStrength * 0.3 * heightFactor;
          }
          
          // Use the instance matrix to position the blade correctly
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
          
          // Add subtle color variation based on height and position
          float darkness = 0.8 + vHeight * 0.4; // Darker at bottom, lighter at top
          vec3 finalColor = texColor.rgb * darkness;
          
          // Add some randomness to color
          float noise = fract(sin(vUv.x * 100.0 + vUv.y * 10.0) * 43758.5453);
          finalColor += (noise * 0.05 - 0.025); // Subtle color noise
          
          gl_FragColor = vec4(finalColor, texColor.a);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }, [grassTextures]);
  
  // Distribute grass with variation
  useEffect(() => {
    if (!instancedMeshRef.current) return;
    
    let validCount = 0;
    
    // Create several cluster centers
    const clusterCenters = [];
    for (let i = 0; i < 30; i++) {
      clusterCenters.push({
        x: (Math.random() - 0.5) * 80,
        z: (Math.random() - 0.5) * 80,
        radius: 5 + Math.random() * 10
      });
    }
    
    // Distribute grass blades - some in clusters, some random
    for (let i = 0; i < count; i++) {
      let x, z;
      
      // 70% of grass follows clustering pattern
      if (Math.random() < 0.7) {
        // Pick a random cluster
        const cluster = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
        
        // Generate position within cluster (denser toward center)
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 1.5) * cluster.radius; // Power makes it denser toward center
        x = cluster.x + Math.cos(angle) * dist;
        z = cluster.z + Math.sin(angle) * dist;
      } else {
        // Random position for remaining 30%
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() - 0.5) * 80;
      }
      
      // Skip grass inside the house
      if (x > -15 && x < 15 && z > -5 && z < 15) continue;
      
      // More realistic height variation - some short, some tall
      const heightDistribution = Math.random();
      let height;
      if (heightDistribution < 0.6) {
        // Most grass is short
        height = 0.2 + Math.random() * 0.3;
      } else if (heightDistribution < 0.9) {
        // Some medium height
        height = 0.3 + Math.random() * 0.3;
      } else {
        // A few tall ones
        height = 0.5 + Math.random() * 0.3;
      }
      
      const width = 0.2 + Math.random() * 0.2;
      
      // Randomly select texture type for this instance
      const textureIndex = Math.floor(Math.random() * grassTextures.length);
      
      tempObject.position.set(x, 0, z);
      tempObject.rotation.y = Math.random() * Math.PI;
      tempObject.scale.set(width, height, 1);
      tempObject.updateMatrix();
      
      instancedMeshRef.current.setMatrixAt(validCount, tempObject.matrix);
      
      // Store texture type in a buffer if you want to use it in the shader
      // (would need additional setup)
      
      validCount++;
      if (validCount >= count) break;
    }
    
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    instancedMeshRef.current.count = validCount;
  }, [count]);
  
  // Animate the wind effect
  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.getElapsedTime();
  });
  
  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[null, null, count]}
    >
      <planeGeometry args={[1, 2]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}

const RanchScene = () => {
  return (
    <Canvas
    shadows
    style={{width: '100vw', height: '100vh'}}
    camera={{ position: [0, 6, 15], fov: 60 }}
    onCreated={({ gl, scene }) => {
      scene.background = new THREE.Color('#050505'); // Slightly lighter black
    }}
  >
      {/* Main camera - now with isometric view */}
      <PerspectiveCamera makeDefault position={[0, 6, 10]} fov={60} />
      <ThirdPersonControls />
      <Player />

      {/* Lighting */}
      <ambientLight intensity={0.4} color="white" /> {/* Increased more */}
      <pointLight position={[0, 5, 0]} intensity={0.7} color="purple" distance={15} castShadow />
      <pointLight position={[10, 5, 10]} intensity={0.5} color="red" distance={20} castShadow />
      <directionalLight
        color="white"
        intensity={0.5}
        position={[0, 50, 0]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight 
  position={[0, 10, 0]} 
  intensity={0.8} 
  angle={0.6} 
  penumbra={0.5} 
  castShadow 
/>

<hemisphereLight 
  intensity={0.5} 
  color="#ffffff" 
  groundColor="#553300" 
/>

      {/* Ranch house */}
      <RanchHouse />

      {/* Ground */}
    {/*   <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="green" />
      </mesh> */}

      <Ground />
      <AnimatedGrassBillboards count={13000} />

      {/* Roaches */}
      <Roach position={[4, 0, 4]} />
      <Roach position={[-5, 0, 5]} />
      <Roach position={[0, 0, 10]} />

      {/* Trees */}
      <Tree position={[10, 0, 10]} />
      <Tree position={[-10, 0, 10]} />

      {/* Fog */}
      <fog attach="fog" args={['#050505', 25, 70]} />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </Canvas>
  );
};


export default RanchScene;