// components/scene/Environment.jsx
import React from 'react';
import Ground from '../environment/Ground';
import RanchHouse from '../environment/RanchHouse';
import AnimatedGrassBillboards from '../environment/AnimatedGrassBillboards';
import Tree2 from '../environment/Tree2';

const Environment = () => {
  return (
    <>
      <RanchHouse position={[0, 0, 0]} dilapidated={true} />
      <Ground />
      
      {/* Forest elements */}
      <Tree2
        position={[-2, 0, -16]}
        height={7}
        foliageSize={3.75}
        type="dense"
        scale={1.3}
      />
      <Tree2
        position={[8, 0, -16]}
        height={7}
        foliageSize={3.75}
        type="dense"
        scale={1.3}
      />
      <Tree2
        position={[20, 0, -16]}
        height={8}
        foliageSize={3.75}
        type="dense"
        scale={1.3}
      />
      
      {/* Grass is technically part of environment but rendered separately */}
      <AnimatedGrassBillboards count={35000} />
    </>
  );
};

export default Environment;