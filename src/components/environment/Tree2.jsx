import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';

const Tree2 = ({
  position,
  height = 12,
  trunkRadius = 0.7,
  foliageSize = 4,
  type = 'normal',
  scale = 1,
}) => {
  const treeRef = useRef();
  const foliageGroupRef = useRef();
  const loader = new THREE.TextureLoader();
  // const needlesAlphaTexture = useMemo(() => {
  //   const loader = new THREE.TextureLoader();
  //   const texture = loader.load('/textures/pine_needles_alpha_500.png');
  //   texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  //   return texture;
  // }, []);

  // Load textures
  const pineBranchTexture = useLoader(THREE.TextureLoader, '/textures/pineBranch.png');
  const barkTexture = useLoader(THREE.TextureLoader, '/textures/barkTexture.jpg'); // Provide a bark texture
  const barkNormalMap = useLoader(THREE.TextureLoader, '/textures/barkNormalMap.jpg');

  const foliageMaterial = useMemo(() => {
    // Other properties remain the same
    return new THREE.MeshStandardMaterial({
      map: pineBranchTexture,
      alphaMap: pineBranchTexture,
      transparent: false,
      alphaTest: 0.05,
      color: new THREE.Color('#2A4A2A'),
      roughness: 0.5, // Reduced from 0.6
      metalness: 0.1, // Slightly increased from 0.05
      
      side: THREE.DoubleSide,
    });
  }, [pineBranchTexture]);

  const trunkGeometry = useMemo(() => {
    const segments = 24;
    const heightSegments = 12;
    const geo = new THREE.CylinderGeometry(
      trunkRadius * 0.6,
      trunkRadius * 1.3,
      height,
      segments,
      heightSegments
    );
    const positions = geo.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const heightRatio = positions[i + 1] / height;
      positions[i] += (Math.random() - 0.5) * 0.1 * (1 - heightRatio);
      positions[i + 2] += (Math.random() - 0.5) * 0.1 * (1 - heightRatio);
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [trunkRadius, height]);

  const foliageClusters = useMemo(() => {
    const clusters = [];
    const layerCount = 10;
    const baseHeight = height * .65;

    for (let layer = 0; layer < layerCount; layer++) {
      const layerHeight = baseHeight + (layer * (height * 0.35)) / (layerCount - 1);
      const layerRadius = foliageSize * (1 - layer / layerCount);
      const branchCount = Math.floor(6 + (1 - layer / layerCount) * 10);

      for (let i = 0; i < branchCount; i++) {
        const angle = (i / branchCount) * Math.PI * 2;
        const radius = layerRadius * (0.8 + Math.random() * 0.2);

        clusters.push({
          position: [
            Math.sin(angle) * radius,
            layerHeight + 1,
            Math.cos(angle) * radius,
          ],
          rotation: [
            -Math.PI / 6 - (layer / layerCount) * (Math.PI / 12),
            angle,
            0,
          ],
          scale: [
            1.5 + (1 - layer / layerCount) * 0.5,
            1.5 + (1 - layer / layerCount) * 0.5,
            1,
          ],
        });
      }
    }

    return clusters;
  }, [height, foliageSize, type]);

  const branches = useMemo(() => {
    const branchConfigs = [];
    const branchCount = 12;

    for (let i = 0; i < branchCount; i++) {
      const angle = (i / branchCount) * Math.PI * 2;
      const branchHeight = height * (0.6 + (i / branchCount) * 0.3);
      const branchLength = trunkRadius * (4 + Math.random() * 2);
      const branchAngle = Math.PI / 6 + Math.random() * 0.2;

      branchConfigs.push({
        position: [0, branchHeight, 0],
        rotation: [0, angle, branchAngle],
        length: branchLength,
        baseRadius: trunkRadius * 0.2,
        tipRadius: trunkRadius * 0.05,
        children: [
          {
            position: [branchLength * 0.7, 0, 0],
            rotation: [0, Math.random() * Math.PI, Math.random() * 0.3 - 0.15],
            length: branchLength * 0.5,
            baseRadius: trunkRadius * 0.1,
            tipRadius: trunkRadius * 0.03,
          },
        ],
      });
    }

    return branchConfigs;
  }, [height, trunkRadius]);

  const createBranchGeometry = (length, baseRadius, tipRadius) => {
    const geometry = new THREE.CylinderGeometry(tipRadius, baseRadius, length, 8, 3, false);
    geometry.rotateZ(Math.PI / 2);
    geometry.translate(length / 2, 0, 0);
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  };



  return (
    <group position={position} scale={scale}>
      <RigidBody
           position={[0,0,0]}
           enabledRotations={[false, false, false]}
           type="dynamic"
           mass={1}
           colliders={false}
           friction={0.7}
         >
           <CapsuleCollider args={[1, 1]} position={[0, 0, 0]} />
         </RigidBody>
      <group ref={treeRef}>
        {/* Trunk */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <primitive object={trunkGeometry} attach="geometry" />
          <meshStandardMaterial
            map={barkTexture}
            normalMap={barkNormalMap}
            roughness={0.9}
            color="#5A3A1F"
          />
        </mesh>

        {/* Branches */}
        {branches.map((branch, i) => (
          <group key={`branch-${i}`} position={branch.position} rotation={branch.rotation}>
            <mesh castShadow>
              <primitive object={createBranchGeometry(branch.length, branch.baseRadius, branch.tipRadius)} attach="geometry" />
              <meshStandardMaterial
                map={barkTexture}
                normalMap={barkNormalMap}
                roughness={0.9}
                transparent
                metalness={0.1}
                color="#5A3A1F"
              />
            </mesh>
            {branch.children.map((subBranch, j) => (
              <group key={`sub-branch-${i}-${j}`} position={subBranch.position} rotation={subBranch.rotation}>
                <mesh castShadow>
                  <primitive object={createBranchGeometry(subBranch.length, subBranch.baseRadius, subBranch.tipRadius)} attach="geometry" />
                  <meshStandardMaterial
                    map={barkTexture}
                    normalMap={barkNormalMap}
                    roughness={0.9}
                    metalness={0.1}
                    transparent
                    color="#5A3A1F"
                  />
                </mesh>
              </group>
            ))}
          </group>
        ))}

        {/* Foliage */}
        <group ref={foliageGroupRef}>
          {foliageClusters.map((cluster, i) => (
            <mesh
              key={`foliage-${i}`}
              position={cluster.position}
              rotation={cluster.rotation}
              scale={cluster.scale}
            >
              <planeGeometry args={[2, 1]} /> {/* Width: 2, Height: 1 */}
              <primitive object={foliageMaterial} attach="material" />
            </mesh>
          ))}
        </group>
      </group>

    </group>
  );
};

export default Tree2;