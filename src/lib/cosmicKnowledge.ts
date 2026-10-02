export const COSMOS_FEATURES = {
  aiCreator: "Synthesize 3D celestial bodies: 'Make a Planet named X', 'Add a black hole', 'Create a wormhole'.",
  builder: "Manage planetary orbit assignments in the Cosmos Builder.",
  spacetime: "Bridge different solar systems using Einstein-Rosen Wormholes.",
  inspector: "Long-press on a 3D object to inspect detailed scientific data.",
  knowledge: "Play the Knowledge Quest to increase your Galactic XP."
};

export const getFeatureHelp = (query: string) => {
    const q = query.toLowerCase();
    if (q.includes('create') || q.includes('make') || q.includes('add')) return COSMOS_FEATURES.aiCreator;
    if (q.includes('inspect') || q.includes('data')) return COSMOS_FEATURES.inspector;
    if (q.includes('bridge') || q.includes('portal') || q.includes('wormhole')) return COSMOS_FEATURES.spacetime;
    if (q.includes('build') || q.includes('orbit')) return COSMOS_FEATURES.builder;
    if (q.includes('quiz') || q.includes('rank') || q.includes('quest')) return COSMOS_FEATURES.knowledge;
    return `I can help with: ${Object.values(COSMOS_FEATURES).join(' ')}`;
};
