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

export function getAvailableEnemyTypes(wave: number): string[] {
  // Wave 1: Only basic enemies
  if (wave === 1) {
    return ["basic"];
  }
  // Wave 2: Introduce fast enemies
  else if (wave === 2) {
    return ["basic", "fast"];
  }
  // Wave 3-4: Add heavy enemies gradually
  else if (wave <= 4) {
    const types = ["basic", "fast"];
    if (wave >= 3) types.push("heavy");
    return types;
  }
  // Wave 5-7: Introduce armored enemies
  else if (wave <= 7) {
    const types = ["basic", "fast", "heavy"];
    if (wave >= 5) types.push("armored");
    return types;
  }
  // Wave 8+: All enemy types available
  else {
    const types = ["basic", "fast", "heavy", "armored"];
    if (wave >= 8) types.push("elite");
    return types;
  }
}

function spawnEnemies(gameState: any, currentTime: number) {
  const timeSinceWaveStart = currentTime - gameState.waveStartTime;
  const spawnInterval = Math.max(1500 - gameState.wave * 50, 500); // Slower spawning with more time between waves
  const expectedSpawned = Math.floor(timeSinceWaveStart / spawnInterval);
  
  if (expectedSpawned > gameState.enemiesSpawned && gameState.enemiesSpawned < gameState.enemiesInWave) {
    // Get available enemy types for this wave
    const enemyTypes = getAvailableEnemyTypes(gameState.wave);
    
    // Select enemy type with weighted distribution
    let finalType = selectWeightedEnemyType(enemyTypes, gameState.wave);
    
    // Special bosses at milestone waves
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

function selectWeightedEnemyType(availableTypes: string[], wave: number) {
  // Early waves favor weaker enemies
  if (wave <= 3) {
    const weights = {
      basic: 70,
      fast: 25,
      heavy: 5
    };
    return getWeightedRandomType(availableTypes, weights);
  }
  // Mid waves balance enemy types
  else if (wave <= 7) {
    const weights = {
      basic: 40,
      fast: 30,
      heavy: 20,
      armored: 10
    };
    return getWeightedRandomType(availableTypes, weights);
  }
  // Later waves favor stronger enemies
  else {
    const weights = {
      basic: 20,
      fast: 25,
      heavy: 25,
      armored: 20,
      elite: 10
    };
    return getWeightedRandomType(availableTypes, weights);
  }
}

function getWeightedRandomType(types: string[], weights: Record<string, number>) {
  const availableWeights = types.map(type => weights[type] || 0);
  const totalWeight = availableWeights.reduce((sum, weight) => sum + weight, 0);
  
  if (totalWeight === 0) return types[0];
  
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < types.length; i++) {
    random -= availableWeights[i];
    if (random <= 0) return types[i];
  }
  
  return types[types.length - 1];
}

function createEnemy(type: string, wave: number) {
  // Use random path for each enemy
  const path = getRandomPath();
  const startPoint = path[0];
  
  const baseConfig = {
    basic: { health: 220, speed: 1.2, reward: 1 },
    fast: { health: 180, speed: 2.0, reward: 2 },
    heavy: { health: 400, speed: 1.0, reward: 2 },
    armored: { health: 580, speed: 1.1, reward: 3 },
    elite: { health: 850, speed: 1.3, reward: 4 },
    boss: { health: 1350, speed: 0.9, reward: 8 },
    megaboss: { health: 2700, speed: 0.8, reward: 15 }
  };

  const config = baseConfig[type as keyof typeof baseConfig] || baseConfig.basic;
  
  // Scale with wave - more gradual scaling
  const healthScaling = Math.min(0.15, 0.05 + (wave - 1) * 0.01); // Start at 5%, increase by 1% per wave, cap at 15%
  const scaledHealth = Math.floor(config.health * (1 + (wave - 1) * healthScaling));
  const speedScaling = Math.min(0.05, (wave - 1) * 0.005); // Very gradual speed increase
  const scaledSpeed = config.speed * (1 + speedScaling);

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
    
    // Check if enemy has crossed the life line (z > 8) - aligned with red line
    if (enemy.z > 8) {
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
      // Move towards waypoint with obstacle avoidance
      const moveDistance = enemy.speed * delta;
      let newX = enemy.x + (dx / distance) * moveDistance;
      let newZ = enemy.z + (dz / distance) * moveDistance;
      
      // No obstacle collision - enemies move freely
      
      gameState.updateEnemy(enemy.id, newX, newZ, enemy.pathIndex);
    }
  });
}

