import { useState } from "react";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Coins, Heart, Zap, Volume2, VolumeX, Play, RotateCcw, Target, Bomb, Users, BookOpen } from "lucide-react";
import { getAvailableEnemyTypes } from "../lib/gameLogic";
import WaveTransition from "./WaveTransition";
import EnemyEncyclopedia from "./EnemyEncyclopedia";

export default function GameUI() {
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  
  const {
    gamePhase,
    wave,
    health,
    coins,
    highestWave,
    selectedGridCell,
    canPlaceTower,
    canMergeTowers,
    selectedTowerType,
    startGame,
    restartGame,
    buyTower,
    mergeTowers,
    selectTowerType,
    waveProgress,
    enemiesInWave,
    enemiesSpawned,
    waveCompletionTime,
    showWaveTransition,
    setShowWaveTransition
  } = useTowerDefense();

  const { isMuted, toggleMute, playTowerPlace } = useAudio();

  if (gamePhase === "menu") {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <Card className="w-96">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">Tower Defense 3D</CardTitle>
              <p className="text-gray-300 mt-2">
                Defend your base against endless waves of enemies!
              </p>
              {highestWave > 1 && (
                <p className="text-yellow-400 mt-2 font-semibold">
                  Best Wave: {highestWave}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-400 space-y-2">
                <p>• Place towers on the 5x3 grid to defend</p>
                <p>• Merge same-level towers to upgrade them</p>
                <p>• Enemies get stronger each wave</p>
                <p>• Don't let them reach your base!</p>
              </div>
              <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4" size="lg">
                START
              </Button>
              <Button 
                onClick={() => {
                  console.log("Encyclopedia button clicked - menu, current state:", showEncyclopedia);
                  setShowEncyclopedia(prev => {
                    console.log("Setting showEncyclopedia from", prev, "to true");
                    return true;
                  });
                }} 
                variant="outline" 
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-900 rounded-lg"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Enemy Encyclopedia
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <EnemyEncyclopedia
          isOpen={showEncyclopedia}
          onClose={() => setShowEncyclopedia(false)}
          currentWave={wave}
        />
      </>
    );
  }

  if (gamePhase === "gameOver") {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <Card className="w-96">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-red-400">Game Over</CardTitle>
              <p className="text-gray-300 mt-2">
                You survived {wave} waves!
              </p>
              {wave > highestWave && (
                <p className="text-yellow-400 mt-1 font-semibold">
                  New Record!
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-lg text-gray-300 mb-2">
                  Final Score: {coins} coins
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Best Wave: {Math.max(wave, highestWave)}
                </p>
              </div>
              <Button onClick={restartGame} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4" size="lg">
                START
              </Button>
              <Button 
                onClick={() => {
                  console.log("Encyclopedia button clicked - game over");
                  setShowEncyclopedia(true);
                }} 
                variant="outline" 
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-900 mt-2 rounded-lg"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Enemy Encyclopedia
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <EnemyEncyclopedia
          isOpen={showEncyclopedia}
          onClose={() => setShowEncyclopedia(false)}
          currentWave={wave}
        />
      </>
    );
  }

  return (
    <>
      {/* Top HUD - Mobile Optimized */}
      <div className="absolute top-2 left-2 right-2 z-40">
        {/* Mobile layout: Stack vertically on small screens */}
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:justify-between md:items-start">
          {/* Left side stats - horizontal on mobile */}
          <div className="flex gap-2 flex-wrap">
            <Card className="bg-black bg-opacity-80 border-gray-700">
              <CardContent className="p-2 md:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                  <span className="text-white font-bold text-sm md:text-base">Wave {wave}</span>
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
              <CardContent className="p-2 md:p-3 flex items-center gap-2">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
                <span className="text-white font-bold text-sm md:text-base">{health}</span>
              </CardContent>
            </Card>

            <Card className="bg-black bg-opacity-80 border-gray-700">
              <CardContent className="p-2 md:p-3 flex items-center gap-2">
                <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <span className="text-white font-bold text-sm md:text-base">{coins}</span>
              </CardContent>
            </Card>
          </div>

          {/* Enemy types - hidden on very small screens, shown on larger mobile */}
          <Card className="bg-black bg-opacity-80 border-gray-700 hidden sm:block">
            <CardContent className="p-2 md:p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                <span className="text-white text-xs font-semibold">Enemy Types</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEncyclopedia(true)}
                  className="ml-auto p-1 h-6 w-6 text-blue-400 hover:text-blue-300"
                >
                  <BookOpen className="w-3 h-3" />
                </Button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {getAvailableEnemyTypes(wave).map((type) => (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    className={`text-xs px-1 py-0 cursor-pointer hover:opacity-80 ${
                      type === 'basic' ? 'border-green-400 text-green-400' :
                      type === 'fast' ? 'border-yellow-400 text-yellow-400' :
                      type === 'heavy' ? 'border-orange-400 text-orange-400' :
                      type === 'armored' ? 'border-purple-400 text-purple-400' :
                      type === 'elite' ? 'border-red-400 text-red-400' :
                      'border-gray-400 text-gray-400'
                    }`}
                    onClick={() => setShowEncyclopedia(true)}
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



      {/* Bottom Controls - Mobile Optimized */}
      <div className="absolute bottom-20 left-2 right-2 flex justify-center z-40">
        <Card className="bg-black bg-opacity-90 border-gray-700 w-full max-w-md">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
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
                      if (!isMuted) {
                        try {
                          const audio = new Audio("/sounds/hit.mp3");
                          audio.volume = 1.0;
                          audio.playbackRate = 1.4;
                          audio.play().catch(() => {});
                          console.log("Playing turret placement sound");
                        } catch (e) {
                          console.log("Error playing turret sound:", e);
                        }
                      }
                    }}
                    className={`${selectedTowerType === 'turret' ? 'bg-green-700 border-2 border-green-400' : 'bg-green-600 hover:bg-green-700'} text-xs p-3 md:p-2 flex items-center gap-1 min-h-[44px] md:min-h-auto rounded-lg`}
                    disabled={coins < 15}
                  >
                    <Target className="w-3 h-3" />
                    <span>Turret - 15</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      selectTowerType('mortar');
                      buyTower();
                      if (!isMuted) {
                        try {
                          const audio = new Audio("/sounds/hit.mp3");
                          audio.volume = 1.0;
                          audio.playbackRate = 1.1;
                          audio.play().catch(() => {});
                          console.log("Playing mortar placement sound");
                        } catch (e) {
                          console.log("Error playing mortar sound:", e);
                        }
                      }
                    }}
                    className={`${selectedTowerType === 'mortar' ? 'bg-orange-700 border-2 border-orange-400' : 'bg-orange-600 hover:bg-orange-700'} text-xs p-3 md:p-2 flex items-center gap-1 min-h-[44px] md:min-h-auto rounded-lg`}
                    disabled={coins < 25}
                  >
                    <Bomb className="w-3 h-3" />
                    <span>Mortar - 25</span>
                  </Button>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wave Transition Animation */}
      <WaveTransition
        wave={wave}
        show={showWaveTransition}
        onComplete={() => setShowWaveTransition(false)}
      />
      
      <EnemyEncyclopedia
        isOpen={showEncyclopedia}
        onClose={() => setShowEncyclopedia(false)}
        currentWave={wave}
      />
    </>
  );
}
