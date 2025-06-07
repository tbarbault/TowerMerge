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
  const spawnInterval = Math.max(1500 - gameState.wave * 50, 500); // Slower spawning with more time between waves
  const expectedSpawned = Math.floor(timeSinceWaveStart / spawnInterval);
  
  if (expectedSpawned > gameState.enemiesSpawned && gameState.enemiesSpawned < gameState.enemiesInWave) {
    // Progressive enemy types based on wave
    let enemyTypes = ["basic", "fast"];
    
    if (gameState.wave >= 3) enemyTypes.push("heavy");
    if (gameState.wave >= 6) enemyTypes.push("armored");
    if (gameState.wave >= 10) enemyTypes.push("elite");
    
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    // Special bosses at milestone waves
    let finalType = type;
    if (gameState.wave % 10 === 0 && gameState.enemiesSpawned === gameState.enemiesInWave - 1) {
      finalType = "megaboss";
    } else if (gameState.wave % 5 === 0 && gameState.enemiesSpawned === gameState.enemiesInWave - 1) {
      finalType = "boss";
    }
    
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
    basic: { health: 120, speed: 0.8, reward: 3 },
    fast: { health: 85, speed: 1.3, reward: 4 },
    heavy: { health: 200, speed: 0.5, reward: 6 },
    armored: { health: 350, speed: 0.6, reward: 8 },
    elite: { health: 500, speed: 0.7, reward: 12 },
    boss: { health: 800, speed: 0.4, reward: 20 },
    megaboss: { health: 1500, speed: 0.3, reward: 40 }
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

      // Calculate direction to target for bullet firing
      const dx = target.x - towerWorldX;
      const dz = target.z - towerWorldZ;
      const distance = Math.sqrt(dx * dx + dz * dz);

      // Calculate barrel end position for bullet spawn
      const barrelLength = tower.level === 1 ? 0.6 : tower.level === 2 ? 0.8 : 1.0;
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
        directionX: normalizedDx,
        directionZ: normalizedDz,
        damage: tower.damage,
        speed: tower.type === 'mortar' ? 4 : 12, // Faster turret bullets
        color: tower.type === 'mortar' 
          ? (tower.level === 1 ? "#ff8c00" : tower.level === 2 ? "#ff6347" : "#dc143c")
          : (tower.level === 1 ? "#ff6b6b" : tower.level === 2 ? "#4ecdc4" : "#45b7d1"),
        type: tower.type === 'mortar' ? 'mortar' : 'bullet',
        explosionRadius: tower.type === 'mortar' ? (0.8 + tower.level * 0.4) : undefined,
        targetX: tower.type === 'mortar' ? target.x : undefined,
        targetZ: tower.type === 'mortar' ? target.z : undefined,
      };

      gameState.addBullet(bullet);
      gameState.updateTowerLastShot(tower.id, currentTime);
    }
  });
}

