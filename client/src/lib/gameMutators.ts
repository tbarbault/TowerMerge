
export interface GameMutator {
  id: string;
  name: string;
  description: string;
  effects: {
    startingCoins?: number;
    startingLives?: number;
    towerCostMultiplier?: number;
    upgradeCostMultiplier?: number;
    enemyCountMultiplier?: number;
    specialRules?: string[];
  };
}

export const GAME_MUTATORS: GameMutator[] = [
  {
    id: 'poverty',
    name: 'Economic Crisis',
    description: 'Start with half coins, towers cost 25% more',
    effects: {
      startingCoins: 5,
      towerCostMultiplier: 1.25
    }
  },
  {
    id: 'abundance',
    name: 'Resource Abundance',
    description: 'Start with double coins, but face 50% more enemies',
    effects: {
      startingCoins: 20,
      enemyCountMultiplier: 1.5
    }
  },
  {
    id: 'fragile',
    name: 'Glass Cannon',
    description: 'Towers do double damage but cost 50% more to upgrade',
    effects: {
      upgradeCostMultiplier: 1.5,
      specialRules: ['doubleDamage']
    }
  },
  {
    id: 'rush',
    name: 'Time Pressure',
    description: 'Only 2 lives, but enemies give double rewards',
    effects: {
      startingLives: 2,
      specialRules: ['doubleRewards']
    }
  }
];

export function getRandomMutators(count: number = 1): GameMutator[] {
  const shuffled = [...GAME_MUTATORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
