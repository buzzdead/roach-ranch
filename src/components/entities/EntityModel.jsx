// EntityModel.jsx
import React, { forwardRef, Suspense } from 'react';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useEntityModel } from './entity';

const EntityModel = forwardRef(
  ({ 
    entityType = 'roach',
    originalScene, 
    position, 
    triggerImpact, 
    triggerJump, 
    isDead, 
    onDeathComplete, 
    rigidBodyRef 
  }, ref) => {
    const { config } = useEntityModel({
      entityType,
      originalScene,
      position,
      triggerImpact,
      triggerJump,
      isDead,
      onDeathComplete,
      rigidBodyRef,
      ref
    });

    return (
      <Suspense>
        <RigidBody
          ref={rigidBodyRef}
          position={position}
          enabledRotations={[false, true, false]}
          type="dynamic"
          mass={config.mass}
          gravityScale={2}
          colliders={false}
          friction={0.7}
        >
          <CapsuleCollider
            args={config.collider}
            position={config.colliderPosition}
          />
        </RigidBody>

        <primitive
          ref={ref}
          object={originalScene}
          position={position}
          scale={config.scale}
        />
      </Suspense>
    );
  }
);

export default EntityModel;