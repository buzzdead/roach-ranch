// RoachAttack.jsx
import React from 'react';
import MutantGoo from '../../effects/MutantGoo';

const RoachBleed = ({ position, target }) => {
const targetBlood = position.clone().add(target.clone())
targetBlood.y += .31
  return (
    <MutantGoo 
      position={[position.x, position.y, position.z]} 
      target={[targetBlood.x, targetBlood.y, targetBlood.z]}
      onComplete={() => console.log("complete")}
      bleeding
    />
  );
};

export default RoachBleed;
