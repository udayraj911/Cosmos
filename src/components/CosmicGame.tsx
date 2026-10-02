import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Plus, AlertCircle, CheckCircle, 
  Trash2, Globe, Flame, Award, BookOpen, Download, User, Info, Pencil, Eye
} from 'lucide-react';
import { UserCelestialObject, ChatMessage } from '../types';
import { QUIZ_QUESTIONS } from '../quizData';
import { playSynthBeep, playSuccessChime, playWarpTransition, playScannerSweep, playErrorBuzz } from '../utils/audio';
import { handScrollService } from '../services/handScrollService';
import { createCelestialTexture } from '../utils/textures';
import { getFeatureHelp } from '../lib/cosmicKnowledge';
import { KnowledgeQuest } from './KnowledgeQuest';

// 30+ default planets library metadata for Tab 2
const PLANET_LIBRARY = [
  // Standard
  { id: 'rock', name: 'Rocky World', type: 'Standard', color: '#888888', desc: 'Dense basalt crust. Iron core. Vulnerable to solar wind.' },
  { id: 'ocean', name: 'Ocean Planet', type: 'Standard', color: '#2266ff', desc: '100% deep water mantle. Holds micro-organic algae.' },
  { id: 'desert', name: 'Desert World', type: 'Standard', color: '#e0a060', desc: 'Severe dust storms. Carbonate soils. Faint water locks.' },
  { id: 'ice', name: 'Ice Giant', type: 'Standard', color: '#77ddff', desc: 'Frozen hydrogen/water shell. Liquid methane streams.' },
  { id: 'gas', name: 'Gas Giant', type: 'Standard', color: '#cc9955', desc: 'Immense molecular hydrogen envelope. Metallic core.' },
  { id: 'lava', name: 'Lava World', type: 'Standard', color: '#ff4400', desc: 'Intense tidal heating. Molten surface sheet. Sulfur vents.' },
  { id: 'forest', name: 'Forest Moon', type: 'Standard', color: '#338844', desc: 'Temperate climate. Cyanobacteria and thick canopies.' },
  { id: 'arctic', name: 'Arctic World', type: 'Standard', color: '#ddf5ff', desc: 'Sparsely lit glacier. High reflectivity. Sub-surface heat.' },
  { id: 'storm', name: 'Storm Planet', type: 'Standard', color: '#666688', desc: 'Violent cyclonic clouds. Lightning charging atmosphere.' },
  { id: 'jungle', name: 'Jungle World', type: 'Standard', color: '#22aa77', desc: 'Hyper-active oxygen cycle. Giant carbonaceous spores.' },
  
  // Exotic
  { id: 'crystal', name: 'Crystal Planet', type: 'Exotic', color: '#df88ff', desc: 'Spacetime lattice. Rocks comprise high-purity diamonds.' },
  { id: 'plasma', name: 'Plasma Sphere', type: 'Exotic', color: '#ff3366', desc: 'Semi-star body. Direct electromagnetic surface arcings.' },
  { id: 'darkmatter', name: 'Dark Matter Body', type: 'Exotic', color: '#111122', desc: 'Non-baryonic matter shell. Detectable only by gravity.' },
  { id: 'quantum', name: 'Quantum World', type: 'Exotic', color: '#33ffaa', desc: 'Planck-scale fluctuation. Exists in superimposed positions.' },
  { id: 'neutron', name: 'Neutron World', type: 'Exotic', color: '#ffffff', desc: 'Extreme spin density. Infinite gravitational compression.' },
  { id: 'magnetar', name: 'Magnetar Fragment', type: 'Exotic', color: '#44bbff', desc: 'Lethal magnetic shielding warping atomic bindings.' },
  { id: 'pulsarbeacon', name: 'Pulsar Beacon', type: 'Exotic', color: '#88aaff', desc: 'Radioactive sweep nozzle venting electromagnetic jets.' },
  
  // Alien
  { id: 'biolum', name: 'Biolum World', type: 'Alien', color: '#a033ff', desc: 'Bioluminescent oceans. Liquid methane structure.' },
  { id: 'silicon', name: 'Silicon Planet', type: 'Alien', color: '#ddaa33', desc: 'Silicon-based ecosystems. Hexagonal sand formats.' },
  { id: 'methane', name: 'Methane World', type: 'Alien', color: '#00ccaa', desc: 'Tidally locked gas globe surrounded by frozen gas lines.' },
  { id: 'radioactive', name: 'Rad Sphere', type: 'Alien', color: '#3cff3c', desc: 'Uranium core leakage. Glows bright radioactive green.' },
  { id: 'living', name: 'Living Planet', type: 'Alien', color: '#ff77aa', desc: 'Semi-conscious biological shell. Surface expands/contracts.' },
  { id: 'hive', name: 'Hive World', type: 'Alien', color: '#886644', desc: 'Dugout tunnels containing silicon cellular swarms.' },
  { id: 'gascreature', name: 'Gas Creature', type: 'Alien', color: '#ffbb88', desc: 'Living atmospheric nebular cloud consuming local dust.' },

  // Special
  { id: 'blackhole', name: 'Black Hole', type: 'Special', color: '#13111f', desc: 'Gravitational singularity. Calibrates local pull metrics inside sandbox.' },
  { id: 'whitedwarf', name: 'White Dwarf', type: 'Special', color: '#ffffdd', desc: 'Remnants of yellow dwarf. Extremely dense, hot and stable.' },
  { id: 'nebulafrog', name: 'Nebula Fragment', type: 'Special', color: '#aa33aa', desc: 'Glowing hydrogen dust pocket nursery fueling gas accretion.' },
  { id: 'wormhole', name: 'Wormhole', type: 'Special', color: '#7733ff', desc: 'Einstein-Rosen portal shortcutting outer galactic dimensions.' },
  { id: 'timecrystal', name: 'Time Crystal', type: 'Special', color: '#60e8ff', desc: 'Perfect temporal crystal repeating lattice symmetry in time.' },
  { id: 'voidshard', name: 'Void Shard', type: 'Special', color: '#151525', desc: 'A cold shard of pure space vacuum without atomic contents.' }
];

interface CosmicGameProps {
  userAuth: { email: string; name: string } | null;
  onTriggerSignUp: () => void;
}

