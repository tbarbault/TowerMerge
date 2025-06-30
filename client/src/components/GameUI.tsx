import { useState, useEffect } from "react";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Coins, Heart, Zap, Volume2, VolumeX, Play, RotateCcw, Target, Bomb, Users, BookOpen, Pause, Shield, Home } from "lucide-react";
import { getAvailableEnemyTypes } from "../lib/gameLogic";
import { GAME_MUTATORS } from "../lib/gameMutators";
import WaveTransition from "./WaveTransition";
import EnemyEncyclopedia from "./EnemyEncyclopedia";
import TowerEncyclopedia from "./TowerEncyclopedia";
import ResearchTree from "./ResearchTree";
import Tutorial from "./Tutorial";

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

export default function GameUI() {
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [showTowerEncyclopedia, setShowTowerEncyclopedia] = useState(false);
  const [showResearchTree, setShowResearchTree] = useState(false);
  
  const {
    gamePhase,
    wave,
    health,
    coins,
    diamonds,
    highestWave,
    selectedGridCell,
    canPlaceTower,
    canMergeTowers,
    selectedTowerType,
    selectedGameMode,
    maxWaves,
    eventDisplay,
    hideEventDisplay,
    skipEventDisplay,
    showTutorial,
    tutorialCompleted,
    showTutorialModal,
    hideTutorialModal,
    completeTutorial,
    startGame,
    restartGame,
    pauseGame,
    resumeGame,
    selectGameMode,
    startGameWithMode,
    buyTower,
    mergeTowers,
    selectTowerType,
    waveProgress,
    enemiesInWave,
    enemiesSpawned,
    waveCompletionTime,
    showWaveTransition,
    setShowWaveTransition,
    minesPurchased,
    buyMine,
    getResearchBonuses
  } = useTowerDefense();

  const { isMuted, toggleMute, playTowerPlace, isIOS, audioEnabled } = useAudio();

  // Calculate tower costs based on game mode
  const getTowerCosts = () => {
    if (selectedGameMode === 'legend') {
      return { turret: 20, mortar: 30 };
    }
    return { turret: 15, mortar: 25 };
  };

  const towerCosts = getTowerCosts();

  // Show tutorial for first-time users
  useEffect(() => {
    if (!tutorialCompleted && gamePhase === "menu") {
      showTutorialModal();
    }
  }, [tutorialCompleted, gamePhase, showTutorialModal]);

  if (gamePhase === "menu") {
    return (
      <>
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <Card className="w-96">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-white">Merge Tower Defense</CardTitle>
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
              <Button onClick={startGameWithMode} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4" size="lg">
                START
              </Button>
              
              {/* Game Mode Selection */}
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">Game Mode:</p>
                <div className="grid grid-cols-3 gap-2">
                  {GAME_MUTATORS.map((mode) => (
                    <Button
                      key={mode.id}
                      onClick={() => selectGameMode(mode.id)}
                      variant={selectedGameMode === mode.id ? "default" : "outline"}
                      className={`text-xs py-2 ${
                        selectedGameMode === mode.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "border-blue-500 text-blue-400 hover:bg-blue-900"
                      }`}
                    >
                      {mode.name}
                    </Button>
                  ))}
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <p>{GAME_MUTATORS.find(m => m.id === selectedGameMode)?.description}</p>
                  <p className="text-blue-400">
                    Max Wave Reached: {maxWaves[selectedGameMode] || 1}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => {
                    console.log("Encyclopedia button clicked - menu, current state:", showEncyclopedia);
                    setShowEncyclopedia(prev => {
                      console.log("Setting showEncyclopedia from", prev, "to true");
                      return true;
                    });
                  }} 
                  variant="outline" 
                  className="border-blue-500 text-blue-400 hover:bg-blue-900 rounded-lg text-xs"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Enemies
                </Button>
                <Button 
                  onClick={() => setShowTowerEncyclopedia(true)} 
                  variant="outline" 
                  className="border-green-500 text-green-400 hover:bg-green-900 rounded-lg text-xs"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Towers
                </Button>
                <Button 
                  onClick={() => setShowResearchTree(true)} 
                  variant="outline" 
                  className="border-purple-500 text-purple-400 hover:bg-purple-900 rounded-lg text-xs"
                >
                  <DiamondIcon className="w-3 h-3 mr-1" />
                  Research
                </Button>
                <Button 
                  onClick={showTutorialModal} 
                  variant="outline" 
                  className="border-yellow-500 text-yellow-400 hover:bg-yellow-900 rounded-lg text-xs"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Tutorial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <EnemyEncyclopedia
          isOpen={showEncyclopedia}
          onClose={() => setShowEncyclopedia(false)}
          currentWave={wave}
        />
        
        <TowerEncyclopedia
          isOpen={showTowerEncyclopedia}
          onClose={() => setShowTowerEncyclopedia(false)}
        />
        
        <ResearchTree
          isOpen={showResearchTree}
          onClose={() => setShowResearchTree(false)}
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
              
              {/* Game Mode Selection */}
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-semibold">Game Mode:</p>
                <div className="grid grid-cols-3 gap-2">
                  {GAME_MUTATORS.map((mode) => (
                    <Button
                      key={mode.id}
                      onClick={() => selectGameMode(mode.id)}
                      variant={selectedGameMode === mode.id ? "default" : "outline"}
                      className={`text-xs py-2 ${
                        selectedGameMode === mode.id 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : "border-blue-500 text-blue-400 hover:bg-blue-900"
                      }`}
                    >
                      {mode.name}
                    </Button>
                  ))}
                </div>
                <div className="text-gray-400 text-xs space-y-1">
                  <p>{GAME_MUTATORS.find(m => m.id === selectedGameMode)?.description}</p>
                  <p className="text-blue-400">
                    Max Wave Reached: {maxWaves[selectedGameMode] || 1}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => {
                    console.log("Encyclopedia button clicked - game over");
                    setShowEncyclopedia(true);
                  }} 
                  variant="outline" 
                  className="border-blue-500 text-blue-400 hover:bg-blue-900 rounded-lg text-xs"
                >
                  <BookOpen className="w-3 h-3 mr-1" />
                  Enemies
                </Button>
                <Button 
                  onClick={() => setShowTowerEncyclopedia(true)} 
                  variant="outline" 
                  className="border-green-500 text-green-400 hover:bg-green-900 rounded-lg text-xs"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  Towers
                </Button>
                <Button 
                  onClick={() => setShowResearchTree(true)} 
                  variant="outline" 
                  className="border-purple-500 text-purple-400 hover:bg-purple-900 rounded-lg text-xs"
                >
                  <DiamondIcon className="w-3 h-3 mr-1" />
                  Research
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <EnemyEncyclopedia
          isOpen={showEncyclopedia}
          onClose={() => setShowEncyclopedia(false)}
          currentWave={wave}
        />
        
        <TowerEncyclopedia
          isOpen={showTowerEncyclopedia}
          onClose={() => setShowTowerEncyclopedia(false)}
        />

        <ResearchTree
          isOpen={showResearchTree}
          onClose={() => setShowResearchTree(false)}
        />
      </>
    );
  }

  return (
    <>
      {/* Control Buttons - Top Left */}
      <div className="absolute top-12 left-2 z-50 flex flex-col gap-2">
        <Button
          onClick={pauseGame}
          variant="outline"
          size="sm"
          className="bg-black bg-opacity-80 border-gray-700 text-white hover:bg-gray-800"
        >
          <Pause className="w-4 h-4" />
        </Button>
        <Button
          onClick={toggleMute}
          variant="outline"
          size="sm"
          className={`bg-black bg-opacity-80 border-gray-700 text-white hover:bg-gray-800 ${
            isIOS && !audioEnabled ? 'border-yellow-500 text-yellow-400' : ''
          }`}
          title={isIOS && !audioEnabled ? "Tap to enable audio (iOS)" : "Toggle audio"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        {isIOS && !audioEnabled && (
          <div className="bg-yellow-900 bg-opacity-90 border border-yellow-600 text-yellow-100 text-xs p-2 rounded-lg max-w-32">
            <div className="font-semibold mb-1">iPhone Audio</div>
            <div>Tap sound button to enable audio</div>
          </div>
        )}
      </div>

      {/* Top HUD - Mobile Optimized */}
      <div className="absolute top-12 left-20 right-2 z-40">
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
                    (() => {
                      const getPauseTime = (wave: number) => {
                        if (wave <= 10) return 3000;
                        if (wave <= 20) return 2000;
                        if (wave <= 30) return 1500;
                        return 1000;
                      };
                      const pauseTime = getPauseTime(wave);
                      return `Next wave in ${Math.max(0, Math.ceil((pauseTime - (Date.now() - waveCompletionTime)) / 1000))}s`;
                    })()
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
              <CardContent className="p-2 md:p-3">
                <div className="flex items-center gap-3 w-24 md:w-28">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                    <span className="text-white font-bold text-sm md:text-base min-w-[20px] text-right">{coins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DiamondIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                    <span className="text-white font-bold text-sm md:text-base min-w-[16px] text-right">{diamonds}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResearchTree(true)}
                      className="p-1 h-6 w-6 text-blue-400 hover:text-blue-300 ml-1"
                      title="Research Tree"
                    >
                      <Zap className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
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


      </div>



      {/* Bottom Controls - Mobile Optimized */}
      <div className="absolute bottom-20 left-2 right-2 flex justify-center z-40">
        <Card className="bg-black bg-opacity-90 border-gray-700 w-full max-w-md">
          <CardContent className="p-3 md:p-4">
            <div className="space-y-3 md:space-y-4">
              {/* Towers Section */}
              <div>
                <div className="text-sm text-gray-300 mb-2 font-semibold flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Towers
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTowerEncyclopedia(true)}
                    className="p-1 h-6 w-6 text-blue-400 hover:text-blue-300"
                  >
                    <Shield className="w-3 h-3" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => {
                      selectTowerType('turret');
                      buyTower();
                      playTowerPlace();
                    }}
                    className={`${selectedTowerType === 'turret' ? 'bg-green-700 border-2 border-green-400' : 'bg-green-600 hover:bg-green-700'} text-xs p-3 md:p-2 flex items-center gap-1 min-h-[44px] md:min-h-auto rounded-lg`}
                    disabled={coins < towerCosts.turret}
                  >
                    <Target className="w-3 h-3" />
                    <span>Turret - {towerCosts.turret}</span>
                  </Button>
                  <Button 
                    onClick={() => {
                      selectTowerType('mortar');
                      buyTower();
                      playTowerPlace();
                    }}
                    className={`${selectedTowerType === 'mortar' ? 'bg-orange-700 border-2 border-orange-400' : 'bg-orange-600 hover:bg-orange-700'} text-xs p-3 md:p-2 flex items-center gap-1 min-h-[44px] md:min-h-auto rounded-lg`}
                    disabled={coins < towerCosts.mortar}
                  >
                    <Bomb className="w-3 h-3" />
                    <span>Mortar - {towerCosts.mortar}</span>
                  </Button>
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mine Purchase Button - Right Side */}
      <div className="absolute right-2 top-32 z-40">
        <Card className="bg-black bg-opacity-90 border-gray-700">
          <CardContent className="p-3">
            <div className="flex flex-col items-center gap-2">
              {(() => {
                const bonuses = getResearchBonuses();
                const baseCost = 10;
                const costMultiplier = 1.5;
                const adjustedCost = Math.floor(baseCost * Math.pow(costMultiplier, minesPurchased) * bonuses.mineCostMultiplier);
                
                return (
                  <Button
                    onClick={buyMine}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs p-3 flex flex-col items-center gap-1 min-h-[60px] rounded-lg"
                    disabled={coins < adjustedCost}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Buy Mine</span>
                    <span className="text-xs opacity-80">{adjustedCost}💰</span>
                  </Button>
                );
              })()}
              {minesPurchased > 0 && (
                <div className="text-xs text-gray-400 text-center">
                  Placed: {minesPurchased}
                </div>
              )}
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

      <TowerEncyclopedia
        isOpen={showTowerEncyclopedia}
        onClose={() => setShowTowerEncyclopedia(false)}
      />

      <ResearchTree
        isOpen={showResearchTree}
        onClose={() => setShowResearchTree(false)}
      />

      {/* Pause Menu Overlay */}
      {gamePhase === "paused" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <Card className="w-80">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-white">Game Paused</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={resumeGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Resume Game
              </Button>
              <Button
                onClick={restartGame}
                variant="outline"
                className="w-full border-gray-600 text-white hover:bg-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart Game
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Display - Shows for 5 seconds before wave */}
      {eventDisplay.show && eventDisplay.event && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 cursor-pointer"
          onClick={skipEventDisplay}
        >
          <Card className="bg-gradient-to-br from-purple-900 to-blue-900 border-purple-500 max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-white">
                ALERT !
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <h3 className="text-xl font-bold text-yellow-400">
                {eventDisplay.event.name}
              </h3>
              <p className="text-gray-200">
                {eventDisplay.event.description}
              </p>
              <div className="text-sm text-purple-300">
                Starting in {Math.ceil(eventDisplay.timeRemaining / 1000)} seconds...
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Click anywhere to skip
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tutorial Modal */}
      <Tutorial 
        isOpen={showTutorial}
        onClose={hideTutorialModal}
        onComplete={completeTutorial}
      />
    </>
  );
}
