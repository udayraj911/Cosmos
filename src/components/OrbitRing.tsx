import React from 'react';
import * as THREE from 'three';

interface OrbitRingProps {
  radius: number;
  tilt: number;
  position?: [number, number, number];
}

export const OrbitRing: React.FC<OrbitRingProps> = ({ radius, tilt, position, ...props }) => {
  // Use THREE.RingGeometry with inner and outer radius set very close for a precise thin path
  const innerRadius = radius;
  const outerRadius = radius + 0.3; // thin glowing line path

  // Convert tilt angle from degrees to radians for rotation
  const tiltRad = (tilt * Math.PI) / 180;

  return (
    <mesh position={position} rotation={[tiltRad, 0, 0]} {...props}>
      <ringGeometry args={[innerRadius, outerRadius, 64]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.5} 
        side={THREE.DoubleSide} 
      />
    </mesh>
  );
};
