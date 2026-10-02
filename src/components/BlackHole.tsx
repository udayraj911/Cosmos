import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BlackHoleShader = {
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('#3366ff') },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;

    void main() {
      vec2 p = vUv - 0.5;
      float d = length(p);
      
      // Accretion disk
      float disk = smoothstep(0.4, 0.45, d) - smoothstep(0.45, 0.5, d);
      
      // Rotation
      float angle = atan(p.y, p.x) + uTime;
      float intensity = sin(angle * 10.0 + uTime * 5.0) * 0.5 + 0.5;
      
      vec3 color = uColor * intensity * disk;
      
      // Black hole center
      if (d < 0.4) color = vec3(0.0);
      
      gl_FragColor = vec4(color, disk);
    }
  `
};

export const BlackHole = ({ position = [0, 0, 0] }: { position?: [number, number, number] }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  return (
    <mesh position={new THREE.Vector3(...position)}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        args={[BlackHoleShader]}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};
