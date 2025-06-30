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

  // Update mines (check for enemy proximity)
  updateMines(gameState);

  // Check wave completion
  checkWaveCompletion(gameState);

  // Clean up dead enemies
  cleanupDeadEnemies(gameState);
}

function updateMines(gameState: any) {
  // Check each mine for nearby enemies
  gameState.mines.forEach((mine: any) => {
    if (mine.triggered) return; // Skip already triggered mines
    
    const triggerRadius = 1.0; // Distance at which mine triggers
    
    // Check if any enemy is within trigger range
    const nearbyEnemy = gameState.enemies.find((enemy: any) => {
      const distance = Math.sqrt(
        Math.pow(enemy.x - mine.x, 2) +
        Math.pow(enemy.z - mine.z, 2)
      );
      return distance <= triggerRadius;
    });
    
    if (nearbyEnemy) {
      // Trigger the mine
      gameState.triggerMine(mine.id);
      
      // Play mine trigger sound
      const audioMuted = typeof window !== 'undefined' && window.localStorage ? 
        JSON.parse(window.localStorage.getItem('audio-muted') || 'false') : false;
      if (!audioMuted) {
        try {
          const mineAudio = new Audio("/sounds/explosion.wav");
          mineAudio.volume = 0.8;
          mineAudio.playbackRate = 0.9;
          mineAudio.play().catch(() => {});
          console.log("Playing mine explosion sound");
        } catch (e) {
          console.log("Error playing mine sound:", e);
        }
      }
    }
  });
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
  // Wave 8+: All enemy types available with progressive unlocks
  else {
    const types = ["basic", "fast", "heavy", "armored"];
    if (wave >= 8) types.push("elite");
    if (wave >= 15) types.push("stealth"); // New enemy at wave 15
    if (wave >= 20) types.push("berserker"); // New enemy at wave 20
    if (wave >= 30) types.push("titan"); // New enemy at wave 30
    return types;
  }
}

