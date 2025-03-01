// Create a PlayerContext.jsx
import React, { createContext, useContext, useState } from 'react';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [animationState, setAnimationState] = useState({
    jumping: false,
    aiming: false,
    fireCount: 0 
  });
  
  return (
    <PlayerContext.Provider value={{ animationState, setAnimationState }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayerContext = () => useContext(PlayerContext);