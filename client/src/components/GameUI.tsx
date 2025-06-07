import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Coins, Heart, Zap, Volume2, VolumeX, Play, RotateCcw, Target, Bomb, Users } from "lucide-react";
import { getAvailableEnemyTypes } from "../lib/gameLogic";

export default function GameUI() {
  const {
    gamePhase,
    wave,
    health,
    coins,
    selectedGridCell,
    canPlaceTower,
    canMergeTowers,
    startGame,
    restartGame,
    buyTower,
    mergeTowers,
    selectTowerType,
    waveProgress,
    enemiesInWave,
    enemiesSpawned,
    waveCompletionTime
  } = useTowerDefense();

  const { isMuted, toggleMute } = useAudio();

  if (gamePhase === "menu") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white">Tower Defense 3D</CardTitle>
            <p className="text-gray-300 mt-2">
              Defend your base against endless waves of enemies!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-400 space-y-2">
              <p>• Place towers on the 5x3 grid to defend</p>
              <p>• Merge same-level towers to upgrade them</p>
              <p>• Enemies get stronger each wave</p>
              <p>• Don't let them reach your base!</p>
            </div>
            <Button onClick={startGame} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gamePhase === "gameOver") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
        <Card className="w-96">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-red-400">Game Over</CardTitle>
            <p className="text-gray-300 mt-2">
              You survived {wave} waves!
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-lg text-gray-300 mb-4">
                Final Score: {coins} coins
              </p>
            </div>
            <Button onClick={restartGame} className="w-full" size="lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-40">
        <div className="flex gap-4">
          <Card className="bg-black bg-opacity-80 border-gray-700">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">Wave {wave}</span>
              </div>
              <div className="text-xs text-gray-300">
                {waveCompletionTime ? (
                  `Next wave in ${Math.max(0, Math.ceil((3000 - (Date.now() - waveCompletionTime)) / 1000))}s`
                ) : (
                  `Enemies: ${enemiesSpawned}/${enemiesInWave}`
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black bg-opacity-80 border-gray-700">
            <CardContent className="p-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="text-white font-bold">{health}</span>
            </CardContent>
          </Card>

          <Card className="bg-black bg-opacity-80 border-gray-700">
            <CardContent className="p-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">{coins}</span>
            </CardContent>
          </Card>

          <Card className="bg-black bg-opacity-80 border-gray-700">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-white text-xs font-semibold">Enemy Types</span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {getAvailableEnemyTypes(wave).map((type) => (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    className={`text-xs px-2 py-0 ${
                      type === 'basic' ? 'border-green-400 text-green-400' :
                      type === 'fast' ? 'border-yellow-400 text-yellow-400' :
                      type === 'heavy' ? 'border-orange-400 text-orange-400' :
                      type === 'armored' ? 'border-purple-400 text-purple-400' :
                      type === 'elite' ? 'border-red-400 text-red-400' :
                      'border-gray-400 text-gray-400'
                    }`}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={toggleMute}
            variant="outline"
            size="sm"
            className="bg-black bg-opacity-80 border-gray-700 text-white hover:bg-gray-800"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>



      {/* Bottom Controls - Always Visible */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center z-40">
        <Card className="bg-black bg-opacity-90 border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Towers Section */}
              <div>
                <div className="text-sm text-gray-300 mb-2 font-semibold flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Towers
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      selectTowerType('turret');
                      buyTower();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-xs p-2 flex items-center gap-1"
                    disabled={coins < 15}
                  >
                    <Target className="w-3 h-3" />
                    <span>Turret - 15</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      selectTowerType('mortar');
                      buyTower();
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-xs p-2 flex items-center gap-1"
                    disabled={coins < 25}
                  >
                    <Bomb className="w-3 h-3" />
                    <span>Mortar - 25</span>
                  </Button>
                </div>
                {canMergeTowers && (
                  <Button 
                    onClick={() => mergeTowers()}
                    className="bg-blue-600 hover:bg-blue-700 w-full mt-2 text-xs p-2"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Merge Towers
                  </Button>
                )}
              </div>


            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
