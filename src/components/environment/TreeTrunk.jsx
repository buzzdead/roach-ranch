import React, { useMemo } from 'react';
import * as THREE from 'three';

// Trunk Component
export const TreeTrunk = ({ height, trunkRadius, barkTexture, barkNormalMap }) => {
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

  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <primitive object={trunkGeometry} attach="geometry" />
      <meshStandardMaterial
        map={barkTexture}
        normalMap={barkNormalMap}
        roughness={0.9}
        color="#5A3A1F"
      />
    </mesh>
  );
};