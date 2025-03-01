// RoachLighting.jsx
import React, { useRef } from 'react';

const RoachLighting = ({ position }) => {
  const lightRef = useRef();
  
  return (
    <pointLight
      ref={lightRef}
      position={[position[0] + 0.2, position[1] + 0.55, position[2] + 0.35]}
      intensity={0.151}
      color="white"
    />
  );
};

export default RoachLighting;
