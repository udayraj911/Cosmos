import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Terminal, X, Shield, Cpu, Minimize2, MessagesSquare, RefreshCw, Hammer, HardHat, Info } from 'lucide-react';
import { playSynthBeep, playSuccessChime, playScannerSweep } from '../utils/audio';

interface FloatingJarvisProps {
  currentLayerName: string;
}

interface Message {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
}

export const FloatingJarvis: React.FC<FloatingJarvisProps> = ({ currentLayerName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'builder'>('chat');
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'jarvis',
      text: `Sensor check complete. Holographic connection established on ${currentLayerName}. I am J.A.R.V.I.S., your virtual tactical companion. State, chat, or builder presets are armed.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Track layer changes to update Jarvis state
  useEffect(() => {
    if (messages.length > 0) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages(prev => [
        ...prev,
        {
          id: `nav-${Date.now()}`,
          sender: 'jarvis',
          text: `[SYSTEM] J.A.R.V.I.S. has glided with you to: ${currentLayerName.toUpperCase()}. Core state synched.`,
          timestamp,
        }
      ]);
      if (!isOpen) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [currentLayerName]);

  // Conversational Natural Language Parser
  const parseNaturalLanguage = (text: string) => {
    const lower = text.toLowerCase();
    let entityType: 'Planet' | 'Black Hole' | 'Wormhole' = 'Planet';
    if (lower.includes('black hole') || lower.includes('blackhole') || lower.includes('anomaly') || lower.includes('singularity')) {
      entityType = 'Black Hole';
    } else if (lower.includes('link') || lower.includes('bridge') || lower.includes('wormhole') || lower.includes('tunnel') || lower.includes('portal')) {
      entityType = 'Wormhole';
    }
    
    // Extract gravity / mass intensity
    let gravity = 9.8;
    const gravityMatch = lower.match(/(?:gravity|intensity|force|mass)\s*(?:of|is|at)?\s*(\d+(?:\.\d+)?)/);
    if (gravityMatch) {
      gravity = parseFloat(gravityMatch[1]);
    } else {
      // Default depending on type
      if (entityType === 'Black Hole') gravity = 45.0;
      else if (entityType === 'Wormhole') gravity = 25.0;
    }
    
    // Extract custom color/atmosphere
    let color = '#30e8c0';
    let atmosphere = 'Standard Gas';
    
    if (lower.includes('plasma') || lower.includes('fiery') || lower.includes('fire') || lower.includes('hot')) {
      color = '#ffaa00';
      atmosphere = 'Fierce Plasma Core';
    } else if (lower.includes('neon') || lower.includes('green') || lower.includes('toxic') || lower.includes('radiation')) {
      color = '#30e8c0';
      atmosphere = 'Neon Radioactive Mesh';
    } else if (lower.includes('blue') || lower.includes('frozen') || lower.includes('ice') || lower.includes('methane')) {
      color = '#4ab8ff';
      atmosphere = 'Condensed Methane Ice';
    } else if (lower.includes('gold') || lower.includes('solar') || lower.includes('stellar')) {
      color = '#e8b84b';
      atmosphere = 'Hyper-dense Solar Core';
    } else if (lower.includes('dark') || lower.includes('void') || lower.includes('purple')) {
      color = '#8a2be2';
      atmosphere = 'Vacuum Dark Matter Fluctuation';
    } else if (lower.includes('magenta') || lower.includes('pink')) {
      color = '#ff44aa';
      atmosphere = 'Vaporized Mercury Shell';
    }

    // Extract custom Name
    let name = '';
    const nameMatch = lower.match(/(?:name|named|called|title)\s*([a-zA-Z0-9\s-]+)/);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      // Descriptive automatic naming of forged objects
      if (entityType === 'Black Hole') {
        name = `Singularity-${Math.floor(Math.random() * 800 + 100)}`;
      } else if (entityType === 'Wormhole') {
        name = `BridgePortal-${Math.floor(Math.random() * 90 + 10)}`;
      } else {
        const prefixes = ['Vortex', 'Krypton', 'Nebula', 'Genesis', 'Chronos', 'Aero'];
        const randPre = prefixes[Math.floor(Math.random() * prefixes.length)];
        name = `${randPre} Corp-${Math.floor(Math.random() * 900 + 100)}`;
      }
    }

    // Extract dimensions or slots for wormhole linking
    let slotA = 'Centauri Nexus';
    let slotB = 'Primordial Void';
    const linkMatch = lower.match(/(?:between|link|connect)\s+([a-zA-Z0-9\s-]+)\s+(?:and|to)\s+([a-zA-Z0-9\s-]+)/);
    if (linkMatch) {
      slotA = linkMatch[1].trim();
      slotB = linkMatch[2].trim();
    }

    return { entityType, name, gravity, color, atmosphere, slotA, slotB };
  };

  const currentParse = parseNaturalLanguage(inputValue);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setIsLoading(true);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: userText,
      timestamp,
    };

    setMessages(prev => [...prev, newMsg]);

    const lower = userText.toLowerCase();
    
    // Check for webcam or voice command repair requests
    const isWebcamRepair = (lower.includes('fix') || lower.includes('repair') || lower.includes('broken') || lower.includes('not work') || lower.includes('reconnect')) && (lower.includes('webcam') || lower.includes('camera') || lower.includes('cam'));
    const isVoiceRepair = (lower.includes('fix') || lower.includes('repair') || lower.includes('broken') || lower.includes('not work') || lower.includes('reconnect') || lower.includes('grant') || lower.includes('allow')) && (lower.includes('voice') || lower.includes('speech') || lower.includes('mic') || lower.includes('microphone'));
    const isActivateWebcam = lower === 'activate webcam' || lower === 'start webcam' || lower === 'open camera';
    const isActivateSimulator = lower === 'activate simulator' || lower === 'start simulator' || lower === 'open simulator';

    if (isWebcamRepair || isActivateWebcam) {
      setIsLoading(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('ai-repair-webcam'));
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'jarvis',
            text: "[AI RECOVERY ARMED] Commander, physical webcam access request detected. Re-evaluating camera telemetry streams and activating the interactive system hand tracker.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setIsLoading(false);
      }, 600);
      return;
    }

    if (isVoiceRepair || isActivateSimulator) {
      setIsLoading(true);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(isActivateSimulator ? 'ai-activate-simulator' : 'ai-repair-voice'));
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            sender: 'jarvis',
            text: isActivateSimulator 
              ? "[SYSTEM OVERRIDE] Virtual simulator activated. Key mappings and touch gesture presets are loaded to assist control deck navigation."
              : "[AI GESTALT CONNECTED] Ambient voice decoder synched. Standard speech registration overrides are currently bound.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
        setIsLoading(false);
      }, 600);
      return;
    }

    // Interactive parser check: parses planets, blackholes, and wormholes
    const parsed = parseNaturalLanguage(userText);
    const isBuilderTrigger = lower.includes('create') || lower.includes('synthesize') || lower.includes('make') || lower.includes('forge') || lower.includes('spawn') || lower.includes('link') || lower.includes('bridge') || lower.includes('wormhole') || lower.includes('tunnel');

    if (isBuilderTrigger) {
      setTimeout(() => {
        if (parsed.entityType === 'Wormhole') {
          // Send link request
          window.dispatchEvent(new CustomEvent('jarvis-builder-command', {
            detail: {
              action: 'bridge-universes',
              slotA: parsed.slotA,
              slotB: parsed.slotB,
              type: 'Einstein-Rosen Wormhole'
            }
          }));
          
          setMessages(prev => [
            ...prev,
            {
              id: String(Date.now() + 5),
              sender: 'jarvis',
              text: `[PORTAL GATEWAY ESTABLISHED] Traversable wormhole initialized. Connected dimension terminals linking matches: "${parsed.slotA.toUpperCase()}" ⇄ "${parsed.slotB.toUpperCase()}". Spacetime bridge coordinates programmed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        } else {
          // Send celestial body creation request
          window.dispatchEvent(new CustomEvent('jarvis-builder-command', {
            detail: {
              action: 'create-celestial',
              bodyType: parsed.entityType,
              name: parsed.name,
              color: parsed.color,
              gravity: parsed.gravity,
              size: parsed.entityType === 'Black Hole' ? 3.0 : 1.5,
              mass: parsed.gravity * 4.5
            }
          }));

          setMessages(prev => [
            ...prev,
            {
              id: String(Date.now() + 5),
              sender: 'jarvis',
              text: `[SYNTHESIS PROTOCOL COGNATED] Forged new ${parsed.entityType.toUpperCase()} named "${parsed.name.toUpperCase()}". Mass constants computed at ${parsed.gravity.toFixed(1)} m/s² with a "${parsed.atmosphere}" layout. Check system dashboard to orbital dock it!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          ]);
        }
        playSuccessChime();
        setIsLoading(false);
      }, 600);
      return;
    }

    // Default conversational chat proxy
    try {
      const state = (window as any).__lastUniverseState;
      let planetContext = "";
      if (state && state.userSystem) {
        planetContext = " Currently, our solar system contains these active celestial bodies: " +
          state.userSystem.map((p: any) => `${p.name} (type: ${p.type || 'Planet'}, color: ${p.color || '#ffffff'}, gravity: ${p.gravity || 9.8} m/s², size: ${p.size || 1}, mass: ${p.mass || 10} kg, atmosphere: "${p.atmosphere || 'Standard Nitrogen-Oxygen'}")`).join(", ") + ". " +
          "You must be aware of these celestial status parameters and refer to them accurately, by their real current properties, whenever the Commander asks questions about them or asks you what you made!";
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          systemInstruction: `You are J.A.R.V.I.S., space station AI companion. Current station level: '${currentLayerName}'.${planetContext}
          You can parse physical system creations in natural language: e.g. "Forge fiery planet named Pyro" or "Bridge Orion and void with a wormhole".
          Keep response under 80 words, crisp, highly intelligent, scientific and futuristic. Remember that you are known to everything you have made!`
        }),
      });

      if (!response.ok) throw new Error('API failure');
      const data = await response.json();
      
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'jarvis',
          text: data.text || "Disruption in signal array, Commander.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (err) {
      setTimeout(() => {
        let text = "";
        const lowerText = userText.toLowerCase();
        const state = (window as any).__lastUniverseState;
        
        if (lowerText.includes('planet') || lowerText.includes('stellar') || lowerText.includes('body') || lowerText.includes('what did you make') || lowerText.includes('properties') || lowerText.includes('gravity') || lowerText.includes('atmosphere')) {
          if (state && state.userSystem && state.userSystem.length > 1) {
            const list = state.userSystem.map((p: any) => `${p.name} (Atmosphere: "${p.atmosphere || 'Gaseous'}", Gravity: ${p.gravity || 9.8} m/s², Color: ${p.color || 'unspecified'}, Mass: ${p.mass || 'N/A'})`).join(", ");
            text = `Commander, I have audited our gravitational system telemetry. It currently hosts these stellar-bodies: ${list}. Each operates with balanced orbit markers according to their mass indices.`;
          } else {
            text = `Stellar records indicate our solar system has only the core star right now. Simply command me in chat to forge more, for example: "Forge carbon planet named Xenon with gravity 12.5"!`;
          }
        } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('greetings')) {
          text = `Greetings, Commander! J.A.R.V.I.S. system fully operational. Scanning all localized thermal coils and space gates. Ready to forge epic custom planets or tunnel spacetime wormholes on your directive!`;
        } else if (lowerText.includes('who are you') || lowerText.includes('name')) {
          text = `I am J.A.R.V.I.S., your companion virtual astronautic intelligence. I control solar synthesis pathways, relativistic wormhole gateways, and workspace telemetry.`;
        } else if (lowerText.includes('universe') || lowerText.includes('galaxy') || lowerText.includes('system') || lowerText.includes('physics')) {
          text = `System physics grids are stabilized. Our interactive cosmic simulator supports standard orbit allocations. Would you like me to forge a new celestial body, Commander?`;
        } else {
          const defaultResponses = [
            `Understood, Commander. Mapping coordinates for: "${userText}". Starfield sectors are holding within nominal levels.`,
            `Telemetry cached for "${userText}". Our fusion cores are balanced. Command me to: "Forge toxic planet named Xenon with gravity 15" to spawn worlds immediately.`,
            `Station database logged: "${userText}". All active wormholes are secure. Shall we link Centauri Nexus and Primordial Void, Commander?`
          ];
          text = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }

        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 2),
            sender: 'jarvis',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const selectSuggestion = (phrase: string) => {
    setInputValue(phrase);
    playSynthBeep(480, 0.08, 'sine', 0.05);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-3 pointer-events-auto select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 220 }}
            className="w-[335px] h-[480px] glass-panel rounded-2xl border border-blue/20 bg-slate-950/95 flex flex-col justify-between overflow-hidden relative shadow-[0_0_50px_rgba(4,7,22,0.95)] animate-slide-in"
          >
            {/* Sci-fi top header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/40 select-none">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="w-2 h-2 rounded-full bg-teal block animate-pulse"></span>
                  <span className="absolute -inset-0.5 rounded-full bg-teal/50 animate-ping"></span>
                </div>
                <div>
                  <div className="text-[10px] font-display font-black text-[#30e8c0] tracking-widest uppercase flex items-center gap-1">
                    J.A.R.V.I.S. <span className="bg-blue/20 text-[7px] text-blue-300 px-1 py-0.2 rounded font-mono font-normal">v3.5</span>
                  </div>
                  <div className="text-[7.5px] text-slate-500 font-mono tracking-wider uppercase">
                    Companion Active • {currentLayerName.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    setActiveMode(activeMode === 'chat' ? 'builder' : 'chat');
                    playSynthBeep(520, 0.06, 'sine', 0.04);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 border cursor-none ${
                    activeMode === 'builder'
                      ? 'bg-teal/15 text-teal border-teal/30 font-black'
                      : 'bg-white/5 text-slate-500 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Hammer className="w-2.5 h-2.5" /> Builder
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all cursor-none text-[8.5px] font-mono"
                  title="Minimize AI Deck"
                >
                  [X]
                </button>
              </div>
            </div>

            {/* Cyber Grid ambient background */}
            <div className="absolute inset-x-0 top-12 bottom-12 bg-grid-pattern pointer-events-none opacity-5"></div>

            {/* MAIN LAYER SWITCHER */}
            {activeMode === 'chat' ? (
              /* Scrolling speech database log */
              <div 
                ref={scrollRef}
                className="flex-grow p-4 overflow-y-auto space-y-3.5 custom-scroll relative z-10"
              >
                {messages.map((m) => {
                  const isJarvis = m.sender === 'jarvis';
                  const isSystem = m.text.startsWith('[SYSTEM]') || m.text.startsWith('[PORTAL') || m.text.startsWith('[SYNTHESIS');
                  return (
                    <div 
                      key={m.id}
                      className={`flex flex-col ${isJarvis ? 'items-start' : 'items-end'}`}
                    >
                      {isSystem ? (
                        <div className="w-full text-center px-3 py-1.5 bg-[#30e8c0]/5 border border-[#30e8c0]/15 rounded-lg text-[8px] font-mono text-[#30e8c0] tracking-wide uppercase select-none leading-relaxed">
                          {m.text}
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 mb-1 select-none">
                            <span className={`text-[8px] font-mono tracking-wider ${isJarvis ? 'text-teal' : 'text-gold'}`}>
                              {isJarvis ? '🤖 J.A.R.V.I.S.' : '👨‍🚀 EXPLORER'}
                            </span>
                            <span className="text-[7px] text-slate-600 font-mono">{m.timestamp}</span>
                          </div>
                          <div className={`p-2.5 rounded-xl text-[10px] font-sans leading-relaxed transition-all break-words max-w-[85%] ${
                            isJarvis 
                              ? 'bg-slate-900/90 border border-blue/15 text-slate-200' 
                              : 'bg-gold/10 border border-gold/25 text-cream font-medium'
                          }`}>
                            {m.text}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-teal p-1 select-none animate-pulse">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#30e8c0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#30e8c0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-[#30e8c0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-[8px] font-mono uppercase tracking-wider">De-scrambling Quantum Waves...</span>
                  </div>
                )}
              </div>
            ) : (
              /* Dedicated UNIVERSE BUILDER Visual Parameter Parser Core */
              <div className="flex-grow p-4 overflow-y-auto space-y-4 custom-scroll relative z-10 bg-[#020512]/50">
                <div className="p-3 bg-slate-950/90 border border-teal/10 rounded-xl">
                  <div className="text-[8.5px] font-mono text-[#30e8c0] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3 h-3 text-gold animate-bounce" /> UNIVERSE BUILDER ENGINE
                  </div>
                  <p className="text-[9.5px] font-sans text-slate-400 leading-normal mt-1.5">
                    JARVIS is monitoring this command interface. Type natural request prompts, specify physical parameters, or click templates below to initiate stellar births!
                  </p>
                </div>

                {/* QUANTUM REALTIME PARSER HUDBACK */}
                <div className="p-3 bg-slate-950 border border-white/5 rounded-xl space-y-2.5">
                  <span className="text-[7.5px] text-slate-500 font-mono tracking-widest uppercase block border-b border-white/5 pb-1 select-none">
                    QUANTUM REALTIME PARSE PREVIEW
                  </span>

                  <div className="grid grid-cols-2 gap-2 text-left font-mono">
                    <div className="p-1.5 bg-white/5 rounded">
                      <span className="text-[7px] text-slate-500 block">ENTITY OBJECT</span>
                      <span className={`text-[10px] font-bold uppercase ${
                        currentParse.entityType === 'Black Hole' ? 'text-red' : currentParse.entityType === 'Wormhole' ? 'text-purple-400' : 'text-teal'
                      }`}>
                        ⚙️ {currentParse.entityType}
                      </span>
                    </div>
                    <div className="p-1.5 bg-white/5 rounded">
                      <span className="text-[7px] text-slate-500 block">GRAVITY INTENSITY</span>
                      <span className="text-[10px] font-bold text-slate-200">
                        ⚡ {currentParse.gravity.toFixed(1)} m/s²
                      </span>
                    </div>
                    <div className="p-1.5 bg-white/5 rounded">
                      <span className="text-[7px] text-slate-500 block">MASS IDENTITY</span>
                      <span className="text-[9.5px] font-bold whitespace-nowrap text-gold block truncate">
                        🏷️ {currentParse.name}
                      </span>
                    </div>
                    <div className="p-1.5 bg-white/5 rounded">
                      <span className="text-[7px] text-slate-500 block">ATMOSPHERE CORE</span>
                      <span className="text-[9px] font-bold block truncate" style={{ color: currentParse.color }}>
                        🛡️ {currentParse.atmosphere}
                      </span>
                    </div>
                  </div>

                  {currentParse.entityType === 'Wormhole' && (
                    <div className="p-2 bg-purple-500/5 border border-purple-500/25 rounded-lg flex items-center justify-between text-[8px] font-mono leading-relaxed text-purple-200">
                      <span>WORMHOLE ROUTE:</span>
                      <span className="font-bold uppercase text-white tracking-widest">{currentParse.slotA} ⇄ {currentParse.slotB}</span>
                    </div>
                  )}

                  <div className="p-1 bg-teal/5 rounded text-center text-[7px] font-mono text-slate-500">
                    STATUS: READY TO FORGE INTO STELLAR SPACETIME CONTEXT
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions Shelf */}
            <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto py-1 scrollbar-none select-none z-10 border-t border-white/5 bg-[#030615]/85">
              {activeMode === 'chat' ? (
                <>
                  <button
                    onClick={() => selectSuggestion("Explain parallel universes.")}
                    className="whitespace-nowrap px-2 py-1 bg-blue/5 hover:bg-blue/15 border border-blue/20 rounded-lg text-[8px] font-mono text-blue-300 transition-colors cursor-none"
                  >
                    🌌 Exp Multiverse
                  </button>
                  <button
                    onClick={() => selectSuggestion("Tell me about time dilation.")}
                    className="whitespace-nowrap px-2 py-1 bg-teal/5 hover:bg-teal/15 border border-teal/20 rounded-lg text-[8px] font-mono text-teal transition-colors cursor-none"
                  >
                    ⏳ Time Dilation
                  </button>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-gesture-tutorial'));
                      setMessages(prev => [
                        ...prev,
                        {
                          id: String(Date.now()),
                          sender: 'user',
                          text: "Show me the hand gesture tutorial.",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        },
                        {
                          id: String(Date.now() + 1),
                          sender: 'jarvis',
                          text: "Initiating interactive Hand-Scanning Guidance on your screen dashboard modules.",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        }
                      ]);
                    }}
                    className="whitespace-nowrap px-2 py-1 bg-gold/5 hover:bg-gold/15 border border-gold/20 rounded-lg text-[8px] font-mono text-gold transition-colors cursor-none"
                  >
                    🖐️ Gesture Guide
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => selectSuggestion("Forge fiery planet named Phoenix with gravity 16.5")}
                    className="whitespace-nowrap px-2 py-1 bg-orange-500/5 hover:bg-orange-500/15 border border-orange-500/25 rounded-lg text-[8px] font-mono text-orange-400 transition-colors cursor-none"
                  >
                    ☄️ Pyro Planet
                  </button>
                  <button
                    onClick={() => selectSuggestion("Generate extreme black hole named VoidGrip with mass 55")}
                    className="whitespace-nowrap px-2 py-1 bg-violet-500/5 hover:bg-violet-500/15 border border-violet-500/25 rounded-lg text-[8px] font-mono text-violet-400 transition-colors cursor-none"
                  >
                    🕳️ Black Hole
                  </button>
                  <button
                    onClick={() => selectSuggestion("Link Centauri Nexus and Primordial Void using traversable wormhole")}
                    className="whitespace-nowrap px-2 py-1 bg-fuchsia-500/5 hover:bg-fuchsia-500/15 border border-fuchsia-500/25 rounded-lg text-[8px] font-mono text-fuchsia-400 transition-colors cursor-none"
                  >
                    🌌 Wormhole Route
                  </button>
                </>
              )}
            </div>

            {/* Footer Form input */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 border-t border-white/5 bg-slate-900/60 flex gap-2 items-center relative z-10"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={activeMode === 'chat' ? "Query station companion..." : "Command: e.g. 'forge neon planet named...'"}
                className="flex-grow p-2 bg-slate-950/90 border border-white/5 rounded-xl text-xs text-cream placeholder-slate-600 focus:outline-none focus:border-blue/50 focus:ring-1 focus:ring-blue/30 transition-all font-sans"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="p-2 bg-blue/10 hover:bg-blue/20 border border-blue/30 rounded-xl text-blue hover:text-white transition-all cursor-none disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing floating brand icon logo */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`w-12 h-12 rounded-full relative flex items-center justify-center transition-all duration-300 border focus:outline-none shadow-[0_0_20px_rgba(48,232,192,0.3)] pointer-events-auto cursor-none ${
          isOpen 
            ? 'bg-blue/20 border-blue rotate-[360deg]' 
            : 'bg-slate-950/90 border-[#30e8c0]/50 hover:border-[#30e8c0]'
        }`}
      >
        <span className="absolute inset-0 rounded-full bg-teal/15 animate-ping opacity-60"></span>
        <span className="absolute -inset-1 rounded-full border border-teal/10 animate-pulse"></span>

        <MessagesSquare className="w-5 h-5 text-[#30e8c0] relative z-10" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red text-[8px] font-bold font-mono text-white flex items-center justify-center rounded-full animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};
