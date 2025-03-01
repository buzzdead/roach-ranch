// src/App.jsx
import React, { useState } from 'react';
import RanchScene from './RanchScene';
import { Suspense } from 'react'
import { KeyboardControls } from '@react-three/drei';
import Preload from './Preloader';
import MainMenu from './MainMenu';

function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  
  const handlePreloadComplete = () => {
    setAssetsLoaded(true);
  };
  
  const handleStartGame = () => {
    setGameStarted(true);
  };
  
  // Show preloader until assets are loaded
  if (!assetsLoaded) {
    return <Preload onComplete={handlePreloadComplete} />;
  }
  
  // Show main menu if assets are loaded but game hasn't started
  if (!gameStarted) {
    return <MainMenu onStartGame={handleStartGame} />;
  }
  
  // Once game has started, show the actual game
  return (
    <KeyboardControls
      map={[
        { name: "forward", keys: ["ArrowUp", "w", "W"] },
        { name: "backward", keys: ["ArrowDown", "s", "S"] },
        { name: "left", keys: ["ArrowLeft", "a", "A"] },
        { name: "right", keys: ["ArrowRight", "d", "D"] },
        { name: "jump", keys: ["Space"] },
      ]}
    >
      <Suspense fallback={null}>
        <RanchScene />
      </Suspense>
    </KeyboardControls>
  );
}

export default App;