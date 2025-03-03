// RoachAttack.jsx
import React from 'react';
import MutantGoo from '../../effects/MutantGoo';

const RoachBleed = ({ position }) => {
  const target = position.clone()
  target.y += .35
  console.log(position, target)
  return (
    <MutantGoo 
      position={[position.x, position.y, position.z]} 
      target={[target.x, target.y, target.z]}
      onComplete={() => console.log("complete")}
    />
  );
};

export default RoachBleed;
