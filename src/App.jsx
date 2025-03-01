// src/App.jsx
import React, { useState } from 'react';
import RanchScene from './RanchScene';
import { Suspense } from 'react'
import { KeyboardControls } from '@react-three/drei';
import Preload from './Preloader'

function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  
  const handlePreloadComplete = () => {
    setAssetsLoaded(true);
  };
  
  return (
    <>
      {!assetsLoaded ? (
        <Preload onComplete={handlePreloadComplete} />
      ) : (
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
      )}
    </>
  );
}

export default App;
