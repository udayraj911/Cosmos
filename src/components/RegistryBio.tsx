import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Rocket, Sparkles, BookOpen, Fingerprint, Shield, Cpu, Activity, User, Target, Compass, CornerRightDown } from 'lucide-react';
import { playSynthBeep, playSuccessChime, playWarpTransition } from '../utils/audio';

interface RegistryBioProps {
  userAuth: { email: string; name: string };
  onEnterHub: (finalBio: { name: string; division: string; sector: string; quote: string }) => void;
}

const COSMOS_FEATURES = [
  {
    icon: <Sparkles className="w-5 h-5 text-blue animate-pulse" />,
    title: "15+ COSMIC UNIVERSES",
    desc: "Browse spatial models: Dark Matter realms, parallel universes, and inflationary zones."
  },
  {
    icon: <Fingerprint className="w-5 h-5 text-teal animate-pulse" />,
    title: "IRON MAN GESTURES",
    desc: "Full MediaPipe hand tracking to point, grab, pinch, swipe, and rotation structures."
  },
  {
    icon: <BookOpen className="w-5 h-5 text-gold" />,
    title: "100+ PHYSICS OBJECTS",
    desc: "Learn real gravity constants, diameter ratios, orbital speeds, and event horizons."
  },
  {
    icon: <Shield className="w-5 h-5 text-purple" />,
    title: "QUANTUM MECHANICS",
    desc: "Deep-dive quantum strings, time dilation equations, wormholes, and black hole math."
  },
  {
    icon: <Rocket className="w-5 h-5 text-orange" />,
    title: "INTERSTELLAR ROUTES",
    desc: "Simulate Mars trajectories, space voyages, orbital pathways, and hyperspace vectors."
  },
  {
    icon: <Cpu className="w-5 h-5 text-pink-400" />,
    title: "AI CREATOR & JARVIS",
    desc: "Build celestial systems instantly via chat with the conversational JARVIS companion."
  }
];

const SPACE_DIVISIONS = [
  { id: 'cartography', title: 'Cosmic Cartography', color: 'border-blue text-blue-300', icon: <Compass className="w-4 h-4 text-blue-400" />, freq: 523 },
  { id: 'physics', title: 'Quantum Astrophysics', color: 'border-purple text-purple-300', icon: <Activity className="w-4 h-4 text-purple-400" />, freq: 587 },
  { id: 'command', title: 'Station Engineering', color: 'border-gold text-gold', icon: <Target className="w-4 h-4 text-gold-400" />, freq: 659 },
  { id: 'synthetics', title: 'Synaptic Intelligence', color: 'border-teal text-teal', icon: <Cpu className="w-4 h-4 text-teal-400" />, freq: 698 }
];

