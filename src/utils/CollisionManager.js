import * as THREE from 'three'

const CollisionManager = {
  enemies: [],
  player: null,

  registerPlayer(playerRef) {
    playerRef.current.traverse(child => {
      if(child.isMesh)
        this.player = child
    })
    console.log(this.player)
  },
  
  registerEnemy(enemy) {
    this.enemies.push(enemy);
    return () => {
      this.enemies = this.enemies.filter(e => e !== enemy);
    };
  },

  // Add to your CollisionManager
checkParticlePlayerCollision(particlePosition, particleRadius) {
  if (!this.player) return { hit: false };
  
  // Option 1: Use a cone shape as we discussed
  const playerPosition = new THREE.Vector3();
  this.player.getWorldPosition(playerPosition);
  
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
    if (this.player && this.player.onHit) {
      this.player.onHit({
        position: hitPoint,
        particleDirection: new THREE.Vector3() // You'd calculate this from particle movement
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
  
  // Main collision detection function
  checkBulletCollisions(bulletPosition, bulletDirection, maxDistance) {
    const bulletRay = this._createBulletRay(bulletPosition, bulletDirection);
    
    for (const enemy of this.enemies) {
      if (!enemy.mesh) continue;
      
      const meshes = this._findMeshesInGroup(enemy.mesh);
      
      for (const mesh of meshes) {
        if (!mesh.geometry) continue;
        
        const { worldPosition, radius } = this._getMeshBoundingData(mesh);
        
        if (this._isRayIntersectingSphere(bulletRay, worldPosition, radius, bulletPosition, maxDistance)) {
          const hitPoint = this._calculateHitPoint(bulletRay, worldPosition, radius);
          
          enemy.onHit && enemy.onHit({
            position: hitPoint,
            mesh: mesh
          });
          
          return {
            hit: true,
            position: hitPoint,
          };
        }
      }
    }
    
    return { hit: false };
  },

  checkBulletPhysicalCollision(bulletPosition, bulletRadius, bulletDirection) {
    for (const enemy of this.enemies) {
      if (!enemy.mesh) continue;
      
      const meshes = this._findMeshesInGroup(enemy.mesh);
      
      for (const mesh of meshes) {
        if (!mesh.geometry) continue;
        
        const { worldPosition, radius } = this._getMeshBoundingData(mesh);
        
        // Check if bullet physically intersects with the mesh's bounding sphere
        const distance = bulletPosition.distanceTo(worldPosition);
        const intersectionThreshold = radius + bulletRadius;
        
        if (distance <= intersectionThreshold) {
          // Calculate hit point based on bullet position and direction to mesh center
          const direction = new THREE.Vector3().subVectors(worldPosition, bulletPosition).normalize();
          const hitPoint = new THREE.Vector3().copy(bulletPosition).add(
            direction.multiplyScalar(bulletRadius)
          );
          
          enemy.onHit && enemy.onHit({
            position: hitPoint,
            mesh: mesh,
            bulletDirection: bulletDirection
          });
          
          return {
            hit: true,
            position: hitPoint,
          };
        }
      }
    }
    
    return { hit: false };
},
  
  // Helper function to create a bullet ray
  _createBulletRay(bulletPosition, bulletDirection) {
    const rayDirection = bulletDirection.clone().normalize();
    return new THREE.Ray(bulletPosition.clone(), rayDirection);
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
    const radius = mesh.geometry.boundingSphere.radius * maxScale;
    
    return { worldPosition, radius };
  },
  
  // Helper function to check if ray intersects sphere
  _isRayIntersectingSphere(ray, sphereCenter, sphereRadius, bulletPosition, maxDistance) {
    // Calculate distance from sphere center to ray
    const distanceToRay = ray.distanceToPoint(sphereCenter);
    
    // Early exit if ray doesn't pass through sphere
    if (distanceToRay > sphereRadius) return false;
    
    // Check if intersection is in front of bullet and within max distance
    const toTarget = new THREE.Vector3().subVectors(sphereCenter, bulletPosition);
    const projectionDistance = toTarget.dot(ray.direction);
    
    return projectionDistance > 0 && projectionDistance <= maxDistance;
  },
  
  // Helper function to calculate hit point on sphere surface
  _calculateHitPoint(ray, sphereCenter, radius) {
    const closestPoint = new THREE.Vector3();
    ray.closestPointToPoint(sphereCenter, closestPoint);
    
    const hitNormal = new THREE.Vector3().subVectors(closestPoint, sphereCenter).normalize();
    return new THREE.Vector3().copy(sphereCenter).add(hitNormal.multiplyScalar(radius));
  }
};

export default CollisionManager;