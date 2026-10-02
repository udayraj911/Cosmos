import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Mic, MicOff, Settings, Keyboard, User, LogOut, Sliders, Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';
import { playSynthBeep } from './utils/audio';
import { WelcomeScreen } from './components/WelcomeScreen';
import { RegistryBio } from './components/RegistryBio';
import { MissionHub } from './components/MissionHub';
import { CosmicExplorer } from './components/CosmicExplorer';
import { CosmicGame } from './components/CosmicGame';
import { CosmicBuilder } from './components/CosmicBuilder';
import { FloatingJarvis } from './components/FloatingJarvis';

import WebcamGestureTracker from './components/WebcamGestureTracker';
import { GestureTutorialWidget } from './components/GestureTutorialWidget';
import { HolographicBiometricLock } from './components/HolographicBiometricLock';

// Generate 40 static/random indices for ambient dust
const DUST_PARTICLES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  width: Math.random() * 3.5 + 1,
  height: Math.random() * 3.5 + 1,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 8, // seconds
  duration: Math.random() * 12 + 8, // seconds
  driftX: (Math.random() - 0.5) * 160 + 'px',
  driftY: (Math.random() - 0.5) * 160 + 'px'
}));

// Generate static starfields once to avoid re-renders and preserve absolute positioning
const STARS_LAYER_1 = Array.from({ length: 120 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.2 + 0.6, // 0.6px to 1.8px
  opacity: Math.random() * 0.4 + 0.15,
  twinkleDuration: Math.random() * 4 + 3, // 3s to 7s
  twinkleDelay: Math.random() * 5
}));

const STARS_LAYER_2 = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 1.5 + 1.2, // 1.2px to 2.7px
  opacity: Math.random() * 0.55 + 0.25,
  color: Math.random() > 0.85 ? '#4ab8ff' : Math.random() > 0.93 ? '#e8b84b' : '#ffffff',
  twinkleDuration: Math.random() * 3 + 2, // 2s to 5s
  twinkleDelay: Math.random() * 4
}));

const STARS_LAYER_3 = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  size: Math.random() * 2.2 + 2.0, // 2px to 4.2px
  opacity: Math.random() * 0.65 + 0.35,
  color: Math.random() > 0.6 ? '#4ab8ff' : Math.random() > 0.8 ? '#e8b84b' : Math.random() > 0.9 ? '#b070ff' : '#ffffff',
  pulseDuration: Math.random() * 2.5 + 1.5,
  glow: Math.random() > 0.3
}));

