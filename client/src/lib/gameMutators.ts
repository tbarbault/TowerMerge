
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
    id: 'normal',
    name: 'Normal',
    description: 'Standard game mode with balanced difficulty',
    effects: {
      startingCoins: 75,
      startingLives: 20
    }
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    description: 'Only 1 life - survive as long as you can!',
    effects: {
      startingCoins: 75,
      startingLives: 1
    }
  },
  {
    id: 'legend',
    name: 'Legend',
    description: '1 life, 50 coins, turrets cost 20, mortars cost 30',
    effects: {
      startingCoins: 50,
      startingLives: 1,
      specialRules: ['customTowerCosts']
    }
  }
];

export function getRandomMutators(count: number = 1): GameMutator[] {
  const shuffled = [...GAME_MUTATORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
