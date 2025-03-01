// Player.jsx
import React, { useRef, useEffect, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useThree, useGraph } from '@react-three/fiber';
import { PlayerModel } from './PlayerModel';
import { PlayerLighting } from './PlayerLighting';
import { PlayerEquipment } from './PlayerEquipment';
import { PlayerAnimation } from './PlayerAnimation';
import { PlayerAudio } from './PlayerAudio';
import PlayerCursor from './PlayerCursor';

const Player = () => {
  const { scene, animations } = useGLTF('/rancher3.glb');
  const { camera } = useThree();
  const modelRef = useRef();
  const isInitializedRef = useRef(false);

  const [skeleton, setSkeleton] = useState(null);
  const [leftHandBone, setLeftHandBone] = useState(null);
  const [rightHandBone, setRightHandBone] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const { nodes } = useGraph(scene);
  const { actions, mixer } = useAnimations(animations, scene);

  // Find bones in the model
  useEffect(() => {
    if (nodes && nodes.mixamorigHips) {
      let foundSkeleton = null;
      let foundLeftHand = null;
      let foundRightHand = null;
      
      scene.traverse((object) => {
        if (object.isSkinnedMesh && object.skeleton) {
          foundSkeleton = object.skeleton;
        }
        if (object.isBone) {
          if (object.name === 'mixamorigLeftHand') {
            foundLeftHand = object;
            console.log('Found left hand bone');
          }
          if (object.name === 'mixamorigRightHand') {
            foundRightHand = object;
            console.log('Found right hand bone');
          }
        }
      });
      
      if (foundSkeleton) setSkeleton(foundSkeleton);
      if (foundLeftHand) setLeftHandBone(foundLeftHand);
      if (foundRightHand) setRightHandBone(foundRightHand);
      
      if (!foundLeftHand || !foundRightHand) {
        console.warn('Could not find hand bones. Printing all bones:');
        scene.traverse((object) => {
          if (object.isBone) {
            console.log(object.name);
          }
        });
      }
    }
  }, [nodes, scene]);

  // Initialize animations
  useEffect(() => {
    if (actions && mixer) {
      // Force an initial update of the animation system
      for (let i = 0; i < 5; i++) {
        mixer.update(1/60);
      }
      
      // Mark as ready after initialization
      setIsReady(true);
      isInitializedRef.current = true;
    }
  }, [actions, mixer]);
  
  return (
    <>
      <PlayerModel 
        ref={modelRef} 
        scene={scene} 
        camera={camera} 
      />
      
      <PlayerAnimation 
        actions={actions} 
        mixer={mixer}
        modelRef={modelRef}
        camera={camera}
        isInitializedRef={isInitializedRef}
      />
      
      <PlayerAudio />
      
      {isReady && (
        <>
          <PlayerEquipment 
            leftHandBone={leftHandBone} 
            rightHandBone={rightHandBone} 
          />
          
          <PlayerLighting 
            camera={camera} 
          />
        </>
      )}
      <PlayerCursor />
    </>
  );
};

export default Player;
