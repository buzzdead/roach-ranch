import { useRef } from 'react'
import { Color, DoubleSide, MeshStandardMaterial, TextureLoader } from "three";
import { useTreeBranches, useTreeFoliage } from "../../hooks/useTree";
import { Branch } from "./Branch";
import { TreeFoliage } from "./TreeFoliage";
import { TreeTrunk } from "./TreeTrunk";

const Tree3 = ({
    position,
    height = 12,
    trunkRadius = 0.7,
    foliageSize = 4,
    type = 'normal',
    scale = 1,
  }) => {
    const treeRef = useRef();
    
    // Load textures
    const pineBranchTexture = useLoader(TextureLoader, '/textures/pineBranch.png');
    const barkTexture = useLoader(TextureLoader, '/textures/barkTexture.jpg');
    const barkNormalMap = useLoader(TextureLoader, '/textures/barkNormalMap.jpg');
  
    // Generate materials
    const foliageMaterial = useMemo(() => {
      return new MeshStandardMaterial({
        map: pineBranchTexture,
        alphaMap: pineBranchTexture,
        transparent: false,
        alphaTest: 0.05,
        color: new Color('#2A4A2A'),
        roughness: 0.5,
        metalness: 0.1,
        side: DoubleSide,
      });
    }, [pineBranchTexture]);
  
    // Generate tree data
    const branches = useTreeBranches(height, trunkRadius);
    const foliageClusters = useTreeFoliage(height, foliageSize, type);
  
    return (
      <group position={position} scale={scale}>
        <group ref={treeRef}>
          <TreeTrunk
            height={height} 
            trunkRadius={trunkRadius} 
            barkTexture={barkTexture} 
            barkNormalMap={barkNormalMap} 
          />
          
          {branches.map((branch, i) => (
            <Branch
              key={`branch-${i}`} 
              config={branch} 
              barkTexture={barkTexture} 
              barkNormalMap={barkNormalMap} 
            />
          ))}
          
          <TreeFoliage
            clusters={foliageClusters} 
            foliageMaterial={foliageMaterial} 
          />
        </group>
      </group>
    );
  };
  
  export default Tree3;