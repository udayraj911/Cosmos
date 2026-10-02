export enum ExplorationLevel {
  COSMOS_SPHERE = 0,
  MULTIVERSE = 1,
  GALAXIES = 2,
  SOLAR_SYSTEMS = 3,
  PLANET_VIEW = 4,
  PHENOMENA = 5,
}

export interface Universe {
  id: string;
  name: string;
  color: string;
  age: string;
  diameter: string;
  galaxiesCount: string;
  composition: string;
  specialFeature: string;
  description: string;
  fact: string;
}

export interface Galaxy {
  id: string;
  name: string;
  type: string;
  diameter: string;
  starsCount: string;
  supermassiveBlackHole: string;
  description: string;
  fact: string;
  color: string;
}

export interface SolarSystem {
  id: string;
  name: string;
  starType: string;
  starTemp: string;
  planetsCount: number;
  age: string;
  hasBlackHole: boolean;
  description: string;
  timeDilation?: boolean;
}

export interface Planet {
  id: string;
  name: string;
  type: string;
  radius: number; // visual scale representation
  color: string;
  realDiameter: string;
  tempRange: string;
  moonsCount: number;
  composition: string;
  specialFeature: string;
  description: string;
  emissive?: boolean;
  emissiveIntensity?: number;
  hasRings?: boolean;
  atmosphereColor?: string;
  animationType?: 'none' | 'pulsing' | 'flicker' | 'alien';
}

export interface CosmicPhenomena {
  id: string;
  name: string;
  description: string;
  stats: string;
  fact: string;
  type: 'blackhole' | 'wormhole' | 'pulsar' | 'darkmatter' | 'inflation' | 'gravitationalwave' | 'darkenergy' | 'quantum' | 'timedilation' | 'milestones' | 'spacetimecurvature';
}

export interface UserStats {
  xp: number;
  answerHistory: Record<number, boolean>;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
  category: 'normal' | 'advanced';
}

export interface UserCelestialObject {
  id: string;
  name: string;
  type: string;
  color: string;
  size: number;
  speed: number;
  distance: number;
  hasRings?: boolean;
  animationType?: 'none' | 'alien' | 'plasma';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  timestamp: string;
  diagramSvg?: string;
}
