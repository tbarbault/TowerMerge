export interface ResearchNode {
  id: string;
  name: string;
  description: string;
  branch: 'turret' | 'mortar' | 'consumables';
  cost: number;
  prerequisites: string[];
  tier: number;
  effect: {
    type: 'damage_multiplier' | 'fire_rate_multiplier' | 'mine_damage_bonus' | 'mine_cost_reduction';
    value: number;
  };
  unlocked: boolean;
  purchased: boolean;
}

export const researchTreeData: ResearchNode[] = [
  // Turret Branch - Tier 1
  {
    id: 'turret_damage_1',
    name: 'Enhanced Ammunition',
    description: '+15% turret damage',
    branch: 'turret',
    cost: 10,
    prerequisites: [],
    tier: 1,
    effect: { type: 'damage_multiplier', value: 1.15 },
    unlocked: true,
    purchased: false
  },
  {
    id: 'turret_fire_rate_1',
    name: 'Improved Loading',
    description: '+20% turret fire rate',
    branch: 'turret',
    cost: 10,
    prerequisites: [],
    tier: 1,
    effect: { type: 'fire_rate_multiplier', value: 1.2 },
    unlocked: true,
    purchased: false
  },

  // Turret Branch - Tier 2
  {
    id: 'turret_damage_2',
    name: 'Armor Piercing Rounds',
    description: '+25% turret damage',
    branch: 'turret',
    cost: 20,
    prerequisites: ['turret_damage_1'],
    tier: 2,
    effect: { type: 'damage_multiplier', value: 1.25 },
    unlocked: false,
    purchased: false
  },
  {
    id: 'turret_fire_rate_2',
    name: 'Auto-Loading System',
    description: '+30% turret fire rate',
    branch: 'turret',
    cost: 20,
    prerequisites: ['turret_fire_rate_1'],
    tier: 2,
    effect: { type: 'fire_rate_multiplier', value: 1.3 },
    unlocked: false,
    purchased: false
  },

  // Turret Branch - Tier 3
  {
    id: 'turret_damage_3',
    name: 'Depleted Uranium Shells',
    description: '+40% turret damage',
    branch: 'turret',
    cost: 30,
    prerequisites: ['turret_damage_2'],
    tier: 3,
    effect: { type: 'damage_multiplier', value: 1.4 },
    unlocked: false,
    purchased: false
  },
  {
    id: 'turret_fire_rate_3',
    name: 'Rapid Fire Protocol',
    description: '+50% turret fire rate',
    branch: 'turret',
    cost: 30,
    prerequisites: ['turret_fire_rate_2'],
    tier: 3,
    effect: { type: 'fire_rate_multiplier', value: 1.5 },
    unlocked: false,
    purchased: false
  },

  // Mortar Branch - Tier 1
  {
    id: 'mortar_damage_1',
    name: 'High Explosive Shells',
    description: '+15% mortar damage',
    branch: 'mortar',
    cost: 10,
    prerequisites: [],
    tier: 1,
    effect: { type: 'damage_multiplier', value: 1.15 },
    unlocked: true,
    purchased: false
  },
  {
    id: 'mortar_fire_rate_1',
    name: 'Rapid Deployment',
    description: '+20% mortar fire rate',
    branch: 'mortar',
    cost: 10,
    prerequisites: [],
    tier: 1,
    effect: { type: 'fire_rate_multiplier', value: 1.2 },
    unlocked: true,
    purchased: false
  },

  // Mortar Branch - Tier 2
  {
    id: 'mortar_damage_2',
    name: 'Cluster Munitions',
    description: '+25% mortar damage',
    branch: 'mortar',
    cost: 20,
    prerequisites: ['mortar_damage_1'],
    tier: 2,
    effect: { type: 'damage_multiplier', value: 1.25 },
    unlocked: false,
    purchased: false
  },
  {
    id: 'mortar_fire_rate_2',
    name: 'Advanced Targeting',
    description: '+30% mortar fire rate',
    branch: 'mortar',
    cost: 20,
    prerequisites: ['mortar_fire_rate_1'],
    tier: 2,
    effect: { type: 'fire_rate_multiplier', value: 1.3 },
    unlocked: false,
    purchased: false
  },

  // Mortar Branch - Tier 3
  {
    id: 'mortar_damage_3',
    name: 'Thermobaric Warheads',
    description: '+40% mortar damage',
    branch: 'mortar',
    cost: 30,
    prerequisites: ['mortar_damage_2'],
    tier: 3,
    effect: { type: 'damage_multiplier', value: 1.4 },
    unlocked: false,
    purchased: false
  },
  {
    id: 'mortar_fire_rate_3',
    name: 'Synchronized Barrage',
    description: '+50% mortar fire rate',
    branch: 'mortar',
    cost: 30,
    prerequisites: ['mortar_fire_rate_2'],
    tier: 3,
    effect: { type: 'fire_rate_multiplier', value: 1.5 },
    unlocked: false,
    purchased: false
  },

  // Consumables Branch - Tier 1
  {
    id: 'mine_damage_1',
    name: 'Enhanced Explosives',
    description: '+50% mine damage',
    branch: 'consumables',
    cost: 10,
    prerequisites: [],
    tier: 1,
    effect: { type: 'mine_damage_bonus', value: 1.5 },
    unlocked: true,
    purchased: false
  },
  {
    id: 'mine_cost_1',
    name: 'Mass Production',
    description: '-20% mine cost',
    branch: 'consumables',
    cost: 10,
    prerequisites: [],
    tier: 1,
    effect: { type: 'mine_cost_reduction', value: 0.8 },
    unlocked: true,
    purchased: false
  },

  // Consumables Branch - Tier 2
  {
    id: 'mine_damage_2',
    name: 'Shaped Charges',
    description: '+75% mine damage',
    branch: 'consumables',
    cost: 20,
    prerequisites: ['mine_damage_1'],
    tier: 2,
    effect: { type: 'mine_damage_bonus', value: 1.75 },
    unlocked: false,
    purchased: false
  },
  {
    id: 'mine_cost_2',
    name: 'Efficient Manufacturing',
    description: '-35% mine cost',
    branch: 'consumables',
    cost: 20,
    prerequisites: ['mine_cost_1'],
    tier: 2,
    effect: { type: 'mine_cost_reduction', value: 0.65 },
    unlocked: false,
    purchased: false
  },

  // Consumables Branch - Tier 3
  {
    id: 'mine_damage_3',
    name: 'Nuclear Mines',
    description: '+150% mine damage',
    branch: 'consumables',
    cost: 30,
    prerequisites: ['mine_damage_2'],
    tier: 3,
    effect: { type: 'mine_damage_bonus', value: 2.5 },
    unlocked: false,
    purchased: false
  },
  {
    id: 'mine_cost_3',
    name: 'Automated Assembly',
    description: '-50% mine cost',
    branch: 'consumables',
    cost: 30,
    prerequisites: ['mine_cost_2'],
    tier: 3,
    effect: { type: 'mine_cost_reduction', value: 0.5 },
    unlocked: false,
    purchased: false
  }
];

