
export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'buff' | 'debuff' | 'neutral';
  duration: number; // in waves, -1 for permanent
  effects: {
    enemySpeedMultiplier?: number;
    enemyHealthMultiplier?: number;
    towerDamageMultiplier?: number;
    coinMultiplier?: number;
    spawnRateMultiplier?: number;
  };
}

export const RANDOM_EVENTS: GameEvent[] = [
  {
    id: 'storm',
    name: 'Ion Storm',
    description: 'Electronic interference reduces tower fire rate by 25%',
    type: 'debuff',
    duration: 3,
    effects: { towerDamageMultiplier: 0.75 }
  },
  {
    id: 'boost',
    name: 'Tactical Boost',
    description: 'Military support increases tower damage by 50%',
    type: 'buff',
    duration: 2,
    effects: { towerDamageMultiplier: 1.5 }
  },
  {
    id: 'rush',
    name: 'Enemy Rush',
    description: 'Enemies move 40% faster but spawn 30% slower',
    type: 'neutral',
    duration: 3,
    effects: { enemySpeedMultiplier: 1.4, spawnRateMultiplier: 0.7 }
  },
  {
    id: 'wealth',
    name: 'Resource Cache',
    description: 'Double coin rewards for 2 waves',
    type: 'buff',
    duration: 2,
    effects: { coinMultiplier: 2.0 }
  },
  {
    id: 'mutation',
    name: 'Genetic Mutation',
    description: 'Enemies have 25% more health but move 15% slower',
    type: 'neutral',
    duration: 4,
    effects: { enemyHealthMultiplier: 1.25, enemySpeedMultiplier: 0.85 }
  }
];

export function getRandomEvent(wave: number): GameEvent | null {
  // Don't trigger events in first 3 waves
  if (wave <= 3) return null;
  
  // 30% chance per wave after wave 3
  if (Math.random() > 0.3) return null;
  
  // Higher waves can get more intense events
  const availableEvents = RANDOM_EVENTS.filter(event => {
    if (wave <= 10) return event.type !== 'debuff';
    return true;
  });
  
  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
}
