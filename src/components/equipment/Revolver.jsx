// Revolver.jsx
import { useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useShallow } from 'zustand/shallow';
import { usePlayerContext } from '../../context/PlayerContext';
import { useAttachToObject } from '../../hooks/useAttachToObject';
import { useGameStore } from '../../store/gameStore';
import { modelCache } from '../../utils/Preloader';
import MuzzleFlash from './Effects/MuzzleFlash';
import RevolverAudio from './RevolverAudio';
import RevolverBullet from './RevolverBullet';
import { useMuzzleEffect, useRevolverBullets } from './hooks/useRevolver';

const REVOLVER_CONFIG = {
  modelPath: '/revolver.glb',
  position: [0.1, 0.2, -0.02],
  rotation: [Math.PI, Math.PI * 1.5, 0],
  scale: [0.25, 0.25, 0.25],
  primitive: {
    position: [-0.25, -0.51, 0.2],
    rotation: [-1.2, 0, 0],
  },
  muzzle: {
    position: [0.2, 0.2, 0],
    flashOffset: [0, 0.75, -0.75],
    flashSize: 0.05,
  },
  bullet: {
    baseDamage: 25,
    maxDistance: 25,
  },
};

export const Revolver = ({ bone }) => {
  const { scene } = modelCache[REVOLVER_CONFIG.modelPath];
  const revolverScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();
  const { animationState } = usePlayerContext();
  const { camera } = useThree();

  const { bullets, createBullet, removeBullet } = useRevolverBullets();
  const { muzzleFlash, muzzlePosition, triggerMuzzleFlash } = useMuzzleEffect();

  const [lastFireCount, setLastFireCount] = useState(0);
  const [isFiring, setIsFiring] = useState(false);

  const weapons = useGameStore(useShallow((state) => state.weapons));
  const { damage, shootingSpeed } = useMemo(
    () => ({
      damage: weapons.revolver.upgrades.damage,
      shootingSpeed: weapons.revolver.upgrades.shootingSpeed,
    }),
    [weapons]
  );

  const currentRotation = useMemo(() => {
    const baseRotation = [...REVOLVER_CONFIG.primitive.rotation];
    if (animationState.aiming) {
      baseRotation[1] += 0.22;
      baseRotation[2] -= 0.22;
      baseRotation[0] -= 0.1;
    }

    return baseRotation;
  }, [animationState.aiming]);

  useAttachToObject(groupRef, bone);

  const getMuzzleWorldPos = () => {
    const muzzleWorldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();

    groupRef.current.getWorldPosition(muzzleWorldPos);
    groupRef.current.getWorldQuaternion(worldQuat);

    const muzzleOffset = new THREE.Vector3(...REVOLVER_CONFIG.muzzle.position);
    muzzleOffset.applyQuaternion(worldQuat);
    muzzleWorldPos.add(muzzleOffset);

    return muzzleWorldPos;
  };

  const getFiringDirection = (muzzleWorldPos) => {
    const bulletDirection = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const targetPoint = new THREE.Vector3()
      .copy(camera.position)
      .add(
        bulletDirection
          .clone()
          .multiplyScalar(REVOLVER_CONFIG.bullet.maxDistance)
      );

    const firingDirection = new THREE.Vector3()
      .subVectors(targetPoint, muzzleWorldPos)
      .normalize();

    return firingDirection;
  };

  useEffect(() => {
    const shouldFire =
      animationState.firing &&
      animationState.fireCount !== lastFireCount &&
      !isFiring;

    if (!shouldFire || !groupRef.current) return;
    setLastFireCount(animationState.fireCount);

    const muzzleWorldPos = getMuzzleWorldPos();
    triggerMuzzleFlash([muzzleWorldPos.x, muzzleWorldPos.y, muzzleWorldPos.z]);
    const firingDirection = getFiringDirection(muzzleWorldPos);
    createBullet(muzzleWorldPos, firingDirection);

    setIsFiring(true);
    const cooldownTime =
      750 * (1 - shootingSpeed.level * shootingSpeed.increment);

    setTimeout(() => {
      setIsFiring(false);
    }, cooldownTime);
  }, [
    animationState.firing,
    animationState.fireCount,
    lastFireCount,
    camera,
    isFiring,
    createBullet,
    triggerMuzzleFlash,
    shootingSpeed,
  ]);

  useEffect(() => {
    return () => {
      revolverScene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      });
    };
  }, [revolverScene]);

  const bulletDamage =
    REVOLVER_CONFIG.bullet.baseDamage + damage.level * damage.increment;

  return (
    <>
      <group ref={groupRef}>
        <group
          position={REVOLVER_CONFIG.position}
          rotation={REVOLVER_CONFIG.rotation}
          scale={REVOLVER_CONFIG.scale}
        >
          <primitive
            object={revolverScene}
            position={REVOLVER_CONFIG.primitive.position}
            rotation={currentRotation}
          />

          {muzzleFlash && (
            <mesh position={REVOLVER_CONFIG.muzzle.flashOffset}>
              <sphereGeometry
                args={[REVOLVER_CONFIG.muzzle.flashSize, 16, 16]}
              />
              <MuzzleFlash />
            </mesh>
          )}
        </group>
      </group>

      <RevolverAudio position={muzzlePosition} isFiring={isFiring} />

      {bullets.map((bullet) => (
        <RevolverBullet
          key={bullet.id}
          bulletId={bullet.id}
          position={bullet.position}
          direction={bullet.direction}
          removeBullet={() => removeBullet(bullet.id)}
          bulletDamage={bulletDamage}
        />
      ))}
    </>
  );
};
