export const useOrbitControls = (body: any, updateBody: (id: string, updates: any) => void) => {
    const addOrbit = (radius?: number, tilt?: number) => {
        const currentOrbits = body.orbits || [];
        const newRadius = radius !== undefined ? radius : (body.orbitRadius || 75 + currentOrbits.length * 35);
        const newTilt = tilt !== undefined ? tilt : (body.orbitInclination || 15);
        
        const updatedOrbits = [
            ...currentOrbits,
            { radius: newRadius, tilt: newTilt }
        ];

        updateBody(body.id, { 
            hasOrbit: true, 
            orbits: updatedOrbits,
            orbitRadius: newRadius, // fallback compatibility
            orbitInclination: newTilt // fallback compatibility
        });
    };

    const removeOrbit = (index: number) => {
        const currentOrbits = body.orbits ? [...body.orbits] : [];
        currentOrbits.splice(index, 1);
        
        updateBody(body.id, {
            orbits: currentOrbits,
            hasOrbit: currentOrbits.length > 0
        });
    };

    const updateOrbit = (index: number, updates: { radius?: number; tilt?: number }) => {
        const currentOrbits = body.orbits ? [...body.orbits] : [];
        if (currentOrbits[index]) {
            currentOrbits[index] = { ...currentOrbits[index], ...updates };
        }
        
        const firstOrbit = currentOrbits[0] || {};
        updateBody(body.id, {
            orbits: currentOrbits,
            orbitRadius: firstOrbit.radius !== undefined ? firstOrbit.radius : body.orbitRadius,
            orbitInclination: firstOrbit.tilt !== undefined ? firstOrbit.tilt : body.orbitInclination
        });
    };

    const setOrbitRadius = (radius: number) => {
        updateBody(body.id, { orbitRadius: radius });
    };

    const setOrbitInclination = (inclination: number) => {
        updateBody(body.id, { orbitInclination: inclination });
    };

    return { addOrbit, removeOrbit, updateOrbit, setOrbitRadius, setOrbitInclination };
};

