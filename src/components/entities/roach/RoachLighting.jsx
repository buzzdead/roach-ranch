// RoachLighting.jsx
import React, { useRef } from 'react';

const RoachLighting = ({ position }) => {
  const lightRef = useRef();
  
  return (
    <pointLight
      ref={lightRef}
      position={[0.2,0.75,0.15]}
      intensity={.7351}
      color="orange"
    />
  );
};

export default RoachLighting;
