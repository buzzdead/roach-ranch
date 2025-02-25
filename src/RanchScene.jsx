// RanchScene.jsx - Adding ranch house lighting
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

import ThirdPersonControls from './components/controls/ThirdPersonControls';
import Player from './components/entities/Player';
import Roach from './components/entities/Roach';
import Tree from './components/entities/Tree';
import Ground from './components/environment/Ground';
import RanchHouse from './components/environment/RanchHouse';
import AnimatedGrassBillboards from './components/environment/AnimatedGrassBillboards';
import SceneEffects from './components/effects/SceneEffects';
import { Physics } from '@react-three/rapier';
import MysteriousBoundary from './components/effects/AtmosphericBoundary';
import HorrorMoon from './components/environment/SpookyMoon';
import { SoundProvider } from './context/SoundContext';


const RanchScene = () => {
  return (
    <Canvas
      shadows
      style={{width: '100vw', height: '100vh'}}
      onCreated={({ gl, scene }) => {
        // Make sure background is explicitly set here
        scene.background = new THREE.Color('#050505');
        // Set clear color as well
        gl.setClearColor('#050505');
      }}
    >
    <SoundProvider>
        <Physics gravity={[0, -9.81, 0]}>
      {/* Main camera setup */}
      <PerspectiveCamera makeDefault position={[0, 6, 10]} fov={60} far={10000} />
      <ThirdPersonControls />
      <Player />
      <RanchHouse position={[0, 0, 0]} dilapidated={true} />
      
      <Ground />
      </Physics>

      {/* Lighting - Slightly increased ambient for better visibility */}
      <ambientLight intensity={0.08} color="#111122" /> 
      
      {/* Very dim environment lighting for minimal visibility */}
      <hemisphereLight intensity={0.12} color="#222244" groundColor="#221100" />
      
      {/* Ranch house lighting */}
      {/* Window lights - positioned near the windows */}
      <pointLight position={[-6, 6, 9]} intensity={0.8} color="#ff6830" distance={15} decay={2} />
      <pointLight position={[6, 6, 9]} intensity={0.8} color="#ff6830" distance={15} decay={2} />
     <HorrorMoon />
        
        <Stars 
        radius={300} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
      />
      {/* Porch light */}
      <spotLight 
        position={[0, 5.5, -5.5]} 
        intensity={1.0} 
        angle={0.5} 
        penumbra={0.7} 
        distance={15} 
        color="#ff9c50" 
        target-position={[0, 0, -8]} 
        castShadow 
      />
      
      {/* Subtle ground light from the doorway */}
      <pointLight position={[0, 2, 1]} intensity={0.7} color="#ff9c50" distance={8} decay={2} />
     
      {/* Environment */}

      <AnimatedGrassBillboards count={50000} />
      
      <Tree position={[-2, 0, -16]} height={12} foliageSize={4} scale={0.5} />
      <Tree position={[8, 0, -16]} height={9} foliageSize={3} type="dense" scale={0.4} />
      <Tree position={[20, 0, -16]} height={14} foliageSize={5} scale={0.55} />
      
      {/* Entities */}
      <Roach position={[-2, 0, -14]} />
      {/* <Roach position={[-1, 0, -14]} />
      <Roach position={[-5, 0, -14]} />
      <Roach position={[3, 0, -14]} />
      <Roach position={[-4, 0, -14]} />
      <Roach position={[8, 0, -14]} />
      <Roach position={[7, 0, -14]} /> */}
      <MysteriousBoundary radius={50} intensity={2.5} />

      {/* Slightly less dense fog for better visibility of the ranch */}
      <fog attach="fog" args={['#050505', 12, 40]} />
      <SceneEffects />
      </SoundProvider>
    </Canvas>
  );
};

export default RanchScene;