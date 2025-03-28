// Shotgun.jsx
import { useThree } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useShallow } from 'zustand/shallow';
import { usePlayerContext } from '../../context/PlayerContext';
import { useAttachToObject } from '../../hooks/useAttachToObject';
import { useGameEffectsStore } from '../../store/gameEffectsStore';
import { modelCache } from '../../utils/Preloader';
import MuzzleFlash from './Effects/MuzzleFlash';
import RevolverBullet from './RevolverBullet';
import ShotgunAudio from './ShotgunAudio';
import { useMuzzleEffect, useShotgunBullets } from './hooks/useShotgun';

const SHOTGUN_CONFIG = {
  modelPath: '/shotgun.glb',
  position: [0.1, 0.2, -0.02],
  rotation: [Math.PI, Math.PI * 1.45, 0],
  scale: [0.35, 0.35, 0.35],
  primitive: {
    position: [-0.15, -0.65, -0.0075],
    rotation: [-1.2, Math.PI * 1.5, 0],
  },
  muzzle: {
    position: [0.25, -0.2, 0],
    flashOffset: [0, 0.75, -0.75],
    flashSize: 0.08,
  },
  bullet: {
    baseDamage: 10,
    maxDistance: 20,
    spreadRadius: 0.1,
    pelletCount: 5,
  },
};

export const Shotgun = ({ bone }) => {
  const { scene } = modelCache[SHOTGUN_CONFIG.modelPath];
  const shotgunScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef();
  const { animationState } = usePlayerContext();
  const { camera } = useThree();

  const { bullets, createPellets, removeBullet } = useShotgunBullets();
  const { muzzleFlash, muzzlePosition, triggerMuzzleFlash } = useMuzzleEffect();

  const [lastFireCount, setLastFireCount] = useState(0);
  const [isFiring, setIsFiring] = useState(false);

  const weapons = useGameEffectsStore(useShallow((state) => state.weapons));
  const { damage, shootingSpeed } = useMemo(
    () => ({
      damage: weapons.shotgun?.upgrades.damage || { level: 0, increment: 5 },
      shootingSpeed: weapons.shotgun?.upgrades.shootingSpeed || {
        level: 0,
        increment: 0.1,
      },
    }),
    [weapons]
  );
  console.log(weapons);

  const currentRotation = useMemo(() => {
    const baseRotation = [...SHOTGUN_CONFIG.primitive.rotation];
    if (animationState.aiming) {
      baseRotation[1] += 0.15;
      baseRotation[2] += 0.1;
      baseRotation[0] -= 0.15;
    }
    return baseRotation;
  }, [animationState.aiming]);

  useAttachToObject(groupRef, bone);

  const getMuzzleWorldPos = () => {
    const muzzleWorldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();

    groupRef.current.getWorldPosition(muzzleWorldPos);
    groupRef.current.getWorldQuaternion(worldQuat);

    const muzzleOffset = new THREE.Vector3(...SHOTGUN_CONFIG.muzzle.position);
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
          .multiplyScalar(SHOTGUN_CONFIG.bullet.maxDistance)
      );

    return new THREE.Vector3()
      .subVectors(targetPoint, muzzleWorldPos)
      .normalize();
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

    createPellets(muzzleWorldPos, firingDirection, SHOTGUN_CONFIG.bullet);

    setIsFiring(true);
    const cooldownTime =
      1000 * (1 - shootingSpeed.level * shootingSpeed.increment);

    setTimeout(() => {
      setIsFiring(false);
    }, cooldownTime);
  }, [
    animationState.firing,
    animationState.fireCount,
    lastFireCount,
    camera,
    isFiring,
    createPellets,
    triggerMuzzleFlash,
    shootingSpeed,
  ]);

  useEffect(() => {
    return () => {
      shotgunScene.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.dispose) child.material.dispose();
        }
      });
    };
  }, [shotgunScene]);

  const bulletDamage =
    SHOTGUN_CONFIG.bullet.baseDamage + damage.level * damage.increment;
  console.log(bullets);
  return (
    <>
      <group ref={groupRef}>
        <group
          position={SHOTGUN_CONFIG.position}
          rotation={SHOTGUN_CONFIG.rotation}
          scale={SHOTGUN_CONFIG.scale}
        >
          <primitive
            object={shotgunScene}
            position={SHOTGUN_CONFIG.primitive.position}
            rotation={currentRotation}
          />

          {muzzleFlash && (
            <mesh position={SHOTGUN_CONFIG.muzzle.flashOffset}>
              <MuzzleFlash intensity={1.5} />
            </mesh>
          )}
        </group>
      </group>
      <ShotgunAudio position={muzzlePosition} isFiring={isFiring} />

      {bullets.map((bullet) => (
        <RevolverBullet
          key={bullet.id}
          bulletId={bullet.id}
          scaleMultiplier={0.75}
          position={bullet.position}
          direction={bullet.direction}
          removeBullet={() => removeBullet(bullet.id)}
          bulletDamage={bulletDamage}
        />
      ))}
    </>
  );
};

export default Shotgun;