export const RegistryBio: React.FC<RegistryBioProps> = ({ userAuth, onEnterHub }) => {
  const [cadetName, setCadetName] = useState(userAuth.name || 'Commander James');
  const [sectorName, setSectorName] = useState('Earth Sector-3 Delta');
  const [selectedDivision, setSelectedDivision] = useState('cartography');
  const [cadetQuote, setCadetQuote] = useState('To understand gravity is to master time.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeDivObj = SPACE_DIVISIONS.find(x => x.id === selectedDivision);
    playSuccessChime();
    playWarpTransition();
    onEnterHub({
      name: cadetName,
      division: activeDivObj?.title || 'Quantum Astrophysics',
      sector: sectorName,
      quote: cadetQuote
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#020512]/60 overflow-y-auto flex flex-col justify-center items-center py-12 px-4 z-10 custom-scroll select-none">
      
      {/* Decorative starry layout element */}
      <div className="absolute top-10 left-10 text-[8px] font-mono text-slate-600 uppercase tracking-widest leading-relaxed">
        SECURE SECT // L-2 CADET REGISTRY PROTOCOLS<br />
        AUTHORIZED ACCOUNT: {userAuth.email}
      </div>

      <div className="w-full max-w-5xl flex flex-col items-center">
        
        {/* Step Banner header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <span className="text-[10px] bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full font-mono uppercase tracking-[3px]">
            UNLOCKED // LAYER 2: BIOMETRIC SYSTEMS ENCODING
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-white tracking-[6px] uppercase mt-3">
            CADET REGISTRY BOARD & BIO CONFIG
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-2 max-w-xl mx-auto">
            Your identity hash has been accepted. Create your biometric system profile and review the core system capabilities available in this terminal stack below.
          </p>
        </motion.div>

        {/* MAIN LAYOUT SPLIT DESIGN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-5xl items-stretch">
          
          {/* LEFT: COSMIC CAPABILITIES OVERVIEW (What the web has) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue" />
              <h3 className="font-display font-black text-[11px] tracking-[3px] text-white uppercase">
                SYSTEM MODULE OVERVIEW (STATION CAPABILITIES)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
              {COSMOS_FEATURES.map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-950/70 hover:bg-slate-950/90 hover:border-blue/20 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2 bg-white/4 rounded-lg border border-white/5 group-hover:border-blue/30 transition-colors">
                      {feat.icon}
                    </div>
                    <div>
                      <h4 className="text-[10.5px] font-display font-bold text-slate-100 tracking-wide uppercase">
                        {feat.title}
                      </h4>
                      <p className="text-[9px] text-slate-400 font-sans mt-1 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT: REGISTER BIO DETAILS INTERACTIVE FORM */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="glass-panel border border-gold/20 rounded-2xl p-6 bg-slate-950/90 relative flex flex-col justify-between h-full shadow-[0_0_30px_rgba(232,184,75,0.1)]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-bl-full filter blur-xl opacity-60"></div>

              <div>
                <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4 select-none">
                  <User className="w-4 h-4 text-gold animate-pulse" />
                  <div>
                    <h3 className="text-[11px] font-display font-black text-gold tracking-widest uppercase">
                      CADET PASSPORT BIO-ID
                    </h3>
                    <p className="text-[7.5px] text-slate-500 font-mono uppercase">Update Registry telemetry</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[8.5px] text-slate-400 font-mono tracking-widest uppercase mb-1">
                      Commander Identity Name
                    </label>
                    <input
                      type="text"
                      required
                      value={cadetName}
                      onChange={(e) => setCadetName(e.target.value)}
                      className="w-full text-xs font-sans font-semibold p-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-cream focus:outline-none focus:border-gold/60 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-400 font-mono tracking-widest uppercase mb-1">
                      Home Orbital Sector
                    </label>
                    <input
                      type="text"
                      required
                      value={sectorName}
                      onChange={(e) => setSectorName(e.target.value)}
                      className="w-full text-xs font-sans p-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-cream focus:outline-none focus:border-gold/60 transition-all"
                    />
                  </div>

                  {/* SELECT WORKSPACE SPACE DIVISION */}
                  <div>
                    <label className="block text-[8.5px] text-slate-400 font-mono tracking-widest uppercase mb-1">
                      Space Station Division
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-1.5">
                      {SPACE_DIVISIONS.map((div) => (
                        <button
                          key={div.id}
                          type="button"
                          onClick={() => {
                            playSynthBeep(div.freq, 0.1, 'triangle', 0.08);
                            setSelectedDivision(div.id);
                          }}
                          className={`p-2.5 rounded-xl text-[9px] font-display font-bold uppercase tracking-wider border select-none transition-all flex items-center gap-1.5 cursor-none ${
                            selectedDivision === div.id
                              ? `bg-slate-900 border-gold shadow-[0_0_12px_rgba(232,184,75,0.15)] text-cream`
                              : `bg-slate-950/50 border-white/5 hover:border-slate-700 text-slate-400`
                          }`}
                        >
                          {div.icon} {div.title.split(' ')[1] || div.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8.5px] text-slate-400 font-mono tracking-widest uppercase mb-1">
                      Mission Motto & Bio Quote
                    </label>
                    <textarea
                      rows={2}
                      value={cadetQuote}
                      onChange={(e) => setCadetQuote(e.target.value)}
                      className="w-full text-xs font-sans p-2.5 bg-slate-950/80 rounded-xl border border-white/10 text-cream focus:outline-none focus:border-gold/60 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full font-display font-black text-center text-[10px] tracking-[4px] uppercase p-3.5 rounded-xl bg-gradient-to-r from-gold/15 via-gold/30 to-orange/15 text-cream border border-gold/50 hover:border-gold hover:text-white hover:scale-102 hover:shadow-[0_0_22px_rgba(232,184,75,0.25)] transition-all flex items-center justify-center gap-2 cursor-none mt-2"
                  >
                    CONFIRM BIO-REGISTRY CARD & LAUNCH HUB <Activity className="w-4 h-4 text-gold animate-pulse" />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default RegistryBio;
