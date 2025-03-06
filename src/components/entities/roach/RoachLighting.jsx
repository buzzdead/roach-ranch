import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

const RoachLighting = ({ isDying }) => {
  const lightRef = useRef();

  useFrame(() => {
    if (isDying && lightRef.current) {
      lightRef.current.visibile = false;
      lightRef.current.intensity = Math.max(0, lightRef.current.intensity - 0.05); // Gradual fade out
    }
  });

  return (
    <pointLight shadow={false} receiveShadow={false} castShadow={false} ref={lightRef} position={[0.2, 0.75, 0.15]} intensity={0.7351} color="orange" />
  );
};

export default RoachLighting;
