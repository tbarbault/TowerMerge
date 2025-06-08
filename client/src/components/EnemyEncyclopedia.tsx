import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Shield, Zap, Heart, Clock, Target, Info } from "lucide-react";

interface EnemyData {
  type: string;
  name: string;
  health: number;
  speed: number;
  reward: number;
  color: string;
  size: number;
  lore: string;
  strengths: string[];
  weaknesses: string[];
  tacticalNotes: string[];
  firstAppearsWave: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Very Hard" | "Extreme" | "Legendary";
}

const enemyDatabase: EnemyData[] = [
  {
    type: "basic",
    name: "Crimson Crawler",
    health: 220,
    speed: 1.2,
    reward: 1,
    color: "#ef4444",
    size: 0.3,
    lore: "The most common threat from the depths, these crimson entities are the scouts of a much larger invasion force. Born from corrupted energy, they move with singular purpose toward your base. Though individually weak, their numbers can overwhelm unprepared defenders.",
    strengths: ["Fast spawning", "Predictable movement", "Low cost to eliminate"],
    weaknesses: ["Low health", "Slow movement", "Vulnerable to all tower types"],
    tacticalNotes: [
      "Perfect target for early turret practice",
      "Use these to test tower placement strategies",
      "Don't underestimate large groups in later waves"
    ],
    firstAppearsWave: 1,
    difficulty: "Easy"
  },
  {
    type: "fast",
    name: "Verdant Dasher",
    health: 180,
    speed: 2.0,
    reward: 2,
    color: "#22c55e",
    size: 0.25,
    lore: "Enhanced with bio-organic augmentations, these green speedsters can outrun most defensive measures. Their reduced mass allows for incredible velocity, but at the cost of structural integrity. Originally created as messenger units, they've been repurposed for rapid assault missions.",
    strengths: ["High speed", "Hard to track", "Can bypass slow towers"],
    weaknesses: ["Very low health", "Predictable paths", "Vulnerable to area damage"],
    tacticalNotes: [
      "Place towers early in their path",
      "Mortars work well against groups",
      "Upgraded turrets can track them effectively"
    ],
    firstAppearsWave: 2,
    difficulty: "Medium"
  },
  {
    type: "heavy",
    name: "Cobalt Bruiser",
    health: 400,
    speed: 1.0,
    reward: 2,
    color: "#3b82f6",
    size: 0.4,
    lore: "Reinforced with dense cobalt plating, these blue behemoths serve as the backbone of enemy assault forces. Their thick armor can withstand multiple direct hits, making them formidable opponents. They were originally mining units before being weaponized for warfare.",
    strengths: ["High health", "Steady advance", "Absorbs damage for others"],
    weaknesses: ["Slow movement", "Large target", "Expensive to ignore"],
    tacticalNotes: [
      "Focus fire from multiple towers",
      "Use high-damage mortars effectively",
      "Don't let them stack up with other enemies"
    ],
    firstAppearsWave: 3,
    difficulty: "Medium"
  },
  {
    type: "armored",
    name: "Violet Guardian",
    health: 580,
    speed: 1.1,
    reward: 3,
    color: "#8b5cf6",
    size: 0.45,
    lore: "Elite units equipped with experimental purple energy shields that can deflect some incoming damage. These guardians were once protectors of ancient installations, now corrupted and turned against their original purpose. Their shield technology makes them particularly resilient.",
    strengths: ["Energy shielding", "Moderate speed", "High health pool"],
    weaknesses: ["Shields have cooldown periods", "Vulnerable during shield recharge", "High-level towers penetrate shields"],
    tacticalNotes: [
      "Sustained fire breaks through shields",
      "Level 3+ towers are most effective",
      "Target with mortars when shields are down"
    ],
    firstAppearsWave: 5,
    difficulty: "Hard"
  },
  {
    type: "elite",
    name: "Golden Vanguard",
    health: 850,
    speed: 1.3,
    reward: 4,
    color: "#f59e0b",
    size: 0.5,
    lore: "The pinnacle of enemy engineering, these golden warriors combine speed, durability, and tactical awareness. Forged in the heart of corrupted stars, they possess both the strength of heavy units and the agility of scouts. They lead lesser enemies and adapt to your defensive strategies.",
    strengths: ["Balanced stats", "Adaptive AI", "Leadership abilities"],
    weaknesses: ["High-value target", "Expensive to let through", "Susceptible to coordinated fire"],
    tacticalNotes: [
      "Priority target for all towers",
      "Can buff nearby enemies - eliminate quickly",
      "Requires level 4+ towers for efficient elimination"
    ],
    firstAppearsWave: 8,
    difficulty: "Very Hard"
  },
  {
    type: "boss",
    name: "Crimson Overlord",
    health: 1350,
    speed: 0.9,
    reward: 8,
    color: "#dc2626",
    size: 0.6,
    lore: "A massive commander unit that appears at critical moments to break through your defenses. These overlords carry the accumulated power of fallen enemies, growing stronger with each battle. Their presence alone strengthens nearby units, making them extremely dangerous leaders.",
    strengths: ["Massive health pool", "Damage resistance", "Buffs nearby enemies"],
    weaknesses: ["Slow movement", "Large target", "Vulnerable to focused fire"],
    tacticalNotes: [
      "Requires multiple high-level towers",
      "Prioritize elimination to remove enemy buffs",
      "Best target for level 5 mortars"
    ],
    firstAppearsWave: 5,
    difficulty: "Extreme"
  },
  {
    type: "megaboss",
    name: "Void Leviathan",
    health: 2700,
    speed: 0.8,
    reward: 15,
    color: "#7c3aed",
    size: 0.8,
    lore: "Ancient entities from the void between dimensions, these purple leviathans are the ultimate test of your defensive capabilities. They exist partially outside our reality, making them incredibly resilient to conventional weapons. Only the most advanced defensive systems can harm them.",
    strengths: ["Enormous health", "Dimensional phasing", "Reality distortion field"],
    weaknesses: ["Very slow", "Massive target", "Vulnerable to maximum-level towers"],
    tacticalNotes: [
      "Requires entire arsenal focused on single target",
      "Deploy all level 5 towers in range",
      "Failure to stop means immediate game over"
    ],
    firstAppearsWave: 10,
    difficulty: "Legendary"
  }
];

