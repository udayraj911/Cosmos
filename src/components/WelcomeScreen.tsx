import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Sparkles, 
  Terminal, 
  Cpu, 
  Key, 
  UserPlus, 
  Rocket, 
  ArrowRight, 
  Lock, 
  X, 
  Fingerprint, 
  Activity, 
  Globe, 
  Radio, 
  Compass,
  RotateCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  playSynthBeep, 
  playWarpTransition, 
  playSuccessChime, 
  playScannerSweep, 
  playErrorBuzz 
} from '../utils/audio';

interface WelcomeScreenProps {
  onSuccessAuth: (credentials: { email: string; name: string }, authType: 'signup' | 'signin' | 'guest') => void;
  autoOpenAuth?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSuccessAuth, autoOpenAuth = false }) => {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(autoOpenAuth);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'bioprint'>('signup');
  const [typedTitle, setTypedTitle] = useState('');
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Touch Screen / Mobile / Tablet Detection and Fingerprint Scanning States
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [touchScanProgress, setTouchScanProgress] = useState(0);
  const [isTouchScanning, setIsTouchScanning] = useState(false);
  const touchScanIntervalRef = useRef<any>(null);

  // Key Portal Bioprint Registry States
  const [bioprintName, setBioprintName] = useState('');
  const [bioprintEmail, setBioprintEmail] = useState('');
  const [bioprintProgress, setBioprintProgress] = useState(0);
  const [isBioprintScanning, setIsBioprintScanning] = useState(false);
  const [registeredBioprint, setRegisteredBioprint] = useState<{ email: string; name: string } | null>(null);
  const bioprintIntervalRef = useRef<any>(null);

  // Biometric Webcam initial validation states
  const [webcamActive, setWebcamActive] = useState(false);
  const [webcamError, setWebcamError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [biometricStatus, setBiometricStatus] = useState('INITIATING BIO-ALIGNED TELEMETRY...');
  const [noFingerprintRegistered, setNoFingerprintRegistered] = useState(false);
  const [biometricMatchStatus, setBiometricMatchStatus] = useState<'pending' | 'verified' | 'failed'>('pending');

  useEffect(() => {
    const checkTouch = () => {
      const hasTouch = (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints > 0)
      );
      setIsTouchDevice(hasTouch);
    };
    checkTouch();
    window.addEventListener('resize', checkTouch);

    // Initial load of any registered bioprint profile
    try {
      const savedBioprint = localStorage.getItem('cosmos_registered_fingerprint_user');
      if (savedBioprint) {
        setRegisteredBioprint(JSON.parse(savedBioprint));
      }
    } catch (e) {
      console.error('Failed to load registered fingerprint profile', e);
    }

    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  const startTouchScan = () => {
    if (isTouchScanning) return;
    setIsTouchScanning(true);
    setTouchScanProgress(0);
    playScannerSweep();
    playSynthBeep(440, 0.1, 'sine', 0.1);

    let progress = 0;
    touchScanIntervalRef.current = setInterval(() => {
      progress += 4;
      if (progress >= 100) {
        progress = 100;
        setTouchScanProgress(100);
        clearInterval(touchScanIntervalRef.current);
        setIsTouchScanning(false);
        playSuccessChime();
        setTimeout(() => {
          // Check if there is a registered bioprint
          try {
            const savedBioprintStr = localStorage.getItem('cosmos_registered_fingerprint_user');
            if (savedBioprintStr) {
              const bioprintUser = JSON.parse(savedBioprintStr);
              onSuccessAuth({ email: bioprintUser.email, name: bioprintUser.name }, 'signin');
              return;
            }
          } catch (e) {
            console.error(e);
          }
          onSuccessAuth({ email: "biometrics-bypass@cosmos.io", name: "Touch Biometric Captain" }, 'guest');
        }, 600);
      } else {
        setTouchScanProgress(progress);
        if (progress % 12 === 0) {
          playSynthBeep(440 + progress * 3, 0.04, 'sine', 0.05);
        }
      }
    }, 60);
  };

  const stopTouchScan = () => {
    if (touchScanIntervalRef.current) {
      clearInterval(touchScanIntervalRef.current);
      touchScanIntervalRef.current = null;
    }
    if (isTouchScanning) {
      setIsTouchScanning(false);
      if (touchScanProgress < 100) {
        setTouchScanProgress(0);
        playErrorBuzz();
      }
    }
  };

  const startBioprintRegScan = () => {
    if (isBioprintScanning) return;
    const email = bioprintEmail.trim();
    const name = bioprintName.trim();
    if (!name || !email) {
      setAuthError("Commander Profile Name and Biometric Email are required before registration scan.");
      playErrorBuzz();
      return;
    }
    setAuthError(null);
    setIsBioprintScanning(true);
    setBioprintProgress(0);
    playScannerSweep();
    playSynthBeep(500, 0.1, 'sine', 0.1);

    let progress = 0;
    bioprintIntervalRef.current = setInterval(() => {
      progress += 4;
      if (progress >= 100) {
        progress = 100;
        setBioprintProgress(100);
        clearInterval(bioprintIntervalRef.current);
        bioprintIntervalRef.current = null;
        setIsBioprintScanning(false);
        
        try {
          const usersStr = localStorage.getItem('cosmos_registered_users') || '{}';
          const users = JSON.parse(usersStr);
          
          const userProfile = users[email.toLowerCase()] || {
            email,
            name,
            password: "biometric-auth-only",
            sector: "Earth Sector-3 Delta"
          };
          
          userProfile.fingerprintRegistered = true;
          users[email.toLowerCase()] = userProfile;
          
          localStorage.setItem('cosmos_registered_users', JSON.stringify(users));
          
          const bioprintInfo = { email, name };
          localStorage.setItem('cosmos_registered_fingerprint_user', JSON.stringify(bioprintInfo));
          setRegisteredBioprint(bioprintInfo);
          
          playSuccessChime();
        } catch (err) {
          console.error(err);
          setAuthError("Failed to lock cyber-print registry.");
          playErrorBuzz();
        }
      } else {
        setBioprintProgress(progress);
        if (progress % 12 === 0) {
          playSynthBeep(500 + progress * 2.5, 0.04, 'sine', 0.05);
        }
      }
    }, 60);
  };

  const stopBioprintRegScan = () => {
    if (bioprintIntervalRef.current) {
      clearInterval(bioprintIntervalRef.current);
      bioprintIntervalRef.current = null;
    }
    if (isBioprintScanning) {
      setIsBioprintScanning(false);
      if (bioprintProgress < 100) {
        setBioprintProgress(0);
        playErrorBuzz();
      }
    }
  };

  // Local authentication & password reconstitution states
  const [authError, setAuthError] = useState<string | null>(null);
  const [showReset, setShowReset] = useState<boolean>(false);
  const [isResetMode, setIsResetMode] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSector, setResetSector] = useState('Earth Sector-3 Delta');
  const [newPassword, setNewPassword] = useState('');

  // Floating space-themed password reset modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetModalEmail, setResetModalEmail] = useState('');
  const [resetModalSector, setResetModalSector] = useState('Earth Sector-3 Delta');
  const [resetModalNewPassword, setResetModalNewPassword] = useState('');
  const [resetModalError, setResetModalError] = useState<string | null>(null);
  const [resetModalSuccess, setResetModalSuccess] = useState<string | null>(null);

  // Auto-load last saved local credentials on component load/mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cosmos_last_saved_credentials');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email && parsed.password) {
          setEmailInput(parsed.email);
          setPasswordInput(parsed.password);
          setRegEmail(parsed.email);
          setRegPassword(parsed.password);
          setActiveTab('signin');
        }
      }
    } catch (e) {
      console.error('Failed to restore saved credentials', e);
    }
  }, []);

  // Sync autoOpenAuth state
  useEffect(() => {
    if (autoOpenAuth) {
      setIsAuthOpen(true);
      setActiveTab('signup');
    }
  }, [autoOpenAuth]);

  // Automated dark background scene modes
  // Modes: 0: "COSMIC NEBULA FIELD", 1: "GRAVITATIONAL BLACK HOLE", 2: "QUANTUM CHRONO LATTICE", 3: "THERMONUCLEAR SOLAR FLARE STORM"
  const [bgMode, setBgMode] = useState<number>(0);
  const [bgModeTimer, setBgModeTimer] = useState<number>(12); // countdown timer
  const bgModeRef = useRef<number>(0);

  useEffect(() => {
    bgModeRef.current = bgMode;
  }, [bgMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgModeTimer(prev => {
        if (prev <= 1) {
          setBgMode(curr => {
            const nextMode = (curr + 1) % 4;
            // Removed audio for performance
            return nextMode;
          });
          return 12;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [currentSection, setCurrentSection] = useState<'portal' | 'dossier'>('portal');
  const [dossierLogs, setDossierLogs] = useState<string[]>([
    "[12:54:01] QUANTUM PORTAL SYSTEM INITIALIZED",
    "[12:54:12] TELEMETRY SYNCHRONIZER BROADCASTING ON CHANNEL 142.8",
    "[12:54:23] REACTOR INTEGRITY AT 98.4% - STATUS ACTIVE",
    "[12:54:35] BIOMETRIC INTERLOCK SECURITY STATUS: WAITING FOR INGRESS..."
  ]);

  // Infinite live terminal logs generation in dossier mode
  useEffect(() => {
    const spaceLogMocks = [
      "SYNAPSE TELEMETRY CONNECTED TO SECTOR ALPHA-9",
      "QUANTUM ENVELOPE MODULATION DETECTED",
      "ADJUSTING FLUID GRAVITATIONAL DAMPENING FIELD",
      "WARP PROPULSION INDUCTION STABLE AT 1.2M FLUX",
      "J.A.R.V.I.S AUTO-CORRECTING CHOREOGRAPH COORDINATES",
      "EXTERNAL PRESSURE GRADIENT BALANCED AT 0.003hPa",
      "COSMOS SPEAR CONCENTRIC ENERGY CONVERGENT",
      "METADATA SYNC COMPLETE: READY FOR BIO-SCAN",
      "COSMIC RAY IMPACT COMMUTED BY CORE ION SHELL",
      "TEMPORAL DRIFT STABILIZED TO ZERO INDEX"
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      const randomMsg = spaceLogMocks[Math.floor(Math.random() * spaceLogMocks.length)];
      setDossierLogs(prev => {
        const nextLogs = [...prev, `[${timeStr}] ${randomMsg}`];
        if (nextLogs.length > 15) {
          nextLogs.shift(); // Keep logs buffer light
        }
        return nextLogs;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Multi-section scroll gesture tracker (wheel)
  useEffect(() => {
    let lastScrollTime = 0;
    const handleScroll = (e: WheelEvent) => {
      if (isAuthOpen) return;
      const now = Date.now();
      if (now - lastScrollTime < 1200) return; // throttle triggers to allow transitions to play cleanly

      if (e.deltaY > 20 && currentSection === 'portal') {
        playWarpTransition();
        playSynthBeep(330, 0.1, 'sine', 0.05);
        setCurrentSection('dossier');
        lastScrollTime = now;
      } else if (e.deltaY < -20 && currentSection === 'dossier') {
        playWarpTransition();
        playSynthBeep(440, 0.1, 'sine', 0.05);
        setCurrentSection('portal');
        lastScrollTime = now;
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: true });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [currentSection, isAuthOpen]);

  // Form states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSector, setRegSector] = useState('Earth Sector-3 Delta');

  // Sci-fi telemetry readings that update in real time
  const [telemetry, setTelemetry] = useState({
    warpSpeed: 0.0,
    reactorShield: 98.4,
    quasarFrequency: 142.85,
    sectorDrift: 0.043
  });

  const fullTitle = "NEURAL COSMOS PORTAL";

  // Typewriter effect on load
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < fullTitle.length) {
        setTypedTitle(fullTitle.substring(0, currentIdx + 1));
        currentIdx++;
        // Very subtle high pitch tick on typing for wow feedback
        if (Math.random() > 0.6) {
          playSynthBeep(1400, 0.01, 'sine', 0.02);
        }
      } else {
        clearInterval(interval);
      }
    }, 85);
    return () => clearInterval(interval);
  }, []);

  // Update telemetry values randomly
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry({
        warpSpeed: parseFloat((3.2 + Math.random() * 0.8).toFixed(3)),
        reactorShield: parseFloat((98.2 + Math.random() * 0.5).toFixed(1)),
        quasarFrequency: parseFloat((142.8 + Math.random() * 0.6).toFixed(2)),
        sectorDrift: parseFloat((0.04 + Math.random() * 0.005).toFixed(4))
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Biometric validation via Webcam Scanner in initial loading state
  useEffect(() => {
    if (!isScanning) return;
    
    // 1. Immediately verify if a fingerprint user is registered in localStorage
    const registeredUserStr = localStorage.getItem('cosmos_registered_fingerprint_user');
    if (!registeredUserStr) {
      setBiometricStatus('ERROR: NO FINGERPRINT DATA RESIDENT FOR ACCESS GATEWAY.');
      setNoFingerprintRegistered(true);
      return;
    }

    const bioprintUser = JSON.parse(registeredUserStr);
    setBiometricStatus(`LOCATED RECORD: CADET [${bioprintUser.name.toUpperCase()}]. ALIGNING SECURE OPTICAL SCANNER...`);

    // Helper to scan progress
    let elapsed = 0;
    let localStream: MediaStream | null = null;

    // 2. Request webcam feed
    navigator.mediaDevices.getUserMedia({ video: { width: 240, height: 240 } })
      .then(mediaStream => {
        localStream = mediaStream;
        setStream(mediaStream);
        setWebcamActive(true);
        setBiometricStatus('OPTICAL STREAM ONLINE. ALIGN FINGERPRINT IN FRONT OF FEED AREA.');
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        const scanInterval = setInterval(() => {
          elapsed += 4;
          setScanningProgress(Math.min(100, elapsed));
          
          if (elapsed === 20) {
            setBiometricStatus('CAPTURING FINGERPRINT RIDGE PROFILE...');
            playScannerSweep();
          } else if (elapsed === 60) {
            setBiometricStatus('COMPUTING BIOMETRIC VECTOR HANDSHAKES...');
            playScannerSweep();
          } else if (elapsed >= 100) {
            clearInterval(scanInterval);
            
            // Successfully verified!
            setBiometricMatchStatus('verified');
            setBiometricStatus(`PATTERN VERIFIED. WELCOME BACK, CADET ${bioprintUser.name.toUpperCase()}!`);
            
            setTimeout(() => {
              if (localStream) {
                localStream.getTracks().forEach(track => track.stop());
              }
              setWebcamActive(false);
              setIsScanning(false);
              playSuccessChime();
              onSuccessAuth({ email: bioprintUser.email, name: bioprintUser.name }, 'signin');
            }, 1200);
          }
        }, 120);
      })
      .catch(err => {
        console.warn("Webcam blocked or not found. Falling back to high-fidelity simulated scanner.");
        setWebcamError(true);
        setBiometricStatus('OPTICAL FEED RESTRICTED. FALLING BACK TO AUXILIARY BIO-GRID...');
        
        const scanInterval = setInterval(() => {
          elapsed += 5;
          setScanningProgress(Math.min(100, elapsed));
          
          if (elapsed === 25) {
            setBiometricStatus('RUNNING SECURE CLOUD VECTOR RECOVERY...');
            playScannerSweep();
          } else if (elapsed === 75) {
            setBiometricStatus('MATRICY DIGITAL HANDSHANK REBALANCED...');
            playScannerSweep();
          } else if (elapsed >= 100) {
            clearInterval(scanInterval);
            setBiometricMatchStatus('verified');
            setBiometricStatus(`PATTERN VERIFIED SECURELY. INTEGRITY CONFIRMED.`);
            
            setTimeout(() => {
              setIsScanning(false);
              playSuccessChime();
              onSuccessAuth({ email: bioprintUser.email, name: bioprintUser.name }, 'signin');
            }, 1200);
          }
        }, 100);
      });
       
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScanning]);

  // Three.js Hyperspace Starfield and Interactive 3D Holographic Cosmic Core
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;

    const THREE = (window as any).THREE;
    if (!THREE) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Group for the central interactive 3D hologram planet
    const parentGroup = new THREE.Group();
    scene.add(parentGroup);

    // 1. Holographic Wireframe Core Planet (Teal)
    const sphereGeom = new THREE.SphereGeometry(1.3, 18, 18);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x30e8c0,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    const coreGlobe = new THREE.Mesh(sphereGeom, sphereMat);
    parentGroup.add(coreGlobe);

    // 2. Inner Golden Plasma Core (Gold)
    const innerGeom = new THREE.SphereGeometry(0.7, 8, 8);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xe8b84b,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    const innerGlobe = new THREE.Mesh(innerGeom, innerMat);
    parentGroup.add(innerGlobe);

    // 3. Orbital Satellites / Moons
    const satGeom = new THREE.SphereGeometry(0.06, 6, 6);
    const satMat1 = new THREE.MeshBasicMaterial({ color: 0xe8b84b, blending: THREE.AdditiveBlending });
    const satMat2 = new THREE.MeshBasicMaterial({ color: 0x30e8c0, blending: THREE.AdditiveBlending });
    const sat1 = new THREE.Mesh(satGeom, satMat1);
    const sat2 = new THREE.Mesh(satGeom, satMat2);
    parentGroup.add(sat1);
    parentGroup.add(sat2);

    // 4. Planetary Dust Ring (Blue-Teal particle ring tilted around planet)
    const ringPointCount = 280;
    const ringGeometry = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringPointCount * 3);
    for (let i = 0; i < ringPointCount; i++) {
      const theta = (i / ringPointCount) * Math.PI * 2;
      const radius = 1.95 + Math.random() * 0.35;
      ringPositions[i * 3] = Math.cos(theta) * radius;
      ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
      ringPositions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    const ringMaterial = new THREE.PointsMaterial({
      color: 0x60e8ff,
      size: 0.038,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    const planetRing = new THREE.Points(ringGeometry, ringMaterial);
    planetRing.rotation.x = Math.PI / 4.5; // beautiful tilt
    parentGroup.add(planetRing);

    // 4b. 3D Radar Lock Outer Ring
    const radarLockGeom = new THREE.RingGeometry(2.3, 2.34, 32);
    const radarLockMat = new THREE.MeshBasicMaterial({
      color: 0x30e8c0,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const radarLockMesh = new THREE.Mesh(radarLockGeom, radarLockMat);
    parentGroup.add(radarLockMesh);

    // 4c. 3D Radar Lock Outer Target Sphere
    const outerLockGeom = new THREE.SphereGeometry(2.5, 8, 8);
    const outerLockMat = new THREE.MeshBasicMaterial({
      color: 0x31ffd5,
      wireframe: true,
      transparent: true,
      opacity: 0.09,
      blending: THREE.AdditiveBlending
    });
    const outerLockSphere = new THREE.Mesh(outerLockGeom, outerLockMat);
    parentGroup.add(outerLockSphere);

    // 5. Starfield Particles cylinder (hollow down center to frame the central 3D hologram planet nicely)
    const starCount = 1500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starVelocities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 7.5 + 1.6; // hollow cylinder in the middle!

      starPositions[i * 3] = Math.cos(angle) * radius;
      starPositions[i * 3 + 1] = Math.sin(angle) * radius;
      starPositions[i * 3 + 2] = Math.random() * -45; // depth spread

      starVelocities[i] = Math.random() * 0.12 + 0.04; // standard speed
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0x60e8ff,
      size: 0.042,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const starParticles = new THREE.Points(starGeometry, starMaterial);
    scene.add(starParticles);

    // Interactive mouse parallax tracker variables
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMoveGlobal);

    // Interactive custom warp events triggered on actions/hovers
    let starSpeedMultiplier = 1.0;
    let currentSpeedMult = 1.0;
    const handleWarpStart = () => { starSpeedMultiplier = 8.5; };
    const handleWarpEnd = () => { starSpeedMultiplier = 1.0; };
    window.addEventListener('start-warp', handleWarpStart);
    window.addEventListener('stop-warp', handleWarpEnd);

    // Dynamic rotation, orbit, Parallax, and warp ticker loop
    let animationId: number;
    let clockTime = 0;

    const tick = () => {
      clockTime += 0.012;

      // Smoothly zoom/lerp starspeed multiplier
      currentSpeedMult += (starSpeedMultiplier - currentSpeedMult) * 0.1;

      // 1. Advance, warp, and morph star positions / colors based on dynamic background modes
      const posArr = starGeometry.attributes.position.array as Float32Array;
      const currentBg = bgModeRef.current;

      // Smoothly lerp color channels depending on current procedural background mode
      let targetColorHex = 0x30e8c0; // Teal for NEBULA
      if (currentBg === 1) targetColorHex = 0xe8b84b; // Gold for BLACK HOLE
      else if (currentBg === 2) targetColorHex = 0x9d5cff; // Violet for LATTICE
      else if (currentBg === 3) targetColorHex = 0xff3b7c; // Crimson for SOLAR FLARE

      starMaterial.color.lerp(new THREE.Color(targetColorHex), 0.04);

      for (let i = 0; i < starCount; i++) {
        const xIdx = i * 3;
        const yIdx = i * 3 + 1;
        const zIdx = i * 3 + 2;

        let targetX = posArr[xIdx];
        let targetY = posArr[yIdx];
        let targetZ = posArr[zIdx];

        if (currentBg === 0) {
          // MODE 0: "COSMIC NEBULA FIELD" - Slow swirl orbits
          const angle = (i * 0.005) + clockTime * 0.12;
          const radius = 2.0 + (i % 25) * 0.22;
          targetX = Math.cos(angle) * radius;
          targetY = Math.sin(angle) * radius;
          targetZ = posArr[zIdx] + starVelocities[i] * currentSpeedMult;
          if (targetZ > 2.5) targetZ = -45;
        } 
        else if (currentBg === 1) {
          // MODE 1: "GRAVITATIONAL BLACK HOLE" - Accretion spiralling whirlpool
          const angle = (i * 0.015) + clockTime * 0.65;
          const progress = ((i + Math.floor(clockTime * 15)) % starCount) / starCount;
          const radius = progress * 6.5 + 0.35;
          targetX = Math.cos(angle) * radius;
          targetY = Math.sin(angle) * radius;
          targetZ = -1.0 - (progress * 15.0);
        }
        else if (currentBg === 2) {
          // MODE 2: "QUANTUM CHRONO LATTICE" - Oscillating 3D matrix nodes
          const col = i % 40;
          const row = Math.floor(i / 40) % 40;
          const gridScale = 0.35;
          targetX = (col - 20) * gridScale;
          targetZ = (row - 20) * gridScale - 12;
          targetY = Math.sin(targetX * 0.75 + clockTime * 1.8) * Math.cos(targetZ * 0.5 + clockTime * 1.2) * 2.2;
        }
        else {
          // MODE 3: "THERMONUCLEAR SOLAR FLARE STORM" - Horizontal stream rivers
          targetX = ((i * 0.08) % 18) - 9;
          targetY = Math.sin(targetX * 0.45 + clockTime * 2.5) * 1.5 + ((i % 12) - 6) * 0.4;
          targetZ = posArr[zIdx] + (starVelocities[i] * 0.3);
          if (targetZ > 2.5) targetZ = -35;
        }

        // Smoothly lerp actual coordinates to avoid instant jumps on background transition
        posArr[xIdx] += (targetX - posArr[xIdx]) * 0.045;
        posArr[yIdx] += (targetY - posArr[yIdx]) * 0.045;
        posArr[zIdx] += (targetZ - posArr[zIdx]) * 0.06;
      }
      starGeometry.attributes.position.needsUpdate = true;
      starParticles.rotation.z += 0.001 * currentSpeedMult;

      // 2. Animate satellite/moon orbits around core sphere
      sat1.position.x = Math.cos(clockTime * 1.5) * 2.1;
      sat1.position.z = Math.sin(clockTime * 1.5) * 2.1;
      sat1.position.y = Math.sin(clockTime * 0.8) * 0.6;

      sat2.position.y = Math.cos(clockTime * 2.1) * 1.7;
      sat2.position.z = Math.sin(clockTime * 2.1) * 1.7;
      sat2.position.x = Math.sin(clockTime * 0.9) * 0.5;

      // 3. Constant internal orbits
      coreGlobe.rotation.y += 0.004;
      coreGlobe.rotation.x += 0.001;
      innerGlobe.rotation.y -= 0.008;
      innerGlobe.rotation.z += 0.002;
      planetRing.rotation.z -= 0.003;
      radarLockMesh.rotation.z += 0.012;
      outerLockSphere.rotation.y += 0.003;
      outerLockSphere.rotation.x -= 0.002;

      // 4. Parallax tilt parent group smoothly with cursor coordinates (Disabled to keep elements static)
      const targetParallaxX = 0;
      const targetParallaxY = 0;
      parentGroup.rotation.x += (targetParallaxX - parentGroup.rotation.x) * 0.08;
      parentGroup.rotation.y += (targetParallaxY - parentGroup.rotation.y) * 0.08;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(tick);
    };
    tick();

    const handleResize = () => {
      if (!canvas) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('start-warp', handleWarpStart);
      window.removeEventListener('stop-warp', handleWarpEnd);
      renderer.dispose();
    };
  }, []);

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    const email = emailInput.trim();
    const password = passwordInput;

    if (!email || !password) {
      playErrorBuzz();
      setAuthError("Email and Cipher passcode are required.");
      return;
    }

    try {
      const usersStr = localStorage.getItem('cosmos_registered_users') || '{}';
      const users = JSON.parse(usersStr);

      const user = users[email.toLowerCase()];
      if (user) {
        if (user.password === password) {
          // Success! Save last logged in credentials
          localStorage.setItem('cosmos_last_saved_credentials', JSON.stringify({ email, password }));
          playSuccessChime();
          onSuccessAuth({
            email: user.email,
            name: user.name,
          }, 'signin');
        } else {
          // Password is wrong
          playErrorBuzz();
          setAuthError("ACCESS DENIED: CIPHER PASSPHRASE DEVIATION DETECTED! WRONG PASSWORD.");
          setShowReset(true);
        }
      } else {
        // If not registered in database, register dynamically for a frictionless experience, 
        // with the password provided so they can confirm/re-enter it later.
        const newUser = {
          email,
          password,
          name: "Commander (" + (email.split('@')[0] || "Cadet") + ")",
          sector: "Earth Sector-3 Delta"
        };
        users[email.toLowerCase()] = newUser;
        localStorage.setItem('cosmos_registered_users', JSON.stringify(users));
        localStorage.setItem('cosmos_last_saved_credentials', JSON.stringify({ email, password }));
        playSuccessChime();
        onSuccessAuth({
          email: newUser.email,
          name: newUser.name,
        }, 'signin');
      }
    } catch (err) {
      console.error(err);
      playErrorBuzz();
      setAuthError("Failed to lock cyber-link registry.");
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const email = regEmail.trim();
    const name = regName.trim();
    const password = regPassword;
    const sector = regSector;

    if (!email || !name || !password) {
      playErrorBuzz();
      setAuthError("All biometric registration fields are required.");
      return;
    }

    try {
      const usersStr = localStorage.getItem('cosmos_registered_users') || '{}';
      const users = JSON.parse(usersStr);

      const userProfile = {
        email,
        name,
        password,
        sector
      };

      users[email.toLowerCase()] = userProfile;
      localStorage.setItem('cosmos_registered_users', JSON.stringify(users));
      localStorage.setItem('cosmos_last_saved_credentials', JSON.stringify({ email, password }));

      playSuccessChime();
      onSuccessAuth({
        email: userProfile.email,
        name: userProfile.name,
      }, 'signup');
    } catch (err) {
      console.error(err);
      playErrorBuzz();
      setAuthError("Failed to register biometric node.");
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const email = resetEmail.trim();
    const sector = resetSector.trim();
    const password = newPassword;

    if (!email || !sector || !password) {
      playErrorBuzz();
      setAuthError("All password reconstitution fields are required.");
      return;
    }

    try {
      const usersStr = localStorage.getItem('cosmos_registered_users') || '{}';
      const users = JSON.parse(usersStr);

      const user = users[email.toLowerCase()];
      if (user) {
        // Authenticate password override by checking if the space sector matches!
        if (user.sector.toLowerCase().trim() === sector.toLowerCase().trim()) {
          user.password = password;
          users[email.toLowerCase()] = user;
          localStorage.setItem('cosmos_registered_users', JSON.stringify(users));
          localStorage.setItem('cosmos_last_saved_credentials', JSON.stringify({ email, password }));
          
          playSuccessChime();
          setIsResetMode(false);
          setShowReset(false);
          setAuthError(null);
          
          // Autofill active fields
          setEmailInput(email);
          setPasswordInput(password);
          setActiveTab('signin');
        } else {
          playErrorBuzz();
          setAuthError(`RESCUE REJECTED: Sector code "${sector}" did not match registry for ${email}!`);
        }
      } else {
        playErrorBuzz();
        setAuthError("RESCUE REJECTED: Biometric Email ID not registered.");
      }
    } catch (err) {
      console.error(err);
      playErrorBuzz();
      setAuthError("Failed to reconstitute credentials.");
    }
  };

  const handleModalResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetModalError(null);
    setResetModalSuccess(null);

    const email = resetModalEmail.trim();
    const sector = resetModalSector.trim();
    const password = resetModalNewPassword;

    if (!email || !sector || !password) {
      playErrorBuzz();
      setResetModalError("All validation fields are required.");
      return;
    }

    try {
      const usersStr = localStorage.getItem('cosmos_registered_users') || '{}';
      const users = JSON.parse(usersStr);

      const user = users[email.toLowerCase()];
      if (user) {
        // Authenticate password override by checking if the space sector matches!
        if (user.sector.toLowerCase().trim() === sector.toLowerCase().trim()) {
          user.password = password;
          users[email.toLowerCase()] = user;
          localStorage.setItem('cosmos_registered_users', JSON.stringify(users));
          localStorage.setItem('cosmos_last_saved_credentials', JSON.stringify({ email, password }));
          
          playSuccessChime();
          setResetModalSuccess("ACCESS PASSPHRASE DECREED! CYPHER RESET SUCCESSFUL.");
          
          // Autofill active login form
          setEmailInput(email);
          setPasswordInput(password);
          setActiveTab('signin');

          setTimeout(() => {
            setIsResetModalOpen(false);
            setResetModalSuccess(null);
            setResetModalNewPassword('');
            setShowReset(false);
          }, 2000);
        } else {
          playErrorBuzz();
          setResetModalError(`VALIDATION REJECTED: Sector coordinate "${sector}" did not match core registries for ${email}.`);
        }
      } else {
        playErrorBuzz();
        setResetModalError(`VALIDATION REJECTED: Biometric profile of "${email}" not found.`);
      }
    } catch (err) {
      console.error(err);
      playErrorBuzz();
      setResetModalError("INTEGRATION FAILURE: Could not connect to credential registries.");
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#020410] overflow-hidden flex flex-col justify-center items-center z-10 px-4">
      {/* 1. Dynamic background canvas */}
      <canvas 
        ref={bgCanvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0" 
      />

      {/* Grid pattern ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(9,15,48,0.3)_0%,rgba(1,2,8,0.97)_92%)] pointer-events-none z-1"></div>

      {/* BIOMETRIC WEBCAM VALIDATION SCANNING HUD (VISIBLE ON INITIAL LOAD) */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#020512]/95 backdrop-blur-2xl z-[900] flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="w-full max-w-sm bg-slate-950/90 border border-[#30e8c0]/25 rounded-2xl p-6 text-center shadow-[0_0_55px_rgba(48,232,192,0.15)] relative overflow-hidden">
              {/* Sci-fi layout details */}
              <div className="absolute top-2 left-2 text-[6.5px] font-mono text-slate-500">OPTICAL_SCAN_ID_7493</div>
              <div className="absolute top-2 right-2 text-[6.5px] font-mono text-slate-500">GATE_CALIBRATED_100</div>

              {/* Glowing camera stream viewport */}
              <div className="relative w-36 h-36 mx-auto rounded-full border border-[#30e8c0]/30 flex items-center justify-center overflow-hidden bg-slate-900/60 p-1 mb-4 shadow-[0_0_30px_rgba(48,232,192,0.2)]">
                {webcamActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover rounded-full mix-blend-screen" 
                    style={{ transform: 'scaleX(-1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-full border border-dashed border-white/5 relative">
                    <Fingerprint className="w-16 h-16 text-[#30e8c0] animate-pulse" />
                  </div>
                )}

                {/* Laser scan horizontal line */}
                <motion.div 
                  animate={{ y: [-65, 65, -65] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-x-0 h-0.5 bg-[#30e8c0] shadow-[0_0_8px_#30e8c0] pointer-events-none z-10"
                />
              </div>

              <h3 className="text-xs font-display font-black text-white tracking-[4px] uppercase mb-1">
                BIOMETRIC GATEWAY CHECK
              </h3>
              
              <p className="text-[9px] font-mono text-[#30e8c0] tracking-wide max-w-xs mx-auto h-12 flex items-center justify-center mt-1 text-center font-bold">
                {biometricStatus}
              </p>

              {/* Progress gauge */}
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-3 border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-teal-400 to-[#30e8c0] shadow-[0_0_10px_#30e8c0] transition-all duration-300"
                  style={{ width: `${scanningProgress}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[7.5px] font-mono mt-1 text-slate-500">
                <span>SECTOR RANGE MATRIX</span>
                <span>{scanningProgress.toFixed(0)}%</span>
              </div>

              {noFingerprintRegistered ? (
                <button
                  onClick={() => {
                    setIsScanning(false);
                    setActiveTab('signup');
                    setIsAuthOpen(true);
                    playSuccessChime();
                  }}
                  className="w-full mt-5 py-2 px-3 bg-[#e8b84b]/10 hover:bg-[#e8b84b]/20 border border-[#e8b84b]/30 hover:border-[#e8b84b]/60 rounded-xl text-[9px] font-mono text-[#e8b84b] font-black uppercase tracking-widest transition-all cursor-none select-none flex items-center justify-center gap-2 animate-bounce"
                >
                  <Fingerprint className="w-3.5 h-3.5" /> REDIRECT TO REGISTER GATEWAY
                </button>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      setBiometricStatus('ACCESS DENIED. LOCKING DOWN INTRUDER CELL...');
                      setBiometricMatchStatus('failed');
                      playSynthBeep(120, 0.45, 'sawtooth', 0.15);
                      setTimeout(() => {
                        alert("SECURITY ANOMALY DETECTED. BIOMETRIC CREDENTIAL FAILURE.");
                      }, 800);
                    }}
                    className="flex-1 py-1 px-2 bg-[#ff4433]/15 hover:bg-[#ff4433]/25 border border-[#ff4433]/30 rounded-lg text-[7px] font-mono text-[#ff4433] tracking-widest uppercase transition-colors cursor-none font-bold"
                  >
                    ❌ Anomaly (Fail)
                  </button>
                  <button
                    onClick={() => {
                      setBiometricStatus('DECK OVERRIDE ACCEPTED. SECTOR GATEWAYS OPEN.');
                      setBiometricMatchStatus('verified');
                      playSuccessChime();
                      
                      setTimeout(() => {
                        const registeredUserStr = localStorage.getItem('cosmos_registered_fingerprint_user');
                        const bioprintUser = registeredUserStr ? JSON.parse(registeredUserStr) : { name: "Cadet", email: "cadet@cosmos.net" };
                        setIsScanning(false);
                        onSuccessAuth({ email: bioprintUser.email, name: bioprintUser.name }, 'signin');
                      }, 1000);
                    }}
                    className="flex-1 py-1 px-2 bg-teal/15 hover:bg-teal/25 border border-teal/30 rounded-lg text-[7px] font-mono text-teal tracking-widest uppercase transition-colors cursor-none font-bold"
                  >
                    ✔️ Bypass (Pass)
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles decorative ambient blobs */}
      <div className="absolute w-[450px] h-[450px] bg-blue/10 rounded-full filter blur-[150px] top-1/4 left-1/4 select-none animate-float-bob pointer-events-none"></div>
      <div className="absolute w-[450px] h-[450px] bg-teal/10 rounded-full filter blur-[150px] bottom-1/4 right-1/4 select-none pointer-events-none" style={{ animation: 'floatBob 10s ease-in-out infinite' }}></div>

      {/* INTERACTIVE LOGO TRIGGER (TOP RIGHT CORNER) */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-40">
        <motion.button
          onClick={() => {
            playSynthBeep(520, 0.12, 'sine', 0.08);
            setActiveTab('signup');
            setIsAuthOpen(true);
          }}
          onMouseEnter={() => {
            window.dispatchEvent(new CustomEvent('start-warp'));
            playSynthBeep(440, 0.03, 'sine', 0.03);
          }}
          onMouseLeave={() => {
            window.dispatchEvent(new CustomEvent('stop-warp'));
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto select-none bg-slate-950/80 p-3 rounded-2xl border border-[#30e8c0]/45 hover:border-[#30e8c0] shadow-[0_0_20px_rgba(48,232,192,0.2)] backdrop-blur-md flex items-center gap-3 cursor-none transition-all duration-300"
          title="Open Bio-Registry Uplink Portal"
        >
          <div className="relative flex justify-center items-center">
            <span className="w-2 h-2 rounded-full bg-[#30e8c0] absolute animate-ping"></span>
            <Cpu className="w-5 h-5 text-[#30e8c0] animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="flex flex-col text-left">
            <div className="text-[10px] font-display font-black tracking-widest text-[#30e8c0] uppercase flex items-center gap-1">
              KEY PORTAL <span className="text-[7px] bg-[#30e8c0]/20 text-[#30e8c0] px-1 py-0.2 rounded font-mono font-normal">ACCESS</span>
            </div>
            <div className="text-[7.5px] text-slate-400 font-mono uppercase tracking-wider">
              SIGN UP / CONNECT LINK
            </div>
          </div>
        </motion.button>
      </div>

      {/* STATIC DECORATIVE HARNESS (BOTTOM LEFT CORNER) */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 z-30 select-none bg-slate-950/50 p-2.5 rounded-xl border border-gold/15 backdrop-blur-md">
        <Shield className="w-5 h-5 text-gold animate-pulse" />
        <div className="flex flex-col">
          <div className="text-[9px] font-display font-black tracking-widest text-gold uppercase">
            SECURE ACCESS SHIELD
          </div>
          <div className="text-[7px] text-slate-500 font-mono uppercase tracking-wider">
            QUANTUM KEYWAY ACTIVE
          </div>
        </div>
      </div>

      {/* ADVANCED MULTI-ANIMATION SIDE PANEL HARNESS (FLANKING CONTROL TOWERS) */}
      <AnimatePresence>
        {!isAuthOpen && currentSection === 'portal' && (
          <>
            {/* LEFT SIDEBAR: BIOMETRIC TELEMETRY & SIGNAL WAVE ANALYZER */}
            <motion.div
              initial={{ x: -160, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -160, opacity: 0 }}
              transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className={`top-24 z-30 select-none overflow-hidden duration-300 backdrop-blur-lg md:bottom-24
                ${isTouchDevice 
                  ? 'relative md:absolute left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 w-[92%] max-w-sm md:w-72 bg-slate-950/92 border-2 border-teal-400/40 rounded-2xl p-4.5 flex flex-col gap-4 pointer-events-auto shadow-[0_0_50px_rgba(48,232,192,0.18)] mb-6'
                  : 'absolute left-6 bottom-24 w-72 bg-slate-950/85 border border-[#30e8c0]/20 rounded-2xl p-4.5 flex flex-col gap-5 pointer-events-auto shadow-[0_0_40px_rgba(48,232,192,0.08)] hidden xl:flex'
                }
              `}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#30e8c0]/3 rounded-full filter blur-xl pointer-events-none"></div>
              
              {/* Glowing header bracket */}
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <div className="relative">
                  <span className="w-2 h-2 rounded-full bg-[#30e8c0] absolute animate-ping"></span>
                  <div className="w-2 h-2 rounded-full bg-[#30e8c0]"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-display font-black text-white tracking-widest uppercase">COSMOS TELEMETRY DECK</span>
                  <span className="text-[7px] text-slate-500 font-mono tracking-wider uppercase">RADAR & FIELD CONSTANTS</span>
                </div>
              </div>

              {/* LIVE ROTATING CIRCULAR RADAR VECTOR & TOUCH FIELD */}
              <div className="flex flex-col gap-2 items-center justify-center p-3 py-4 bg-black/40 border border-white/5 rounded-xl relative overflow-hidden">
                <div className="absolute top-1 right-2 text-[6.5px] font-mono text-[#30e8c0]/55">SEC_COORDS: H9</div>
                
                {isTouchDevice ? (
                  /* Touch Fingerprint Active Zone */
                  <div className="flex flex-col items-center gap-2.5 w-full">
                    <span className="text-[7.5px] font-mono text-amber-400 animate-pulse tracking-widest uppercase font-bold">TOUCH BIOMETRICS RECOGNITION</span>
                    
                    <button
                      type="button"
                      onTouchStart={startTouchScan}
                      onTouchEnd={stopTouchScan}
                      onTouchCancel={stopTouchScan}
                      onMouseDown={startTouchScan}
                      onMouseUp={stopTouchScan}
                      onMouseLeave={stopTouchScan}
                      className={`relative w-28 h-28 flex items-center justify-center rounded-full transition-all duration-300 border-2 select-none active:scale-95 ${
                        isTouchScanning 
                          ? 'border-teal-400 bg-teal-500/20 shadow-[0_0_30px_rgba(48,232,192,0.4)] scale-102' 
                          : 'border-teal-500/30 hover:border-teal-400/60 bg-black/70 shadow-[0_0_15px_rgba(48,232,192,0.15)]'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Outer rotating scan ring */}
                      <div className={`absolute inset-0 rounded-full border border-teal-400/35 ${isTouchScanning ? 'animate-spin' : ''}`} style={{ animationDuration: '2.5s' }}></div>
                      
                      {/* Progressive scan overlay */}
                      {isTouchScanning && (
                        <div className="absolute inset-1 rounded-full border border-teal animate-pulse" />
                      )}

                      <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-[#30e8c0]/5 via-transparent to-transparent pointer-events-none" />
                      
                      <Fingerprint className={`w-12 h-12 transition-all duration-200 ${isTouchScanning ? 'text-[#30e8c0] scale-110' : 'text-slate-400'}`} />
                    </button>
                    
                    <div className="w-full bg-slate-900 border border-white/5 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-gradient-to-r from-teal-400 via-[#30e8c0] to-blue-500 h-full transition-all duration-75"
                        style={{ width: `${touchScanProgress}%` }}
                      />
                    </div>
                    
                    <span className="text-[8px] font-mono text-center mt-1 font-bold uppercase transition-colors">
                      {isTouchScanning ? (
                        <span className="text-teal animate-pulse">CAPTURING BIOPRINT: {touchScanProgress}%</span>
                      ) : (
                        <span className="text-slate-400">TOUCH & HOLD SCANNER</span>
                      )}
                    </span>
                  </div>
                ) : (
                  /* Standard decorative deck item for laptop/desktop users */
                  <div className="flex flex-col items-center">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-[#30e8c0]/25 animate-spin" style={{ animationDuration: '8s' }}></div>
                      <div className="absolute inset-1.5 rounded-full border border-dashed border-[#30e8c0]/40 animate-spin" style={{ animationDuration: '14s', animationDirection: 'reverse' }}></div>
                      <div className="absolute w-[calc(100%-8px)] h-[1px] bg-white/10"></div>
                      <div className="absolute h-[calc(100%-8px)] w-[1px] bg-white/10"></div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#30e8c0]/15 via-transparent to-transparent animate-spin" style={{ animationDuration: '4s' }}></div>
                      <Fingerprint className="w-8 h-8 text-[#30e8c0]/60 animate-pulse" />
                    </div>
                    <div className="text-[7.5px] font-mono text-slate-500 uppercase tracking-widest text-center mt-2">
                      TOUCH ACCESS SECURED <span className="text-slate-600 block text-[6px]">[LAPTOP KEYPORTAL REQ]</span>
                    </div>
                  </div>
                )}
              </div>

              {/* REAL-TIME WAVERING WAVEFORM ANALYZER */}
              <div className="flex flex-col gap-2 bg-black/40 p-3 border border-white/5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[7.5px] text-slate-400 font-mono uppercase tracking-widest">QUANTUM FLUX SIG_WAVE</span>
                  <span className="text-[7.5px] text-[#30e8c0] font-mono font-bold animate-pulse">142.85 MHz</span>
                </div>
                <div className="h-10 flex items-end gap-1 px-1 pt-2 w-full justify-between">
                  {[...Array(16)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [`${15 + Math.random() * 85}%`, `${2 + Math.random() * 45}%`, `${15 + Math.random() * 85}%`] }}
                      transition={{ repeat: Infinity, duration: 1.2 + i * 0.08, ease: "easeInOut" }}
                      className="w-1.5 bg-[#30e8c0] rounded-sm opacity-80"
                      style={{ backgroundColor: i % 2 === 0 ? '#30e8c0' : '#4faefc' }}
                    />
                  ))}
                </div>
              </div>

              {/* SYSTEM DIAGNOSTICS LOG FEED */}
              <div className="flex flex-col gap-2.5 flex-1 justify-end min-h-[90px]">
                <span className="text-[7.5px] text-slate-500 font-mono uppercase tracking-widest">REAL-TIME DIAGNOSTICS</span>
                <div className="space-y-1.5 font-mono text-[8px] text-slate-400">
                  <div className="flex justify-between items-center bg-white/2 p-1.5 rounded border border-white/5 hover:border-[#30e8c0]/30 hover:bg-teal/5 transition-all">
                    <span>GRAV CONSTANT</span>
                    <span className="text-white font-bold">{(9.80665 + Math.sin(Date.now() * 0.001) * 0.00004).toFixed(5)} G</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 p-1.5 rounded border border-white/5 hover:border-[#30e8c0]/30 hover:bg-teal/5 transition-all">
                    <span>SECTOR STATUS</span>
                    <span className="text-[#30e8c0] font-bold">SECURED [D-3]</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/2 p-1.5 rounded border border-white/5 hover:border-[#30e8c0]/30 hover:bg-teal/5 transition-all">
                    <span>ATMOSPHERIC</span>
                    <span className="text-[#30e8c0] font-bold">IONIZED 100%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Auto background matrix transitions automatically under-the-hood to prevent cluttered UI cards */}
          </>
        )}
      </AnimatePresence>

      {/* BACKGROUND SCI-FI INTERFACE DETAILS IN THE CENTER (VISIBLE BY DEFAULT TILL LOGIN DIRECTIVES ARE TRIGGERED) */}
      <AnimatePresence mode="wait">
        {!isAuthOpen && currentSection === 'portal' && (
          <motion.div
            key="portal-section"
            initial={{ opacity: 0, scale: 0.9, y: 35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -45 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="w-full max-w-4xl relative z-10 flex flex-col items-center justify-center select-none"
          >
            {/* LARGE ROTATING CORE HOLO-GLOW SPHERE & ORBITALS */}
            <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center mb-6">
              {/* Rotating conic radar sweep */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#30e8c0]/10 via-transparent to-transparent animate-spin opacity-45 pointer-events-none" style={{ animationDuration: '3s' }}></div>

              {/* Spinning Ring Line 1 */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#30e8c0]/35 animate-spin" style={{ animationDuration: '45s' }}></div>
              {/* Spinning Ring Line 2 */}
              <div className="absolute inset-2 rounded-full border border-double border-blue/20 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
              {/* Spinning Ring Line 3 */}
              <div className="absolute inset-6 rounded-full border border-gold/15 animate-spin" style={{ animationDuration: '15s' }}></div>
              {/* Concentric scan circle */}
              <div className="absolute w-[1px] bg-gradient-to-b from-[#30e8c0]/60 via-transparent to-[#30e8c0]/60 h-full animate-pulse"></div>

              {/* Holographic Radar Corner Target Brackets */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[#30e8c0]/70 rounded-tl-sm pointer-events-none animate-pulse"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[#30e8c0]/70 rounded-tr-sm pointer-events-none animate-pulse"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[#30e8c0]/70 rounded-bl-sm pointer-events-none animate-pulse"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[#30e8c0]/70 rounded-br-sm pointer-events-none animate-pulse"></div>

              {/* Left Azimuth Stat */}
              <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 flex flex-col items-end text-[7.5px] font-mono text-[#30e8c0]/75 select-none hidden md:flex">
                <span className="font-bold">LOCK_RNG: 4.887</span>
                <span>AZIMUTH: 284.1°</span>
                <span className="w-8 h-[1px] bg-[#30e8c0]/20 mt-1"></span>
              </div>
              {/* Right Azimuth Stat */}
              <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col items-start text-[7.5px] font-mono text-[#30e8c0]/75 select-none hidden md:flex">
                <span className="font-bold text-gold">SYS_ANT: AUTH</span>
                <span className="text">LOCK DETECTED</span>
                <span className="w-8 h-[1px] bg-[#30e8c0]/20 mt-1"></span>
              </div>
              
              {/* Dynamic SVG Vector Planetary Cluster */}
              <svg className="w-full h-full absolute" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="1.5" fill="#e8b84b" className="animate-ping" />
                <circle cx="50" cy="50" r="0.8" fill="#ffffff" />
                
                {/* Orbit path 1 */}
                <ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke="rgba(74,184,255,0.15)" strokeWidth="0.5" transform="rotate(-15 50 50)" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(74,184,255,0.06)" strokeWidth="0.5" />
                
                {/* Simulated Orbiting Particle 1 */}
                <path d="M 20 50 A 30 30 0 1 1 80 50" fill="none" id="orbit1" />
                
                {/* Spinning planet indicators */}
                <motion.circle 
                  cx="50" cy="50" r="2" 
                  fill="#30e8c0" 
                  animate={{ 
                    x: [0, 24, 0, -24, 0],
                    y: [10, 0, -10, 0, 10],
                    scale: [0.8, 1.2, 0.8, 0.6, 0.8]
                  }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                />
                
                <motion.circle 
                  cx="50" cy="50" r="1.4" 
                  fill="#e8b84b" 
                  animate={{ 
                    x: [0, -32, 0, 32, 0],
                    y: [-4, 6, 4, -6, -4]
                  }}
                  transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                />
              </svg>

              {/* Central glowing fingerprint/biometric shield module indicator */}
              <div 
                onClick={() => {
                  playScannerSweep();
                  playSynthBeep(650, 0.1, 'triangle', 0.08);
                  setScanningProgress(prev => Math.max(0, prev - 15));
                  setIsScanning(true);
                }}
                className="absolute w-28 h-28 bg-[#020512]/92 rounded-full border border-white/10 flex flex-col items-center justify-center p-3 text-center shadow-[0_0_35px_rgba(48,232,192,0.15)] group hover:border-[#30e8c0]/50 hover:bg-teal/5 transition-all duration-500 cursor-none"
              >
                <div className="absolute inset-0 rounded-full border border-teal/10 animate-pulse"></div>
                <Fingerprint className="w-8 h-8 text-[#30e8c0] animate-pulse mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-[7px] font-mono text-teal tracking-[2px] uppercase">RADAR LOCK</span>
                <span className="text-[9px] font-display font-black text-white uppercase mt-0.5">{scanningProgress}%</span>
              </div>
            </div>

            {/* NEURAL ACCESS HEADER */}
            <div className="text-center mb-8 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue/15 border border-blue/30 text-[9px] text-[#30e8c0] font-mono tracking-[4px] uppercase mb-4 shadow-[0_0_15px_rgba(48,232,192,0.15)]">
                <Sparkles className="w-2.5 h-2.5 animate-pulse" /> STATION PORTAL INTERFACE Active
              </div>
              
              <h1 className="font-display font-black text-3xl md:text-5xl tracking-[12px] text-white uppercase text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.15)] select-none">
                {typedTitle || "COSMOS SYSTEM"}
                <span className="inline-block w-1 h-5 bg-teal ml-1 animate-pulse"></span>
              </h1>

              <p className="text-[9.5px] font-mono tracking-widest text-[#30e8c0]/80 mt-3 uppercase leading-relaxed max-w-lg mx-auto">
                Secure access gateway to multi-layered physics logs, orbital vector configurations, interactive celestial creations, and direct neural contact with J.A.R.V.I.S.
              </p>
            </div>

            {/* TWIN LIVE DATA READOUT DECKS (LEFT AND RIGHT TELEMETRY PANELS) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl px-4 select-none mb-10 text-center font-mono">
              <div 
                className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between hover:border-blue/30 transition-colors cursor-none"
                onMouseEnter={() => playSynthBeep(330, 0.02, 'sine', 0.04)}
              >
                <span className="text-[7.5px] text-slate-500 tracking-wider">WARP SPEED</span>
                <span className="text-xs text-blue font-bold tracking-wide mt-1">{telemetry.warpSpeed} ly/s</span>
              </div>
              <div 
                className="bg-slate-950/60 p-2.5 rounded-xl border border-white/8 flex flex-col justify-between hover:border-teal/30 transition-colors cursor-none"
                onMouseEnter={() => playSynthBeep(380, 0.02, 'sine', 0.04)}
              >
                <span className="text-[7.5px] text-slate-500 tracking-wider">REACTOR CORE</span>
                <span className="text-xs text-teal font-bold tracking-wide mt-1">{telemetry.reactorShield}%</span>
              </div>
              <div 
                className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between hover:border-gold/30 transition-colors cursor-none"
                onMouseEnter={() => playSynthBeep(440, 0.02, 'sine', 0.04)}
              >
                <span className="text-[7.5px] text-slate-500 tracking-wider">QUASAR FREQ</span>
                <span className="text-xs text-gold font-bold tracking-wide mt-1">{telemetry.quasarFrequency} MHz</span>
              </div>
              <div 
                className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 flex flex-col justify-between hover:border-purple/30 transition-colors cursor-none"
                onMouseEnter={() => playSynthBeep(494, 0.02, 'sine', 0.04)}
              >
                <span className="text-[7.5px] text-slate-500 tracking-wider">SECTOR DRIFT</span>
                <span className="text-xs text-purple-400 font-bold tracking-wide mt-1">±{telemetry.sectorDrift}</span>
              </div>
            </div>

            {/* KEY ACTION BUTTON IN THE CENTER THAT TRIGGERS THE REGISTRATION MODAL */}
            <div className="flex flex-col items-center gap-4 mb-4">
              <motion.button
                onClick={() => {
                  playWarpTransition();
                  setActiveTab('signup');
                  setIsAuthOpen(true);
                }}
                onMouseEnter={() => {
                  window.dispatchEvent(new CustomEvent('start-warp'));
                }}
                onMouseLeave={() => {
                  window.dispatchEvent(new CustomEvent('stop-warp'));
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(48,232,192,0.4)" }}
                whileTap={{ scale: 0.96 }}
                className="pointer-events-auto font-display font-black text-[11px] tracking-[4px] uppercase p-4 px-8 rounded-xl bg-gradient-to-r from-teal/20 via-teal/40 to-blue/20 text-cream border border-[#30e8c0] hover:border-[#30e8c0] shadow-[0_0_25px_rgba(48,232,192,0.15)] flex items-center gap-3 cursor-none transition-all duration-300"
              >
                INITIATE BIOMETRIC SCAN <Rocket className="w-4 h-4 text-[#30e8c0] animate-bounce" />
              </motion.button>

              {/* Force guest bypass command */}
              <motion.button
                onClick={() => {
                  playSuccessChime();
                  onSuccessAuth({ email: "guest@universe.io", name: "Guest Captain" }, 'guest');
                }}
                onMouseEnter={() => {
                  window.dispatchEvent(new CustomEvent('start-warp'));
                }}
                onMouseLeave={() => {
                  window.dispatchEvent(new CustomEvent('stop-warp'));
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(74,184,255,0.4)" }}
                whileTap={{ scale: 0.96 }}
                className="pointer-events-auto font-display font-black text-[11px] tracking-[4px] uppercase p-4 px-8 rounded-xl bg-gradient-to-r from-blue/20 via-blue/40 to-purple/20 text-cream border border-blue shadow-[0_0_25px_rgba(74,184,255,0.15)] flex items-center gap-3 cursor-none transition-all duration-300"
              >
                BYPASS SYSTEMS [GUEST ACCESS ARCHIVE] →
              </motion.button>
            </div>

            {/* DYNAMIC SCROLL DOWN CONTROLLER */}
            <motion.div
              onClick={() => {
                playWarpTransition();
                playSynthBeep(330, 0.1, 'sine', 0.05);
                setCurrentSection('dossier');
              }}
              onMouseEnter={() => {
                window.dispatchEvent(new CustomEvent('start-warp'));
              }}
              onMouseLeave={() => {
                window.dispatchEvent(new CustomEvent('stop-warp'));
              }}
              animate={{ y: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mt-4 flex flex-col items-center gap-1 cursor-none group select-none pointer-events-auto"
            >
              <span className="text-[7.5px] font-mono tracking-[4px] text-[#30e8c0]/60 hover:text-[#30e8c0] transition-colors uppercase">
                SCROLL DOWN FOR MANUAL LOGS
              </span>
              <ChevronDown className="w-5 h-5 text-teal/60 group-hover:text-teal transition-colors" />
            </motion.div>
          </motion.div>
        )}

        {!isAuthOpen && currentSection === 'dossier' && (
          <motion.div
            key="dossier-section"
            initial={{ opacity: 0, scale: 0.9, y: -35 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 35 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="w-full max-w-4xl relative z-10 flex flex-col items-center justify-center select-none px-4 py-8"
          >
            {/* DYNAMIC SCROLL UP CONTROLLER */}
            <motion.div
              onClick={() => {
                playWarpTransition();
                playSynthBeep(440, 0.1, 'sine', 0.05);
                setCurrentSection('portal');
              }}
              onMouseEnter={() => {
                window.dispatchEvent(new CustomEvent('start-warp'));
              }}
              onMouseLeave={() => {
                window.dispatchEvent(new CustomEvent('stop-warp'));
              }}
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-6 flex flex-col items-center gap-1 cursor-none group select-none pointer-events-auto"
            >
              <ChevronUp className="w-5 h-5 text-[#30e8c0]/60 group-hover:text-[#30e8c0] transition-colors" />
              <span className="text-[7.5px] font-mono tracking-[4px] text-[#30e8c0]/60 hover:text-[#30e8c0] transition-colors uppercase">
                SCROLL UP TO ACCESS PORTAL
              </span>
            </motion.div>

            {/* DOSSIER HEADER */}
            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-[#30e8c0]/20 text-[8.5px] text-[#30e8c0] font-mono tracking-[3px] uppercase mb-2">
                <Terminal className="w-3 h-3 animate-pulse text-[#30e8c0]" /> QUANTUM INTEL-NODE STATUS
              </span>
              <h2 className="font-display font-black text-xl md:text-3xl tracking-[8px] text-white uppercase text-center">
                STATION MANUAL & CORE ARCHIVES
              </h2>
              <p className="text-[9px] font-mono tracking-widest text-[#30e8c0]/75 uppercase text-center mt-1">
                Live monitoring grid showing reactor frequency modules & co-pilot specifications.
              </p>
            </div>

            {/* BENTO GRID DETAILS WITH THE BEST TYPOGRAPHY AND LAYOUT DENSITY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
              {/* CARD 1: SYSTEM DIRECTIVES & ARCHIVE INDEX */}
              <div className="bg-slate-950/75 p-5 rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col hover:border-[#30e8c0]/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#30e8c0]/5 to-transparent rounded-full filter blur-xl"></div>
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 mb-3.5">
                  <Compass className="w-4 h-4 text-[#30e8c0] animate-pulse" />
                  <span className="text-[10px] font-display font-black text-white uppercase tracking-wider">
                    STATION KEYWAY DIRECTORY
                  </span>
                </div>
                
                <ul className="space-y-3 font-mono text-[9px] text-slate-400 mt-1 flex-1">
                  <li className="flex justify-between items-center bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-slate-300 font-semibold">🌌 1. COSMOS SPEAR</span>
                    <span className="text-[#30e8c0] font-bold uppercase shrink-0">LOADED 100%</span>
                  </li>
                  <li className="flex justify-between items-center bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-slate-300 font-semibold">🌀 2. GALAXIES RECON</span>
                    <span className="text-[#30e8c0] font-bold uppercase shrink-0">READY TYPE_A</span>
                  </li>
                  <li className="flex justify-between items-center bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-slate-300 font-semibold">☀️ 3. SYSTEM COORDINATORS</span>
                    <span className="text-[#30e8c0] font-bold uppercase shrink-0">ACTIVE DEPLOY</span>
                  </li>
                  <li className="flex justify-between items-center bg-white/2 p-2 rounded border border-white/5">
                    <span className="text-slate-300 font-semibold">🪐 4. CUSTOM FABRICATORS</span>
                    <span className="text-gold font-bold uppercase shrink-0">AUTH NEEDED</span>
                  </li>
                </ul>

                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-4">
                  INDEX: TELEMETRY_REV_5
                </span>
              </div>

              {/* CARD 2: REAL-TIME REACTOR TELEMETRY ROLLING LOGS */}
              <div className="bg-slate-950/75 p-5 rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col md:col-span-1 hover:border-blue-400/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full filter blur-xl"></div>
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 mb-3.5">
                  <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-[10px] font-display font-black text-white uppercase tracking-wider flex items-center justify-between w-full">
                    REACTOR LIVE LOGS <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                  </span>
                </div>

                <div className="flex-1 overflow-hidden font-mono text-[7.5px] text-[#30e8c0] bg-black/60 p-3 rounded-lg border border-white/5 leading-relaxed h-36 flex flex-col-reverse justify-end gap-1.5 overflow-y-auto select-text scrollbar-thin scrollbar-thumb-white/10">
                  {dossierLogs.slice(-6).reverse().map((log, index) => (
                    <div key={index} className="opacity-85 hover:opacity-100 transition-opacity truncate">
                      {log}
                    </div>
                  ))}
                </div>

                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-3.5 self-start">
                  CHANNEL: LOG_UPLINK_STABLE
                </span>
              </div>

              {/* CARD 3: J.A.R.V.I.S CO-PILOT PROTOCOLS */}
              <div className="bg-slate-950/75 p-5 rounded-2xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col hover:border-purple/20 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full filter blur-xl"></div>
                <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 mb-3.5">
                  <Radio className="w-4 h-4 text-purple-400 animate-bounce" />
                  <span className="text-[10px] font-display font-black text-white uppercase tracking-wider">
                    J.A.R.V.I.S SPECTRUM WEIGHTS
                  </span>
                </div>

                <div className="space-y-3.5 mt-1 flex-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                      <span>Neural Weights Sync</span>
                      <span className="text-[#30e8c0] font-bold">100% ONLINE</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-[#30e8c0] h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                      <span>Physics Simulation Accuracy</span>
                      <span className="text-blue-400 font-bold">99.8% READY</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-blue-400 h-full rounded-full" style={{ width: '99.8%' }}></div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[8px] font-mono text-slate-400 uppercase">
                      <span>Quantum Entropy Flux</span>
                      <span className="text-purple-400 font-bold">±0.043 [SECURED]</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                      <div className="bg-purple-400 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[7.5px] font-mono text-slate-500 uppercase mt-4">
                  <span>SPECIES ID: CADET</span>
                  <span>SYS V2.84</span>
                </div>
              </div>
            </div>

            {/* BIO SCAN UPLINK AT THE VERY BOTTOM OF DOSSIER TO TRIGGER PORTAL PORT MODAL */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => {
                  playWarpTransition();
                  setActiveTab('signup');
                  setIsAuthOpen(true);
                }}
                onMouseEnter={() => {
                  window.dispatchEvent(new CustomEvent('start-warp'));
                }}
                onMouseLeave={() => {
                  window.dispatchEvent(new CustomEvent('stop-warp'));
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto font-display font-black text-[10px] tracking-[4px] uppercase p-3.5 px-7 rounded-xl bg-gradient-to-r from-gold/20 via-gold/40 to-orange/20 border border-gold text-cream hover:text-white shadow-[0_0_25px_rgba(232,184,75,0.2)] flex items-center gap-2.5 cursor-none transition-all duration-300"
              >
                ACCESS TERMINAL MODAL <Rocket className="w-3.5 h-3.5 text-gold animate-bounce" />
              </motion.button>
              
              <motion.button
                onClick={() => {
                  playSuccessChime();
                  onSuccessAuth({ email: "guest@universe.io", name: "Guest Captain" }, 'guest');
                }}
                onMouseEnter={() => {
                  window.dispatchEvent(new CustomEvent('start-warp'));
                }}
                onMouseLeave={() => {
                  window.dispatchEvent(new CustomEvent('stop-warp'));
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="pointer-events-auto font-display font-black text-[10px] tracking-[4px] uppercase p-3.5 px-7 rounded-xl bg-gradient-to-r from-teal/20 via-teal/40 to-blue/20 border border-teal text-cream hover:text-white shadow-[0_0_25px_rgba(48,232,192,0.2)] flex items-center gap-2.5 cursor-none transition-all duration-300"
              >
                BYPASS TO GUEST SYSTEM →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTER POP-UP AUTHORIZATION MODAL */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Modal backdrop blur click outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-[#000000]/80 backdrop-blur-md pointer-events-auto"
            />

            {/* Modal card content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', damping: 22, stiffness: 200 }}
              className="w-full max-w-md bg-slate-950/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.95)] pointer-events-auto relative z-10 select-none pb-1"
            >
              {/* Neon top highlight line */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#30e8c0]/70 to-transparent"></div>

              {/* Modal dismiss button */}
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-3.5 right-3.5 p-1 px-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors cursor-none text-[8px] font-mono uppercase flex items-center gap-1"
                title="Back to Telemetry Screen"
              >
                <X className="w-3.5 h-3.5" /> [CLOSE]
              </button>

              {/* TAB CHANNEL TOGGLES inside modal */}
              <div className="grid grid-cols-3 border-b border-white/5 text-center mt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className={`py-4 text-[9px] font-display font-black tracking-[1px] uppercase transition-all duration-300 flex items-center justify-center gap-1 cursor-none ${
                    activeTab === 'signup'
                      ? 'text-[#30e8c0] border-b-2 border-[#30e8c0] bg-white/3'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" /> SIGN UP MOD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('signin')}
                  className={`py-4 text-[9px] font-display font-black tracking-[1px] uppercase transition-all duration-300 flex items-center justify-center gap-1 cursor-none ${
                    activeTab === 'signin'
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-white/3'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <Key className="w-3.5 h-3.5 shrink-0" /> CONNECT LINK
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bioprint')}
                  className={`py-4 text-[9px] font-display font-black tracking-[1px] uppercase transition-all duration-300 flex items-center justify-center gap-1 cursor-none ${
                    activeTab === 'bioprint'
                      ? 'text-amber-400 border-b-2 border-amber-400 bg-white/3'
                      : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5 shrink-0" /> BIOPRINT REG
                </button>
              </div>

              {/* Interactive Bio Registration inputs / SignIn inputs */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/35 text-[9px] font-mono text-red-400 text-center uppercase tracking-wide leading-relaxed animate-pulse"
                    >
                      ⚠️ {authError}
                    </motion.div>
                  )}

                  {showReset && activeTab !== 'bioprint' && (
                    <motion.button
                      layout
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={() => {
                        setResetModalEmail(emailInput);
                        setResetModalError(null);
                        setResetModalSuccess(null);
                        setIsResetModalOpen(true);
                        setAuthError(null);
                      }}
                      className="mb-4 w-full text-center text-[9px] font-mono tracking-widest text-[#e8b84b] hover:text-[#f8d070] transition-colors underline hover:no-underline duration-300 cursor-none uppercase animate-pulse block"
                    >
                      🔮 WRONG PASSWORD? ACTIVATE SECURE PASSWORD RESET OVERLAY →
                    </motion.button>
                  )}

                  {activeTab === 'signup' && (
                    <motion.form
                      key="signup"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      onSubmit={handleSignUpSubmit}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                          Commander Biometrics Profile Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Commander James"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full text-xs font-sans p-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-[#30e8c0]/50 focus:ring-1 focus:ring-[#30e8c0]/10 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                          Bio Registration Email Address
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="busyrock99@gmail.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="w-full text-xs font-sans p-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-[#30e8c0]/50 focus:ring-1 focus:ring-[#30e8c0]/10 transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                            Station Key
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full text-xs font-sans p-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-[#30e8c0]/50 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                            Station Sector
                          </label>
                          <input
                            type="text"
                            value={regSector}
                            onChange={(e) => setRegSector(e.target.value)}
                            className="w-full text-xs font-sans p-2.5 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-[#30e8c0]/50 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full font-display font-black text-center text-[10px] tracking-[4px] uppercase p-3 rounded-xl bg-gradient-to-r from-teal/20 via-teal/40 to-blue/20 text-cream border border-[#30e8c0]/40 hover:border-[#30e8c0] hover:text-white hover:shadow-[0_0_20px_rgba(48,232,192,0.3)] transition-all cursor-none flex items-center justify-center gap-2 mt-2"
                      >
                        CONFIRM NETWORK REGISTRATION <Rocket className="w-4 h-4 text-[#30e8c0]" />
                      </button>
                    </motion.form>
                  )}

                  {activeTab === 'signin' && (
                    <motion.form
                      key="signin"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      onSubmit={handleSignInSubmit}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-1">
                        <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                          Authorized Access Email
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="busyrock99@gmail.com"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          className="w-full text-xs font-sans p-3 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/10 transition-all font-semibold"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                            Access Cipher Key Code
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalEmail(emailInput);
                              setResetModalError(null);
                              setResetModalSuccess(null);
                              setIsResetModalOpen(true);
                            }}
                            className="text-[8px] text-[#e8b84b] hover:text-amber-300 font-mono uppercase cursor-none hover:underline transition-colors tracking-wide"
                          >
                            Forgot key Code?
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          placeholder="••••••••••••••"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          className="w-full text-xs font-sans p-3 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/10 transition-all font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full font-display font-black text-center text-[10px] tracking-[4px] uppercase p-3 rounded-xl bg-gradient-to-r from-blue/20 via-blue/40 to-purple/20 text-cream border border-blue-400/40 hover:border-blue-400 hover:text-white hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all cursor-none flex items-center justify-center gap-2 mt-2"
                      >
                        CONFIRM SECURITY LINK <ArrowRight className="w-4 h-4 text-blue-400" />
                      </button>
                    </motion.form>
                  )}

                  {activeTab === 'bioprint' && (
                    <motion.div
                      key="bioprint"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="text-center bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-xl">
                        <span className="text-[8px] font-mono text-amber-400 tracking-wider font-bold block uppercase">COSMOS MASTER BIOMETRICS STATION</span>
                        <span className="text-[7.5px] font-mono text-slate-400 block mt-0.5 leading-tight">
                          Register your unique fingerprint signature. Once registered, look for the biometric scanner grid on the main telemetry deck or login instantly below.
                        </span>
                      </div>

                      {/* Bio Registration Form / Profile details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-slate-400 font-mono uppercase tracking-widest">
                            Commander Name
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Commander James"
                            value={bioprintName}
                            onChange={(e) => setBioprintName(e.target.value)}
                            className="w-full text-[11px] font-sans p-2 bg-slate-950/70 border border-white/10 rounded-lg text-cream focus:outline-none focus:border-amber-400/50 transition-all font-semibold"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[8px] text-slate-400 font-mono uppercase tracking-widest">
                            Biometric Email
                          </label>
                          <input
                            type="email"
                            placeholder="busyrock99@gmail.com"
                            value={bioprintEmail}
                            onChange={(e) => setBioprintEmail(e.target.value)}
                            className="w-full text-[11px] font-sans p-2 bg-slate-950/70 border border-white/10 rounded-lg text-cream focus:outline-none focus:border-amber-400/50 transition-all font-mono"
                          />
                        </div>
                      </div>

                      {/* Fingerprint Interactive Scan Pad */}
                      <div className="flex flex-col items-center justify-center p-3.5 bg-black/50 border border-white/5 rounded-xl relative overflow-hidden mt-1 select-none">
                        <div className="absolute top-1 right-2 text-[6px] font-mono text-amber-500/45">FINGERPRINT_REC_V7</div>
                        
                        <div className="flex flex-col items-center gap-2 w-full">
                          <button
                            type="button"
                            onTouchStart={startBioprintRegScan}
                            onTouchEnd={stopBioprintRegScan}
                            onTouchCancel={stopBioprintRegScan}
                            onMouseDown={startBioprintRegScan}
                            onMouseUp={stopBioprintRegScan}
                            onMouseLeave={stopBioprintRegScan}
                            className={`relative w-24 h-24 flex items-center justify-center rounded-full transition-all duration-300 border-2 select-none active:scale-95 ${
                              isBioprintScanning 
                                ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-102' 
                                : 'border-amber-500/25 hover:border-amber-400/55 bg-slate-950/80 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className={`absolute inset-0 rounded-full border border-amber-500/30 ${isBioprintScanning ? 'animate-spin' : ''}`} style={{ animationDuration: '2.5s' }} />
                            {isBioprintScanning && (
                              <div className="absolute inset-1 rounded-full border border-amber-400 animate-pulse" />
                            )}
                            <Fingerprint className={`w-10 h-10 transition-all duration-200 ${isBioprintScanning ? 'text-amber-400 scale-110' : 'text-slate-400'}`} />
                          </button>
                          
                          <div className="w-full bg-slate-900 border border-white/5 h-1.5 rounded-full overflow-hidden mt-1">
                            <div 
                              className="bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 h-full transition-all duration-75"
                              style={{ width: `${bioprintProgress}%` }}
                            />
                          </div>
                          
                          <span className="text-[7.5px] font-mono text-center font-bold uppercase tracking-wider h-6 flex items-center justify-center">
                            {isBioprintScanning ? (
                              <span className="text-amber-400 animate-pulse">SCANNING BIOPRINT: {bioprintProgress}%</span>
                            ) : (
                              <span className="text-slate-400">TOUCH & HOLD SCANNER TO ENCODE SIGNATURE</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Display registered signature */}
                      {registeredBioprint ? (
                        <div className="bg-slate-900/60 border border-[#30e8c0]/20 p-3 rounded-xl flex flex-col gap-2 items-center text-center mt-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#30e8c0] animate-ping" />
                            <span className="text-[8px] font-mono text-[#30e8c0] font-black uppercase tracking-wider">
                              MASTER BIOMETRIC REGISTERED
                            </span>
                          </div>
                          <div className="text-[9px] font-mono text-cream leading-tight">
                            Commander: <span className="text-white font-bold">{registeredBioprint.name}</span>
                            <br />
                            Linked: <span className="text-slate-300">{registeredBioprint.email}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              playSuccessChime();
                              onSuccessAuth({ email: registeredBioprint.email, name: registeredBioprint.name }, 'signin');
                            }}
                            className="mt-1 w-full bg-teal-500/20 hover:bg-teal-500/35 border border-teal-400/40 text-[8px] font-display font-black text-white p-2 rounded-lg tracking-widest uppercase transition-all duration-200 cursor-none"
                          >
                            ⚡ FAST ACCESS SECURE LOGIN ⚡
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 border border-white/5 p-2.5 rounded-xl text-center text-slate-500 font-mono text-[7px] uppercase tracking-wider">
                          NO CO-PILOT BIOMETRICS YET ENROLLED IN STORAGE.
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Floating Password Reset Modal Overlay */}
      <AnimatePresence>
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Modal backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResetModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl pointer-events-auto"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="w-full max-w-md bg-slate-950/95 border border-amber-500/20 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.2)] pointer-events-auto relative z-10 p-6 select-none"
            >
              {/* Gold Top Light Highlighter */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#e8b84b]/70 to-transparent"></div>

              {/* Dismiss Button */}
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="absolute top-4 right-4 p-1 px-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-colors cursor-none text-[8px] font-mono uppercase flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> [CLOSE]
              </button>

              <form onSubmit={handleModalResetSubmit} className="flex flex-col gap-4">
                <div className="text-center pb-2 border-b border-white/5">
                  <h3 className="text-xs font-display font-black tracking-widest text-[#e8b84b] uppercase flex items-center justify-center gap-2">
                    <RotateCw className="w-4 h-4 text-amber-400 animate-spin" /> PASSWORD RECONSTITUTION
                  </h3>
                  <p className="text-[7.5px] font-mono text-slate-400 uppercase mt-1">
                    Provide credentials & register space sector to reset passcode cipher.
                  </p>
                </div>

                {/* Validation Feedback Messages */}
                {resetModalError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-red-950/40 border border-red-500/35 text-[9px] font-mono text-red-400 text-center uppercase tracking-wide leading-relaxed animate-pulse"
                  >
                    ⚠️ {resetModalError}
                  </motion.div>
                )}

                {resetModalSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/35 text-[9px] font-mono text-emerald-400 text-center uppercase tracking-wide leading-relaxed"
                  >
                    ✨ {resetModalSuccess}
                  </motion.div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                    Registered Email ID
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Enter registered email"
                    value={resetModalEmail}
                    onChange={(e) => setResetModalEmail(e.target.value)}
                    className="w-full text-xs font-sans p-3 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-amber-400/50 transition-all font-semibold"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                      Space Sector Coordinate Verification
                    </label>
                    <span className="text-[7px] text-slate-500 font-mono uppercase">(Default: Earth Sector-3 Delta)</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Earth Sector-3 Delta"
                    value={resetModalSector}
                    onChange={(e) => setResetModalSector(e.target.value)}
                    className="w-full text-xs font-mono p-3 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-amber-400/50 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[8.5px] text-slate-400 font-mono uppercase tracking-widest">
                    New Access Passcode Cipher
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••"
                    value={resetModalNewPassword}
                    onChange={(e) => setResetModalNewPassword(e.target.value)}
                    className="w-full text-xs font-sans p-3 bg-slate-950/70 border border-white/10 rounded-xl text-cream focus:outline-none focus:border-amber-400/50 transition-all font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!!resetModalSuccess}
                  className="w-full font-display font-black text-center text-[10px] tracking-[4px] uppercase p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-500/40 to-yellow-500/10 text-cream border border-amber-400/40 hover:border-amber-400 hover:text-white hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-none flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  DECREE PASSCODE RECONSTITUTION <RotateCw className={`w-4 h-4 text-amber-400 ${!resetModalSuccess ? 'animate-spin' : ''}`} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
