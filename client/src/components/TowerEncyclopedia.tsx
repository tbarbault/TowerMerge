import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Target, Bomb, Zap, Shield, Eye, Clock } from "lucide-react";

interface TowerData {
  type: 'turret' | 'mortar';
  name: string;
  baseDamage: number;
  baseRange: number;
  baseFireRate: number;
  cost: number;
  description: string;
  strengths: string[];
  weaknesses: string[];
  tacticalNotes: string[];
  upgradePath: {
    level: number;
    damage: number;
    range: number;
    fireRate: number;
    description: string;
  }[];
}

const towerDatabase: TowerData[] = [
  {
    type: 'turret',
    name: 'Defense Turret',
    baseDamage: 25,
    baseRange: 3.5,
    baseFireRate: 800,
    cost: 15,
    description: 'A reliable single-target defense tower with high accuracy and consistent damage output. The backbone of any defensive strategy.',
    strengths: [
      'High accuracy against single targets',
      'Fast reload time',
      'Cost-effective damage per coin',
      'Excellent against fast enemies'
    ],
    weaknesses: [
      'Cannot damage multiple enemies',
      'Limited range compared to mortars',
      'Struggles against heavily armored foes'
    ],
    tacticalNotes: [
      'Place near enemy paths for maximum efficiency',
      'Merge identical levels to create powerful upgrades',
      'Best positioned to cover chokepoints',
      'Combine with mortars for balanced defense'
    ],
    upgradePath: [
      {
        level: 1,
        damage: 25,
        range: 3.5,
        fireRate: 800,
        description: 'Basic turret with standard capabilities'
      },
      {
        level: 2,
        damage: 55,
        range: 4.0,
        fireRate: 680,
        description: 'Enhanced targeting system and improved ammunition'
      },
      {
        level: 3,
        damage: 121,
        range: 4.6,
        fireRate: 578,
        description: 'Advanced barrel design with explosive rounds'
      },
      {
        level: 4,
        damage: 266,
        range: 5.3,
        fireRate: 491,
        description: 'Military-grade targeting computer and armor-piercing shells'
      },
      {
        level: 5,
        damage: 585,
        range: 6.1,
        fireRate: 417,
        description: 'Ultimate defense system with plasma-enhanced ammunition'
      }
    ]
  },
  {
    type: 'mortar',
    name: 'Artillery Mortar',
    baseDamage: 60,
    baseRange: 5.0,
    baseFireRate: 1800,
    cost: 25,
    description: 'A heavy artillery piece that launches explosive shells over long distances. Devastates groups of enemies with area-of-effect damage.',
    strengths: [
      'Massive area-of-effect damage',
      'Long range capabilities',
      'Effective against enemy clusters',
      'Can damage multiple enemies simultaneously'
    ],
    weaknesses: [
      'Slow reload time',
      'Higher cost than turrets',
      'Less effective against single fast targets',
      'Projectile travel time allows enemies to move'
    ],
    tacticalNotes: [
      'Position to cover multiple enemy paths',
      'Excellent for dealing with swarms',
      'Upgrade to increase explosion radius',
      'Best placed behind front-line turrets'
    ],
    upgradePath: [
      {
        level: 1,
        damage: 60,
        range: 5.0,
        fireRate: 1800,
        description: 'Standard mortar with basic explosive shells'
      },
      {
        level: 2,
        damage: 132,
        range: 5.75,
        fireRate: 1530,
        description: 'Improved targeting system and enhanced explosives'
      },
      {
        level: 3,
        damage: 290,
        range: 6.6,
        fireRate: 1300,
        description: 'High-explosive shells with increased blast radius'
      },
      {
        level: 4,
        damage: 638,
        range: 7.6,
        fireRate: 1105,
        description: 'Advanced artillery system with cluster munitions'
      },
      {
        level: 5,
        damage: 1404,
        range: 8.7,
        fireRate: 939,
        description: 'Ultimate siege weapon with devastation-class ordnance'
      }
    ]
  }
];

interface TowerEncyclopediaProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TowerEncyclopedia({ isOpen, onClose }: TowerEncyclopediaProps) {
  const [selectedTower, setSelectedTower] = useState<TowerData | null>(null);

