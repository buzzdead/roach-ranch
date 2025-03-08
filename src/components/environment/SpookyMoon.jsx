import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const HorrorMoon = () => {
  const moonRef = useRef();
  const { camera } = useThree();

  const moonMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float time;

      float distortedCircle(vec2 uv, vec2 center, float radius) {
        float dist = distance(uv, center);
        float wobble = sin(uv.x * 8.0 + time) * sin(uv.y * 6.0 + time * 0.7) * 0.02;
        return smoothstep(radius + wobble, radius - 0.01 + wobble, dist);
      }

      float grotesqueSmile(vec2 uv, vec2 center) {
        // Base smile shape: a wide, distorted curve
        float smileY = center.y - 0.15;
        float smileWidth = 0.25;
        float smileWarp = sin(time * 1.0 + uv.x * 10.0) * 0.02;
        float smileOpen = 0.01 + sin(time * 0.8) * 0.005;

        float distToSmile = abs(uv.y - smileY + smileWarp) - smileOpen;
        float smileBase = smoothstep(0.02, 0.01, distToSmile);

        float taperedWidth = smileWidth * (0.2 + 0.8 * cos((uv.x - center.x) * 3.14159 / smileWidth));
        float smileMask = step(abs(uv.x - center.x), taperedWidth);

        float holeScale = 0.02 + smileOpen * 0.5;
        float smileHole1 = distortedCircle(uv, center + vec2(-0.08, smileY), holeScale) * step(abs(uv.x - center.x), smileWidth * 0.3);
        float smileHole2 = distortedCircle(uv, center + vec2(0.08, smileY), holeScale) * step(abs(uv.x - center.x), smileWidth * 0.3);
        float smileHoles = max(smileHole1, smileHole2);
        float holeTransparency = 0.6 + smileOpen * 10.0;
        smileBase -= smileHoles * clamp(holeTransparency, 0.6, 1.0);

        float drip = 0.0;
        if (uv.y < smileY && abs(uv.x - center.x) < taperedWidth * 0.8) {
          float dripDist = (smileY - uv.y) * 5.0;
          drip = smoothstep(0.03, 0.0, dripDist) * (0.5 + sin(time * 1.5 + uv.x * 10.0) * 0.2);
        }

        return max(smileBase * smileMask, drip);
      }

     float impressedSmile(vec2 uv, vec2 center) {
  // Base open mouth shape with upward curve
  float mouthY = center.y - 0.15; // Position below eyes
  float mouthWidth = 0.3; // Wider for an open mouth
  float mouthOpen = 0.1 + sin(time * 0.6) * 0.03; // Larger open range with animation
  float mouthCurve = 0.2 * sin((uv.x - center.x) * 3.14159 / mouthWidth); // Stronger upward curve

  // Outer mouth shape with exaggerated opening
  float distToMouth = abs(uv.y - (mouthY + mouthCurve) + mouthOpen * 0.5); // Shift opening upward
  float mouthBase = smoothstep(0.06, 0.03, distToMouth); // Wider smoothstep for openness

  // Mask the mouth to the desired width
  float mouthMask = step(abs(uv.x - center.x), mouthWidth);

  // Add a subtle tremble effect for reactivity
  float tremble = sin(time * 12.0 + uv.x * 25.0) * 0.01; // Faster, more noticeable tremble
  mouthBase += tremble * mouthBase;

  // Combine the shape
  return mouthBase * mouthMask;
}

      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);

        // Create slightly distorted moon body
        float pulseEffect = sin(time * 0.2) * 0.01;
        float moon = distortedCircle(vUv, center, 0.4 + pulseEffect);

        // Flickering eerie glow
        float glowFlicker = 0.3 + sin(time * 5.0) * 0.05;
        float glow = smoothstep(0.5, 0.35, dist) * glowFlicker;

        // Eyes
        float leftEyeSize = 0.07 + sin(time * 0.3) * 0.01;
        float leftEye = distortedCircle(vUv, center + vec2(-0.15, 0.1), leftEyeSize);

        float rightEyeSize = 0.08 + cos(time * 0.3) * 0.01;
        float rightEye = distortedCircle(vUv, center + vec2(0.15, 0.1), rightEyeSize);

        // Grotesque smile with controlled dripping effect (current active smile)
        float smile = grotesqueSmile(vUv, center);

        // Colors
        vec3 moonColor = vec3(0.98, 0.97, 0.9);
        vec3 glowColor = vec3(0.8, 0.2, 0.2) * (0.5 + pulseEffect * 1.0);
        vec3 eyeGlowColor = vec3(0.8, 0.1, 0.1) * (0.3 + sin(time * 2.0) * 0.1);
        vec3 smileColor = vec3(1.0, 0.5, 0.5);

        // Final color calculation
        vec3 finalColor = mix(moonColor, vec3(0.0), leftEye + rightEye);
        finalColor = mix(finalColor, smileColor, smile);

        // Add eye glow
        finalColor += eyeGlowColor * (leftEye + rightEye);

        // Apply glow additively
        vec3 glowContribution = glowColor * glow * (1.0 - moon);
        finalColor = finalColor + glowContribution;

        // Alpha: only show moon or glow, fully transparent elsewhere
        float alpha = moon + (glow * (1.0 - moon));
        alpha = clamp(alpha, 0.0, 1.0);
        if (alpha < 0.5) alpha = 0.0;

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  useFrame((state, delta) => {
    if (moonMaterial) {
      moonMaterial.uniforms.time.value += delta;
    }

    if (moonRef.current) {
      const worldPosition = new THREE.Vector3();
      camera.getWorldPosition(worldPosition);

      moonRef.current.position.x = worldPosition.x + 250;
      moonRef.current.position.y = worldPosition.y + 350;
      moonRef.current.position.z = worldPosition.z - 450;

      moonRef.current.lookAt(camera.position);
    }
  });

  return (
    <mesh ref={moonRef} renderOrder={6}>
      <planeGeometry args={[200, 200]} />
      <primitive object={moonMaterial} attach="material" />
      <pointLight color="#ff9c50" intensity={1.5} distance={500} decay={2} />
    </mesh>
  );
};

export default HorrorMoon;