function updateTowers(gameState: any, currentTime: number) {
  gameState.towers.forEach((tower: any) => {
    if (currentTime - tower.lastShot < tower.fireRate) return;

    // Find enemies in range (tower world position conversion)
    const towerWorldX = tower.x * 2.5 - 5;
    const towerWorldZ = tower.z * 2.5 + 1.25;
    
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

      // Calculate barrel/cannon end position for bullet spawn based on tower type and level
      const getBarrelLength = (type: 'turret' | 'mortar', level: number) => {
        if (type === 'turret') {
          switch (level) {
            case 1: return 0.5;
            case 2: return 0.64;
            case 3: return 0.8;
            case 4: return 1.0;
            case 5: return 1.24;
            default: return 0.5;
          }
        } else { // mortar
          switch (level) {
            case 1: return 0.36;
            case 2: return 0.5;
            case 3: return 0.64;
            case 4: return 0.8;
            case 5: return 1.0;
            default: return 0.36;
          }
        }
      };
      
      const barrelLength = getBarrelLength(tower.type, tower.level);
      const normalizedDx = dx / distance;
      const normalizedDz = dz / distance;
      
      // Spawn bullet at barrel/cannon end
      const barrelEndX = towerWorldX + normalizedDx * barrelLength;
      const barrelEndZ = towerWorldZ + normalizedDz * barrelLength;

      // Calculate proper firing height based on tower configuration
      const getTowerHeight = (type: 'turret' | 'mortar', level: number) => {
        if (type === 'turret') {
          switch (level) {
            case 1: return 0.12;
            case 2: return 0.18;
            case 3: return 0.26;
            case 4: return 0.36;
            case 5: return 0.48;
            default: return 0.12;
          }
        } else { // mortar
          switch (level) {
            case 1: return 0.1;
            case 2: return 0.15;
            case 3: return 0.22;
            case 4: return 0.31;
            case 5: return 0.42;
            default: return 0.1;
          }
        }
      };

      const towerHeight = getTowerHeight(tower.type, tower.level);
      const firingHeight = towerHeight + 0.05; // Slightly above tower top

      const bullet = {
        id: Math.random().toString(36).substr(2, 9),
        x: barrelEndX,
        y: firingHeight,
        z: barrelEndZ,
        directionX: normalizedDx,
        directionZ: normalizedDz,
        damage: tower.damage,
        speed: tower.type === 'mortar' ? 4 : 12, // Faster turret bullets
        color: tower.level === 1 ? "#22c55e" : tower.level === 2 ? "#3b82f6" : tower.level === 3 ? "#a855f7" : tower.level === 4 ? "#ef4444" : "#f59e0b",
        type: tower.type === 'mortar' ? 'mortar' : 'bullet',
        explosionRadius: tower.type === 'mortar' ? (1.2 + tower.level * 0.4) : undefined,
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

    // Check collision with obstacles (only for non-mortar bullets)
    if (bullet.type !== 'mortar') {
      const hitObstacle = gameState.obstacles.find((obstacle: any) => {
        const dx = obstacle.x - newX;
        const dz = obstacle.z - newZ;
        const distance = Math.sqrt(dx * dx + dz * dz);
        return distance < 0.8; // Obstacle collision radius
      });

      if (hitObstacle) {
        // Remove bullet when it hits obstacle
        gameState.removeBullet(bullet.id);
        return;
      }
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

        // Add explosion effect at target position with mortar color
        gameState.addExplosion({
          id: Math.random().toString(36).substr(2, 9),
          x: bullet.targetX,
          y: bullet.y,
          z: bullet.targetZ,
          radius: bullet.explosionRadius,
          startTime: Date.now(),
          color: bullet.color,
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

        // Play explosion sound effect
        try {
          const explosionAudio = new Audio("/sounds/hit.mp3");
          explosionAudio.volume = 0.5;
          explosionAudio.play().catch(() => {});
        } catch (e) {}
        
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
      gameState.addCoins(2 + gameState.wave);
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
