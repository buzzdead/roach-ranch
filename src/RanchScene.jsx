import { PerspectiveCamera, Stars, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import React from 'react';
import * as THREE from 'three';
import { PlayerProvider } from './context/PlayerContext';
import { SoundProvider } from './context/SoundContext';

import EffectsLayer from './components/scene/EffectsLayer';
import Environment from './components/scene/Environment';
import GameplayLayer from './components/scene/GameplayLayer';
import Test from './test';

const StarColors = [
  new THREE.Color(1, 0.8, 0.8),
  new THREE.Color(0.8, 0.8, 1),
  new THREE.Color(1, 1, 0.8),
];

const GL = {
  powerPreference: 'high-performance',
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1,
};

const RanchScene = () => {
  return (
    <Canvas
      shadows
      gl={GL}
      style={{ width: '100vw', height: '100vh' }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color('#050505');
        gl.setClearColor('#050505');
      }}
    >
      {process.env.NODE_ENV === 'development' && <Stats />}
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
            <Environment />
            <GameplayLayer />
          </Physics>
          <EffectsLayer />
          <group renderOrder={9}>
            <Stars
              radius={300}
              depth={50}
              count={1000}
              factor={4}
              saturation={0.5}
              factorColors={StarColors}
            />
          </group>
          <ambientLight intensity={0.25125} />
        </PlayerProvider>
      </SoundProvider>
    </Canvas>
  );
};

export default RanchScene;
