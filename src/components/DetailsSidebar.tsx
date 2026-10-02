import React from 'react';
import { X, Trash2, Globe, Orbit, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

export const DetailsSidebar = ({
  object, 
  bodies = [],
  onClose, 
  updateObject, 
  onDelete
}: {
  object: any | null, 
  bodies?: any[],
  onClose: () => void, 
  updateObject: (id: string, props: any) => void,
  onDelete?: (id: string) => void
}) => {
  if (!object) return null;

  // Filter possible parents based on current object type
  const possibleParents = bodies.filter(b => {
    if (b.id === object.id) return false;
    if (object.type === 'orbit') {
      // Orbit rings can only orbit stars or black holes
      return b.type === 'star' || b.type === 'blackhole';
    } else {
      // Planets/Asteroids/etc can orbit stars, black holes, OR custom orbits!
      return b.type === 'star' || b.type === 'blackhole' || b.type === 'orbit';
    }
  });

  return (
    <div className="absolute top-4 right-4 z-50 w-80 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {object.type === 'blackhole' && <ShieldAlert className="w-5 h-5 text-purple-400" />}
          {object.type === 'star' && <Sparkles className="w-5 h-5 text-amber-400" />}
          {object.type === 'planet' && <Globe className="w-5 h-5 text-blue-400" />}
          {object.type === 'orbit' && <Orbit className="w-5 h-5 text-cyan-400" />}
          <h2 className="text-white font-bold tracking-wide text-sm uppercase">
            {object.name || 'Object Details'}
          </h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 font-mono text-xs text-slate-300">
        {/* Core Properties */}
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Name</label>
          <input 
            type="text"
            value={object.name} 
            onChange={(e) => updateObject(object.id, { name: e.target.value })} 
            className="w-full bg-slate-800/80 border border-slate-700 text-white p-2 rounded-xl focus:border-cyan-400 outline-none" 
          />
        </div>
        
        <div>
          <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Color Spec</label>
          <div className="flex gap-2 items-center">
            <input 
              type="color" 
              value={object.color || "#ffffff"} 
              onChange={(e) => updateObject(object.id, { color: e.target.value })} 
              className="w-10 h-8 bg-slate-800 rounded-xl cursor-pointer border border-slate-700" 
            />
            <span className="text-slate-400 font-mono text-[11px] uppercase">{object.color || '#FFFFFF'}</span>
          </div>
        </div>

        {/* Black Hole Custom Settings */}
        {object.type === 'blackhole' && (
          <div className="space-y-4 border-t border-slate-800/80 pt-3">
            <div className="bg-purple-950/20 border border-purple-500/20 p-2.5 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-purple-300 leading-normal">
                Black Hole Singularity: Pulls nearby orbiting planets and celestial objects inwards. Objects reaching the Event Horizon will shrink and spiral into the void.
              </p>
            </div>
            
            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Gravity Strength</span>
                <span className="text-purple-400">{object.gravity || 90} Gs</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="500" 
                value={object.gravity || 90} 
                onChange={(e) => updateObject(object.id, { gravity: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Event Horizon Radius</span>
                <span className="text-purple-400">{object.size || 18}</span>
              </div>
              <input 
                type="range" 
                min="8" 
                max="60" 
                value={object.size || 18} 
                onChange={(e) => updateObject(object.id, { size: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Accretion Spin Speed</span>
                <span className="text-purple-400">{object.rotationSpeed?.toFixed(1) || '1.5'} rad/s</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="5.0" 
                step="0.1"
                value={object.rotationSpeed || 1.5} 
                onChange={(e) => updateObject(object.id, { rotationSpeed: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500" 
              />
            </div>
          </div>
        )}

        {/* Orbit Custom Controls */}
        {object.type === 'orbit' && (
          <div className="space-y-4 border-t border-slate-800/80 pt-3">
            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Orbit Radius</span>
                <span className="text-cyan-400">{object.orbitRadius || object.size || 100} units</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="400" 
                value={object.orbitRadius || object.size || 100} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateObject(object.id, { orbitRadius: val, size: val });
                }} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Orbit Speed</span>
                <span className="text-cyan-400">{object.orbitSpeed?.toFixed(1) || '1.0'} rad/s</span>
              </div>
              <input 
                type="range" 
                min="-4.0" 
                max="4.0" 
                step="0.1"
                value={object.orbitSpeed !== undefined ? object.orbitSpeed : 1.0} 
                onChange={(e) => updateObject(object.id, { orbitSpeed: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>X Rotation (Inclination)</span>
                <span className="text-violet-400">{Math.round((object.rotationX || 0) * (180 / Math.PI))}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={2 * Math.PI} 
                step="0.05"
                value={object.rotationX || 0} 
                onChange={(e) => updateObject(object.id, { rotationX: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Y Rotation (Tilt)</span>
                <span className="text-violet-400">{Math.round((object.rotationY || 0) * (180 / Math.PI))}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={2 * Math.PI} 
                step="0.05"
                value={object.rotationY || 0} 
                onChange={(e) => updateObject(object.id, { rotationY: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Z Rotation (Precession)</span>
                <span className="text-violet-400">{Math.round((object.rotationZ || 0) * (180 / Math.PI))}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max={2 * Math.PI} 
                step="0.05"
                value={object.rotationZ || 0} 
                onChange={(e) => updateObject(object.id, { rotationZ: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500" 
              />
            </div>
          </div>
        )}

        {/* Other Types' Sizes & Speed */}
        {object.type !== 'blackhole' && object.type !== 'orbit' && (
          <div className="space-y-4 border-t border-slate-800/80 pt-3">
            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Size / Diameter</span>
                <span className="text-cyan-400">{object.size || 20} km</span>
              </div>
              <input 
                type="range" 
                min="3" 
                max="100" 
                value={object.size || 20} 
                onChange={(e) => updateObject(object.id, { size: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                <span>Axial Rotation Speed</span>
                <span className="text-cyan-400">{object.rotationSpeed?.toFixed(1) || '1.0'} rad/s</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="5.0" 
                step="0.1"
                value={object.rotationSpeed || 1.0} 
                onChange={(e) => updateObject(object.id, { rotationSpeed: parseFloat(e.target.value) })} 
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500" 
              />
            </div>
          </div>
        )}

        {/* Orbit Relationship Editor */}
        {(object.type === 'planet' || object.type === 'asteroid' || object.type === 'wormhole' || object.type === 'orbit') && (
          <div className="space-y-4 border-t border-slate-800/80 pt-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Orbit className="w-3.5 h-3.5 text-slate-400" /> Orbit Parent (Gravity Source)
              </label>
              <select
                value={object.orbitParentId || ''}
                onChange={(e) => {
                  const parentId = e.target.value || null;
                  if (!parentId) {
                    updateObject(object.id, { 
                      orbitParentId: null, 
                      orbitSpeed: 0,
                      orbitRadius: 0
                    });
                    return;
                  }

                  const parent = bodies.find(b => b.id === parentId);
                  if (parent) {
                    let cx = parent.x;
                    let cy = parent.y;
                    let isParentOrbit = parent.type === 'orbit';
                    
                    if (isParentOrbit) {
                      const orbitParent = bodies.find(b => b.id === parent.orbitParentId);
                      if (orbitParent) {
                        cx = orbitParent.x;
                        cy = orbitParent.y;
                      }
                    }

                    // Calculate initial angle relative to orbit center
                    let initialAngle = Math.atan2(object.y - cy, object.x - cx);

                    // Check other bodies sharing this orbit parent to prevent overlap
                    const siblings = bodies.filter(b => b.id !== object.id && b.orbitParentId === parentId);
                    let finalAngle = initialAngle;
                    let foundOverlap = true;
                    let attempts = 0;
                    while (foundOverlap && attempts < 32) {
                      foundOverlap = false;
                      for (const sibling of siblings) {
                        const siblingAngle = sibling.angle || 0;
                        const diff = Math.abs(((finalAngle - siblingAngle + Math.PI) % (Math.PI * 2)) - Math.PI);
                        if (diff < 0.4) { // within ~23 degrees
                          finalAngle += 0.5; // offset by ~28 degrees
                          foundOverlap = true;
                          break;
                        }
                      }
                      attempts++;
                    }

                    const r = isParentOrbit ? (parent.orbitRadius || parent.size || 100) : Math.round(Math.sqrt((object.x - parent.x) ** 2 + (object.y - parent.y) ** 2));

                    updateObject(object.id, { 
                      orbitParentId: parentId, 
                      orbitSpeed: 1.0,
                      orbitRadius: r,
                      angle: finalAngle,
                      x: cx + Math.cos(finalAngle) * r,
                      y: cy + Math.sin(finalAngle) * r
                    });
                  }
                }}
                className="w-full bg-slate-800/80 border border-slate-700 text-white p-2 rounded-xl focus:border-cyan-400 outline-none cursor-pointer"
              >
                <option value="">Static (No Orbit Parent)</option>
                {possibleParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.name} ({parent.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {object.orbitParentId && (() => {
              const parent = bodies.find(b => b.id === object.orbitParentId);
              const isParentOrbit = parent?.type === 'orbit';
              
              if (isParentOrbit) {
                return (
                  <div>
                    <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                      <span>Starting Angle</span>
                      <span className="text-amber-400">{Math.round((object.angle || 0) * (180 / Math.PI))}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max={2 * Math.PI} 
                      step="0.05"
                      value={object.angle || 0} 
                      onChange={(e) => {
                        const newAngle = parseFloat(e.target.value);
                        let cx = parent.x;
                        let cy = parent.y;
                        const orbitParent = bodies.find(b => b.id === parent.orbitParentId);
                        if (orbitParent) {
                          cx = orbitParent.x;
                          cy = orbitParent.y;
                        }
                        const r = parent.orbitRadius || parent.size || 100;
                        updateObject(object.id, {
                          angle: newAngle,
                          x: cx + Math.cos(newAngle) * r,
                          y: cy + Math.sin(newAngle) * r
                        });
                      }} 
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                  </div>
                );
              }

              return (
                <>
                  <div>
                    <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                      <span>Orbit Speed</span>
                      <span className="text-amber-400">{object.orbitSpeed?.toFixed(1) || '1.0'} rad/s</span>
                    </div>
                    <input 
                      type="range" 
                      min="-4.0" 
                      max="4.0" 
                      step="0.1"
                      value={object.orbitSpeed || 0} 
                      onChange={(e) => updateObject(object.id, { orbitSpeed: parseFloat(e.target.value) })} 
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                      <span>Orbit Radius (Distance)</span>
                      <span className="text-amber-400">{object.orbitRadius || 100} units</span>
                    </div>
                    <input 
                      type="range" 
                      min="30" 
                      max="400" 
                      value={object.orbitRadius || 100} 
                      onChange={(e) => {
                        const newRadius = parseFloat(e.target.value);
                        if (parent) {
                          const angle = Math.atan2(object.y - parent.y, object.x - parent.x);
                          updateObject(object.id, {
                            orbitRadius: newRadius,
                            x: parent.x + Math.cos(angle) * newRadius,
                            y: parent.y + Math.sin(angle) * newRadius
                          });
                        } else {
                          updateObject(object.id, { orbitRadius: newRadius });
                        }
                      }} 
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Delete Body */}
        {onDelete && (
          <div className="border-t border-slate-800/80 pt-4 mt-2">
            <button 
              onClick={() => onDelete(object.id)}
              className="w-full flex items-center justify-center gap-2 bg-rose-600/15 hover:bg-rose-600/35 text-rose-400 border border-rose-500/20 p-2.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Decommission Body
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