interface EnemyEncyclopediaProps {
  isOpen: boolean;
  onClose: () => void;
  currentWave: number;
}

export default function EnemyEncyclopedia({ isOpen, onClose, currentWave }: EnemyEncyclopediaProps) {
  const [selectedEnemy, setSelectedEnemy] = useState<EnemyData | null>(null);

  if (!isOpen) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-400 border-green-400";
      case "Medium": return "text-yellow-400 border-yellow-400";
      case "Hard": return "text-orange-400 border-orange-400";
      case "Very Hard": return "text-red-400 border-red-400";
      case "Extreme": return "text-purple-400 border-purple-400";
      case "Legendary": return "text-pink-400 border-pink-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const isAvailable = (enemy: EnemyData) => currentWave >= enemy.firstAppearsWave;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 md:p-4">
      <Card className="w-full h-full md:max-w-5xl md:max-h-[95vh] overflow-hidden bg-gray-900 border-gray-700 md:rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-gray-800 border-b border-gray-700 px-3 py-2 md:px-4 md:py-3">
          <CardTitle className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
            <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            Enemy Encyclopedia
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
          {/* Enemy List */}
          <div className="w-full md:w-1/3 border-r border-gray-700 overflow-y-auto">
            <div className="p-2 md:p-4 space-y-2 md:space-y-3">
              {enemyDatabase.map((enemy) => (
                <div
                  key={enemy.type}
                  className={`p-2 md:p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedEnemy?.type === enemy.type
                      ? "bg-blue-900 border-blue-500"
                      : isAvailable(enemy)
                      ? "bg-gray-800 border-gray-600 hover:bg-gray-700"
                      : "bg-gray-900 border-gray-700 opacity-50"
                  }`}
                  onClick={() => isAvailable(enemy) && setSelectedEnemy(enemy)}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div
                      className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: enemy.color }}
                    >
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full opacity-90" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold truncate text-sm md:text-base ${
                        isAvailable(enemy) ? "text-white" : "text-gray-500"
                      }`}>
                        {enemy.name}
                      </h3>
                      <div className="flex items-center gap-1 md:gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getDifficultyColor(enemy.difficulty)}`}
                        >
                          {enemy.difficulty}
                        </Badge>
                        {!isAvailable(enemy) && (
                          <span className="text-xs text-gray-500">
                            Wave {enemy.firstAppearsWave}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enemy Details */}
          <div className={`${selectedEnemy ? 'flex-1' : 'hidden md:flex md:flex-1'} overflow-y-auto`}>
            {selectedEnemy ? (
              <div className="p-3 md:p-6 space-y-4 md:space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: selectedEnemy.color }}
                  >
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-white rounded-full opacity-90" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl md:text-3xl font-bold text-white truncate">{selectedEnemy.name}</h2>
                    <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(selectedEnemy.difficulty)}
                      >
                        {selectedEnemy.difficulty}
                      </Badge>
                      <span className="text-gray-400 text-xs md:text-sm">
                        Wave {selectedEnemy.firstAppearsWave}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-red-400 mb-1">
                      <Heart className="w-4 h-4" />
                      <span className="text-sm font-medium">Health</span>
                    </div>
                    <span className="text-xl font-bold text-white">{selectedEnemy.health}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm font-medium">Speed</span>
                    </div>
                    <span className="text-xl font-bold text-white">{selectedEnemy.speed}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Reward</span>
                    </div>
                    <span className="text-xl font-bold text-white">{selectedEnemy.reward}</span>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">Size</span>
                    </div>
                    <span className="text-xl font-bold text-white">{selectedEnemy.size}</span>
                  </div>
                </div>

                {/* Lore */}
                <div className="hidden md:block">
                  <h3 className="text-lg md:text-xl font-semibold text-white mb-2 md:mb-3">Lore</h3>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">{selectedEnemy.lore}</p>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {selectedEnemy.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-300 flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {selectedEnemy.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-gray-300 flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tactical Notes */}
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-blue-400 mb-2 md:mb-3">Tactical Notes</h3>
                  <ul className="space-y-1 md:space-y-2">
                    {selectedEnemy.tacticalNotes.map((note, index) => (
                      <li key={index} className="text-gray-300 flex items-start gap-2 text-sm md:text-base">
                        <span className="text-blue-400 mt-1">→</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400 p-4">
                  <Info className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-base md:text-lg">Select an enemy to view details</p>
                  <p className="text-xs md:text-sm mt-2">
                    {enemyDatabase.filter(e => isAvailable(e)).length} of {enemyDatabase.length} enemies available
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}