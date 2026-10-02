import React from 'react';
import { X, Globe, Target, Shield, Star, Circle, Sliders } from 'lucide-react';
import { useOrbitControls } from '../hooks/useOrbitControls';
import { ASSETS } from './AssetRepository';

export const SectionOverlay = ({section, onClose, activeTool, setActiveTool, selectedObject, updateSelectedObject}: {
    section: string, 
    onClose: () => void,
    activeTool?: string,
    setActiveTool?: (tool: string) => void,
    selectedObject?: any,
    updateSelectedObject?: (updates: any) => void
}) => {
    return (
        <div className="absolute inset-0 z-45 bg-slate-950/95 p-8 text-white rounded-3xl overflow-auto border border-blue-950/40 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <h2 className="text-2xl font-display font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-400">{section} Control Centre</h2>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors duration-200 cursor-none"><X /></button>
            </div>
            
            {section === 'help' && (
                <div className="space-y-4 font-mono text-sm max-w-2xl">
                    <p className="text-lg font-bold mb-4 text-cyan-400 font-display">COSMIC REACTION BLUEPRINTS</p>
                    <ul className="space-y-4">
                        <li className="p-3 bg-slate-900/50 rounded-xl border border-purple-500/10 flex items-start gap-3">
                            <span className="text-lg mt-0.5">⚫</span> 
                            <div>
                                <strong className="text-purple-300">Singularity / Black Hole:</strong> 
                                <p className="text-xs text-slate-400 mt-1">Collide 15-20 heavy celestial elements with high cosmic gravitic fields to generate an ultra-dense singularity.</p>
                            </div>
                        </li>
                        <li className="p-3 bg-slate-900/50 rounded-xl border border-red-500/10 flex items-start gap-3">
                            <span className="text-lg mt-0.5">💥</span> 
                            <div>
                                <strong className="text-red-300">Supernova Explosion:</strong> 
                                <p className="text-xs text-slate-400 mt-1">Stall or crash two existing black hole singularities into each other to initiate a starburst supernova cosmic cloud.</p>
                            </div>
                        </li>
                        <li className="p-3 bg-slate-900/50 rounded-xl border border-teal-500/10 flex items-start gap-3">
                            <span className="text-lg mt-0.5">🌍</span> 
                            <div>
                                <strong className="text-teal-300">Custom Terraform Planet:</strong> 
                                <p className="text-xs text-slate-400 mt-1">Shatter and agglomerate 10-16 floating asteroids with close gravitational forces to fuse a terraformed stable planet.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            )}
            
            {section === 'celestial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { id: 'planet', name: 'Planets', img: ASSETS.planet, desc: 'Spherical terrestrial bodies with vibrant atmospheres and localized gravities.' },
                        { id: 'asteroid', name: 'Asteroids', img: ASSETS.asteroid, desc: 'Rocky elements with dynamic kinetic momentum and low mass fields.' },
                        { id: 'blackhole', name: 'Black Holes', img: ASSETS.blackhole, desc: 'Gravitational voids that swallow adjacent items and bend visual space lines.' },
                        { id: 'star', name: 'Stars', img: ASSETS.star, desc: 'Luminous dynamic centers that provide heat, illumination, and heavy mass.' },
                        { id: 'wormhole', name: 'Wormholes', img: ASSETS.wormhole, desc: 'Cosmic folding channels linking matching dimensional structures.' }
                    ].map(tool => (
                        <button 
                            key={tool.id}
                            onClick={() => {
                                console.log(`[SectionOverlay] Celestial tool selected via button click: "${tool.id}"`);
                                setActiveTool?.(tool.id);
                                onClose();
                            }}
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', tool.id);
                            }}
                            className={`group relative h-44 rounded-2xl overflow-hidden border transition-all duration-300 text-left flex flex-col justify-end p-5 hover:scale-[1.02] cursor-none ${
                                activeTool === tool.id 
                                ? 'border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.25)] bg-slate-950/80' 
                                : 'border-slate-800/80 hover:border-slate-500 bg-slate-950/40'
                            }`}
                        >
                            {/* Photo Background */}
                            <img 
                                src={tool.img} 
                                alt={tool.name} 
                                className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-75 group-hover:scale-105 transition-all duration-500" 
                                referrerPolicy="no-referrer"
                            />
                            {/* Backdrop shadow bar */}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
                            
                            {/* Item Metadata Label */}
                            <div className="relative z-20">
                                <span className={`text-[7.5px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md border mb-2 inline-block ${
                                    activeTool === tool.id 
                                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30' 
                                    : 'bg-slate-900/80 text-slate-400 border-slate-700/50'
                                }`}>
                                    {activeTool === tool.id ? '✦ active selection' : 'ready for deployment'}
                                </span>
                                <h4 className="font-display font-black text-sm text-cream uppercase tracking-widest leading-none mb-1.5">{tool.name}</h4>
                                <p className="text-[9.5px] text-slate-300 font-sans leading-normal group-hover:text-white transition-colors duration-200">
                                    {tool.desc}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {section === 'orbit' && (
                <div className="space-y-6 max-w-2xl">
                    {!selectedObject ? (
                        <div className="p-6 bg-slate-900/40 rounded-2xl border border-red-500/20 text-center">
                            <Sliders className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                            <h3 className="text-sm font-display font-black uppercase tracking-wider text-rose-400">Trajectory Sync Failure</h3>
                            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Please select an existing celestial body in the space canvas first to design its surrounding orbital systems and gravity loops.</p>
                        </div>
                    ) : (
                        (() => {
                            const { addOrbit, removeOrbit, updateOrbit } = useOrbitControls(selectedObject, (id: string, updates: any) => updateSelectedObject?.(updates));
                            const orbits = selectedObject.orbits || [];
                            return (
                                <div className="space-y-6">
                                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 flex items-center justify-between">
                                        <div>
                                            <span className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase animate-pulse">Target Body Locked</span>
                                            <h3 className="text-white font-display font-black text-base uppercase tracking-wider">{selectedObject.name}</h3>
                                        </div>
                                        <button 
                                            onClick={() => addOrbit()}
                                            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-display font-black text-xs uppercase tracking-wider rounded-lg hover:from-cyan-500 hover:to-blue-500 transition duration-200 cursor-none shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                                        >
                                            + Deploy New Loop
                                        </button>
                                    </div>
                                    
                                    {orbits.length === 0 && !selectedObject.hasOrbit ? (
                                        <div className="p-8 bg-slate-900/20 rounded-xl border border-dashed border-slate-800 text-center text-slate-500">
                                            No active orbital systems detected around this body. Press "+ Deploy New Loop" above to get started.
                                        </div>
                                    ) : (
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                            {orbits.map((orb: any, idx: number) => (
                                                <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800/65 rounded-xl space-y-3">
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                                        <span className="text-xs font-mono font-black text-slate-300">ORBITAL TRAJECTORY LOOP #{idx + 1}</span>
                                                        <button 
                                                            onClick={() => removeOrbit(idx)}
                                                            className="text-xs font-mono text-red-400 hover:text-red-300 transition duration-150 p-1 cursor-none"
                                                        >
                                                            Decommission Ring
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                                                                <span>Orbit Size (Radius)</span>
                                                                <span className="text-cyan-400 font-bold">{Math.round(orb.radius)} pixels</span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="20" 
                                                                max="450" 
                                                                value={orb.radius} 
                                                                onChange={(e) => updateOrbit(idx, { radius: parseFloat(e.target.value) })} 
                                                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                                                                <span>Inclination / Tilt Angle</span>
                                                                <span className="text-purple-400 font-bold">{Math.round(orb.tilt)}°</span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="-90" 
                                                                max="90" 
                                                                value={orb.tilt} 
                                                                onChange={(e) => updateOrbit(idx, { tilt: parseFloat(e.target.value) })} 
                                                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {orbits.length === 0 && selectedObject.hasOrbit && (
                                                <div className="p-4 bg-slate-900/40 border border-slate-800/65 rounded-xl space-y-3">
                                                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                                                        <span className="text-xs font-mono font-black text-slate-300">SINGLE COSMIC ORBIT</span>
                                                        <button 
                                                            onClick={() => addOrbit(selectedObject.orbitRadius, selectedObject.orbitInclination)}
                                                            className="text-xs text-cyan-400 hover:underline font-mono cursor-none"
                                                        >
                                                            Upgrade to Multi-System
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                                                                <span>Orbit Size (Radius)</span>
                                                                <span className="text-cyan-400 font-bold">{Math.round(selectedObject.orbitRadius || 50)} pixels</span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="20" 
                                                                max="450" 
                                                                value={selectedObject.orbitRadius || 50} 
                                                                onChange={(e) => updateSelectedObject?.({ orbitRadius: parseFloat(e.target.value) })} 
                                                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                                                                <span>Inclination / Tilt Angle</span>
                                                                <span className="text-purple-400 font-bold">{Math.round(selectedObject.orbitInclination || 0)}°</span>
                                                            </div>
                                                            <input 
                                                                type="range" 
                                                                min="-90" 
                                                                max="90" 
                                                                value={selectedObject.orbitInclination || 0} 
                                                                onChange={(e) => updateSelectedObject?.({ orbitInclination: parseFloat(e.target.value) })} 
                                                                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400" 
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })()
                    )}
                </div>
            )}

            {section === 'create' && selectedObject && (
                <div className="space-y-6">
                    {(() => {
                        const { addOrbit } = useOrbitControls(selectedObject, (id: string, updates: any) => updateSelectedObject?.(updates));
                        return (
                            <>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">Gravitational Intensity: {selectedObject.gravity || 0}%</label>
                                    <input type="range" min="0" max="1000" value={selectedObject.gravity || 0} onChange={(e) => updateSelectedObject?.({gravity: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">Light Intensity: {selectedObject.lightingIntensity || 0}%</label>
                                    <input type="range" min="0" max="100" value={selectedObject.lightingIntensity || 0} onChange={(e) => updateSelectedObject?.({lightingIntensity: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">Weight/Mass: {selectedObject.mass || 0}%</label>
                                    <input type="range" min="0" max="100" value={selectedObject.mass || 0} onChange={(e) => updateSelectedObject?.({mass: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                                </div>
                                
                                <div className="border-t border-slate-700 pt-4 mt-4">
                                    <button 
                                        className="w-full bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700"
                                        onClick={() => updateSelectedObject?.({isBinary: !selectedObject.isBinary, barycenterId: selectedObject.isBinary ? null : 'default-id' })}
                                    >
                                        {selectedObject.isBinary ? 'Remove Binary Orbit' : 'Add Binary Orbit'}
                                    </button>
                                    {selectedObject.isBinary && (
                                        <>
                                            <div className="mt-4">
                                                <label className="block text-slate-400 text-sm mb-1">Orbit Radius: {selectedObject.orbitRadius || 50}</label>
                                                <input type="range" min="10" max="300" value={selectedObject.orbitRadius || 50} onChange={(e) => updateSelectedObject?.({orbitRadius: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                                            </div>
                                            <div className="mt-4">
                                                <label className="block text-slate-400 text-sm mb-1">Rotation Speed: {selectedObject.orbitSpeed || 1}</label>
                                                <input type="range" min="0" max="5" step="0.1" value={selectedObject.orbitSpeed || 1} onChange={(e) => updateSelectedObject?.({orbitSpeed: parseFloat(e.target.value)})} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-white" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        );
                    })()}
                </div>
            )}
        </div>
    )
}