export function calculateResearchBonuses(researchNodes: ResearchNode[]) {
  const bonuses = {
    turretDamageMultiplier: 1,
    turretFireRateMultiplier: 1,
    mortarDamageMultiplier: 1,
    mortarFireRateMultiplier: 1,
    mineDamageMultiplier: 1,
    mineCostMultiplier: 1
  };

  researchNodes.forEach(node => {
    if (node.purchased) {
      switch (node.effect.type) {
        case 'damage_multiplier':
          if (node.branch === 'turret') {
            bonuses.turretDamageMultiplier *= node.effect.value;
          } else if (node.branch === 'mortar') {
            bonuses.mortarDamageMultiplier *= node.effect.value;
          }
          break;
        case 'fire_rate_multiplier':
          if (node.branch === 'turret') {
            bonuses.turretFireRateMultiplier *= node.effect.value;
          } else if (node.branch === 'mortar') {
            bonuses.mortarFireRateMultiplier *= node.effect.value;
          }
          break;
        case 'mine_damage_bonus':
          bonuses.mineDamageMultiplier *= node.effect.value;
          break;
        case 'mine_cost_reduction':
          bonuses.mineCostMultiplier *= node.effect.value;
          break;
      }
    }
  });

  return bonuses;
}

export function unlockResearchNodes(researchNodes: ResearchNode[]): ResearchNode[] {
  return researchNodes.map(node => {
    if (node.unlocked) return node;
    
    const allPrereqsMet = node.prerequisites.every(prereqId => 
      researchNodes.find(n => n.id === prereqId)?.purchased === true
    );
    
    return { ...node, unlocked: allPrereqsMet };
  });
}

export function getDiamondsForWave(wave: number): number {
  if (wave % 5 === 0) {
    return Math.floor(wave / 5);
  }
  return 0;
}