  if (!isOpen) return null;

  const getTypeColor = (type: 'turret' | 'mortar') => {
    return type === 'turret' ? 'text-blue-400 border-blue-400' : 'text-orange-400 border-orange-400';
  };

  const getTypeIcon = (type: 'turret' | 'mortar') => {
    return type === 'turret' ? <Target className="w-4 h-4" /> : <Bomb className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 md:p-4">
      <Card className="w-full h-full md:max-w-5xl md:max-h-[95vh] overflow-hidden bg-gray-900 border-gray-700 md:rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-800 border-b border-gray-700 px-3 pt-8 pb-2 md:px-4 md:pt-10 md:pb-3">
          <CardTitle className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            Tower Encyclopedia
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0 flex h-[calc(100vh-3rem)] md:h-[calc(95vh-4rem)]">
          {/* Tower List */}
          <div className={`${selectedTower ? 'hidden md:block md:w-1/3' : 'w-full md:w-1/3'} border-r border-gray-700 overflow-y-auto`}>
            <div className="p-2 md:p-4 space-y-2 md:space-y-3">
              {towerDatabase.map((tower) => (
                <div
                  key={tower.type}
                  className={`p-2 md:p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTower?.type === tower.type
                      ? "bg-blue-900 border-blue-500"
                      : "bg-gray-800 border-gray-600 hover:bg-gray-700"
                  }`}
                  onClick={() => setSelectedTower(tower)}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex items-center justify-center flex-shrink-0">
                      {getTypeIcon(tower.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">
                          {tower.name}
                        </h3>
                        <Badge className={`text-xs px-1 py-0 ${getTypeColor(tower.type)}`}>
                          {tower.cost}💰
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-400 space-y-1">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {tower.baseDamage}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {tower.baseRange}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {(tower.baseFireRate / 1000).toFixed(1)}s
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tower Details */}
          {selectedTower && (
            <div className={`${selectedTower ? 'w-full md:w-2/3' : 'hidden'} overflow-y-auto`}>
              <div className="p-3 md:p-6">
                {/* Back button for mobile */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTower(null)}
                  className="md:hidden mb-4 text-gray-400 hover:text-white"
                >
                  ← Back to List
                </Button>

                {/* Header */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(selectedTower.type)}
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                      {selectedTower.name}
                    </h2>
                    <Badge className={`${getTypeColor(selectedTower.type)} text-sm`}>
                      {selectedTower.cost} Coins
                    </Badge>
                  </div>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                    {selectedTower.description}
                  </p>
                </div>

                {/* Base Stats */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    Base Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <div className="text-lg md:text-xl font-bold text-red-400">{selectedTower.baseDamage}</div>
                      <div className="text-xs text-gray-400">Damage</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <div className="text-lg md:text-xl font-bold text-blue-400">{selectedTower.baseRange}</div>
                      <div className="text-xs text-gray-400">Range</div>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-lg text-center">
                      <div className="text-lg md:text-xl font-bold text-green-400">{(selectedTower.baseFireRate / 1000).toFixed(1)}s</div>
                      <div className="text-xs text-gray-400">Fire Rate</div>
                    </div>
                  </div>
                </div>

                {/* Upgrade Path */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Upgrade Path
                  </h3>
                  <div className="space-y-2">
                    {selectedTower.upgradePath.map((upgrade, index) => (
                      <div key={upgrade.level} className="bg-gray-800 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-yellow-600 text-yellow-100">
                            Level {upgrade.level}
                          </Badge>
                          <div className="flex gap-4 text-xs">
                            <span className="text-red-400">{upgrade.damage} DMG</span>
                            <span className="text-blue-400">{upgrade.range} RNG</span>
                            <span className="text-green-400">{(upgrade.fireRate / 1000).toFixed(1)}s</span>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{upgrade.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4 mb-4 md:mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-3">Strengths</h3>
                    <ul className="space-y-2">
                      {selectedTower.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-0.5">+</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-3">Weaknesses</h3>
                    <ul className="space-y-2">
                      {selectedTower.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-400 mt-0.5">-</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tactical Notes */}
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Tactical Notes</h3>
                  <ul className="space-y-2">
                    {selectedTower.tacticalNotes.map((note, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}