import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { createGrassTextures } from '../../utils/TextureCreator';

const AnimatedGrassBillboards = ({ count = 10000 }) => {
  const instancedMeshRef = useRef();
  const grassTextures = useMemo(() => createGrassTextures(), []);

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      map: { value: grassTextures[0] },
      lightDirection: { value: new THREE.Vector3(0, -1, 0) }, // Example light
    },
    vertexShader: `
      uniform float time;
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;

      void main() {
        vUv = uv;
        vHeight = position.y;
        vNormal = normal;

        vec4 instancePosition = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        vec3 pos = position;

        float widthTaper = 1.0 - (1.0 - uv.y) * 0.5;
        pos.x *= widthTaper;

        if (pos.y > 0.5) {
          float windStrength = 0.2;
          float windSpeed = 1.2;
          float noiseX = sin(time * windSpeed + instancePosition.x + instancePosition.z * 0.5);
          float heightFactor = (pos.y - 0.5) * 2.0;
          pos.x += noiseX * windStrength * heightFactor;
        }

        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform vec3 lightDirection;
      varying vec2 vUv;
      varying float vHeight;
      varying vec3 vNormal;

      void main() {
        vec4 texColor = texture2D(map, vUv);
        if (texColor.a < 0.1) discard;
        float darkness = 0.6 + vHeight * 0.3 + max(0.0, dot(vNormal, lightDirection)) * 0.5;
        vec3 baseColor = texColor.rgb * darkness;
        vec3 tint = vec3(0.8 + vHeight * 0.2, 0.9 + vHeight * 0.1, 0.7);
        vec3 finalColor = baseColor ;
        gl_FragColor = vec4(finalColor, texColor.a * 1.0);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  }), [grassTextures]);

  useEffect(() => {
    if (!instancedMeshRef.current) return;
    const matrixArray = new Float32Array(count * 16);
    const tempObject = new THREE.Object3D();
    let validCount = 0;

    const clusterCenters = Array.from({ length: 30 }, () => ({
      x: (Math.random() - 0.5) * 80,
      z: (Math.random() - 0.5) * 80,
      radius: 5 + Math.random() * 10,
    }));

    for (let i = 0; i < count && validCount < count; i++) {
      let x, z;
      if (Math.random() < 0.7) {
        const cluster = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.pow(Math.random(), 1.5) * cluster.radius;
        x = cluster.x + Math.cos(angle) * dist;
        z = cluster.z + Math.sin(angle) * dist;
      } else {
        x = (Math.random() - 0.5) * 80;
        z = (Math.random() - 0.5) * 80;
      }
      if (x > -15 && x < 15 && z > -5 && z < 15) continue;

      const height = Math.random() < 0.6 ? 0.4 + Math.random() * 0.6 :
                     Math.random() < 0.9 ? 0.6 + Math.random() * 0.6 :
                     0.5 + Math.random() * 0.3;
      const width = 0.2 + Math.random() * 0.2;

      tempObject.position.set(x, 0.01 + Math.random() * 0.02, z); // Slight ground offset
      tempObject.rotation.y = Math.random() * Math.PI;
      tempObject.scale.set(width, height, 1);
      tempObject.updateMatrix();

      const offset = validCount * 16;
      matrixArray.set(tempObject.matrix.elements, offset);
      validCount++;
    }

    instancedMeshRef.current.instanceMatrix.array.set(matrixArray.slice(0, validCount * 16));
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    instancedMeshRef.current.count = validCount;
  }, [count]);

  useFrame(({ clock }) => {
    material.uniforms.time.value = clock.getElapsedTime();
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[null, null, count]} frustumCulled={false}>
      <planeGeometry args={[0.2, 2, 1, 2]} /> {/* Tapered geometry */}
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
};

export default AnimatedGrassBillboards;