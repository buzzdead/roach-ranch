import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Particle constants for easy tweaking
const EMBER_BASE_SIZE = 0.075; // Base size of ember particles
const EMBER_LARGE_SIZE = 0.1;  // Size of larger embers
const EMBER_MAX_COUNT = 15;    // Max number of ember particles
const EMBER_VELOCITY_RANGE = 0.1; // Max velocity spread for embers
const EMBER_UPWARD_VELOCITY = 0.08; // Base upward velocity for embers

const SPARKLE_SIZE = 0.03;     // Smaller size for sparkles (was 0.05)
const SPARKLE_COUNT = 10;      // Number of sparkles in burst
const SPARKLE_VELOCITY_RANGE = 0.1; // Reduced travel distance (was 0.2)
const SPARKLE_LIFE = 0.05;     // Duration of sparkle life (slightly reduced from 0.061)

// Geometries and materials
const emberGeometry = new THREE.SphereGeometry(EMBER_BASE_SIZE, 4, 4);
const emberMaterialPool = Array(3).fill().map(() => new THREE.MeshStandardMaterial({
  emissive: new THREE.Color(1, 0.5, 0),
  emissiveIntensity: 3,
  transparent: true,
  opacity: 0.8,
}));
const sparkleGeometry = new THREE.SphereGeometry(SPARKLE_SIZE, 4, 4);
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
  const deathCompleted = useRef(false);
  const fragmentsCreatedCount = useRef(0);

  const createEmberParticles = (progress) => {
    const emberGroup = new THREE.Group();
    emberGroup.position.set(0, 0, 0);

    const baseCount = 8;
    const particleCount = Math.min(baseCount + Math.floor(progress * 15), EMBER_MAX_COUNT);

    for (let i = 0; i < particleCount; i++) {
      const isLarge = Math.random() > 0.7;
      const size = isLarge ? EMBER_LARGE_SIZE : EMBER_BASE_SIZE;
      const geometry = new THREE.SphereGeometry(size, 4, 4);
      const emberMaterial = emberMaterialPool[i % emberMaterialPool.length].clone();
      emberMaterial.emissive.setRGB(1, 0.4 + Math.random() * 0.3, 0);
      emberMaterial.emissiveIntensity = 5;

      const ember = new THREE.Mesh(geometry, emberMaterial);
      ember.position.set(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.3) * 1.0,
        (Math.random() - 0.5) * 1.2
      );
      emberGroup.add(ember);

      ember.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * EMBER_VELOCITY_RANGE,
          EMBER_UPWARD_VELOCITY + Math.random() * 0.12,
          (Math.random() - 0.5) * EMBER_VELOCITY_RANGE
        ),
        life: isLarge ? 1.5 : 1,
        decay: 0.008 + Math.random() * 0.02,
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
        ember.userData.velocity.y -= 0.001;
        ember.userData.life -= ember.userData.decay;
        ember.material.opacity = ember.userData.life * 0.9;
        const scale = ember.userData.life * (ember.userData.life > 0.5 ? 0.15 : 0.1) + 0.05;
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

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial.clone());
      sparkle.material.emissiveIntensity = 8;
      sparkle.position.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      );
      sparkleGroup.add(sparkle);

      sparkle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * SPARKLE_VELOCITY_RANGE,
          (Math.random() - 0.5) * SPARKLE_VELOCITY_RANGE,
          (Math.random() - 0.5) * SPARKLE_VELOCITY_RANGE
        ),
        life: SPARKLE_LIFE,
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
        const scale = sparkle.userData.life * 8 + 0.2; // Reduced base scale from 0.4
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

  const createFragments = (progress) => {
    const fragmentCount = 15;
    const fragmentGroup = new THREE.Group();

    for (let i = 0; i < fragmentCount; i++) {
      const size = 0.05 + Math.random() * 0.1;
      const fragmentGeometry = new THREE.BoxGeometry(size, size, size);
      const fragmentMaterial = materialsRef.current[0].clone();
      fragmentMaterial.emissive = new THREE.Color(1, 0.3 + Math.random() * 0.2, 0.5);
      fragmentMaterial.transparent = true;

      const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
      fragment.position.set(
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.8
      );

      fragment.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          Math.random() * 0.4,
          (Math.random() - 0.5) * 0.3
        ),
        rotationSpeed: new THREE.Vector3(
          Math.random() * 0.3,
          Math.random() * 0.3,
          Math.random() * 0.3
        ),
        life: 1.5,
        decay: 0.015 + Math.random() * 0.015,
      };

      fragmentGroup.add(fragment);
    }

    if (modelRef.current && modelRef.current.parent) {
      modelRef.current.parent.add(fragmentGroup);
      fragmentGroup.position.copy(modelRef.current.position);
    } else {
      originalScene.add(fragmentGroup);
    }

    const animateFragments = () => {
      let allDead = true;
      fragmentGroup.children.forEach(fragment => {
        if (fragment.userData.life <= 0) {
          fragmentGroup.remove(fragment);
          return;
        }
        allDead = false;
        fragment.position.add(fragment.userData.velocity);
        fragment.userData.velocity.y -= 0.0015;
        fragment.rotation.x += fragment.userData.rotationSpeed.x;
        fragment.rotation.y += fragment.userData.rotationSpeed.y;
        fragment.rotation.z += fragment.userData.rotationSpeed.z;
        fragment.userData.life -= fragment.userData.decay;
        fragment.material.opacity = fragment.userData.life;
        const scale = fragment.userData.life * 0.15 + 0.1;
        fragment.scale.set(scale, scale, scale);
      });

      if (allDead) {
        if (fragmentGroup.parent) fragmentGroup.parent.remove(fragmentGroup);
        return;
      }
      requestAnimationFrame(animateFragments);
    };

    animateFragments();
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
          Math.sin(newProgress * 20) * 2 + 1 :
          Math.sin(newProgress * 20) * 1.2 * (1 - newProgress) + 1;

        materialsRef.current.forEach((material, index) => {
          const individualProgress = Math.min(newProgress * (1 + (index % 3) * 0.1), 1);
          if (individualProgress > 0.2) {
            material.opacity = 1 - ((individualProgress - 0.2) / 0.8);
          }
          material.emissiveIntensity = 1 + (newProgress * 8 * pulseIntensity);
          if (newProgress < 0.4) {
            material.emissive.setRGB(1, 0.3, 0);
          } else if (newProgress < 0.7) {
            material.emissive.setRGB(
              1,
              0.3 + (newProgress - 0.4) * 2,
              (newProgress - 0.4) * 1.5
            );
          } else {
            material.emissive.setRGB(1, 1, 0.8);
          }
        });

        if (modelRef.current) {
          if (newProgress < 0.2) {
            modelRef.current.scale.multiplyScalar(1.0008);
          } else if (newProgress > 0.7) {
            modelRef.current.scale.multiplyScalar(0.95);
          } else if (newProgress > 0.45) {
            modelRef.current.scale.multiplyScalar(0.998);
          }

          if (newProgress > 0.5 && rbRef.current) {
            rbRef.current.applyImpulse({
              x: (Math.random() - 0.5) * 0.051,
              y: Math.sin(newProgress * 10) * 0.05 + 0.09,
              z: (Math.random() - 0.5) * 0.051
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

        if ((newProgress > 0.3 && newProgress < 0.33 && fragmentsCreatedCount.current === 0) ||
            (newProgress > 0.6 && newProgress < 0.63 && fragmentsCreatedCount.current === 1)) {
          fragmentsCreatedCount.current++;
          createFragments(newProgress);
        }

        if (newProgress > 0.8 && rbRef.current) {
          rbRef.current.applyTorqueImpulse({
            x: Math.sin(newProgress * 20) * 0.01,
            y: 0.02,
            z: Math.cos(newProgress * 20) * 0.01
          }, true);
        }

        if (newProgress >= 0.95 && !deathCompleted.current) {
          if (!sparkleTriggered.current) {
            sparkleTriggered.current = true;
            createSparkleBurst();
          }

          if (onDeathComplete && !deathCompleted.current) {
            if (rbRef.current) {
              rbRef.current.setEnabled(false);
              rbRef.current.resetForces(true);
              rbRef.current.resetTorques(true);
              deathCompleted.current = true;
            }
            setTimeout(() => {
              meshesRef.current.forEach(mesh => { mesh.visible = false; });
              onDeathComplete();
            }, 1000);
          }
        }

        if (newProgress < 1) {
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