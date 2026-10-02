import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSynthBeep, playSuccessChime } from '../utils/audio';

interface TutorialStep {
  title: string;
  subtitle: string;
  gestureCode: string;
  instructions: string;
  detailedTask: string;
  hotkey: string;
  icon: string | React.ReactNode;
}

export const GestureTutorialWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Listen to open events from J.A.R.V.I.S or the manual guide trigger
  useEffect(() => {
    const handleOpenTutorial = () => {
      setIsOpen(true);
      setCurrentStep(0);
      playSuccessChime();
    };

    window.addEventListener('open-gesture-tutorial', handleOpenTutorial);
    return () => {
      window.removeEventListener('open-gesture-tutorial', handleOpenTutorial);
    };
  }, []);

  const steps: TutorialStep[] = [
    {
      title: "AIR-CONTROL FLIGHT SCHOOL",
      subtitle: "LEVEL 1 CADET INDUCTION",
      gestureCode: "WELCOME",
      instructions: "Welcome, Cadet. Our orbital workspace is retrofitted with premium optical hand controllers. Here, you will master the five key gestures to navigate deep space.",
      detailedTask: "Begin your instruction. Locate the 'AIR-GESTURES' interface in the bottom left corner to test real webcam tracking or use fast-simulation keys.",
      hotkey: "NA",
      icon: (
        <svg className="w-16 h-16 text-[#30e8c0] animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.77.097-1.516.279-2.234" />
        </svg>
      )
    },
    {
      title: "POINT GESTURE (HOVER & INSPECT)",
      subtitle: "TELEMETRY SCANNER LAYER 3/4",
      gestureCode: "POINT",
      instructions: "Point at any planet in the Explorer, or hover cards across the panel using your index finger. This projects local energy scans instantly.",
      detailedTask: "In the Cosmic Explorer, point with your finger to focus on separate galaxies, orbits, or star clusters to load deep-space log files.",
      hotkey: "Press '1' Key to simulate POINT",
      icon: (
        <svg className="w-16 h-16 text-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Scientific coordinate mesh background */}
          <circle cx="12" cy="7" r="4" stroke="#30e8c0" strokeDasharray="2 2" className="animate-pulse" />
          {/* Pointer tracking cursor overlay */}
          <path fill="currentColor" stroke="#22d3ee" strokeWidth="1" d="M12 9l5 12-4-2-3 4-1-1 3-5-4-1z" className="translate-x-1 -translate-y-1" />
          {/* Pointing finger vector wireframe */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15v-4a1.5 1.5 0 013 0v4m0-4V8.5a1.5 1.5 0 013 0V15m3-5.5a1.5 1.5 0 013 0V17a4 4 0 01-4 4h-5a4 4 0 01-4-4v-3.5" />
        </svg>
      )
    },
    {
      title: "FIST GESTURE (DETACHING CELESTIALS)",
      subtitle: "MAGNETIC GRAB HOVER TRIGGER",
      gestureCode: "FIST",
      instructions: "Form a locked FIST above any celestial card or active body in the matrix to detach it from its current orbit plane.",
      detailedTask: "Click and hold down your primary mouse click on a planet in the Explorer, or double click of point to trigger FIST. The body will follow your hand in real-time.",
      hotkey: "Press '2' Key to simulate FIST",
      icon: (
        <svg className="w-16 h-16 text-gold animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    {
      title: "OPEN PALM (MAGNETIC RE-ANCHORING)",
      subtitle: "ORBIT MATRIX INTEGRATION",
      gestureCode: "OPEN_PALM",
      instructions: "After grabbing a planet in a fist, align it to an orbit helper line and release your fingers into an OPEN PALM. The solar gravity will lock it in place.",
      detailedTask: "Drag the planet towards high or low orbits. Release your mouse button (OPEN PALM) to re-anchor the planet onto its new orbital trajectory.",
      hotkey: "Press '3' Key to simulate OPEN PALM",
      icon: (
        <svg className="w-16 h-16 text-teal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
        </svg>
      )
    },
    {
      title: "MID-AIR SWIPE (LOGBOOK FLIGHTS)",
      subtitle: "COURIER VELOCITY DECODING",
      gestureCode: "SWIPE_UP_DOWN",
      instructions: "In long scrolling documents like the Chronospace Logbook, wave your hand vertically inside camera view (or use keys W/S) to travel at high speeds.",
      detailedTask: "Launch 'DEEP STUDY SCROLL' on any planet. Wave hand or tap simulated buttons to fly past long reports and audio transcripts smoothly.",
      hotkey: "Press [W/6] Scroll Up • [S/7] Scroll Down",
      icon: (
        <svg className="w-16 h-16 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      playSynthBeep(600 + currentStep * 100, 0.08, 'sine', 0.05);
    } else {
      setIsOpen(false);
      playSuccessChime();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      playSynthBeep(500 + currentStep * 80, 0.08, 'sine', 0.05);
    }
  };

  const triggerSimulatedStepGesture = () => {
    const activeStep = steps[currentStep];
    let customEvent: CustomEvent | null = null;

    if (activeStep.gestureCode === "POINT") {
      customEvent = new CustomEvent('hand-gesture', { detail: { gesture: 'POINT' } });
    } else if (activeStep.gestureCode === "FIST") {
      customEvent = new CustomEvent('hand-gesture', { detail: { gesture: 'FIST' } });
    } else if (activeStep.gestureCode === "OPEN_PALM") {
      customEvent = new CustomEvent('hand-gesture', { detail: { gesture: 'OPEN_PALM' } });
    } else if (activeStep.gestureCode === "SWIPE_UP_DOWN") {
      // Dispatch simulated scrolling
      customEvent = new CustomEvent('hand-tracking-update', {
        detail: { isSimulator: true, simulatedDeltaY: 120 }
      });
      window.dispatchEvent(customEvent);
      playSynthBeep(680, 0.1, 'triangle', 0.08);
      return;
    }

    if (customEvent) {
      window.dispatchEvent(customEvent);
      playSynthBeep(880, 0.14, 'sine', 0.08);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#020512]/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 180 }}
          className="w-full max-w-[480px] glass-panel-glow bg-[#030616]/95 border-2 border-cyan/40 p-6 rounded-3xl relative text-center flex flex-col gap-5 shadow-[0_0_80px_rgba(48,232,192,0.25)] select-none"
        >
          {/* Close corner control */}
          <button
            onClick={() => {
              setIsOpen(false);
              playSynthBeep(330, 0.08, 'sine', 0.05);
            }}
            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors cursor-none px-2 py-0.5 border border-white/5 hover:border-white/20 bg-black/40 rounded-md font-mono text-[9px] uppercase"
          >
            TERMINATE [ESC]
          </button>

          {/* Holographic Header Progress */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="text-[9px] font-mono text-cyan tracking-widest font-black uppercase">
              HOLOGRAPHIC STATION FLIGHT ACADEMY
            </span>
            <div className="flex items-center gap-1.5 mt-2">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStep 
                      ? 'w-8 bg-cyan shadow-[0_0_10px_rgba(48,232,192,0.8)]' 
                      : idx < currentStep 
                        ? 'w-3 bg-cyan/40' 
                        : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Visual animation canvas placeholder */}
          <div className="relative h-[130px] w-full rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-center overflow-hidden">
            {/* Ambient sci fi scanner line */}
            <div className="absolute inset-x-0 h-[1.5px] bg-[#30e8c0]/25 shadow-[0_0_8px_#30e8c0] animate-pulse top-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute inset-x-0 h-full bg-grid-pattern opacity-5 pointer-events-none" />
            
            {/* Gesture Icon Representation */}
            <div className="z-10 bg-slate-900/60 p-4 rounded-full border border-white/5 shadow-inner">
              {step.icon}
            </div>
            
            <div className="absolute bottom-2 right-3 text-[7px] font-mono text-slate-500 tracking-wider">
              CADET SCANNER ACTIVE
            </div>
          </div>

          {/* Stepper Details */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30 px-2 py-0.5 rounded uppercase leading-none font-bold">
                {step.gestureCode}
              </span>
              <span className="text-[8px] font-mono text-slate-500 uppercase">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>

            <h3 className="text-sm font-display font-black text-cream uppercase tracking-wide">
              {step.title}
            </h3>
            <p className="text-[9px] text-slate-500 font-mono tracking-widest uppercase text-center leading-none">
              {step.subtitle}
            </p>

            <p className="text-[10.5px] text-slate-300 font-sans leading-relaxed tracking-wide mt-2">
              {step.instructions}
            </p>

            <div className="mt-2 bg-black/45 p-3 rounded-xl border border-white/5 text-left text-[9px] font-mono text-slate-400 hover:border-cyan/20 transition-colors">
              <div className="text-cyan font-bold mb-1 tracking-wider text-[8px] uppercase">⚡ DIRECTIVE INTERFACE ACTION:</div>
              {step.detailedTask}
            </div>
          </div>

          {/* Action buttons with Simulation trigger */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5 text-[9px] font-mono">
            
            {/* Simulation tester trigger */}
            {step.gestureCode !== "WELCOME" ? (
              <button
                onClick={triggerSimulatedStepGesture}
                className="px-3 py-1.5 border border-gold/40 hover:border-gold bg-gold/10 hover:bg-gold/20 text-gold hover:text-white rounded-lg uppercase tracking-wider font-bold cursor-none transition-all flex items-center gap-1"
              >
                ⚡ TEST SIMULATION
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* Next / Back Controllers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  playSynthBeep(330, 0.08, 'sine', 0.05);
                }}
                className="px-3 py-1.5 border border-red/40 hover:border-red bg-red/10 hover:bg-red/20 text-red hover:text-white rounded-lg uppercase tracking-wider font-bold cursor-none transition-all"
              >
                CLOSE [X]
              </button>
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white rounded-lg uppercase tracking-wider cursor-none transition-colors"
                >
                  ◀ BACK
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-1.5 border border-cyan/40 hover:border-cyan bg-cyan/10 hover:bg-cyan/25 text-cyan hover:text-white rounded-lg uppercase tracking-wider font-extrabold cursor-none transition-all shadow-[0_0_15px_rgba(48,232,192,0.15)]"
              >
                {currentStep === steps.length - 1 ? 'COMPLETE 🚀' : 'NEXT ▶'}
              </button>
            </div>

          </div>

          {/* Dynamic footer status */}
          <div className="text-[7.5px] font-mono text-slate-600 tracking-wider flex justify-between select-none">
            <span>HOTKEY: {step.hotkey}</span>
            <span>FLIGHT SIMULATOR v3.55</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