export default function App() {
  const dragControls = useDragControls();
  const [view, setView] = useState<'welcome' | 'bio' | 'hub' | 'explorer' | 'game' | 'builder'>('welcome');
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isCursorActive, setIsCursorActive] = useState(false);
  const [autoOpenAuth, setAutoOpenAuth] = useState(false);
  const [isBiometricVerified, setIsBiometricVerified] = useState(true);

  // Authenticated and Biometric telemetry results stored in global state
  const [userAuth, setUserAuth] = useState<{ email: string; name: string } | null>(null);
  const [cadetBio, setCadetBio] = useState<{ name: string; division: string; sector: string; quote: string } | null>(null);
  const [isGlobalHandControlActive, setIsGlobalHandControlActive] = useState(false);
  const [isSimulatorActive, setIsSimulatorActive] = useState(true);
  const [voiceAccessState, setVoiceAccessState] = useState<'unprompted' | 'prompting' | 'granted' | 'denied'>('granted');
  const [voiceRecognitionStatus, setVoiceRecognitionStatus] = useState<string>('Standby');

  // Unified Settings Menu states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [aiTemperature, setAiTemperature] = useState(0.7);
  const [geminiModel, setGeminiModel] = useState('Gemini 2.0 Flash');
  const [jarvisSpeed, setJarvisSpeed] = useState(1.0);
  const [jarvisMuted, setJarvisMuted] = useState(false);

  // Custom mouse pointer coordinates tracking
  useEffect(() => {
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      (window as any).__latestMouseX = e.clientX;
      (window as any).__latestMouseY = e.clientY;

      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        if (cursorRef.current) {
          cursorRef.current.style.left = `${e.clientX}px`;
          cursorRef.current.style.top = `${e.clientY}px`;
        }
      });
    };

    const handleMouseDown = () => setIsCursorActive(true);
    const handleMouseUp = () => setIsCursorActive(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // AI-Assisted System Recovery Core Handlers for Webcam & Voice Commands
  useEffect(() => {
    const handleAiRepairWebcam = () => {
      playSynthBeep(659.25, 0.2, 'sine', 0.1);
      setIsGlobalHandControlActive(true);
      setIsSimulatorActive(false);
      window.dispatchEvent(new CustomEvent('ai-overdrive-webcam-start'));
    };

    const handleAiRepairVoice = () => {
      playSynthBeep(523.25, 0.25, 'sine', 0.1);
      setVoiceAccessState('granted');
      setVoiceRecognitionStatus('AI BYPASS [ACTIVE]');
    };

    const handleAiActivateSimulator = () => {
      playSynthBeep(440, 0.15, 'triangle', 0.08);
      setIsGlobalHandControlActive(true);
      setIsSimulatorActive(true);
    };

    window.addEventListener('ai-repair-webcam', handleAiRepairWebcam);
    window.addEventListener('ai-repair-voice', handleAiRepairVoice);
    window.addEventListener('ai-activate-simulator', handleAiActivateSimulator);
    return () => {
      window.removeEventListener('ai-repair-webcam', handleAiRepairWebcam);
      window.removeEventListener('ai-repair-voice', handleAiRepairVoice);
      window.removeEventListener('ai-activate-simulator', handleAiActivateSimulator);
    };
  }, []);

  const currentLayer = 
    view === 'welcome' || view === 'bio' ? 1 : 
    view === 'hub' ? 2 : 3;

  // Transition to Layer 3 prompts for speech permission (Disabled to remove voice directive lock)
  useEffect(() => {
    // voice directive lock disabled
  }, [currentLayer, voiceAccessState]);

  // Unified voice speech command listener effect
  useEffect(() => {
    if (voiceAccessState !== 'granted') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceRecognitionStatus('Error: Unsupported');
      return;
    }

    let rec: any = null;
    let shouldBeRunning = true;

    const initSpeechRecognition = () => {
      if (!shouldBeRunning) return;
      
      try {
        rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setVoiceRecognitionStatus('Listening...');
        };

        rec.onresult = (event: any) => {
          const lastIndex = event.results.length - 1;
          const speechText = event.results[lastIndex][0].transcript.toLowerCase().trim();
          console.log("Voice Command Received:", speechText);

          if (speechText.includes('activate simulator')) {
            playSynthBeep(523.25, 0.15, 'triangle', 0.08); // C5 Beep
            setIsGlobalHandControlActive(true);
            setIsSimulatorActive(true);
            setVoiceRecognitionStatus('Sim Active');
          } else if (speechText.includes('activate webcam')) {
            playSynthBeep(659.25, 0.15, 'triangle', 0.08); // E5 Beep
            setIsGlobalHandControlActive(true);
            setIsSimulatorActive(false);
            setVoiceRecognitionStatus('Cam Active');
          }
        };

        rec.onerror = (e: any) => {
          console.warn("Speech Recognition Error:", e);
          if (e.error === 'not-allowed') {
            setVoiceRecognitionStatus('Error: Perm Denied');
            setVoiceAccessState('denied');
          } else {
            setVoiceRecognitionStatus(`Err: ${e.error}`);
            if (e.error === 'service-not-allowed' || e.error === 'language-not-supported') {
              setVoiceAccessState('denied');
            }
          }
        };

        rec.onend = () => {
          setVoiceRecognitionStatus('Restarting...');
          if (shouldBeRunning && voiceAccessState === 'granted') {
            setTimeout(() => {
              if (shouldBeRunning) {
                try {
                  rec.start();
                } catch (err) {
                  // Ignore if already starting / running
                }
              }
            }, 500);
          }
        };

        rec.start();
      } catch (err: any) {
        console.warn("Failed to start speech recognitionInstance", err);
        setVoiceRecognitionStatus('Err: Failed');
        setVoiceAccessState('denied');
      }
    };

    initSpeechRecognition();

    return () => {
      shouldBeRunning = false;
      if (rec) {
        rec.onend = null;
        rec.onstart = null;
        rec.onresult = null;
        rec.onerror = null;
        try {
          rec.stop();
        } catch (e) {}
      }
    };
  }, [voiceAccessState]);

  const isWorkspaceView = view === 'explorer' || view === 'builder' || view === 'game';

  return (
    <div className="relative w-full min-h-screen bg-[#020512] overflow-x-hidden overflow-y-auto leading-normal font-sans text-cream">
      {/* 1. Cinematic Vignette Overlay */}
      <div className="vignette-overlay animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Dynamic 3D Parallax Starfield Background Layers */}
      {!isWorkspaceView && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {/* Layer 1: Distant faint stars (Slow & Deep Parallax) */}
          <div 
            style={{
              transform: 'translate3d(0, 0, 0)',
              transition: 'transform 0.5s cubic-bezier(0.1, 0.8, 0.3, 1)'
            }}
            className="absolute inset-0 supernova-brightened-layer"
          >
            {STARS_LAYER_1.map((star) => (
              <div
                key={`star1-${star.id}`}
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  opacity: star.opacity,
                  animation: `starTwinkle ${star.twinkleDuration}s ease-in-out infinite`,
                  animationDelay: `${star.twinkleDelay}s`,
                  '--star-base-opacity': star.opacity
                } as React.CSSProperties}
                className="absolute bg-white rounded-full pointer-events-none"
              />
            ))}
          </div>

          {/* Layer 2: Medium-distance colored stars (Moderate Parallax) */}
          <div 
            style={{
              transform: 'translate3d(0, 0, 0)',
              transition: 'transform 0.4s cubic-bezier(0.1, 0.8, 0.3, 1)'
            }}
            className="absolute inset-0 supernova-brightened-layer"
          >
            {STARS_LAYER_2.map((star) => (
              <div
                key={`star2-${star.id}`}
                style={{
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  left: `${star.left}%`,
                  top: `${star.top}%`,
                  backgroundColor: star.color,
                  opacity: star.opacity,
                  animation: `starTwinkle ${star.twinkleDuration}s ease-in-out infinite`,
                  animationDelay: `${star.twinkleDelay}s`,
                  '--star-base-opacity': star.opacity
                } as React.CSSProperties}
                className="absolute rounded-full pointer-events-none"
              />
            ))}
          </div>

          {/* Layer 3: Foreground Pulsing/Glowing Stars (Strong Parallax) */}
          <div 
            style={{
              transform: 'translate3d(0, 0, 0)',
              transition: 'transform 0.3s cubic-bezier(0.1, 0.8, 0.3, 1)'
            }}
            className="absolute inset-0 supernova-brightened-layer"
          >
            {STARS_LAYER_3.map((star) => {
              const glowStyle = star.glow 
                ? { boxShadow: `0 0 10px 1.5px ${star.color}` } 
                : {};
              return (
                <div
                  key={`star3-${star.id}`}
                  style={{
                    width: `${star.size}px`,
                    height: `${star.size}px`,
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    backgroundColor: star.color,
                    opacity: star.opacity,
                    animation: `starPulseGlow ${star.pulseDuration}s ease-in-out infinite`,
                    '--star-base-opacity': star.opacity,
                    '--star-color': star.color,
                    ...glowStyle
                  } as any}
                  className="absolute rounded-full pointer-events-none"
                />
              );
            })}
          </div>

          {/* Supernova Periodic Shockwave Overlay Div */}
          <div className="supernova-shockwave" />

          {/* Extra Space Nebula Atmosphere layers (Soft multi-colored light leaks) */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue/10 blur-[120px] mix-blend-screen opacity-40 pointer-events-none animate-pulse" style={{ animationDuration: '12s' }} />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple/10 blur-[130px] mix-blend-screen opacity-35 pointer-events-none animate-pulse" style={{ animationDuration: '15s' }} />
          <div className="absolute top-[40%] left-[60%] w-[40%] h-[40%] rounded-full bg-teal/5 blur-[100px] mix-blend-screen opacity-25 pointer-events-none animate-pulse" style={{ animationDuration: '10s' }} />
        </div>
      )}

      {/* Holographic Step-by-Step Gesture Tutorial Guide */}
      <GestureTutorialWidget />

      {/* 1.5. Holographic Voice Command Access Requester */}
      <AnimatePresence>
        {voiceAccessState === 'prompting' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020512]/92 backdrop-blur-md z-[99999] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel max-w-md w-full border border-teal/30 bg-slate-950/95 p-6 rounded-2xl flex flex-col gap-4 text-center cursor-none relative shadow-[0_0_50px_rgba(48,232,192,0.15)]"
            >
              <div className="flex justify-center mb-1">
                <div className="relative w-16 h-16 rounded-full bg-teal/10 border border-teal/40 flex items-center justify-center text-[#30e8c0] animate-pulse">
                  <Mic className="w-8 h-8" />
                  <span className="absolute inset-0 rounded-full border border-teal/20 animate-ping" />
                </div>
              </div>

              <div>
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-[#30e8c0]">
                  COGNITIVE VOICE ENGINE DETECTED
                </h3>
                <p className="text-[10px] font-mono text-slate-400 mt-2 tracking-wide leading-relaxed">
                  INITIALIZING MICROPHONE INTEGRATION WITH ADVANCED CONTEXT DECODERS.
                  THIS MODULE PROVIDES REAL-TIME VERBAL CONTROL OF CRITICAL AIRSPACE SUB-SYSTEMS.
                </p>
              </div>

              <div className="py-2.5 px-3 bg-teal/5 border border-teal/10 rounded-xl text-left flex flex-col gap-1.5">
                <div className="text-[8px] font-mono text-gold uppercase tracking-wider">AVAILABLE AIRSPACE COMMAND CODES:</div>
                <div className="text-[9px] font-mono text-slate-300 flex items-center gap-2">
                  <span className="text-[#30e8c0] font-bold">"activate simulator"</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">Initialize interactive virtual hand pad</span>
                </div>
                <div className="text-[9px] font-mono text-slate-300 flex items-center gap-2">
                  <span className="text-[#30e8c0] font-bold">"activate webcam"</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-slate-400">Fire optoelectron hand-track scanner (Webcam)</span>
                </div>
              </div>

              <p className="text-[8px] font-mono text-[#30e8c0] animate-pulse italic">
                🎤 Mic permissions will now be prompted natively.
              </p>

              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={() => {
                    playSynthBeep(659.25, 0.2, 'sine', 0.1);
                    setVoiceAccessState('granted');
                  }}
                  className="w-full font-display font-black text-[9.5px] tracking-widest uppercase py-3 bg-[#30e8c0] hover:bg-[#20cfab] text-slate-950 rounded-xl transition-all shadow-[0_0_20px_rgba(48,232,192,0.3)] cursor-none"
                >
                  AUTHORIZE CORES (ALLOW VOICE MODE)
                </button>
                <button
                  onClick={() => {
                    playSynthBeep(440, 0.15, 'sine', 0.08);
                    setVoiceAccessState('denied');
                  }}
                  className="w-full font-display font-black text-[9.5px] tracking-widest uppercase py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl transition-all cursor-none"
                >
                  DISENGAGE MODULE (MANUAL DECOR Only)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating CSS Ambient Cosmic Dust (40 Particles) */}
      {!isWorkspaceView && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
          {DUST_PARTICLES.map((dust) => (
            <div
              key={dust.id}
              style={{
                width: `${dust.width}px`,
                height: `${dust.height}px`,
                left: `${dust.left}%`,
                top: `${dust.top}%`,
                animation: `particleDrift ${dust.duration}s linear infinite`,
                animationDelay: `${dust.delay}s`,
                '--drift-x': dust.driftX,
                '--drift-y': dust.driftY
              } as React.CSSProperties}
              className="absolute floating-dust opacity-35"
            />
          ))}
        </div>
      )}

      {/* 3. Custom Blue/Gold Smooth Lerping Cursor Pointer */}
      <div
        ref={cursorRef}
        style={{ left: '-100px', top: '-100px' }}
        className={`custom-cursor hidden md:block ${isCursorActive ? 'active' : ''}`}
      >
        <div className="dot" />
      </div>

      {/* 4. Active Module Swapper — 4 Layers Architecture */}
      <AnimatePresence mode="wait">
        {view === 'welcome' && (
          <WelcomeScreen
            key="welcome"
            autoOpenAuth={autoOpenAuth}
            onSuccessAuth={(credentials, authType) => {
              setUserAuth(credentials);
              setAutoOpenAuth(false);
              if (authType === 'signin') {
                setView('hub');
              } else {
                setView('bio');
              }
            }}
          />
        )}

        {view === 'bio' && (
          <RegistryBio
            key="bio"
            userAuth={userAuth || { email: "busyrock99@gmail.com", name: "Commander Cadet" }}
            onEnterHub={(finalBio) => {
              setCadetBio(finalBio);
              setView('hub');
            }}
          />
        )}
        
        {view === 'hub' && (
          <MissionHub 
            key="hub" 
            onSelectMission={(mission) => setView(mission)} 
            onBack={() => setView('bio')}
            onRetreat={() => setView('welcome')}
          />
        )}

        {view === 'explorer' && (
          <CosmicExplorer 
            key="explorer" 
            onBackToHub={() => setView('hub')} 
            userAuth={userAuth}
          />
        )}
        {view === 'builder' && (
          <CosmicBuilder 
            key="builder" 
            onBackToHub={() => setView('hub')} 
          />
        )}

        {view === 'game' && (
          <CosmicGame 
            key="game" 
            userAuth={userAuth}
            onTriggerSignUp={() => {
              setAutoOpenAuth(true);
              setView('welcome');
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating global quit button for deep game sandbox back to hub navigation support */}
      {view === 'game' && (
        <button
          onClick={() => setView('hub')}
          style={{ zIndex: 1001 }}
          className="absolute top-6 left-6 font-display font-black text-[9.5px] tracking-widest uppercase py-2.5 px-4 bg-black/80 border border-white/5 hover:border-gold/40 rounded-xl transition-all hover:text-gold cursor-none select-none pointer-events-auto shadow-[0_0_15px_rgba(0,0,0,0.8)]"
        >
          ← RETREAT TO MISSION HUB (LAYER 3)
        </button>
      )}

      {/* Global Holographic Conversational J.A.R.V.I.S. Companion bottom-right logo */}
      {view !== 'game' && (
        <FloatingJarvis 
          currentLayerName={
            view === 'welcome' ? 'Welcome Gateway (Layer 1)' :
            view === 'bio' ? 'Biometrics Profile (Layer 2)' :
            view === 'hub' ? 'Mission Hub (Layer 3)' : 'Cosmic Explorer (Layer 4)'
          }
        />
      )}

      {/* Global Holographic Gesture Tracking System (enabled in Layer 2 Mission Hub and Layer 3 exploration/game modes) */}
      {currentLayer >= 2 && (
        <motion.div 
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          className="fixed bottom-6 left-6 z-[1000] flex flex-col items-start gap-2.5 pointer-events-auto select-none bg-slate-950/20 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-[0_0_25px_rgba(0,0,0,0.6)]"
        >
          {isGlobalHandControlActive ? (
            <div className="flex flex-col gap-2 items-start pointer-events-auto w-full">
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="glass-panel p-3 rounded-xl border border-[#30e8c0]/20 bg-slate-950/95 w-full min-w-[280px] md:min-w-[380px] flex flex-col gap-1 select-none shadow-[0_0_25px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing"
                title="Drag from this header card to reposition everything"
              >
                <div 
                  className="flex items-center gap-1.5 border-b border-white/5 pb-1 mb-1 justify-between w-full"
                >
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#30e8c0] animate-pulse"></span>
                    <span className="text-[8.5px] font-display font-black text-[#30e8c0] tracking-widest uppercase">G-TRACK: MONITOR DECK ✥ DRAG ME</span>
                  </div>
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGlobalHandControlActive(false);
                    }}
                    className="text-[8px] font-mono text-slate-500 hover:text-white uppercase transition-colors px-1 cursor-none relative z-20"
                    title="Close"
                  >
                    [X]
                  </button>
                </div>
                <div className="text-[7px] text-slate-500 font-mono tracking-widest uppercase">AIRSPACE COORDINATES</div>
                <div className="text-[8.5px] font-mono text-[#30e8c0] tracking-wide uppercase leading-normal mt-0.5">
                  POINT: Move • PINCH: Click • PALM: Back • SWIPE: Scroll
                </div>
              </div>
 
              <div className="rounded-xl w-full min-w-[280px] md:min-w-[380px]">
                <WebcamGestureTracker
                  isActive={isGlobalHandControlActive}
                  currentLayer={currentLayer}
                  onGestureDetected={(gesture) => {
                    const event = new CustomEvent('hand-gesture', { detail: { gesture } });
                    window.dispatchEvent(event);
                  }}
                  onDragStart={(e) => dragControls.start(e)}
                  isSimulatorActive={isSimulatorActive}
                  setIsSimulatorActive={setIsSimulatorActive}
                />
              </div>
            </div>
          ) : (
            <button
              onPointerDown={(e) => dragControls.start(e)}
              onClick={(e) => {
                e.stopPropagation();
                setIsGlobalHandControlActive(true);
              }}
              className="pointer-events-auto font-display font-black text-[9px] uppercase tracking-widest p-2.5 px-3.5 rounded-xl bg-slate-950/90 border border-teal/30 hover:border-teal/70 text-[#30e8c0] hover:bg-teal/15 transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(48,232,192,0.15)] cursor-pointer"
            >
              <span className="relative w-2 h-2 flex">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              🖐️ AIR-GESTURES (OFF) ✥ DRAG ME
            </button>
          )}

          {/* Voice Command Module Status Card */}
          {currentLayer === 3 && (
            <div className="glass-panel p-2.5 rounded-xl border border-white/5 bg-slate-950/90 w-[180px] flex flex-col gap-1 select-none pointer-events-auto shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {voiceAccessState === 'granted' ? (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal"></span>
                    </span>
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                  )}
                  <span className="text-[7.5px] font-display font-black text-[#30e8c0] tracking-widest uppercase flex items-center gap-1">
                    🎤 VOICE SYSTEM
                  </span>
                </div>
                <button
                  onClick={() => {
                    playSynthBeep(440, 0.1, 'sine', 0.05);
                    if (voiceAccessState === 'granted') {
                      setVoiceAccessState('denied');
                    } else if (voiceAccessState === 'denied' || voiceAccessState === 'unprompted') {
                      setVoiceAccessState('prompting');
                    }
                  }}
                  className={`text-[7px] font-mono px-1 border rounded transition-all uppercase cursor-none ${
                    voiceAccessState === 'granted' 
                      ? 'border-[#30e8c0]/20 bg-[#30e8c0]/10 text-[#30e8c0] hover:bg-[#30e8c0]/20'
                      : 'border-[#ff4433]/20 bg-[#ff4433]/5 text-[#ff4433] hover:bg-[#ff4433]/15'
                  }`}
                  title={voiceAccessState === 'granted' ? 'Disable Voice System' : 'Request/Enable Voice System'}
                >
                  {voiceAccessState === 'granted' ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="text-[7.5px] font-mono text-slate-400 mt-1 uppercase flex items-center justify-between">
                <span>STATUS:</span>
                <span className={voiceAccessState === 'granted' ? 'text-[#30e8c0] font-black animate-pulse' : 'text-slate-600'}>
                  {voiceAccessState === 'granted' ? voiceRecognitionStatus : 'DISENGAGED'}
                </span>
              </div>

              {voiceAccessState === 'granted' && (
                <div className="mt-1 border-t border-white/5 pt-1 text-[6.5px] font-mono text-slate-500 leading-tight">
                  SAY: <span className="text-gold font-bold">"ACTIVATE WEBCAM"</span> OR <span className="text-gold font-bold font-mono">"ACTIVATE SIMULATOR"</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {userAuth && userAuth.email !== 'guest@universe.io' && !isBiometricVerified && view !== 'welcome' && view !== 'bio' && (
        <HolographicBiometricLock onVerified={() => setIsBiometricVerified(true)} />
      )}

      {/* UNIFIED PERSISTENT BOTTOM LEFT SETTINGS GATEWAY (ACCESSIBLE ACROSS ALL LAYERS) */}
      <div className="fixed bottom-6 left-6 z-[1150]">
        <motion.button
          onClick={() => {
            setIsSettingsOpen(!isSettingsOpen);
            playSynthBeep(440, 0.08, 'sine', 0.08);
          }}
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-xl bg-slate-950/85 border border-[#30e8c0]/40 flex items-center justify-center text-[#30e8c0] shadow-[0_0_15px_rgba(48,232,192,0.15)] backdrop-blur-md hover:border-[#30e8c0] transition-colors cursor-none"
          title="Open Galactic Presets Deck"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[1130] cursor-none"
            />

            {/* Tactical Calibration HUD drawer board */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50, x: -50 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30, x: -30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 180 }}
              className="fixed bottom-20 left-6 z-[1140] w-[355px] h-[480px] bg-slate-950/98 border border-[#30e8c0]/25 rounded-2xl p-5 shadow-[0_0_50px_rgba(48,232,192,0.18)] select-none flex flex-col justify-between overflow-hidden relative"
            >
              {/* Futuristic details and glow rails */}
              <div className="absolute left-0 inset-y-0 w-1 bg-[#30e8c0]" />
              <div className="absolute top-2 right-2 text-[6px] font-mono text-slate-500">SECT_SETTINGS_DECK_V4</div>

              {/* Head line */}
              <div className="border-b border-white/5 pb-2.5 flex items-center justify-between text-left">
                <div>
                  <h2 className="text-xs font-display font-black text-white tracking-[3px] uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#30e8c0]" /> TACTICAL SETTINGS
                  </h2>
                  <span className="text-[7.5px] font-mono text-slate-400 uppercase tracking-widest block mt-0.5">
                    Calibration control console
                  </span>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[#30e8c0] hover:text-white font-mono text-[9px] px-1 bg-white/5 hover:bg-white/10 rounded cursor-none"
                >
                  [CLOSE]
                </button>
              </div>

              {/* Setting Panels sections list */}
              <div className="flex-grow overflow-y-auto space-y-4 pt-3.5 pr-1 custom-scroll text-left">
                
                {/* 1. Profile Panel */}
                <div className="space-y-2">
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-0.5">
                    [01] CADET PROFILE TELEMETRY
                  </span>
                  <div className="bg-white/2 border border-white/5 p-2.5 rounded-xl space-y-1.5 font-mono text-[8px] text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>COGNITIVE CONTACT:</span>
                      <span className="text-white font-bold uppercase">{userAuth ? userAuth.name : 'GUEST EXPLORER'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>EMAIL FREQUENCY:</span>
                      <span className="text-[#30e8c0] font-medium break-all max-w-[150px] text-right">{userAuth ? userAuth.email : 'guest@universe.io'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[7.5px] text-slate-400 mt-1 border-t border-white/5 pt-1">
                      <span>TACTICAL COORDINATE</span>
                      <span className="text-gold font-bold">ORION GRID SEC-4</span>
                    </div>
                  </div>
                </div>

                {/* 2. Hand/Keyboard gestures panel */}
                <div className="space-y-2">
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-0.5">
                    [02] CONSOLE GESTURES SCHEMATICS
                  </span>

                  <div className="space-y-1.5">
                    <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wider block">🖐️ WEBCAM HAND GESTURING CALBRATIONS</span>
                    <div className="grid grid-cols-1 gap-1 font-mono text-[7px] text-slate-400">
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <span className="text-white font-bold">POINT (👉)</span>
                        <span>Move cursor / select coordinates</span>
                      </div>
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <span className="text-teal font-bold">PINCH (👌)</span>
                        <span>Grab planet templates / lock radars</span>
                      </div>
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <span className="text-gold font-bold">THUMBS DOWN / FIST (👎)</span>
                        <span>Confirm locks / drill down layers</span>
                      </div>
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <span className="text-red font-bold">OPEN PALM (🖐️)</span>
                        <span>Elevate navigation depth / back</span>
                      </div>
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <span className="text-blue-300 font-bold">PEACE (✌️)</span>
                        <span>Toggle dynamic HUD overlay grid</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wider block">⌨️ MANUAL KEYBOARD SHORTCUT PRESENTS</span>
                    <div className="grid grid-cols-1 gap-1 font-mono text-[7px] text-slate-400">
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <kbd className="text-white font-bold bg-white/10 px-1 rounded">1 - 5</kbd>
                        <span>Trigger simulated hands in sandbox</span>
                      </div>
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <kbd className="text-white font-bold bg-white/10 px-1.5 rounded">Enter</kbd>
                        <span>Lock telemetry indexes / click</span>
                      </div>
                      <div className="p-1.5 bg-white/2 rounded flex justify-between items-center border border-white/5">
                        <kbd className="text-white font-bold bg-white/10 px-1 rounded">Backspace</kbd>
                        <span>Egress navigation range boundaries</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. AI setting panel */}
                <div className="space-y-2">
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-0.5">
                    [03] AI COGNITIVE SECTOR CALIBRATION
                  </span>
                  <div className="space-y-3 p-2 bg-white/2 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <label className="text-[7.5px] font-mono text-slate-400 block uppercase">COG APPARAL LLM MODEL</label>
                      <select 
                        value={geminiModel} 
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 p-1 rounded font-mono text-[8px] text-white focus:outline-none focus:border-[#30e8c0] cursor-none"
                      >
                        <option value="Gemini 2.0 Flash">Gemini 2.0 Flash (Recommended)</option>
                        <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep Research)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400">
                        <span>AI QUANTUM BYPASS (TEMP):</span>
                        <span className="text-gold font-bold">{aiTemperature}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.1" 
                        max="1.5" 
                        step="0.1"
                        value={aiTemperature} 
                        onChange={(e) => setAiTemperature(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-none accent-[#30e8c0]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Jarvis speech speed & mute */}
                <div className="space-y-2">
                  <span className="text-[7px] font-mono text-slate-500 uppercase tracking-widest block border-b border-white/5 pb-0.5">
                    [04] J.A.R.V.I.S COMPANION MATRIX
                  </span>
                  <div className="space-y-3 p-2 bg-white/2 rounded-xl border border-white/5">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[7.5px] font-mono text-slate-400">
                        <span>VIRTUAL DIALOGUE SPEED:</span>
                        <span className="text-white font-bold">{jarvisSpeed}x</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5" 
                        max="2.0" 
                        step="0.25"
                        value={jarvisSpeed} 
                        onChange={(e) => setJarvisSpeed(parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-none accent-[#30e8c0]"
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-300">
                      <span>VOICE SYNTHESIS DRIVER</span>
                      <button
                        onClick={() => {
                          setJarvisMuted(!jarvisMuted);
                          playSynthBeep(415, 0.08, 'sine', 0.05);
                        }}
                        className={`px-1.5 py-0.5 rounded border uppercase flex items-center gap-1 cursor-none text-[7px] font-bold ${
                          jarvisMuted
                            ? 'border-red/20 bg-red/10 text-red hover:bg-red/20'
                            : 'border-[#30e8c0]/20 bg-[#30e8c0]/10 text-[#30e8c0] hover:bg-[#30e8c0]/10'
                        }`}
                      >
                        {jarvisMuted ? 'MUTED' : 'ENGAGED'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Sign out bottom button */}
              <div className="border-t border-white/5 pt-3 flex justify-between gap-2 z-10 select-none">
                <button
                  onClick={() => {
                    playSynthBeep(220, 0.3, 'sawtooth', 0.1);
                    setIsSettingsOpen(false);
                    setUserAuth(null);
                    setIsBiometricVerified(false);
                    setView('welcome');
                  }}
                  className="w-full py-1.5 px-3 bg-[#ff4433]/10 hover:bg-[#ff4433]/20 border border-[#ff4433]/30 hover:border-[#ff4433]/80 rounded-xl text-[8.5px] font-mono text-[#ff4433] font-black uppercase tracking-[2px] transition-all cursor-none select-none flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3 h-3" /> WIPE PROFILE & SYSTEM SIGN OUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

