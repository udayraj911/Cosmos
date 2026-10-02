import React from 'react';

interface BinaryOrbitSystemProps {
  bodies: any[];
}

export const BinaryOrbitSystem: React.FC<BinaryOrbitSystemProps> = ({ bodies }) => {
  return (
    <>
      {bodies.map(body => {
        if (!body.isBinary || !body.barycenterId) return null;
        
        const barycenter = bodies.find(b => b.id === body.barycenterId);
        if (!barycenter) return null;

        return (
          <circle
            key={`binary-orbit-${body.id}`}
            cx={barycenter.x}
            cy={barycenter.y}
            r={body.orbitRadius}
            fill="none"
            stroke="white"
            strokeWidth="1"
            className="opacity-40"
            strokeDasharray="4 4"
          />
        );
      })}
    </>
  );
};
