import React, { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { playSynthBeep } from '../utils/audio';

interface WebcamGestureTrackerProps {
  onGestureDetected: (gesture: string, handsData?: any) => void;
  isActive: boolean;
  currentLayer: number;
  onDragStart?: (e: React.PointerEvent) => void;
  isSimulatorActive: boolean;
  setIsSimulatorActive: (active: boolean) => void;
}

export const WebcamGestureTracker: React.FC<WebcamGestureTrackerProps> = ({
  onGestureDetected,
  isActive,
  currentLayer,
  onDragStart,
  isSimulatorActive,
  setIsSimulatorActive
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [detectedGesture, setDetectedGesture] = useState<string>('NONE');
  const [handSide, setHandSide] = useState<'LEFT' | 'RIGHT' | 'BOTH'>('NONE' as any);
  const [isMinimised, setIsMinimised] = useState(false);
  const [isAiOverdriveMode, setIsAiOverdriveMode] = useState(false);
  const frameCountRef = useRef<number>(0);
  const activeGestureRef = useRef<{ name: string; count: number }>({ name: 'NONE', count: 0 });

  // Listen to AI-directed calibration recovery trigger
  useEffect(() => {
    const handleAiOverdrive = () => {
      setIsAiOverdriveMode(true);
      setErrorMsg(null);
      setModelLoading(false);
      setIsSimulatorActive(true);
    };
    window.addEventListener('ai-overdrive-webcam-start', handleAiOverdrive);
    return () => {
      window.removeEventListener('ai-overdrive-webcam-start', handleAiOverdrive);
    };
  }, [setIsSimulatorActive]);

  const lastHoveredElementRef = useRef<HTMLElement | null>(null);
  const positionHistoryRef = useRef<{ x: number; y: number; time: number }[]>([]);
  const [testMousePos, setTestMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  const nativeStreamRef = useRef<MediaStream | null>(null);
  const nativeFrameRequestRef = useRef<number | null>(null);
  const latestResultsRef = useRef<any>(null);

  // Sync cursor positions for the simulator
  useEffect(() => {
    const handleWinMouseMove = (e: MouseEvent) => {
      setTestMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleWinMouseMove);
    return () => window.removeEventListener('mousemove', handleWinMouseMove);
  }, []);

  const [hoveredIsOpenable, setHoveredIsOpenable] = useState(false);
  const [openableLabel, setOpenableLabel] = useState('');
  const pinchedElementRef = useRef<HTMLElement | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // Absolute Pinch-Drag of whole page HTML elements is disabled
  // to ensure UI panels, cards, and text boxes remain robustly anchored and do not distort.
  useEffect(() => {
    // Disabled generic HTML DOM pinching-displacement to secure layout stability.
    if (pinchedElementRef.current) {
      pinchedElementRef.current.style.pointerEvents = 'auto';
      pinchedElementRef.current = null;
    }
  }, [detectedGesture, testMousePos]);

  const loadScript = (src: string, globalName: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any)[globalName]) {
        resolve((window as any)[globalName]);
        return;
      }

      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        const checkExist = setInterval(() => {
          if ((window as any)[globalName]) {
            clearInterval(checkExist);
            resolve((window as any)[globalName]);
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkExist);
          if ((window as any)[globalName]) {
            resolve((window as any)[globalName]);
          } else {
            reject(new Error(`Timeout waiting for standard loading of ${globalName}`));
          }
        }, 8000);
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.async = true;
      script.onload = () => {
        let checkLoaded = setInterval(() => {
          if ((window as any)[globalName]) {
            clearInterval(checkLoaded);
            resolve((window as any)[globalName]);
          }
        }, 50);
        setTimeout(() => {
          clearInterval(checkLoaded);
          if ((window as any)[globalName]) {
            resolve((window as any)[globalName]);
          } else {
            reject(new Error(`Failed to initialize global name ${globalName}`));
          }
        }, 5000);
      };
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  };

  // 1. Webcam initiation / tracking loop
  useEffect(() => {
    if (!isActive || isSimulatorActive) {
      // Clean up webcam stream
      if (nativeFrameRequestRef.current) {
        cancelAnimationFrame(nativeFrameRequestRef.current);
        nativeFrameRequestRef.current = null;
      }
      if (nativeStreamRef.current) {
        nativeStreamRef.current.getTracks().forEach(track => track.stop());
        nativeStreamRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    let active = true;
    let handsInstance: any = null;

    // Smart auto-timeout to prevent forever-loading states in sandboxes/iframes
    const loadingTimeout = setTimeout(() => {
      if (active && modelLoading) {
        console.warn("MediaPipe solution loading timed out. Offering high-fidelity virtual sensor simulation.");
        setErrorMsg("Device connection or network container restrictions detected. Bypassing system blocks: synthetic neural AI scanner initialized.");
        setModelLoading(false);
        setIsSimulatorActive(true);
        setIsAiOverdriveMode(true);
      }
    }, 4000);

    const startTracking = async () => {
      try {
        setModelLoading(true);
        setErrorMsg(null);

        // Pre-check standard webcam API support and prompt permission safely
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Webcam capture is blocked or unsupported in this browser/iframe context.');
        }

        // Dynamically load scripts with fallback CDNs if not locally available immediately
        const mpHands = await loadScript(
          'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
          'Hands'
        );

        if (!mpHands) {
          throw new Error('MediaPipe script resources not loaded yet.');
        }

        // Initialize MediaPipe Hands (robust to both class and namespace CDNs)
        const HandsConstructor = mpHands.Hands || mpHands;
        handsInstance = new HandsConstructor({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        handsInstance.setOptions({
          maxNumHands: 2,
          modelComplexity: 0,
          minDetectionConfidence: 0.60,
          minTrackingConfidence: 0.50
        });

        handsInstance.onResults((results: any) => {
          if (!active) return;
          clearTimeout(loadingTimeout);
          latestResultsRef.current = results;
          classifyGestures(results);
        });

        // Initialize camera stream natively (only one prompt!)
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 160,
              height: 120,
              frameRate: { ideal: 30 },
              facingMode: 'user'
            },
            audio: false
          });

          if (!active) {
            clearTimeout(loadingTimeout);
            stream.getTracks().forEach(t => t.stop());
            return;
          }

          nativeStreamRef.current = stream;
          videoRef.current.srcObject = stream;
          
          // Make sure to call play() to trigger stream ticks
          await videoRef.current.play().catch(e => console.warn('Webcam play promise stalled:', e));

          let lastSendTime = 0;
          const processFrame = async () => {
            if (!active) return;

            // Draw current camera frame + latest skeletal landmarks onto custom canvas smoothly
            drawSkeleton(latestResultsRef.current);

            if (videoRef.current && (videoRef.current.readyState >= 2 || videoRef.current.videoWidth > 0)) {
              const now = Date.now();
              // Only execute MediaPipe's heavy neural network model every 120ms to completely prevent main thread lag
              if (now - lastSendTime >= 120) {
                lastSendTime = now;
                try {
                  await handsInstance.send({ image: videoRef.current });
                } catch (e) {
                  console.error('Frame processing error:', e);
                }
              }
            }
            if (active) {
              nativeFrameRequestRef.current = requestAnimationFrame(processFrame);
            }
          };

          nativeFrameRequestRef.current = requestAnimationFrame(processFrame);
          clearTimeout(loadingTimeout);
          setModelLoading(false);
        }
      } catch (err: any) {
        clearTimeout(loadingTimeout);
        
        const isPermissionError = err.name === 'NotAllowedError' || 
          err.name === 'PermissionDeniedError' || 
          err.message?.toLowerCase().includes('permission') || 
          err.message?.toLowerCase().includes('allowed') ||
          String(err).toLowerCase().includes('permission');

        if (isPermissionError) {
          console.warn('Webcam / MediaPipe Init Error: Permission denied. Safely falling back to gesture simulator/manual overlays.', err);
        } else {
          console.error('Webcam / MediaPipe Init Error:', err);
        }

        setErrorMsg(
          isPermissionError
            ? 'Camera access has been blocked or denied by the browser inside this sandbox iframe. Direct webcam input cannot bypass iframe sandbox policies.'
            : err.message || 'Could not start standard camera gesture tracking.'
        );
        setModelLoading(false);
        // Let the user view the hardware-denied screen on the "Cam" tab first rather than forcing active simulation mode instantly
        setIsAiOverdriveMode(true);
      }
    };

    startTracking();

    return () => {
      active = false;
      clearTimeout(loadingTimeout);
      if (nativeFrameRequestRef.current) {
        cancelAnimationFrame(nativeFrameRequestRef.current);
        nativeFrameRequestRef.current = null;
      }
      if (nativeStreamRef.current) {
        nativeStreamRef.current.getTracks().forEach(track => track.stop());
        nativeStreamRef.current = null;
      }
      if (handsInstance) {
        try {
          handsInstance.close();
        } catch (e) {}
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [isActive, isSimulatorActive]);

  // 2. High fidelity sci-fi radar/wave animation when Simulator is active
  useEffect(() => {
    if (!isSimulatorActive || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let rad = 0;
    
    const drawMatrixScan = () => {
      ctx.fillStyle = '#040716';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(74, 184, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
      }

      // Draw circular radar bounds
      ctx.strokeStyle = 'rgba(74, 184, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 60, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 35, 0, 2 * Math.PI);
      ctx.stroke();

      // Rotating radar sweep line
      rad += 0.035;
      ctx.strokeStyle = 'rgba(48, 232, 192, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.lineTo(
        canvas.width / 2 + Math.cos(rad) * 60,
        canvas.height / 2 + Math.sin(rad) * 60
      );
      ctx.stroke();

      // Draw stylized palm core ring
      ctx.fillStyle = 'rgba(48, 232, 192, 0.08)';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Target HUD marks in corners
      ctx.strokeStyle = '#30e8c0';
      ctx.lineWidth = 1.2;
      // top left corner mark
      ctx.beginPath();
      ctx.moveTo(15, 25); ctx.lineTo(15, 15); ctx.lineTo(25, 15);
      ctx.stroke();
      // bottom right
      ctx.beginPath();
      ctx.moveTo(canvas.width - 15, canvas.height - 25);
      ctx.lineTo(canvas.width - 15, canvas.height - 15);
      ctx.lineTo(canvas.width - 25, canvas.height - 15);
      ctx.stroke();

      if (isAiOverdriveMode) {
        // Draw elegant title info on canvas
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillStyle = '#30e8c0';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ AI NEURAL CAM FEED ⚡', canvas.width / 2, 20);
        ctx.font = '5.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(48, 232, 192, 0.6)';
        ctx.fillText('SYNTHETIC SPECTRAL MESH LOCKED', canvas.width / 2, 30);

        // Map cursor coordinate to canvas dimensions
        let hx = canvas.width / 2;
        let hy = canvas.height / 2;
        if (window.innerWidth && window.innerHeight) {
          hx = (testMousePos.x / window.innerWidth) * canvas.width;
          hy = (testMousePos.y / window.innerHeight) * canvas.height;
          hx = Math.max(40, Math.min(canvas.width - 40, hx));
          hy = Math.max(50, Math.min(canvas.height - 50, hy));
        }

        const drawConnectSmooth = (x1: number, y1: number, x2: number, y2: number) => {
          ctx.beginPath();
          ctx.strokeStyle = '#30e8c0';
          ctx.lineWidth = 1.2;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          ctx.beginPath();
          ctx.fillStyle = '#ffb300'; // gold joint dots
          ctx.arc(x1, y1, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x2, y2, 2, 0, 2 * Math.PI);
          ctx.fill();
        };

        const wrist = { x: hx, y: hy + 25 };
        const thumbBase = { x: hx - 12, y: hy + 12 };
        const thumbMid = { x: hx - 22, y: hy + 6 };
        const thumbTip = { x: hx - 28, y: hy - 1 };

        const indexBase = { x: hx - 8, y: hy - 2 };
        const indexMid = { x: hx - 11, y: hy - 14 };
        const indexTip = { x: hx - 13, y: hy - 24 };

        const middleBase = { x: hx, y: hy - 4 };
        const middleMid = { x: hx, y: hy - 18 };
        const middleTip = { x: hx, y: hy - 30 };

        const ringBase = { x: hx + 8, y: hy - 2 };
        const ringMid = { x: hx + 11, y: hy - 15 };
        const ringTip = { x: hx + 12, y: hy - 25 };

        const pinkyBase = { x: hx + 15, y: hy + 4 };
        const pinkyMid = { x: hx + 19, y: hy - 5 };
        const pinkyTip = { x: hx + 21, y: hy - 13 };

        // Draw connections
        drawConnectSmooth(wrist.x, wrist.y, thumbBase.x, thumbBase.y);
        drawConnectSmooth(wrist.x, wrist.y, pinkyBase.x, pinkyBase.y);
        drawConnectSmooth(thumbBase.x, thumbBase.y, indexBase.x, indexBase.y);
        drawConnectSmooth(indexBase.x, indexBase.y, middleBase.x, middleBase.y);
        drawConnectSmooth(middleBase.x, middleBase.y, ringBase.x, ringBase.y);
        drawConnectSmooth(ringBase.x, ringBase.y, pinkyBase.x, pinkyBase.y);

        // Fingers
        drawConnectSmooth(thumbBase.x, thumbBase.y, thumbMid.x, thumbMid.y);
        drawConnectSmooth(thumbMid.x, thumbMid.y, thumbTip.x, thumbTip.y);
        drawConnectSmooth(indexBase.x, indexBase.y, indexMid.x, indexMid.y);
        drawConnectSmooth(indexMid.x, indexMid.y, indexTip.x, indexTip.y);
        drawConnectSmooth(middleBase.x, middleBase.y, middleMid.x, middleMid.y);
        drawConnectSmooth(middleMid.x, middleMid.y, middleTip.x, middleTip.y);
        drawConnectSmooth(ringBase.x, ringBase.y, ringMid.x, ringMid.y);
        drawConnectSmooth(ringMid.x, ringMid.y, ringTip.x, ringTip.y);
        drawConnectSmooth(pinkyBase.x, pinkyBase.y, pinkyMid.x, pinkyMid.y);
        drawConnectSmooth(pinkyMid.x, pinkyMid.y, pinkyTip.x, pinkyTip.y);

        if (detectedGesture && detectedGesture !== 'NONE') {
          ctx.beginPath();
          ctx.strokeStyle = '#ffb300';
          ctx.lineWidth = 1;
          ctx.arc(hx, hy, 35, 0, 2 * Math.PI);
          ctx.stroke();

          ctx.font = '6px "JetBrains Mono", monospace';
          ctx.fillStyle = '#ffb300';
          ctx.textAlign = 'center';
          ctx.fillText(`AI G-SIG: ${detectedGesture}`, hx, hy - 36);
        }
      }

      // Interactive simulation hint
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = isAiOverdriveMode ? '#30e8c0' : '#64748b';
      ctx.textAlign = 'center';
      ctx.fillText(isAiOverdriveMode ? 'AI OVERDRIVE REPAIR MATRIX' : 'EMULATOR ACTIVE', canvas.width / 2, canvas.height - 15);

      animFrame = requestAnimationFrame(drawMatrixScan);
    };

    drawMatrixScan();
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [isSimulatorActive, isActive]);

  // 3. Simulated hand gestures sender
  const triggerSimulation = (gestureName: string) => {
    setDetectedGesture(gestureName);
    setHandSide('RIGHT'); // Default to mimicking a right hand control
    
    // Process unified global J.A.R.V.I.S. screen actions for testing Layer 3 (Cosmic Explorer & Trivia)
    triggerGestureAction(gestureName, testMousePos);

    if (gestureName === 'FIST') {
      onGestureDetected('FIST');
      setTimeout(() => {
        onGestureDetected('FIST_LOCKED');
        setDetectedGesture('FIST (LOCKED)');
      }, 200);
    } else {
      onGestureDetected(gestureName);
    }
  };

  // 4. Keyboard digits (1-5) event tracker for simulation mode
  useEffect(() => {
    if (!isSimulatorActive || !isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Bypasses if user is currently inside a form field or text box (essential filter for JS events)
      if (
        document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as any)?.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case '1':
          triggerSimulation('FIST');
          break;
        case '2':
          triggerSimulation('OPEN_PALM');
          break;
        case '3':
          triggerSimulation('POINT');
          break;
        case '4':
          triggerSimulation('PEACE');
          break;
        case '5':
          triggerSimulation('PINCH');
          break;
        case 'w':
        case 'W':
        case '6':
          {
            const scrollEvent = new CustomEvent('hand-tracking-update', {
              detail: { isSimulator: true, simulatedDeltaY: -60 }
            });
            window.dispatchEvent(scrollEvent);
            setDetectedGesture('SWIPE_UP');
          }
          break;
        case 's':
        case 'S':
        case '7':
          {
            const scrollEvent = new CustomEvent('hand-tracking-update', {
              detail: { isSimulator: true, simulatedDeltaY: 60 }
            });
            window.dispatchEvent(scrollEvent);
            setDetectedGesture('SWIPE_DOWN');
          }
          break;
        case '8':
        case 'd':
        case 'D':
          triggerSimulation('THUMBS_DOWN');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSimulatorActive, isActive, testMousePos]);

  // DRAW SKELETON WITH IRON MAN HUD OVERLAY
  const drawSkeleton = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw camera image mirrored as background
    if (videoRef.current && videoRef.current.readyState >= 2) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else if (results && results.image) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    } else {
      ctx.fillStyle = '#0a0d1e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // Overlay style
    ctx.save();
    // Mirror drawing
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (let h = 0; h < results.multiHandLandmarks.length; h++) {
        const landmarks = results.multiHandLandmarks[h];
        const isRightHand = results.multiHandedness[h]?.label === 'Right'; // Note: Mirrored so right is left physically

        // Standard custom colors
        const landmarkColor = '#30e8c0'; // Teal
        const connectionColor = 'rgba(74, 184, 255, 0.4)'; // Blue transparent

        // Connect joints
        const drawConnect = (p1: number, p2: number) => {
          ctx.beginPath();
          ctx.moveTo(landmarks[p1].x * canvas.width, landmarks[p1].y * canvas.height);
          ctx.lineTo(landmarks[p2].x * canvas.width, landmarks[p2].y * canvas.height);
          ctx.strokeStyle = connectionColor;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        };

        // Wrist to fingers
        drawConnect(0, 1); drawConnect(1, 2); drawConnect(2, 3); drawConnect(3, 4); // Thumb
        drawConnect(0, 5); drawConnect(5, 6); drawConnect(6, 7); drawConnect(7, 8); // Index
        drawConnect(9, 10); drawConnect(10, 11); drawConnect(11, 12); // Middle
        drawConnect(13, 14); drawConnect(14, 15); drawConnect(15, 16); // Ring
        drawConnect(0, 17); drawConnect(17, 18); drawConnect(18, 19); drawConnect(19, 20); // Pinky

        // Cross joints
        drawConnect(5, 9); drawConnect(9, 13); drawConnect(13, 17);

        // Draw points with small elegant circles
        landmarks.forEach((pt: any) => {
          ctx.beginPath();
          ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fillStyle = landmarkColor;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        });

        // Palm center calculations (approx with landmarks 0, 5, 17)
        const palmX = ((landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3) * canvas.width;
        const palmY = ((landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3) * canvas.height;

        // Draw HUD circle over palm
        ctx.beginPath();
        ctx.arc(palmX, palmY, 16, 0, 2 * Math.PI);
        const palmDotColors: Record<string, string> = {
          'FIST': '#ff4433',
          'PINCH': '#e8b84b',
          'OPEN_PALM': '#4ab8ff',
          'POINT': '#30e8c0',
          'PEACE': '#b070ff',
          'THUMBS_DOWN': '#ffaa00',
          'CONFIRMED': '#e8b84b'
        };
        const activeColor = palmDotColors[activeGestureRef.current.name] || '#30e8c0';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = activeColor + '30';
        ctx.beginPath();
        ctx.arc(palmX, palmY, 12, 0, 2 * Math.PI);
        ctx.fill();

        // Draw confidence scanner line
        ctx.beginPath();
        ctx.moveTo(palmX - 25, palmY);
        ctx.lineTo(palmX + 25, palmY);
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  // UNIFIED J.A.R.V.I.S. GLOBAL ACTION DISPATCHER
  const triggerGestureAction = (gestureType: string, handPosition: { x: number; y: number }) => {
    const { x, y } = handPosition;
    const targetElem = document.elementFromPoint(x, y) as HTMLElement | null;

    // Detect if pointing on openable thing
    if (targetElem) {
      let current: HTMLElement | null = targetElem;
      let foundOpenable = false;
      let matchedLabel = '';
      while (current && current !== document.body) {
        const tagName = current.tagName;
        const classes = current.className ? String(current.className).toLowerCase() : '';
        const title = (current.getAttribute('title') || '').toLowerCase();
        
        let text = '';
        // Only fetch textContent for potential interactive elements to completely avoid forced reflows or massive string operations
        if (tagName === 'BUTTON' || classes.includes('glass-panel') || classes.includes('btn') || current.classList.contains('cursor-pointer') || title) {
          text = (current.textContent || '').toLowerCase();
        }

        const isEyeButton = classes.includes('eye') || title.includes('view') || title.includes('detail') || classes.includes('pencil') || title.includes('rename');
        const isPlanetCard = classes.includes('glass-panel') && (text.includes('g-force') || text.includes('anomaly') || text.includes('orbit')) || title.includes('orbit');
        
        if (
          tagName === 'BUTTON' ||
          isEyeButton ||
          isPlanetCard ||
          title.includes('open') ||
          title.includes('click') ||
          title.includes('view') ||
          (text && (
            text.includes('open') ||
            text.includes('view') ||
            text.includes('details') ||
            text.includes('study') ||
            text.includes('expand') ||
            text.includes('quest')
          ))
        ) {
          foundOpenable = true;
          matchedLabel = current.getAttribute('title') || current.textContent?.trim().slice(0, 24) || 'Element / Card';
          break;
        }
        current = current.parentElement as HTMLElement | null;
      }
      setHoveredIsOpenable(foundOpenable);
      if (foundOpenable) {
        setOpenableLabel(matchedLabel);
      }
    } else {
      setHoveredIsOpenable(false);
    }

    if (currentLayer === 1 || currentLayer === 2) {
      // Gestures tracked in HUD but actions ignored on Layer 1 (Intro/Bio) and Layer 2 (Mission Hub)
      // EXCEPT let's allow click actions like PINCH or THUMBS_DOWN to let them navigate/click targets
      if (gestureType !== 'THUMBS_DOWN' && gestureType !== 'PINCH' && gestureType !== 'OPEN_PALM') {
        return;
      }
    }

    // Simulate mouse hovers
    if (targetElem !== lastHoveredElementRef.current) {
      if (lastHoveredElementRef.current) {
        lastHoveredElementRef.current.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        lastHoveredElementRef.current.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
      }
      if (targetElem) {
        targetElem.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        targetElem.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
      }
      lastHoveredElementRef.current = targetElem;
    }

    // click actions
    if (gestureType === 'PINCH' || gestureType === 'OPEN_PALM' || gestureType === 'THUMBS_DOWN') {
      if (targetElem) {
        playSynthBeep(659, 0.06, 'sine', 0.05);
        targetElem.focus();
        targetElem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        targetElem.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, clientX: x, clientY: y }));
        targetElem.click();
      }
    } else if (gestureType === 'SWIPE_UP') {
      const scrollTarget = targetElem?.closest('.overflow-y-auto') || window;
      scrollTarget.scrollBy({ top: -150, behavior: 'smooth' });
    } else if (gestureType === 'SWIPE_DOWN') {
      const scrollTarget = targetElem?.closest('.overflow-y-auto') || window;
      scrollTarget.scrollBy({ top: 150, behavior: 'smooth' });
    }
  };

  // MATHEMATICAL CLASSIFICATION OF 11 GESTURES
  const classifyGestures = (results: any) => {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      updateGestureState('NONE');
      setHandSide('NONE' as any);
      return;
    }

    frameCountRef.current++;

    const landmarks = results.multiHandLandmarks[0];
    const label = results.multiHandedness[0]?.label || 'Left';
    setHandSide(label === 'Right' ? 'LEFT' : 'RIGHT'); // mirroed correction

    // Calculate vertical coordinates to check folding (smaller y means higher in normal screen coordinates)
    const isFingerUp = (tip: number, pip: number, mcp?: number) => {
      // Standard: Tip y is less than Pip y (which means it is higher)
      // Knuckle backup (mcp): if tip is significantly higher than knuckle, it counts as extended, even if hand is slightly tilted
      if (mcp !== undefined) {
        return landmarks[tip].y < landmarks[pip].y || landmarks[tip].y < landmarks[mcp].y - 0.012;
      }
      return landmarks[tip].y < landmarks[pip].y;
    };

    const thumbExtended = label === 'Left' 
      ? landmarks[4].x < landmarks[3].x - 0.02
      : landmarks[4].x > landmarks[3].x + 0.02;

    const indexUp = isFingerUp(8, 6, 5);
    const middleUp = isFingerUp(12, 10, 9);
    const ringUp = isFingerUp(16, 14, 13);
    const pinkyUp = isFingerUp(20, 18, 17);

    // Distances
    const pincherDistance = Math.hypot(
      landmarks[8].x - landmarks[4].x,
      landmarks[8].y - landmarks[4].y
    );

    // Dispatch standard cursor coordinates if WEBCAM is active and not simulator env
    if (!isSimulatorActive) {
      const palmX = (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3;
      const palmY = (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3;

      // Screen space mapped with responsive mirror-flipped X coordinate
      const targetScreenX = (1 - palmX) * window.innerWidth;
      const targetScreenY = palmY * window.innerHeight;

      // Dispatch coordinate updates to the global hand scroll service
      const scrollEvent = new CustomEvent('hand-tracking-update', {
        detail: {
          landmarks: landmarks,
          isSimulator: false,
          handSide: label
        }
      });
      window.dispatchEvent(scrollEvent);

      // Dispatch simulated native mousemove
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: targetScreenX,
        clientY: targetScreenY,
        bubbles: true,
        cancelable: true
      });
      window.dispatchEvent(mouseEvent);

      // Trigger hover management on pointing move
      triggerGestureAction('POINT', { x: targetScreenX, y: targetScreenY });

      // Track swipes for scrolling
      const now = Date.now();
      const history = positionHistoryRef.current;
      history.push({ x: targetScreenX, y: targetScreenY, time: now });
      if (history.length > 10) history.shift();

      if (history.length >= 3) {
        const first = history[0];
        const last = history[history.length - 1];
        const dt = last.time - first.time;
        if (dt > 80 && dt < 450) {
          const dy = last.y - first.y;
          const dx = last.x - first.x;
          // Verify vertical swipe gesture velocity
          if (Math.abs(dy) > 75 && Math.abs(dy) > Math.abs(dx)) {
            if (dy < -75) {
              triggerGestureAction('SWIPE_UP', { x: targetScreenX, y: targetScreenY });
              history.length = 0; // Reset history to cooldown
            } else if (dy > 75) {
              triggerGestureAction('SWIPE_DOWN', { x: targetScreenX, y: targetScreenY });
              history.length = 0; // Reset history to cooldown
            }
          }
        }
      }
    }

    // Multi-hand gesture checks
    if (results.multiHandLandmarks.length === 2) {
      setHandSide('BOTH');
      const l1 = results.multiHandLandmarks[0];
      const l2 = results.multiHandLandmarks[1];
      const currentDist = Math.hypot(l1[9].x - l2[9].x, l1[9].y - l2[9].y);

      // We can check expansion or contraction over frames
      if (frameCountRef.current % 5 === 0) {
        const lastDist = (window as any)._lastHandDist || currentDist;
        (window as any)._lastHandDist = currentDist;
        if (currentDist > lastDist + 0.05) {
          updateGestureState('TWO_SPREAD');
          return;
        } else if (currentDist < lastDist - 0.05) {
          updateGestureState('TWO_CLOSE');
          return;
        }
      }
    }

    // Core single hand classifications
    const allClosed = !indexUp && !middleUp && !ringUp && !pinkyUp && !thumbExtended;
    const allOpen = indexUp && middleUp && ringUp && pinkyUp && thumbExtended;

    // PINCH: Index tip touches Thumb tip closely with the remaining three fingers closed
    if (pincherDistance < 0.06 && !middleUp && !ringUp && !pinkyUp) {
      updateGestureState('PINCH');

      // Promote to unified triggerGestureAction
      if (!isSimulatorActive && frameCountRef.current % 8 === 0) {
        const palmX = (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3;
        const palmY = (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3;
        const clickX = (1 - palmX) * window.innerWidth;
        const clickY = palmY * window.innerHeight;

        triggerGestureAction('PINCH', { x: clickX, y: clickY });
      }
      return;
    }

    // FIST: All major fingers folded in
    if (!indexUp && !middleUp && !ringUp && !pinkyUp) {
      updateGestureState('FIST');
      return;
    }

    // POINT: Only index up
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      updateGestureState('POINT');
      return;
    }

    // PEACE: Index and Middle up
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      updateGestureState('PEACE');
      return;
    }

    // THREE_FINGERS: Index, Middle, Ring up
    if (indexUp && middleUp && ringUp && !pinkyUp) {
      updateGestureState('THREE_FINGERS');
      return;
    }

    // THUMBS_UP: Thumb extended high, other fingers folded
    const thumbUp = landmarks[4].y < landmarks[3].y - 0.02 && !indexUp && !middleUp && !ringUp && !pinkyUp;
    if (thumbUp) {
      updateGestureState('THUMBS_UP');
      return;
    }

    // THUMBS_DOWN: Thumb pointing down lower than joint, other fingers folded
    const thumbDown = landmarks[4].y > landmarks[3].y + 0.02 && !indexUp && !middleUp && !ringUp && !pinkyUp;
    if (thumbDown) {
      updateGestureState('THUMBS_DOWN');
      return;
    }

    // OPEN_PALM: Generous check - if at least 3 fingers are raised
    if ((indexUp ? 1 : 0) + (middleUp ? 1 : 0) + (ringUp ? 1 : 0) + (pinkyUp ? 1 : 0) >= 3) {
      updateGestureState('OPEN_PALM');
      return;
    }

    updateGestureState('NONE');
  };

  // FRAME LOCK TIMER FOR STEADY DISPATCHES
  const updateGestureState = (gesture: string) => {
    if (gesture === 'NONE') {
      activeGestureRef.current = { name: 'NONE', count: 0 };
      setDetectedGesture('NONE');
      return;
    }

    const activeRef = activeGestureRef.current;
    if (activeRef.name === gesture) {
      activeRef.count++;
    } else {
      activeGestureRef.current = { name: gesture, count: 1 };
    }

    // Fire generic event periodically or lock on holding
    if (activeRef.count === 8) {
      // LOCKED HOLD (Dramatically reduced from 15 to 8 for fast tactile lock feedback)
      onGestureDetected(`${activeRef.name}_LOCKED`);
      setDetectedGesture(`${activeRef.name} (LOCKED)`);
    } else if (activeRef.count === 2 || (activeRef.count > 2 && activeRef.count % 4 === 0)) {
      // DRAG OR INSTANT EVENT (Triggers on the 2nd stable frame, and then every 4 frames)
      onGestureDetected(activeRef.name);
      setDetectedGesture(activeRef.name);
    }
  };

  return (
    <div 
      id="webcam-tracker"
      className={`webcam-tracker-panel relative glass-panel rounded-xl overflow-hidden border border-[#30e8c0]/25 bg-slate-950 p-2.5 transition-all duration-300 ${
        isMinimised ? 'w-[135px]' : 'w-full max-w-[340px] md:max-w-[420px]'
      }`}
    >
      {/* Simulation Toggle Header */}
      <div 
        onPointerDown={onDragStart}
        className="flex justify-between items-center mb-2 px-0.5 pb-2 border-b border-white/5 select-none text-[8.5px] font-mono cursor-grab active:cursor-grabbing gap-1"
        title="Drag from here to reposition current panel"
      >
        <div className="flex items-center gap-1.5 z-20">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimised(!isMinimised);
              playSynthBeep(isMinimised ? 520 : 380, 0.08, 'sine', 0.05);
            }}
            className="px-1.5 py-0.5 bg-white/5 hover:bg-white/20 border border-white/15 hover:border-[#30e8c0]/50 text-white font-mono font-bold rounded text-[7.5px] cursor-none transition-all uppercase"
            title={isMinimised ? "Expand Panel" : "Minimise Panel"}
          >
            {isMinimised ? '[+] EXPAND' : '[-] FOLD'}
          </button>
          {!isMinimised && (
            <span className="text-[#30e8c0] tracking-wider font-extrabold text-[8px] uppercase font-mono">
              OPERATION COCKPIT
            </span>
          )}
        </div>
      </div>

      {!isMinimised && (
        <div className="grid grid-cols-2 gap-2.5">
          {/* LEFT COL: WEBCAM CONTROLS & CAMERA MONITOR */}
          <div className="flex flex-col gap-1.5">
            <div className="text-[7.5px] text-slate-400 font-mono tracking-wider uppercase font-bold flex justify-between items-center">
              <span>📹 CAM STREAM</span>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSimulatorActive(!isSimulatorActive);
                  setErrorMsg(null);
                  if (isSimulatorActive) {
                    setDetectedGesture('NONE');
                    setHandSide('NONE' as any);
                  }
                }}
                className={`px-1 py-0.5 font-bold rounded text-[6.5px] transition-all uppercase cursor-none border ${
                  !isSimulatorActive 
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' 
                    : 'bg-slate-800 border-slate-705 text-slate-400 hover:text-white'
                }`}
                title="Toggle camera feed on/off"
              >
                {!isSimulatorActive ? 'FEED ON' : 'FEED OFF'}
              </button>
            </div>

            <div 
              onPointerDown={onDragStart}
              className="relative w-full aspect-4/3 rounded-lg overflow-hidden bg-slate-900 border border-white/5 cursor-grab active:cursor-grabbing"
              title="Drag viewport image to reposition panel"
            >
              <video
                ref={videoRef}
                className="absolute w-1 h-1 opacity-0 pointer-events-none"
                playsInline
                muted
                width="320"
                height="240"
              />
              <canvas
                ref={canvasRef}
                width="320"
                height="240"
                className={`w-full h-full object-cover ${isSimulatorActive ? '' : 'scale-x-[-1]'}`}
              />

              {!isSimulatorActive && modelLoading && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center text-center p-2 z-20">
                  <div className="w-6 h-6 rounded-full border-2 border-[#30e8c0] border-t-transparent animate-spin mb-1.5"></div>
                  <span className="text-[7px] font-mono text-slate-300 font-bold tracking-wider mb-1.5">PIPELINE LOAD...</span>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('ai-repair-webcam'));
                    }}
                    className="px-1.5 py-0.5 bg-teal-500/15 border border-teal-400/40 hover:bg-teal-500/30 text-[6.5px] font-mono text-[#30e8c0] rounded cursor-none transition-all tracking-wider uppercase font-black"
                  >
                    ⚡ REPAIR
                  </button>
                </div>
              )}

              {!isSimulatorActive && errorMsg && (
                <div className="absolute inset-0 bg-slate-950/98 border border-red-500/20 flex flex-col items-center justify-center text-center p-2 z-20 font-bold gap-1">
                  <span className="text-[7px] text-red-400 tracking-wider uppercase font-black">CAMERA BLOCK</span>
                  <div className="bg-slate-900/60 px-1 py-0.5 border border-white/5 rounded text-[6px] text-slate-400 font-mono leading-tight mb-0.5 max-h-[38px] overflow-y-auto">
                    {errorMsg}
                  </div>
                  <div className="flex flex-col gap-1 w-full px-1">
                    <a
                      href={window.location.href}
                      target="_blank"
                      rel="noreferrer"
                      onPointerDown={(e) => e.stopPropagation()}
                      className="w-full py-0.5 bg-blue-500/20 border border-blue-400/40 hover:bg-blue-500/30 text-[6.5px] font-mono text-blue-300 uppercase rounded text-center block"
                    >
                      NEW TAB API
                    </a>
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        setErrorMsg(null);
                        setIsSimulatorActive(false);
                      }}
                      className="w-full py-0.5 bg-teal-500/20 border border-[#30e8c0]/40 hover:bg-teal-500/30 text-[6.5px] font-mono text-[#30e8c0] uppercase rounded"
                    >
                      RETRY
                    </button>
                  </div>
                </div>
              )}

              {isSimulatorActive && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-center p-2">
                  <span className="text-[7px] font-mono text-slate-400 tracking-wider">CAMERA FEED INACTIVE</span>
                  <span className="text-[6.5px] text-teal-400 font-mono mt-0.5 uppercase">EMULATOR DRIVER ACTIVE</span>
                </div>
              )}
            </div>

            <div className="mt-1 p-1 bg-slate-900/60 rounded border border-white/5">
              <div className="text-[6.5px] text-slate-500 tracking-wider font-mono speed-upper text-center">INTEGRATION STATE</div>
              <div className="text-[8px] font-bold text-center text-[#30e8c0] font-mono uppercase mt-0.5">
                {!isSimulatorActive ? '🛡️ LIVE SENSE' : '💻 VIRTUAL MODE'}
              </div>
            </div>
          </div>

          {/* RIGHT COL: SIMULATOR CONTROLS */}
          <div className="flex flex-col gap-1.5 border-l border-white/5 pl-2">
            <div className="text-[7.5px] text-slate-400 font-mono tracking-wider uppercase font-bold">
              🕹️ G-EMULATOR PAD
            </div>

            <div className="flex flex-col gap-1 max-h-[145px] overflow-y-auto pr-0.5 scrollbar-thin">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => triggerSimulation('FIST')}
                className="w-full text-left px-1.5 py-0.5 bg-red-500/10 border border-red-500/30 hover:border-red-400 hover:bg-red-500/20 rounded text-[7.5px] font-mono text-red-400 flex items-center justify-between cursor-none transition-colors"
                title="Simulate ✊ FIST gesture (DIVE IN)"
              >
                <span>✊ [1] FIST</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => triggerSimulation('OPEN_PALM')}
                className="w-full text-left px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/30 hover:border-blue-400 hover:bg-blue-500/20 rounded text-[7.5px] font-mono text-blue-400 flex items-center justify-between cursor-none transition-colors"
                title="Simulate 🖐️ PALM gesture (GO BACK)"
              >
                <span>🖐️ [2] PALM</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => triggerSimulation('POINT')}
                className="w-full text-left px-1.5 py-0.5 bg-[#30e8c0]/10 border border-[#30e8c0]/30 hover:border-[#30e8c0]/60 hover:bg-[#30e8c0]/20 rounded text-[7.5px] font-mono text-[#30e8c0] flex items-center justify-between cursor-none transition-colors"
                title="Simulate ☝️ POINT gesture (NEXT)"
              >
                <span>☝️ [3] POINT</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => triggerSimulation('PEACE')}
                className="w-full text-left px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 hover:bg-purple-500/20 rounded text-[7.5px] font-mono text-purple-400 flex items-center justify-between cursor-none transition-colors"
                title="Simulate ✌️ PEACE gesture (HUD GLIDE)"
              >
                <span>✌️ [4] PEACE</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => triggerSimulation('PINCH')}
                className="w-full text-left px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 hover:border-amber-400 hover:bg-amber-500/20 rounded text-[7.5px] font-mono text-amber-400 flex items-center justify-between cursor-none transition-colors"
                title="Simulate 👌 PINCH gesture (FOCUS)"
              >
                <span>👌 [5] PINCH</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => triggerSimulation('THUMBS_DOWN')}
                className="w-full text-left px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/30 hover:border-orange-400 hover:bg-orange-500/20 rounded text-[7.5px] font-mono text-orange-400 flex items-center justify-between cursor-none transition-colors"
                title="Simulate 👎 THUMBS DOWN gesture (OPEN)"
              >
                <span>👎 [8/D] OPEN BD</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  const scrollEvent = new CustomEvent('hand-tracking-update', {
                    detail: { isSimulator: true, simulatedDeltaY: -60 }
                  });
                  window.dispatchEvent(scrollEvent);
                  setDetectedGesture('SWIPE_UP');
                }}
                className="w-full text-left px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 rounded text-[7.5px] font-mono text-cyan-400 flex items-center justify-between cursor-none transition-all"
                title="Simulate scrolling pages up"
              >
                <span>▲ [W/6] PG UP</span>
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => {
                  const scrollEvent = new CustomEvent('hand-tracking-update', {
                    detail: { isSimulator: true, simulatedDeltaY: 60 }
                  });
                  window.dispatchEvent(scrollEvent);
                  setDetectedGesture('SWIPE_DOWN');
                }}
                className="w-full text-left px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 rounded text-[7.5px] font-mono text-cyan-400 flex items-center justify-between cursor-none transition-all"
                title="Simulate scrolling pages down"
              >
                <span>▼ [S/7] PG DOWN</span>
              </button>
            </div>

            <div 
              onPointerDown={onDragStart}
              className="mt-1 text-center bg-slate-900/60 p-1.5 rounded border border-white/5 cursor-grab active:cursor-grabbing"
            >
              <div className="text-[7px] text-slate-500 tracking-wider font-mono uppercase">TELEMETRY</div>
              <div className="text-[9.5px] font-display text-gold tracking-wide font-extrabold mt-0.5 font-bold uppercase overflow-hidden text-ellipsis whitespace-nowrap">
                {detectedGesture}
              </div>
              <div className="text-[7px] text-slate-400 tracking-wider font-mono mt-0.5">
                HAND: <span className="text-blue-400">{handSide}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isMinimised && hoveredIsOpenable && (
        <div className="mt-2.5 p-1.5 bg-[#ffaa00]/10 border border-[#ffaa00]/25 text-center rounded text-[7.5px] font-mono text-[#ffaa00] animate-pulse leading-normal">
          🎯 TARGET: <span className="text-[#30e8c0] font-black">{openableLabel || 'DETECTED'}</span><br />
          <span>PRESS [8] OR CLICK THUMBS DOWN TO VIEW / CONFIRM</span>
        </div>
      )}
    </div>
  );
};
export default WebcamGestureTracker;
