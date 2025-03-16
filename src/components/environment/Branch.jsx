import { CylinderGeometry } from "three";


export const Branch = ({ config, barkTexture, barkNormalMap }) => {
    const createBranchGeometry = (length, baseRadius, tipRadius) => {
      const geometry = new CylinderGeometry(tipRadius, baseRadius, length, 8, 3, false);
      geometry.rotateZ(Math.PI / 2);
      geometry.translate(length / 2, 0, 0);
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      return geometry;
    };
  
    const barkMaterial = (
      <meshStandardMaterial
        map={barkTexture}
        normalMap={barkNormalMap}
        roughness={0.9}
        transparent
        metalness={0.1}
        color="#5A3A1F"
      />
    );
  
    return (
      <group position={config.position} rotation={config.rotation}>
        <mesh castShadow>
          <primitive 
            object={createBranchGeometry(config.length, config.baseRadius, config.tipRadius)} 
            attach="geometry" 
          />
          {barkMaterial}
        </mesh>
        {config.children && config.children.map((subBranch, j) => (
          <group key={`sub-branch-${j}`} position={subBranch.position} rotation={subBranch.rotation}>
            <mesh castShadow>
              <primitive 
                object={createBranchGeometry(subBranch.length, subBranch.baseRadius, subBranch.tipRadius)} 
                attach="geometry" 
              />
              {barkMaterial}
            </mesh>
          </group>
        ))}
      </group>
    );
  };