export const CosmicGame: React.FC<CosmicGameProps> = ({ userAuth, onTriggerSignUp }) => {
  const [activeTab, setActiveTab] = useState<'jarvis' | 'builder' | 'spacetime' | 'quiz'>('jarvis');
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const isGuest = userAuth?.email === "guest@universe.io";

  // =========================================================================
  // STATE 1: INTEGRATED CHAT AND LIVE THREE PREVIEW (TAB 1)
  // =========================================================================
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const jarvisZoomScaleRef = useRef<number>(1.0);
  
  const [chatInput, setChatInput] = useState('');
  const [chatList, setChatList] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'jarvis',
      text: 'Greetings, Commander. I am J.A.R.V.I.S. Welcome to the Universe Creator. State the celestial design coordinates or command parameters you desire, and I shall synthesize the 3D structures instantly. (Try picking a suggestion chip below!)',
      timestamp: '09:00'
    }
  ]);
  const [userSystem, setUserSystem] = useState<UserCelestialObject[]>([
    { id: 'sun', name: 'Yellow Star', type: 'Stellar', color: '#ffa500', size: 3.5, speed: 0.001, distance: 0 }
  ]);

  // Three JS preview loop for JARVIS live preview
  useEffect(() => {
    if (activeTab !== 'jarvis') return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 500);
    camera.position.set(0, 15 * jarvisZoomScaleRef.current, 25 * jarvisZoomScaleRef.current);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const light = new THREE.PointLight(0xffea99, 2.5, 100);
    light.position.set(0, 0, 0);
    scene.add(light);

    const helperGroup = new THREE.Group();
    scene.add(helperGroup);

    // Build items from userSystem
    userSystem.forEach((obj, index) => {
      // Draw Central star or orbiting bodies
      const pTex = createCelestialTexture(THREE, obj.type || 'Rocky', obj.color);
      const geo = new THREE.SphereGeometry(obj.size, 24, 24);
      const mat = new THREE.MeshStandardMaterial({
        map: pTex || undefined,
        color: pTex ? 0xffffff : new THREE.Color(obj.color),
        roughness: 0.2,
        emissive: obj.type === 'Stellar' ? new THREE.Color(obj.color) : new THREE.Color('#000'),
        emissiveIntensity: obj.type === 'Stellar' ? 1.2 : 0
      });
      const mesh = new THREE.Mesh(geo, mat);

      if (obj.type === 'Stellar') {
        mesh.position.set(0, 0, 0);
      } else {
        // Orbit positioning
        const angle = index * (Math.PI / 2.5);
        mesh.position.set(Math.cos(angle) * obj.distance, 0, Math.sin(angle) * obj.distance);
        mesh.userData = {
          orbitRadius: obj.distance,
          orbitSpeed: obj.speed,
          angle
        };

        // Orbit helpers ring
        const oGeo = new THREE.RingGeometry(obj.distance - 0.05, obj.distance + 0.05, 32);
        const oMat = new THREE.MeshBasicMaterial({ color: 0x4ab8ff, side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
        const oMesh = new THREE.Mesh(oGeo, oMat);
        oMesh.rotation.x = Math.PI / 2;
        scene.add(oMesh);
      }

      helperGroup.add(mesh);
    });

    let frameId: number;
    const animate = () => {
      helperGroup.children.forEach((child: any) => {
        child.rotation.y += 0.01;
        if (child.userData?.orbitRadius) {
          child.userData.angle += child.userData.orbitSpeed;
          child.position.x = Math.cos(child.userData.angle) * child.userData.orbitRadius;
          child.position.z = Math.sin(child.userData.angle) * child.userData.orbitRadius;
        }
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!canvas || !camera) return;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    };
    window.addEventListener('resize', handleResize);

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
        jarvisZoomScaleRef.current = Math.max(0.1, jarvisZoomScaleRef.current * 0.9);
        camera.position.set(0, 15 * jarvisZoomScaleRef.current, 25 * jarvisZoomScaleRef.current);
        camera.lookAt(0, 0, 0);
      } else if (e.key === '-' || e.key === '_' || e.key === 'Subtract') {
        jarvisZoomScaleRef.current = Math.min(10.0, jarvisZoomScaleRef.current * 1.1);
        camera.position.set(0, 15 * jarvisZoomScaleRef.current, 25 * jarvisZoomScaleRef.current);
        camera.lookAt(0, 0, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      scene.traverse((object: any) => {
        if (!object.isMesh) return;
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [userSystem, activeTab]);

  // JARVIS Chat auto scrolling
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatList]);

  const handleChatSubmit = (text: string) => {
    if (!text.trim()) return;

    const lText = text.toLowerCase();
    const wantsToMake = lText.includes('planet') || lText.includes('create') || lText.includes('add') || lText.includes('make') || lText.includes('universe') || lText.includes('singular');
    if (isGuest && wantsToMake) {
      playErrorBuzz();
      setShowGuestWarning(true);
      return;
    }

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatList(prev => [...prev, userMsg]);
    setChatInput('');

    // Simulated JARVIS dynamic pipeline
    setTimeout(() => {
      let jarvisText = 'I have analyzed your spatial commands, Commander. Orbit synthesized successfully.';
      let newObj: UserCelestialObject | null = null;
      let svgDiagram = '';

      const lText = text.toLowerCase();
      // Handle Earth specifically, or general planet additions
      if (lText.includes('earth') || lText.includes('planet') || lText.includes('create') || lText.includes('add') || lText.includes('make')) {
        const isEarth = lText.includes('earth');
        const randColor = isEarth ? '#2266ff' : ['#30e8c0', '#b070ff', '#ff8844', '#ffdd60', '#4ab8ff'][Math.floor(Math.random() * 5)];
        const dist = 6 + userSystem.length * 2.5;
        const name = isEarth ? 'Earth' : (text.split(' ').slice(-1)[0] || 'Alien world');
        const size = isEarth ? 1.4 : 0.6 + Math.random() * 0.8;
        const speed = isEarth ? 0.012 : 0.008 + Math.random() * 0.015;

        newObj = {
          id: String(Date.now()),
          name,
          type: 'Planet',
          color: randColor,
          size,
          speed,
          distance: dist
        };

        if (isEarth) {
          jarvisText = `COMMANDER, BIOLOGICAL SYNTHESIS ENGAGED! Perfectly synthesized "Earth" at orbit tier ${dist.toFixed(1)} ly. Stable nitrogen-oxygen atmospheric envelope, active magnetosphere, and ocean water verified. It has been registered in your Universe Builder sections!`;
          svgDiagram = `
            <svg viewBox="0 0 160 120" class="w-full h-24 bg-slate-900/80 border border-[#2266ff]/40 rounded mt-2">
              <style>
                .ocean { fill: #2266ff; filter: drop-shadow(0 0 5px rgba(34,102,255,0.7)); }
                .land { fill: #15803d; }
                .cloud { fill: #ffffff; opacity: 0.55; }
                .orbit { stroke: rgba(74,184,255,0.2); stroke-dasharray: 2 2; fill: none; }
                .label { fill: #e2e8f0; font-size: 6px; font-family: monospace; }
              </style>
              <circle cx="80" cy="60" r="28" class="ocean" />
              <path d="M 62 50 Q 75 42 78 55 Q 65 65 62 50 Z" class="land" />
              <path d="M 85 58 Q 95 48 98 62 Q 88 74 85 58 Z" class="land" />
              <path d="M 70 72 Q 80 82 82 72 Q 72 65 70 72 Z" class="land" />
              <ellipse cx="76" cy="52" rx="14" ry="4" class="cloud" />
              <ellipse cy="68" cx="88" rx="10" ry="3" class="cloud" />
              <text x="5" y="15" class="label text-gold">HOMELAND SENSOR: EARTH DETECTED</text>
              <text x="5" y="112" class="label">HABITATION CLASS: SUSTAINED BIOMINERALS</text>
            </svg>
          `;
        } else {
          jarvisText = `COMMUNICATION RECEIVED. Initializing molecular synthesizer... Spawned dynamic orbital shell "${newObj.name}" at distance tier ${dist.toFixed(1)} ly. Core signature matches standard organic templates. Unlocked inside builder section.`;
          svgDiagram = `
            <svg viewBox="0 0 160 120" class="w-full h-24 bg-slate-900/80 border border-teal/20 rounded mt-2">
              <style>
                .node { fill: ${randColor}; filter: drop-shadow(0 0 4px ${randColor}); }
                .core { fill: #ffa500; filter: drop-shadow(0 0 6px #ffa500); }
                .orbit { stroke: rgba(74,184,255,0.25); stroke-dasharray: 2 2; fill: none; }
                .label { fill: #b5b5b5; font-size: 6px; font-family: monospace; }
              </style>
              <circle cx="80" cy="60" r="10" class="core" />
              <circle cx="80" cy="60" r="35" class="orbit" />
              <circle cx="110" cy="38" r="4" class="node" />
              <line x1="80" y1="60" x2="110" y2="38" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />
              <text x="5" y="15" class="label text-gold">SCHEMATIC DIAGRAM: ${newObj.name.toUpperCase()}</text>
              <text x="116" y="38" class="label">${newObj.name}</text>
              <text x="5" y="112" class="label">ORBIT TIER: ${dist.toFixed(1)}ly | SIZE: ${newObj.size.toFixed(2)}r</text>
            </svg>
          `;
        }

        // Output custom synthesized planet to builder planetary section!
        const customPl = {
          id: newObj.id,
          name: newObj.name,
          type: isEarth ? 'Standard' : 'Custom Synthesized',
          color: newObj.color,
          desc: isEarth 
            ? 'Synthesized habitable homeworld. Liquid water environment paired with self-sustaining high-energy atmosphere.'
            : `A custom synthesized celestial planet created by Commander and J.A.R.V.I.S. Command Matrix.`
        };
        setCustomPlanets(prev => [...prev, customPl]);

      } else if (lText.includes('black hole') || lText.includes('blackhole')) {
        const dist = 6 + userSystem.length * 2.5;
        newObj = {
          id: String(Date.now()),
          name: 'Black Hole Singularity',
          type: 'Anomaly',
          color: '#13111f',
          size: 2.2,
          speed: 0.003,
          distance: dist
        };
        jarvisText = `CAUTION ADMONISHED. Gravitational singularity triggered at coordinates. Spatial curvature index is dilating spacetime. The Black Hole singularity has been unlocked inside your universe builder library!`;
        svgDiagram = `
          <svg viewBox="0 0 160 120" class="w-full h-24 bg-slate-900/80 border border-purple-500/40 rounded mt-2">
            <style>
              .hole { fill: #020204; stroke: #7b2cbf; stroke-width: 2.5; filter: drop-shadow(0 0 8px #7b2cbf); }
              .corona { fill: none; stroke: rgba(123,44,191,0.3); stroke-width: 6; stroke-dasharray: 4 2; }
              .label { fill: #b5b5b5; font-size: 6px; font-family: monospace; }
            </style>
            <circle cx="80" cy="60" r="28" class="corona animate-spin" />
            <circle cx="80" cy="60" r="14" class="hole" />
            <text x="5" y="15" class="label text-red-400">⚠️ SINGULARITY ACTIVE: EVENT HORIZON DETECTED</text>
            <text x="5" y="112" class="label">CURVATURE INDEX: INFINITE | DRAG INDUCTION RECTIFICATION G-FORCE</text>
          </svg>
        `;

        const customBH = {
          id: newObj.id,
          name: newObj.name,
          type: 'Special',
          color: newObj.color,
          desc: 'A supermassive black hole anomaly synthesized by JARVIS, with extreme gravity bounds.'
        };
        setCustomPlanets(prev => [...prev, customBH]);

      } else if (lText.includes('wormhole')) {
        const dist = 6 + userSystem.length * 2.5;
        newObj = {
          id: String(Date.now()),
          name: 'Wormhole Portal',
          type: 'Anomaly',
          color: '#7733ff',
          size: 1.6,
          speed: 0.015,
          distance: dist
        };
        jarvisText = `Topological shortcut established! An active Einstein-Rosen wormhole portal bridge has been locked down. Transit vectors are now accessible inside your universe builder section!`;
        svgDiagram = `
          <svg viewBox="0 0 160 120" class="w-full h-24 bg-slate-900/80 border border-indigo-500/40 rounded mt-2">
            <style>
              .neck { fill: none; stroke: #7733ff; stroke-width: 1.5; stroke-dasharray: 3 1; }
              .label { fill: #b5b5b5; font-size: 6px; font-family: monospace; }
            </style>
            <ellipse cx="80" cy="40" rx="30" ry="8" class="neck" />
            <ellipse cx="80" cy="80" rx="30" ry="8" class="neck" />
            <line x1="50" y1="40" x2="50" y2="80" stroke="#7733ff" />
            <line x1="110" y1="40" x2="110" y2="80" stroke="#7733ff" />
            <line x1="80" y1="48" x2="80" y2="72" stroke="#7733ff" stroke-width="1" />
            <text x="5" y="15" class="label text-indigo-400">🌀 EINSTEIN-ROSEN PORTAL ACTIVATED</text>
            <text x="5" y="112" class="label">MATTER VELOCITY COUPLING: 450,000 km/s</text>
          </svg>
        `;

        const customWH = {
          id: newObj.id,
          name: newObj.name,
          type: 'Special',
          color: newObj.color,
          desc: 'An active Einstein-Rosen bridge wormhole portal shortcutting cosmic space coordinates.'
        };
        setCustomPlanets(prev => [...prev, customWH]);

      } else {
        jarvisText = `Understood. Processing background data arrays. Command: Try saying "Create Earth", "Add a black hole", or "Add a wormhole" to synthesize exotic structures instantly!`;
      }

      if (newObj) {
        setUserSystem(prev => [...prev, newObj!]);
      } else if (!lText.includes('earth') && !lText.includes('planet') && !lText.includes('create') && !lText.includes('add') && !lText.includes('make') && !lText.includes('black hole') && !lText.includes('wormhole')) {
          jarvisText = `I am aware of these capabilities: ${getFeatureHelp(lText)}`;
      }

      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'jarvis',
        text: jarvisText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        diagramSvg: svgDiagram || undefined
      };

      setChatList(prev => [...prev, aiMsg]);
    }, 1200);
  };

  const handleExportSystem = () => {
    alert(`UNIVERSE SAVE PROTOCOL ENGAGED\n\nYour synthesized universe configuration holds ${userSystem.length} active stellar-bodies. Unique signature cached securely in local matrix databases successfully.`);
  };

  // =========================================================================
  // STATE 2: INTERACTIVE ORBIT ASSIGNMENT AND STATS GRID (TAB 2)
  // =========================================================================
  const [orbits, setOrbits] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [activeOrbitSelect, setActiveOrbitSelect] = useState<number | null>(null);
  const [showBlackHolePrompt, setShowBlackHolePrompt] = useState(false);
  const [blackHoleTargetOrbitIdx, setBlackHoleTargetOrbitIdx] = useState<number | null>(null);
  const [blackHoleGravityForce, setBlackHoleGravityForce] = useState<number>(10);
  const [collapseStatusMessage, setCollapseStatusMessage] = useState<string | null>(null);

  const [customPlanets, setCustomPlanets] = useState<any[]>([]);
  
  // Multi solar system state slot management
  const [universeSlots, setUniverseSlots] = useState<{ id: string; name: string; type: string; orbits: (string | null)[]; userSystem: any[] }[]>([
    { 
      id: 'alpha-nexus', 
      name: 'Centauri Nexus', 
      type: 'Solar System', 
      orbits: [null, null, null, null, null, null],
      userSystem: [{ id: 'sun', name: 'Yellow Star', type: 'Stellar', color: '#ffa500', size: 3.5, speed: 0.001, distance: 0 }]
    }
  ]);
  const [activeUniverseId, setActiveUniverseId] = useState<string>('alpha-nexus');
  const [universeBridges, setUniverseBridges] = useState<{ id: string; slotA: string; slotB: string; type: string }[]>([]);
  const [bridgeAnimationActive, setBridgeAnimationActive] = useState(false);
  const [bridgeProgress, setBridgeProgress] = useState(0);

  // Spacetime Curvature Grid states
  const [curvaturePlanetId, setCurvaturePlanetId] = useState<string>('sun');
  const [curvatureMass, setCurvatureMass] = useState<number>(30);
  const [curvatureGravity, setCurvatureGravity] = useState<number>(35);
  const [isSpacetimeTorn, setIsSpacetimeTorn] = useState(false);
  const [tearGlitchState, setTearGlitchState] = useState(false);

  // Jarvis AI Creation interactive dialogue wizard states
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [creationMethod, setCreationMethod] = useState<'jarvis' | 'manual' | null>(null);
  const [jarvisStep, setJarvisStep] = useState<number>(0); // 0: select type, 1: select elements, 2: processing, 3: completed
  const [jarvisObjectType, setJarvisObjectType] = useState<string>('Planet'); // Planet or Black Hole
  const [jarvisAnswers, setJarvisAnswers] = useState<{ type: string; elements: string }>({ type: '', elements: '' });
  const [thinkingSimulationActive, setThinkingSimulationActive] = useState(false);
  const [thinkingOutput, setThinkingOutput] = useState('');

  // Manual creation states
  const [manualName, setManualName] = useState('');
  const [manualAsteroidCount, setManualAsteroidCount] = useState<number>(0);
  const [manualElements, setManualElements] = useState<string>('Normal Silicates');
  const [manualPlanetSize, setManualPlanetSize] = useState<number>(1.2);
  const [manualMass, setManualMass] = useState<number>(35);
  const [manualGravity, setManualGravity] = useState<number>(9.8);

  const [editingPlanet, setEditingPlanet] = useState<any | null>(null);
  const [editingPlanetName, setEditingPlanetName] = useState<string>('');
  const [selectedDetailPlanet, setSelectedDetailPlanet] = useState<any | null>(null);

  // Load and Save per User Account automatic persistence
  const userPrefix = userAuth?.email ? userAuth.email.replace(/[@.]/g, '_') : 'guest';
  
  useEffect(() => {
    try {
      const savedSlots = localStorage.getItem(`cosmos_universe_slots_${userPrefix}`);
      const savedActiveId = localStorage.getItem(`cosmos_active_universe_id_${userPrefix}`);
      const savedBridges = localStorage.getItem(`cosmos_universe_bridges_${userPrefix}`);
      const savedCustomPlanets = localStorage.getItem(`cosmos_custom_planets_${userPrefix}`);
      
      if (savedSlots) {
        const parsed = JSON.parse(savedSlots);
        setUniverseSlots(parsed);
      }
      if (savedActiveId) {
        setActiveUniverseId(savedActiveId);
        
        // Populate current orbits & userSystem from active slot
        const parsedSlots = savedSlots ? JSON.parse(savedSlots) : null;
        if (parsedSlots) {
          const activeSlot = parsedSlots.find((s: any) => s.id === savedActiveId);
          if (activeSlot) {
            setOrbits(activeSlot.orbits);
            setUserSystem(activeSlot.userSystem);
          }
        }
      }
      if (savedBridges) {
        setUniverseBridges(JSON.parse(savedBridges));
      }
      if (savedCustomPlanets) {
        setCustomPlanets(JSON.parse(savedCustomPlanets));
      }
    } catch (e) {
      console.error("Error loading user-specific cosmos persistence", e);
    }
  }, [userAuth]);

  // Sync state changes to localStorage
  const saveStateToStorage = (updatedSlots?: any, updatedActiveId?: string, updatedBridges?: any, updatedCustom?: any) => {
    try {
      const slotsToSave = updatedSlots || universeSlots;
      const activeIdToSave = updatedActiveId || activeUniverseId;
      const bridgesToSave = updatedBridges || universeBridges;
      const customToSave = updatedCustom || customPlanets;

      localStorage.setItem(`cosmos_universe_slots_${userPrefix}`, JSON.stringify(slotsToSave));
      localStorage.setItem(`cosmos_active_universe_id_${userPrefix}`, activeIdToSave);
      localStorage.setItem(`cosmos_universe_bridges_${userPrefix}`, JSON.stringify(bridgesToSave));
      localStorage.setItem(`cosmos_custom_planets_${userPrefix}`, JSON.stringify(customToSave));
    } catch (e) {
      console.error(e);
    }
  };

  // Helper trigger to auto save upon orbits or userSystem changes
  useEffect(() => {
    // Cache universe state globally for J.A.R.V.I.S companionship
    (window as any).__lastUniverseState = {
      userSystem,
      orbits,
      universeSlots,
      universeBridges,
    };

    if (activeUniverseId) {
      const updatedSlots = universeSlots.map(slot => {
        if (slot.id === activeUniverseId) {
          return { ...slot, orbits, userSystem };
        }
        return slot;
      });
      setUniverseSlots(updatedSlots);
      saveStateToStorage(updatedSlots);
    }
  }, [orbits, userSystem, activeUniverseId, universeBridges]);

  const allPlanets = [...PLANET_LIBRARY, ...customPlanets];

  // Grab & Place gesture-ready states and track coordinates
  const [grabbedPlanet, setGrabbedPlanet] = useState<any | null>(null);
  const [hoveredOrbitIndex, setHoveredOrbitIndex] = useState<number | null>(null);
  const [hoveredPlanetCardId, setHoveredPlanetCardId] = useState<string | null>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  // Update mouse pointer coordinates for cursor-follower visual mapping using high-performance direct ref manipulation
  useEffect(() => {
    let currentX = (window as any).__latestMouseX || 0;
    let currentY = (window as any).__latestMouseY || 0;
    if (followerRef.current && currentX && currentY) {
      followerRef.current.style.left = `${currentX + 15}px`;
      followerRef.current.style.top = `${currentY + 15}px`;
    }
    const handleMouseMove = (e: MouseEvent) => {
      currentX = e.clientX;
      currentY = e.clientY;
      if (followerRef.current) {
        followerRef.current.style.left = `${currentX + 15}px`;
        followerRef.current.style.top = `${currentY + 15}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [grabbedPlanet]);

  // Listen to conversational queries parsed by J.A.R.V.I.S. to instantly forage celestial bodies or bridges
  useEffect(() => {
    const handleJarvisCommand = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (!customEvent.detail) return;
      
      const { action, bodyType, name, color, gravity, size, mass, slotA, slotB } = customEvent.detail;
      
      if (action === 'create-celestial') {
        const finalId = `body-${Date.now()}`;
        const isBlackHole = bodyType === 'Black Hole' || bodyType === 'Anomaly';
        
        const newBody = {
          id: finalId,
          name: name || (isBlackHole ? 'EXOTIC BLACK HOLE' : 'FORGED PLANET'),
          type: isBlackHole ? 'Anomaly' : 'Planet',
          color: color || '#30e8c0',
          size: size || 1.3,
          speed: 0.012,
          distance: 6 + userSystem.length * 2.5,
          gravity: gravity || 9.8,
          mass: mass || 35.0,
          atmosphere: 'High Density Gas Core',
          isCustom: true
        };
        
        // Append to 3D graphics view
        setUserSystem(prev => [...prev, newBody]);
        
        // Slot into first available orbit so it gets displayed automatically!
        const unoccupiedIdx = orbits.findIndex(o => o === null);
        if (unoccupiedIdx !== -1) {
          const updatedOrbits = [...orbits];
          updatedOrbits[unoccupiedIdx] = finalId;
          setOrbits(updatedOrbits);
        }

        // Add to persistent custom planet register
        setCustomPlanets(prev => {
          const updated = [...prev, newBody];
          saveStateToStorage(undefined, undefined, undefined, updated);
          return updated;
        });
      } 
      else if (action === 'bridge-universes') {
        // Find matching universe slots
        const findSlot = (queryStr: string) => {
          if (!queryStr) return null;
          return universeSlots.find(
            s => s.name.toLowerCase().includes(queryStr.toLowerCase()) || 
                 s.id.toLowerCase().includes(queryStr.toLowerCase())
          );
        };
        
        const sA = findSlot(slotA) || universeSlots[0];
        const sB = findSlot(slotB) || universeSlots[1] || universeSlots[0];
        
        if (sA && sB) {
          const checkExists = universeBridges.some(
            b => (b.slotA === sA.id && b.slotB === sB.id) || (b.slotA === sB.id && b.slotB === sA.id)
          );
          
          if (!checkExists) {
            const newBridge = {
              id: `bridge-${Date.now()}`,
              slotA: sA.id,
              slotB: sB.id,
              type: 'Einstein-Rosen Wormhole'
            };
            
            const updatedBridges = [...universeBridges, newBridge];
            setUniverseBridges(updatedBridges);
            
            // Re-save state
            saveStateToStorage(undefined, undefined, updatedBridges);
          }
        }
      }
    };
    
    window.addEventListener('jarvis-builder-command', handleJarvisCommand);
    return () => window.removeEventListener('jarvis-builder-command', handleJarvisCommand);
  }, [userSystem, orbits, universeSlots, universeBridges, customPlanets]);

  // Set up custom event observer for global hand gestural interactions
  useEffect(() => {
    const handleGlobalGestureEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.gesture) {
        const gesture = customEvent.detail.gesture;
        
        // Grab when FIST or FIST_LOCKED is detected over a planet card in library
        if (gesture === 'FIST' || gesture === 'FIST_LOCKED') {
          if (hoveredPlanetCardId && !grabbedPlanet) {
            const planetToGrab = allPlanets.find(p => p.id === hoveredPlanetCardId);
            if (planetToGrab) {
              setGrabbedPlanet(planetToGrab);
              playSynthBeep(520, 0.14, 'sine', 0.08);
            }
          }
        } 
        // Drop we open the fist to OPEN_PALM or OPEN_PALM_LOCKED
        else if (gesture === 'OPEN_PALM' || gesture === 'OPEN_PALM_LOCKED') {
          if (grabbedPlanet) {
            if (hoveredOrbitIndex !== null) {
              const newOrbits = [...orbits];
              newOrbits[hoveredOrbitIndex] = grabbedPlanet.id;
              setOrbits(newOrbits);
              playSuccessChime();
            } else {
              // Released outside - cancel hold
              playSynthBeep(310, 0.08, 'sine', 0.05);
            }
            setGrabbedPlanet(null);
          }
        }
      }
    };
    window.addEventListener('hand-gesture', handleGlobalGestureEvent);
    return () => {
      window.removeEventListener('hand-gesture', handleGlobalGestureEvent);
    };
  }, [grabbedPlanet, hoveredPlanetCardId, hoveredOrbitIndex, orbits]);

  // Set up gestural scrolling target for our builder layout
  useEffect(() => {
    if (activeTab === 'builder') {
      const container = document.getElementById('builder-scroll-container');
      if (container) {
        handScrollService.setTargetContainer(container);
      }
    } else {
      handScrollService.setTargetContainer(null);
    }
    return () => {
      handScrollService.setTargetContainer(null);
    };
  }, [activeTab]);

  const handlePlanetCardClick = (planet: any) => {
    // If it is the Black Hole, we must prompt the user first for calibration parameters!
    if (planet.id === 'blackhole') {
      setBlackHoleTargetOrbitIdx(activeOrbitSelect);
      setBlackHoleGravityForce(10);
      setShowBlackHolePrompt(true);
      playWarpTransition();
      return;
    }

    // Tab 1 backward compatibility: slot directly if an orbit slot was already preselected
    if (activeOrbitSelect !== null) {
      const newOrbits = [...orbits];
      newOrbits[activeOrbitSelect] = planet.id;
      setOrbits(newOrbits);
      
      // Auto slot logic: Search from activeOrbitSelect - 1 down to 0, then activeOrbitSelect + 1 up to 5 for empty slots
      let nextSelectIdx: number | null = null;
      for (let i = activeOrbitSelect - 1; i >= 0; i--) {
        if (newOrbits[i] === null) {
          nextSelectIdx = i;
          break;
        }
      }
      if (nextSelectIdx === null) {
        for (let i = activeOrbitSelect + 1; i < 6; i++) {
          if (newOrbits[i] === null) {
            nextSelectIdx = i;
            break;
          }
        }
      }
      setActiveOrbitSelect(nextSelectIdx);
      playSuccessChime();
      return;
    }

    // Toggle copy/grab hold
    if (grabbedPlanet?.id === planet.id) {
      setGrabbedPlanet(null);
      playSynthBeep(310, 0.08, 'sine', 0.05);
    } else {
      setGrabbedPlanet(planet);
      playSynthBeep(520, 0.14, 'sine', 0.08);
    }
  };

  const handleConfirmBlackHole = (force: number) => {
    setShowBlackHolePrompt(false);
    
    if (force > 10) {
      // MASSIVE COLLAPSE! Clear everything!
      setOrbits([null, null, null, null, null, null]);
      setGrabbedPlanet(null);
      setCollapseStatusMessage(`💥 TOTAL SYSTEM COLLAPSE! Gravity force is ${force} (Threshold: 10). Because gravity was more than 10, all of your solar system has completely collapsed into the black hole singularity!`);
      playErrorBuzz();
    } else {
      // MODERATE WARNING WITH SOME POSSIBILITIES OF COLLAPSING OVER TIME
      // Let's randomly clear an outer orbit to simulate "some outer orbitals collapsing"!
      const currentFilledIndices: number[] = [];
      orbits.forEach((p, index) => {
        if (p !== null) currentFilledIndices.push(index);
      });
      
      const newOrbits = [...orbits];
      let collapsedCount = 0;
      if (currentFilledIndices.length > 0) {
        const randomIndexToCollapse = currentFilledIndices[Math.floor(Math.random() * currentFilledIndices.length)];
        newOrbits[randomIndexToCollapse] = null;
        collapsedCount++;
      }
      
      // Slot or grab the black hole
      if (blackHoleTargetOrbitIdx !== null) {
        newOrbits[blackHoleTargetOrbitIdx] = 'blackhole';
        setOrbits(newOrbits);
        
        // Auto slot logic: Search for next unoccupied orbit slot
        let nextSelectIdx: number | null = null;
        for (let i = blackHoleTargetOrbitIdx - 1; i >= 0; i--) {
          if (newOrbits[i] === null) {
            nextSelectIdx = i;
            break;
          }
        }
        if (nextSelectIdx === null) {
          for (let i = blackHoleTargetOrbitIdx + 1; i < 6; i++) {
            if (newOrbits[i] === null) {
              nextSelectIdx = i;
              break;
            }
          }
        }
        setActiveOrbitSelect(nextSelectIdx);
        setBlackHoleTargetOrbitIdx(null);
      } else {
        const bhObj = allPlanets.find(p => p.id === 'blackhole');
        setGrabbedPlanet(bhObj);
      }
      
      setCollapseStatusMessage(`⚠️ GRAVITY UNSTABLE! Force is ${force}. Gravity is low, so the solar system remains, but with some possibilities of getting collapsed. ${collapsedCount > 0 ? "Indeed, one of your planetary orbits was immediately swallowed and collapsed!" : "Volatility is highly critical."}`);
      playSuccessChime();
    }
  };

  const handleClearOrbit = (idx: number) => {
    const newOrbits = [...orbits];
    newOrbits[idx] = null;
    setOrbits(newOrbits);
  };

  // Aggregated System Builder Statistics
  const getSytemAggregateStats = () => {
    const filled = orbits.filter(o => o !== null) as string[];
    const counts = filled.length;
    let habitable = 0;
    let maxPopulation = 0;
    let anomalies = 0;

    filled.forEach((item, idx) => {
      if (item === 'ocean' || item === 'forest' || item === 'jungle' || item === 'biolum') {
        habitable++;
        maxPopulation += 1.2 + (idx * 0.8);
      }
      if (item === 'blackhole' || item === 'wormhole' || item === 'magnetar' || item === 'lava') {
        anomalies++;
      }
    });

    return { counts, habitable, maxPopulation: maxPopulation.toFixed(1), anomalies };
  };

  const stats = getSytemAggregateStats();

  // =========================================================================
  // STATE 3: MASTER SPACE KNOWLEDGE QUEST SYSTEM (TAB 3)
  // =========================================================================
  // Managed inside KnowledgeQuest.tsx component

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col justify-between z-10 p-4 md:p-6 select-none bg-[#030614]/20 overflow-hidden">
      
      {/* HEADER SECTION CONTROLLER */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full gap-3 border-b border-white/5 pb-3">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="text-[8px] text-slate-500 font-mono tracking-widest uppercase mb-0.5">MISSION CENTER</div>
          <h2 className="font-display font-black text-2xl tracking-widest text-[#f0ead8] uppercase">
            🎮 COSMIC UNIVERSE GAME
          </h2>
        </div>

        {/* COMPREHENSIVE TAB TRIGGER SWITCHES */}
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              playWarpTransition();
              setActiveTab('jarvis');
            }}
            className={`font-display font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-xl transition-all duration-300 border cursor-none ${
              activeTab === 'jarvis' 
                ? 'bg-blue/15 border-blue text-white shadow-[0_0_15px_rgba(74,184,255,0.25)]' 
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🤖 AI CREATOR (JARVIS)
          </button>
          
          <button
            onClick={() => {
              playWarpTransition();
              if (isGuest) {
                playErrorBuzz();
                setShowGuestWarning(true);
              } else {
                setActiveTab('builder');
              }
            }}
            className={`font-display font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-xl transition-all duration-300 border cursor-none ${
              activeTab === 'builder' 
                ? 'bg-gold/15 border-gold text-white shadow-[0_0_15px_rgba(232,184,75,0.25)]' 
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🪐 MY UNIVERSE BUILDER
          </button>

          <button
            onClick={() => {
              playWarpTransition();
              if (isGuest) {
                playErrorBuzz();
                setShowGuestWarning(true);
              } else {
                setActiveTab('spacetime');
              }
            }}
            className={`font-display font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-xl transition-all duration-300 border cursor-none ${
              activeTab === 'spacetime' 
                ? 'bg-cyan/15 border-cyan text-white shadow-[0_0_15px_rgba(48,232,192,0.25)]' 
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🌀 SPACETIME & GATEWAYS
          </button>

          <button
            onClick={() => {
              playWarpTransition();
              setActiveTab('quiz');
            }}
            className={`font-display font-black text-[10px] tracking-widest uppercase px-4 py-2 rounded-xl transition-all duration-300 border cursor-none ${
              activeTab === 'quiz' 
                ? 'bg-purple/15 border-purple text-white shadow-[0_0_15px_rgba(176,112,255,0.25)]' 
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            🏆 KNOWLEDGE QUEST
          </button>
        </div>
      </div>

      {/* CORE TAB DOCK CONTENT */}
      <div className="relative z-10 flex-grow w-full py-4 mt-1 overflow-hidden">
        
        {/* ===================================================================
            TAB 1: AI CREATOR (JARVIS CHAT + LIVE PREVIEW)
            =================================================================== */}
        {activeTab === 'jarvis' && (
          <div className="w-full h-full flex flex-col md:flex-row gap-5 overflow-hidden">
            
            {/* LEFT: SCROLLING JARVIS HUD CHAT VIEW */}
            <div className="w-full md:w-[42%] h-full glass-panel rounded-2xl flex flex-col justify-between border-blue/10 relative overflow-hidden bg-slate-950/75 p-4">
              
              {/* Spinning JARVIS indicator banner */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-blue rounded-full animate-ping"></span>
                  <span className="text-[10px] font-display font-bold text-white tracking-widest">J.A.R.V.I.S. INTERACTION PANEL</span>
                </div>
                <span className="text-[8px] font-mono text-slate-400">STATUS: CORE ONLINE</span>
              </div>

              {/* Chat list history scrolls */}
              <div 
                ref={scrollRef}
                className="flex-grow overflow-y-auto mb-4 flex flex-col gap-3 pr-2 scrollbar-none"
              >
                {chatList.map((chat) => (
                  <div 
                    key={chat.id} 
                    className={`flex flex-col max-w-[85%] ${
                      chat.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[7px] font-mono text-slate-500 mb-0.5">
                      <span className="font-semibold">{chat.sender === 'user' ? 'COMMANDER' : 'J.A.R.V.I.S.'}</span>
                      <span>•</span>
                      <span>{chat.timestamp}</span>
                    </div>

                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed tracking-wide ${
                      chat.sender === 'user' 
                        ? 'bg-gold/10 border border-gold/30 text-gold rounded-tr-none' 
                        : 'bg-blue/5 border border-blue/20 text-blue rounded-tl-none'
                    }`}>
                      {chat.text}

                      {/* Render Inline Diagram if present */}
                      {chat.diagramSvg && (
                        <div dangerouslySetInnerHTML={{ __html: chat.diagramSvg }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* CHIPS SUGGESTIONS GRID */}
              <div className="flex gap-1.5 overflow-x-auto mb-3 pb-1 border-t border-white/5 pt-2 whitespace-nowrap scrollbar-none">
                <button 
                  onClick={() => handleChatSubmit('Create a crystal planet')} 
                  className="px-2.5 py-1 text-[8px] font-mono bg-white/4 border border-white/5 hover:border-gold hover:text-gold text-slate-300 rounded transitions-all cursor-none"
                >
                  Create crystalline planet
                </button>
                <button 
                  onClick={() => handleChatSubmit('Add a dangerous black hole anchor')} 
                  className="px-2.5 py-1 text-[8px] font-mono bg-white/4 border border-white/5 hover:border-gold hover:text-gold text-slate-300 rounded transitions-all cursor-none"
                >
                  Add a black hole
                </button>
                <button 
                  onClick={() => handleChatSubmit('Create a bioluminous gaseous world')} 
                  className="px-2.5 py-1 text-[8px] font-mono bg-white/4 border border-white/5 hover:border-gold hover:text-gold text-slate-300 rounded transitions-all cursor-none"
                >
                  Make alien moon
                </button>
              </div>

              {/* INPUT BOX */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleChatSubmit(chatInput); }}
                className="flex gap-2 border-t border-white/5 pt-3"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="State building directives to JARVIS..."
                  className="flex-grow text-[11px] font-sans p-2.5 bg-slate-950/80 rounded-xl border border-white/5 text-cream placeholder-slate-600 focus:outline-none focus:border-blue/50 focus:ring-1 focus:ring-blue/30 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-blue/10 hover:bg-blue/20 border border-blue/30 rounded-xl text-blue hover:text-white transition-all cursor-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>

            {/* RIGHT: LIVE 3D PREVIEW CANVAS */}
            <div className="flex-grow h-full glass-panel-glow rounded-3xl overflow-hidden relative border-blue/15 bg-slate-950/20">
              
              {/* WebGL Scene */}
              <canvas
                ref={previewCanvasRef}
                className="w-full h-full object-cover cursor-none"
              />

              {/* HUD labels floating over viewport */}
              <div className="absolute top-4 left-4 pointer-events-none p-3 bg-black/60 border border-white/5 rounded-xl z-20">
                <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">REAL-TIME GRAPHICS ENGINE</div>
                <h4 className="font-display font-medium text-[11px] tracking-wide text-white uppercase mt-0.5">3D SYSTEM ACTIVE PREVIEW</h4>
                <div className="text-[9px] font-mono text-gold mt-1">ORBITAL ENTITIES: 0{userSystem.length} Bodies</div>
              </div>

              <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                {/* Trash clear system */}
                <button
                  onClick={() => setUserSystem([{ id: 'sun', name: 'Yellow Star', type: 'Stellar', color: '#ffa500', size: 3.5, speed: 0.001, distance: 0 }])}
                  className="px-3.5 py-2 whitespace-nowrap bg-red/10 hover:bg-red/20 border border-red/40 text-[9px] font-display font-bold uppercase text-red tracking-wider rounded-xl cursor-none transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> RE-INITIALIZE CORE
                </button>

                <button
                  onClick={handleExportSystem}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue/25 to-blue/45 border border-blue/40 text-[9px] font-display font-bold uppercase text-white tracking-wider rounded-xl cursor-none transition-all flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 animate-pulse" /> SAVE MY UNIVERSE
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 2: MY UNIVERSE BUILDER (ORBIT SLOTS ASSIGNER)
            =================================================================== */}
        {activeTab === 'builder' && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            
            {/* STELLAR SLOTS AND SYNTHESIZERS MANAGER BAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 bg-[#020512]/90 p-4 border border-gold/15 rounded-2xl gap-4 mb-4 select-none">
              <div className="flex flex-col text-left justify-center">
                <div className="text-[7.5px] font-mono text-gold uppercase tracking-widest font-bold">ACTIVE REGULATED UNIVERSES FIELD</div>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <select
                    value={activeUniverseId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      setActiveUniverseId(selId);
                      playSynthBeep(440, 0.12, 'sine', 0.08);
                      const targetSlot = universeSlots.find(s => s.id === selId);
                      if (targetSlot) {
                        setOrbits(targetSlot.orbits);
                        setUserSystem(targetSlot.userSystem);
                      }
                    }}
                    className="bg-slate-950 border border-white/10 rounded-xl text-xs p-2 text-gold focus:outline-none focus:border-gold/50 cursor-none font-bold"
                  >
                    {universeSlots.map(slot => (
                      <option key={slot.id} value={slot.id}>
                        🌌 {slot.name} ({slot.type})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-500 font-mono">
                    [{orbits.filter(o => o !== null).length} / 6 Shells Engaged]
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 items-center md:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    playSynthBeep(520, 0.1, 'sine', 0.08);
                    const selType = prompt("Select new Space-Theme blueprint and press OK:\n1. Whole Universe Grid\n2. Galaxy Wave\n3. Concentric Solar System\n4. Singularity Black Hole Cluster\n5. Exotic Planets Matrix\n\nEnter code (1-5):", "3");
                    if (selType) {
                      let typeStr = "Solar System";
                      if (selType === "1") typeStr = "Whole Universe";
                      else if (selType === "2") typeStr = "Galaxy";
                      else if (selType === "3") typeStr = "Solar System";
                      else if (selType === "4") typeStr = "Black Hole Cluster";
                      else if (selType === "5") typeStr = "Planet Matrix";

                      const newId = `slot-${Date.now()}`;
                      const nameStr = `${typeStr} Cluster-${universeSlots.length + 1}`;
                      const newSlot = {
                        id: newId,
                        name: nameStr,
                        type: typeStr,
                        orbits: [null, null, null, null, null, null],
                        userSystem: [{ id: 'sun', name: 'Yellow Star', type: 'Stellar', color: '#ffa500', size: 3.5, speed: 0.001, distance: 0 }]
                      };

                      const updatedList = [...universeSlots, newSlot];
                      setUniverseSlots(updatedList);
                      setActiveUniverseId(newId);
                      setOrbits(newSlot.orbits);
                      setUserSystem(newSlot.userSystem);

                      saveStateToStorage(updatedList, newId);
                      playSuccessChime();
                    }
                  }}
                  className="px-3 py-2 hover:bg-gold/20 border border-gold/40 text-gold text-[8.5px] font-mono rounded-xl font-bold uppercase cursor-none transition-all flex items-center gap-1.5"
                >
                  🚀 CREATE NEW SOLAR-SYSTEM
                </button>

                <button
                  onClick={() => {
                    playSynthBeep(560, 0.1, 'sine', 0.08);
                    setCreationMethod(null);
                    setJarvisStep(0);
                    setJarvisObjectType('Planet');
                    setJarvisAnswers({ type: '', elements: '' });
                    setThinkingSimulationActive(false);
                    setThinkingOutput('');
                    setManualName('');
                    setManualAsteroidCount(0);
                    setManualPlanetSize(1.2);
                    setManualMass(35);
                    setManualGravity(9.8);
                    setShowCreationModal(true);
                  }}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue shadow-[0_0_15px_rgba(74,184,255,0.35)] text-white text-[8.5px] font-mono rounded-xl font-bold uppercase cursor-none transition-all flex items-center gap-1"
                >
                  ✨ FORGE CELESTIAL
                </button>
              </div>
            </div>

            <div className="w-full flex-grow flex flex-col md:flex-row gap-5 overflow-hidden">
              
              {/* LEFT: 6 ORBIT RINGS MAP */}
              <div className="w-full md:w-[40%] h-full glass-panel-glow rounded-2xl flex flex-col justify-between border-gold/15 p-4 bg-slate-950/70 relative">
              <div>
                <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase mb-1">SYSTEM COGNIZANCE</div>
                <h3 className="font-display font-black text-xs text-white uppercase tracking-wider border-b border-white/5 pb-2">
                  CONCENTRIC ORBIT MATRIX MAP
                </h3>

                {collapseStatusMessage && (
                  <div className="mt-2 text-[9px] font-mono p-2.5 bg-red/10 border border-red/40 rounded-xl text-slate-350 relative select-none animate-pulse">
                    <p className="pr-4">{collapseStatusMessage}</p>
                    <button
                      type="button"
                      onClick={() => setCollapseStatusMessage(null)}
                      className="absolute top-1.5 right-2 text-[11px] text-slate-400 hover:text-white cursor-none font-bold"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Redesigned Concentric Orbit Matrix Map (Interactive orbits) */}
                <div className="relative w-full aspect-square max-w-[340px] mx-auto mt-4 mb-4 flex justify-center items-center bg-[#030614]/40 border border-white/5 rounded-full p-2 shadow-inner">
                  
                  {/* Central glowing yellow/orange sun star */}
                  <div className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 flex justify-center items-center text-[8.5px] text-white font-black tracking-wider uppercase filter drop-shadow-[0_0_20px_rgba(232,184,75,0.85)] border border-gold/60 animate-pulse z-10 select-none">
                    SOLAR
                  </div>

                  {orbits.map((val, idx) => {
                    const dimension = 68 + idx * 44; 
                    const assignedPlanet = allPlanets.find(p => p.id === val);
                    const isHovered = hoveredOrbitIndex === idx;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredOrbitIndex(idx)}
                        onMouseLeave={() => setHoveredOrbitIndex(null)}
                        onClick={() => {
                          if (grabbedPlanet) {
                            // Drop held planet into this orbit!
                            const newOrbits = [...orbits];
                            newOrbits[idx] = grabbedPlanet.id;
                            setOrbits(newOrbits);
                            
                            // Auto slot logic: Search for next unoccupied orbit slot
                            let nextSelectIdx: number | null = null;
                            for (let i = idx - 1; i >= 0; i--) {
                              if (newOrbits[i] === null) {
                                nextSelectIdx = i;
                                break;
                              }
                            }
                            if (nextSelectIdx === null) {
                              for (let i = idx + 1; i < 6; i++) {
                                if (newOrbits[i] === null) {
                                  nextSelectIdx = i;
                                  break;
                                }
                              }
                            }
                            setActiveOrbitSelect(nextSelectIdx);
                            setGrabbedPlanet(null);
                            playSuccessChime();
                          } else {
                            // Standard active orbit lock toggle
                            setActiveOrbitSelect(activeOrbitSelect === idx ? null : idx);
                            playSynthBeep(440 + idx * 50, 0.08, 'sine', 0.05);
                          }
                        }}
                        style={{ width: `${dimension}px`, height: `${dimension}px`, zIndex: 50 - idx }}
                        className={`absolute rounded-full flex justify-center items-center cursor-none transition-all duration-300 pointer-events-auto ${
                          isHovered 
                            ? 'border-[#30e8c0] border-[2.8px] bg-teal/5 shadow-[0_0_25px_rgba(48,232,192,0.45)] scale-102 z-20' 
                            : activeOrbitSelect === idx
                              ? 'border-gold border-[2.5px] bg-gold/5 border-dashed scale-102 z-10'
                              : grabbedPlanet
                                ? 'border-dashed border-gold/45 hover:border-gold border-[1.8px] animate-pulse'
                                : 'border-white/10 hover:border-gold/45 border-[1.5px]'
                        }`}
                      >
                        {/* Orbit tag sleeve label */}
                        <div 
                          className="absolute pointer-events-none text-[6.5px] font-mono tracking-wider text-slate-500 font-bold select-none"
                          style={{ top: '-11px' }}
                        >
                          ORBIT 0{idx + 1}
                        </div>

                        {/* If planet is assigned, spin the revolving planet around the orbit center */}
                        {assignedPlanet ? (
                          <div 
                            className="absolute inset-0 rounded-full select-none pointer-events-none"
                            style={{
                              animation: `spin ${5 + idx * 4}s linear infinite`
                            }}
                          >
                            <div 
                              title={assignedPlanet.name}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDetailPlanet(assignedPlanet);
                                playScannerSweep();
                              }}
                              style={{ 
                                backgroundColor: assignedPlanet.color,
                                boxShadow: `0 0 15px ${assignedPlanet.color}`,
                                top: 0,
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                              }}
                              className="absolute w-[18px] h-[18px] rounded-full filter glow cursor-none pointer-events-auto group z-30"
                              onMouseEnter={(e) => {
                                e.stopPropagation();
                                setHoveredOrbitIndex(idx);
                              }}
                              onMouseLeave={() => setHoveredOrbitIndex(null)}
                            >
                              {/* Overlay removal floating cross */}
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  handleClearOrbit(idx); 
                                  playSynthBeep(330, 0.08, 'sine', 0.05);
                                }}
                                className="absolute -top-2.5 -right-2.5 bg-red border border-red/30 w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity button-normal pointer-events-auto cursor-none shadow-md"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Hover slot placement dots hint
                          isHovered && grabbedPlanet && (
                            <div 
                              style={{ backgroundColor: grabbedPlanet.color, top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}
                              className="absolute w-[14px] h-[14px] rounded-full border border-dashed border-white opacity-60 animate-bounce pointer-events-none"
                            />
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Select popup list overlay or prompt helper bottom */}
              <div className="mt-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                {activeOrbitSelect !== null ? (
                  <p className="text-[10px] text-gold font-mono tracking-wider uppercase animate-pulse">
                    ⚡ ACTIVE SELECTION: PICK A PLANET CARD FROM THE COGNITIVE LIBRARIES ROUTER →
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    How to configure: Click on any orbital line above to prime an input coordinate socket, then pick any celestial profile cards from the selector index.
                  </p>
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: 30+ default planet libraries grid & aggregate stats */}
            <div className="flex-grow h-full flex flex-col gap-4 overflow-hidden">
              
              {/* SYSTEM AGGREGATE STATS PANEL (Horizontal bar) */}
              <div className="grid grid-cols-4 gap-3 bg-slate-950/60 border border-white/5 p-3 rounded-xl select-none text-center">
                <div>
                  <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">TOTAL PLANETS</div>
                  <div className="text-sm font-display font-black text-white mt-0.5">0{stats.counts}</div>
                </div>
                <div>
                  <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">HABITABLE SHELLS</div>
                  <div className="text-sm font-display font-black text-teal mt-0.5">0{stats.habitable}</div>
                </div>
                <div>
                  <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">ORGANIC MULATION</div>
                  <div className="text-sm font-display font-black text-gold mt-0.5">{stats.maxPopulation} Billion</div>
                </div>
                <div>
                  <div className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase">WARP ANOMALIES</div>
                  <div className="text-sm font-display font-black text-purple mt-0.5">0{stats.anomalies}</div>
                </div>
              </div>

              {/* CARD CLASSIFICATION MATRIX GRID */}
              <div 
                id="builder-scroll-container"
                className="flex-grow overflow-y-auto grid grid-cols-1 sm:grid-cols-3 gap-3.5 pr-2 scrollbar-none"
                style={{ scrollBehavior: 'smooth' }}
              >
                {allPlanets.map((planet) => {
                  const isGrabbedThis = grabbedPlanet?.id === planet.id;
                  const isCustom = !PLANET_LIBRARY.some(p => p.id === planet.id);

                  return (
                    <div
                      key={planet.id}
                      onMouseEnter={() => setHoveredPlanetCardId(planet.id)}
                      onMouseLeave={() => setHoveredPlanetCardId(null)}
                      onClick={() => handlePlanetCardClick(planet)}
                      className={`glass-panel p-3 rounded-xl flex flex-col justify-between h-[115px] cursor-none transition-all duration-300 relative group overflow-hidden border ${
                        isGrabbedThis 
                          ? 'border-dashed border-gold bg-gold/5 opacity-40 scale-[0.98]' 
                          : activeOrbitSelect !== null 
                            ? 'hover:border-gold/80 border-gold/20 hover:glass-panel-glow' 
                            : 'border-white/5 hover:border-gold/55 hover:glass-panel-glow'
                      }`}
                    >
                      {/* Interactive glowing feedback indicators */}
                      {isGrabbedThis && (
                        <div className="absolute inset-0 bg-[#030614]/70 flex flex-col items-center justify-center text-center z-10 pointer-events-none p-1 border border-gold/30 rounded-xl">
                          <span className="text-[9px] font-mono text-gold font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">✊ GRABBED IN HAND</span>
                          <span className="text-[7.2px] text-slate-400 mt-1 uppercase font-mono tracking-wide leading-tight">OPEN PALM OVER ORBIT LINE TO DOCK</span>
                        </div>
                      )}



                      {/* Tiny glowing orb preview inside card */}
                      <div className="flex justify-between items-start mb-1.5 select-none opacity-90">
                        <div className="flex items-center gap-1.5">
                          <span 
                            style={{ backgroundColor: planet.color, boxShadow: `0 0 10px ${planet.color}` }}
                            className="w-3.5 h-3.5 rounded-full inline-block"
                          ></span>
                          <h4 className="font-display font-bold text-[10px] text-cream tracking-wide group-hover:text-gold uppercase leading-tight flex items-center gap-1.5">
                            {planet.name}
                            {isCustom && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPlanet(planet);
                                  setEditingPlanetName(planet.name);
                                  playSynthBeep(485, 0.08, 'sine', 0.05);
                                }}
                                className="p-0.5 hover:bg-gold/20 rounded border border-transparent hover:border-gold/30 transition-all text-slate-400 hover:text-gold cursor-none"
                                title="Rename Planet"
                              >
                                <Pencil className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </h4>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDetailPlanet(planet);
                              playScannerSweep();
                            }}
                            className="p-1 hover:bg-cyan/20 rounded border border-transparent hover:border-cyan/30 transition-all text-cyan cursor-none"
                            title="View Physical Core Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          
                          <span className={`text-[7px] font-mono tracking-wider px-1.5 py-0.5 rounded leading-none ${
                            planet.type === 'Standard' ? 'bg-blue/10 text-blue' :
                            planet.type === 'Exotic' ? 'bg-gold/10 text-gold' :
                            planet.type === 'Alien' ? 'bg-teal/10 text-teal' : 'bg-purple/10 text-purple'
                          }`}>
                            {planet.type}
                          </span>
                        </div>
                      </div>

                      <p className="text-[8.5px] text-slate-400 font-sans leading-relaxed tracking-wide">
                        {planet.desc}
                      </p>

                      {activeOrbitSelect !== null ? (
                        <button className="w-full text-center py-1 mt-1 font-mono text-[7.5px] bg-gold/15 border border-gold/30 text-gold rounded leading-none font-bold uppercase transition-transform group-hover:scale-102">
                          + SLOT INTO ORBIT 0{activeOrbitSelect + 1}
                        </button>
                      ) : (
                        <div className="w-full text-left py-0.5 mt-1 font-mono text-[6.5px] text-slate-500 font-bold uppercase leading-none group-hover:text-gold transition-colors">
                          ✊ HOLD FIST (OR CLICK) TO GRAB
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
          </div>
        )}

        {/* ===================================================================
            TAB EXTRA: SPACETIME CURVATURE & GATEWAY INTEGRATORS
            =================================================================== */}
        {activeTab === 'spacetime' && (
          <div className="w-full h-full flex flex-col md:flex-row gap-5 overflow-hidden">
            
            {/* LEFT: SPACE-TIME FABRIC INTERACTIVE CURVATURE MESH GRAPH */}
            <div className="w-full md:w-[50%] h-full glass-panel-glow rounded-2xl flex flex-col justify-between border-cyan/15 p-4 bg-slate-950/75 relative select-none">
              <div className="flex flex-col gap-3 h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-cyan rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">SPACE-TIME RELATIVITY MESH</span>
                    </div>
                    <span className="text-[8px] font-mono text-cyan-300">TENSOR DYNAMICS: RUNNING</span>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                    Select a stellar body registry, then drag weight and gravity fields. Spacetime fabric sags deep dynamically. Drag both past 95% to rip the envelope.
                  </p>
                </div>

                {/* INTERACTIVE GRAPH CANVAS WRAPPER */}
                <div className="relative flex-grow flex items-center justify-center bg-[#010410]/95 border border-white/5 rounded-2xl overflow-hidden py-3 my-2 shadow-inner">
                  
                  {isSpacetimeTorn ? (
                    /* TOURN UP GLITCH ALARM PANEL */
                    <div className="absolute inset-0 bg-red-950/40 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 z-40 animate-pulse border border-red/40 rounded-2xl">
                      <div className="text-red font-black text-xs font-mono tracking-widest uppercase animate-bounce flex items-center gap-1">
                        ⚠️ CRITICAL GRAVITATIONAL APEX REACHED
                      </div>
                      
                      {/* Spinning wormhole portal graphic */}
                      <div className="relative w-28 h-28 my-3 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-purple animate-spin" style={{ animationDuration: '3s' }} />
                        <div className="absolute inset-3 rounded-full border-2 border-dashed border-cyan animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                        <div className="w-12 h-12 rounded-full bg-slate-950 shadow-[0_0_20px_rgba(119,51,255,0.85)] border-2 border-indigo-500 animate-pulse flex items-center justify-center text-[7px] text-white font-bold uppercase tracking-wider font-mono">
                          PORTAL
                        </div>
                      </div>

                      <h4 className="text-white font-display font-black text-[13px] uppercase tracking-wider mt-1">SPACE-TIME FABRIC TEARS UP!</h4>
                      <p className="text-[9.5px] font-mono text-slate-350 leading-normal max-w-xs mt-1">
                        An automatic Einstein-Rosen wormhole throat bridge has ruptured through the continuum, safety-routing gravity tides!
                      </p>

                      <button
                        onClick={() => {
                          playSynthBeep(440, 0.1, 'sine', 0.08);
                          setIsSpacetimeTorn(false);
                          setCurvatureMass(60);
                          setCurvatureGravity(60);
                        }}
                        className="mt-4 px-4 py-1.5 bg-red border border-red-500 hover:bg-red-600 text-white font-mono text-[9px] font-bold uppercase rounded-xl cursor-none"
                      >
                        ⚡ RE-STABILIZE FABRIC TENSIONS
                      </button>
                    </div>
                  ) : (
                    /* DEFORMABLE SVG STRUCTURAL FABRIC */
                    <svg viewBox="0 0 300 200" className="w-full h-full max-h-[220px]">
                      <style>
                        {`
                          .grid-line { stroke: rgba(48,232,192,0.15); stroke-width: 0.6; fill: none; }
                          .accent-line { stroke: rgba(48,232,192,0.3); stroke-width: 0.8; fill: none; }
                          .planet-center { fill: #30e8c0; filter: drop-shadow(0 0 10px #30e8c0); }
                        `}
                      </style>

                      {/* We deform grid coordinates dynamically */}
                      {Array.from({ length: 15 }).map((_, i) => {
                        // Horizontal Gridlines sagging towards center (150, 100)
                        const y = 15 + i * 12.5;
                        const sagValue = (curvatureMass * curvatureGravity) / 38;
                        const dPath = `M 10 ${y} Q 150 ${y + (Math.abs(y - 100) < 50 ? sagValue * (1 - Math.abs(y - 100)/50) : 0)} 290 ${y}`;
                        return <path key={`h-${i}`} d={dPath} className={i === 7 ? "accent-line" : "grid-line"} />;
                      })}

                      {Array.from({ length: 21 }).map((_, i) => {
                        // Vertical Gridlines sagging towards center (150, 100)
                        const x = 15 + i * 13.5;
                        const sagValue = (curvatureMass * curvatureGravity) / 38;
                        const dPath = `M ${x} 10 Q ${x + (Math.abs(x - 150) < 60 ? (150 - x) * 0.1 * (sagValue/40) : 0)} 100 Q ${x} 190`;
                        return <path key={`v-${i}`} d={dPath} className={i === 10 ? "accent-line" : "grid-line"} />;
                      })}

                      {/* Display sagging mesh vector node circles */}
                      <circle cx="150" cy={100 + (curvatureMass * curvatureGravity) / 38} r={3.2 + (curvatureMass / 15)} className="planet-center animate-pulse" />
                      
                      {/* Sagging grid vector value indicator */}
                      <text x="15" y="185" className="fill-slate-500 font-mono text-[6.5px]">DILATION TENSION: {((curvatureMass * curvatureGravity) / 10).toFixed(1)} N/m</text>
                    </svg>
                  )}

                </div>

                {/* CONTROLS SLIDERS SETTINGS */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">TARGET PROFILE CALIBRATOR:</div>
                    <select
                      value={curvaturePlanetId}
                      onChange={(e) => {
                        const targetId = e.target.value;
                        setCurvaturePlanetId(targetId);
                        playSynthBeep(490, 0.08, 'sine', 0.05);
                        // Fetch properties
                        const selectedBody = allPlanets.find(p => p.id === targetId);
                        if (selectedBody) {
                          setCurvatureMass(targetId === 'sun' ? 90 : Math.floor(Math.random() * 50 + 20));
                          setCurvatureGravity(targetId === 'sun' ? 88 : Math.floor(Math.random() * 40 + 15));
                        }
                      }}
                      className="bg-slate-950 border border-white/10 rounded-lg text-[10px] p-1.5 focus:outline-none text-cyan font-bold cursor-none"
                    >
                      <option value="sun">☀️ Yellow Star (Solar Core)</option>
                      {allPlanets.slice(0, 15).map(planet => (
                        <option key={planet.id} value={planet.id}>🪐 {planet.name} ({planet.type})</option>
                      ))}
                    </select>
                  </div>

                  {/* Mass Weight slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8.5px] font-mono">
                      <span className="text-slate-400">PHYSICAL MASS WEIGHT (W)</span>
                      <span className="text-cyan font-bold">{curvatureMass}% [M0]</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={curvatureMass}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCurvatureMass(val);
                        playSynthBeep(300 + val * 2, 0.03, 'sine', 0.04);
                        if (val >= 96 && curvatureGravity >= 96) {
                          setIsSpacetimeTorn(true);
                          playErrorBuzz();
                          
                          // Auto create default void and bridge if they only have 1 slot
                          if (universeSlots.length === 1) {
                            const defaultId = `slot-default-void`;
                            const defaultVoidSlot = {
                              id: defaultId,
                              name: 'Primordial Void (Default Backup)',
                              type: 'Exotic Space',
                              orbits: [null, null, null, null, null, null],
                              userSystem: [{ id: 'whitedwarf', name: 'White Dwarf', type: 'Stellar', color: '#ffffdd', size: 2.2, speed: 0.002, distance: 0 }]
                            };
                            const updated = [...universeSlots, defaultVoidSlot];
                            setUniverseSlots(updated);
                            
                            const newBridge = {
                              id: `bridge-${Date.now()}`,
                              slotA: activeUniverseId,
                              slotB: defaultId,
                              type: 'Gravitational Rip Wormhole'
                            };
                            const updatedBridges = [...universeBridges, newBridge];
                            setUniverseBridges(updatedBridges);
                            saveStateToStorage(updated, activeUniverseId, updatedBridges);
                          }
                        }
                      }}
                      className="accent-cyan bg-slate-800 h-1 rounded cursor-none"
                    />
                  </div>

                  {/* Gravity force slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8.5px] font-mono">
                      <span className="text-slate-400">GRAVITY PULL INTENSIFICATION (g)</span>
                      <span className="text-cyan font-bold">{curvatureGravity}% [m/s²]</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={curvatureGravity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setCurvatureGravity(val);
                        playSynthBeep(260 + val * 2.5, 0.03, 'sine', 0.04);
                        if (val >= 96 && curvatureMass >= 96) {
                          setIsSpacetimeTorn(true);
                          playErrorBuzz();

                          // Auto create backup and bridge
                          if (universeSlots.length === 1) {
                            const defaultId = `slot-default-void`;
                            const defaultVoidSlot = {
                              id: defaultId,
                              name: 'Primordial Void (Default Backup)',
                              type: 'Exotic Space',
                              orbits: [null, null, null, null, null, null],
                              userSystem: [{ id: 'whitedwarf', name: 'White Dwarf', type: 'Stellar', color: '#ffffdd', size: 2.2, speed: 0.002, distance: 0 }]
                            };
                            const updated = [...universeSlots, defaultVoidSlot];
                            setUniverseSlots(updated);
                            
                            const newBridge = {
                              id: `bridge-${Date.now()}`,
                              slotA: activeUniverseId,
                              slotB: defaultId,
                              type: 'Gravitational Rip Wormhole'
                            };
                            const updatedBridges = [...universeBridges, newBridge];
                            setUniverseBridges(updatedBridges);
                            saveStateToStorage(updated, activeUniverseId, updatedBridges);
                          }
                        }
                      }}
                      className="accent-cyan bg-slate-800 h-1 rounded cursor-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: EINSTEIN-ROSEN GATEWAY HUBS & CONNECTORS */}
            <div className="flex-grow h-full flex flex-col gap-4 overflow-hidden select-none">
              
              {/* CONNECT MULTIPLE UNIVERSES MODULE PANEL */}
              <div className="glass-panel p-4 rounded-2xl border border-cyan/20 flex flex-col justify-between bg-[#04081c]/70 relative">
                <div>
                  <span className="text-[7.5px] font-mono text-cyan uppercase tracking-widest font-black block mb-1">EINSTEIN-ROSEN CONNECTORS MATRIX</span>
                  <h3 className="font-display font-black text-[#f0ead8] text-xs uppercase tracking-wider mb-2">BRIDGE ACTIVE UNIVERSES</h3>
                  <p className="text-[10px] text-slate-400 leading-normal mb-4">
                    Short-loop two distinct solar system universes together via dimensional hyper-tubes.
                  </p>
                </div>

                <div className="flex flex-col gap-3 bg-[#010410]/60 p-3 rounded-xl border border-white/5">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="text-left">
                      <span className="text-[7.2px] font-mono text-slate-500 uppercase">Blueprints A (Anchor)</span>
                      <div className="text-xs font-bold text-cream mt-1 uppercase">🌌 {universeSlots[0]?.name || 'Anchor'}</div>
                    </div>

                    <div className="text-left border-l border-white/5 pl-3">
                      <span className="text-[7.2px] font-mono text-slate-500 uppercase">Blueprints B (Coupler Target)</span>
                      {universeSlots.length > 1 ? (
                        <div className="text-xs font-bold text-cyan mt-1 uppercase">🌌 {universeSlots[universeSlots.length - 1]?.name}</div>
                      ) : (
                        <div className="text-[9.5px] text-amber italic mt-1 font-mono">Requires secondary universe, using default backup!</div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (bridgeAnimationActive) return;
                      playScannerSweep();
                      setBridgeAnimationActive(true);
                      setBridgeProgress(10);
                      
                      let progress = 10;
                      const iv = setInterval(() => {
                        progress += 15;
                        if (progress >= 100) {
                          progress = 100;
                          setBridgeProgress(100);
                          clearInterval(iv);
                          
                          // Save active connection bridge
                          const targetSlotB = universeSlots[1] ? universeSlots[1].id : 'slot-default-void';
                          
                          // Create default slot if only 1 exists
                          let updatedSlots = [...universeSlots];
                          if (universeSlots.length === 1) {
                            const defaultId = 'slot-default-void';
                            updatedSlots = [...universeSlots, {
                              id: defaultId,
                              name: 'Primordial Void (Default Backup)',
                              type: 'Exotic Space',
                              orbits: [null, null, null, null, null, null],
                              userSystem: [{ id: 'whitedwarf', name: 'White Dwarf', type: 'Stellar', color: '#ffffdd', size: 2.2, speed: 0.002, distance: 0 }]
                            }];
                            setUniverseSlots(updatedSlots);
                          }

                          const newBridge = {
                            id: `bridge-${Date.now()}`,
                            slotA: activeUniverseId,
                            slotB: targetSlotB,
                            type: 'Einstein-Rosen Wormhole Coupler'
                          };

                          const updatedBridges = [...universeBridges, newBridge];
                          setUniverseBridges(updatedBridges);
                          setBridgeAnimationActive(false);
                          playSuccessChime();
                          saveStateToStorage(updatedSlots, activeUniverseId, updatedBridges);
                        } else {
                          setBridgeProgress(progress);
                          playSynthBeep(350 + progress * 4, 0.05, 'sine', 0.06);
                        }
                      }, 180);

                    }}
                    className="w-full text-center py-2 bg-cyan/15 border border-cyan/40 text-cyan text-[10px] font-mono tracking-widest rounded-xl font-bold uppercase hover:bg-cyan/25 cursor-none transition-all flex items-center justify-center gap-1.5"
                  >
                    🌀 CONSTRUCT COUPLING GATEWAY BRIDGE
                  </button>

                  {bridgeAnimationActive && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div style={{ width: `${bridgeProgress}%` }} className="h-full bg-cyan transition-all" />
                      </div>
                      <span className="text-[7px] text-cyan font-mono block text-right animate-pulse">WARP SPEED ENERGY COMPILATION... {bridgeProgress}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* LIST ACTIVE CONNECTIONS & DESTROY ACTION CONTROL */}
              <div className="flex-grow overflow-y-auto glass-panel p-4 rounded-2xl border border-white/5 flex flex-col justify-between bg-slate-950/50 pr-2 relative scrollbar-none">
                <div>
                  <span className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest font-black block mb-1">INTERSTELLAR HIGHWAYS REGISTER</span>
                  <h3 className="font-display font-black text-white text-xs uppercase tracking-wide mb-3">ACTIVE HIGHWAY BRIDGES</h3>
                  
                  {universeBridges.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/5 rounded-xl text-slate-500 text-[10.5px] italic">
                      No active portals linking universes. Tear spacetime fabric or click Bridge to open connections.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {universeBridges.map(bridge => {
                        const sA = universeSlots.find(s => s.id === bridge.slotA)?.name || 'Custom Nexus';
                        const sB = universeSlots.find(s => s.id === bridge.slotB)?.name || 'Primordial Void';
                        return (
                          <div key={bridge.id} className="p-3 bg-slate-950/80 border border-cyan/10 rounded-xl flex items-center justify-between text-[9px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="text-cream uppercase font-bold">{sA}</span>
                              <span className="text-cyan">⇄ [🧬 {bridge.type.slice(0,10)}] ⇄</span>
                              <span className="text-cyan uppercase font-bold">{sB}</span>
                            </div>
                            <button
                              onClick={() => {
                                playSynthBeep(300, 0.1, 'sine', 0.08);
                                const leftBridges = universeBridges.filter(b => b.id !== bridge.id);
                                setUniverseBridges(leftBridges);
                                saveStateToStorage(undefined, undefined, leftBridges);
                              }}
                              className="text-red hover:text-red-400 cursor-none underline"
                            >
                              DISENGAGE
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 mt-6">
                  <span className="text-[7px] text-red uppercase tracking-widest font-mono font-bold block mb-1">⚠️ EXTREME HAZARD OPERATIONS MATRIX</span>
                  <div className="flex justify-between items-center gap-3">
                    <p className="text-[9.5px] font-sans text-slate-500 leading-normal max-w-sm">
                      Destroy a sector to trigger star collapse and clear all configured bodies. Highly volatile.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm("CRITICAL WARNING: Collapse active Universe System? This is irreversible.")) {
                          playErrorBuzz();
                          
                          // Trigger explosion visual and wipe orbits
                          setCollapseStatusMessage(`💥 UNIVERSE COLLAPSE TERMINATE INITIATED: Spacetime collapsed!`);
                          setOrbits([null, null, null, null, null, null]);
                          setUserSystem([{ id: 'sun', name: 'Yellow Star', type: 'Stellar', color: '#ffa500', size: 3.5, speed: 0.001, distance: 0 }]);
                          
                          // Restore active universeSlot as well
                          const updatedSlots = universeSlots.map(slot => {
                            if (slot.id === activeUniverseId) {
                              return {
                                ...slot,
                                orbits: [null, null, null, null, null, null],
                                userSystem: [{ id: 'sun', name: 'Yellow Star', type: 'Stellar', color: '#ffa500', size: 3.5, speed: 0.001, distance: 0 }]
                              };
                            }
                            return slot;
                          });
                          setUniverseSlots(updatedSlots);
                          saveStateToStorage(updatedSlots);

                          setTimeout(() => {
                            setCollapseStatusMessage(null);
                          }, 5000);
                        }
                      }}
                      className="px-4 py-2 bg-red/10 border border-red/40 text-red font-mono font-bold text-[9px] rounded-xl hover:bg-red/20 cursor-none transition-all whitespace-nowrap"
                    >
                      💥 DESTROY ACTIVE UNIVERSE
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ===================================================================
            TAB 3: MASTER SPACE KNOWLEDGE QUEST SYSTEM (QUIZ GAME)
            =================================================================== */}
        {activeTab === 'quiz' && (
          <div className="w-full h-full flex flex-col gap-5 overflow-hidden justify-center items-center">
            <KnowledgeQuest onClose={() => setActiveTab('builder')} />
          </div>
        )}

      </div>

      {/* GUEST SIGN-UP WARNING MODAL AT THE CENTER OF SCREEN */}
      <AnimatePresence>
        {showGuestWarning && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-[2000] p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-[#04081e] border border-gold/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(232,184,75,0.2)] flex flex-col items-center gap-6 pointer-events-auto"
            >
              <div className="w-16 h-16 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                <Sparkles className="w-8 h-8 text-gold animate-pulse" />
              </div>
              
              <div>
                <span className="text-[10px] uppercase font-mono tracking-[4px] text-gold bg-gold/5 border border-gold/20 px-3 py-1 rounded-full">
                  RESTRICTED PROTOCOL
                </span>
                <h3 className="text-base font-display font-black tracking-widest text-white uppercase mt-4">
                  FIRST SIGN UP OR SIGN IN
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 font-sans leading-relaxed">
                  Creating custom planets or fabricating orbital configurations requires J.A.R.V.I.S credentials. Please register or sign in to authorize your session.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={() => {
                    setShowGuestWarning(false);
                    onTriggerSignUp();
                  }}
                  className="w-full py-3 text-[10px] font-display font-black tracking-widest bg-gold hover:bg-yellow-500 text-black rounded-xl transition-all uppercase flex items-center justify-center gap-2 cursor-none"
                >
                  <User className="w-4 h-4" /> SIGN UP OR SIGN IN
                </button>
                <button
                  onClick={() => setShowGuestWarning(false)}
                  className="w-full py-2.5 text-[10px] font-display font-semibold tracking-widest border border-white/10 hover:border-white/30 text-slate-400 hover:text-cream rounded-xl transition-all uppercase cursor-none"
                >
                  CONTINUE AS GUEST
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BLACK HOLE FORCE CALIBRATION MODAL */}
      <AnimatePresence>
        {showBlackHolePrompt && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-lg z-[2500] p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              className="w-full max-w-md bg-[#050616] border border-purple-500/50 rounded-2xl p-6 text-center shadow-[0_0_60px_rgba(119,51,255,0.25)] flex flex-col items-center gap-5 pointer-events-auto"
            >
              <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-purple-500 animate-pulse relative overflow-hidden shadow-[0_0_20px_rgba(119,51,255,0.7)]">
                <div className="absolute inset-2 rounded-full border border-dashed border-purple-400 rotate-180 animate-spin" />
                <span className="text-white text-[9px] font-black tracking-widest font-mono">SINGULARITY</span>
              </div>

              <div>
                <span className="text-[8px] uppercase font-mono tracking-[4px] text-purple-400 bg-purple-500/10 border border-purple-500/30 px-3 py-1 rounded-full">
                  CALIBRATION METRICS REQUIRED
                </span>
                <h3 className="text-[13px] font-display font-black tracking-widest text-[#eeeeee] uppercase mt-4">
                  BLACK HOLE GRAVITY CALIBRATION
                </h3>
                <p className="text-[9.5px] text-slate-350 mt-2 font-mono leading-relaxed max-w-sm">
                  Specify the gravitational singularity pull indices. Critical mass thresholds dictate system stabilization bounds:
                </p>
              </div>

              {/* Warnings details based on current force selection */}
              <div className="w-full bg-black/60 p-3.5 rounded-xl border border-white/5 text-left text-[9px] font-mono leading-relaxed space-y-2.5">
                <div className="flex items-start gap-1.5 ">
                  <span className="text-red font-black text-[11px] leading-none">⚠️</span>
                  <div>
                    <span className="text-red font-bold uppercase tracking-wider block">IF FORCE GREATER THAN 10:</span>
                    <span className="text-slate-450">All of your solar system will immediately completely COLLAPSE into the singularity core! Core failure occurs.</span>
                  </div>
                </div>
                <div className="flex items-start gap-1.5 pt-1.5 border-t border-white/5">
                  <span className="text-amber-500 font-black text-[11px] leading-none">⚠️</span>
                  <div>
                    <span className="text-amber-500 font-bold uppercase tracking-wider block">IF FORCE LESS THAN OR EQUAL TO 10:</span>
                    <span className="text-slate-450">System survives initial creation, but there will be high possibilities of orbital bodies getting distorted and collapsed over time.</span>
                  </div>
                </div>
              </div>

              {/* Numerical Selector Panel */}
              <div className="w-full flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center text-[9.5px] font-mono text-slate-400">
                  <span>GRAVITATIONAL INDEX:</span>
                  <span className={`font-black text-xs ${blackHoleGravityForce > 10 ? 'text-red animate-pulse font-bold' : 'text-purple-400'}`}>
                    {blackHoleGravityForce} g-force {blackHoleGravityForce > 10 ? '🔥 COLLAPSE INDUCER' : '⚖️ STABLE DRIFT'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={blackHoleGravityForce}
                  onChange={(e) => {
                    setBlackHoleGravityForce(parseInt(e.target.value, 10));
                    playSynthBeep(300 + parseInt(e.target.value, 10) * 15, 0.05, 'sine', 0.05);
                  }}
                  className="w-full accent-purple-500 bg-slate-900 cursor-pointer h-1.5 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[7px] font-mono text-slate-500">
                  <span>01 MIN PULL</span>
                  <span>10 LIMIT</span>
                  <span>20 CRITICAL MAX</span>
                </div>
              </div>

              {/* Action operations buttons */}
              <div className="flex gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowBlackHolePrompt(false);
                    playSynthBeep(300, 0.08, 'sine', 0.05);
                  }}
                  className="flex-1 py-2 text-[9px] font-mono font-bold tracking-wider border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-xl transition-all uppercase cursor-none"
                >
                  ABORT
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmBlackHole(blackHoleGravityForce)}
                  className="flex-1 py-2 text-[9px] font-display font-black tracking-widest bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all uppercase cursor-none flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(119,51,255,0.25)]"
                >
                  CALIBRATE SINGULARITY
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RENAME CUSTOM PLANET MODAL */}
      <AnimatePresence>
        {editingPlanet && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-[2600] p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-slate-950 border border-gold/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(232,184,75,0.25)] flex flex-col gap-4 pointer-events-auto"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-[11px] font-display font-black text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5" /> Rename Custom Planet
                </h3>
                <span className="text-[7.5px] font-mono text-slate-500 uppercase">SYS RE-IDENTIFIER</span>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider">NEW COGNITIVE CODENAME:</label>
                <input
                  type="text"
                  maxLength={16}
                  value={editingPlanetName}
                  onChange={(e) => setEditingPlanetName(e.target.value)}
                  className="w-full bg-[#0c0e1e] border border-white/10 text-cream rounded-xl px-3 py-2 text-xs font-mono focus:border-gold focus:ring-1 focus:ring-gold outline-none cursor-none"
                  placeholder="Enter custom name..."
                />
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPlanet(null);
                    setEditingPlanetName('');
                    playSynthBeep(320, 0.08, 'sine', 0.05);
                  }}
                  className="flex-1 py-2 text-[9px] font-mono border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-xl uppercase transition-all cursor-none"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (editingPlanetName.trim()) {
                      setCustomPlanets(prev => prev.map(p => {
                        if (p.id === editingPlanet.id) {
                          return { ...p, name: editingPlanetName.trim() };
                        }
                        return p;
                      }));
                      playSuccessChime();
                      setEditingPlanet(null);
                      setEditingPlanetName('');
                    }
                  }}
                  className="flex-1 py-2 text-[9px] font-display font-black bg-gold text-black rounded-xl uppercase transition-all hover:bg-yellow-500 cursor-none"
                >
                  SAVE CODENAME
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLASSMORPHIC CUSTOM DESIGN FLASHCARD */}
      <AnimatePresence>
        {selectedDetailPlanet && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[2400] p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-slate-950/75 border border-white/15 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.08)] flex flex-col pointer-events-auto relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(13, 16, 37, 0.85) 0%, rgba(3, 5, 14, 0.95) 100%)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />

              <div className="p-4 border-b border-white/10 flex justify-between items-start relative z-10">
                <div className="flex gap-2.5 items-center">
                  <span 
                    style={{ backgroundColor: selectedDetailPlanet.color, boxShadow: `0 0 15px ${selectedDetailPlanet.color}` }}
                    className="w-4 h-4 rounded-full inline-block border border-white/25 animate-pulse"
                  ></span>
                  <div>
                    <span className="text-[7px] font-mono text-cyan tracking-[2px] uppercase block">CORE INTEL</span>
                    <h3 className="font-display font-black text-sm text-cream tracking-wide uppercase leading-tight mt-0.5">
                      {selectedDetailPlanet.name}
                    </h3>
                  </div>
                </div>

                <span className="text-[7.5px] font-mono px-2 py-0.5 rounded bg-white/10 text-cream leading-none uppercase border border-white/10">
                  {selectedDetailPlanet.type}
                </span>
              </div>

              <div className="p-4 space-y-4 relative z-10">
                <div className="w-full h-24 bg-[#0a0d24]/60 border border-white/5 rounded-xl p-1.5 flex justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40 pointer-events-none" />
                  
                  <div className="relative w-14 h-14 rounded-full flex justify-center items-center">
                    <div 
                      className="absolute inset-0 rounded-full border border-dashed border-white/15 animate-spin"
                      style={{ animationDuration: '10s' }}
                    />
                    <div 
                      className="absolute inset-2 rounded-full border border-teal/15 animate-spin"
                      style={{ animationDuration: '4s' }}
                    />
                    <span 
                      style={{ backgroundColor: selectedDetailPlanet.color, boxShadow: `0 0 25px ${selectedDetailPlanet.color}` }}
                      className="w-7 h-7 rounded-full inline-block border border-white/20 filter saturate-105"
                    />
                  </div>

                  <div className="absolute right-3.5 bottom-2.5 text-right font-mono text-[6.5px] text-slate-500 uppercase leading-relaxed">
                    <div>POLARITY SCAN: SAFE</div>
                    <div>FREQ: 5.48 GHz</div>
                  </div>
                </div>

                <p className="text-[9px] text-slate-350 font-sans leading-relaxed tracking-wide border-l-2 border-[#30e8c0]/50 pl-2.5 py-0.5">
                  {selectedDetailPlanet.desc || "Standard planetary object orbiting concentric system planes. Rich chemical values detected."}
                </p>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-left">
                    <span className="text-[6.5px] font-mono text-slate-500 uppercase block tracking-wider">GRAVITATIONAL ACCEL</span>
                    <span className="text-[10px] font-mono text-cream font-bold mt-0.5 block">
                      {selectedDetailPlanet.id === 'blackhole' ? 'Infinite (Singular)' : selectedDetailPlanet.id === 'wormhole' ? '0.00 M/S² (Warp)' : '9.82 m/s²'}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-left">
                    <span className="text-[6.5px] font-mono text-slate-500 uppercase block tracking-wider">ATMOSPHERE CONSTRAINTS</span>
                    <span className="text-[10px] font-mono text-cream font-bold mt-0.5 block">
                      {selectedDetailPlanet.type === 'Standard' ? 'Nitrogen/Oxygen' : selectedDetailPlanet.type === 'Alien' ? 'Methane-Rich' : 'High Vacuum'}
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-left">
                    <span className="text-[6.5px] font-mono text-slate-500 uppercase block tracking-wider">SYSTEM DENSITY TIER</span>
                    <span className="text-[10px] font-mono text-cream font-bold mt-0.5 block">
                      Class vB-49 Orbital
                    </span>
                  </div>

                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-left">
                    <span className="text-[6.5px] font-mono text-slate-500 uppercase block tracking-wider">COGNITIVE STATUS</span>
                    <span className="text-[10px] font-mono text-teal font-black mt-0.5 block uppercase tracking-wide">
                      {selectedDetailPlanet.type === 'Special' ? 'Unstable' : 'Stabilized'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t border-white/10 bg-[#070a1a]/40 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDetailPlanet(null);
                    playSynthBeep(350, 0.08, 'sine', 0.05);
                  }}
                  className="w-full py-2 text-[9px] font-display font-black tracking-widest bg-white/10 hover:bg-white/20 border border-white/10 text-cream hover:text-white rounded-xl uppercase transition-all cursor-none flex items-center justify-center gap-1"
                >
                  CLOSE CORE CARD
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GLOBAL HIGH-TECH CELESTIAL SPECIFICATION MODULE (JARVIS VS MANUAL modal) */}
      <AnimatePresence>
        {showCreationModal && (
          <div className="fixed inset-0 w-full h-full bg-slate-950/90 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel max-w-2xl w-full border border-gold/30 bg-slate-950/95 rounded-3xl p-6 md:p-8 flex flex-col gap-5 text-center relative max-h-[90vh] overflow-y-auto shadow-[0_0_80px_rgba(232,184,75,0.2)] text-left"
            >
              {/* Corner indicators */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-gold opacity-50"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-gold opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-gold opacity-50"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-gold opacity-50"></div>

              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[10px] font-mono tracking-widest text-[#ffa500] font-black uppercase">STELLAR SYNTHESIS MODULE v4.2</span>
                <button
                  onClick={() => {
                    playSynthBeep(330, 0.08, 'sine', 0.05);
                    setShowCreationModal(false);
                  }}
                  className="text-base text-slate-400 hover:text-white cursor-none font-bold"
                >
                  ×
                </button>
              </div>

              {creationMethod === null ? (
                // Step 0: Choose method
                <div className="py-6 flex flex-col gap-6">
                  <div>
                    <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">CHOOSE METHOD FOR COSMIC INCEPTION</h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 max-w-md">
                      Will you allow our resident virtual intelligence J.A.R.V.I.S. to auto-arrange coordinates, or carry out tactile manual specifications?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method A: Jarvis */}
                    <button
                      onClick={() => {
                        playSynthBeep(520, 0.1, 'sine', 0.08);
                        setCreationMethod('jarvis');
                        setJarvisStep(0);
                      }}
                      className="p-5 bg-blue/5 border border-blue/20 rounded-2xl hover:bg-blue/15 hover:border-blue group transition-all text-left flex flex-col gap-2 cursor-none"
                    >
                      <div className="text-blue font-bold text-sm flex items-center gap-1.5">
                        🤖 J.A.R.V.I.S. COGNITIVE ASSISTANT
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Speak or enter answers to wizard queries. Jarvis simulates the physical dimensions, gravitational forces, and chemical properties automatically on your behalf.
                      </p>
                      <span className="text-[9px] font-mono text-blue/75 font-semibold mt-2 group-hover:translate-x-1 transition-transform inline-block">🚀 DEPLOY JARVIS AGENT →</span>
                    </button>

                    {/* Method B: Manual */}
                    <button
                      onClick={() => {
                        playSynthBeep(520, 0.1, 'sine', 0.08);
                        setCreationMethod('manual');
                      }}
                      className="p-5 bg-gold/5 border border-gold/20 rounded-2xl hover:bg-gold/15 hover:border-gold group transition-all text-left flex flex-col gap-2 cursor-none"
                    >
                      <div className="text-gold font-bold text-sm flex items-center gap-1.5">
                        🔧 MANUAL TACTILE INCEPTION
                      </div>
                      <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                        Input precision values using parameter sliders: surface gravity density, physical orbits count, defense asteroids, and element core composition.
                      </p>
                      <span className="text-[9px] font-mono text-gold/75 font-semibold mt-2 group-hover:translate-x-1 transition-transform inline-block">🛠️ ARRANGE COORDINATES →</span>
                    </button>
                  </div>
                </div>
              ) : creationMethod === 'jarvis' ? (
                // JARVIS AI SYSTEM
                <div className="text-left flex flex-col gap-4">
                  <div className="flex items-center gap-2 bg-blue/10 border border-blue/20 p-3 rounded-xl">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue"></span>
                    </span>
                    <span className="text-[9.5px] font-mono text-blue-300 font-bold uppercase">J.A.R.V.I.S. INTELLIGENT COMPANION SYS</span>
                  </div>

                  {jarvisStep === 0 && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">QUESTION 1: What type of celestial entity or planet is desired?</h4>
                        <p className="text-[10px] text-slate-400 leading-normal mt-1">Suggestions below (Click to copy or write anything custom):</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {['Alien Bio-Hemi World', 'Supermassive Gas Giant', 'Compact Neutron core', 'Singularity Cosmic Black Hole', 'Quantum Temporal Anomaly'].map(sugg => (
                          <button
                            type="button"
                            key={sugg}
                            onClick={() => {
                              playSynthBeep(480, 0.08, 'sine', 0.05);
                              setJarvisAnswers(prev => ({ ...prev, type: sugg }));
                              if (sugg.toLowerCase().includes('black hole') || sugg.toLowerCase().includes('blackhole') || sugg.toLowerCase().includes('singularity')) {
                                setJarvisObjectType('Black Hole');
                              } else {
                                setJarvisObjectType('Planet');
                              }
                            }}
                            className="text-[9px] font-mono bg-white/5 border border-white/10 hover:border-blue hover:text-blue text-slate-200 px-3 py-1 rounded-xl cursor-none"
                          >
                            {sugg}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="e.g. A frozen diamond gas planet with triple ring structures"
                        value={jarvisAnswers.type}
                        onChange={(e) => {
                          const val = e.target.value;
                          setJarvisAnswers(prev => ({ ...prev, type: val }));
                          if (val.toLowerCase().includes('black hole') || val.toLowerCase().includes('blackhole') || val.toLowerCase().includes('singularity') || val.toLowerCase().includes('wormhole')) {
                            setJarvisObjectType('Black Hole');
                          } else {
                            setJarvisObjectType('Planet');
                          }
                        }}
                        className="w-full text-xs p-3 bg-slate-900 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-blue cursor-none"
                      />

                      <button
                        onClick={() => {
                          if (!jarvisAnswers.type.trim()) return;
                          
                          // Trigger Simulated THINKING MODEL output
                          playWarpTransition();
                          setThinkingSimulationActive(true);
                          setJarvisStep(1);
                          setTimeout(() => {
                            const coreThemes = ['Class-M organic oasis', 'Atmospheric methane envelope', 'Crystalline spacetime lattice', 'Decompressed plasma sphere', 'Dense degenerate white dwarf'];
                            const selectedTheme = coreThemes[Math.floor(Math.random() * coreThemes.length)];
                            setThinkingOutput(`A planet built on "${jarvisAnswers.type}" theme would be classified as Class-Y ${selectedTheme} with massive storm vectors.`);
                            setThinkingSimulationActive(false);
                          }, 1600);
                        }}
                        disabled={!jarvisAnswers.type.trim()}
                        className="p-3 bg-blue/25 hover:bg-blue/35 text-blue border border-blue/40 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider text-center cursor-none disabled:opacity-40"
                      >
                        NEXT PROTOCOL STEP: ELEMENT COMPOSITION →
                      </button>
                    </div>
                  )}

                  {jarvisStep === 1 && (
                    <div className="flex flex-col gap-4">
                      {thinkingSimulationActive ? (
                        <div className="p-4 bg-[#030614]/80 border border-blue/20 rounded-xl text-center py-8">
                          <span className="w-8 h-8 rounded-full border-4 border-t-transparent border-blue animate-spin inline-block mb-3"></span>
                          <span className="text-[10px] font-mono text-blue tracking-widest uppercase block font-bold animate-pulse">🧠 COGNITIVE THINKING AGENT MODEL ANALYSING COMMAND VECTORS...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <div className="bg-slate-900 border border-white/5 rounded-xl p-3">
                            <span className="text-[8px] font-mono text-gold block uppercase font-bold">🧠 THINKING MODEL CONCLUSION:</span>
                            <p className="text-[10.5px] italic font-sans text-slate-300 mt-1 leading-relaxed">
                              "{thinkingOutput || `A spatial anomaly matching ${jarvisAnswers.type} found in catalog charts.`}"
                            </p>
                          </div>

                          <div>
                            <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider">QUESTION 2: What prime elements make up its structural core?</h4>
                            <p className="text-[10px] text-slate-400 leading-normal mt-1">Suggestions below (Click to copy or write custom chemical signatures):</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {['Heavy Vibranium & Promethium Core', 'Silica minerals & Carbonate Sands', 'Sub-zero frozen Liquid Methane', 'Gaseous Plasma & Helium vapors'].map(elemGoods => (
                              <button
                                type="button"
                                key={elemGoods}
                                onClick={() => {
                                  playSynthBeep(480, 0.08, 'sine', 0.05);
                                  setJarvisAnswers(prev => ({ ...prev, elements: elemGoods }));
                                }}
                                className="text-[9px] font-mono bg-white/5 border border-white/10 hover:border-blue hover:text-blue text-slate-200 px-3 py-1 rounded-xl cursor-none"
                              >
                                {elemGoods}
                              </button>
                            ))}
                          </div>

                          <input
                            type="text"
                            placeholder="e.g. Nickel-Iron core with active promethium gas"
                            value={jarvisAnswers.elements}
                            onChange={(e) => setJarvisAnswers(prev => ({ ...prev, elements: e.target.value }))}
                            className="w-full text-xs p-3 bg-slate-900 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-blue cursor-none"
                          />

                          <div className="flex gap-3">
                            <button
                              onClick={() => setJarvisStep(0)}
                              className="p-3 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-xl text-xs font-mono font-bold uppercase transition-all flex-grow text-center cursor-none"
                            >
                              ← BACK
                            </button>

                            <button
                              onClick={() => {
                                if (!jarvisAnswers.elements.trim()) return;
                                
                                // Perform the actual automatic synthesis save!
                                playScannerSweep();
                                setJarvisStep(2);

                                setTimeout(() => {
                                  // Construct new custom planetary entity
                                  const rawId = `planet-${Date.now()}`;
                                  const listWords = jarvisAnswers.type.trim().split(' ');
                                  const nameStr = listWords[listWords.length - 1] || 'Jarvis Speciation';
                                  const randColor = ['#30e8c0', '#b070ff', '#ffa500', '#ff3366', '#33ffaa'][Math.floor(Math.random() * 5)];
                                  
                                  const finalObj = {
                                    id: rawId,
                                    name: nameStr,
                                    type: jarvisObjectType === 'Black Hole' ? 'Special' : 'Alien',
                                    color: randColor,
                                    desc: `Forger Specs: ${jarvisAnswers.type} containing high traces of ${jarvisAnswers.elements}. Gravitation computed dynamically near ${Math.random() * 20 + 2} m/s².`
                                  };

                                  setCustomPlanets(prev => {
                                    const updated = [...prev, finalObj];
                                    saveStateToStorage(undefined, undefined, undefined, updated);
                                    return updated;
                                  });

                                  // Also seed into orbits if we have empty!
                                  const updatedOrbits = [...orbits];
                                  const targetIdx = updatedOrbits.findIndex(item => item === null);
                                  if (targetIdx !== -1) {
                                    updatedOrbits[targetIdx] = finalObj.id;
                                    setOrbits(updatedOrbits);
                                  }

                                  // Update three.js live user system if tab handles
                                  const threeObj = {
                                    id: rawId,
                                    name: nameStr,
                                    type: jarvisObjectType === 'Black Hole' ? 'Anomaly' : 'Planet',
                                    color: randColor,
                                    size: 1.2 + Math.random() * 1.5,
                                    speed: 0.01 + Math.random() * 0.015,
                                    distance: 6 + userSystem.length * 2.5
                                  };
                                  setUserSystem(prev => [...prev, threeObj]);

                                  playSuccessChime();
                                  setJarvisStep(3);
                                }, 1500);

                              }}
                              disabled={!jarvisAnswers.elements.trim()}
                              className="p-3 bg-blue/20 hover:bg-blue/30 text-blue border border-blue/40 rounded-xl text-xs font-mono font-bold uppercase transition-all tracking-wider text-center flex-grow cursor-none disabled:opacity-40"
                            >
                              🚀 SYNTHESIZE CELESTIAL WORLD →
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {jarvisStep === 2 && (
                    <div className="p-6 text-center py-12 flex flex-col items-center gap-4">
                      <span className="w-10 h-10 rounded-full border-4 border-t-transparent border-blue animate-spin inline-block"></span>
                      <h4 className="text-white text-sm font-mono uppercase font-bold animate-pulse text-center">SYNTHESIZING WORLD MATRIX WITH JARVIS COGNITION...</h4>
                      <p className="text-[10.5px] text-slate-400 text-center">Stable element alignments calibrated. Locking physical dimension matrices.</p>
                    </div>
                  )}

                  {jarvisStep === 3 && (
                    <div className="p-6 text-center py-8 flex flex-col items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-teal/10 border border-teal flex items-center justify-center text-teal text-xl animate-bounce">✓</div>
                      <h4 className="text-[#30e8c0] text-sm font-mono uppercase font-bold">STELLAR Speciaton REGISTERED SUCCESS!</h4>
                      <p className="text-[10.5px] text-slate-300 text-center">
                        Jarvis synthesized elements in active system. Your planet has been saved into **My Planets** catalog section and slotted into solar orbits successfully!
                      </p>
                      
                      <button
                        onClick={() => {
                          playSynthBeep(440, 0.1, 'sine', 0.08);
                          setShowCreationModal(false);
                        }}
                        className="px-6 py-2.5 bg-blue text-white rounded-xl text-xs font-mono font-bold uppercase cursor-none mt-4 mx-auto block"
                      >
                        CLOSE SECURE SPECIFIER
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // MANUAL CREATOR DECK CARD
                <div className="text-left flex flex-col gap-4">
                  <div className="bg-gold/10 border border-gold/20 p-3 rounded-xl flex items-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 bg-gold rounded-full"></span>
                    <span className="text-[9.5px] font-mono text-gold font-bold uppercase">TACTILE ARRANGE PARAMETERS ENGINE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Planet Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">PLANETARY REGISTRY NAME</label>
                      <input
                        type="text"
                        placeholder="e.g. Kepler-186f"
                        value={manualName}
                        onChange={(e) => setManualName(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-900 border border-white/10 rounded-xl text-cream focus:outline-none cursor-none"
                      />
                    </div>

                    {/* How many asteroids or enemies do you want */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">ORBITAL ASTEROIDS / ENEMY SQUADRONS</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={manualAsteroidCount}
                          onChange={(e) => setManualAsteroidCount(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-20 text-xs p-2.5 bg-slate-900 border border-white/10 rounded-xl text-cream focus:outline-none cursor-none"
                        />
                        <span className="text-[8.5px] font-mono text-slate-500 uppercase">Defenders in Outer Rings</span>
                      </div>
                    </div>

                    {/* Material Element suggestions list */}
                    <div className="col-span-full flex flex-col gap-1.5">
                      <label className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">CORE CHEMISTRY ELEMENTS MATRIX</label>
                      <div className="flex flex-wrap gap-1.5">
                        {['Vibranium Shield Dust', 'Sub-zero Solid Methane', 'Radioactive Uranium Core', 'Quantum Silicates'].map(item => (
                          <button
                            type="button"
                            key={item}
                            onClick={() => {
                              playSynthBeep(440, 0.08, 'sine', 0.05);
                              setManualElements(item);
                            }}
                            className={`text-[8.5px] font-mono px-3 py-1 rounded-xl cursor-none transition-all ${
                              manualElements === item ? 'bg-gold/20 border border-gold text-gold font-bold' : 'bg-white/5 border border-white/10 text-slate-350 hover:text-white'
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Slider for Planet size */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">VISUAL SIZE SCALE</label>
                        <span className="text-[10px] font-bold text-gold">{manualPlanetSize.toFixed(1)}x Radius</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="5.0"
                        step="0.1"
                        value={manualPlanetSize}
                        onChange={(e) => setManualPlanetSize(parseFloat(e.target.value))}
                        className="w-full accent-gold bg-slate-800 h-1.5 rounded-lg cursor-none"
                      />
                    </div>

                    {/* Slider for Physical Weight */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">PHYSICAL CORE WEIGHT / MASS</label>
                        <span className="text-[10px] font-bold text-gold">{manualMass} Earth Masses</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="250"
                        value={manualMass}
                        onChange={(e) => setManualMass(parseInt(e.target.value))}
                        className="w-full accent-gold bg-slate-800 h-1.5 rounded-lg cursor-none"
                      />
                    </div>

                    {/* Slider for gravity slides */}
                    <div className="col-span-full flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">SURFACE GRAVITY CALIBRATOR</label>
                        <span className="text-[10px] font-bold text-[#e088ff]">{manualGravity.toFixed(1)} m/s² Force</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="45.0"
                        step="0.5"
                        value={manualGravity}
                        onChange={(e) => setManualGravity(parseFloat(e.target.value))}
                        className="w-full accent-purple bg-slate-800 h-1.5 rounded-lg cursor-none"
                      />
                    </div>

                  </div>

                  <div className="flex gap-3 justify-end border-t border-white/5 pt-4 mt-2">
                    <button
                      onClick={() => setCreationMethod(null)}
                      className="px-4 py-2 bg-slate-900 text-slate-400 text-xs font-mono font-bold uppercase rounded-xl hover:text-white cursor-none"
                    >
                      ← BACK
                    </button>
                    <button
                      onClick={() => {
                        if (!manualName.trim()) return;

                        const finalId = `planet-${Date.now()}`;
                        const customBody = {
                          id: finalId,
                          name: manualName,
                          type: 'Exotic',
                          color: '#e8b84b',
                          desc: `Manual Speciation - core contains ${manualElements}. Gravity: ${manualGravity.toFixed(1)} m/s², Weight: ${manualMass} Earth masses. Has orbit of ${manualAsteroidCount} defense shields.`
                        };

                        setCustomPlanets(prev => {
                          const updated = [...prev, customBody];
                          saveStateToStorage(undefined, undefined, undefined, updated);
                          return updated;
                        });

                        // Slotted into orbit automatically if there are empty slots
                        const updatedOrbits = [...orbits];
                        const unoccupiedIdx = updatedOrbits.findIndex(item => item === null);
                        if (unoccupiedIdx !== -1) {
                          updatedOrbits[unoccupiedIdx] = customBody.id;
                          setOrbits(updatedOrbits);
                        }

                        // Seed live userSystem inside ThreeJS
                        const threeBody = {
                          id: finalId,
                          name: manualName,
                          type: 'Planet',
                          color: '#e8b84b',
                          size: manualPlanetSize,
                          speed: 0.012,
                          distance: 6 + userSystem.length * 2.5
                        };
                        setUserSystem(prev => [...prev, threeBody]);

                        playSuccessChime();
                        setShowCreationModal(false);
                      }}
                      disabled={!manualName.trim()}
                      className="px-5 py-2.5 bg-gold hover:bg-yellow-500 text-slate-950 text-xs font-mono font-bold uppercase rounded-xl transition-all cursor-none disabled:opacity-40"
                    >
                      💾 SAVE MANUAL FLASH CARD AND ATTACH
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Cursor Grab Follower (glowing planet held in cursor) */}
      {grabbedPlanet && (
        <div 
          ref={followerRef}
          style={{ 
            left: '0px', 
            top: '0px',
            position: 'fixed'
          }}
          className="pointer-events-none z-[9999] p-2 bg-slate-950/95 border border-gold/40 flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(232,184,75,0.45)] select-none"
        >
          <div className="relative flex items-center justify-center">
            <span 
              style={{ backgroundColor: grabbedPlanet.color }}
              className="w-4 h-4 rounded-full inline-block animate-ping absolute opacity-65"
            ></span>
            <span 
              style={{ backgroundColor: grabbedPlanet.color, boxShadow: `0 0 10px ${grabbedPlanet.color}` }}
              className="w-4 h-4 rounded-full inline-block relative border border-white/20"
            ></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-display font-black text-gold uppercase tracking-widest leading-none">
              ✊ GRABBED
            </span>
            <span className="text-[8px] font-mono text-slate-300 uppercase mt-0.5 tracking-wider leading-none">
              {grabbedPlanet.name}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
export default CosmicGame;
