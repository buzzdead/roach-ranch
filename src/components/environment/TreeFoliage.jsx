import { useRef } from "react";

export const TreeFoliage = ({ clusters, foliageMaterial }) => {
    const foliageGroupRef = useRef();
    
    return (
      <group ref={foliageGroupRef}>
        {clusters.map((cluster, i) => (
          <mesh
            key={`foliage-${i}`}
            position={cluster.position}
            rotation={cluster.rotation}
            scale={cluster.scale}
          >
            <planeGeometry args={[2, 1]} />
            <primitive object={foliageMaterial} attach="material" />
          </mesh>
        ))}
      </group>
    );
  };