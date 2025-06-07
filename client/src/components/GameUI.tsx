import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Coins, Heart, Zap, Volume2, VolumeX, Play, RotateCcw } from "lucide-react";

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
    waveProgress,
    enemiesInWave,
    enemiesSpawned
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
            <CardContent className="p-3 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-bold">Wave {wave}</span>
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

      {/* Wave Progress */}
      <div className="absolute top-20 left-4 right-4 z-40">
        <Card className="bg-black bg-opacity-80 border-gray-700">
          <CardContent className="p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm">Wave Progress</span>
              <span className="text-gray-300 text-xs">
                {enemiesSpawned}/{enemiesInWave}
              </span>
            </div>
            <Progress 
              value={waveProgress} 
              className="h-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tower Placement UI - appears on selected grid cell */}
      {selectedGridCell && (
        <div 
          className="absolute z-50 pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translate(${(selectedGridCell.x * 2 - 4) * 25}px, ${-(selectedGridCell.z * 2 - 2) * 25}px)`
          }}
        >
          <Card className="bg-black bg-opacity-95 border-yellow-400 border-2 pointer-events-auto">
            <CardContent className="p-3">
              <div className="flex flex-col items-center gap-2 min-w-[150px]">
                <div className="text-white text-center">
                  <p className="text-xs text-gray-300 mb-1">
                    Grid ({selectedGridCell.x}, {selectedGridCell.z})
                  </p>
                </div>

                {canPlaceTower && (
                  <Button 
                    onClick={buyTower}
                    className="bg-green-600 hover:bg-green-700 w-full"
                    size="sm"
                  >
                    <Coins className="w-3 h-3 mr-1" />
                    Buy Tower
                    <span className="text-xs ml-1">(10 coins)</span>
                  </Button>
                )}

                {canMergeTowers && (
                  <Button 
                    onClick={mergeTowers}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    size="sm"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Merge Towers
                  </Button>
                )}

                {!canPlaceTower && !canMergeTowers && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    Cell occupied
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
