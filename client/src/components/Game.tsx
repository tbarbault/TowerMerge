import { useFrame } from "@react-three/fiber";
import { useEffect } from "react";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { useAudio } from "../lib/stores/useAudio";
import Lights from "./Lights";
import Terrain from "./Terrain";
import Grid from "./Grid";
import Tower from "./Tower";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import Explosion from "./Explosion";
import Impact from "./Impact";
import Obstacle from "./Obstacle";
import Mine from "./Mine";
import TunnelExits from "./TunnelExits";
import BackgroundDecor from "./BackgroundDecor";


import { updateGameLogic } from "../lib/gameLogic";

export default function Game() {
  const gameState = useTowerDefense();
  const { initialize, enableAudio, isIOS, cleanup } = useAudio();

  // Initialize audio with mobile support
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        await initialize();

        // Enable audio context on first user interaction for mobile devices
        const enableAudioHandler = () => {
          enableAudio();
          document.removeEventListener('touchstart', enableAudioHandler);
          document.removeEventListener('click', enableAudioHandler);
        };

        // Add event listeners for user interaction
        document.addEventListener('touchstart', enableAudioHandler, { once: true });
        document.addEventListener('click', enableAudioHandler, { once: true });
        
        console.log(`Game initialized for ${isIOS ? 'iOS' : 'desktop'} device`);
      } catch (error) {
        console.warn("Audio initialization failed:", error);
      }
    };

    initializeAudio();

    // Cleanup on unmount
    return () => {
      cleanup();
    };
  }, [initialize, enableAudio, isIOS, cleanup]);

  // Game loop with iOS performance optimization
  useFrame((state, delta) => {
    // Only update game logic if not paused and tutorial is not open
    if (gameState.gamePhase === "playing" && !gameState.showTutorial) {
      // Throttle updates on iOS devices for better performance
      if (isIOS) {
        // Update at 30fps instead of 60fps on iOS
        const now = Date.now();
        if (!gameState.lastUpdateTime || now - gameState.lastUpdateTime >= 33) {
          updateGameLogic(gameState, Math.min(delta, 0.033)); // Cap delta to prevent large time jumps
          gameState.lastUpdateTime = now;
        }
      } else {
        updateGameLogic(gameState, delta);
      }
    }
  });

  return (
    <>
      <Lights />
      <BackgroundDecor />
      <Terrain />
      <Grid />
      <TunnelExits />
      
      {/* Render towers */}
      {gameState.towers.map((tower) => (
        <Tower
          key={tower.id}
          towerId={tower.id}
          position={[tower.x * 2.5 - 5, 0, tower.z * 2.5 + 1.25]}
          level={tower.level}
          type={tower.type}
          isSelected={tower.id === gameState.selectedTower?.id}
        />
      ))}

      {/* Render enemies */}
      {gameState.enemies.map((enemy) => (
        <Enemy
          key={enemy.id}
          position={[enemy.x, 0.5, enemy.z]}
          health={enemy.health}
          maxHealth={enemy.maxHealth}
          type={enemy.type}
        />
      ))}

      {/* Render bullets */}
      {gameState.bullets.map((bullet) => (
        <Bullet
          key={bullet.id}
          position={[bullet.x, bullet.y, bullet.z]}
          color={bullet.color}
          type={bullet.type}
        />
      ))}

      {/* Render explosions */}
      {gameState.explosions.map((explosion) => (
        <Explosion
          key={explosion.id}
          position={[explosion.x, explosion.y, explosion.z]}
          radius={explosion.radius}
          color={explosion.color}
          onComplete={() => gameState.removeExplosion(explosion.id)}
        />
      ))}

      {/* Render impacts */}
      {gameState.impacts.map((impact) => (
        <Impact
          key={impact.id}
          position={[impact.x, impact.y, impact.z]}
          onComplete={() => gameState.removeImpact(impact.id)}
        />
      ))}

      {/* Render mines */}
      {gameState.mines.map((mine) => (
        <Mine
          key={mine.id}
          position={[mine.x, 0, mine.z]}
          triggered={mine.triggered}
          onExplode={() => {
            // Create explosion effect
            gameState.addExplosion({
              id: `mine-explosion-${Date.now()}`,
              x: mine.x,
              y: 0.5,
              z: mine.z,
              radius: mine.explosionRadius,
              startTime: Date.now(),
              color: "#ff4400"
            });
            
            // Damage nearby enemies
            gameState.enemies.forEach((enemy) => {
              const distance = Math.sqrt(
                Math.pow(enemy.x - mine.x, 2) +
                Math.pow(enemy.z - mine.z, 2)
              );
              
              if (distance <= mine.explosionRadius) {
                gameState.damageEnemy(enemy.id, mine.damage);
              }
            });
            
            // Remove the mine
            gameState.removeMine(mine.id);
          }}
        />
      ))}

    </>
  );
}