function updateBullets(gameState: any, delta: number) {
  gameState.bullets.forEach((bullet: any) => {
    // Move bullet in straight line using direction vector
    const moveDistance = bullet.speed * delta;
    const newX = bullet.x + bullet.directionX * moveDistance;
    const newZ = bullet.z + bullet.directionZ * moveDistance;

    // Check if bullet is out of bounds (extended map bounds)
    if (newX < -15 || newX > 15 || newZ < -10 || newZ > 10) {
      gameState.removeBullet(bullet.id);
      return;
    }

    // Handle mortars differently - they explode at predetermined target positions
    if (bullet.type === 'mortar' && bullet.targetX !== undefined && bullet.targetZ !== undefined) {
      // Check if mortar has reached its target position
      const distanceToTarget = Math.sqrt(
        (newX - bullet.targetX) ** 2 + (newZ - bullet.targetZ) ** 2
      );
      
      if (distanceToTarget <= 0.5) {
        // Mortar reaches target - explode at predetermined position
        const enemiesInRadius = gameState.enemies.filter((enemy: any) => {
          const dx = enemy.x - bullet.targetX!;
          const dz = enemy.z - bullet.targetZ!;
          const distanceToExplosion = Math.sqrt(dx * dx + dz * dz);
          return distanceToExplosion <= bullet.explosionRadius;
        });

        // Add explosion effect at target position
        gameState.addExplosion({
          id: Math.random().toString(36).substr(2, 9),
          x: bullet.targetX,
          y: bullet.y,
          z: bullet.targetZ,
          radius: bullet.explosionRadius,
          startTime: Date.now(),
        });

        enemiesInRadius.forEach((enemy: any) => {
          const dx = enemy.x - bullet.targetX!;
          const dz = enemy.z - bullet.targetZ!;
          const distanceToExplosion = Math.sqrt(dx * dx + dz * dz);
          // Damage falls off with distance
          const damageMultiplier = Math.max(0.3, 1 - (distanceToExplosion / bullet.explosionRadius));
          const finalDamage = Math.floor(bullet.damage * damageMultiplier);
          
          gameState.damageEnemy(enemy.id, finalDamage);
          
          if (enemy.health <= finalDamage) {
            // Enemy will die, award coins
            gameState.addCoins(enemy.reward);
          }
        });
        
        gameState.removeBullet(bullet.id);
        return;
      }
    } else {
      // Handle turret bullets - check collision with enemies
      const hitEnemy = gameState.enemies.find((enemy: any) => {
        // Check collision at current bullet position
        const currentDx = enemy.x - bullet.x;
        const currentDz = enemy.z - bullet.z;
        const currentDistance = Math.sqrt(currentDx * currentDx + currentDz * currentDz);
        
        // Check collision at new bullet position
        const newDx = enemy.x - newX;
        const newDz = enemy.z - newZ;
        const newDistance = Math.sqrt(newDx * newDx + newDz * newDz);
        
        // Hit if either position is within collision radius - larger radius for bigger enemies
        const getHitRadius = (type: string) => {
          switch (type) {
            case 'basic': return 0.35;
            case 'fast': return 0.3;
            case 'heavy': return 0.45;
            case 'armored': return 0.5;
            case 'elite': return 0.55;
            case 'boss': return 0.65;
            case 'megaboss': return 0.85;
            default: return 0.4;
          }
        };
        const hitRadius = getHitRadius(enemy.type);
        return currentDistance < hitRadius || newDistance < hitRadius;
      });

      if (hitEnemy) {
        // Calculate impact position at contact point (front of enemy facing bullet direction)
        const impactX = hitEnemy.x - (bullet.directionX * 0.3);
        const impactZ = hitEnemy.z - (bullet.directionZ * 0.3);
        
        // Regular bullet: single target damage
        // Add impact effect for turret bullets at contact point
        gameState.addImpact({
          id: Math.random().toString(36).substr(2, 9),
          x: impactX,
          y: 0.5,
          z: impactZ,
          startTime: Date.now(),
        });
        
        gameState.damageEnemy(hitEnemy.id, bullet.damage);
        
        if (hitEnemy.health <= bullet.damage) {
          // Enemy will die, award coins
          gameState.addCoins(hitEnemy.reward);
        }
        
        gameState.removeBullet(bullet.id);
        return;
      }
    }

    // Continue moving in straight line
    gameState.updateBullet(bullet.id, newX, bullet.y, newZ);
  });
}

function checkWaveCompletion(gameState: any) {
  if (gameState.enemiesSpawned >= gameState.enemiesInWave && gameState.enemies.length === 0) {
    // Wave completed - add 3 second pause before next wave
    const now = Date.now();
    if (!gameState.waveCompletionTime) {
      // Mark wave as completed and give bonus coins once
      gameState.setWaveCompletionTime(now);
      gameState.addCoins(5 + gameState.wave * 2);
      return;
    }
    
    // Wait 3 seconds before starting next wave
    if (now - gameState.waveCompletionTime >= 3000) {
      gameState.nextWave();
    }
  }
}

function cleanupDeadEnemies(gameState: any) {
  const deadEnemies = gameState.enemies.filter((enemy: any) => enemy.health <= 0);
  deadEnemies.forEach((enemy: any) => {
    gameState.removeEnemy(enemy.id);
  });
}
