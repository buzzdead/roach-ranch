import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { 
  SkyMaterial, 
  StarsGeometry, 
  StarsMaterial,
  celestialDirections
} from '@takram/three-atmosphere';

const AtmosphericSkyWithMoon = () => {
  const { scene } = useThree();
  const skyRef = useRef();
  const starsRef = useRef();
  const moonRef = useRef();
  
  // Create materials and parameters
  const skyMaterial = useMemo(() => {
    const material = new SkyMaterial();
    
    // Set night sky parameters
    material.sunDirection.set(0, -0.2, -1).normalize(); // Sun below horizon
    material.exposure = 0.1; // Low exposure for night
    
    return material;
  }, []);
  
  // Create stars material
  const starsMaterial = useMemo(() => {
    return new StarsMaterial();
  }, []);
  
  // Set up scene on mount
  React.useEffect(() => {
    // Create sky dome
    const skyGeometry = new THREE.SphereGeometry(1000, 32, 32);
    skyGeometry.scale(-1, 1, 1); // Invert so we see it from inside
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    skyRef.current = sky;
    
    // Create stars
    const starsGeometry = new StarsGeometry({ count: 2000 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    stars.scale.setScalar(900); // Make stars appear far away
    scene.add(stars);
    starsRef.current = stars;
    
    // Create custom moon
    const moonGeometry = new THREE.CircleGeometry(50, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: '#fff7c0' });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    
    // Create moon face
    const eyeGeometry = new THREE.CircleGeometry(5, 16);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-15, 15, 1);
    moon.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(15, 15, 1);
    moon.add(rightEye);
    
    const mouthGeometry = new THREE.RingGeometry(15, 20, 16, 1, 0, Math.PI);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: '#000000' });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -15, 1);
    mouth.rotation.z = Math.PI;
    moon.add(mouth);
    
    // Add moon light
    const moonLight = new THREE.PointLight('#fffbe0', 1.5, 500, 2);
    moonLight.position.set(0, 0, 0);
    moon.add(moonLight);
    
    // Position moon
    moon.position.set(0, 300, -700);
    scene.add(moon);
    moonRef.current = moon;
    
    return () => {
      scene.remove(sky);
      scene.remove(stars);
      scene.remove(moon);
      skyGeometry.dispose();
      moonGeometry.dispose();
      eyeGeometry.dispose();
      mouthGeometry.dispose();
      moonMaterial.dispose();
      eyeMaterial.dispose();
      mouthMaterial.dispose();
    };
  }, [skyMaterial, starsMaterial, scene]);
  
  // Make moon always face camera
  useFrame(({ camera }) => {
    if (moonRef.current) {
      moonRef.current.lookAt(camera.position);
    }
  });
  
  return null; // Elements are added directly to the scene
};

export default AtmosphericSkyWithMoon;