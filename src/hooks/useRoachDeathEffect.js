// useRoachDeathEffect.js
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const emberGeometry = new THREE.SphereGeometry(0.075, 4, 4);
const emberMaterialPool = Array(3).fill().map(() => new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(1, 0.5, 0),
  emissiveIntensity: 3,
  transparent: true,
  opacity: 0.8,
}));
const sparkleGeometry = new THREE.SphereGeometry(0.05, 4, 4); // Smaller for sparkle
const sparkleMaterial = new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(1, 0.2, 0), // Bright red-orange
  emissiveIntensity: 5,
  transparent: true,
  opacity: 1,
});

const useRoachDeathEffect = ({
  isDead,
  onDeathComplete,
  rbRef,
  modelRef,
  materialsRef,
  meshesRef,
  originalScene,
}) => {
  const deathProgress = useRef(0);
  const startedDeathAnimation = useRef(false);
  const emitterCreated = useRef(false);
  const emitterCreatedCount = useRef(0);
  const sparkleTriggered = useRef(false);
  const deathCompleted = useRef(false); // New flag to prevent multiple onDeathComplete calls

  const createEmberParticles = (progress) => {
    const emberGroup = new THREE.Group();
    emberGroup.position.set(0, 0, 0);

    const baseCount = 5;
    const particleCount = Math.min(baseCount + Math.floor(progress * 10), 15);

    for (let i = 0; i < particleCount; i++) {
      const emberMaterial = emberMaterialPool[i % emberMaterialPool.length].clone();
      emberMaterial.emissive.setRGB(0.8 + Math.random() * 0.2, 0.3 + Math.random() * 0.3, 0);

      const ember = new THREE.Mesh(emberGeometry, emberMaterial);
      ember.position.set(
        (Math.random() - 0.5) * 1.0,
        (Math.random() - 0.3) * 0.7,
        (Math.random() - 0.5) * 1.0
      );
      emberGroup.add(ember);

      ember.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.06,
          0.05 + Math.random() * 0.08,
          (Math.random() - 0.5) * 0.06
        ),
        life: 1,
        decay: 0.005 + Math.random() * 0.015,
      };
    }

    if (modelRef.current && modelRef.current.parent) {
      modelRef.current.parent.add(emberGroup);
      emberGroup.position.copy(modelRef.current.position);
    } else {
      originalScene.add(emberGroup);
    }

    const animateEmbers = () => {
      let allDead = true;
      emberGroup.children.forEach(ember => {
        if (ember.userData.life <= 0) {
          emberGroup.remove(ember);
          return;
        }
        allDead = false;
        ember.position.add(ember.userData.velocity);
        ember.userData.velocity.y -= 0.0005;
        ember.userData.life -= ember.userData.decay;
        ember.material.opacity = ember.userData.life * 0.8;
        const scale = ember.userData.life * 0.1 + 0.1;
        ember.scale.set(scale, scale, scale);
      });

      if (allDead) {
        if (emberGroup.parent) emberGroup.parent.remove(emberGroup);
        return;
      }
      requestAnimationFrame(animateEmbers);
    };
    animateEmbers();
  };

  const createSparkleBurst = () => {
    const sparkleGroup = new THREE.Group();
    sparkleGroup.position.set(0, 0, 0);

    const sparkleCount = 10;
    for (let i = 0; i < sparkleCount; i++) {
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial.clone());
      sparkle.position.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      sparkleGroup.add(sparkle);

      sparkle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2,
          (Math.random() - 0.5) * 0.2
        ),
        life: 0.061,
        decay: 0.0015,
      };
    }

    if (modelRef.current && modelRef.current.parent) {
      modelRef.current.parent.add(sparkleGroup);
      sparkleGroup.position.copy(modelRef.current.position);
    } else {
      originalScene.add(sparkleGroup);
    }

    const animateSparkles = () => {
      let allDead = true;
      sparkleGroup.children.forEach(sparkle => {
        if (sparkle.userData.life <= 0) {
          sparkleGroup.remove(sparkle);
          return;
        }
        allDead = false;
        sparkle.position.add(sparkle.userData.velocity);
        sparkle.userData.life -= sparkle.userData.decay;
        sparkle.material.opacity = sparkle.userData.life * 3;
        const scale = sparkle.userData.life * 8 + 0.4;
        sparkle.scale.set(scale, scale, scale);
      });

      if (allDead) {
        if (sparkleGroup.parent) sparkleGroup.parent.remove(sparkleGroup);
        return;
      }
      requestAnimationFrame(animateSparkles);
    };
    animateSparkles();
  };

  useEffect(() => {
    if (isDead && deathProgress.current < 1) {
      const animateDeath = () => {
        if (deathProgress.current >= 1) return;
        const delta = 0.016;
        const animationSpeed = 0.8 - (0.6 * deathProgress.current);
        const newProgress = Math.min(deathProgress.current + delta * animationSpeed, 1);
        deathProgress.current = newProgress;

        const pulseIntensity = newProgress < 0.5 ?
          Math.sin(newProgress * 20) * 1.3 + 1 :
          Math.sin(newProgress * 20) * 1.2 * (1 - newProgress) + 1;

        materialsRef.current.forEach((material, index) => {
          const individualProgress = Math.min(newProgress * (1 + (index % 3) * 0.1), 1);
          if (individualProgress > 0.2) {
            material.opacity = 1 - ((individualProgress - 0.2) / 0.8);
          }
          material.emissiveIntensity = 0.2 + (newProgress * 3 * pulseIntensity);
          if (newProgress < 0.3) {
            material.emissive.setRGB(0.8, 0.1, 0);
          } else if (newProgress < 0.6) {
            material.emissive.setRGB(
              0.8 + (newProgress - 0.3) * 0.6,
              0.1 + (newProgress - 0.3) * 1.5,
              0
            );
          } else {
            material.emissive.setRGB(
              1,
              0.55 - (newProgress - 0.6) * 1.375,
              0
            );
          }
        });

        if (modelRef.current) {
          let scale = newProgress < 0.3 ?
            1.15 * (1 + newProgress * 0.07) :
            1.15 * (1.07 - ((newProgress - 0.3) / 0.7) * 1.01);
          modelRef.current.scale.set(scale, scale, scale);

          if (newProgress > 0.5 && rbRef.current) {
            rbRef.current.applyImpulse({
              x: (Math.random() - 0.5) * 0.1,
              y: Math.sin(newProgress * 10) * 0.05 + 0.05,
              z: (Math.random() - 0.5) * 0.1
            }, true);
          }
        }

        if ((newProgress > 0.4 && !emitterCreated.current) ||
            (newProgress > 0.6 && emitterCreatedCount.current < 2) ||
            (newProgress > 0.8 && emitterCreatedCount.current < 3)) {
          emitterCreated.current = true;
          emitterCreatedCount.current++;
          createEmberParticles(newProgress);
        }

        if (newProgress > 0.8 && rbRef.current) {
          rbRef.current.applyTorqueImpulse({
            x: Math.sin(newProgress * 20) * 0.01,
            y: 0.02,
            z: Math.cos(newProgress * 20) * 0.01
          }, true);
        }

        if (newProgress >= 0.99 && !deathCompleted.current) {
          if (!sparkleTriggered.current) {
            sparkleTriggered.current = true;
            createSparkleBurst();
          }
          if (onDeathComplete && !deathCompleted.current) {
            if (rbRef.current) {
              rbRef.current.setEnabled(false); // Disable physics interactions
              rbRef.current.resetForces(true); // Clear forces
              rbRef.current.resetTorques(true); // Clear torques
              deathCompleted.current = true
            }
            setTimeout(() => {
            meshesRef.current.forEach(mesh => { mesh.visible = false; });
           
            onDeathComplete();
          }, 1000)
          }
        }

        if (newProgress < 1) { // Only continue if not fully complete
          requestAnimationFrame(animateDeath);
        }
      };

      if (!startedDeathAnimation.current && !deathCompleted.current) {
        startedDeathAnimation.current = true;
        if (rbRef.current) {
          rbRef.current.applyTorqueImpulse({
            x: (Math.random() - 0.5) * 0.8,
            y: (Math.random() - 0.5) * 0.8,
            z: (Math.random() - 0.5) * 0.8
          }, true);
          rbRef.current.applyImpulse({
            x: (Math.random() - 0.5) * 3,
            y: 4 + Math.random() * 3,
            z: (Math.random() - 0.5) * 3
          }, true);
        }
        materialsRef.current.forEach(material => {
          material.emissiveIntensity = 2;
          material.emissive.setRGB(1, 0.2, 0);
        });
        animateDeath();
      }
    }
  }, [isDead, onDeathComplete, rbRef, modelRef, materialsRef, meshesRef, originalScene]);

  return { deathProgress };
};

export default useRoachDeathEffect;