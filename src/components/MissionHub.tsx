import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Gamepad2, ArrowLeft, Tv, Activity, Mic, MicOff, ShieldAlert, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { playSynthBeep, playSuccessChime, playWarpTransition } from '../utils/audio';

interface MissionHubProps {
  onSelectMission: (mission: 'explorer' | 'game' | 'builder') => void;
  onBack: () => void;
  onRetreat: () => void;
}

export const MissionHub: React.FC<MissionHubProps> = ({ onSelectMission, onBack, onRetreat }) => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);

  const [selectedCard, setSelectedCard] = useState<'explorer' | 'game' | 'builder'>('explorer');
  const [lastGesture, setLastGesture] = useState<string>('NONE');
  const [gestureHint, setGestureHint] = useState<string>('POINT: Toggle Cards | PINCH: Launch | PALM: Back');
  
  const lastGestureProcessedRef = useRef<{ gesture: string; time: number }>({ gesture: 'NONE', time: 0 });

  // Custom states for Voice Command Authorization Overlay
  const [isVoiceAuthOpen, setIsVoiceAuthOpen] = useState<boolean>(false);
  const [voiceAuthTarget, setVoiceAuthTarget] = useState<'explorer' | 'game' | null>(null);
  const [voiceAuthStatus, setVoiceAuthStatus] = useState<'idle' | 'listening' | 'comparing' | 'success' | 'failed'>('idle');
  const [transcriptText, setTranscriptText] = useState<string>('');
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [speechError, setSpeechError] = useState<string>('');

  const triggerVoiceAuth = (target: 'explorer' | 'game') => {
    playSynthBeep(659.25, 0.15, 'sawtooth', 0.08); // high warning chime
    setVoiceAuthTarget(target);
    setIsVoiceAuthOpen(true);
    setVoiceAuthStatus('idle');
    setTranscriptText('');
    setSpeechError('');
    setSimulatedLogs([
      "[SYSTEM] ACOUSTIC DECODER ONLINE",
      "[SYSTEM] SECURE GATES ARMED. SPEAK TO AUTHORIZE DIRECTIVE..."
    ]);
  };

  // Keyboard navigation support in hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as any)?.isContentEditable ||
        isVoiceAuthOpen
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        playSynthBeep(440, 0.08, 'sine', 0.05);
        setSelectedCard('explorer');
      } else if (e.key === 'ArrowRight') {
        playSynthBeep(523, 0.08, 'sine', 0.05);
        setSelectedCard('game');
      } else if (e.key === 'Enter') {
        onSelectMission(selectedCard);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCard, isVoiceAuthOpen]);

  // Unified Web Speech API and Simulation Orchestration Hook
  useEffect(() => {
    if (!isVoiceAuthOpen || !voiceAuthTarget) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Microphone SpeechRecognition is not fully supported in your browser/container environment. Utilize the simulated bypass override.');
      return;
    }

    let recognition: any = null;
    let isActiveSession = true;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceAuthStatus('listening');
        setTranscriptText('Listening for vocal passphrase imprint...');
        setSimulatedLogs(prev => [...prev, "[MIC] LIVE TRANSMISSION CHANNEL DETECTED. SPEAK CODES NOW."]);
      };

      recognition.onresult = (event: any) => {
        if (!event.results || event.results.length === 0) return;
        const text = event.results[0][0].transcript.toLowerCase().trim();
        setTranscriptText(`Matched Phrase: "${text.toUpperCase()}"`);
        setVoiceAuthStatus('comparing');
        setSimulatedLogs(prev => [
          ...prev, 
          `[DECODER] PASSCODE RECEIVED: "${text.toUpperCase()}"`,
          `[DECODER] COMPUTING ACOUSTIC COEFFICIENTS MATRIX...`
        ]);

        const passphraseWord = voiceAuthTarget === 'explorer' ? 'explorer' : 'universe';
        
        setTimeout(() => {
          if (!isActiveSession) return;
          
          const isMatch = text.includes(passphraseWord) || text.includes('activate') || text.includes('authorize') || text.includes('open') || text.includes('yes') || text.includes('grant');
          
          if (isMatch) {
            setVoiceAuthStatus('success');
            setSimulatedLogs(prev => [...prev, "[MATCH] DECODERS CONFIRMED CADET SOUNDPRINT! GATEWAY SECURED."]);
            playSuccessChime();
            setTimeout(() => {
              if (isActiveSession) {
                setIsVoiceAuthOpen(false);
                onSelectMission(voiceAuthTarget);
              }
            }, 1800);
          } else {
            setVoiceAuthStatus('failed');
            setSimulatedLogs(prev => [
              ...prev, 
              `[ALERT] INTENSITY / FREQUENCY MISMATCH. SECURITY THRESHOLD NOT REACHED.`,
              `[HELP] Clearly state "${passphraseWord.toUpperCase()}" or press the Simulated Override.`
            ]);
            playSynthBeep(200, 0.45, 'sawtooth', 0.15); // low discord warning sound
          }
        }, 1600);
      };

      recognition.onerror = (e: any) => {
        console.warn("Speech API session error: ", e.error);
        if (isActiveSession) {
          setSpeechError(`Speech Engine Alert: '${e.error}'. Bypass with simulated scan below.`);
          setVoiceAuthStatus('failed');
        }
      };

      recognition.start();
    } catch (err) {
      console.error(err);
    }

    return () => {
      isActiveSession = false;
      if (recognition) {
        try {
          recognition.abort();
        } catch (e) {}
      }
    };
  }, [isVoiceAuthOpen, voiceAuthTarget]);

  const startVoiceSimulation = () => {
    if (voiceAuthStatus === 'success' || voiceAuthStatus === 'comparing') return;
    setVoiceAuthStatus('comparing');
    setTranscriptText('');
    setSpeechError('');
    setSimulatedLogs([
      "[BYPASS] CADET ACOUSTIC SIGNAL GENERATOR INITIALIZED",
      "[STEP 1] SYNTHESIZING VERBAL SIGNATURE ENVELOPES..."
    ]);
    playSynthBeep(330, 0.1, 'sine', 0.08);

    const targetPhrasing = voiceAuthTarget === 'explorer' ? 'ACTIVATE EXPLORER' : 'ACTIVATE UNIVERSE';

    // Phase 1: Emulate speech text dispatch
    setTimeout(() => {
      setTranscriptText(`SIMULATED HANDSHAKE: "${targetPhrasing}"`);
      setSimulatedLogs(prev => [
        ...prev, 
        `[AUDIO] DISPATCHED TEST HARMONICS: '${targetPhrasing}'`,
        `[STEP 2] AUDIOMETRIC COMPARISON AGAINST RESIDENT DB RECORDS...`
      ]);
      playSynthBeep(440, 0.1, 'sine', 0.08);
    }, 1200);

    // Phase 2: Success trigger
    setTimeout(() => {
      setVoiceAuthStatus('success');
      setSimulatedLogs(prev => [
        ...prev, 
        `[MATCH] SPECTRAL ENVELOPE RETRIEVAL FACTOR: 99.8% [VERIFIED]`,
        `[SUCCESS] DE-STABILIZING PORTAL ARCS. COGNITIVE AUTH SUCCESSFUL.`
      ]);
      playSuccessChime();
    }, 2800);

    // Final entry
    setTimeout(() => {
      if (voiceAuthTarget) {
        setIsVoiceAuthOpen(false);
        onSelectMission(voiceAuthTarget);
      }
    }, 4200);
  };

  // Gesture tracking deactivated for Layer 2 Mission Hub (restricting to mouse/keyboard)

  const handleGestureAction = (gesture: string) => {
    const now = Date.now();
    const last = lastGestureProcessedRef.current;
    
    // Throttle same action if triggered too close in time
    if (gesture === last.gesture && now - last.time < 1200) {
      setLastGesture(gesture);
      return;
    }
    
    // Throttle any action if triggered too close in time (minimum 500ms gap)
    if (gesture !== 'NONE' && now - last.time < 500) {
      return;
    }

    setLastGesture(gesture);
    
    if (gesture === 'POINT') {
      playSynthBeep(600, 0.1, 'triangle', 0.06);
      setSelectedCard(prev => (prev === 'explorer' ? 'game' : 'explorer'));
      lastGestureProcessedRef.current = { gesture, time: now };
    } else if (gesture === 'PINCH' || gesture === 'PINCH_LOCKED') {
      lastGestureProcessedRef.current = { gesture, time: now };
      onSelectMission(selectedCard);
    } else if (gesture === 'OPEN_PALM' || gesture === 'OPEN_PALM_LOCKED') {
      playWarpTransition();
      lastGestureProcessedRef.current = { gesture, time: now };
      onBack();
    }
  };

  // THREE.JS GALAXY BACKGROUND (INLINE)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    let renderer: any;
    let scene: any;
    let camera: any;
    let galaxyPoints: any;
    let animationFrameId: number;

    const initThree = () => {
      const THREE = (window as any).THREE;
      if (!THREE) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
      camera.position.z = 250;

      // Renderer
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Galaxy Mesh
      const geometry = new THREE.BufferGeometry();
      const count = 2500;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      const colorBlue = new THREE.Color('#4ab8ff');
      const colorPurple = new THREE.Color('#b070ff');
      const colorTeal = new THREE.Color('#30e8c0');

      for (let i = 0; i < count; i++) {
        // Spiral arms calculation
        const r = Math.random() * 180;
        const armsCount = 3;
        const armIndex = i % armsCount;
        const angle = (armIndex * (2 * Math.PI / armsCount)) + (r * 0.024);

        // Add dispersion logic
        const x = Math.cos(angle) * r + (Math.random() - 0.5) * 15;
        const y = (Math.random() - 0.5) * 8;
        const z = Math.sin(angle) * r + (Math.random() - 0.5) * 15;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Colors interpolation based on radius
        let mixedColor = colorBlue.clone();
        if (r < 60) {
          mixedColor.lerp(colorPurple, r / 60);
        } else {
          mixedColor.lerp(colorTeal, (r - 60) / 120);
        }

        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Material
      const material = new THREE.PointsMaterial({
        size: 2.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      galaxyPoints = new THREE.Points(geometry, material);
      scene.add(galaxyPoints);

      // Simple ambient lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
    };

    const animate = () => {
      if (galaxyPoints) {
        galaxyPoints.rotation.y += 0.0012;
        galaxyPoints.rotation.x = Math.sin(Date.now() * 0.0001) * 0.15;
      }
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize after a tiny timeout to let context mount
    const timer = setTimeout(() => {
      initThree();
      animate();
    }, 100);

    const handleResize = () => {
      if (!canvas || !camera || !renderer) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  // 3D TILT MOUSE INTERACTION ON HUB CARDS (Disabled to keep elements static)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardRef: React.RefObject<HTMLDivElement | null>) => {
    // Disabled to stop movement from position
  };

  const handleMouseLeave = (cardRef: React.RefObject<HTMLDivElement | null>) => {
    // Disabled to stop movement from position
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center z-10 select-none bg-slate-950/20">
      
      {/* Background galactic Three.js element */}
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Floating glowing orbs */}
      <div className="absolute w-[180px] h-[180px] bg-blue/10 rounded-full filter blur-[50px] top-[15%] left-[20%] animate-cosmic-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute w-[150px] h-[150px] bg-purple/8s rounded-full filter blur-[50px] bottom-[20%] right-[10%] animate-cosmic-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute w-[120px] h-[120px] bg-teal/5 rounded-full filter blur-[40px] top-[40%] right-[25%] animate-cosmic-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative z-10 text-center mb-10 max-w-2xl px-4 flex flex-col items-center">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display font-black text-3xl md:text-5xl tracking-[10px] text-white animate-dimension-shift"
          style={{ textShadow: '0 0 35px rgba(74, 184, 255, 0.4)' }}
        >
          SELECT MISSION
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-display text-xs md:text-sm tracking-[5px] text-blue font-bold mt-2 uppercase"
        >
          Choose Your Cosmic Journey
        </motion.p>
      </div>

      {/* HUB CARDS GRID */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-6 md:px-4 mb-10">
        
        {/* CARD 1 — COSMIC EXPLORER */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          ref={card1Ref}
          onMouseMove={(e) => handleMouseMove(e, card1Ref)}
          onMouseLeave={() => handleMouseLeave(card1Ref)}
          onMouseEnter={() => {
            playSynthBeep(440, 0.08, 'sine', 0.05);
            setSelectedCard('explorer');
          }}
          onClick={() => {
            setSelectedCard('explorer');
            onSelectMission('explorer');
          }}
          className={`glass-panel p-8 rounded-2xl flex flex-col justify-between h-[380px] cursor-none border transition-all duration-300 select-none relative overflow-hidden group ${
            selectedCard === 'explorer'
              ? 'glass-panel-glow border-gold/70 bg-slate-950/95 scale-[1.03] shadow-[0_0_35px_rgba(232,184,75,0.25)]'
              : 'border-blue/20 bg-slate-950/70 hover:border-blue/40 opacity-60 hover:opacity-100 hover:scale-[1.01]'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue/5 rounded-bl-full filter blur-xl opacity-60 group-hover:bg-blue/10 transition-colors duration-300"></div>
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1 bg-blue/15 border border-blue/40 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue animate-ping"></span>
              <span className="text-[9px] font-display font-black text-blue tracking-widest uppercase">AVAILABLE NOW</span>
            </div>
            <Eye className="w-6 h-6 text-blue/80 group-hover:text-blue group-hover:scale-110 transition-all duration-300" />
          </div>

          <div className="w-full flex justify-center py-4 relative">
            {/* Spinning solar system wireframe symbol */}
            <div className="relative w-28 h-28 flex justify-center items-center">
              <div className="absolute w-28 h-28 border border-white/5 rounded-full animate-spin" style={{ animationDuration: '12s' }}></div>
              <div className="absolute w-20 h-20 border border-blue/15 rounded-full animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}></div>
              <div className="absolute w-12 h-12 border border-purple/20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
              
              <div className="absolute w-4 h-4 bg-gradient-to-r from-gold to-orange rounded-full filter glow"></div>
              <div className="absolute w-2.5 h-2.5 bg-blue rounded-full top-2 left-6"></div>
              <div className="absolute w-2 h-2 bg-purple rounded-full bottom-4 right-4"></div>
            </div>
          </div>

          <div>
            <h3 className="font-display font-black text-xl text-gold tracking-widest group-hover:text-blue transition-colors duration-300 uppercase mb-2">
              🔭 COSMIC EXPLORER
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed tracking-wide">
              Navigate parallel universes, 12 famous galaxies, and stars with full gestural control. Interact visually with planetary scales, black holes, pulsars, and gravitational fields.
            </p>
          </div>
        </motion.div>

        {/* CARD 2 — COSMIC UNIVERSE GAME */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          ref={card2Ref}
          onMouseMove={(e) => handleMouseMove(e, card2Ref)}
          onMouseLeave={() => handleMouseLeave(card2Ref)}
          onMouseEnter={() => {
            playSynthBeep(494, 0.08, 'sine', 0.05);
            setSelectedCard('game');
          }}
          onClick={() => {
            setSelectedCard('game');
            onSelectMission('game');
          }}
          className={`glass-panel p-8 rounded-2xl flex flex-col justify-between h-[380px] cursor-none border transition-all duration-300 select-none relative overflow-hidden group ${
            selectedCard === 'game'
              ? 'glass-panel-glow border-gold/70 bg-slate-950/95 scale-[1.03] shadow-[0_0_35px_rgba(232,184,75,0.25)]'
              : 'border-gold/20 bg-slate-950/70 hover:border-gold/40 opacity-60 hover:opacity-100 hover:scale-[1.01]'
          }`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-bl-full filter blur-xl opacity-60 group-hover:bg-gold/10 transition-colors duration-300"></div>

          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1 bg-gold/15 border border-gold/40 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-bounce"></span>
              <span className="text-[9px] font-display font-black text-gold tracking-widest uppercase">PLAY NOW</span>
            </div>
            <Gamepad2 className="w-6 h-6 text-gold/80 group-hover:text-gold group-hover:scale-110 transition-all duration-300" />
          </div>

          <div className="w-full flex justify-center py-4 relative">
            {/* Custom collapsing grid or matrix wave symbol */}
            <div className="relative w-28 h-28 flex justify-center items-center">
              <div className="absolute w-24 h-24 border border-gold/15 rounded-xl rotate-45 animate-spin" style={{ animationDuration: '8s' }}></div>
              <div className="absolute w-16 h-16 border border-white/5 rounded-xl -rotate-12 animate-pulse"></div>
              <div className="absolute w-8 h-8 border border-purple/35 rounded-full animate-ping"></div>

              <div className="absolute w-3 h-3 bg-purple rounded-full left-0 animate-bounce"></div>
              <div className="absolute w-2 h-2 bg-teal rounded-full bottom-0 right-3"></div>
            </div>
          </div>

          <div>
            <h3 className="font-display font-black text-xl text-gold tracking-widest group-hover:text-purple transition-colors duration-300 uppercase mb-2">
              🎮 COSMIC UNIVERSE
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed tracking-wide">
              Initiate custom solar systems using simulated AI prompts with JARVIS, select custom planetary profiles, and test your credentials in our master 50-level knowledge quest.
            </p>
          </div>
        </motion.div>

        {/* CARD 3 — COSMIC BUILDER */}
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.8, delay: 0.6 }}
           onClick={() => {
             setSelectedCard('builder');
             onSelectMission('builder');
           }}
           className={`glass-panel p-8 rounded-2xl flex flex-col justify-between h-[380px] cursor-none border transition-all duration-300 select-none relative overflow-hidden group ${
             selectedCard === 'builder'
               ? 'glass-panel-glow border-gold/70 bg-slate-950/95 scale-[1.03] shadow-[0_0_35px_rgba(232,184,75,0.25)]'
               : 'border-teal/20 bg-slate-950/70 hover:border-teal/40 opacity-60 hover:opacity-100 hover:scale-[1.01]'
           }`}
        >
           <div className="absolute top-0 right-0 w-32 h-32 bg-teal/5 rounded-bl-full filter blur-xl opacity-60 group-hover:bg-teal/10 transition-colors duration-300"></div>
           
           <div className="flex justify-between items-start">
             <div className="flex items-center gap-1 bg-teal/15 border border-teal/40 px-2.5 py-0.5 rounded-full">
               <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span>
               <span className="text-[9px] font-display font-black text-teal tracking-widest uppercase">WORKSPACE ACTIVE</span>
             </div>
             <Activity className="w-6 h-6 text-teal/80 group-hover:text-teal group-hover:scale-110 transition-all duration-300" />
           </div>

           <div className="w-full flex justify-center py-4 relative">
             {/* 3D Movable Orb Construct */}
             <motion.div 
               className="relative w-28 h-28 flex justify-center items-center cursor-none"
               animate={{ rotateY: 360 }}
               transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
               style={{ transformStyle: 'preserve-3d' }}
             >
               <div className="w-20 h-20 border-2 border-teal/30 rounded-full flex items-center justify-center absolute rotate-x-45 rotate-y-45"></div>
               <div className="w-16 h-16 border-2 border-gold/30 rounded-full flex items-center justify-center absolute -rotate-x-45 -rotate-y-45"></div>
               <div className="w-4 h-4 bg-teal rounded-full shadow-[0_0_15px_rgba(48,232,192,0.6)]"></div>
             </motion.div>
           </div>
           
           <div>
             <h3 className="font-display font-black text-xl text-teal tracking-widest uppercase mb-2">
               🏗️ COSMIC BUILDER
             </h3>
             <p className="text-xs text-slate-400 font-sans leading-relaxed tracking-wide">
               Design custom solar systems. Place planets and stars on your own canvas and simulate gravitational physics.
             </p>
           </div>
        </motion.div>

      </div>

      {/* BACK TO PORT LINK */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="relative z-10 flex gap-4"
      >
        <button
          onClick={onBack}
          className="text-xs font-display font-medium text-slate-400 hover:text-gold tracking-[3px] uppercase flex items-center gap-2 cursor-none mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> ← BACK TO COMM STATION
        </button>
        <button
          onClick={onRetreat}
          className="text-xs font-display font-medium text-red-400 hover:text-red-200 tracking-[3px] uppercase flex items-center gap-2 cursor-none mb-4"
        >
          <RefreshCw className="w-4 h-4" /> RETREAT TO LAYER 1
        </button>
      </motion.div>

      {/* G-HUD deactivated for Layer 2 Mission Hub */}

      {/* 2. State-of-the-art Voice Command Authorization Modal Overlay */}
      <AnimatePresence>
        {isVoiceAuthOpen && voiceAuthTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[900] flex items-center justify-center p-4 select-none cursor-none"
          >
            <motion.div
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="glass-panel w-full max-w-lg border border-blue-500/30 bg-[#060a1d]/95 p-8 rounded-2xl relative shadow-[0_0_60px_rgba(59,130,246,0.18)]"
            >
              {/* Corner Sci-Fi Brackets */}
              <div className="absolute top-4 left-4 text-[#30e8c0]/20 font-mono text-[8px] tracking-widest pointer-events-none">SEC_AUTH_SECTOR_4</div>
              <div className="absolute bottom-4 right-4 text-blue-500/20 font-mono text-[8px] tracking-widest pointer-events-none">[INTEGRITY_SHIELD: 100%]</div>

              {/* Glowing Ambient Aura */}
              <div className="absolute inset-x-0 -top-12 h-24 bg-gradient-to-b from-[#30e8c0]/5 to-transparent filter blur-xl pointer-events-none" />

              {/* Interactive Header */}
              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <div className="relative">
                  {/* Outer pulsating ring */}
                  <motion.div 
                    animate={{ scale: voiceAuthStatus === 'listening' ? [1, 1.25, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    onClick={() => {
                      playSynthBeep(600, 0.1, 'sine', 0.1);
                    }}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                      voiceAuthStatus === 'success' 
                        ? 'bg-teal-500/20 border-[#30e8c0]/50 text-[#30e8c0]' 
                        : voiceAuthStatus === 'failed'
                        ? 'bg-red-500/20 border-red-400/50 text-red-400 animate-bounce'
                        : 'bg-blue-500/10 border-blue-400/40 text-blue-400'
                    } border-2`}
                  >
                    {voiceAuthStatus === 'success' ? (
                      <ShieldCheck className="w-10 h-10 animate-pulse" />
                    ) : (
                      <Mic className={`w-10 h-10 ${voiceAuthStatus === 'listening' ? 'animate-pulse scale-110' : ''}`} />
                    )}
                    
                    {/* Radial ripple animations */}
                    {voiceAuthStatus === 'listening' && (
                      <span className="w-full h-full rounded-full border border-blue-400/30 absolute animate-ping duration-1000"></span>
                    )}
                  </motion.div>
                </div>
                
                <h3 className="font-display font-black text-sm tracking-widest mt-2 uppercase text-white">
                  VOICE DIRECTIVE LOCK : {voiceAuthTarget === 'explorer' ? 'COSMIC EXPLORER' : 'COSMIC UNIVERSE'}
                </h3>
                <div className="text-[10px] text-blue-300 font-mono tracking-widest uppercase">
                  STATUS: <span className="animate-pulse">{voiceAuthStatus.toUpperCase()}</span>
                </div>
              </div>

              {/* Dynamic instruction container */}
              <div className="p-4 bg-black/60 border border-white/5 rounded-xl mb-5 flex flex-col gap-2 relative overflow-hidden" style={{ cursor: 'none' }}>
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">PASSPHRASE REQUIREMENT:</div>
                <div className="text-sm font-mono text-center py-2 border-y border-white/5 font-black text-white tracking-widest">
                  SPEAK PHRASE: <span className="text-gold">"ACTIVATE {voiceAuthTarget === 'explorer' ? 'EXPLORER' : 'UNIVERSE'}"</span>
                </div>
                <div className="text-[10px] font-mono text-center italic transition-all">
                  {transcriptText ? (
                    <span className="text-[#30e8c0] font-bold">{transcriptText}</span>
                  ) : (
                    <span className="text-slate-400">Waiting for vocal print...</span>
                  )}
                </div>
              </div>

              {/* Scrolling terminal telemetry system feed */}
              <div className="bg-slate-950/80 p-3 h-28 border border-white/5 rounded-xl flex flex-col gap-1.5 overflow-hidden justify-end">
                <div className="text-[8px] font-mono text-slate-500 border-b border-white/5 pb-1 uppercase tracking-widest mb-1">ACOUSTIC AUDIOMETICS TELEMETRY:</div>
                <div className="space-y-1 font-mono text-[9px] text-[#30e8c0] min-h-[55px] flex flex-col justify-end text-left">
                  {simulatedLogs.slice(-4).map((log, i) => (
                    <div key={i} className="truncate select-text">
                      <span className="text-slate-500 mr-2">&gt;</span>{log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error messages if Web Speech fails */}
              {speechError && (
                <div className="mt-3 p-2.5 bg-red-950/40 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-300 text-left">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-[8px] font-mono leading-relaxed">{speechError}</div>
                </div>
              )}

              {/* Holographic interactive actions */}
              <div className="flex flex-col gap-2 mt-5">
                <button
                  type="button"
                  onClick={startVoiceSimulation}
                  disabled={voiceAuthStatus === 'success' || voiceAuthStatus === 'comparing'}
                  className={`w-full py-3 rounded-xl font-display font-black text-[9.5px] tracking-widest uppercase flex items-center justify-center gap-2 transition-all cursor-none ${
                    voiceAuthStatus === 'success' || voiceAuthStatus === 'comparing'
                      ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {voiceAuthStatus === 'comparing' ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      SIMULATING HARMONIC MATCH...
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      SIMULATE VOICE SIGNATURE HANDSHAKE
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSynthBeep(440, 0.1, 'sine', 0.05);
                    setIsVoiceAuthOpen(false);
                    setVoiceAuthTarget(null);
                  }}
                  className="w-full py-2 bg-transparent text-slate-400 hover:text-white font-display font-black text-[9px] tracking-widest uppercase border border-slate-700/50 hover:border-slate-500 rounded-xl transition-all cursor-none"
                >
                  ABORT ACCESS PROTOCOLS
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
export default MissionHub;
