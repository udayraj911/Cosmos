import React from 'react';

interface OrbitSystemProps {
  bodies: any[];
}

export const OrbitSystem: React.FC<OrbitSystemProps> = ({ bodies }) => {
  return (
    <>
      {bodies.map(body => {
        if (!body.hasOrbit) return null;
        return (
          <ellipse
            key={`orbit-${body.id}`}
            cx={body.x}
            cy={body.y}
            rx={body.orbitRadius}
            ry={body.orbitRadius * Math.cos(body.orbitInclination * Math.PI / 180)}
            fill="none"
            stroke="white"
            strokeWidth="1"
            className="opacity-50"
          />
        );
      })}
    </>
  );
};
