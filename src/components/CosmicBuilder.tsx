import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, ArrowLeft, Menu, Star, Target, Settings, HelpCircle, X, Globe, Circle, Shield } from 'lucide-react';
import { DetailsSidebar } from './DetailsSidebar';
import { HamburgerMenu } from './HamburgerMenu';
import { SectionOverlay } from './SectionOverlay';
import { ObjectInspector } from './ObjectInspector';
import { OrbitSystem } from './OrbitSystem';
import { BinaryOrbitSystem } from './BinaryOrbitSystem';
import { OrbitRing } from './OrbitRing';
import { ThreeBody } from './ThreeBody';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ASSETS } from './AssetRepository';

const CameraController: React.FC<{ scaleFactor: number }> = ({ scaleFactor }) => {
  const { camera, invalidate } = useThree();
  const lastScaleRef = useRef<number | null>(null);

  useEffect(() => {
    if (lastScaleRef.current !== scaleFactor) {
      if ('isOrthographicCamera' in camera && camera.isOrthographicCamera) {
        (camera as any).zoom = 1 / scaleFactor;
        camera.updateProjectionMatrix();
      } else {
        (camera as any)._initialZ = 40;
        camera.position.z = 40 * scaleFactor;
        camera.position.x = 0;
        camera.position.y = 0;
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
      }
      lastScaleRef.current = scaleFactor;
      invalidate();
    }
  }, [camera, scaleFactor, invalidate]);

  return null;
};

export interface CelestialBody {
  id: string;
  name: string;
  type: 'planet' | 'star' | 'asteroid' | 'blackhole' | 'nebula' | 'wormhole' | 'orbit';
  x: number;
  y: number;
  z?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  size: number;
  rotationSpeed: number;
  orbitSpeed: number;
  orbitParentId: string | null;
  lightingIntensity: number;
  vx: number;
  vy: number;
  color?: string;
  energy?: number;
  gravity?: number;
  mass?: number;
  hasOrbit?: boolean;
  orbitRadius?: number;
  orbitInclination?: number;
  isBinary?: boolean;
  barycenterId?: string | null;
  angle?: number;
  barycenterX?: number;
  barycenterY?: number;
  orbits?: { radius: number; tilt: number }[];
}

// Centralized scaling configuration for celestial sizes in the normalized world coordinate system
export const COSMIC_WORLD_SCALE = 0.05; // Perfect 50x30 world boundary coordinate scaling factor

export const CELESTIAL_BASE_SIZES: Record<CelestialBody['type'], number> = {
  star: 42,       // Star size
  planet: 17,     // Planet is small
  asteroid: 7,    // Asteroid is very small
  blackhole: 24,  // Black hole is medium
  nebula: 60,     // Nebula is larger but not screen filling
  wormhole: 22,   // Wormhole size
  orbit: 100
};

export const createCelestialBody = (
  type: CelestialBody['type'],
  x: number,
  y: number,
  customSize?: number
): CelestialBody => {
  const baseSize = customSize || CELESTIAL_BASE_SIZES[type] || 20;

  const defaultColors: Record<string, string> = {
    planet: '#4ab8ff',
    asteroid: '#94a3b8',
    blackhole: '#a855f7',
    star: '#facc15',
    nebula: '#ec4899',
    wormhole: '#c084fc',
    orbit: '#22d3ee'
  };
  const bodyColor = defaultColors[type] || '#94a3b8';

  return {
    id: Date.now().toString() + Math.random().toString(),
    name: `${type.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    type,
    x,
    y,
    z: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    size: baseSize,
    rotationSpeed: type === 'orbit' ? 0 : (0.4 + Math.random() * 0.7),
    orbitSpeed: type === 'orbit' ? 1.0 : (type === 'asteroid' ? 1.5 : 0),
    orbitParentId: null,
    lightingIntensity: type === 'orbit' ? 0 : 70,
    vx: type === 'asteroid' ? (Math.random() - 0.5) * 2 : 0,
    vy: type === 'asteroid' ? (Math.random() - 0.5) * 2 : 0,
    color: bodyColor,
    mass: type === 'blackhole' ? 95 : (type === 'star' ? 85 : 40),
    gravity: type === 'blackhole' ? 90 : (type === 'star' ? 70 : 25),
    hasOrbit: false,
    orbitRadius: type === 'orbit' ? 100 : 80,
    orbitInclination: 15,
    orbits: []
  };
};


const InteractiveCanvasController: React.FC<{
  activeTool: string;
  setActiveTool: (tool: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  bodies: CelestialBody[];
  updateBody: (id: string, updates: Partial<CelestialBody>) => void;
  addCelestialObject: (x: number, y: number, z?: number) => void;
  controlsEnabled: boolean;
  setControlsEnabled: (enabled: boolean) => void;
  startDraggingBody: (id: string, point: THREE.Vector3) => void;
  draggingIdRef: React.MutableRefObject<string | null>;
  initialPointer: React.MutableRefObject<THREE.Vector3>;
  initialPos: React.MutableRefObject<{ x: number, y: number, z: number }>;
}> = ({
  activeTool,
  setActiveTool,
  selectedId,
  setSelectedId,
  bodies,
  updateBody,
  addCelestialObject,
  controlsEnabled,
  setControlsEnabled,
  startDraggingBody,
  draggingIdRef,
  initialPointer,
  initialPos
}) => {
  const { camera, raycaster } = useThree();
  const ghostRef = useRef<THREE.Group>(null);
  const isShiftPressed = useRef(false);
  const [isGhostValid, setIsGhostValid] = useState(true);

  const isPlacementMode = ['planet', 'star', 'blackhole', 'nebula', 'asteroid', 'wormhole', 'orbit'].includes(activeTool);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        isShiftPressed.current = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        isShiftPressed.current = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state) => {
    if (isPlacementMode && ghostRef.current) {
      const mouse = state.pointer;
      raycaster.setFromCamera(mouse, camera);
      
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      
      ghostRef.current.position.copy(intersection);
      
      let collision = false;
      const threshold = 3.5;
      for (const b of bodies) {
        const bx = (b.x - 500) * COSMIC_WORLD_SCALE;
        const by = -(b.y - 300) * COSMIC_WORLD_SCALE;
        const bz = b.z || 0;
        
        const dx = bx - intersection.x;
        const dy = by - intersection.y;
        const dz = bz - intersection.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          collision = true;
          break;
        }
      }
      if (isGhostValid !== !collision) {
        setIsGhostValid(!collision);
      }
    }
  });

  return (
    <>
      <mesh
        position={[0, 0, 0]}
        onPointerMove={(e) => {
          e.stopPropagation();
          const dragId = draggingIdRef.current;
          if (dragId) {
            const body = bodies.find(b => b.id === dragId);
            if (body) {
              const currentPoint = e.point;
              const deltaX = currentPoint.x - initialPointer.current.x;
              const deltaY = currentPoint.y - initialPointer.current.y;
              
              if (isShiftPressed.current || e.shiftKey) {
                const newZ = initialPos.current.z + (currentPoint.y - initialPointer.current.y) * 1.5;
                const clampedZ = Math.min(25, Math.max(-25, newZ));
                updateBody(dragId, { z: clampedZ });
              } else {
                const newThreeX = initialPos.current.x + deltaX;
                const newThreeY = initialPos.current.y + deltaY;
                
                const newX = (newThreeX / COSMIC_WORLD_SCALE) + 500;
                const newY = -(newThreeY / COSMIC_WORLD_SCALE) + 300;
                
                const snappedX = Math.round(newX / 10) * 10;
                const snappedY = Math.round(newY / 10) * 10;
                
                const constrainedX = Math.max(100, Math.min(900, snappedX));
                const constrainedY = Math.max(100, Math.min(500, snappedY));
                
                updateBody(dragId, { x: constrainedX, y: constrainedY });
              }
            }
          }
        }}
        onPointerUp={(e) => {
          if (draggingIdRef.current) {
            e.stopPropagation();
            draggingIdRef.current = null;
            setControlsEnabled(true);
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isPlacementMode) {
            if (isGhostValid && ghostRef.current) {
              const pt = ghostRef.current.position;
              addCelestialObject(pt.x, pt.y, pt.z);
              setActiveTool('select');
            }
          } else {
            setSelectedId(null);
          }
        }}
      >
        <planeGeometry args={[1000, 1000]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {isPlacementMode && (
        <group ref={ghostRef}>
          {activeTool === 'orbit' ? (
            <group>
              <lineLoop>
                <bufferGeometry attach="geometry" {...(() => {
                  const r = 100 * COSMIC_WORLD_SCALE;
                  const points = [];
                  const segments = 64;
                  for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    points.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
                  }
                  return new THREE.BufferGeometry().setFromPoints(points);
                })()} />
                <lineBasicMaterial 
                  attach="material" 
                  color={isGhostValid ? "#22d3ee" : "#ef4444"} 
                  opacity={0.6} 
                  transparent 
                />
              </lineLoop>
            </group>
          ) : (
            <mesh>
              <sphereGeometry args={[2.0, 32, 32]} />
              <meshBasicMaterial 
                color={isGhostValid ? "#22d3ee" : "#ef4444"} 
                transparent 
                opacity={0.5} 
                wireframe
              />
            </mesh>
          )}
          <Html distanceFactor={14} position={[0, activeTool === 'orbit' ? 0.5 : 2.5, 0]} center>
            <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase whitespace-nowrap border ${
              isGhostValid ? 'bg-cyan-950/90 text-cyan-400 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-red-950/90 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
            }`}>
              {isGhostValid ? `Place ${activeTool}` : 'Collision Warning'}
            </div>
          </Html>
        </group>
      )}
    </>
  );
};


