import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { createCelestialTexture } from '../utils/textures';
import { COSMIC_WORLD_SCALE } from './CosmicBuilder';

interface ThreeBodyProps {
  body: {
    id: string;
    name: string;
    type: 'planet' | 'star' | 'asteroid' | 'blackhole' | 'nebula' | 'wormhole' | 'orbit';
    x: number;
    y: number;
    z?: number;
    size: number;
    rotationSpeed?: number;
    color?: string;
    rotationX?: number;
    rotationY?: number;
    rotationZ?: number;
    orbitParentId?: string | null;
    orbitRadius?: number;
    orbitSpeed?: number;
    angle?: number;
  };
  isAnimating?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  startDraggingBody: (id: string, initialPoint: THREE.Vector3) => void;
  updateBody: (id: string, updates: any) => void;
  bodies?: any[];
}

export const ThreeBody: React.FC<ThreeBodyProps> = ({ 
  body, 
  isAnimating = true,
  isSelected,
  onSelect,
  startDraggingBody,
  updateBody,
  bodies = []
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const nebulaSecondLayerRef = useRef<THREE.Mesh>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Convert SVG coordinates [0..1000, 0..600] to Three.js centered coordinates or dynamic orbit coordinates
  const calculatedPos = useMemo(() => {
    if (body.type === 'orbit') {
      if (body.orbitParentId && bodies.length > 0) {
        const parent = bodies.find(b => b.id === body.orbitParentId);
        if (parent) {
          return {
            x: (parent.x - 500) * COSMIC_WORLD_SCALE,
            y: -(parent.y - 300) * COSMIC_WORLD_SCALE,
            z: parent.z || 0
          };
        }
      }
      return {
        x: (body.x - 500) * COSMIC_WORLD_SCALE,
        y: -(body.y - 300) * COSMIC_WORLD_SCALE,
        z: body.z || 0
      };
    }

    if (body.orbitParentId && bodies.length > 0) {
      const parent = bodies.find(b => b.id === body.orbitParentId);
      if (parent) {
        if (parent.type === 'orbit') {
          const r = parent.orbitRadius || parent.size || 100;
          const theta = body.angle || 0;
          
          let centerX = parent.x;
          let centerY = parent.y;
          let centerZ = parent.z || 0;
          
          const orbitParent = bodies.find(b => b.id === parent.orbitParentId);
          if (orbitParent) {
            centerX = orbitParent.x;
            centerY = orbitParent.y;
            centerZ = orbitParent.z || 0;
          }
          
          const localPos = new THREE.Vector3(
            Math.cos(theta) * r * COSMIC_WORLD_SCALE,
            Math.sin(theta) * r * COSMIC_WORLD_SCALE,
            0
          );
          
          localPos.applyEuler(new THREE.Euler(parent.rotationX || 0, parent.rotationY || 0, parent.rotationZ || 0));
          
          return {
            x: (centerX - 500) * COSMIC_WORLD_SCALE + localPos.x,
            y: -(centerY - 300) * COSMIC_WORLD_SCALE + localPos.y,
            z: centerZ + localPos.z
          };
        } else {
          const r = body.orbitRadius || Math.sqrt((body.x - parent.x) ** 2 + (body.y - parent.y) ** 2);
          const theta = body.angle || Math.atan2(body.y - parent.y, body.x - parent.x);
          
          return {
            x: (parent.x - 500) * COSMIC_WORLD_SCALE + Math.cos(theta) * r * COSMIC_WORLD_SCALE,
            y: -(parent.y - 300) * COSMIC_WORLD_SCALE + Math.sin(theta) * r * COSMIC_WORLD_SCALE,
            z: body.z || 0
          };
        }
      }
    }
    
    return {
      x: (body.x - 500) * COSMIC_WORLD_SCALE,
      y: -(body.y - 300) * COSMIC_WORLD_SCALE,
      z: body.z || 0
    };
  }, [body, bodies]);

  const threeX = calculatedPos.x;
  const threeY = calculatedPos.y;
  const threeZ = calculatedPos.z;

  // Set up procedural texture based on object type
  const texture = useMemo(() => {
    let typeName = 'rocky';
    if (body.type === 'planet') {
      typeName = 'gasgiant';
    } else if (body.type === 'star') {
      typeName = 'star';
    } else if (body.type === 'blackhole') {
      typeName = 'deep';
    } else if (body.type === 'nebula' || body.type === 'wormhole') {
      typeName = 'nebula';
    } else if (body.type === 'asteroid') {
      typeName = 'rocky';
    }
    
    const baseColor = body.color || (
      body.type === 'star' ? '#facc15' :
      body.type === 'planet' ? '#4ab8ff' :
      body.type === 'blackhole' ? '#a855f7' :
      body.type === 'nebula' ? '#ec4899' :
      body.type === 'wormhole' ? '#c084fc' : '#888888'
    );

    return createCelestialTexture(THREE, typeName, baseColor);
  }, [body.type, body.color]);

  // Visual scaling limits to keep celestial bodies proportional and fit inside the 3D world safely
  const radius = useMemo(() => {
    const baseSize = body.size || 20;
    const baseRadius = baseSize * COSMIC_WORLD_SCALE;

    switch (body.type) {
      case 'star':
        return Math.min(4.0, Math.max(1.0, baseRadius * 0.75));
      case 'planet':
        return Math.min(3.5, Math.max(0.8, baseRadius * 1.1));
      case 'asteroid':
        return Math.min(0.9, Math.max(0.2, baseRadius * 0.65));
      case 'blackhole':
        return Math.min(3.0, Math.max(0.8, baseRadius * 0.75));
      case 'nebula':
        return Math.min(6.5, Math.max(2.0, baseRadius * 0.9));
      case 'wormhole':
        return Math.min(3.5, Math.max(0.8, baseRadius * 0.8));
      default:
        return Math.min(3.0, Math.max(0.5, baseRadius * 0.75));
    }
  }, [body.type, body.size]);

  // Local keys tracking for arrow key rotation
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!isSelected) {
      keysPressed.current = {};
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        keysPressed.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        keysPressed.current[e.key] = false;
        if (meshRef.current) {
          updateBody(body.id, {
            rotationX: meshRef.current.rotation.x,
            rotationY: meshRef.current.rotation.y,
            rotationZ: meshRef.current.rotation.z
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isSelected, body.id, updateBody]);

  // Set mesh rotations on mount or property change
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = body.rotationX || 0;
      meshRef.current.rotation.y = body.rotationY || 0;
      meshRef.current.rotation.z = body.rotationZ || 0;
    }
  }, [body.rotationX, body.rotationY, body.rotationZ]);

  // Frame loops for animations & manual Arrow Key rotations
  useFrame((state, delta) => {
    // Continuous axial spin if simulation is animating
    if (isAnimating && meshRef.current && !isSelected) {
      meshRef.current.rotation.y += (body.rotationSpeed || 0.4) * delta + 0.005;
    }

    // Accretion disk spinning around black hole
    if (isAnimating && ringRef.current) {
      ringRef.current.rotation.z -= 0.6 * delta;
    }

    // Continuous slow opposite spin of second nebula layer for volumetric cloud effect
    if (isAnimating && nebulaSecondLayerRef.current) {
      nebulaSecondLayerRef.current.rotation.y -= 0.15 * delta;
      nebulaSecondLayerRef.current.rotation.x += 0.08 * delta;
    }

    // Delta-time based Arrow Key continuous rotation (manipulates selected object only)
    if (isSelected && meshRef.current) {
      const rotSpeed = 2.0 * delta;
      let changed = false;

      if (keysPressed.current['ArrowLeft']) {
        meshRef.current.rotation.y -= rotSpeed;
        changed = true;
      }
      if (keysPressed.current['ArrowRight']) {
        meshRef.current.rotation.y += rotSpeed;
        changed = true;
      }
      if (keysPressed.current['ArrowUp']) {
        meshRef.current.rotation.x -= rotSpeed;
        changed = true;
      }
      if (keysPressed.current['ArrowDown']) {
        meshRef.current.rotation.x += rotSpeed;
        changed = true;
      }

      if (changed) {
        body.rotationX = meshRef.current.rotation.x;
        body.rotationY = meshRef.current.rotation.y;
        body.rotationZ = meshRef.current.rotation.z;
      }
    }
  });

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    onSelect();
    startDraggingBody(body.id, e.point);
  };

  const renderVisualModel = () => {
    const isWormhole = body.type === 'wormhole';
    const isBlackhole = body.type === 'blackhole';
    const isNebula = body.type === 'nebula';
    const isStar = body.type === 'star';
    const isAsteroid = body.type === 'asteroid';
    const isOrbit = body.type === 'orbit';

    if (isOrbit) {
      if (isAnimating) return null; // Orbits are invisible when animating
      
      const r = (body.orbitRadius || body.size || 100) * COSMIC_WORLD_SCALE;
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(points);

      return (
        <group rotation={[body.rotationX || 0, body.rotationY || 0, body.rotationZ || 0]}>
          <lineLoop geometry={geo}>
            <lineBasicMaterial 
              attach="material" 
              color={isSelected ? "#22d3ee" : "#475569"} 
              opacity={isSelected ? 0.9 : 0.4} 
              transparent 
              linewidth={isSelected ? 2 : 1} 
            />
          </lineLoop>
          {/* Invisible interactive torus helper for easy clicking */}
          <mesh 
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
          >
            <torusGeometry args={[r, 0.4, 8, 32]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      );
    }

    if (isBlackhole) {
      return (
        <group>
          {/* Core singularity */}
          <mesh 
            ref={meshRef}
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
          >
            <sphereGeometry args={[radius * 0.8, 32, 32]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* Accretion disk with angle */}
          <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
            <ringGeometry args={[radius * 0.95, radius * 2.3, 64]} />
            <meshBasicMaterial 
              color={body.color || '#a855f7'} 
              transparent 
              opacity={0.85} 
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          {/* Subtle surrounding lensed glow sphere */}
          <mesh scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[radius * 0.8, 16, 16]} />
            <meshBasicMaterial 
              color={body.color || '#a855f7'} 
              transparent 
              opacity={0.35} 
              blending={THREE.AdditiveBlending} 
            />
          </mesh>
        </group>
      );
    }

    if (isNebula) {
      return (
        <group>
          {/* Layer 1: Base nebula sphere */}
          <mesh 
            ref={meshRef}
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
          >
            <sphereGeometry args={[radius * 1.5, 16, 16]} />
            <meshBasicMaterial 
              map={texture || undefined} 
              color={body.color || '#ec4899'} 
              transparent 
              opacity={0.32} 
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Layer 2: Inner denser glow for 3D depth */}
          <mesh ref={nebulaSecondLayerRef} scale={[0.82, 0.82, 0.82]}>
            <sphereGeometry args={[radius * 1.5, 16, 16]} />
            <meshBasicMaterial 
              map={texture || undefined} 
              color={body.color || '#ec4899'} 
              transparent 
              opacity={0.16} 
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      );
    }

    if (isWormhole) {
      return (
        <group>
          {/* Core portal ring */}
          <mesh 
            ref={meshRef} 
            rotation={[0, Math.PI / 4, 0]}
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
          >
            <torusGeometry args={[radius * 0.8, radius * 0.35, 16, 48]} />
            <meshBasicMaterial 
              map={texture || undefined} 
              color={body.color || '#c084fc'} 
              transparent 
              opacity={0.8} 
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Vortex swirl lines */}
          <mesh scale={[0.7, 0.7, 1.3]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[radius * 0.5, radius * 1.4, 32, 1, true]} />
            <meshBasicMaterial 
              color={body.color || '#c084fc'} 
              transparent 
              opacity={0.3} 
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              wireframe
            />
          </mesh>
        </group>
      );
    }

    if (isStar) {
      return (
        <group>
          <mesh 
            ref={meshRef}
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
            onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
          >
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial 
              map={texture || undefined} 
              color={body.color || '#fff4bd'} 
              toneMapped={false}
            />
          </mesh>
          {/* Glowing hot shell */}
          <mesh scale={[1.14, 1.14, 1.14]}>
            <sphereGeometry args={[radius, 16, 16]} />
            <meshBasicMaterial 
              color={body.color || '#ffaa00'} 
              transparent 
              opacity={0.35} 
              blending={THREE.AdditiveBlending} 
              side={THREE.BackSide} 
            />
          </mesh>
          {/* Physical omnidirectional light output */}
          <pointLight color={body.color || '#ffd000'} intensity={1.8} distance={15} decay={1.5} />
        </group>
      );
    }

    if (isAsteroid) {
      return (
        <mesh 
          ref={meshRef}
          scale={[1.0, 0.82, 1.12]}
          onPointerDown={handlePointerDown}
          onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
          onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
        >
          <dodecahedronGeometry args={[radius, 1]} />
          <meshStandardMaterial 
            map={texture || undefined} 
            color={body.color || undefined}
            roughness={0.9}
            metalness={0.1}
            bumpScale={0.1}
          />
        </mesh>
      );
    }

    // Standard planet
    return (
      <mesh 
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setIsHovered(false); }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial 
          map={texture || undefined} 
          color={body.color || undefined}
          roughness={0.4}
          metalness={0.2}
          bumpScale={0.05}
        />
      </mesh>
    );
  };

  return (
    <group position={[threeX, threeY, threeZ]}>
      {/* Visual Model */}
      {renderVisualModel()}

      {/* Subtle selected halo hologram wrapper around the active object (replaces giant flat lines) */}
      {isSelected && body.type !== 'orbit' && (
        <mesh rotation={[body.rotationX || 0, body.rotationY || 0, body.rotationZ || 0]} scale={[1.15, 1.15, 1.15]}>
          <sphereGeometry args={[radius, 16, 16]} />
          <meshBasicMaterial 
            color="#22d3ee" 
            wireframe 
            transparent 
            opacity={0.22} 
          />
        </mesh>
      )}

      {/* Floating 3D label sprite, automatically billing/scaling with distance */}
      {(isSelected || isHovered) && body.type !== 'orbit' && (
        <Html distanceFactor={14} position={[0, radius + 1.1, 0]} center>
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-mono whitespace-nowrap transition-all duration-300 pointer-events-none select-none border ${
            isSelected 
              ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 font-bold shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
              : 'bg-slate-900/80 border-slate-700/60 text-slate-300'
          }`}>
            {body.name}
          </div>
        </Html>
      )}
    </group>
  );
};
