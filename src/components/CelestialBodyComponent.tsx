import React from 'react';
import { motion } from 'motion/react';
import { useLongPress } from '../hooks/useLongPress';

export const CelestialBodyComponent = ({
    body,
    isAnimating,
    setSelectedBodyForInspector,
    handleBodyClick,
    selectedId,
    bodyColor,
    handleDragEnd,
    setIsDragging
}: any) => {
    
    const longPress = useLongPress((e) => {
        setSelectedBodyForInspector(body);
    }, 500);

    const commonProps = {
        animate: isAnimating ? { rotate: 360 * (body.rotationSpeed || 1) } : {},
        transition: isAnimating ? { repeat: Infinity, duration: 2 / (body.rotationSpeed || 1), ease: "linear" as const } : {},
        drag: true,
        dragConstraints: { left: 0, right: 1000, top: 0, bottom: 600 },
        dragMomentum: false,
        onDragStart: () => {setIsDragging(true);},
        onDragEnd: (_e: any, info: any) => {
            setIsDragging(false);
            handleDragEnd(body.id, info);
        },
        onPointerDown: (e: any) => {
            e.stopPropagation();
            longPress.onPointerDown(e);
            handleBodyClick(body.id);
        },
        onPointerUp: (e: any) => {
            longPress.onPointerUp();
        },
        className: `cursor-pointer pointer-events-auto ${selectedId === body.id ? 'stroke-white stroke-2' : ''}`
    };

    if (body.type === 'asteroid') {
        const p1 = `${body.x + body.size + (Math.random()-0.5)*3} ${body.y + (Math.random()-0.5)*3}`;
        const p2 = `${body.x + (Math.random()-0.5)*3} ${body.y + body.size + (Math.random()-0.5)*3}`;
        const p3 = `${body.x - body.size + (Math.random()-0.5)*3} ${body.y + (Math.random()-0.5)*3}`;
        const p4 = `${body.x + (Math.random()-0.5)*3} ${body.y - body.size + (Math.random()-0.5)*3}`;
        
        return (
            <g key={body.id}>
                <text 
                    x={body.x} 
                    y={body.y - body.size - 6} 
                    fill="rgba(255,255,255,0.6)" 
                    fontSize="7" 
                    fontFamily="monospace" 
                    textAnchor="middle" 
                    className="pointer-events-none select-none tracking-widest text-[7px]"
                >
                    {body.name}
                </text>
                <motion.path
                    {...commonProps}
                    d={`M ${p1} L ${p2} L ${p3} L ${p4} Z`}
                    fill="rgba(255, 255, 255, 0.04)"
                    stroke={selectedId === body.id ? '#22d3ee' : 'rgba(255,255,255,0.3)'}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                />
            </g>
        );
    }

    return (
        <g key={body.id}>
            {/* Elegant cyber tracking telemetry readouts */}
            <text 
                x={body.x} 
                y={body.y - body.size - 8} 
                fill={selectedId === body.id ? '#22d3ee' : 'rgba(255, 255, 255, 0.75)'} 
                fontSize="8" 
                fontFamily="monospace" 
                textAnchor="middle" 
                className="pointer-events-none select-none tracking-wider uppercase font-bold"
            >
                {body.name}
            </text>
            
            {/* Invisible high-fidelity click, inspection, and drag handle target circle */}
            <motion.circle
                {...commonProps}
                cx={body.x}
                cy={body.y}
                r={body.size}
                fill="rgba(255, 255, 255, 0.03)"
                stroke={selectedId === body.id ? '#22d3ee' : 'rgba(255, 255, 255, 0.22)'}
                strokeWidth={selectedId === body.id ? '2' : '1'}
                strokeDasharray="4 3"
                style={{ originX: '50%', originY: '50%' }}
            />
            
            {/* Subtle external scanner radar sweeping effect around the active selected celestial planet */}
            {selectedId === body.id && (
                <circle
                    cx={body.x}
                    cy={body.y}
                    r={body.size + 10}
                    fill="none"
                    stroke="rgba(34, 211, 238, 0.2)"
                    strokeWidth="0.75"
                    className="animate-pulse pointer-events-none"
                    strokeDasharray="8 8"
                />
            )}
        </g>
    );
};
