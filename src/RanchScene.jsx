// RanchScene.jsx - Adding ranch house lighting
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

import ThirdPersonControls from './components/controls/ThirdPersonControls';
import Player from './components/entities/player/Player';
import Tree from './components/entities/Tree';
import Ground from './components/environment/Ground';
import RanchHouse from './components/environment/RanchHouse';
import AnimatedGrassBillboards from './components/environment/AnimatedGrassBillboards';
import SceneEffects from './components/effects/SceneEffects';
import { Physics } from '@react-three/rapier';
import MysteriousBoundary from './components/effects/AtmosphericBoundary';
import HorrorMoon from './components/environment/SpookyMoon';
import { SoundProvider } from './context/SoundContext';
import { PlayerProvider } from './context/PlayerContext';
import Enemies from './Enemies';
import { Stats } from '@react-three/drei';
import Loot from './Loot';

const RanchScene = () => {
  return (
    <Canvas
      shadows
      gl={{powerPreference: "high-performance" }}
      style={{width: '100vw', height: '100vh'}}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color('#050505');
        gl.setClearColor('#050505');
      }}
    >
       <Stats />
    <SoundProvider>
      <PlayerProvider>
        <Physics gravity={[0, -9.81, 0]}>
      <PerspectiveCamera makeDefault position={[0, 6, 10]} fov={60} far={10000} />
      <ThirdPersonControls />
      <Player />
      <RanchHouse position={[0, 0, 0]} dilapidated={true} />
      <Enemies />
      <Loot />
      <Ground />
      </Physics>
     <HorrorMoon />
     <Stars 
    radius={300} 
    depth={50} 
    count={1000} 
    factor={4} 
    saturation={.5} 
    factorColors={[new THREE.Color(1, 0.8, 0.8), new THREE.Color(0.8, 0.8, 1), new THREE.Color(1, 1, 0.8)]}
  />

      <AnimatedGrassBillboards count={50000} />
      <Tree position={[-2, 0, -16]} height={12} foliageSize={4} scale={0.5} />
      <Tree position={[8, 0, -16]} height={9} foliageSize={3} type="dense" scale={0.4} />
      <Tree position={[20, 0, -16]} height={14} foliageSize={5} scale={0.55} />
      <MysteriousBoundary radius={50} intensity={2.5} />
      <ambientLight intensity={.1}/>
        <Suspense>
      <SceneEffects />
      </Suspense>
      </PlayerProvider>
      </SoundProvider>
    </Canvas>
  );
};

export default RanchScene;