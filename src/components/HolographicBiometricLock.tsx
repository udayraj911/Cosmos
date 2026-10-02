import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Lock, Unlock, AlertTriangle, ShieldCheck, User, Mail, Sparkles, RefreshCw } from 'lucide-react';
import { playSynthBeep, playSuccessChime, playScannerSweep, playErrorBuzz } from '../utils/audio';

interface HolographicBiometricLockProps {
  onVerified: () => void;
}

export function HolographicBiometricLock({ onVerified }: HolographicBiometricLockProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredProfile, setRegisteredProfile] = useState<{ email: string; name: string } | null>(null);
  
  // Scanners / key portal wizard state
  const [portalMode, setPortalMode] = useState<'scan' | 'register'>('scan');
  
  // Registration Inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  
  // Scanning States
  const [scanProgress, setScanProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('System Ready - Place Thumb on sensor to scan');
  const [triggerMismatch, setTriggerMismatch] = useState(false); // To test incorrect biometric reading

  const scanIntervalRef = useRef<any>(null);

  // Sync state with localStorage state on load
  useEffect(() => {
    try {
      const savedBio = localStorage.getItem('cosmos_registered_fingerprint_user');
      if (savedBio) {
        const profile = JSON.parse(savedBio);
        setRegisteredProfile(profile);
        setIsRegistered(true);
        setPortalMode('scan');
      } else {
        setIsRegistered(false);
        setPortalMode('register');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePortalSwitch = () => {
    playSynthBeep(480, 0.1, 'sine', 0.08);
    setScanProgress(0);
    setScanError(null);
    if (portalMode === 'scan') {
      setPortalMode('register');
    } else {
      setPortalMode('scan');
    }
  };

  // Start Fingerprint scanner protocol (triggers on press & hold)
  const startScanning = () => {
    if (isScanning) return;
    
    // If we're in register mode but haven't supplied credentials
    if (portalMode === 'register' && (!regName.trim() || !regEmail.trim())) {
      setScanError('Key Portal registers require Commander credentials first.');
      playErrorBuzz();
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanError(null);
    playScannerSweep();
    playSynthBeep(520, 0.1, 'sine', 0.1);

    if (portalMode === 'register') {
      setScanMessage('Calibrating cellular tactile sensors...');
    } else {
      setScanMessage(`Matching bioprint against database vector: [${registeredProfile?.name || 'CAPTAIN'}]`);
    }

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 5;
      if (progress >= 100) {
        progress = 100;
        setScanProgress(100);
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
        setIsScanning(false);
        
        finalizeAuthentication();
      } else {
        setScanProgress(progress);
        if (progress % 15 === 0) {
          playSynthBeep(520 + progress * 3, 0.04, 'sine', 0.05);
          if (progress % 30 === 0) {
            playScannerSweep();
          }
        }
      }
    }, 80);
  };

  const cancelScanning = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (isScanning) {
      setIsScanning(false);
      setScanProgress(0);
      setScanMessage('Telemetry disrupted. Scan canceled.');
      playErrorBuzz();
    }
  };

  const finalizeAuthentication = () => {
    if (portalMode === 'register') {
      // Complete registration process
      try {
        const bioprintInfo = { email: regEmail.trim(), name: regName.trim() };
        localStorage.setItem('cosmos_registered_fingerprint_user', JSON.stringify(bioprintInfo));
        
        // Also seed general user system
        const usersStr = localStorage.getItem('cosmos_registered_users') || '{}';
        const users = JSON.parse(usersStr);
        users[bioprintInfo.email.toLowerCase()] = {
          email: bioprintInfo.email,
          name: bioprintInfo.name,
          password: 'biometric-lock-registered',
          sector: 'Sector Alpha Grid-3'
        };
        localStorage.setItem('cosmos_registered_users', JSON.stringify(users));

        setRegisteredProfile(bioprintInfo);
        setIsRegistered(true);
        playSuccessChime();
        setScanMessage('Tactile fingerprint mapping registered securely.');
        
        // Redirect back to scan in 1.2s
        setTimeout(() => {
          setPortalMode('scan');
          setScanProgress(0);
          setScanMessage('Place registered finger to scan coordinates');
        }, 1200);

      } catch (err) {
        console.error(err);
        setScanError('Failed to enroll biometric in database.');
        playErrorBuzz();
      }
    } else {
      // In Scan authentication verification mode
      if (triggerMismatch) {
        // Simulated incorrect fingerprint
        playErrorBuzz();
        setScanAttempts(prev => prev + 1);
        setScanError('TACTILE SIGNATURE ERROR: MATCH DEVIATION > 45%! ACCESS DENIED.');
        setScanMessage('Biometric signature incorrect.');
      } else {
        // Correct scan authentication!
        playSuccessChime();
        setScanMessage('SIGNATURE AFFIRMED. CYBER WORKSPACE ONLINE.');
        setTimeout(() => {
          onVerified();
        }, 1200);
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-slate-950/85 backdrop-blur-xl z-[99999] flex items-center justify-center p-4">
      
      {/* Interactive holographic cyber-frame */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel max-w-lg w-full border border-blue/20 bg-slate-950/90 rounded-3xl p-6 md:p-8 flex flex-col gap-6 text-center shadow-[0_0_50px_rgba(43,158,255,0.25)] relative"
      >
        
        {/* Futuristic glowing geometric corner ornaments */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue opacity-40"></div>
        <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue opacity-40"></div>
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue opacity-40"></div>
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue opacity-40"></div>

        {/* Header HUD Status indicator */}
        <div className="flex flex-col items-center gap-1.5 border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange"></span>
            </span>
            <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">DECK PATROL SECURITY PORTAL (LEVEL 3)</span>
          </div>
          <h2 className="font-display font-black text-lg tracking-widest text-[#f0ead8] uppercase">
            🛡️ COSMIC IMMIGRATION interlock
          </h2>
        </div>

        {/* Mode Toggle Description */}
        <div>
          {portalMode === 'register' ? (
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-sm mx-auto">
              No registered biometric key detected in this browser profile. Please open the key portal enrollment below to scan and lock down your digital coordinate parameters.
            </p>
          ) : (
            <p className="text-[11px] font-mono text-slate-400 leading-relaxed max-w-sm mx-auto">
              Tactical control deck is locked behind biometric telemetry. Hold your finger on the touch sensor below to authenticate workspace entry.
            </p>
          )}
        </div>

        {/* CENTRAL SENSOR INTERACTION AREA */}
        <div className="flex flex-col items-center justify-center py-4 bg-[#030614]/60 border border-white/5 rounded-2xl relative overflow-hidden">
          
          {/* Neon laser sweeps simulation when scanning */}
          <AnimatePresence>
            {isScanning && (
              <motion.div
                initial={{ top: '0%' }}
                animate={{ top: '100%' }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#4ab8ff] to-transparent shadow-[0_0_12px_#4ab8ff] z-20 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Central Fingering Widget circular slot */}
          <button
            onMouseDown={startScanning}
            onMouseUp={cancelScanning}
            onMouseLeave={cancelScanning}
            onTouchStart={startScanning}
            onTouchEnd={cancelScanning}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform select-none cursor-pointer focus:outline-none ${
              isScanning
                ? 'border-blue bg-blue/10 scale-105 shadow-[0_0_30px_rgba(74,184,255,0.45)]'
                : portalMode === 'register'
                  ? 'border-amber/40 bg-amber/5 hover:border-amber hover:bg-amber/10 text-amber'
                  : 'border-teal/40 bg-teal/5 hover:border-teal hover:bg-teal/10 text-teal'
            }`}
          >
            {/* Ambient scan helper ring */}
            <div className={`absolute inset-1 rounded-full border border-dashed animate-spin ${isScanning ? 'border-blue opacity-50' : 'border-white/5 opacity-20'}`} style={{ animationDuration: '8s' }} />

            <div className="flex flex-col items-center gap-1">
              <Fingerprint className={`w-14 h-14 ${isScanning ? 'animate-pulse text-blue' : portalMode === 'register' ? 'text-amber' : 'text-teal'}`} />
              <span className="text-[7.5px] font-mono tracking-widest text-slate-400 font-bold uppercase">PRESS & HOLD</span>
            </div>

            {/* Glowing fill path visualization */}
            {isScanning && (
              <svg className="absolute inset-0 w-full h-full -rotate-95">
                <circle
                  cx="56"
                  cy="56"
                  r="52"
                  fill="none"
                  stroke="#4ab8ff"
                  strokeWidth="3.2"
                  strokeDasharray="327"
                  strokeDashoffset={327 - (327 * scanProgress) / 100}
                  className="transition-all duration-75"
                />
              </svg>
            )}
          </button>

          {/* Core Telemetry feedback texts */}
          <div className="mt-4 px-4 text-center">
            <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">TELEMETRY DECODING MATRIX</div>
            <div className={`text-[11px] font-mono mt-1 font-bold ${scanError ? 'text-red animate-bounce' : isScanning ? 'text-blue animate-pulse' : 'text-[#30e8c0]'}`}>
              {scanError || scanMessage}
            </div>

            {isScanning && (
              <div className="w-40 bg-slate-900 border border-white/5 h-2 rounded-full overflow-hidden mx-auto mt-2.5">
                <div
                  style={{ width: `${scanProgress}%` }}
                  className="h-full bg-blue transition-all duration-75"
                />
              </div>
            )}
          </div>
        </div>

        {/* REGISTER SECTION INPUTS (IF REGISTER MODE ACTIVE) */}
        {portalMode === 'register' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-3 text-left bg-slate-900/60 p-4 border border-white/5 rounded-2xl"
          >
            <div className="text-[8px] font-mono text-amber tracking-widest uppercase font-bold flex items-center gap-1 pb-1 border-b border-white/5">
              <Sparkles className="w-3 h-3" /> BIOMETRIC PORTAL GATE REGISTER WIZARD
            </div>

            <div className="flex flex-col gap-1.5 mt-1">
              <label className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">COMMANDER NAME</label>
              <div className="relative">
                <User className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-600" />
                <input
                  type="text"
                  placeholder="e.g. Commander J. Cooper"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs p-2 pl-9 bg-slate-950/80 border border-white/5 rounded-xl text-cream focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/30 transition-all font-sans"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">BIOGRAPHIC SECURE EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-600" />
                <input
                  type="email"
                  placeholder="e.g. cooper@interstellar.net"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full text-xs p-2 pl-9 bg-slate-950/80 border border-white/5 rounded-xl text-cream focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/30 transition-all font-sans"
                />
              </div>
            </div>
            
            <p className="text-[8.5px] font-sans text-slate-500 italic text-center mt-1">
              Fill details first, then Hold Thumb on sensor above to enroll biometrics.
            </p>
          </motion.div>
        )}

        {/* CORRECT VS INCORRECT INTEGRATION TESTING UTILITIES */}
        {portalMode === 'scan' && (
          <div className="bg-slate-900/50 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <input
                id="lockout-trigger-mismatch"
                type="checkbox"
                checked={triggerMismatch}
                onChange={(e) => {
                  setTriggerMismatch(e.target.checked);
                  playSynthBeep(e.target.checked ? 320 : 560, 0.1, 'sine', 0.08);
                }}
                className="w-4 h-4 rounded text-blue border-white/10 bg-slate-950 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="lockout-trigger-mismatch" className="text-[10px] font-mono text-slate-300 uppercase tracking-wider cursor-pointer">
                Simulate Incorrect Scan (Match Failure)
              </label>
            </div>
            {triggerMismatch && (
              <span className="text-[7.5px] font-mono bg-red/10 border border-red/40 text-red px-2 py-0.5 rounded uppercase animate-pulse">
                ❌ MISMATCH ENABLED
              </span>
            )}
          </div>
        )}

        {/* PRIMARY SWITCHES AND BACKING ACCESS LIMITS */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {isRegistered && (
            <button
              onClick={handlePortalSwitch}
              className={`p-3 text-[9.5px] font-display font-black tracking-widest uppercase rounded-xl transition-all w-full flex items-center justify-center gap-2 border cursor-none ${
                portalMode === 'scan'
                  ? 'border-amber/20 bg-amber/5 hover:bg-amber/15 text-amber hover:border-amber'
                  : 'border-teal/20 bg-teal/5 hover:bg-teal/15 text-teal hover:border-teal'
              }`}
            >
              {portalMode === 'scan' ? (
                <>🔧 GO TO KEY PORTAL (REGISTRATION)</>
              ) : (
                <>🔒 GO TO BIOMETRIC DECK ACCESS SCANNER</>
              )}
            </button>
          )}

          {!isRegistered && (
            <div className="text-[10.5px] font-mono text-amber border border-amber/30 bg-amber/5 p-3 rounded-xl uppercase tracking-wider w-full text-center font-bold">
              ⚠️ GUEST: REGISTRATION PROTOCOL MANDATORY FOR CORE NAVIGATION SYSTEM
            </div>
          )}
        </div>

        {/* Registered User Profile Badges */}
        {isRegistered && registeredProfile && (
          <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[9px] font-mono text-slate-500">
            <span>SECURE IDENTITY LOCKED:</span>
            <span className="text-[#30e8c0] font-black uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {registeredProfile.name} ({registeredProfile.email})
            </span>
          </div>
        )}

      </motion.div>
    </div>
  );
}
