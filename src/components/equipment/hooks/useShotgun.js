// hooks/useShotgun.js
import { useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';

export const useShotgunBullets = () => {
   const [bullets, setBullets] = useState([]);

   const createPellets = useCallback((muzzlePos, baseDirection, config) => {
      const newBullets = [];
      const { pelletCount, spreadRadius } = config;
      const baseId = Date.now()
      // Create center pellet
      newBullets.push({
         id: `${baseId}-0`,
         position: muzzlePos.clone(),
         direction: baseDirection.clone()
      });

      // Create spread pellets
      for (let i = 1; i < pelletCount; i++) {
         const angle = Math.random() * Math.PI * 2;
         const radius = spreadRadius * Math.sqrt(Math.random());

         // Create perpendicular plane for consistent spread
         const up = new THREE.Vector3(0, 1, 0);
         const right = new THREE.Vector3().crossVectors(baseDirection, up).normalize();
         if (right.lengthSq() < 0.001) {
            right.set(1, 0, 0);
         }
         const perpUp = new THREE.Vector3().crossVectors(right, baseDirection).normalize();

         // Apply spread
         const spreadDirection = baseDirection.clone();
         spreadDirection.add(right.clone().multiplyScalar(Math.cos(angle) * radius));
         spreadDirection.add(perpUp.clone().multiplyScalar(Math.sin(angle) * radius));
         spreadDirection.normalize();

         newBullets.push({
            id: `${baseId}-${i}`,
            position: muzzlePos.clone(),
            direction: spreadDirection
         });
      }

      setBullets(prev => [...prev, ...newBullets]);
      return newBullets;
   }, []);

   const removeBullet = useCallback((id) => {
      setBullets(prev => prev.filter(bullet => bullet.id !== id));
   }, []);

   return { bullets, createPellets, removeBullet };
};

export const useMuzzleEffect = () => {
   const [muzzleFlash, setMuzzleFlash] = useState(false);
   const [muzzlePosition, setMuzzlePosition] = useState([0, 0, 0]);

   const triggerMuzzleFlash = useCallback((position) => {
      setMuzzlePosition(position);
      setMuzzleFlash(true);

      setTimeout(() => {
         setMuzzleFlash(false);
      }, 150);
   }, []);

   return { muzzleFlash, muzzlePosition, triggerMuzzleFlash };
};