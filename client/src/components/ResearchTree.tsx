import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Zap, Clock, Target, Bomb, Package, Lock, CheckCircle } from "lucide-react";

// Custom Diamond Icon Component
const DiamondIcon = ({ className = "w-4 h-4" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path d="M6 3h12l4 6-10 12L2 9l4-6z"/>
  </svg>
);
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { ResearchNode } from "../lib/researchTree";

interface ResearchTreeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResearchTree({ isOpen, onClose }: ResearchTreeProps) {
  const { 
    diamonds, 
    researchNodes, 
    purchaseResearchNode, 
    getResearchBonuses 
  } = useTowerDefense();
  
  const [selectedBranch, setSelectedBranch] = useState<'turret' | 'mortar' | 'consumables'>('turret');

  if (!isOpen) return null;

  const getBranchNodes = (branch: string) => {
    return researchNodes.filter(node => node.branch === branch);
  };

  const getBranchIcon = (branch: string) => {
    switch (branch) {
      case 'turret': return <Target className="w-5 h-5" />;
      case 'mortar': return <Bomb className="w-5 h-5" />;
      case 'consumables': return <Package className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'turret': return 'text-green-400 border-green-400';
      case 'mortar': return 'text-red-400 border-red-400';
      case 'consumables': return 'text-blue-400 border-blue-400';
      default: return 'text-green-400 border-green-400';
    }
  };

  const getNodeColor = (node: ResearchNode) => {
    if (node.purchased) return 'bg-green-800 border-green-600';
    if (!node.unlocked) return 'bg-gray-700 border-gray-600';
    if (diamonds >= node.cost) return 'bg-yellow-800 border-yellow-600';
    return 'bg-gray-800 border-gray-600';
  };

  const getNodeIcon = (node: ResearchNode) => {
    if (node.purchased) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (!node.unlocked) return <Lock className="w-4 h-4 text-gray-400" />;
    return <DiamondIcon className="w-4 h-4 text-yellow-400" />;
  };

  const handlePurchase = (nodeId: string) => {
    purchaseResearchNode(nodeId);
  };

  const bonuses = getResearchBonuses();

  const formatBonus = (value: number, type: string) => {
    if (type === 'damage_multiplier' || type === 'fire_rate_multiplier' || type === 'mine_damage_bonus') {
      return `+${Math.round((value - 1) * 100)}%`;
    } else if (type === 'mine_cost_reduction') {
      return `-${Math.round((1 - value) * 100)}%`;
    }
    return `${value}x`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-6xl h-full max-h-[90vh] bg-gray-900 border-gray-700 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <DiamondIcon className="w-6 h-6 text-yellow-400" />
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold text-white">
                Research Tree
              </CardTitle>
              <p className="text-gray-400 text-sm">
                Spend diamonds to unlock permanent upgrades
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-lg">
              <DiamondIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 font-bold">{diamonds}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="h-full overflow-hidden flex flex-col">
          {/* Branch Selector */}
          <div className="flex gap-2 mb-4">
            {(['turret', 'mortar', 'consumables'] as const).map((branch) => (
              <Button
                key={branch}
                variant={selectedBranch === branch ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedBranch(branch)}
                className={`flex items-center gap-2 ${selectedBranch === branch ? '' : getBranchColor(branch)}`}
              >
                {getBranchIcon(branch)}
                {branch.charAt(0).toUpperCase() + branch.slice(1)}
              </Button>
            ))}
          </div>

          {/* Current Bonuses Display */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Active Bonuses</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Turret DMG: {formatBonus(bonuses.turretDamageMultiplier, 'damage_multiplier')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Turret Rate: {formatBonus(bonuses.turretFireRateMultiplier, 'fire_rate_multiplier')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bomb className="w-3 h-3 text-red-400" />
                <span className="text-red-400">Mortar DMG: {formatBonus(bonuses.mortarDamageMultiplier, 'damage_multiplier')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-400" />
                <span className="text-red-400">Mortar Rate: {formatBonus(bonuses.mortarFireRateMultiplier, 'fire_rate_multiplier')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">Mine DMG: {formatBonus(bonuses.mineDamageMultiplier, 'mine_damage_bonus')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-blue-400" />
                <span className="text-blue-400">Mine Cost: {formatBonus(bonuses.mineCostMultiplier, 'mine_cost_reduction')}</span>
              </div>
            </div>
          </div>

          {/* Research Nodes Grid */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getBranchNodes(selectedBranch).map((node) => (
                <div
                  key={node.id}
                  className={`p-4 rounded-lg border-2 transition-all ${getNodeColor(node)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getNodeIcon(node)}
                      <h4 className="font-semibold text-white text-sm">{node.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Tier {node.tier}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <DiamondIcon className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 font-bold text-sm">{node.cost}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-300 text-xs mb-3">{node.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="text-xs">
                      <span className="text-gray-400">Effect: </span>
                      <span className={`font-semibold ${getBranchColor(node.branch).split(' ')[0]}`}>
                        {formatBonus(node.effect.value, node.effect.type)}
                      </span>
                    </div>

                    {node.purchased ? (
                      <Badge className="bg-green-600 text-green-100 text-xs">
                        Purchased
                      </Badge>
                    ) : !node.unlocked ? (
                      <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">
                        Locked
                      </Badge>
                    ) : diamonds >= node.cost ? (
                      <Button
                        size="sm"
                        onClick={() => handlePurchase(node.id)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-yellow-100 text-xs px-2 py-1"
                      >
                        Purchase
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-gray-400 border-gray-600 text-xs">
                        Need {node.cost - diamonds} more
                      </Badge>
                    )}
                  </div>

                  {/* Prerequisites */}
                  {node.prerequisites.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <p className="text-xs text-gray-400">
                        Requires: {node.prerequisites.map(prereq => {
                          const prereqNode = researchNodes.find(n => n.id === prereq);
                          return prereqNode?.name;
                        }).join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diamond earning info */}
          <div className="mt-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              <DiamondIcon className="w-3 h-3 inline mr-1 text-yellow-400" />
              Earn diamonds every 5 waves: 1 for wave 5, 2 for wave 10, 3 for wave 15, etc.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}