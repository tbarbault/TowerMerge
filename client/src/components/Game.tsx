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
import { updateGameLogic } from "../lib/gameLogic";

export default function Game() {
  const gameState = useTowerDefense();
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Initialize audio
  useEffect(() => {
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    setBackgroundMusic(bgMusic);

    const hitAudio = new Audio("/sounds/hit.mp3");
    hitAudio.volume = 0.5;
    setHitSound(hitAudio);

    const successAudio = new Audio("/sounds/success.mp3");
    successAudio.volume = 0.7;
    setSuccessSound(successAudio);
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  // Game loop
  useFrame((state, delta) => {
    updateGameLogic(gameState, delta);
  });

  return (
    <>
      <Lights />
      <Terrain />
      <Grid />
      
      {/* Render towers */}
      {gameState.towers.map((tower) => (
        <Tower
          key={tower.id}
          towerId={tower.id}
          position={[tower.x * 2 - 4, 0, tower.z * 2 - 2]}
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
          onComplete={() => gameState.removeExplosion(explosion.id)}
        />
      ))}
    </>
  );
}
