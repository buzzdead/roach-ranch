// RoachBleedEffect.jsx
import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import RoachBleed from '../RoachBleed';

const RoachBleedEffect = ({ 
  bleedRef
}) => {
  const [showBleed, setShowBleed] = useState(false);
  const [bleedPosition, setBleedPosition] = useState(null);
  const [bulletDirection, setBulletDirection] = useState(null);

  // Check ref and update local state for rendering
  useFrame(() => {
    // Update bleed state
    if (bleedRef.current.doesBleed !== showBleed) {
      setShowBleed(bleedRef.current.doesBleed);
      if (bleedRef.current.doesBleed) {
        setBleedPosition(bleedRef.current.pos.clone());
        setBulletDirection(bleedRef.current.bulletDirection);
      }
    }
  });

  return (
    <>
      {showBleed && bleedPosition && (
        <RoachBleed 
          position={bleedPosition} 
          target={bulletDirection}
        />
      )}
    </>
  );
};

export default RoachBleedEffect;