export const CosmicBuilder: React.FC<{onBackToHub: () => void}> = ({onBackToHub}) => {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem('cosmos_builder_current_page');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [pages, setPages] = useState<Record<number, CelestialBody[]>>(() => {
    try {
      const saved = localStorage.getItem('cosmos_builder_pages');
      return saved ? JSON.parse(saved) : { 0: [] };
    } catch {
      return { 0: [] };
    }
  });

  const [particles, setParticles] = useState<any[]>([]);

  const [isPhysicsModeActive, setIsPhysicsModeActive] = useState(false);
  const [collisionSensitivity, setCollisionSensitivity] = useState(5);
  const collisionCooldownsRef = useRef<Record<string, number>>({});
  const prevPositionsRef = useRef<Record<string, { x: number, y: number }>>({});

  const [history, setHistory] = useState<Record<number, CelestialBody[]>[]>(() => {
    try {
      const saved = localStorage.getItem('cosmos_builder_pages');
      return saved ? [JSON.parse(saved)] : [{ 0: [] }];
    } catch {
      return [{ 0: [] }];
    }
  });

  const [historyPtr, setHistoryPtr] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [placementError, setPlacementError] = useState(false);
  const [connections, setConnections] = useState<{aId: string, bId: string}[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [inventory, setInventory] = useState<CelestialBody[]>([]);
  const [selectedBodyForInspector, setSelectedBodyForInspector] = useState<CelestialBody | null>(null);

  const [scaleFactor, setScaleFactor] = useState<number>(1.0);

  const [controlsEnabled, setControlsEnabled] = useState(true);
  const draggingIdRef = useRef<string | null>(null);
  const initialPointer = useRef<THREE.Vector3>(new THREE.Vector3());
  const initialPos = useRef<{ x: number, y: number, z: number }>({ x: 0, y: 0, z: 0 });

  const startDraggingBody = (id: string, point: THREE.Vector3) => {
    const body = (pages[currentPage] || []).find(b => b.id === id);
    if (body) {
      draggingIdRef.current = id;
      initialPointer.current.copy(point);
      initialPos.current = {
        x: (body.x - 500) * COSMIC_WORLD_SCALE,
        y: -(body.y - 300) * COSMIC_WORLD_SCALE,
        z: body.z || 0
      };
      setControlsEnabled(false);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('cosmos_builder_pages', JSON.stringify(pages));
    } catch (err) {
      console.error("Failed to save pages to localStorage:", err);
    }
  }, [pages]);

  useEffect(() => {
    try {
      localStorage.setItem('cosmos_builder_current_page', currentPage.toString());
    } catch (err) {
      console.error("Failed to save currentPage to localStorage:", err);
    }
  }, [currentPage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.hasAttribute('contenteditable')
      )) {
        return;
      }

      if (e.key === '+' || e.key === '=' || e.key === 'Add') {
        setScaleFactor(prev => Math.max(0.2, prev * 0.9));
      } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
        setScaleFactor(prev => Math.min(5.0, prev * 1.1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentBodies = pages[currentPage] || [];
  
  const addToInventory = (body: CelestialBody) => {
      setInventory(prev => [...prev, body]);
  };

  // Helper: Save to history
  const saveHistory = (newPages: Record<number, CelestialBody[]>) => {
      const newHistory = history.slice(0, historyPtr + 1);
      newHistory.push(newPages);
      setHistory(newHistory);
      setHistoryPtr(newHistory.length - 1);
  };
  
  const undo = () => {
      if (historyPtr > 0) {
          setHistoryPtr(prev => prev - 1);
          setPages(history[historyPtr - 1]);
      }
  };

  const redo = () => {
      if (historyPtr < history.length - 1) {
          setHistoryPtr(prev => prev + 1);
          setPages(history[historyPtr + 1]);
      }
  };

  const updateBody = (id: string, updates: Partial<CelestialBody>) => {
    const prevBodies = pages[currentPage] || [];
    
    // If we are updating a planet/body that is attached to an orbit,
    // and we are updating its coordinates (x, y), we should instead calculate its new angle,
    // and derive its x and y coordinates on the orbit!
    let finalUpdates = { ...updates };
    const targetBodyInState = prevBodies.find(b => b.id === id);
    if (targetBodyInState && targetBodyInState.orbitParentId && (updates.x !== undefined || updates.y !== undefined)) {
      const parent = prevBodies.find(b => b.id === targetBodyInState.orbitParentId);
      if (parent && parent.type === 'orbit') {
        let cx = parent.x;
        let cy = parent.y;
        const orbitParent = prevBodies.find(b => b.id === parent.orbitParentId);
        if (orbitParent) {
          cx = orbitParent.x;
          cy = orbitParent.y;
        }
        
        const dragX = updates.x !== undefined ? updates.x : targetBodyInState.x;
        const dragY = updates.y !== undefined ? updates.y : targetBodyInState.y;
        const newAngle = Math.atan2(dragY - cy, dragX - cx);
        const r = parent.orbitRadius || parent.size || 100;
        
        finalUpdates = {
          ...finalUpdates,
          angle: newAngle,
          x: cx + Math.cos(newAngle) * r,
          y: cy + Math.sin(newAngle) * r
        };
      }
    }

    // Helper function to recursively update child coordinates
    const applyUpdatesAndCascade = (bodiesList: CelestialBody[], targetId: string, targetUpdates: Partial<CelestialBody>): CelestialBody[] => {
      // First, apply updates to the target body
      let list = bodiesList.map(b => b.id === targetId ? { ...b, ...targetUpdates } : b);
      
      // Find children whose parent is targetId
      list.forEach(child => {
        if (child.orbitParentId === targetId) {
          const targetBody = list.find(b => b.id === targetId);
          if (targetBody) {
            if (child.type === 'orbit') {
              // Orbit's position must match parent exactly
              const childUpdates = {
                x: targetBody.x,
                y: targetBody.y,
                z: targetBody.z || 0
              };
              list = applyUpdatesAndCascade(list, child.id, childUpdates);
            } else if (targetBody.type === 'orbit') {
              // Planet's position is derived from orbit center + radius + angle
              const r = targetBody.orbitRadius || targetBody.size || 100;
              const theta = child.angle || 0;
              
              // Find orbit's parent (Star)
              let cx = targetBody.x;
              let cy = targetBody.y;
              const orbitParent = list.find(b => b.id === targetBody.orbitParentId);
              if (orbitParent) {
                cx = orbitParent.x;
                cy = orbitParent.y;
              }
              
              const childUpdates = {
                x: cx + Math.cos(theta) * r,
                y: cy + Math.sin(theta) * r
              };
              list = applyUpdatesAndCascade(list, child.id, childUpdates);
            } else {
              // Standard orbit around normal body (not custom orbit)
              const r = child.orbitRadius || Math.round(Math.sqrt((child.x - targetBody.x) ** 2 + (child.y - targetBody.y) ** 2));
              const theta = child.angle || Math.atan2(child.y - targetBody.y, child.x - targetBody.x);
              const childUpdates = {
                x: targetBody.x + Math.cos(theta) * r,
                y: targetBody.y + Math.sin(theta) * r
              };
              list = applyUpdatesAndCascade(list, child.id, childUpdates);
            }
          }
        }
      });
      
      return list;
    };

    const nextBodies = applyUpdatesAndCascade(prevBodies, id, finalUpdates);
    const newPages = { ...pages, [currentPage]: nextBodies };
    setPages(newPages);
    saveHistory(newPages);
  };

  const deleteBody = (id: string) => {
    const nextBodies = currentBodies.filter(b => b.id !== id);
    const newPages = {...pages, [currentPage]: nextBodies};
    setPages(newPages);
    saveHistory(newPages);
    setSelectedId(null);
  };
  
  const selectedBody = currentBodies.find(b => b.id === selectedId);

  // Enhancement for better details
  const updateDetailedBody = (id: string, updates: any) => {
      updateBody(id, updates);
  };

  const handleBodyClick = (id: string) => {
    if (activeTool === 'wormhole') {
        const last = connections[connections.length - 1];
        if (connections.length === 0 || (last && last.bId)) {
            setConnections([...connections, {aId: id, bId: ''}]);
        } else {
            setConnections(connections.map((c, i) => i === connections.length - 1 ? {...c, bId: id} : c));
        }
    } else if (activeTool === 'orbit') {
        if (selectedId && selectedId !== id) {
            updateBody(id, { orbitParentId: selectedId, orbitSpeed: 1 });
            setSelectedId(null);
        } else {
            setSelectedId(id);
        }
    } else {
        setSelectedId(id);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    if (!type || !['planet', 'star', 'asteroid', 'blackhole', 'nebula', 'wormhole', 'orbit'].includes(type)) return;

    const svgElement = e.currentTarget.querySelector('svg') as SVGSVGElement | null;
    if (!svgElement) return;

    try {
      const point = svgElement.createSVGPoint();
      point.x = e.clientX;
      point.y = e.clientY;
      const ctm = svgElement.getScreenCTM();
      if (!ctm) return;
      const svgPoint = point.matrixTransform(ctm.inverse());
      
      let x = svgPoint.x;
      let y = svgPoint.y;

      // Snap-to-position functionality (using 20px grid increment snap alignment)
      x = Math.round(x / 20) * 20;
      y = Math.round(y / 20) * 20;

      // Constrain positions to the central 100x100 world boundary of the builder space (SVG x: [450..550], y: [250..350]) to guarantee immediate visibility
      x = Math.max(450, Math.min(550, x));
      y = Math.max(250, Math.min(350, y));

      if (type === 'orbit') {
        let closestBody: any = null;
        let minDistance = Infinity;
        currentBodies.forEach(b => {
          const dx = b.x - x;
          const dy = b.y - y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < minDistance) {
            minDistance = dist;
            closestBody = b;
          }
        });
        if (closestBody && minDistance < 120) {
          const currentOrbits = closestBody.orbits || [];
          const newRadius = 75 + currentOrbits.length * 35;
          const updatedOrbits = [...currentOrbits, { radius: newRadius, tilt: 15 }];
          updateBody(closestBody.id, {
            hasOrbit: true,
            orbits: updatedOrbits
          });
          return;
        }
      }

      const nextBodies = [
        ...currentBodies,
        createCelestialBody(type as CelestialBody['type'], x, y)
      ];

      const newPages = {...pages, [currentPage]: nextBodies};
      setPages(newPages);
      saveHistory(newPages);
    } catch (err) {
      console.error("Drop coordinate translation failed:", err);
    }
  };

  const spawnBody = (type: CelestialBody['type']) => {
    // Spawns exactly one object near the center of the viewport
    let x = 500;
    let y = 300;
    
    // Add randomized minor offset to prevent stacking multiple spawned bodies directly on top of each other
    while (currentBodies.some(b => Math.abs(b.x - x) < 30 && Math.abs(b.y - y) < 30)) {
      x += (Math.random() - 0.5) * 60;
      y += (Math.random() - 0.5) * 60;
    }
    
    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;
    
    // Keep it in the finite workspace
    x = Math.max(100, Math.min(900, x));
    y = Math.max(100, Math.min(500, y));

    const newBody = createCelestialBody(type, x, y);
    const nextBodies = [...currentBodies, newBody];
    const newPages = { ...pages, [currentPage]: nextBodies };
    
    setPages(newPages);
    saveHistory(newPages);
    setSelectedId(newBody.id); // Auto-select the newly spawned body to inspect immediately
    
    console.log(`[CosmicBuilder] Click-spawned exactly one "${type}" at: (${x}, ${y})`, newBody);
  };

  const addCelestialObject = (threeX: number, threeY: number, threeZ: number = 0) => {
    const type = activeTool;
    console.log(`[CosmicBuilder] addCelestialObject() called for activeTool: "${type}" at ThreeJS coordinate position:`, { threeX, threeY, threeZ });

    // Convert 3D coordinates back to SVG layout coordinates [0..1000, 0..600] using the centralized scaling constant
    let x = threeX / COSMIC_WORLD_SCALE + 500;
    let y = -threeY / COSMIC_WORLD_SCALE + 300;

    // Snap-to-position functionality (using 20px grid increment snap alignment)
    x = Math.round(x / 20) * 20;
    y = Math.round(y / 20) * 20;

    // Constrain positions to the full finite workspace boundaries of the builder space to prevent infinite world drifting
    x = Math.max(80, Math.min(920, x));
    y = Math.max(80, Math.min(520, y));

    if (type === 'orbit') {
      console.log(`[CosmicBuilder] Tool is "orbit". Syncing orbital loop around closest parent...`);
      let closestBody: any = null;
      let minDistance = Infinity;
      currentBodies.forEach(b => {
        const dx = b.x - x;
        const dy = b.y - y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestBody = b;
        }
      });
      if (closestBody && minDistance < 120) {
        const currentOrbits = closestBody.orbits || [];
        const newRadius = 75 + currentOrbits.length * 35;
        const updatedOrbits = [...currentOrbits, { radius: newRadius, tilt: 15 }];
        console.log(`[CosmicBuilder] Deploying orbital trajectory loop to body: ${closestBody.name}`);
        updateBody(closestBody.id, {
          hasOrbit: true,
          orbits: updatedOrbits
        });
        return;
      }
    }

    const newBody = createCelestialBody(type as CelestialBody['type'], x, y);
    newBody.z = threeZ;

    console.log(`[CosmicBuilder] Object compiled successfully:`, newBody);
    const nextBodies = [...currentBodies, newBody];

    const newPages = {...pages, [currentPage]: nextBodies};
    setPages(newPages);
    saveHistory(newPages);
    setSelectedId(newBody.id);
    console.log(`[CosmicBuilder] pages state updated. Current page bodies count:`, nextBodies.length);
  };

  const addBody = (e: React.MouseEvent<any>) => {
    if (isDragging) return;
    const target = e.target as HTMLElement;
    console.log(`[CosmicBuilder] addBody() event handler triggered. Click target:`, target.tagName, `ID: "${target.id}"`);

    // Ignore clicks on buttons, sidebars, menus, etc.
    if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('.DetailsSidebar') || target.closest('.SectionOverlay') || target.closest('.HamburgerMenu')) {
      return;
    }

    const isValidBgClick = 
      target.id === 'builder-bg' || 
      target.tagName === 'svg' || 
      target.tagName === 'rect' || 
      (target.tagName === 'path' && target.closest('pattern'));

    if (isValidBgClick) {
      console.log(`[CosmicBuilder] Background click - clearing selection.`);
      setSelectedId(null);
    }
  };


  React.useEffect(() => {
    (window as any).addCelestialObject = addCelestialObject;
    return () => {
      delete (window as any).addCelestialObject;
    };
  }, [currentBodies, activeTool, pages, currentPage]);

  React.useEffect(() => {
    console.log('[CosmicBuilder] activeTool updated to:', activeTool);
    if (activeTool) {
      document.body.style.cursor = 'crosshair';
    } else {
      document.body.style.cursor = 'default';
    }
    return () => {
      document.body.style.cursor = '';
    };
  }, [activeTool]);

  React.useEffect(() => {
    const builderWorldBounds = {
      xMin: -500 * COSMIC_WORLD_SCALE,
      xMax: 500 * COSMIC_WORLD_SCALE,
      yMin: -300 * COSMIC_WORLD_SCALE,
      yMax: 300 * COSMIC_WORLD_SCALE
    };
    const cameraDistance = 40 * scaleFactor;
    
    let maxOrbitRadius = 0;
    let largestRadius = -Infinity;
    let smallestRadius = Infinity;
    
    currentBodies.forEach(b => {
      const size = b.size || 20;
      const r = size * COSMIC_WORLD_SCALE * 0.75;
      if (r > largestRadius) largestRadius = r;
      if (r < smallestRadius) smallestRadius = r;
      if (b.orbitRadius && b.orbitRadius > maxOrbitRadius) {
        maxOrbitRadius = b.orbitRadius;
      }
    });

    console.log(`[CosmicBuilder] currentBodies state reactive update. Count:`, currentBodies.length, `Bodies:`, currentBodies);
    console.log(`[CosmicBuilder World Scale Telemetry]:`, {
      builderWorldBounds,
      cameraDistance,
      maxOrbitRadius: maxOrbitRadius * COSMIC_WORLD_SCALE,
      largestObjectRadius: largestRadius === -Infinity ? 'N/A' : largestRadius,
      smallestObjectRadius: smallestRadius === Infinity ? 'N/A' : smallestRadius
    });
  }, [currentBodies, currentPage, scaleFactor]);


  const createFragments = (x: number, y: number, color: string, count: number, baseScale: number, bodyType: string) => {
    const newFrags = [];
    for (let k = 0; k < count; k++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 4.5;
      const size = (0.4 + Math.random() * 0.8) * baseScale;
      newFrags.push({
        id: Date.now().toString() + Math.random().toString(),
        x: x + Math.cos(angle) * (Math.random() * 8),
        y: y + Math.sin(angle) * (Math.random() * 8),
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 1.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        size: size,
        color: color,
        life: 80 + Math.floor(Math.random() * 50),
        maxLife: 130,
        isGlow: false
      });
    }
    // Add some brief dust/glow sparkles for cinematic feedback
    for (let k = 0; k < count / 2; k++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.5;
      newFrags.push({
        id: Date.now().toString() + Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: 0,
        rotationSpeed: 0,
        size: Math.random() * 12 + 6,
        color: color,
        life: 40 + Math.floor(Math.random() * 30),
        maxLife: 70,
        isGlow: true
      });
    }
    return newFrags;
  };


  React.useEffect(() => {
    if (!isAnimating) return;
    
    let frameId: number;
    let count = 0;
    const animate = () => {
      count++;
      
      if (count % 2 === 0) {
        const newlyCollidedParticles: any[] = [];

        // Decrement collision cooldowns
        const cooldowns = collisionCooldownsRef.current;
        for (const key in cooldowns) {
          if (cooldowns[key] > 0) {
            cooldowns[key]--;
          } else {
            delete cooldowns[key];
          }
        }

        setPages(prevPages => {
            const prevBodies = prevPages[currentPage] || [];
            const blackholes = prevBodies.filter(b => b.type === 'blackhole');
            
            // Track previous positions for precise velocity/speed estimations
            prevBodies.forEach(body => {
              prevPositionsRef.current[body.id] = { x: body.x, y: body.y };
            });

            // Step 1: Calculate normal orbital / inertia movement
            // First, update all orbit positions to match their parents' current positions
            let nextBodies = prevBodies.map(body => {
              if (body.type === 'orbit' && body.orbitParentId) {
                const parent = prevBodies.find(b => b.id === body.orbitParentId);
                if (parent) {
                  return {
                    ...body,
                    x: parent.x,
                    y: parent.y,
                    z: parent.z || 0
                  };
                }
              }
              return body;
            });

            nextBodies = nextBodies.map(body => {
              if (body.type === 'blackhole') {
                return body; // Black holes are the gravitational anchors, they don't move themselves
              }

              // Check if body is free-floating (no orbit parent)
              if (!body.orbitParentId) {
                if (body.type === 'asteroid' || isPhysicsModeActive) {
                  let fx = 0;
                  let fy = 0;
                  const G = 0.5;

                  nextBodies.forEach(other => {
                    if (body.id === other.id) return;
                    const dx = other.x - body.x;
                    const dy = other.y - body.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 5) return;
                    
                    const mass = (other.mass || other.size) * (other.type === 'blackhole' ? 5 : 1);
                    const force = (G * mass * (body.mass || body.size)) / (dist * dist);
                    fx += (force * dx) / dist;
                    fy += (force * dy) / dist;
                  });

                  const currentVx = body.vx !== undefined ? body.vx : 0;
                  const currentVy = body.vy !== undefined ? body.vy : 0;
                  const bSize = body.size || 10;

                  return {
                    ...body,
                    vx: currentVx + fx / (bSize * 0.1),
                    vy: currentVy + fy / (bSize * 0.1),
                    x: body.x + currentVx,
                    y: body.y + currentVy
                  };
                }
              }

              // Check if the body orbits a parent
              const parent = nextBodies.find(b => b.id === body.orbitParentId);
              if (parent) {
                if (parent.type === 'orbit') {
                  // Orbit parent: revolve at the speed designated by the orbit parent
                  const speed = parent.orbitSpeed !== undefined ? parent.orbitSpeed : 1.0;
                  const r = parent.orbitRadius || parent.size || 100;
                  const newAngle = (body.angle || 0) + (0.008 * speed);
                  
                  let cx = parent.x;
                  let cy = parent.y;
                  const orbitParent = nextBodies.find(b => b.id === parent.orbitParentId);
                  if (orbitParent) {
                    cx = orbitParent.x;
                    cy = orbitParent.y;
                  }

                  return {
                    ...body,
                    angle: newAngle,
                    x: cx + Math.cos(newAngle) * r,
                    y: cy + Math.sin(newAngle) * r
                  };
                } else if (body.orbitSpeed !== 0) {
                  const centerX = parent.x;
                  const centerY = parent.y;
                  const angle = Math.atan2(body.y - centerY, body.x - centerX);
                  const distToParent = Math.sqrt((body.x - centerX) ** 2 + (body.y - centerY) ** 2);
                  const newAngle = angle + (0.008 * (body.orbitSpeed !== undefined ? body.orbitSpeed : 1.0));
                  
                  return {
                    ...body,
                    angle: newAngle,
                    x: centerX + Math.cos(newAngle) * distToParent,
                    y: centerY + Math.sin(newAngle) * distToParent
                  };
                }
              }
              return body;
            });

            // Step 2: Apply Black Hole gravitational pull and Event Horizon ingestion
            const bodiesAfterGravity: any[] = [];

            nextBodies.forEach(body => {
              if (body.type === 'blackhole') {
                bodiesAfterGravity.push(body);
                return;
              }

              let finalX = body.x;
              let finalY = body.y;
              let finalSize = body.size;
              let isAbsorbed = false;

              for (const bh of blackholes) {
                const dx = bh.x - body.x;
                const dy = bh.y - body.y;
                const distToBH = Math.sqrt(dx * dx + dy * dy);
                if (distToBH < 1) continue;

                const eventHorizon = bh.size || 18;
                const gravityStrength = bh.gravity || 90;

                if (distToBH <= eventHorizon) {
                  // Inside Event Horizon: spiral inward and shrink smoothly
                  const spiralSpeed = 0.08 * (bh.rotationSpeed || 1.5);
                  const radialPull = 1.2; // Move 1.2 units closer per frame
                  const angle = Math.atan2(body.y - bh.y, body.x - bh.x) + spiralSpeed;
                  const newDist = Math.max(0, distToBH - radialPull);

                  finalX = bh.x + Math.cos(angle) * newDist;
                  finalY = bh.y + Math.sin(angle) * newDist;
                  finalSize = Math.max(0, body.size - 0.5);

                  if (finalSize <= 1.5 || newDist <= 4.0) {
                    isAbsorbed = true;
                  }
                  break; // Handled by this black hole
                } else if (distToBH < eventHorizon * 8) {
                  // Gradual gravity pull: smooth force pulling body towards black hole
                  const pullFactor = (gravityStrength / 120) * (1 - distToBH / (eventHorizon * 8)) * 0.45;
                  finalX += (dx / distToBH) * pullFactor;
                  finalY += (dy / distToBH) * pullFactor;
                }
              }

              if (!isAbsorbed) {
                bodiesAfterGravity.push({
                  ...body,
                  x: finalX,
                  y: finalY,
                  size: finalSize
                });
              } else {
                // Spawn a few particle sparkles to indicate object consumption!
                for (let k = 0; k < 6; k++) {
                  newlyCollidedParticles.push({
                    id: Date.now().toString() + Math.random().toString(),
                    x: body.x,
                    y: body.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    rotation: 0,
                    rotationSpeed: 0,
                    size: Math.random() * 4 + 2,
                    color: body.color || '#a855f7',
                    life: 60,
                    maxLife: 60,
                    isGlow: false
                  });
                }
                console.log(`[CosmicBuilder] Celestial body "${body.name}" crossed the Event Horizon and was absorbed.`);
              }
            });

            nextBodies = bodiesAfterGravity;
            
            // Advanced Collision detection
            if (isPhysicsModeActive) {
              const bodiesToRemove = new Set<string>();
              const bounceUpdates: Record<string, Partial<CelestialBody>> = {};
              
              for (let i = 0; i < nextBodies.length; i++) {
                for (let j = i + 1; j < nextBodies.length; j++) {
                  const b1 = nextBodies[i];
                  const b2 = nextBodies[j];
                  
                  if (b1.type === 'blackhole' || b2.type === 'blackhole') continue;
                  if (bodiesToRemove.has(b1.id) || bodiesToRemove.has(b2.id)) continue;
                  
                  const dx = b1.x - b2.x;
                  const dy = b1.y - b2.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 1) continue;
                  
                  const r1 = b1.size * 0.45;
                  const r2 = b2.size * 0.45;
                  const collisionDistance = r1 + r2;
                  
                  if (dist < collisionDistance) {
                    const cooldownKey = b1.id < b2.id ? `${b1.id}-${b2.id}` : `${b2.id}-${b1.id}`;
                    if (collisionCooldownsRef.current[cooldownKey] && collisionCooldownsRef.current[cooldownKey] > 0) {
                      continue;
                    }
                    
                    collisionCooldownsRef.current[cooldownKey] = 15; // cooldown
                    
                    const prev1 = prevPositionsRef.current[b1.id];
                    const prev2 = prevPositionsRef.current[b2.id];
                    
                    const vx1 = b1.vx !== undefined ? b1.vx : (prev1 ? b1.x - prev1.x : 0);
                    const vy1 = b1.vy !== undefined ? b1.vy : (prev1 ? b1.y - prev1.y : 0);
                    const vx2 = b2.vx !== undefined ? b2.vx : (prev2 ? b2.x - prev2.x : 0);
                    const vy2 = b2.vy !== undefined ? b2.vy : (prev2 ? b2.y - prev2.y : 0);
                    
                    const rvx = vx1 - vx2;
                    const rvy = vy1 - vy2;
                    const relativeSpeed = Math.sqrt(rvx * rvx + rvy * rvy) || 0.5;
                    
                    const m1 = b1.mass || b1.size || 10;
                    const m2 = b2.mass || b2.size || 10;
                    const totalMass = m1 + m2;
                    
                    // Collision strength calculation
                    const strength = relativeSpeed * (totalMass / 15);
                    
                    // Sensitivity Factor
                    const sensFactor = collisionSensitivity;
                    const asteroidThreshold = 2.0 / (0.2 * sensFactor);
                    const planetThreshold = 7.0 / (0.2 * sensFactor);
                    
                    let b1Fragments = false;
                    let b2Fragments = false;
                    
                    if (b1.type === 'asteroid' && strength >= asteroidThreshold) {
                      b1Fragments = true;
                    } else if (b1.type === 'planet' && strength >= planetThreshold) {
                      b1Fragments = true;
                    }
                    
                    if (b2.type === 'asteroid' && strength >= asteroidThreshold) {
                      b2Fragments = true;
                    } else if (b2.type === 'planet' && strength >= planetThreshold) {
                      b2Fragments = true;
                    }
                    
                    // Create fragments
                    if (b1Fragments) {
                      bodiesToRemove.add(b1.id);
                      const frags = createFragments(b1.x, b1.y, b1.color || '#94a3b8', b1.type === 'planet' ? 12 : 6, b1.type === 'planet' ? 1.5 : 0.8, b1.type);
                      newlyCollidedParticles.push(...frags);
                    }
                    if (b2Fragments) {
                      bodiesToRemove.add(b2.id);
                      const frags = createFragments(b2.x, b2.y, b2.color || '#94a3b8', b2.type === 'planet' ? 12 : 6, b2.type === 'planet' ? 1.5 : 0.8, b2.type);
                      newlyCollidedParticles.push(...frags);
                    }
                    
                    if (!b1Fragments || !b2Fragments) {
                      const nx = dx / dist;
                      const ny = dy / dist;
                      const overlap = collisionDistance - dist;
                      
                      const p = 2 * (nx * rvx + ny * rvy) / totalMass;
                      
                      if (!b1Fragments) {
                        b1.x += nx * overlap * 0.5;
                        b1.y += ny * overlap * 0.5;
                        const newVx = vx1 - p * m2 * nx;
                        const newVy = vy1 - p * m2 * ny;
                        bounceUpdates[b1.id] = {
                          x: b1.x,
                          y: b1.y,
                          vx: newVx,
                          vy: newVy,
                          orbitParentId: null // detach
                        };
                      }
                      if (!b2Fragments) {
                        b2.x -= nx * overlap * 0.5;
                        b2.y -= ny * overlap * 0.5;
                        const newVx = vx2 + p * m1 * nx;
                        const newVy = vy2 + p * m1 * ny;
                        bounceUpdates[b2.id] = {
                          x: b2.x,
                          y: b2.y,
                          vx: newVx,
                          vy: newVy,
                          orbitParentId: null // detach
                        };
                      }
                      
                      // Minor sparks on bounce
                      const sparkCount = Math.min(6, Math.max(2, Math.floor(strength * 2)));
                      const contactX = (b1.x + b2.x) / 2;
                      const contactY = (b1.y + b2.y) / 2;
                      const contactColor = b1Fragments ? b1.color : b2Fragments ? b2.color : "#ffd700";
                      
                      for (let k = 0; k < sparkCount; k++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.5 + Math.random() * 2.0;
                        newlyCollidedParticles.push({
                          id: Date.now().toString() + Math.random().toString(),
                          x: contactX,
                          y: contactY,
                          vx: Math.cos(angle) * speed + (b1Fragments ? 0 : b1.vx || 0),
                          vy: Math.sin(angle) * speed + (b1Fragments ? 0 : b1.vy || 0),
                          rotation: Math.random() * 360,
                          rotationSpeed: (Math.random() - 0.5) * 8,
                          size: 0.4 + Math.random() * 0.4,
                          color: contactColor || "#ffd700",
                          life: 30 + Math.floor(Math.random() * 20),
                          maxLife: 50,
                          isGlow: false
                        });
                      }
                    }
                  }
                }
              }
              
              nextBodies = nextBodies.map(body => {
                if (bounceUpdates[body.id]) {
                  return { ...body, ...bounceUpdates[body.id] };
                }
                return body;
              }).filter(body => !bodiesToRemove.has(body.id));
            }
            
            return {...prevPages, [currentPage]: nextBodies};
          });
    
          setParticles(prev => {
            const activePrev = prev.map(p => ({
              ...p,
              x: p.x + p.vx,
              y: p.y + p.vy,
              rotation: (p.rotation || 0) + (p.rotationSpeed || 0),
              life: p.life - 1
            })).filter(p => p.life > 0);
            
            const combined = [...activePrev, ...newlyCollidedParticles];
            if (combined.length > 150) {
              return combined.slice(combined.length - 150);
            }
            return combined;
          });
      }
      
      frameId = requestAnimationFrame(animate);
    };
 
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isAnimating, isPhysicsModeActive, collisionSensitivity, currentPage]);

  const viewBoxWidth = 1000 * scaleFactor;
  const viewBoxHeight = 600 * scaleFactor;
  const viewBoxX = 500 - viewBoxWidth / 2;
  const viewBoxY = 300 - viewBoxHeight / 2;
  const viewBoxStr = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

  return (
    <div className="fixed inset-0 w-full h-screen flex flex-col p-4 bg-[#020512] overflow-hidden z-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
            <button onClick={() => setIsMenuOpen(true)} className="text-white p-2 bg-slate-800 rounded-lg"><Menu /></button>
            <button onClick={undo} className="text-white p-2 bg-slate-800 rounded-lg">Undo</button>
            <button onClick={redo} className="text-white p-2 bg-slate-800 rounded-lg">Redo</button>
        </div>
        <button onClick={onBackToHub} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-none">
          <ArrowLeft className="w-6 h-6" /> Back to Hub
        </button>
        <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest">Cosmic Builder (Page {currentPage + 1})</h2>
        <div className="flex gap-2 items-center">
          <button onClick={() => setCurrentPage(p => p - 1)} className="text-white bg-slate-800 p-2 rounded-lg">{'<'}</button>
          <button onClick={() => setCurrentPage(p => p + 1)} className="text-white bg-slate-800 p-2 rounded-lg">{'>'}</button>
          <button 
            className={`px-4 py-2 rounded-xl ${isAnimating ? 'bg-red-600' : 'bg-slate-700'}`}
            onClick={() => setIsAnimating(!isAnimating)}
          >
            {isAnimating ? 'Stop' : 'Animate'}
          </button>
          
          {[
            { type: 'select', label: 'Select Mode', color: 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-400', activeColor: 'bg-slate-600 border-slate-400 text-white shadow-[0_0_10px_rgba(148,163,184,0.4)]' },
            { type: 'orbit', label: 'Spawn Orbit', color: 'bg-cyan-600/15 border-cyan-500/30 hover:bg-cyan-600/30 text-cyan-300', activeColor: 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
            { type: 'planet', label: 'Spawn Planet', color: 'bg-blue-600/15 border-blue-500/30 hover:bg-blue-600/30 text-blue-300', activeColor: 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
            { type: 'star', label: 'Spawn Star', color: 'bg-amber-600/15 border-amber-500/30 hover:bg-amber-600/30 text-amber-300', activeColor: 'bg-amber-600 border-amber-400 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]' },
            { type: 'blackhole', label: 'Spawn Black Hole', color: 'bg-purple-600/15 border-purple-500/30 hover:bg-purple-600/30 text-purple-300', activeColor: 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]' },
            { type: 'nebula', label: 'Spawn Nebula', color: 'bg-pink-600/15 border-pink-500/30 hover:bg-pink-600/30 text-pink-300', activeColor: 'bg-pink-600 border-pink-400 text-white shadow-[0_0_10px_rgba(236,72,153,0.5)]' },
            { type: 'asteroid', label: 'Spawn Asteroid', color: 'bg-slate-600/15 border-slate-500/30 hover:bg-slate-600/30 text-slate-300', activeColor: 'bg-slate-600 border-slate-400 text-white shadow-[0_0_10px_rgba(100,116,139,0.5)]' },
            { type: 'wormhole', label: 'Spawn Wormhole', color: 'bg-violet-600/15 border-violet-500/30 hover:bg-violet-600/30 text-violet-300', activeColor: 'bg-violet-600 border-violet-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' },
          ].map(({ type, label, color, activeColor }) => (
            <button 
              key={type}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border transition-all active:scale-95 cursor-pointer ${activeTool === type ? activeColor : color}`}
              onClick={() => setActiveTool(activeTool === type ? 'select' : type)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow w-full flex gap-4 relative">
        {/* Left Sidebar for Page Navigation and Physics Mode */}
        <div className="w-56 flex flex-col gap-4 bg-slate-900/40 border border-slate-800/60 rounded-3xl p-4 shrink-0 justify-between">
          <div className="flex flex-col">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              PAGES
            </h3>
            <div className="border-t border-slate-800/60 my-2"></div>
            <div className="space-y-1.5 overflow-y-auto max-h-[220px] pr-1">
              {Object.keys(pages).map((pKey) => {
                const idx = parseInt(pKey, 10);
                const isActive = idx === currentPage;
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx)}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono rounded-xl transition-all border ${
                      isActive
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                        : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Page {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => {
                const nextIdx = Object.keys(pages).length;
                const newPages = { ...pages, [nextIdx]: [] };
                setPages(newPages);
                saveHistory(newPages);
                setCurrentPage(nextIdx);
              }}
              className="w-full mt-2.5 px-3 py-1.5 text-xs font-mono text-center border border-dashed border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 rounded-xl transition-all"
            >
              + New Page
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div className="border-t border-slate-800/60 my-1"></div>
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${isPhysicsModeActive ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`}></span>
              PHYSICS MODE
            </h3>
            <div className="border-t border-slate-800/60 my-2"></div>
            <div className="bg-slate-950/40 border border-slate-900 p-2.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">STATUS:</span>
                <span className={`text-xs font-mono font-bold ${isPhysicsModeActive ? 'text-amber-400' : 'text-slate-500'}`}>
                  {isPhysicsModeActive ? 'ON' : 'OFF'}
                </span>
              </div>
              <button
                onClick={() => setIsPhysicsModeActive(!isPhysicsModeActive)}
                className={`w-full py-1.5 text-xs font-mono font-black rounded-lg transition-all border ${
                  isPhysicsModeActive 
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]' 
                    : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:text-white'
                }`}
              >
                {isPhysicsModeActive ? 'ON' : 'OFF'}
              </button>
              {isPhysicsModeActive && (
                <div className="space-y-1 pt-1.5 border-t border-slate-800/50">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400">SENSITIVITY:</span>
                    <span className="text-amber-400 font-bold">{collisionSensitivity}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={collisionSensitivity} 
                    onChange={(e) => setCollisionSensitivity(parseInt(e.target.value, 10))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <HamburgerMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onSelectSection={(s) => {setActiveSection(s); setIsMenuOpen(false);}} />
        {activeSection && (
            <SectionOverlay 
                section={activeSection} 
                onClose={() => setActiveSection(null)} 
                activeTool={activeTool} 
                setActiveTool={setActiveTool} 
                selectedObject={selectedBody} 
                updateSelectedObject={selectedBody ? (updates) => updateDetailedBody(selectedBody.id, updates) : undefined}
            />
        )}
        <div 
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleDrop}
          className={`flex-grow border ${placementError ? 'border-red-500' : 'border-blue-900'} rounded-3xl overflow-hidden bg-slate-950/50 relative`}
        >
          {isPhysicsModeActive && (
            <div className="absolute top-4 left-4 z-30 pointer-events-none flex items-center gap-2 bg-amber-950/80 border border-amber-500/50 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.25)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest">
                Physics Active {isAnimating ? '(Running)' : '(Paused)'}
              </span>
            </div>
          )}
          <Canvas 
            camera={{ position: [0, 0, 40], fov: 75, near: 0.1, far: 200 }}
            className="absolute inset-0 z-0 pointer-events-auto"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          >
            <OrbitControls 
              makeDefault 
              enabled={controlsEnabled} 
              enableDamping 
              dampingFactor={0.05} 
              minDistance={10} 
              maxDistance={150} 
            />
            <ambientLight intensity={0.65} />
            <directionalLight position={[5, 10, 5]} intensity={1.35} />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />
            <CameraController scaleFactor={scaleFactor} />
            
            <InteractiveCanvasController
              activeTool={activeTool}
              setActiveTool={setActiveTool}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              bodies={currentBodies}
              updateBody={updateBody}
              addCelestialObject={addCelestialObject}
              controlsEnabled={controlsEnabled}
              setControlsEnabled={setControlsEnabled}
              startDraggingBody={startDraggingBody}
              draggingIdRef={draggingIdRef}
              initialPointer={initialPointer}
              initialPos={initialPos}
            />

            <group>
              {/* Render dynamic 3D geometric spheres for all placed objects */}
              {currentBodies.map(body => (
                <ThreeBody 
                  key={`three-${body.id}`} 
                  body={body} 
                  isAnimating={isAnimating} 
                  isSelected={selectedId === body.id}
                  onSelect={() => handleBodyClick(body.id)}
                  startDraggingBody={startDraggingBody}
                  updateBody={updateBody}
                  bodies={currentBodies}
                />
              ))}

              {/* Render multi-orbit ring trajectories in Three.js */}
              {!isAnimating && currentBodies.map(body => {
                const rings = [];
                if (body.orbitParentId) {
                  const parent = currentBodies.find(p => p.id === body.orbitParentId);
                  if (parent) {
                    const dist = Math.sqrt((body.x - parent.x) ** 2 + (body.y - parent.y) ** 2);
                    rings.push(
                      <OrbitRing 
                        key={`${body.id}-parent-orbit`} 
                        position={[(parent.x - 500) * COSMIC_WORLD_SCALE, -(parent.y - 300) * COSMIC_WORLD_SCALE, 0]} 
                        radius={dist * COSMIC_WORLD_SCALE} 
                        tilt={0}
                      />
                    );
                  }
                }

                if (body.orbits && body.orbits.length > 0) {
                  body.orbits.forEach((orb, i) => {
                    rings.push(
                      <OrbitRing 
                        key={`${body.id}-ring-${i}`} 
                        position={[(body.x - 500) * COSMIC_WORLD_SCALE, -(body.y - 300) * COSMIC_WORLD_SCALE, 0]} 
                        radius={orb.radius * COSMIC_WORLD_SCALE} 
                        tilt={orb.tilt} 
                      />
                    );
                  });
                } else if (body.hasOrbit) {
                  rings.push(
                    <OrbitRing 
                      key={`${body.id}-single`} 
                      position={[(body.x - 500) * COSMIC_WORLD_SCALE, -(body.y - 300) * COSMIC_WORLD_SCALE, 0]} 
                      radius={(body.orbitRadius || 55) * COSMIC_WORLD_SCALE} 
                      tilt={body.orbitInclination || 15} 
                    />
                  );
                }
                return rings;
              })}
            </group>
          </Canvas>
          <svg 
            width="100%" 
            height="100%" 
            viewBox={viewBoxStr} 
            className="cursor-crosshair absolute inset-0 z-10 pointer-events-none"
            onClick={addBody}
          >
            <defs>
              <radialGradient id="starGradient">
                <stop offset="0%" stopColor="#ffea60" />
                <stop offset="100%" stopColor="#ffaa00" />
              </radialGradient>
              <radialGradient id="planetGradient">
                <stop offset="0%" stopColor="#4ab8ff" />
                <stop offset="100%" stopColor="#0044aa" />
              </radialGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect 
              id="builder-bg"
              x={viewBoxX} 
              y={viewBoxY} 
              width={viewBoxWidth} 
              height={viewBoxHeight} 
              fill="rgba(0,0,0,0)" 
              pointerEvents="none" 
            />
            
            {/* Visualized Orbits */}
            {!isAnimating && currentBodies.map(body => {
               if (!body.orbitParentId) return null;
               const parent = currentBodies.find(b => b.id === body.orbitParentId);
               if (!parent) return null;
               const dist = Math.sqrt((body.x - parent.x) ** 2 + (body.y - parent.y) ** 2);
               return (
                 <circle
                   key={`orbit-${body.id}`}
                   cx={parent.x}
                   cy={parent.y}
                   r={dist}
                   fill="none"
                   stroke="rgba(255, 255, 255, 1)"
                   strokeWidth="2"
                 />
               );
            })}
            
            {!isAnimating && <OrbitSystem bodies={currentBodies} />}
            {!isAnimating && <BinaryOrbitSystem bodies={currentBodies} />}

            {/* Wormhole connections */}
            {connections.map((c, i) => {
              const b1 = currentBodies.find(b => b.id === c.aId);
              const b2 = currentBodies.find(b => b.id === c.bId);
              if (!b1 || !b2) return null;
              return <line key={i} x1={b1.x} y1={b1.y} x2={b2.x} y2={b2.y} stroke="purple" strokeWidth="4" strokeDasharray="8 8" />;
            })}
           
            {/* Particles */}
            {particles.map(p => {
              const opacity = p.life / (p.maxLife || 100);
              if (p.isGlow) {
                return (
                  <circle
                    key={p.id}
                    cx={p.x}
                    cy={p.y}
                    r={p.size || 8}
                    fill={p.color || "rgba(255,165,0,0.4)"}
                    opacity={opacity * 0.4}
                    style={{ filter: 'blur(1px)' }}
                    pointerEvents="none"
                  />
                );
              }
              
              // Non-glow regular piece/fragment
              const shardPaths = [
                "M -3,-2 L 2,-4 L 4,1 L 1,4 L -4,3 Z",
                "M -2,-3 L 3,-2 L 2,4 L -3,2 L -4,-1 Z",
                "M -4,-2 L 4,-3 L 2,3 L -2,4 L -3,-1 Z",
                "M -2,-4 L 4,-1 L 3,3 L -3,3 L -4,-1 Z",
              ];
              const idString = String(p.id);
              let hash = 0;
              for (let i = 0; i < idString.length; i++) {
                hash = idString.charCodeAt(i) + ((hash << 5) - hash);
              }
              const pathIdx = Math.abs(hash) % shardPaths.length;
              const pathStr = shardPaths[pathIdx];
              
              return (
                <path
                  key={p.id}
                  d={pathStr}
                  transform={`translate(${p.x}, ${p.y}) scale(${p.size || 1}) rotate(${p.rotation || 0})`}
                  fill={p.color || "#94a3b8"}
                  opacity={opacity}
                  pointerEvents="none"
                  stroke={p.color ? `${p.color}55` : undefined}
                  strokeWidth={0.5}
                />
              );
            })}

            {activeTool === 'wormhole' && <rect x={viewBoxX} y={viewBoxY} width={viewBoxWidth} height={viewBoxHeight} fill="url(#grid)" pointerEvents="none" />}
          </svg>
          
          {selectedBodyForInspector && (
            <ObjectInspector object={selectedBodyForInspector} onClose={() => setSelectedBodyForInspector(null)} />
          )}
        </div>
        
        {selectedBody && (
          <DetailsSidebar 
            object={selectedBody} 
            onClose={() => setSelectedId(null)} 
            updateObject={updateDetailedBody} 
            onDelete={deleteBody} 
          />
        )}
      </div>
      <p className="mt-2 text-slate-500 font-mono text-sm text-center">Drag celestial assets from the menu directly into the 3D space, or click anywhere inside the map canvas to project your active tool item. Click placed bodies to inspect or configure.</p>
    </div>
  );
};
