// RoachAttack.jsx
import React from 'react';
import MutantGoo from '../../effects/MutantGoo';

const RoachAttack = ({ position, playerPosition, onComplete }) => {
  return (
    <MutantGoo 
      position={[
        position[0],
        position[1] + 1, // Adjust to mouth position
        position[2]
      ]} 
      target={[
        playerPosition.x,
        playerPosition.y + 1.5, // Target player's center
        playerPosition.z
      ]}
      onComplete={onComplete}
    />
  );
};

export default RoachAttack;
