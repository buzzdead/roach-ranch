// src/App.jsx
import React, { useState } from 'react';
import RanchScene from './RanchScene';
import { Suspense } from 'react';
import { KeyboardControls } from '@react-three/drei';
import Preload from './Preloader';
import MainMenu from './MainMenu';
import ResourcesUI from './ResourceUi';

// Common transition component for both states
const GameTransition = ({ message = "Entering Nightmare..." }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#050505',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#666',
      fontFamily: 'monospace',
      zIndex: 1000
    }}>
      <div>
        <h2>{message}</h2>
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: '#222',
          margin: '20px auto',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            height: '100%',
            width: '50px',
            background: 'linear-gradient(90deg, transparent, #666, transparent)',
            animation: 'loadingAnim 1.5s infinite'
          }}></div>
        </div>
        <style jsx="true">{`
          @keyframes loadingAnim {
            0% { left: -50px; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
};

function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showGame, setShowGame] = useState(false);
  
  const handlePreloadComplete = () => {
    setAssetsLoaded(true);
  };
  
  const handleStartGame = () => {
    setShowTransition(true);
    
    // Pre-load the game component but keep it hidden
    setTimeout(() => {
      setGameStarted(true);
      
      // Wait a bit more before showing it (allows for shader compilation)
      setTimeout(() => {
        setShowGame(true);
        // Keep transition visible for a bit of overlap
        setTimeout(() => {
          setShowTransition(false);
        }, 500);
      }, 500);
    }, 1000);
  };
  
  // Show preloader until assets are loaded
  if (!assetsLoaded) {
    return <Preload onComplete={handlePreloadComplete} />;
  }
  
  return (
    <>
      {/* Show main menu if game hasn't started and transition isn't showing */}
      {!gameStarted && !showTransition && (
        <MainMenu onStartGame={handleStartGame} />
      )}
      
      {/* Always render the transition layer when needed, as an overlay */}
      {showTransition && <GameTransition />}
      
      {/* Game is rendered but initially invisible */}
      {gameStarted && (
        <div style={{
          opacity: showGame ? 1 : 0,
          transition: 'opacity 0.5s ease-in',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%'
        }}>
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
          <ResourcesUI />
        </div>
      )}
    </>
  );
}

export default App;