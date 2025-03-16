// RanchScene.jsx - Adding ranch house lighting
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

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
import MysteriousWall from './components/effects/MysteriousWall';
import Game from './Game';
import SoundEffects from './components/effects/SoundEffects';
import Test from './test';
import Tree2 from './components/environment/Tree2';

const RanchScene = () => {
  return (
    <Canvas
      shadows
      gl={{
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.8,
      }}
      style={{ width: '100vw', height: '100vh' }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color('#050505');
        gl.setClearColor('#050505');
      }}
    >
      <Stats />
      <SoundProvider>
        <PlayerProvider>
          <PerspectiveCamera
            makeDefault
            position={[0, 6, 10]}
            fov={65}
            far={10000}
            near={0.1}
          />
          <Physics gravity={[0, -9.81, 0]}>
            <Player />
            <RanchHouse position={[0, 0, 0]} dilapidated={true} />
            <Enemies />

            <Ground />
          </Physics>
          <MysteriousWall />
          <Loot />
          <HorrorMoon />
          <group renderOrder={9}>
            <Stars
              radius={300}
              depth={50}
              count={1000}
              factor={4}
              saturation={0.5}
              factorColors={[
                new THREE.Color(1, 0.8, 0.8),
                new THREE.Color(0.8, 0.8, 1),
                new THREE.Color(1, 1, 0.8),
              ]}
            />
          </group>
          <Game />
          <AnimatedGrassBillboards count={35000} />
          <Tree2
            position={[-2, 0, -16]}
            height={7}
            foliageSize={3.75}
            type="dense"
            scale={1.3}
          />
          <Tree2
            position={[8, 0, -16]}
            height={7}
            foliageSize={3.75}
            type="dense"
            scale={1.3}
          />
          <Tree2
            position={[20, 0, -16]}
            height={8}
            foliageSize={3.75}
            type="dense"
            scale={1.3}
          />
          <MysteriousBoundary intensity={1.5} />
          <ambientLight intensity={0.25125} />

          <Suspense>
            <SceneEffects />
          </Suspense>
        </PlayerProvider>
        <SoundEffects />
      </SoundProvider>
      <Test />
    </Canvas>
  );
};

export default RanchScene;
