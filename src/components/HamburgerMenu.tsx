import React from 'react';
import { Menu, X, Settings, HelpCircle, Star, Target, Circle } from 'lucide-react';
import { ASSETS } from './AssetRepository';

export const HamburgerMenu = ({isOpen, onClose, onSelectSection}: {isOpen: boolean, onClose: () => void, onSelectSection: (s: string) => void}) => {
  if (!isOpen) return null;
  return (
    <div className="absolute top-4 left-4 z-50 w-72 bg-slate-950/95 border border-slate-800 rounded-2xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl animate-scaleIn">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-white font-display font-black text-xs uppercase tracking-widest">Navigation Logs</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors duration-200 p-1 hover:bg-white/5 rounded-full cursor-none"><X className="w-4 h-4" /></button>
      </div>
      
      <div className="space-y-3">
        <button 
          className="w-full relative overflow-hidden group flex flex-col justify-end h-20 text-left rounded-xl border border-slate-800 p-3 hover:border-cyan-500/40 transition-all duration-300 cursor-none" 
          onClick={() => onSelectSection('celestial')}
        >
          <img src={ASSETS.planet} alt="Celestial" className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
          <div className="relative z-20 flex justify-between items-center w-full">
            <div>
              <span className="text-[7px] text-cyan-400 font-mono tracking-widest uppercase">system library</span>
              <h3 className="text-white font-display font-bold text-[10.5px] uppercase tracking-wider leading-none">Celestial Bodies</h3>
            </div>
            <div className="flex -space-x-1.5">
              {Object.values(ASSETS).slice(0, 4).map((src, i) => (
                <img key={i} src={src} className="w-5 h-5 rounded-full border border-slate-900 object-cover" referrerPolicy="no-referrer" />
              ))}
            </div>
          </div>
        </button>

        <button 
          className="w-full relative overflow-hidden group flex flex-col justify-end h-20 text-left rounded-xl border border-slate-800 p-3 hover:border-purple-500/40 transition-all duration-300 cursor-none" 
          onClick={() => onSelectSection('my')}
        >
          <img src={ASSETS.blackhole} alt="My Objects" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-[7px] text-purple-400 font-mono tracking-widest uppercase font-bold">orbiting items</span>
            <h3 className="text-white font-display font-bold text-[10.5px] uppercase tracking-wider leading-none">My Custom Elements</h3>
          </div>
        </button>

        <button 
          className="w-full relative overflow-hidden group flex flex-col justify-end h-20 text-left rounded-xl border border-slate-800 p-3 hover:border-yellow-500/40 transition-all duration-300 cursor-none" 
          onClick={() => onSelectSection('create')}
        >
          <img src={ASSETS.star} alt="Creator Studio" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-[7px] text-yellow-400 font-mono tracking-widest uppercase font-bold">precision lab</span>
            <h3 className="text-white font-display font-bold text-[10.5px] uppercase tracking-wider leading-none">Creator Studio</h3>
          </div>
        </button>

        <button 
          className="w-full relative overflow-hidden group flex flex-col justify-end h-20 text-left rounded-xl border border-slate-800 p-3 hover:border-blue-500/40 transition-all duration-300 cursor-none" 
          onClick={() => onSelectSection('orbit')}
        >
          <img src={ASSETS.wormhole} alt="Orbit Designer" className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-[7px] text-blue-400 font-mono tracking-widest uppercase font-bold">trajectory loop</span>
            <h3 className="text-white font-display font-bold text-[10.5px] uppercase tracking-wider leading-none">Orbit Systems</h3>
          </div>
        </button>

        <button 
          className="w-full relative overflow-hidden group flex flex-col justify-end h-16 text-left rounded-xl border border-slate-800 p-3 hover:border-green-500/40 transition-all duration-305 cursor-none" 
          onClick={() => onSelectSection('help')}
        >
          <img src={ASSETS.nebula} alt="Help Protocols" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-300" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
          <div className="relative z-20">
            <span className="text-[7px] text-green-400 font-mono tracking-widest uppercase font-bold">operating guide</span>
            <h3 className="text-white font-display font-bold text-[10.5px] uppercase tracking-wider leading-none">Reaction Recipes</h3>
          </div>
        </button>
      </div>
    </div>
  );
};
