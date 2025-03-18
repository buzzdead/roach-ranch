import * as THREE from 'three'

const CollisionManager = {
  enemies: [],
  player: null,

  registerPlayer(playerRef, takeDamage) {
    playerRef.current.traverse(child => {
      if (child.isMesh)
        this.player = { mesh: child, onHit: takeDamage }
    })
  },

  registerEnemy(enemy) {
    enemy.collisionPoints = [
      { offset: new THREE.Vector3(0, 0.5, 0), radius: .5 }, // torso
      { offset: new THREE.Vector3(0, 1.5, 0), radius: 1.33 }, // head
      { offset: new THREE.Vector3(0, 0, -0.8), radius: .5 }  // tail
    ];
    this.enemies.push(enemy);
    console.log(enemy)

    return () => {
      this.enemies = this.enemies.filter(e => e !== enemy);
    };
  },
  checkClawPlayerCollision(clawPosition, clawRadius) {
    if (!this.player || !this.player.mesh) return { hit: false };
    
    const playerPosition = new THREE.Vector3();
    this.player.mesh.getWorldPosition(playerPosition);
    
    // Get distance between claw and player
    const distance = clawPosition.distanceTo(playerPosition);
    
    // If close enough, it's a hit
    if (distance < (clawRadius + 1.0)) { // 1.0 is approximate player radius
      // Get the direction from claw to player (this is the base direction)
      const baseDirection = new THREE.Vector3().subVectors(playerPosition, clawPosition).normalize();
      
      // Create a slashing direction perpendicular to the base direction
      // For a right-to-left slash, we use the cross product with UP vector
      const upVector = new THREE.Vector3(0, 0.5, 0);
      const slashDirection = new THREE.Vector3().crossVectors(baseDirection, upVector).normalize();
      
      // You can also rotate this direction slightly for variability
      // For example, rotate it 20-40 degrees in a random direction
      const rotationAxis = baseDirection.clone();
      const rotationAngle = (Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? .25 : -.25);
      slashDirection.applyAxisAngle(rotationAxis, rotationAngle);
    
      // Calculate hit point
      const hitPoint = clawPosition.clone().add(baseDirection.multiplyScalar(clawRadius));
      hitPoint.y += 0.75;
      
      // Trigger player hit event
      if (this.player.onHit && slashDirection) {
        this.player.onHit({
          position: hitPoint,
          damage: 10, // Set appropriate damage
          direction: slashDirection, // Use slash direction instead of direct hit direction
        });
      }
      
      return {
        hit: true,
        position: hitPoint
      };
    }
    
    return { hit: false };
  },
  // Add to your CollisionManager
  checkParticlePlayerCollision(particlePosition, particleRadius) {
    if (!this.player.mesh) return { hit: false };

    // Option 1: Use a cone shape as we discussed
    const playerPosition = new THREE.Vector3();
    this.player.mesh.getWorldPosition(playerPosition);

    // Define cone parameters (adjust these to fit your player)
    const conePosition = playerPosition.clone();
    conePosition.y += 1.75; // Adjust to center of player
    const coneHeight = 1.7;
    const coneTopRadius = 0.5;
    const coneBottomRadius = 0.2;

    if (this._isPointInConeFrustum(
      particlePosition,
      conePosition,
      new THREE.Vector3(0, -1, 0), // Down direction
      coneHeight,
      coneTopRadius,
      coneBottomRadius
    )) {
      // Calculate hit point (this is simplified - could be improved)
      const hitPoint = particlePosition.clone();

      // Trigger player hit event
      if (this.player.mesh && this.player.onHit) {
        this.player.onHit({
          position: hitPoint,
          particleDirection: new THREE.Vector3(), // You'd calculate this from particle movement
          damage: 0.12,
        });
      }

      return {
        hit: true,
        position: hitPoint
      };
    }

    return { hit: false };
  },

  // Helper function for cone frustum collision (cone with different top and bottom radii)
  _isPointInConeFrustum(point, conePosition, coneDirection, coneHeight, topRadius, bottomRadius) {
    // Convert point to local cone space
    const localPoint = point.clone().sub(conePosition);

    // Project point onto cone axis
    const heightProjection = localPoint.dot(coneDirection);
    if (heightProjection < 0 || heightProjection > coneHeight) return false;

    // Calculate distance from cone axis
    const projectedPoint = coneDirection.clone().multiplyScalar(heightProjection);
    const distanceFromAxis = localPoint.clone().sub(projectedPoint).length();

    // Calculate radius at this height using linear interpolation
    const radiusAtHeight = topRadius + (bottomRadius - topRadius) * (heightProjection / coneHeight);

    return distanceFromAxis <= radiusAtHeight;
  },

  checkBulletPhysicalCollision(bulletPosition, bulletRadius, bulletDirection, damage, bulletId) {
    const MAX_COLLISION_DISTANCE = 10; // Maximum distance to even consider collision
    const SKIP_FRAMES = 5; // Number of frames to skip checking distant enemies
    
    for (const enemy of this.enemies) {
      if (!enemy.mesh) continue;
      
      // Initialize skip counters map if it doesn't exist
      if (!enemy.bulletSkipCounters) {
        enemy.bulletSkipCounters = new Map();
      }
      
      // Get or initialize skip counter for this specific bullet
      let skipCounter = enemy.bulletSkipCounters.get(bulletId) || 0;
      
      // If we're supposed to skip this enemy for this bullet, decrement counter and continue
      if (skipCounter > 0) {
        enemy.bulletSkipCounters.set(bulletId, skipCounter - 1);
        continue;
      }
      
      // Quick distance check to the enemy's center
      const enemyPosition = new THREE.Vector3();
      enemy.mesh.getWorldPosition(enemyPosition);
      const roughDistance = bulletPosition.distanceTo(enemyPosition);
      
      // If enemy is too far from this bullet, set skip counter and continue
      if (roughDistance > MAX_COLLISION_DISTANCE) {
        enemy.bulletSkipCounters.set(bulletId, SKIP_FRAMES);
        continue;
      }
      
      // Actual collision detection - only runs for nearby enemies
      let hit = false;
      let hitPoint = null;
      
      if (enemy.type === 'chicken' && enemy.collisionPoints) {
        // Chicken collision points check
        for (const point of enemy.collisionPoints) {
          const pointWorldPos = new THREE.Vector3().copy(point.offset)
            .applyMatrix4(enemy.mesh.matrixWorld);
          
          const distance = bulletPosition.distanceTo(pointWorldPos);
          if (distance <= (point.radius + bulletRadius)) {
            const direction = new THREE.Vector3().subVectors(pointWorldPos, bulletPosition).normalize();
            hitPoint = new THREE.Vector3().copy(bulletPosition).add(
              direction.multiplyScalar(bulletRadius)
            );
            
            hit = true;
            break;
          }
        }
      } else {
        // Standard collision for other enemy types
        const meshes = this._findMeshesInGroup(enemy.mesh);
        for (const mesh of meshes) {
          if (!mesh.geometry) continue;
          
          const { worldPosition, radius } = this._getMeshBoundingData(mesh);
          const distance = bulletPosition.distanceTo(worldPosition);
          
          if (distance <= (radius + bulletRadius)) {
            const direction = new THREE.Vector3().subVectors(worldPosition, bulletPosition).normalize();
            hitPoint = new THREE.Vector3().copy(bulletPosition).add(
              direction.multiplyScalar(bulletRadius)
            );
            
            hit = true;
            break;
          }
        }
      }
      
      // Handle hit response
      if (hit) {
        // Clean up the skip counter for this bullet since it hit
        enemy.bulletSkipCounters.delete(bulletId);
        
        enemy.onHit && enemy.onHit({
          position: hitPoint,
          mesh: enemy.mesh,
          bulletDirection: bulletDirection,
          damage: damage
        });
        
        return { hit: true, position: hitPoint };
      }
    }
    
    return { hit: false };
  },

  // Helper function to find all meshes in a group
  _findMeshesInGroup(group) {
    const meshes = [];
    group.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });
    return meshes;
  },

  // Helper function to get mesh bounding data
  _getMeshBoundingData(mesh) {
    // Ensure bounding sphere exists
    if (!mesh.geometry.boundingSphere) {
      mesh.geometry.computeBoundingSphere();
    }

    // Get world position
    const worldPosition = new THREE.Vector3();
    mesh.getWorldPosition(worldPosition);

    // Calculate scaled radius
    const scale = new THREE.Vector3();
    mesh.getWorldScale(scale);
    const maxScale = Math.max(scale.x * .5, scale.y * .5, scale.z * .5);
    const radius = mesh.geometry.boundingSphere.radius * maxScale * 1;
   
    return { worldPosition, radius };
  },
};

export default CollisionManager;