import { getPath, getRandomPath } from "./pathfinding";

export function updateGameLogic(gameState: any, delta: number) {
  if (gameState.gamePhase !== "playing") return;

  const currentTime = Date.now();

  // Spawn enemies
  spawnEnemies(gameState, currentTime);

  // Update enemies
  updateEnemies(gameState, delta);

  // Update towers (shooting)
  updateTowers(gameState, currentTime);

  // Update bullets
  updateBullets(gameState, delta);

  // Check wave completion
  checkWaveCompletion(gameState);

  // Clean up dead enemies
  cleanupDeadEnemies(gameState);
}

function spawnEnemies(gameState: any, currentTime: number) {
  const timeSinceWaveStart = currentTime - gameState.waveStartTime;
  const spawnInterval = Math.max(1000 - gameState.wave * 50, 300); // Spawn faster as waves progress
  const expectedSpawned = Math.floor(timeSinceWaveStart / spawnInterval);
  
  if (expectedSpawned > gameState.enemiesSpawned && gameState.enemiesSpawned < gameState.enemiesInWave) {
    const enemyTypes = ["basic", "fast", "heavy"];
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    // Boss every 5 waves
    const finalType = gameState.wave % 5 === 0 && gameState.enemiesSpawned === gameState.enemiesInWave - 1 ? "boss" : type;
    
    const enemy = createEnemy(finalType, gameState.wave);
    gameState.spawnEnemy(enemy);
    gameState.setEnemiesSpawned(gameState.enemiesSpawned + 1);
  }

  // Update wave progress
  const progress = Math.min(100, (gameState.enemiesSpawned / gameState.enemiesInWave) * 100);
  gameState.setWaveProgress(progress);
}

function createEnemy(type: string, wave: number) {
  // Use random path for each enemy
  const path = getRandomPath();
  const startPoint = path[0];
  
  const baseConfig = {
    basic: { health: 50, speed: 0.8, reward: 5 },
    fast: { health: 35, speed: 1.2, reward: 7 },
    heavy: { health: 100, speed: 0.5, reward: 10 },
    boss: { health: 250, speed: 0.4, reward: 25 }
  };

  const config = baseConfig[type as keyof typeof baseConfig] || baseConfig.basic;
  
  // Scale with wave
  const scaledHealth = Math.floor(config.health + (wave - 1) * config.health * 0.3);
  const scaledSpeed = config.speed + (wave - 1) * 0.1;

  return {
    id: Math.random().toString(36).substr(2, 9),
    x: startPoint.x,
    z: startPoint.z,
    health: scaledHealth,
    maxHealth: scaledHealth,
    speed: scaledSpeed,
    pathIndex: 0,
    type,
    reward: config.reward,
    path: path, // Store the path with each enemy
  };
}

function updateEnemies(gameState: any, delta: number) {
  gameState.enemies.forEach((enemy: any) => {
    // Use the enemy's individual path
    const path = enemy.path || getPath();
    
    // Check if enemy has crossed the life line (z > 4.5) - now at the front
    if (enemy.z > 4.5) {
      // Enemy reached the end, crossed life line
      gameState.removeEnemy(enemy.id);
      gameState.takeDamage(1);
      return;
    }

    if (enemy.pathIndex >= path.length - 1) {
      // Enemy reached the end of path
      gameState.removeEnemy(enemy.id);
      gameState.takeDamage(1);
      return;
    }

    const currentTarget = path[enemy.pathIndex + 1];
    const dx = currentTarget.x - enemy.x;
    const dz = currentTarget.z - enemy.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 0.1) {
      // Reached waypoint, move to next
      gameState.updateEnemy(enemy.id, currentTarget.x, currentTarget.z, enemy.pathIndex + 1);
    } else {
      // Move towards waypoint
      const moveDistance = enemy.speed * delta;
      const newX = enemy.x + (dx / distance) * moveDistance;
      const newZ = enemy.z + (dz / distance) * moveDistance;
      gameState.updateEnemy(enemy.id, newX, newZ, enemy.pathIndex);
    }
  });
}

function updateTowers(gameState: any, currentTime: number) {
  gameState.towers.forEach((tower: any) => {
    if (currentTime - tower.lastShot < tower.fireRate) return;

    // Find enemies in range (tower world position conversion)
    const towerWorldX = tower.x * 2 - 4;
    const towerWorldZ = tower.z * 2 - 2;
    
    const enemiesInRange = gameState.enemies.filter((enemy: any) => {
      const dx = enemy.x - towerWorldX;
      const dz = enemy.z - towerWorldZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance <= tower.range;
    });

    if (enemiesInRange.length > 0) {
      // Target the enemy furthest along the path (closest to goal)
      const target = enemiesInRange.reduce((closest: any, enemy: any) => 
        enemy.pathIndex > closest.pathIndex ? enemy : closest
      );

      // Calculate barrel end position for bullet spawn
      const barrelLength = tower.level === 1 ? 0.6 : tower.level === 2 ? 0.8 : 1.0;
      const dx = target.x - towerWorldX;
      const dz = target.z - towerWorldZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      const normalizedDx = dx / distance;
      const normalizedDz = dz / distance;
      
      // Spawn bullet at barrel end
      const barrelEndX = towerWorldX + normalizedDx * barrelLength;
      const barrelEndZ = towerWorldZ + normalizedDz * barrelLength;

      const bullet = {
        id: Math.random().toString(36).substr(2, 9),
        x: barrelEndX,
        y: 1.2 + tower.level * 0.2, // Height matches tower level
        z: barrelEndZ,
        targetId: target.id,
        damage: tower.damage,
        speed: 8,
        color: tower.level === 1 ? "#ff6b6b" : tower.level === 2 ? "#4ecdc4" : "#45b7d1",
      };

      gameState.addBullet(bullet);
      gameState.updateTowerLastShot(tower.id, currentTime);
    }
  });
}

function updateBullets(gameState: any, delta: number) {
  gameState.bullets.forEach((bullet: any) => {
    const target = gameState.enemies.find((e: any) => e.id === bullet.targetId);
    
    if (!target) {
      // Target is gone, remove bullet
      gameState.removeBullet(bullet.id);
      return;
    }

    // Move bullet towards target
    const dx = target.x - bullet.x;
    const dy = 0.5 - bullet.y; // Aim slightly above target
    const dz = target.z - bullet.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance < 0.3) {
      // Hit target
      gameState.damageEnemy(target.id, bullet.damage);
      gameState.removeBullet(bullet.id);
      
      if (target.health <= bullet.damage) {
        // Enemy will die, award coins
        gameState.addCoins(target.reward);
      }
    } else {
      // Move bullet
      const moveDistance = bullet.speed * delta;
      const newX = bullet.x + (dx / distance) * moveDistance;
      const newY = bullet.y + (dy / distance) * moveDistance;
      const newZ = bullet.z + (dz / distance) * moveDistance;
      gameState.updateBullet(bullet.id, newX, newY, newZ);
    }
  });
}

function checkWaveCompletion(gameState: any) {
  if (gameState.enemiesSpawned >= gameState.enemiesInWave && gameState.enemies.length === 0) {
    // Wave completed
    gameState.nextWave();
    gameState.addCoins(10 + gameState.wave * 2); // Wave completion bonus
  }
}

function cleanupDeadEnemies(gameState: any) {
  const deadEnemies = gameState.enemies.filter((enemy: any) => enemy.health <= 0);
  deadEnemies.forEach((enemy: any) => {
    gameState.removeEnemy(enemy.id);
  });
}
