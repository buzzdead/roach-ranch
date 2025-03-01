import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

// List of all 3D models to preload
const MODELS = [
  '/revolver.glb',
  '/lantern.glb',
  '/mutant-new.glb',
  '/rancher3.glb',
  '/bullet.glb'
];

// List of all textures to preload
const TEXTURES = [
  '/gravel_road_diff_1k.jpg',
  '/gravel_road_nor_gl_1k.jpg',
  '/textures/goo-particle1.png',
  '/textures/goo-particle.png'
];

const Preload = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [modelsLoaded, setModelsLoaded] = useState(0);
  const [texturesLoaded, setTexturesLoaded] = useState(0);
  
  const totalAssets = MODELS.length + TEXTURES.length;
  
  // Use refs to track the latest values in callbacks
  const modelsLoadedRef = useRef(0);
  const texturesLoadedRef = useRef(0);
  
  // Update overall progress and check if loading is complete
  useEffect(() => {
    const totalLoaded = modelsLoaded + texturesLoaded;
    const percentage = Math.floor((totalLoaded / totalAssets) * 100);
    setProgress(percentage);
    
    console.log(`Progress: ${percentage}%, Models: ${modelsLoaded}, Textures: ${texturesLoaded}`);
    
    if (totalLoaded === totalAssets) {
      // All assets loaded, notify parent component
      onComplete && onComplete();
    }
  }, [modelsLoaded, texturesLoaded, totalAssets, onComplete]);
  
  // Preload 3D models
  useEffect(() => {
    const gltfLoader = new GLTFLoader();
    
    // Setup Draco loader
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/'); // Use CDN path
    // Alternatively use a local path if you have the Draco files in your project:
    // dracoLoader.setDecoderPath('/draco/');
    
    // Attach draco loader to gltf loader
    gltfLoader.setDRACOLoader(dracoLoader);
    
    const loadModels = async () => {
      for (const modelPath of MODELS) {
        try {
          await new Promise((resolve, reject) => {
            gltfLoader.load(
              modelPath,
              (gltf) => {
                modelsLoadedRef.current += 1;
                setModelsLoaded(modelsLoadedRef.current);
                resolve(gltf);
              },
              undefined, // onProgress callback
              (error) => {
                console.error(`Error loading model ${modelPath}:`, error);
                reject(error);
              }
            );
          });
        } catch (error) {
          console.error(`Error handling model ${modelPath}:`, error);
          // Still increment counter even if there's an error to avoid getting stuck
          modelsLoadedRef.current += 1;
          setModelsLoaded(modelsLoadedRef.current);
        }
      }
    };
    
    loadModels();
    
    // Clean up
    return () => {
      dracoLoader.dispose();
    };
  }, []);
  
  // Preload textures
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    
    const loadTextures = async () => {
      for (const texturePath of TEXTURES) {
        try {
          await new Promise((resolve, reject) => {
            textureLoader.load(
              texturePath,
              (texture) => {
                texturesLoadedRef.current += 1;
                setTexturesLoaded(texturesLoadedRef.current);
                resolve(texture);
              },
              undefined, // onProgress callback not supported by TextureLoader
              (error) => {
                console.error(`Error loading texture ${texturePath}:`, error);
                reject(error);
              }
            );
          });
        } catch (error) {
          // Still increment counter even if there's an error
          texturesLoadedRef.current += 1;
          setTexturesLoaded(texturesLoadedRef.current);
        }
      }
    };
    
    loadTextures();
  }, []);

  const preloaderStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };
  
  const contentStyle = {
    textAlign: 'center',
    color: '#ff9c50'
  };
  
  const progressBarStyle = {
    width: '300px',
    height: '20px',
    backgroundColor: '#333',
    borderRadius: '10px',
    margin: '20px auto',
    overflow: 'hidden'
  };
  
  const progressFillStyle = {
    height: '100%',
    backgroundColor: '#ff6830',
    transition: 'width 0.3s ease',
    width: `${progress}%`
  };
  
  const progressTextStyle = {
    fontSize: '18px',
    fontWeight: 'bold'
  };
  
  return (
    <div style={preloaderStyle}>
      <div style={contentStyle}>
        <h2>Loading Ranch Horror...</h2>
        <div style={progressBarStyle}>
          <div style={progressFillStyle} />
        </div>
        <div style={progressTextStyle}>{progress}%</div>
        <div style={{fontSize: '14px', marginTop: '10px'}}>
          Models: {modelsLoaded}/{MODELS.length}, Textures: {texturesLoaded}/{TEXTURES.length}
        </div>
      </div>
    </div>
  );
};

export default Preload;
