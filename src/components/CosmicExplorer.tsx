import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Eye, ShieldAlert, Zap, Globe, Layers, MapPin, 
  Tv, Compass, HelpCircle, Volume2, Info, RefreshCw, Brain
} from 'lucide-react';
import { ExplorationLevel, Universe, Galaxy, SolarSystem, Planet, CosmicPhenomena } from '../types';
import { UNIVERSES, GALAXIES, SOLAR_SYSTEMS, PLANETS, COSMIC_PHENOMENA } from '../data';
import { playSynthBeep, playSuccessChime, playWarpTransition, playScannerSweep } from '../utils/audio';
import { handScrollService } from '../services/handScrollService';
import { createCelestialTexture } from '../utils/textures';

interface CosmicExplorerProps {
  onBackToHub: () => void;
  userAuth?: { email: string; name: string } | null;
}

export const CosmicExplorer: React.FC<CosmicExplorerProps> = ({ onBackToHub, userAuth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State Control
  const [level, setLevel] = useState<ExplorationLevel>(ExplorationLevel.COSMOS_SPHERE);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [myPlanets, setMyPlanets] = useState<Planet[]>([]);
  const [lastGesture, setLastGesture] = useState<string>('NONE');
  const [gestureHint, setGestureHint] = useState<string>('FIST: Engage Multiverse | OPEN PALM: Back');
  
  // Custom multi-universe list and bridges fetched from user persistence
  const [multiUniverses, setMultiUniverses] = useState<any[]>(UNIVERSES);
  const [bridges, setBridges] = useState<any[]>([]);

  useEffect(() => {
    try {
      const userPrefix = userAuth?.email ? userAuth.email.replace(/[@.]/g, '_') : 'guest';
      const savedSlots = localStorage.getItem(`cosmos_universe_slots_${userPrefix}`);
      const savedBridges = localStorage.getItem(`cosmos_universe_bridges_${userPrefix}`);
      
      const customSlots = savedSlots ? JSON.parse(savedSlots) : [];
      let combined = [...UNIVERSES];
      
      customSlots.forEach((slot: any) => {
        if (!combined.some(u => u.id === slot.id)) {
          combined.push({
            id: slot.id,
            name: slot.name,
            color: '#30e8c0',
            age: 'Created Dimension',
            diameter: 'Infinite Hyper-curve',
            galaxiesCount: `${slot.userSystem ? slot.userSystem.length : 1} Stellar Bodies`,
            composition: 'Tachyon field core',
            specialFeature: 'Engineered Universe',
            description: `A custom-engineered parallel universe built via the Conversational Universe Builder. Features specialized gravitational matrices and particle densities.`,
            fact: `This universe was forged using JARVIS with gravity calibrations active.`
          });
        }
      });
      
      setMultiUniverses(combined);
      
      if (savedBridges) {
        setBridges(JSON.parse(savedBridges));
      }
    } catch(e) {
      console.error(e);
    }
  }, [userAuth]);
  
  // Dual-clock time dilation
  const [normalTime, setNormalTime] = useState<number>(0);
  const [dilatedTime, setDilatedTime] = useState<number>(0);
  const [isTimeDilationActive, setIsTimeDilationActive] = useState<boolean>(false);

  // Lab Experiment states for level 5 Cosmic Phenomena
  const [spacetimeMass, setSpacetimeMass] = useState<number>(5.0);
  const [dilationGravity, setDilationGravity] = useState<number>(1.0);
  const [inflationSpeed, setInflationSpeed] = useState<number>(1.0);
  const [waveFrequency, setWaveFrequency] = useState<number>(1.0);
  const [darkEnergyPower, setDarkEnergyPower] = useState<number>(1.5);

  // Push lab states into window object for instant synchronous ThreeJS animation loop access
  useEffect(() => {
    (window as any).spacetimeMassVal = spacetimeMass;
    (window as any).dilationGravityVal = dilationGravity;
    (window as any).inflationSpeedVal = inflationSpeed;
    (window as any).waveFrequencyVal = waveFrequency;
    (window as any).darkEnergyPowerVal = darkEnergyPower;
  }, [spacetimeMass, dilationGravity, inflationSpeed, waveFrequency, darkEnergyPower]);

  useEffect(() => {
    handScrollService.setSensitivity(sensitivity);
  }, [sensitivity]);

  // HUD and UI state
  const [showMinimap, setShowMinimap] = useState<boolean>(true);
  const [showGuide, setShowGuide] = useState<boolean>(true);
  const [hoveredObject, setHoveredObject] = useState<any>(null);
  const [isTourMode, setIsTourMode] = useState(false);

  useEffect(() => {
    (window as any).isTourModeVal = isTourMode;
  }, [isTourMode]);

  // Dynamic planet-grab orbit states
  const [planetOrbits, setPlanetOrbits] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    PLANETS.forEach((planet, index) => {
      if (index > 0) {
        initial[planet.id] = 15 + index * 8.5;
      }
    });
    return initial;
  });
  const [draggedPlanetId, setDraggedPlanetId] = useState<string | null>(null);
  const [hoveredOrbitIndex, setHoveredOrbitIndex] = useState<number | null>(null);

  // Holographic Chronicles Scroll State
  const [isCodexOpen, setIsCodexOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
        audioRef.current = new Audio("https://actions.google.com/sounds/v1/fantasy/ambient_swirly_synth.ogg");
        audioRef.current.loop = true;
    } catch (e) {
        console.error("Audio initialization failed:", e);
    }
    return () => {
        if(audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
    };
  }, []);

  // Tour logic
  const runCinematicTour = async () => {
    setIsTourMode(true);
    setTourStep(1);
    
    // Play music
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }

    // Zoom out (COSMOS_SPHERE, index 0)
    cameraTargetRef.current = { x: 0, y: 0, z: 800 }; 
    setLevel(ExplorationLevel.COSMOS_SPHERE);
    setActiveIndex(0);
    await new Promise(r => setTimeout(r, 3000));

    // Choose random universe (Fast zoom in)
    const uniIdx = Math.floor(Math.random() * multiUniverses.length);
    setLevel(ExplorationLevel.MULTIVERSE);
    setActiveIndex(uniIdx);
    cameraTargetRef.current = { x: 0, y: 0, z: 35 };
    await new Promise(r => setTimeout(r, 2500));

    // Galaxy (Fast zoom in)
    const galIdx = Math.floor(Math.random() * GALAXIES.length);
    setLevel(ExplorationLevel.GALAXIES);
    setActiveIndex(galIdx);
    cameraTargetRef.current = { x: 0, y: 0, z: 35 };
    await new Promise(r => setTimeout(r, 2500));

    // Solar System (Fast zoom in)
    const sysIdx = Math.floor(Math.random() * SOLAR_SYSTEMS.length);
    setLevel(ExplorationLevel.SOLAR_SYSTEMS);
    setActiveIndex(sysIdx);
    cameraTargetRef.current = { x: 0, y: 0, z: 32 };
    await new Promise(r => setTimeout(r, 2500));
    
    // Sequence planets in 3D
    const sortedPlanets = PLANETS.sort((a,b) => a.id.localeCompare(b.id));
    for (let p of sortedPlanets) {
        const pIdx = PLANETS.findIndex(pl => pl.id === p.id);
        cameraTargetRef.current = { x: 0, y: 0, z: 20 };
        setLevel(ExplorationLevel.PLANET_VIEW);
        setActiveIndex(pIdx);
        await new Promise(r => setTimeout(r, 2000));
    }
    
    // Cosmic Phenomena in 3D
    for (let i = 0; i < COSMIC_PHENOMENA.length; i++) {
        cameraTargetRef.current = { x: 0, y: 0, z: 30 };
        setLevel(ExplorationLevel.PHENOMENA);
        setActiveIndex(i);
        await new Promise(r => setTimeout(r, 2000));
    }

    // Return to start
    cameraTargetRef.current = { x: 0, y: 0, z: 150 };
    setLevel(ExplorationLevel.COSMOS_SPHERE);
    
    // Stop music
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
    }
    
    setIsTourMode(false);
    setTourStep(0);
  };

  // Register handScrollService target container whenever codex opens or details shift
  useEffect(() => {
    if (isCodexOpen) {
      const container = document.getElementById('codex-scroll-container');
      if (container) {
        handScrollService.setTargetContainer(container);
      }
    } else {
      handScrollService.setTargetContainer(null);
    }
    return () => {
      handScrollService.setTargetContainer(null);
    };
  }, [isCodexOpen, level, activeIndex]);

  // ThreeJS Refs
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<any>(null);
  const currentObjectsGroupRef = useRef<any>(null);
  const cameraTargetRef = useRef<any>({ x: 0, y: 0, z: 120 });
  const cameraLookAtRef = useRef<any>({ x: 0, y: 0, z: 0 });

  // Drag and rotation tracking state refs
  const isDraggingRef = useRef<boolean>(false);
  const prevCoordsRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  const handPinchingRef = useRef<boolean>(false);
  const prevHandPosRef = useRef<{ x: number, y: number } | null>(null);
  const lastPinchTimeRef = useRef<number>(0);
  const lastLevelRef = useRef<number>(-1);

  // 1. DUAL CLOCKS GENERATION (Dual Relativity Clocks)
  useEffect(() => {
    const handleGlobalGestureEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.gesture) {
        handleGestureAction(customEvent.detail.gesture);
      }
    };
    window.addEventListener('hand-gesture', handleGlobalGestureEvent);
    return () => {
      window.removeEventListener('hand-gesture', handleGlobalGestureEvent);
    };
  }, [level, activeIndex]);

  // 1. DUAL CLOCKS GENERATION (Dual Relativity Clocks)
  useEffect(() => {
    const timer = setInterval(() => {
      setNormalTime(prev => prev + 1);
      if (isTimeDilationActive) {
        setDilatedTime(prev => prev + 0.4);
      } else {
        setDilatedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimeDilationActive]);

  // 1.5. GESTURAL ROTATION: Mouse Drag / Pinch-Tracking Rotate of Cosmic Workspace
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Left click/drag only
      isDraggingRef.current = true;
      prevCoordsRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: PointerEvent) => {
      const isDragging = isDraggingRef.current;
      const isPinching = handPinchingRef.current;

      if (!isDragging && !isPinching) return;
      if (draggedPlanetId) return; // Skip rotation while customizing a planetary orbit placement

      const deltaX = e.clientX - prevCoordsRef.current.x;
      const deltaY = e.clientY - prevCoordsRef.current.y;

      if (currentObjectsGroupRef.current) {
        currentObjectsGroupRef.current.rotation.y += deltaX * 0.005;
        // Restrict pitch angle to avoid turning the cosmos completely upside down skewing orientation
        const newRotX = currentObjectsGroupRef.current.rotation.x + deltaY * 0.005;
        currentObjectsGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, newRotX));
      }

      prevCoordsRef.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUpOrLeave = () => {
      isDraggingRef.current = false;
    };

    // Listen for incoming hand gestures representing stable pinch starts
    const handleGesture = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.gesture) {
        const gesture = customEvent.detail.gesture;
        if (gesture.startsWith('PINCH')) {
          handPinchingRef.current = true;
          lastPinchTimeRef.current = Date.now();
        } else {
          handPinchingRef.current = false;
          prevHandPosRef.current = null;
        }
      }
    };

    // Listen for high-precision live camera coordinate frames
    const handleHandUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (!detail) return;

      // Automatically invalidate the pinch if no pinch gesture packets arrive for 800ms
      if (handPinchingRef.current && Date.now() - lastPinchTimeRef.current > 800) {
        handPinchingRef.current = false;
        prevHandPosRef.current = null;
      }

      if (handPinchingRef.current && detail.landmarks && !detail.isSimulator) {
        const landmarks = detail.landmarks;
        if (landmarks && landmarks[9]) {
          const handX = landmarks[9].x;
          const handY = landmarks[9].y;

          if (prevHandPosRef.current) {
            // Flipped X axis mirroring adjustment
            const deltaX = handX - prevHandPosRef.current.x;
            const deltaY = handY - prevHandPosRef.current.y;

            if (currentObjectsGroupRef.current && !draggedPlanetId) {
              currentObjectsGroupRef.current.rotation.y -= deltaX * 3.5;
              const newRotX = currentObjectsGroupRef.current.rotation.x + deltaY * 3.5;
              currentObjectsGroupRef.current.rotation.x = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, newRotX));
            }
          }
          prevHandPosRef.current = { x: handX, y: handY };
        }
      }
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUpOrLeave);
    window.addEventListener('pointercancel', handlePointerUpOrLeave);
    
    window.addEventListener('hand-gesture', handleGesture);
    window.addEventListener('hand-tracking-update', handleHandUpdate);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUpOrLeave);
      window.removeEventListener('pointercancel', handlePointerUpOrLeave);

      window.removeEventListener('hand-gesture', handleGesture);
      window.removeEventListener('hand-tracking-update', handleHandUpdate);
    };
  }, [draggedPlanetId]);

  // Determine if current view should trigger Time Dilation
  useEffect(() => {
    if (level === ExplorationLevel.SOLAR_SYSTEMS) {
      const activeSys = SOLAR_SYSTEMS[activeIndex];
      setIsTimeDilationActive(!!activeSys?.timeDilation);
    } else if (level === ExplorationLevel.PLANET_VIEW) {
      // Alien planet Nexus-1 (index 10) or Umbra (index 11) near black hole gravity warp
      setIsTimeDilationActive(activeIndex === 10 || activeIndex === 11);
    } else if (level === ExplorationLevel.PHENOMENA) {
      const activePhen = COSMIC_PHENOMENA[activeIndex];
      setIsTimeDilationActive(activePhen.type === 'blackhole' || activePhen.type === 'timedilation' || activePhen.type === 'pulsar');
    } else {
      setIsTimeDilationActive(false);
    }
  }, [level, activeIndex]);

  // Update Gesture hints based on current Level
  useEffect(() => {
    let hint = '';
    switch (level) {
      case ExplorationLevel.COSMOS_SPHERE:
        hint = 'POINT: Select Sphere | THUMBS DOWN: Enter Multiverse | OPEN PALM: Back';
        break;
      case ExplorationLevel.MULTIVERSE:
        hint = 'POINT or SWIPE: Select Universe | THUMBS DOWN (👎): Enter Universe | OPEN PALM: Back';
        break;
      case ExplorationLevel.GALAXIES:
        hint = 'POINT or SWIPE: Select Galaxy | THUMBS DOWN (👎): Enter Galaxy | OPEN PALM: Back';
        break;
      case ExplorationLevel.SOLAR_SYSTEMS:
        hint = 'POINT or SWIPE: Select Solar System | THUMBS DOWN (👎): Enter Solar System | OPEN PALM: Back';
        break;
      case ExplorationLevel.PLANET_VIEW:
        hint = 'PINCH: Lock on Planet | ROTATE: Orbit Planet | OPEN PALM: Back';
        break;
      case ExplorationLevel.PHENOMENA:
        hint = 'SWIPE: Next Phenomenon | OPEN PALM: Back';
        break;
    }
    setGestureHint(hint);
  }, [level]);

  // 2. THREE.JS BOOTSTRAPPER AND ASSET SCHEMAS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 2000);
    camera.position.set(0, 0, 150);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffe2c0, 1.8);
    dirLight1.position.set(20, 40, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x76b4ff, 0.6);
    dirLight2.position.set(-20, -10, -30);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffd099, 1.5, 300);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Group to hold volatile objects for current depth level
    const currentGroup = new THREE.Group();
    scene.add(currentGroup);
    currentObjectsGroupRef.current = currentGroup;

    // STARFIELD BACKGROUND (Static Outer Layer)
    const starFieldGeo = new THREE.BufferGeometry();
    const starCount = 4500;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      // Sphere coordinate mapping
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 500 + Math.random() * 800;

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Star heat colors (white, light-blue, red-dwarf yellow)
      const starRand = Math.random();
      if (starRand < 0.4) {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 1.0; starColors[i * 3 + 2] = 1.0; // white
      } else if (starRand < 0.85) {
        starColors[i * 3] = 0.7; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 1.0; // blueish
      } else {
        starColors[i * 3] = 1.0; starColors[i * 3 + 1] = 0.9; starColors[i * 3 + 2] = 0.6; // yellowish
      }
    }
    starFieldGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starFieldGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.5, vertexColors: true, transparent: true, opacity: 0.9 });
    const starPoints = new THREE.Points(starFieldGeo, starMat);
    scene.add(starPoints);

    // Nebula dust particles (rotating slowly in background)
    const nebGeo = new THREE.BufferGeometry();
    const nebCount = 800;
    const nebPositions = new Float32Array(nebCount * 3);
    const nebColors = new Float32Array(nebCount * 3);
    const colorsPal = [new THREE.Color('#4400aa'), new THREE.Color('#0044aa'), new THREE.Color('#00ffff')];
    for (let i = 0; i < nebCount; i++) {
      const r = 200 + Math.random() * 300;
      const angle = Math.random() * Math.PI * 2;
      nebPositions[i * 3] = Math.cos(angle) * r;
      nebPositions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      nebPositions[i * 3 + 2] = Math.sin(angle) * r;

      const pickColor = colorsPal[Math.floor(Math.random() * colorsPal.length)];
      nebColors[i * 3] = pickColor.r;
      nebColors[i * 3 + 1] = pickColor.g;
      nebColors[i * 3 + 2] = pickColor.b;
    }
    nebGeo.setAttribute('position', new THREE.BufferAttribute(nebPositions, 3));
    nebGeo.setAttribute('color', new THREE.BufferAttribute(nebColors, 3));
    const nebMat = new THREE.PointsMaterial({ size: 6.0, vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
    const nebPoints = new THREE.Points(nebGeo, nebMat);
    scene.add(nebPoints);

    // ANIMATION RENDERING LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Rotate backgrounds
      starPoints.rotation.y += 0.0002;
      nebPoints.rotation.y += 0.0006;

      // Cinematic Tour Panning
      if ((window as any).isTourModeVal) {
        cameraTargetRef.current.x = Math.sin(elapsed * 0.2) * 150;
        cameraTargetRef.current.y = Math.cos(elapsed * 0.1) * 100;
      }

      // Clean up lerping camera movements
      if (cameraRef.current) {
        cameraRef.current.position.x += (cameraTargetRef.current.x - cameraRef.current.position.x) * 0.05;
        cameraRef.current.position.y += (cameraTargetRef.current.y - cameraRef.current.position.y) * 0.05;
        cameraRef.current.position.z += (cameraTargetRef.current.z - cameraRef.current.position.z) * 0.05;

        // Smoothly adjust camera pitch yaw target
        const tempLookAt = new THREE.Vector3(
          cameraLookAtRef.current.x,
          cameraLookAtRef.current.y,
          cameraLookAtRef.current.z
        );
        cameraRef.current.lookAt(tempLookAt);
      }

      // Animate level specific variables
      if (currentGroup && currentGroup.children.length > 0) {
        currentGroup.children.forEach((child: any) => {
          // General self spin
          if (child.userData?.spinSpeed) {
            child.rotation.y += child.userData.spinSpeed;
          }

          // Orbit orbits around sun
          if (child.userData?.orbitRadius && child.userData?.orbitSpeed) {
            if (!child.userData.isBeingDragged) {
              child.userData.angle = (child.userData.angle || 0) + child.userData.orbitSpeed;
              child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
              child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
            }
            
            // Draw corresponding orbital ring lines
            if (child.userData.ringHelper) {
              // ring static helper stays at (0,0,0)
            }
          }

          // Cosmic portal wobble
          if (child.userData?.wobble) {
            child.position.y = Math.sin(elapsed * 2.0 + child.userData.idIndex) * 1.5;
          }

          // Glowing atmospheres oscillation
          if (child.userData?.pulseMaterial) {
            child.userData.pulseMaterial.opacity = 0.15 + Math.sin(elapsed * 1.5) * 0.08;
          }

          // Black hole elements accretion rotation
          if (child.name === 'accretion_disk') {
            child.rotation.z -= 0.015;
          }
          if (child.name === 'distortion_ring') {
            child.scale.setScalar(1 + (elapsed % 3.0) * 0.6);
            child.material.opacity = Math.max(0, 1 - (elapsed % 3.0) / 3.0);
          }
          if (child.name === 'pulsar_conelight') {
            child.rotation.z += 0.051;
            child.rotation.x = Math.sin(elapsed * 3.0) * 0.2;
          }

          // Cosmic Inflation System
          if (child.name === 'inflation_system') {
            const infSpeed = (window as any).inflationSpeedVal || 1.0;
            child.children.forEach((shell: any) => {
              if (shell.name.startsWith('inflation_shell_')) {
                const idx = shell.userData.index;
                // Accumulate scale beyond base
                shell.scale.addScalar(0.0125 * (idx + 1) * infSpeed);
                if (shell.scale.x > 3.0) {
                  shell.scale.setScalar(0.1);
                }
                shell.rotation.y += 0.005 * (idx + 1) * infSpeed;
                shell.rotation.x += 0.003 * infSpeed;
                if (shell.material) {
                  // fade out near boundaries
                  shell.material.opacity = Math.max(0, 0.5 - (shell.scale.x / 3.0) * 0.5);
                }
              }
            });
          }

          // Gravitational Waves System
          if (child.name === 'gravitational_wave_system') {
            const freq = (window as any).waveFrequencyVal || 1.0;
            // Orbit dual neutron mass cores
            const coreAngle = elapsed * 4.5 * freq;
            const separation = 1.6;
            const core1 = child.getObjectByName('wave_core_1');
            const core2 = child.getObjectByName('wave_core_2');
            if (core1) {
              core1.position.set(Math.cos(coreAngle) * separation, 0, Math.sin(coreAngle) * separation);
            }
            if (core2) {
              core2.position.set(-Math.cos(coreAngle) * separation, 0, -Math.sin(coreAngle) * separation);
            }

            // Animate ripple rings curving spacetime
            child.children.forEach((ripple: any) => {
              if (ripple.name.startsWith('wave_ripple_')) {
                const d = ripple.userData.radius;
                ripple.position.y = Math.sin(elapsed * 5.0 * freq - d * 0.9) * 0.5;
                ripple.scale.setScalar(1 + Math.cos(elapsed * 3.0 * freq - d * 0.4) * 0.1);
              }
            });
          }

          // Dark Energy Expansion
          if (child.name === 'dark_energy_system') {
            const power = (window as any).darkEnergyPowerVal || 1.5;
            const parGroup = child.getObjectByName('repelling_particles');
            if (parGroup) {
              parGroup.children.forEach((p: any) => {
                p.userData.dist += 0.035 * p.userData.speed * power;
                if (p.userData.dist > 12.0) {
                  p.userData.dist = 1.0;
                }
                p.position.copy(p.userData.dir).multiplyScalar(p.userData.dist);
                p.scale.setScalar(1.0 + Math.sin(elapsed * 6.0 + p.userData.dist) * 0.22);
              });
            }
          }

          // Time Dilation
          if (child.name === 'time_dilation_system') {
            const gravityCoeff = (window as any).dilationGravityVal || 1.0;
            // Beta ticks at standard speed
            const clockBeta = child.getObjectByName('clock_beta');
            if (clockBeta) {
              const bHand = clockBeta.getObjectByName('clock_hand');
              if (bHand) bHand.rotation.z = -elapsed * 5.5;
            }
            // Alpha ticks slower based on proximity and gravity slider
            const clockAlpha = child.getObjectByName('clock_alpha');
            if (clockAlpha) {
              const aHand = clockAlpha.getObjectByName('clock_hand');
              const speedAlpha = 5.5 * (1.0 / (1.0 + gravityCoeff * 2.3));
              if (aHand) aHand.rotation.z = -elapsed * speedAlpha;
            }
          }

          // Spacetime Curvature Experiment
          if (child.name === 'spacetime_curvature_system') {
            const massCoeff = (window as any).spacetimeMassVal || 5.0;
            const warpGrid = child.getObjectByName('warp_grid');
            
            // Re-deform grid in 3D
            if (warpGrid && warpGrid.geometry) {
              const posAttr = warpGrid.geometry.attributes.position;
              for (let i = 0; i < posAttr.count; i++) {
                const vx = posAttr.getX(i);
                const vy = posAttr.getY(i);
                const dist = Math.sqrt(vx * vx + vy * vy);
                // Depression formula
                const depth = - (massCoeff * 2.0) / (dist * 0.45 + 1.1);
                posAttr.setZ(i, depth);
              }
              posAttr.needsUpdate = true;
            }

            const warpCore = child.getObjectByName('warp_core');
            if (warpCore) {
              warpCore.scale.setScalar(0.45 + massCoeff * 0.16);
            }
            const warpGlow = child.getObjectByName('warp_glow');
            if (warpGlow) {
              warpGlow.scale.setScalar(0.5 + massCoeff * 0.2);
              warpGlow.rotation.y += 0.012;
            }

            // Curve experimental satellite trajectory probe
            const probe = child.getObjectByName('experimental_probe');
            const traceLine = child.getObjectByName('experimental_trace');
            if (probe) {
              const orbitSpeed = elapsed * (1.4 + massCoeff * 0.28);
              const baseRad = 7.5;
              const gravityDecay = 0.16 * massCoeff;
              const rad = Math.max(2.2, baseRad - gravityDecay + Math.cos(orbitSpeed * 0.85) * 0.95);
              
              const px = Math.cos(orbitSpeed) * rad;
              const pz = Math.sin(orbitSpeed) * rad;
              const dist = Math.sqrt(px * px + pz * pz);
              const py = - (massCoeff * 2.0) / (dist * 0.45 + 1.1);

              probe.position.set(px, py, pz);

              if (traceLine && traceLine.geometry) {
                const traceArr = traceLine.userData.pointsArr || [];
                const THREE = (window as any).THREE;
                if (THREE) {
                  traceArr.push(new THREE.Vector3(px, py, pz));
                  if (traceArr.length > 80) traceArr.shift();
                  traceLine.userData.pointsArr = traceArr;

                  const posAttr = traceLine.geometry.attributes.position;
                  for (let k = 0; k < 80; k++) {
                    if (k < traceArr.length) {
                      posAttr.setXYZ(k, traceArr[k].x, traceArr[k].y, traceArr[k].z);
                    } else {
                      posAttr.setXYZ(k, px, py, pz);
                    }
                  }
                  posAttr.needsUpdate = true;
                }
              }
            }
          }

          // Space Travel Timeline
          if (child.name === 'space_travel_timeline_system') {
            const cruiser = child.getObjectByName('timeline_cruiser');
            const progress = (elapsed * 0.08) % 1.0;

            const angle = progress * Math.PI * 4.5;
            const radius = 1.5 + progress * 8.5;
            const height = progress * 4.5 - 2.25;

            if (cruiser) {
              cruiser.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius);
              cruiser.rotation.z = -elapsed * 2.5;
              cruiser.rotation.y = elapsed;
            }

            for (let i = 0; i < 5; i++) {
              const ring = child.getObjectByName(`beacon_pulse_${i}`);
              if (ring) {
                const scaleF = 1.0 + (elapsed * 1.8 % 1.8) * 0.65;
                ring.scale.setScalar(scaleF);
                if (ring.material) {
                  ring.material.opacity = Math.max(0, 0.8 - (elapsed * 1.8 % 1.8) / 1.8);
                }
              }
            }
          }
        });
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas || !camera || !renderer) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer) renderer.dispose();
    };
  }, []);

  // 3. SWITCH LEVELS AND BUILD 3D COLLATERAL METRICS
  useEffect(() => {
    buildLevel3DCollateral();
  }, [level, activeIndex, planetOrbits, hoveredOrbitIndex]);

  const buildLevel3DCollateral = () => {
    const scene = sceneRef.current;
    const group = currentObjectsGroupRef.current;
    const THREE = (window as any).THREE;

    if (!scene || !group || !THREE) return;

    // Reset rotation structure on changing navigation layers
    if (lastLevelRef.current !== level) {
      group.rotation.set(0, 0, 0);
      lastLevelRef.current = level;
    }

    const disposeRecursive = (obj: any) => {
      if (obj.children && obj.children.length > 0) {
        for (let i = obj.children.length - 1; i >= 0; i--) {
          disposeRecursive(obj.children[i]);
        }
      }
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m: any) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    };

    // Clear existing meshes
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      disposeRecursive(obj);
    }

    // Default target reset
    cameraLookAtRef.current = { x: 0, y: 0, z: 0 };

    switch (level) {
      // ==========================================
      // LEVEL 0: COSMOS SPHERE
      // ==========================================
      case ExplorationLevel.COSMOS_SPHERE: {
        cameraTargetRef.current = { x: 0, y: 0, z: 42 };

        // Core Glowing Orb
        const geom = new THREE.SphereGeometry(7, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
          color: 0x2244aa,
          emissive: 0x1133aa,
          emissiveIntensity: 1.0,
          roughness: 0.3,
          metalness: 0.2,
          transparent: true,
          opacity: 0.9
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.userData = { spinSpeed: 0.003 };
        group.add(mesh);

        // 4 Translucent Atmosphere glow shells
        for (let i = 1; i <= 4; i++) {
          const glowGeom = new THREE.SphereGeometry(7 + (i * 1.5), 16, 16);
          const glowMat = new THREE.MeshBasicMaterial({
            color: 0x4ab8ff,
            transparent: true,
            opacity: 0.12 - (i * 0.025),
            side: THREE.BackSide
          });
          const glowMesh = new THREE.Mesh(glowGeom, glowMat);
          glowMesh.userData = { spinSpeed: -0.001 * i };
          group.add(glowMesh);
        }

        // Orbiting particles (30 microscopic solar motes)
        const motesCount = 30;
        for (let i = 0; i < motesCount; i++) {
          const moteGeom = new THREE.SphereGeometry(0.18, 8, 8);
          const moteMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xffea99 : 0x4ab8ff });
          const mote = new THREE.Mesh(moteGeom, moteMat);

          const radius = 10 + Math.random() * 8;
          const orbitSpeed = 0.008 + Math.random() * 0.015;
          const angle = Math.random() * Math.PI * 2;

          mote.position.set(Math.cos(angle) * radius, (Math.random() - 0.5) * 5, Math.sin(angle) * radius);
          mote.userData = {
            orbitRadius: radius,
            orbitSpeed,
            angle,
            spinSpeed: 0.01
          };
          group.add(mote);
        }
        break;
      }

      // ==========================================
      // LEVEL 1: MULTIVERSE (15 Parallel Universes)
      // ==========================================
      case ExplorationLevel.MULTIVERSE: {
        cameraTargetRef.current = { x: 0, y: 0, z: 35 };

        // Align universes horizontally along horizontal spectrum
        multiUniverses.forEach((uni, index) => {
          const xOffset = (index - activeIndex) * 18;
          const geom = new THREE.SphereGeometry(4.5, 32, 32);
          const mat = new THREE.MeshStandardMaterial({
            color: new THREE.Color(uni.color),
            emissive: new THREE.Color(uni.color),
            emissiveIntensity: index === activeIndex ? 1.0 : 0.25,
            roughness: 0.4,
            metalness: 0.1,
            transparent: true,
            opacity: index === activeIndex ? 0.95 : 0.45
          });

          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(xOffset, 0, 0);
          mesh.userData = {
            spinSpeed: 0.004,
            wobble: true,
            idIndex: index
          };
          group.add(mesh);

          // Add elegant outer energy ring for the selected active universe
          if (index === activeIndex) {
            const ringGeom = new THREE.RingGeometry(5.8, 6.0, 32);
            const ringMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color(uni.color),
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.6
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.position.set(xOffset, 0, 0);
            ring.rotation.x = Math.PI / 3.0;
            ring.userData = { spinSpeed: 0.002 };
            group.add(ring);
          }
        });

        // Draw active Einstein-Rosen wormhole conduit bridges
        bridges.forEach((b) => {
          const idxA = multiUniverses.findIndex(u => u.id === b.slotA);
          const idxB = multiUniverses.findIndex(u => u.id === b.slotB);
          
          if (idxA !== -1 && idxB !== -1) {
            const xA = (idxA - activeIndex) * 18;
            const xB = (idxB - activeIndex) * 18;

            const pStart = new THREE.Vector3(xA, 0, 0);
            const pEnd = new THREE.Vector3(xB, 0, 0);
            const pControl = new THREE.Vector3((xA + xB) / 2, 7, -3.5);
            
            const curve = new THREE.QuadraticBezierCurve3(pStart, pControl, pEnd);
            const points = curve.getPoints(32);
            const curveGeom = new THREE.BufferGeometry().setFromPoints(points);
            
            // Glowing energy path line
            const lineMat = new THREE.LineBasicMaterial({
              color: new THREE.Color('#30e8c0'),
              transparent: true,
              opacity: 0.75,
              blending: THREE.AdditiveBlending
            });
            const line = new THREE.Line(curveGeom, lineMat);
            group.add(line);

            // Flow particles representing traversable wormhole conduits
            const count = 4;
            for (let i = 0; i < count; i++) {
              const particleGeom = new THREE.SphereGeometry(0.18, 8, 8);
              const particleMat = new THREE.MeshBasicMaterial({
                color: '#e8b84b',
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
              });
              const particle = new THREE.Mesh(particleGeom, particleMat);
              
              const progress = ((Date.now() * 0.0006 + (i / count)) % 1);
              const pos = curve.getPointAt(progress);
              particle.position.copy(pos);
              group.add(particle);
            }
          }
        });
        break;
      }

      // ==========================================
      // LEVEL 2: GALAXIES (12 Galaxies)
      // ==========================================
      case ExplorationLevel.GALAXIES: {
        cameraTargetRef.current = { x: 0, y: 0, z: 35 };

        GALAXIES.forEach((gal, index) => {
          const xOffset = (index - activeIndex) * 22;
          
          // Create custom 3 spiral arms rotating points group representing particle galaxies
          const galGroup = new THREE.Group();
          galGroup.position.set(xOffset, 0, 0);
          galGroup.userData = { spinSpeed: index === activeIndex ? 0.006 : 0.0012, xIndex: index };

          const count = 180;
          const pointsGeo = new THREE.BufferGeometry();
          const pPositions = new Float32Array(count * 3);
          const pColors = new Float32Array(count * 3);
          const color = new THREE.Color(gal.color);

          for (let i = 0; i < count; i++) {
            const r = Math.random() * 6.5;
            const armsNum = 3;
            const arm = i % armsNum;
            const th = (arm * (2 * Math.PI / armsNum)) + (r * 0.7);

            pPositions[i * 3] = Math.cos(th) * r + (Math.random() - 0.5) * 0.5;
            pPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
            pPositions[i * 3 + 2] = Math.sin(th) * r + (Math.random() - 0.5) * 0.5;

            pColors[i * 3] = color.r;
            pColors[i * 3 + 1] = color.g;
            pColors[i * 3 + 2] = color.b;
          }

          pointsGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
          pointsGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

          const mat = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: index === activeIndex ? 1.0 : 0.4
          });

          const pMesh = new THREE.Points(pointsGeo, mat);
          galGroup.add(pMesh);

          // Central Superdense Core Sphere
          const coreGeo = new THREE.SphereGeometry(1.0, 16, 16);
          const coreMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: index === activeIndex ? 1.0 : 0.4
          });
          const core = new THREE.Mesh(coreGeo, coreMat);
          galGroup.add(core);

          group.add(galGroup);
        });
        break;
      }

      // ==========================================
      // LEVEL 3: SOLAR SYSTEMS (12 Systems)
      // ==========================================
      case ExplorationLevel.SOLAR_SYSTEMS: {
        cameraTargetRef.current = { x: 0, y: 0, z: 32 };

        SOLAR_SYSTEMS.forEach((sys, index) => {
          const xOffset = (index - activeIndex) * 20;

          const sysGroup = new THREE.Group();
          sysGroup.position.set(xOffset, 0, 0);
          sysGroup.userData = { spinSpeed: 0.001, toggleTimeDilation: !!sys.timeDilation };

          // Core sun
          const sunGeo = new THREE.SphereGeometry(2.4, 16, 16);
          const sunMat = new THREE.MeshBasicMaterial({
            color: sys.hasBlackHole ? 0x111122 : 0xffaa00,
            transparent: true,
            opacity: index === activeIndex ? 1.0 : 0.35
          });
          const sunMesh = new THREE.Mesh(sunGeo, sunMat);
          sysGroup.add(sunMesh);

          // If a black hole system (Cygnus or M87 Core), spawn rotating accretion disk model helper
          if (sys.hasBlackHole) {
            const torusGeo = new THREE.TorusGeometry(4.2, 0.4, 8, 32);
            const torusMat = new THREE.MeshBasicMaterial({
              color: 0xff4411,
              wireframe: true,
              transparent: true,
              opacity: index === activeIndex ? 0.8 : 0.2
            });
            const accretion = new THREE.Mesh(torusGeo, torusMat);
            accretion.rotation.x = Math.PI / 2.5;
            accretion.name = 'accretion_disk';
            sysGroup.add(accretion);
          } else {
            // Standard small orbiting planet proxies (horizontal orbits)
            for (let p = 0; p < Math.min(sys.planetsCount, 3); p++) {
              const planetGeo = new THREE.SphereGeometry(0.5, 8, 8);
              const planetMat = new THREE.MeshBasicMaterial({
                color: p === 0 ? 0x4ab8ff : p === 1 ? 0xff6644 : 0x30e8c0,
                transparent: true,
                opacity: index === activeIndex ? 1.0 : 0.3
              });
              const pr = new THREE.Mesh(planetGeo, planetMat);
              const orbitR = 4 + (p * 2.2);
              const angle = Math.random() * Math.PI * 2;
              pr.position.set(Math.cos(angle) * orbitR, 0, Math.sin(angle) * orbitR);
              pr.userData = {
                orbitRadius: orbitR,
                orbitSpeed: 0.015 - (p * 0.003),
                angle
              };
              sysGroup.add(pr);
            }
          }

          group.add(sysGroup);
        });
        break;
      }

      // ==========================================
      // LEVEL 4: INTENSIVE PLANETARY VIEWER (Shorthand layout)
      // ==========================================
      case ExplorationLevel.PLANET_VIEW: {
        // Here, we have the Central Sun locked at 0, 0, 0, and all planets orbit concurrently!
        // Camera centers near the focused active planet
        const activePlanet = PLANETS[activeIndex];

        // 1. Spawning Central Sun (if not active, is a parent object)
        const sunData = PLANETS[0]; // first item is the sun
        const sunGeo = new THREE.SphereGeometry(6.5, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({
          color: 0xffea60,
          transparent: true,
          opacity: activeIndex === 0 ? 1.0 : 0.5
        });
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.position.set(0, 0, 0);
        sunMesh.userData = { spinSpeed: 0.001 };
        group.add(sunMesh);

        // 2. Generate and render concentric orbital helper paths in 3D
        for (let i = 1; i < PLANETS.length; i++) {
          const baseRadius = 15 + i * 8.5;
          const isHighlighted = hoveredOrbitIndex === i;
          
          const orbitGeo = new THREE.RingGeometry(baseRadius - 0.2, baseRadius + 0.2, 128);
          const orbitMat = new THREE.MeshBasicMaterial({
            color: isHighlighted ? 0x30e8c0 : 0x4ab8ff,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: isHighlighted ? 0.35 : 0.07,
            depthWrite: false
          });
          const orbitLine = new THREE.Mesh(orbitGeo, orbitMat);
          orbitLine.rotation.x = Math.PI / 2;
          orbitLine.userData = { isOrbitLine: true, orbitIndex: i, radius: baseRadius };
          group.add(orbitLine);
        }

        // 3. Generate and orbit ALL planetary bodies
        PLANETS.forEach((planet, index) => {
          if (index === 0) return; // skip sun redundant

          // Calculate a dynamic sequential physical visual orbit spacing radius
          const orbitRad = planetOrbits[planet.id] || (15 + index * 8.5);
          const angleOffset = index * (Math.PI / 3);

          const pTex = createCelestialTexture(THREE, planet.type || 'Rocky', planet.color);
          const pGeo = new THREE.SphereGeometry(planet.radius * 1.1, 32, 32);
          const pMat = new THREE.MeshStandardMaterial({
            map: pTex || undefined,
            color: pTex ? 0xffffff : new THREE.Color(planet.color),
            roughness: planet.type?.toLowerCase().includes('gas') ? 0.8 : 0.4,
            metalness: planet.type?.toLowerCase().includes('rock') ? 0.25 : 0.05,
            transparent: true,
            opacity: activeIndex === index ? 1.0 : 0.45,
            emissive: planet.emissive ? new THREE.Color(planet.color) : new THREE.Color('#000'),
            emissiveIntensity: planet.emissiveIntensity || 0
          });

          const pMesh = new THREE.Mesh(pGeo, pMat);
          pMesh.userData = {
            idName: planet.id,
            orbitRadius: orbitRad,
            orbitSpeed: 0.005 / Math.sqrt(index), // inverse orbit frequency
            angle: angleOffset,
            spinSpeed: 0.012,
            isBeingDragged: planet.id === draggedPlanetId
          };

          // Attach Rings to Saturn (index 6)
          if (planet.hasRings) {
            const rGeom = new THREE.RingGeometry(planet.radius * 1.5, planet.radius * 2.5, 32);
            const rMat = new THREE.MeshBasicMaterial({
              color: 0xe0d0a0,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.6
            });
            const rMesh = new THREE.Mesh(rGeom, rMat);
            rMesh.rotation.x = Math.PI / 3.2;
            pMesh.add(rMesh);
          }

          // If focused ACTIVE planet, position camera targets right near it!
          if (index === activeIndex) {
            // Anchor our target mapping coordinates to tracking camera lock on values
            // We lock camera coordinates dynamically to follow this planet's rotation!
            cameraLookAtRef.current = pMesh.position;
            cameraTargetRef.current = {
              x: pMesh.position.x + 8,
              y: pMesh.position.y + 4,
              z: pMesh.position.z + 14
            };
          }

          group.add(pMesh);
        });

        // Special case: if Sun itself is activeIndex
        if (activeIndex === 0) {
          cameraLookAtRef.current = { x: 0, y: 0, z: 0 };
          cameraTargetRef.current = { x: 0, y: 3, z: 18 };
        }
        break;
      }

      // ==========================================
      // LEVEL 5: COSMIC PHENOMENA
      // ==========================================
      case ExplorationLevel.PHENOMENA: {
        cameraTargetRef.current = { x: 0, y: 0, z: 28 };
        const actPhen = COSMIC_PHENOMENA[activeIndex];

        // Custom staging objects for individual phenomena types
        if (actPhen.type === 'blackhole') {
          // Event Horizon
          const coreGeo = new THREE.SphereGeometry(3.5, 32, 32);
          const coreMat = new THREE.MeshBasicMaterial({ color: 0x010103 });
          const core = new THREE.Mesh(coreGeo, coreMat);
          group.add(core);

          // Glowing Accretion disk
          const accGeo = new THREE.TorusGeometry(8.5, 0.7, 10, 48);
          const accMat = new THREE.MeshBasicMaterial({
            color: 0xff5500,
            wireframe: true,
            transparent: true,
            opacity: 0.8
          });
          const accretion = new THREE.Mesh(accGeo, accMat);
          accretion.rotation.x = Math.PI / 2.3;
          accretion.name = 'accretion_disk';
          group.add(accretion);

          // Expanding spacetime distortion waves
          const distGeo = new THREE.RingGeometry(8.5, 8.8, 32);
          const distMat = new THREE.MeshBasicMaterial({
            color: 0x4ab8ff,
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
          });
          const distWave = new THREE.Mesh(distGeo, distMat);
          distWave.rotation.x = Math.PI / 2.3;
          distWave.name = 'distortion_ring';
          group.add(distWave);
        } 
        else if (actPhen.type === 'wormhole') {
          // Double rotating portals connected by grid lines
          const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(3.5, 0.3, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0xb070ff, wireframe: true })
          );
          ring1.position.set(-6, 0, 0);
          ring1.rotation.y = Math.PI / 4.0;
          ring1.name = 'accretion_disk'; // rotate it
          group.add(ring1);

          const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(3.5, 0.3, 8, 32),
            new THREE.MeshBasicMaterial({ color: 0x30e8c0, wireframe: true })
          );
          ring2.position.set(6, 0, 0);
          ring2.rotation.y = -Math.PI / 4.0;
          ring2.name = 'distortion_ring';
          group.add(ring2);

          // Connected tunnel curves
          const tubeCurve = new THREE.LineCurve3(new THREE.Vector3(-6, 0, 0), new THREE.Vector3(6, 0, 0));
          const tubeGeo = new THREE.TubeGeometry(tubeCurve, 20, 2.5, 12, false);
          const tubeMat = new THREE.MeshBasicMaterial({ color: 0x4ab8ff, wireframe: true, transparent: true, opacity: 0.4 });
          const tube = new THREE.Mesh(tubeGeo, tubeMat);
          group.add(tube);
        }
        else if (actPhen.type === 'pulsar') {
          // Spinning center core + dramatic double sweepingSpotLight cones
          const pCore = new THREE.Mesh(
            new THREE.SphereGeometry(1.5, 32, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, emissive: 0x88ccff })
          );
          pCore.userData = { spinSpeed: 0.15 }; // spins super fast!
          group.add(pCore);

          // Cone lights
          const coneG = new THREE.ConeGeometry(3.0, 16.0, 16);
          const coneM = new THREE.MeshBasicMaterial({
            color: 0x4ab8ff,
            transparent: true,
            opacity: 0.4,
            wireframe: true,
            side: THREE.DoubleSide
          });
          const coneGroup = new THREE.Group();
          coneGroup.name = 'pulsar_conelight';

          const cone1 = new THREE.Mesh(coneG, coneM);
          cone1.position.y = 8.0;
          coneGroup.add(cone1);

          const cone2 = new THREE.Mesh(coneG, coneM);
          cone2.position.y = -8.0;
          cone2.rotation.z = Math.PI;
          coneGroup.add(cone2);

          group.add(coneGroup);
        }
        else if (actPhen.type === 'darkmatter') {
          // Cosmic web wireframe filaments
          const webGroup = new THREE.Group();
          webGroup.userData = { spinSpeed: 0.002 };
          const pGeo = new THREE.IcosahedronGeometry(6.0, 2);
          const pMat = new THREE.MeshBasicMaterial({ color: 0x0044aa, wireframe: true, transparent: true, opacity: 0.55 });
          const mainSphere = new THREE.Mesh(pGeo, pMat);
          webGroup.add(mainSphere);

          // Add random floating glowing atoms
          for (let i = 0; i < 15; i++) {
            const dS = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0x30e8c0 }));
            const rDir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(4.5 + Math.random() * 2);
            dS.position.copy(rDir);
            webGroup.add(dS);
          }
          group.add(webGroup);
        }
        else if (actPhen.type === 'quantum') {
          // Entangled state dots and visual bridge line
          const qGroup = new THREE.Group();
          qGroup.userData = { spinSpeed: 0.004 };
          
          const spinLeft = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff3344 }));
          spinLeft.position.set(-5, 0, 0);
          qGroup.add(spinLeft);

          const spinRight = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0x3344ff }));
          spinRight.position.set(5, 0, 0);
          qGroup.add(spinRight);

          // Connecting pulsing grid lines
          const linkGeo = new THREE.BoxGeometry(9.0, 0.08, 0.08);
          const linkMat = new THREE.MeshBasicMaterial({ color: 0xe8b84b, transparent: true, opacity: 0.8 });
          const link = new THREE.Mesh(linkGeo, linkMat);
          qGroup.add(link);

          group.add(qGroup);
        }
        else if (actPhen.type === 'inflation') {
          // A central quantum heat sphere plus 3 concentric hyper-expanding shells indicating early inflation
          const inflationGroup = new THREE.Group();
          inflationGroup.name = 'inflation_system';

          const centerSingularity = new THREE.Mesh(
            new THREE.SphereGeometry(1.0, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffea00 })
          );
          inflationGroup.add(centerSingularity);

          // Render 3 nested expanding wireframe shells
          for (let i = 0; i < 3; i++) {
            const shellGeo = new THREE.SphereGeometry(2.5 * (i + 1), 16, 16);
            const shellMat = new THREE.MeshBasicMaterial({
              color: i === 0 ? 0xff4500 : i === 1 ? 0xff8c00 : 0x00fa9a,
              wireframe: true,
              transparent: true,
              opacity: 0.45
            });
            const shell = new THREE.Mesh(shellGeo, shellMat);
            shell.name = `inflation_shell_${i}`;
            shell.userData = { index: i, baseScale: 1.0 };
            inflationGroup.add(shell);
          }
          group.add(inflationGroup);
        }
        else if (actPhen.type === 'gravitationalwave') {
          // Dual binary merging black holes with wavy concentric torus lines
          const waveGroup = new THREE.Group();
          waveGroup.name = 'gravitational_wave_system';

          const core1 = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xff1493 })
          );
          core1.name = 'wave_core_1';
          const core2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.8, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00bfff })
          );
          core2.name = 'wave_core_2';

          waveGroup.add(core1);
          waveGroup.add(core2);

          // Wavy concentric grids
          for (let i = 0; i < 6; i++) {
            const radius = 2.0 + i * 2.2;
            const rGeo = new THREE.TorusGeometry(radius, 0.08, 6, 36);
            const rMat = new THREE.MeshBasicMaterial({
              color: 0x30e8c0,
              transparent: true,
              opacity: 0.65 - (i * 0.09)
            });
            const ring = new THREE.Mesh(rGeo, rMat);
            ring.rotation.x = Math.PI / 2;
            ring.name = `wave_ripple_${i}`;
            ring.userData = { radius };
            waveGroup.add(ring);
          }
          group.add(waveGroup);
        }
        else if (actPhen.type === 'darkenergy') {
          // Vacuum repulsion core pushing lavender particles outwards
          const deGroup = new THREE.Group();
          deGroup.name = 'dark_energy_system';

          const core = new THREE.Mesh(
            new THREE.IcosahedronGeometry(2.0, 1),
            new THREE.MeshBasicMaterial({ color: 0x8a2be2, wireframe: true, transparent: true, opacity: 0.5 })
          );
          deGroup.add(core);

          const particlesGroup = new THREE.Group();
          particlesGroup.name = 'repelling_particles';
          for (let i = 0; i < 40; i++) {
            const p = new THREE.Mesh(
              new THREE.SphereGeometry(0.12 + Math.random() * 0.12, 8, 8),
              new THREE.MeshBasicMaterial({ color: 0xba55d3 })
            );
            const dir = new THREE.Vector3(
              Math.random() - 0.5,
              Math.random() - 0.5,
              Math.random() - 0.5
            ).normalize();
            
            p.userData = {
              dir,
              speed: 1.2 + Math.random() * 3.0,
              dist: Math.random() * 8.0
            };
            p.position.copy(dir).multiplyScalar(p.userData.dist);
            particlesGroup.add(p);
          }
          deGroup.add(particlesGroup);
          group.add(deGroup);
        }
        else if (actPhen.type === 'timedilation') {
          // Heavy mass sphere accompanied by two ticking clocks (near vs far) showing time dilation differential
          const tdGroup = new THREE.Group();
          tdGroup.name = 'time_dilation_system';

          const massSphere = new THREE.Mesh(
            new THREE.SphereGeometry(2.8, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x0c0f1d, transparent: true, opacity: 0.85 })
          );
          tdGroup.add(massSphere);

          // Near clock
          const clockAlpha = new THREE.Group();
          clockAlpha.name = 'clock_alpha';
          clockAlpha.position.set(-6, 2, 0);
          
          const alphaFace = new THREE.Mesh(
            new THREE.RingGeometry(1.1, 1.25, 32),
            new THREE.MeshBasicMaterial({ color: 0xff3b30, side: THREE.DoubleSide })
          );
          clockAlpha.add(alphaFace);

          const alphaHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.9, 0.08),
            new THREE.MeshBasicMaterial({ color: 0xff3b30 })
          );
          alphaHand.position.y = 0.45;
          alphaHand.name = 'clock_hand';
          clockAlpha.add(alphaHand);
          tdGroup.add(clockAlpha);

          // Far clock
          const clockBeta = new THREE.Group();
          clockBeta.name = 'clock_beta';
          clockBeta.position.set(6, 4, 0);

          const betaFace = new THREE.Mesh(
            new THREE.RingGeometry(1.1, 1.25, 32),
            new THREE.MeshBasicMaterial({ color: 0x30e8c0, side: THREE.DoubleSide })
          );
          clockBeta.add(betaFace);

          const betaHand = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.9, 0.08),
            new THREE.MeshBasicMaterial({ color: 0x30e8c0 })
          );
          betaHand.position.y = 0.45;
          betaHand.name = 'clock_hand';
          clockBeta.add(betaHand);
          tdGroup.add(clockBeta);

          group.add(tdGroup);
        }
        else if (actPhen.type === 'spacetimecurvature') {
          // ELASTIC SPIN GRID deforming in 3D according to spaceTimeMass factor slider
          const scGroup = new THREE.Group();
          scGroup.name = 'spacetime_curvature_system';

          const gridGeo = new THREE.PlaneGeometry(24, 24, 20, 20);
          const gridMat = new THREE.MeshBasicMaterial({
            color: 0x00ccff,
            wireframe: true,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
          });
          const gridMesh = new THREE.Mesh(gridGeo, gridMat);
          gridMesh.name = 'warp_grid';
          gridMesh.rotation.x = Math.PI / 2;
          scGroup.add(gridMesh);

          const massiveCore = new THREE.Mesh(
            new THREE.SphereGeometry(2.0, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x111125 })
          );
          massiveCore.name = 'warp_core';
          scGroup.add(massiveCore);

          const massiveGlow = new THREE.Mesh(
            new THREE.SphereGeometry(2.9, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x00e1ff, transparent: true, opacity: 0.15, wireframe: true })
          );
          massiveGlow.name = 'warp_glow';
          scGroup.add(massiveGlow);

          // NASA Probe Satellite curving around well
          const probe = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffa500 })
          );
          probe.name = 'experimental_probe';
          scGroup.add(probe);

          // Trajectory orbital trace path line
          const traceGeo = new THREE.BufferGeometry();
          const traceCount = 80;
          const tracePoints = new Float32Array(traceCount * 3);
          traceGeo.setAttribute('position', new THREE.BufferAttribute(tracePoints, 3));
          const traceMat = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.75 });
          const traceLine = new THREE.Line(traceGeo, traceMat);
          traceLine.name = 'experimental_trace';
          traceLine.userData = { pointsArr: [] };
          scGroup.add(traceLine);

          group.add(scGroup);
        }
        else if (actPhen.type === 'milestones') {
          // Rocket travel spiral path timeline with 5 highlighted beacons
          const mtGroup = new THREE.Group();
          mtGroup.name = 'space_travel_timeline_system';

          const spiralPoints = [];
          for (let i = 0; i < 120; i++) {
            const angle = (i / 120) * Math.PI * 4.5;
            const radius = 1.5 + (i / 120) * 8.5;
            const height = (i / 120) * 4.5 - 2.25;
            spiralPoints.push(new THREE.Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
          }
          const timelineCurve = new THREE.CatmullRomCurve3(spiralPoints);
          const tubeGeo = new THREE.TubeGeometry(timelineCurve, 80, 0.1, 8, false);
          const tubeMat = new THREE.MeshBasicMaterial({ color: 0x30e8c0, wireframe: true, transparent: true, opacity: 0.45 });
          const pathway = new THREE.Mesh(tubeGeo, tubeMat);
          mtGroup.add(pathway);

          // Five historic spatial accomplishments
          const milestonesArr = [
            { label: 'Sputnik (1957)', idx: 15 },
            { label: 'Apollo (1969)', idx: 35 },
            { label: 'Voyager (1977)', idx: 55 },
            { label: 'Cosmic Sense (2026)', idx: 80 },
            { label: 'Warp Drive (2063)', idx: 110 }
          ];

          milestonesArr.forEach((m, idx) => {
            const pos = spiralPoints[m.idx];
            const beacon = new THREE.Mesh(
              new THREE.SphereGeometry(0.35, 8, 8),
              new THREE.MeshBasicMaterial({ color: idx === 3 ? 0xffea00 : 0x00ccff })
            );
            beacon.position.copy(pos);
            beacon.name = `beacon_${idx}`;
            mtGroup.add(beacon);

            const pulsingRing = new THREE.Mesh(
              new THREE.TorusGeometry(0.65, 0.04, 4, 16),
              new THREE.MeshBasicMaterial({ color: idx === 3 ? 0xffea00 : 0x00ccff, transparent: true, opacity: 0.75 })
            );
            pulsingRing.position.copy(pos);
            pulsingRing.rotation.x = Math.PI / 2;
            pulsingRing.name = `beacon_pulse_${idx}`;
            mtGroup.add(pulsingRing);
          });

          // Conic retro timeline rocket model
          const cruiser = new THREE.Mesh(
            new THREE.ConeGeometry(0.28, 1.1, 4),
            new THREE.MeshBasicMaterial({ color: 0xffaa00 })
          );
          cruiser.name = 'timeline_cruiser';
          mtGroup.add(cruiser);

          group.add(mtGroup);
        }
        else {
          // Generic placeholder: standard rotating 3D crystalline crystal
          const fallbackG = new THREE.OctahedronGeometry(6.0);
          const fallbackM = new THREE.MeshStandardMaterial({
            color: 0x4ab8ff,
            roughness: 0.2,
            metalness: 0.8,
            wireframe: true,
            emissive: 0x112266
          });
          const fallbackMesh = new THREE.Mesh(fallbackG, fallbackM);
          fallbackMesh.userData = { spinSpeed: 0.008 };
          group.add(fallbackMesh);
        }
        break;
      }
    }
  };

  // 4. MANUAL HARDWARE GESTURE ACTION MAP
  const handleGestureAction = (gesture: string) => {
    setLastGesture(gesture);
    setGestureHint(`HAND GESTURE: ${gesture} DETECTED.`);

    // Filter "LOCKED" frames for deep selections
    if (gesture.endsWith('_LOCKED')) {
      const coreGesture = gesture.split('_')[0];
      
      if (coreGesture === 'FIST') {
        // Deep navigation down (Grab gesture - FIST, as per instructions do not change)
        if (level === ExplorationLevel.COSMOS_SPHERE) {
          setLevel(ExplorationLevel.MULTIVERSE);
          setActiveIndex(0);
        } else if (level === ExplorationLevel.MULTIVERSE) {
          setLevel(ExplorationLevel.GALAXIES);
          setActiveIndex(0);
        } else if (level === ExplorationLevel.GALAXIES) {
          setLevel(ExplorationLevel.SOLAR_SYSTEMS);
          setActiveIndex(0);
        } else if (level === ExplorationLevel.SOLAR_SYSTEMS) {
          setLevel(ExplorationLevel.PLANET_VIEW);
          setActiveIndex(0);
        }
      }
      return;
    }

    // Direct gestures map (Instant triggers)
    switch (gesture) {
      case 'THUMB_LEFT':
        handlePrevItem();
        setGestureHint("NAVIGATING LEFT...");
        break;
      case 'THUMB_RIGHT':
        handleNextItem();
        setGestureHint("NAVIGATING RIGHT...");
        break;
      case 'AIR_TAP':
        setGestureHint("SELECTION CONFIRMED via AIR TAP.");
        break;
      case 'PEACE':
        if (typeof activeIndex !== 'undefined') {
          setActiveIndex(i => Math.max(0, i - 1));
          setGestureHint("SCROLLING UP / DOWN...");
        }
        break;
      case 'PINCH':
        goBackLevel();
        setGestureHint("ASCENDING LEVEL...");
        break;
      case 'OPEN_PALM':
        goForwardLevel();
        setGestureHint("DIVING DEEP...");
        break;
    }
  };

  // 5. HELPER ACTION CHUNKS (NAVIGATORS)
  const goBackLevel = () => {
    playWarpTransition();
    if (level === ExplorationLevel.COSMOS_SPHERE) {
      onBackToHub();
    } else {
      setLevel(prev => (prev - 1) as ExplorationLevel);
      setActiveIndex(0);
    }
  };

  const goForwardLevel = () => {
    playWarpTransition();
    if (level < ExplorationLevel.PLANET_VIEW) {
      setLevel(prev => (prev + 1) as ExplorationLevel);
      setActiveIndex(0);
    }
  };

  const handlePrevItem = () => {
    const limits = [0, multiUniverses.length, GALAXIES.length, SOLAR_SYSTEMS.length, PLANETS.length, COSMIC_PHENOMENA.length];
    const max = limits[level];
    if (max > 0) {
      playSynthBeep(440, 0.08, 'sine', 0.05);
      setActiveIndex(prev => (prev === 0 ? max - 1 : prev - 1));
    }
  };

  const handleNextItem = () => {
    const limits = [0, multiUniverses.length, GALAXIES.length, SOLAR_SYSTEMS.length, PLANETS.length, COSMIC_PHENOMENA.length];
    const max = limits[level];
    if (max > 0) {
      playSynthBeep(494, 0.08, 'sine', 0.05);
      setActiveIndex(prev => (prev === max - 1 ? 0 : prev + 1));
    }
  };

  // KEYBOARD CONTROLS FALLBACK
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevItem();
          break;
        case 'ArrowRight':
          handleNextItem();
          break;
        case 'ArrowUp':
          // Zoom in
          cameraTargetRef.current.z = Math.max(12, cameraTargetRef.current.z - 5);
          break;
        case 'ArrowDown':
          // Zoom out
          cameraTargetRef.current.z = Math.min(180, cameraTargetRef.current.z + 5);
          break;
        case 'Enter':
        case ' ': {
          // Drill down
          if (level < ExplorationLevel.PLANET_VIEW) {
            setLevel(prev => (prev + 1) as ExplorationLevel);
            setActiveIndex(0);
          }
          break;
        }
        case 'Escape':
        case 'Backspace':
          goBackLevel();
          break;
        case 'g':
        case 'G':
          setShowGuide(prev => !prev);
          break;
        case 'c':
        case 'C':
          // Webcam air-gestures are now persistently managed globally via the G-HUD controller panel
          break;
        case 'm':
        case 'M':
          setShowMinimap(prev => !prev);
          break;
        case 'p':
        case 'P':
          setLevel(ExplorationLevel.PHENOMENA);
          setActiveIndex(0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [level, activeIndex]);

  // Zero-lag custom reticle alignment
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  // 3D Planet-Grab Raycasting & Alignment interaction
  useEffect(() => {
    if (level !== ExplorationLevel.PLANET_VIEW) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Horizontal orbital flat plane at Y=0
    const orbitalPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

    const getPlaneIntersection = (e: MouseEvent): any => {
      if (!cameraRef.current) return null;
      
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersectPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(orbitalPlane, intersectPoint)) {
        return intersectPoint;
      }
      return null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Left mouse click only

      if (!cameraRef.current || !currentObjectsGroupRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouse.set(x, y);

      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const intersects = raycaster.intersectObjects(currentObjectsGroupRef.current.children, true);
      
      // Find a nested planet model with idName
      const planetIntersect = intersects.find(intersect => {
        let obj = intersect.object;
        while (obj) {
          if (obj.userData && obj.userData.idName) return true;
          obj = obj.parent as any;
        }
        return false;
      });

      if (planetIntersect) {
        let obj: any = planetIntersect.object;
        while (obj && !(obj.userData && obj.userData.idName)) {
          obj = obj.parent;
        }

        if (obj) {
          const planetId = obj.userData.idName;
          setDraggedPlanetId(planetId);
          obj.userData.isBeingDragged = true;
          playSynthBeep(587, 0.15, 'triangle', 0.1);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const intersection = getPlaneIntersection(e);
      if (!intersection) return;

      if (draggedPlanetId) {
        const group = currentObjectsGroupRef.current;
        if (group) {
          let foundMesh: any = null;
          group.children.forEach((child: any) => {
            if (child.userData && child.userData.idName === draggedPlanetId) {
              foundMesh = child;
            }
          });

          if (foundMesh) {
            foundMesh.position.copy(intersection);
            foundMesh.position.y = 0; // Lock perfectly flat on orbital plane

            const sunDist = foundMesh.position.length();
            
            // Compute nearest slot out of 1-11
            let closestOrbitIdx = Math.round((sunDist - 15) / 8.5);
            closestOrbitIdx = Math.max(1, Math.min(closestOrbitIdx, PLANETS.length - 1));

            if (hoveredOrbitIndex !== closestOrbitIdx) {
              setHoveredOrbitIndex(closestOrbitIdx);
            }
          }
        }
      } else {
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        mouse.set(x, y);

        if (cameraRef.current && currentObjectsGroupRef.current) {
          raycaster.setFromCamera(mouse, cameraRef.current);
          const intersects = raycaster.intersectObjects(currentObjectsGroupRef.current.children, true);
          const hoverPlanet = intersects.find(intersect => {
            let item = intersect.object;
            while (item) {
              if (item.userData && item.userData.idName) return true;
              item = item.parent as any;
            }
            return false;
          });

          if (hoverPlanet) {
            let parentObj = hoverPlanet.object;
            while (parentObj && !(parentObj.userData && parentObj.userData.idName)) {
              parentObj = parentObj.parent as any;
            }
            if (parentObj) {
              const matchedP = PLANETS.find(p => p.id === parentObj.userData.idName);
              if (matchedP && hoveredObject?.id !== matchedP.id) {
                setHoveredObject(matchedP);
              }
            }
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!draggedPlanetId) return;

      const group = currentObjectsGroupRef.current;
      if (group) {
        let foundMesh: any = null;
        group.children.forEach((child: any) => {
          if (child.userData && child.userData.idName === draggedPlanetId) {
            foundMesh = child;
          }
        });

        if (foundMesh) {
          foundMesh.userData.isBeingDragged = false;

          if (hoveredOrbitIndex !== null) {
            const finalRadius = 15 + hoveredOrbitIndex * 8.5;
            
            setPlanetOrbits(prev => ({
              ...prev,
              [draggedPlanetId]: finalRadius
            }));

            playSuccessChime();
            playSynthBeep(880, 0.12, 'sine', 0.08);
          }
        }
      }

      setDraggedPlanetId(null);
      setHoveredOrbitIndex(null);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [level, draggedPlanetId, hoveredOrbitIndex, hoveredObject]);

  // Generate dynamic information details mapping dependent on active state
  const getActiveItemDetails = () => {
    if (level === ExplorationLevel.MULTIVERSE) {
      return multiUniverses[activeIndex];
    } else if (level === ExplorationLevel.GALAXIES) {
      return GALAXIES[activeIndex];
    } else if (level === ExplorationLevel.SOLAR_SYSTEMS) {
      return SOLAR_SYSTEMS[activeIndex];
    } else if (level === ExplorationLevel.PLANET_VIEW) {
      return PLANETS[activeIndex];
    } else if (level === ExplorationLevel.PHENOMENA) {
      return COSMIC_PHENOMENA[activeIndex];
    }
    return null;
  };

  const detailsObj = getActiveItemDetails();

  // Establish Card layout alignment opposite from focused ThreeJS viewport space position
  // E.g., if index is on first half of array, float Card on the right; else float on the left.
  const isRightHalf = activeIndex >= (
    level === ExplorationLevel.MULTIVERSE ? multiUniverses.length / 2 :
    level === ExplorationLevel.GALAXIES ? GALAXIES.length / 2 :
    level === ExplorationLevel.SOLAR_SYSTEMS ? SOLAR_SYSTEMS.length / 2 :
    level === ExplorationLevel.PLANET_VIEW ? PLANETS.length / 2 : 5
  );

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col justify-between z-10 p-4 md:p-6 select-none bg-transparent overflow-hidden">
      
      {/* FULL-SCREEN 3D THREE.JS WEBGL RENDER WINDOW */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover z-0 cursor-none pointer-events-auto"
      />

      {/* TOP HUD ROW */}
      <div className="relative z-10 flex justify-between items-start w-full">
        {/* TOP LEFT: Depth levels readout */}
        <div className="glass-panel px-4 py-2 rounded-xl flex flex-col justify-start max-w-[280px]">
          <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">NAVIGATION TIERS</div>
          <div className="text-sm font-display font-black text-white uppercase tracking-wider mt-1 border-b border-white/5 pb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue"></span>
            {level === 0 && 'COSMOS SPHERE'}
            {level === 1 && 'MULTIVERSE CORE'}
            {level === 2 && 'GALACTIC COGNIZANCE'}
            {level === 3 && 'STELLAR ORBIT ANCHORS'}
            {level === 4 && 'PLANETARY SHELLS'}
            {level === 5 && 'COSMIC PHENOMENA'}
          </div>
          <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1.5 font-semibold">
            <Compass className="w-3 h-3 text-gold" />DEPTH LEVEL: <span className="text-gold">0{level} / 05</span>
          </div>
        </div>

        {/* TOP CENTER: COSMOS logo */}
        <div className="hidden md:flex flex-col items-center justify-center">
          <h1 className="font-display font-black text-3xl tracking-[10px] text-white animate-dimension-shift select-none">
            COSMOS
          </h1>
          <span className="text-[8px] font-display font-bold text-blue tracking-[4px] uppercase mt-0.5 animate-pulse">ENCYCLOPEDIA</span>
        </div>

        {/* TOP RIGHT: Dual Dilated Clocks Overlay */}
        <div className="flex flex-col gap-2 items-end">
          <div className="glass-panel px-4 py-2 rounded-xl flex flex-col items-end w-[200px]">
            <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase flex items-center gap-1.5">
              <RefreshCw className={`w-2.5 h-2.5 ${isTimeDilationActive ? 'animate-spin' : ''}`} /> RELATIVITY REGISTRY
            </div>
            {/* Clock 1: Normal Time */}
            <div className="flex justify-between items-center w-full mt-1.5 border-b border-white/5 pb-1">
              <span className="text-[9px] text-slate-400 font-mono">NORMAL SPACE:</span>
              <span className="text-xs font-mono font-bold text-white">
                {String(Math.floor(normalTime / 3600)).padStart(2, '0')}:
                {String(Math.floor((normalTime % 3600) / 60)).padStart(2, '0')}:
                {String(normalTime % 60).padStart(2, '0')}s
              </span>
            </div>
            {/* Clock 2: Near Black Hole Time */}
            <div className="flex justify-between items-center w-full mt-1">
              <span className="text-[9px] text-slate-400 font-mono">NEAR BLACK HOLE:</span>
              <span className={`text-xs font-mono font-bold ${isTimeDilationActive ? 'text-orange animate-pulse' : 'text-slate-500'}`}>
                {String(Math.floor(dilatedTime / 3600)).padStart(2, '0')}:
                {String(Math.floor((dilatedTime % 3600) / 60)).padStart(2, '0')}:
                {String(Math.floor(dilatedTime) % 60).padStart(2, '0')}s
              </span>
            </div>
          </div>
          
          {/* Active indicator indicators */}
          {isTimeDilationActive && (
            <div className="flex items-center gap-1.5 bg-orange/15 border border-orange/40 text-orange font-mono text-[8px] px-2.5 py-0.5 rounded-full tracking-wider uppercase animate-pulse">
              <ShieldAlert className="w-2.5 h-2.5" /> DILATION ACTIVE (G-FORCE WARP)
            </div>
          )}
        </div>
      </div>

      {/* MIDDLE CONTAINER: FLOATING MOUNTED 3D DETAILS CARD */}
      <div className="relative z-10 w-full flex-grow flex items-center justify-between pointer-events-none mt-2">
        
        {/* Navigation arrows (Overlay left/right) */}
        {level > ExplorationLevel.COSMOS_SPHERE && (
          <div className="pointer-events-auto flex items-center justify-between w-full">
            <button 
              onClick={handlePrevItem}
              className="p-3 bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:border-blue/35 transition-all duration-300 rounded-full cursor-none ml-2"
            >
              ←
            </button>
            <button 
              onClick={handleNextItem}
              className="p-3 bg-black/40 border border-white/5 text-slate-400 hover:text-white hover:border-blue/35 transition-all duration-300 rounded-full cursor-none mr-2"
            >
              →
            </button>
          </div>
        )}

        {/* DETAILS FLOATER GLASS PANEL: Appears only when on a selected level */}
        <AnimatePresence mode="wait">
          {detailsObj && (
            <motion.div
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 35 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute pointer-events-auto w-[255px] glass-panel p-5 rounded-2xl border border-blue/15 flex flex-col justify-between right-6"
            >
              <div>
                <span className="text-[8px] font-mono tracking-widest text-[#4ab8ff] uppercase bg-blue/10 border border-blue/30 px-2 py-0.5 rounded-full inline-block mb-3 select-none">
                  {(detailsObj as any).type || 'PARALLEL DIMENSION'}
                </span>
                
                <h3 className="font-display font-black text-lg text-gold tracking-widest uppercase mb-1 border-b border-white/5 pb-1">
                  {detailsObj.name}
                </h3>

                {/* Grid profile statistics */}
                <div className="flex flex-col gap-1.5 mt-3 mb-4 text-[9px] font-mono leading-tight border-b border-white/5 pb-3">
                  {level === ExplorationLevel.MULTIVERSE && (
                    <>
                      <div>AGE: <span className="text-white">{(detailsObj as any).age}</span></div>
                      <div>DIAMETER: <span className="text-white">{(detailsObj as any).diameter}</span></div>
                      <div>CONSTITUENT ELEMENTS: <span className="text-white">{(detailsObj as any).composition}</span></div>
                      <div className="text-slate-400 mt-1 leading-normal italic font-semibold">{(detailsObj as any).specialFeature}</div>
                    </>
                  )}
                  {level === ExplorationLevel.GALAXIES && (
                    <>
                      <div>DIAMETER: <span className="text-white">{(detailsObj as any).diameter}</span></div>
                      <div>STAR METADATA: <span className="text-white">{(detailsObj as any).starsCount}</span></div>
                      <div className="text-blue mt-1 leading-normal uppercase">SMBH: {(detailsObj as any).supermassiveBlackHole}</div>
                    </>
                  )}
                  {level === ExplorationLevel.SOLAR_SYSTEMS && (
                    <>
                      <div>PARENT STAR: <span className="text-white">{(detailsObj as any).starType}</span></div>
                      <div>THERM: <span className="text-white">{(detailsObj as any).starTemp}</span></div>
                      <div>PLANET INDEX: <span className="text-white">{(detailsObj as any).planetsCount} worlds</span></div>
                    </>
                  )}
                  {level === ExplorationLevel.PLANET_VIEW && (
                    <>
                      <div>DIAMETER: <span className="text-white">{(detailsObj as any).realDiameter}</span></div>
                      <div>TEMPERATURES: <span className="text-white">{(detailsObj as any).tempRange}</span></div>
                      <div>SATELLITE MOONS: <span className="text-white">{(detailsObj as any).moonsCount} Moons</span></div>
                      <div className="text-slate-400 mt-1 leading-normal italic">{(detailsObj as any).composition}</div>
                    </>
                  )}
                  {level === ExplorationLevel.PHENOMENA && (
                    <>
                      <div className="text-slate-300 leading-normal mb-1 font-display uppercase tracking-wide">{(detailsObj as any).stats}</div>
                    </>
                  )}
                </div>

                <p className="text-[10px] text-slate-300 font-sans leading-normal tracking-wide">
                  {detailsObj.description}
                </p>
              </div>

              {/* Informative footer quote */}
              {(detailsObj as any).fact && (
                <div className="mt-4 pt-3 border-t border-white/5 text-[9.5px] italic text-[#4ab8ff] leading-relaxed select-none">
                  {(detailsObj as any).fact}
                </div>
              )}

              {/* Codex / Log Chronicle Slide-out Trigger */}
              <button
                id="initiate-telemetry-scroll-btn"
                onClick={() => {
                  playSynthBeep(440, 0.08, 'sine', 0.05);
                  setIsCodexOpen(!isCodexOpen);
                }}
                className={`mt-4 w-full text-center py-2 font-mono text-[8px] border rounded-lg uppercase tracking-wider transition-all duration-300 font-bold ${
                  isCodexOpen 
                    ? 'bg-cyan/20 border-cyan text-cyan hover:bg-cyan/15 animate-pulse' 
                    : 'bg-[#4ab8ff]/10 border-[#4ab8ff]/40 text-[#4ab8ff] hover:bg-[#4ab8ff]/20 hover:border-[#4ab8ff]'
                }`}
              >
                {isCodexOpen ? '✦ CLOSE DEEP STUDY ✦' : '✦ INIT DEEP STUDY SCROLL ✦'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LONG SCROLLABLE SIDE PANEL */}
        <AnimatePresence>
          {isCodexOpen && detailsObj && (
            <motion.div
              initial={{ opacity: 0, x: isRightHalf ? 100 : -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRightHalf ? 100 : -100 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className={`absolute top-2 bottom-2 pointer-events-auto w-[330px] glass-panel p-5 rounded-2xl border border-cyan/30 z-[100] flex flex-col bg-slate-950/95 shadow-[0_0_40px_rgba(48,232,192,0.15)] ${
                isRightHalf ? 'right-6' : 'left-6'
              }`}
            >
              {/* Slide-out Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-2.5 mb-3.5 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#30e8c0] animate-ping"></span>
                  <span className="text-[9px] font-display font-black text-[#30e8c0] tracking-widest uppercase">
                    CHRONOSPACE LOGBOOK
                  </span>
                </div>
                <button
                  onClick={() => setIsCodexOpen(false)}
                  className="text-[9.5px] font-mono text-slate-500 hover:text-white transition-colors cursor-none px-2 py-0.5 border border-white/5 hover:border-white/20 bg-black/40 rounded-md"
                >
                  ESC [X]
                </button>
              </div>

              {/* Scrollable Container with standard ID */}
              <div
                id="codex-scroll-container"
                className="flex-grow overflow-y-auto pr-1.5 custom-scrollbar flex flex-col gap-4 select-text leading-relaxed"
                style={{ scrollBehavior: 'smooth' }}
              >
                {/* Scroll Hint */}
                <div className="rounded-lg bg-cyan/5 border border-cyan/20 p-2 text-center text-cyan select-none">
                  <div className="text-[8px] font-mono font-bold tracking-widest uppercase">
                    ✦ GESTURE FLOW DECODED ✦
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-400 mt-1 leading-normal uppercase">
                    Drift your hand vertically in mid-air <br/>or press [W]/[S] to scroll smoothly
                  </div>
                </div>

                <div className="text-xs font-display font-black text-white tracking-widest uppercase flex items-center gap-1.5 border-l-2 border-cyan pl-2 py-0.5 select-none">
                  🔬 LITHOSPHERIC FIELD MATRIX
                </div>

                <div className="text-[9px] font-mono text-slate-400 flex flex-col gap-1 px-1">
                  <p>
                    Spectral analysis of <span className="text-white font-bold">{detailsObj.name}</span> indicates a dense silicate core surrounded by high-viscosity basalt layers. Core pressure exceeds {level * 18.4 + 42.1} million Earth atmospheres, allowing secondary crystallization of sub-surface metallic formations.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1.5 bg-black/35 p-2 rounded-lg border border-white/5 select-none font-semibold">
                    <div>Abundance Index: <span className="text-cyan">{(level * 14 + 12).toFixed(1)}%</span></div>
                    <div>Core Viscosity: <span className="text-cyan">{(level * 0.9 + 1.2).toFixed(2)} η</span></div>
                    <div>Tectonic Plate: <span className="text-cyan">{level + 2} major</span></div>
                    <div>Albedo Factor: <span className="text-cyan">{(0.12 + level * 0.08).toFixed(2)} α</span></div>
                  </div>
                </div>

                <div className="text-xs font-display font-black text-white tracking-widest uppercase flex items-center gap-1.5 border-l-2 border-cyan pl-2 py-0.5 mt-2 select-none">
                  ⏳ G-FORCE TIME DILATION METRIC
                </div>

                <div className="text-[9px] font-mono text-slate-400 flex flex-col gap-1.5 px-1">
                  <p>
                    Due to gravitational proximity indices, space relativity vectors are continuously warped. At a radial distance of {120 - level * 15}AU, time dilates relative to normal space telemetry clocks, manifesting a relative variance of <span className="text-[#e2a83b] font-bold">1:{(Math.exp(level * 0.45) * 1.08).toFixed(2)}</span> scaling ratios.
                  </p>
                  <p className="italic bg-black/20 p-2 rounded border-l border-gold/30 text-gold text-[8.5px]">
                    "At the core boundary, each physical second experienced corresponds to roughly {(Math.exp(level * 0.45) * 1.08).toFixed(1)} Earth seconds. Relativistic displacement remains active."
                  </p>
                </div>

                <div className="text-xs font-display font-black text-white tracking-widest uppercase flex items-center gap-1.5 border-l-2 border-cyan pl-2 py-0.5 mt-2 select-none">
                  📡 HIGH-FREQUENCY SIGNAL GRIDS
                </div>

                <div className="text-[9px] font-mono text-[#30e8c0] flex flex-col gap-1 px-1 leading-normal italic">
                  <div className="border border-[#30e8c0]/15 bg-black/50 p-2.5 rounded-lg font-bold select-none text-[8.5px]">
                    ✦ RECOVERED SUB-SPACE ENVELOPE: <br/>
                    [EXPEDITION_{level}_SIGNAL_{activeIndex}]
                  </div>
                  <p className="text-slate-400 not-italic mt-1">
                    "Transmission captured via deep-space array at {(2054 + activeIndex * 3)}-04-18. Thermal anomaly detected in deep subterranean caverns of {detailsObj.name}. Background interference suggests steady neutrino output that syncs perfectly with local orbit periods."
                  </p>
                </div>

                <div className="text-xs font-display font-black text-white tracking-widest uppercase flex items-center gap-1.5 border-l-2 border-cyan pl-2 py-0.5 mt-2 select-none">
                  🪐 MAG-SENSORY FIELD LOGS
                </div>

                <div className="text-[9px] font-mono text-slate-400 flex flex-col gap-1 px-1">
                  <p>
                    Electromagnetic flux layers are currently running at peak intensities. A secondary shield of highly charged atomic particles wraps around the system, generating beautiful persistent aurora bands on polar coordinates.
                  </p>
                  <div className="border border-white/5 bg-black/40 p-2 rounded text-[8px] text-slate-300">
                    <div className="flex justify-between">
                      <span>MAGNETIC FLUX:</span>
                      <span className="text-white">{(12.4 * level + 4.5).toFixed(1)} μT</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>SPECTRAL SHIFT:</span>
                      <span className="text-white">+{(0.03 * level + 0.01).toFixed(3)} z</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>NEUTRINO FLUX:</span>
                      <span className="text-white">{(level * 3.2 + 8.1).toFixed(2)} e12/m²</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs font-display font-black text-white tracking-widest uppercase flex items-center gap-1.5 border-l-2 border-cyan pl-2 py-0.5 mt-2 select-none">
                  🛡️ CADET EXPEDITION MEMORANDUM
                </div>

                <div className="text-[9px] font-mono text-slate-400 flex flex-col gap-2 px-1">
                  <p>
                    "We have deployed three micro-probes directly into the low-orbit envelope. The gravitational drag was immense but predictable. If you are reading this data log, ensure your ship has at least a Level {level + 1} ion deflection matrix before approaching."
                  </p>
                  <div className="text-[7.5px] font-bold text-[#4ab8ff] tracking-wider uppercase text-center mt-2 select-none border-t border-white/5 pt-2">
                    ✦ TELEMETRY DECODING COMPLETE ✦
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTTOM CONTROL AND RADAR HUD */}
      <div className="relative z-10 flex justify-between items-end w-full mt-auto">
        {/* BOTTOM LEFT: Back button + Gestures Guide */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={goBackLevel}
              className="pointer-events-auto font-display font-bold text-[10px] uppercase tracking-widest p-2.5 rounded-xl glass-button select-none flex items-center gap-1.5 cursor-none"
            >
              ← {level === ExplorationLevel.COSMOS_SPHERE ? 'BACK TO MISSION HUB' : 'ELEVATE NAV LEVEL'}
            </button>

            {/* Phenomena Jump Button */}
            <button
              onClick={() => {
                playSuccessChime();
                playWarpTransition();
                setLevel(level === ExplorationLevel.PHENOMENA ? ExplorationLevel.COSMOS_SPHERE : ExplorationLevel.PHENOMENA);
                setActiveIndex(0);
              }}
              className="pointer-events-auto font-display font-bold text-[10px] uppercase tracking-widest p-2.5 rounded-xl glass-button-gold select-none flex items-center gap-1.5 cursor-none"
            >
              <Zap className="w-3.5 h-3.5" /> {level === ExplorationLevel.PHENOMENA ? 'SPHERE OF COSMOS' : 'COSMIC PHENOMENA'}
            </button>

            {/* Cinematic Tour Toggle */}
            <button
              onClick={runCinematicTour}
              className={`pointer-events-auto font-display font-bold text-[10px] uppercase tracking-widest p-2.5 rounded-xl ${isTourMode ? 'bg-purple-600 text-white' : 'glass-button'} select-none flex items-center gap-1.5 cursor-none`}
            >
              <Tv className="w-3.5 h-3.5" /> {isTourMode ? 'TOUR ACTIVE' : 'CINEMATIC TOUR'}
            </button>
          </div>

          {/* GESTURES KEYBOARD GUIDE */}
          {showGuide && (
            <div className="glass-panel p-4 rounded-xl max-w-[280px] flex flex-col">
              <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase border-b border-white/5 pb-1 mb-1.5 flex justify-between items-center select-none font-black">
                <span>SYSTEM GESTURAL GUIDE</span>
              </div>
              <ul className="text-[8px] font-mono text-slate-400 gap-1 flex flex-col">
                <li>• <span className="text-white font-bold">PALM:</span> Dive inside</li>
                <li>• <span className="text-white font-bold">PINCH:</span> Ascend/Back</li>
                <li>• <span className="text-white font-bold">THUMB (L/R):</span> Navigate</li>
                <li>• <span className="text-white font-bold">AIR TAP:</span> Select</li>
                <li>• <span className="text-white font-bold">PEACE (UP/DOWN):</span> Scroll</li>
                <li>• <span className="text-white font-bold">FIST (GRAB):</span> Deep Engage</li>
              </ul>
            </div>
          )}
          
          {/* MY PLANETS PANEL */}
          <div className="glass-panel p-4 rounded-xl max-w-[280px] flex flex-col mt-2">
            <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase border-b border-white/5 pb-1 mb-1.5 flex justify-between items-center select-none font-black">
              <span>MY PLANETS ({myPlanets.length})</span>
            </div>
            {myPlanets.length === 0 ? (
              <div className="text-[8px] font-mono text-slate-500 italic">No planets captured yet.</div>
            ) : (
              <ul className="text-[8px] font-mono text-slate-400 gap-1 flex flex-col">
                {myPlanets.map(planet => <li key={planet.id}>• {planet.name}</li>)}
              </ul>
            )}
          </div>
          
          {/* SENSITIVITY CALIBRATION */}
          <div className="glass-panel p-4 rounded-xl max-w-[280px] flex flex-col mt-2">
            <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase border-b border-white/5 pb-1 mb-1.5 flex justify-between items-center select-none font-black">
              <span>SENSITIVITY TUNING</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="2.0" 
              step="0.1" 
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full accent-cyan h-1 bg-slate-700 rounded-lg appearance-none cursor-none"
            />
            <div className="text-[7.5px] text-slate-400 font-mono mt-1 text-center">{sensitivity.toFixed(1)}x</div>
          </div>
        </div>

        {/* BOTTOM CENTER: Current Gesture Recognition readout */}
        <div className="flex flex-col items-center justify-center p-3 glass-panel-glow rounded-2xl w-[320px]">
          <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">G-TRACK MONITOR</div>
          <div className="text-[10px] font-display font-black tracking-wider text-white mt-1 uppercase flex items-center gap-1.5 select-none">
            GESTURE: <span className="text-gold">{lastGesture}</span>
          </div>
          <div className="text-[8px] font-mono text-[#30e8c0] tracking-wide text-center uppercase leading-normal mt-1 border-t border-white/5 pt-1">
            {gestureHint}
          </div>
        </div>

        {/* BOTTOM RIGHT: Minimap radar index */}
        <div className="flex flex-col gap-3 items-end">
          {/* MINIMAP / RADAR INDICATOR */}
          {showMinimap && (
            <div className="glass-panel p-3 rounded-xl flex items-center gap-4 w-[210px] select-none">
              <div className="relative w-12 h-12 flex justify-center items-center">
                <div className="absolute inset-0 border border-blue/10 rounded-full animate-ping"></div>
                <div className="absolute w-12 h-12 border border-blue/20 rounded-full"></div>
                <div className="absolute w-8 h-8 border border-purple/20 rounded-full"></div>
                <div className="absolute w-2 h-2 bg-gold rounded-full"></div>
                {/* Active vector dot rotating */}
                <div className="absolute w-1.5 h-1.5 bg-blue rounded-full" style={{
                  top: '12%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  transformOrigin: '0px 24px',
                  animation: 'orbitSpin 5s linear infinite'
                }}></div>
              </div>

              <div className="flex flex-col justify-start">
                <div className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">MINIMAP COORDINATES</div>
                <div className="text-[10px] font-mono text-slate-300 font-bold uppercase mt-0.5">
                  LEVEL: <span className="text-blue">0{level}/05</span>
                </div>
                <div className="text-[8px] font-mono text-slate-400 mt-1">
                  INDEX: <span className="text-white font-bold">{activeIndex + 1}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
      
      {/* Global Grab displacement HUD cockpit overlay */}
      {draggedPlanetId && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-5 py-2 glass-panel-glow border-2 border-gold/40 text-center pointer-events-none select-none tracking-widest leading-none font-bold animate-pulse text-gold uppercase text-[9px] max-w-lg shadow-[0_0_20px_rgba(232,184,75,0.2)]">
          ✦ DOCKED ORBITAL DISPLACEMENT ENGAGED: DRAGGING PLANET ✦
          <div className="text-[7.5px] font-mono text-cyan tracking-wider mt-1.5 normal-case font-normal">
            Release the click to trigger magnetic re-anchoring on concentric orbit slot 0{hoveredOrbitIndex}
          </div>
        </div>
      )}

      {/* Dynamic Holographic Reticle Alignment Indicator */}
      <div 
        ref={cursorRef}
        style={{ position: 'fixed', transform: 'translate(-50%, -50%)', left: '-100px', top: '-100px' }}
        className="pointer-events-none z-[10000] w-6 h-6 rounded-full flex items-center justify-center select-none"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${draggedPlanetId ? 'bg-gold animate-ping' : 'bg-[#30e8c0]'}`}></span>
        <span className={`absolute inset-0 border rounded-full ${draggedPlanetId ? 'border-dashed border-gold/70 scale-125 animate-spin' : 'border-blue/30 scale-100'}`}></span>
        
        {draggedPlanetId && (
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-start bg-slate-950/90 border border-gold/40 px-2.5 py-1.5 rounded-lg w-[160px] shadow-[0_0_15px_rgba(232,184,75,0.3)]">
            <span className="text-[7.5px] font-mono text-gold font-bold tracking-widest uppercase animate-pulse">✊ DOCKED & GRABBED</span>
            <span className="text-[9px] font-display font-black text-white uppercase mt-0.5 tracking-wider truncate max-w-full">
              {PLANETS.find(p => p.id === draggedPlanetId)?.name}
            </span>
            {hoveredOrbitIndex !== null && (
              <span className="text-[7px] font-mono text-cyan mt-0.5 tracking-wide uppercase">
                TARGET SLOT: 0{hoveredOrbitIndex}
              </span>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
export default CosmicExplorer;