function spawnEnemies(gameState: any, currentTime: number) {
  const timeSinceWaveStart = currentTime - gameState.waveStartTime;
  // Aggressive spawn rate scaling for challenging late game
  const getSpawnInterval = (wave: number) => {
    if (wave <= 10) {
      return Math.max(1500 - wave * 50, 800); // Waves 1-10: Gentle reduction
    } else if (wave <= 20) {
      return Math.max(800 - (wave - 10) * 40, 400); // Waves 11-20: Faster spawning
    } else if (wave <= 30) {
      return Math.max(400 - (wave - 20) * 20, 200); // Waves 21-30: Very fast spawning
    } else {
      return Math.max(200 - (wave - 30) * 5, 100); // Waves 31+: Extreme spawning
    }
  };
  
  const spawnInterval = getSpawnInterval(gameState.wave);
  const expectedSpawned = Math.floor(timeSinceWaveStart / spawnInterval);
  
  // Burst spawning for high waves - spawn multiple enemies at once
  const burstSize = gameState.wave >= 15 ? Math.min(3, Math.floor(gameState.wave / 10)) : 1;
  const enemiesToSpawn = Math.min(burstSize, gameState.enemiesInWave - gameState.enemiesSpawned);
  
  if (expectedSpawned > gameState.enemiesSpawned && gameState.enemiesSpawned < gameState.enemiesInWave) {
    for (let i = 0; i < enemiesToSpawn; i++) {
      if (gameState.enemiesSpawned >= gameState.enemiesInWave) break;
      
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
  }

  // Update wave progress
  const progress = Math.min(100, (gameState.enemiesSpawned / gameState.enemiesInWave) * 100);
  gameState.setWaveProgress(progress);
}

function selectWeightedEnemyType(availableTypes: string[], wave: number) {
  // Generate different wave themes randomly
  const waveThemes = ['balanced', 'speed', 'tank', 'swarm', 'elite'];
  const theme = waveThemes[Math.floor(Math.random() * waveThemes.length)];
  
  let baseWeights = getBaseWeights(wave);
  
  // Apply theme modifiers
  switch (theme) {
    case 'speed':
      baseWeights.fast *= 2;
      baseWeights.stealth *= 1.5;
      break;
    case 'tank':
      baseWeights.heavy *= 2;
      baseWeights.armored *= 1.8;
      baseWeights.titan *= 1.5;
      break;
    case 'swarm':
      baseWeights.basic *= 3;
      baseWeights.fast *= 1.5;
      break;
    case 'elite':
      baseWeights.elite *= 2;
      baseWeights.berserker *= 1.5;
      break;
  }
  
  return getWeightedRandomType(availableTypes, baseWeights);
}

function getBaseWeights(wave: number) {
  // Early waves favor weaker enemies
  if (wave <= 3) {
    return {
      basic: 70,
      fast: 25,
      heavy: 5
    };
  }
  // Mid waves balance enemy types
  else if (wave <= 7) {
    return {
      basic: 40,
      fast: 30,
      heavy: 20,
      armored: 10
    };
  }
  // Later waves favor stronger enemies with new enemy types
  else if (wave <= 14) {
    return {
      basic: 20,
      fast: 25,
      heavy: 25,
      armored: 20,
      elite: 10
    };
  }
  // Wave 15-19: Introduce stealth enemies
  else if (wave <= 19) {
    return {
      basic: 15,
      fast: 20,
      heavy: 20,
      armored: 20,
      elite: 15,
      stealth: 10
    };
  }
  // Wave 20-29: Introduce berserkers
  else if (wave <= 29) {
    return {
      basic: 10,
      fast: 15,
      heavy: 20,
      armored: 20,
      elite: 15,
      stealth: 10,
      berserker: 10
    };
  }
  // Wave 30+: All enemies including titans - favor stronger enemies
  else {
    return {
      basic: 2,
      fast: 5,
      heavy: 8,
      armored: 15,
      elite: 20,
      stealth: 12,
      berserker: 20,
      titan: 18
    };
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
    basic: { health: 238, speed: 1.2, reward: 1 }, // -5% from 250
    fast: { health: 194, speed: 2.0, reward: 2 }, // -5% from 204
    heavy: { health: 431, speed: 1.0, reward: 2 }, // -5% from 454
    armored: { health: 624, speed: 1.1, reward: 3 }, // -5% from 657
    elite: { health: 916, speed: 1.3, reward: 4 }, // -5% from 964
    boss: { health: 1454, speed: 0.9, reward: 8 }, // -5% from 1531
    megaboss: { health: 2909, speed: 0.8, reward: 15 }, // -5% from 3062
    // New enemies for increased complexity
    stealth: { health: 361, speed: 1.6, reward: 3 }, // -5% from 380 - Wave 15+ - Fast and moderately tough
    berserker: { health: 684, speed: 1.4, reward: 5 }, // -5% from 720 - Wave 20+ - High damage resistance, fast
    titan: { health: 1710, speed: 0.7, reward: 12 } // -5% from 1800 - Wave 30+ - Massive health, slow but devastating
  };

  const config = baseConfig[type as keyof typeof baseConfig] || baseConfig.basic;
  
  // Aggressive difficulty scaling for challenging late game
  let healthMultiplier = 1;
  let speedMultiplier = 1;
  
  if (wave <= 10) {
    // Waves 1-10: Gentle scaling (old behavior)
    healthMultiplier = 1 + (wave - 1) * 0.08; // 8% per wave
    speedMultiplier = 1 + (wave - 1) * 0.02; // 2% per wave
  } else if (wave <= 20) {
    // Waves 11-20: Aggressive scaling (increased from moderate)
    healthMultiplier = 1.72 + (wave - 10) * 0.25; // Start at 172%, +25% per wave (was +15%)
    speedMultiplier = 1.18 + (wave - 10) * 0.05; // Start at 118%, +5% per wave (was +3%)
  } else if (wave <= 30) {
    // Waves 21-30: Very aggressive scaling (increased)
    healthMultiplier = 4.22 + (wave - 20) * 0.35; // Start at 422%, +35% per wave (was 322%, +25%)
    speedMultiplier = 1.68 + (wave - 20) * 0.06; // Start at 168%, +6% per wave (was 148%, +4%)
  } else {
    // Waves 31+: Extreme scaling (increased)
    healthMultiplier = 7.72 + (wave - 30) * 0.45; // Start at 772%, +45% per wave (was 572%, +35%)
    speedMultiplier = 2.28 + (wave - 30) * 0.07; // Start at 228%, +7% per wave (was 188%, +5%)
  }
  
  const scaledHealth = Math.floor(config.health * healthMultiplier);
  const scaledSpeed = config.speed * speedMultiplier;

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
  const bonuses = gameState.getResearchBonuses();
  
  gameState.towers.forEach((tower: any) => {
    // Apply research bonuses to fire rate
    const fireRateMultiplier = tower.type === 'turret' ? bonuses.turretFireRateMultiplier : bonuses.mortarFireRateMultiplier;
    const adjustedFireRate = tower.fireRate / fireRateMultiplier;
    
    if (currentTime - tower.lastShot < adjustedFireRate) return;

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

      // Apply research bonuses to damage
      const damageMultiplier = tower.type === 'turret' ? bonuses.turretDamageMultiplier : bonuses.mortarDamageMultiplier;
      const enhancedDamage = Math.floor(tower.damage * damageMultiplier);

      const bullet = {
        id: Math.random().toString(36).substr(2, 9),
        x: barrelEndX,
        y: firingHeight,
        z: barrelEndZ,
        directionX: normalizedDx,
        directionZ: normalizedDz,
        damage: enhancedDamage,
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

        let enemiesKilled = 0;
        enemiesInRadius.forEach((enemy: any) => {
          const dx = enemy.x - bullet.targetX!;
          const dz = enemy.z - bullet.targetZ!;
          const distanceToExplosion = Math.sqrt(dx * dx + dz * dz);
          // Damage falls off with distance
          const damageMultiplier = Math.max(0.3, 1 - (distanceToExplosion / bullet.explosionRadius));
          const finalDamage = Math.floor(bullet.damage * damageMultiplier);
          
          const willDie = enemy.health <= finalDamage;
          gameState.damageEnemy(enemy.id, finalDamage);
          
          if (willDie) {
            // Enemy will die, award coins
            gameState.addCoins(enemy.reward);
            enemiesKilled++;
          }
        });

        // Play enemy death sound if any enemies were killed by explosion
        if (enemiesKilled > 0) {
          const audioMuted = typeof window !== 'undefined' && window.localStorage ? 
            JSON.parse(window.localStorage.getItem('audio-muted') || 'false') : false;
          if (!audioMuted) {
            try {
              const deathAudio = new Audio("/sounds/bubble_death.wav");
              deathAudio.volume = 0.6;
              deathAudio.playbackRate = 1.2; // Slightly faster for multiple deaths
              deathAudio.play().catch(() => {});
              console.log("Playing explosion death sound for", enemiesKilled, "enemies");
            } catch (e) {
              console.log("Error playing explosion death sound:", e);
            }
          }
        }

        // Play explosion sound effect for mortars
        const audioMuted = typeof window !== 'undefined' && window.localStorage ? 
          JSON.parse(window.localStorage.getItem('audio-muted') || 'false') : false;
        if (!audioMuted) {
          try {
            const explosionAudio = new Audio("/sounds/explosion.wav");
            explosionAudio.volume = 0.6;
            explosionAudio.playbackRate = 1.0;
            explosionAudio.play().catch(() => {});
            console.log("Playing mortar explosion sound");
          } catch (e) {
            console.log("Error playing explosion sound:", e);
          }
        }
        
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
        
        const willDie = hitEnemy.health <= bullet.damage;
        gameState.damageEnemy(hitEnemy.id, bullet.damage);
        
        if (willDie) {
          // Enemy will die, award coins
          gameState.addCoins(hitEnemy.reward);
          
          // Play enemy death sound
          const audioMuted = typeof window !== 'undefined' && window.localStorage ? 
            JSON.parse(window.localStorage.getItem('audio-muted') || 'false') : false;
          if (!audioMuted) {
            try {
              const deathAudio = new Audio("/sounds/bubble_death.wav");
              deathAudio.volume = 0.5;
              deathAudio.playbackRate = 1.0;
              deathAudio.play().catch(() => {});
              console.log("Playing enemy death sound");
            } catch (e) {
              console.log("Error playing death sound:", e);
            }
          }
        }

        // Play impact sound effect for bullets
        const audioMuted = typeof window !== 'undefined' && window.localStorage ? 
          JSON.parse(window.localStorage.getItem('audio-muted') || 'false') : false;
        if (!audioMuted) {
          try {
            const impactAudio = new Audio("/sounds/bullet_impact.wav");
            impactAudio.volume = 0.49; // Reduced by 30% from 0.7
            impactAudio.playbackRate = 1.0;
            impactAudio.play().catch(() => {});
            console.log("Playing bullet impact sound");
          } catch (e) {
            console.log("Error playing bullet impact sound:", e);
          }
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
    
    // Dynamic wave pause time - shorter for high waves
    const getPauseTime = (wave: number) => {
      if (wave <= 10) return 3000; // 3 seconds for early waves
      if (wave <= 20) return 2000; // 2 seconds for mid waves
      if (wave <= 30) return 1500; // 1.5 seconds for late waves
      return 1000; // 1 second for extreme waves
    };
    
    const pauseTime = getPauseTime(gameState.wave);
    if (now - gameState.waveCompletionTime >= pauseTime) {
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
