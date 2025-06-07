import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GamePhase = "menu" | "playing" | "gameOver";

export interface Tower {
  id: string;
  x: number;
  z: number;
  level: number;
  damage: number;
  range: number;
  fireRate: number;
  lastShot: number;
  type: 'turret' | 'mortar';
  currentRotation?: number;
  targetRotation?: number;
}

export interface Enemy {
  id: string;
  x: number;
  z: number;
  health: number;
  maxHealth: number;
  speed: number;
  pathIndex: number;
  type: string;
  reward: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  z: number;
  directionX: number;
  directionZ: number;
  damage: number;
  speed: number;
  color: string;
  type: 'bullet' | 'mortar';
  explosionRadius?: number;
  targetX?: number;
  targetZ?: number;
}

export interface MuzzleFlash {
  id: string;
  towerId: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  startTime: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  z: number;
  radius: number;
  startTime: number;
  color?: string;
}

export interface Impact {
  id: string;
  x: number;
  y: number;
  z: number;
  startTime: number;
}

export interface GridCell {
  x: number;
  z: number;
}

export interface Obstacle {
  id: string;
  x: number;
  z: number;
  type: 'rock' | 'tree' | 'barrier';
}

interface TowerDefenseState {
  // Game state
  gamePhase: GamePhase;
  wave: number;
  health: number;
  coins: number;
  waveStartTime: number;
  waveCompletionTime: number | null;
  
  // Game objects
  towers: Tower[];
  enemies: Enemy[];
  bullets: Bullet[];
  muzzleFlashes: MuzzleFlash[];
  explosions: Explosion[];
  impacts: Impact[];
  obstacles: Obstacle[];
  
  // UI state
  selectedGridCell: GridCell | null;
  selectedTower: Tower | null;
  selectedTowerType: 'turret' | 'mortar';
  selectedObstacleSlot: { x: number; z: number } | null;
  obstacleMode: boolean;
  
  // Wave management
  enemiesInWave: number;
  enemiesSpawned: number;
  waveProgress: number;
  
  // Actions
  startGame: () => void;
  restartGame: () => void;
  endGame: () => void;
  selectGridCell: (x: number, z: number) => void;
  selectTowerType: (type: 'turret' | 'mortar') => void;
  buyTower: () => void;
  mergeTowers: (sourceTowerId?: string, targetTowerId?: string) => void;
  
  // Obstacle actions
  toggleObstacleMode: () => void;
  selectObstacleSlot: (x: number, z: number) => void;
  buyObstacle: () => void;
  removeObstacle: (id: string) => void;
  
  // Game logic
  spawnEnemy: (enemy: Enemy) => void;
  removeBullet: (id: string) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => void;
  addBullet: (bullet: Bullet) => void;
  updateBullet: (id: string, x: number, y: number, z: number) => void;
  updateEnemy: (id: string, x: number, z: number, pathIndex: number) => void;
  updateTowerLastShot: (id: string, time: number) => void;
  updateTowerRotation: (id: string, currentRotation: number, targetRotation?: number) => void;
  takeDamage: (amount: number) => void;
  addCoins: (amount: number) => void;
  nextWave: () => void;
  setWaveProgress: (progress: number) => void;
  setEnemiesSpawned: (count: number) => void;
  setWaveCompletionTime: (time: number | null) => void;
  addMuzzleFlash: (flash: MuzzleFlash) => void;
  removeMuzzleFlash: (id: string) => void;
  addExplosion: (explosion: Explosion) => void;
  removeExplosion: (id: string) => void;
  addImpact: (impact: Impact) => void;
  removeImpact: (id: string) => void;
  
  // Computed properties
  canPlaceTower: boolean;
  canMergeTowers: boolean;
}

export const useTowerDefense = create<TowerDefenseState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gamePhase: "menu",
    wave: 1,
    health: 20,
    coins: 75,
    waveStartTime: 0,
    waveCompletionTime: null,
    
    towers: [],
    enemies: [],
    bullets: [],
    muzzleFlashes: [],
    explosions: [],
    impacts: [],
    obstacles: [],
    
    selectedGridCell: null,
    selectedTower: null,
    selectedTowerType: 'turret',
    selectedObstacleSlot: null,
    obstacleMode: false,
    
    enemiesInWave: 5,
    enemiesSpawned: 0,
    waveProgress: 0,
    
    // Actions
    startGame: () => {
      set({
        gamePhase: "playing",
        wave: 1,
        health: 20,
        coins: 75,
        towers: [],
        enemies: [],
        bullets: [],
        muzzleFlashes: [],
        explosions: [],
        impacts: [],
        waveStartTime: Date.now(),
        waveCompletionTime: null,
        enemiesSpawned: 0,
        waveProgress: 0,
      });
    },
    
    restartGame: () => {
      const state = get();
      state.startGame();
    },
    
    endGame: () => {
      set({ gamePhase: "gameOver" });
    },
    
    selectGridCell: (x: number, z: number) => {
      const state = get();
      const existingTower = state.towers.find(t => t.x === x && t.z === z);
      
      // Calculate canPlaceTower
      const towerExists = !!existingTower;
      const towerCost = state.selectedTowerType === 'turret' ? 15 : 25;
      const hasEnoughCoins = state.coins >= towerCost;
      const canPlace = !towerExists && hasEnoughCoins;
      
      // Calculate canMergeTowers
      let canMerge = false;
      if (existingTower && existingTower.level < 5) {
        const adjacentTowers = state.towers.filter(tower => {
          const dx = Math.abs(tower.x - x);
          const dz = Math.abs(tower.z - z);
          return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
        });
        canMerge = adjacentTowers.some(tower => tower.level === existingTower.level);
      }
      
      console.log("Grid cell selected:", { x, z, canPlace, canMerge, towerExists, hasEnoughCoins });
      
      set({
        selectedGridCell: { x, z },
        selectedTower: existingTower || null,
        canPlaceTower: canPlace,
        canMergeTowers: canMerge,
      });
    },

    selectTowerType: (type) => {
      set({ selectedTowerType: type });
    },
    
    buyTower: () => {
      const state = get();
      if (!state.selectedGridCell || !state.canPlaceTower || state.coins < 15) {
        console.log("Cannot buy tower:", { 
          hasSelectedCell: !!state.selectedGridCell, 
          canPlace: state.canPlaceTower, 
          coins: state.coins 
        });
        return;
      }
      
      console.log(`Buying tower at grid (${state.selectedGridCell.x}, ${state.selectedGridCell.z})`);
      
      const getTowerStats = (type: 'turret' | 'mortar') => {
        if (type === 'turret') {
          return { damage: 15, range: 6.0, fireRate: 500 };
        } else {
          return { damage: 55, range: 7.0, fireRate: 1400 };
        }
      };

      const stats = getTowerStats(state.selectedTowerType);
      const newTower: Tower = {
        id: Math.random().toString(36).substr(2, 9),
        x: state.selectedGridCell.x,
        z: state.selectedGridCell.z,
        level: 1,
        damage: stats.damage,
        range: stats.range,
        fireRate: stats.fireRate,
        lastShot: 0,
        type: state.selectedTowerType,
      };
      
      // Recalculate canPlaceTower after placing tower
      set({
        towers: [...state.towers, newTower],
        coins: state.coins - (state.selectedTowerType === 'turret' ? 15 : 25),
        selectedTower: newTower,
        canPlaceTower: false, // Can't place another tower on same cell
        canMergeTowers: false, // Reset merge state
      });
    },
    
    mergeTowers: (sourceTowerId?: string, targetTowerId?: string) => {
      const state = get();
      
      // If specific tower IDs are provided (drag and drop), use those
      if (sourceTowerId && targetTowerId) {
        const sourceTower = state.towers.find(t => t.id === sourceTowerId);
        const targetTower = state.towers.find(t => t.id === targetTowerId);
        
        if (!sourceTower || !targetTower || sourceTower.level !== targetTower.level || sourceTower.level >= 5 || targetTower.level >= 5 || sourceTower.type !== targetTower.type) {
          console.log("Cannot merge towers:", { sourceTower, targetTower, reason: "different types or levels" });
          return;
        }
        
        const upgradedTower: Tower = {
          ...targetTower, // Keep the target tower's position
          level: targetTower.level + 1,
          damage: Math.floor(targetTower.damage * 2.2),
          range: targetTower.range * 1.15,
          fireRate: Math.max(targetTower.fireRate * 0.85, 150),
        };
        
        console.log(`Merged towers: ${sourceTowerId} + ${targetTowerId} = Level ${upgradedTower.level}`);
        
        set({
          towers: state.towers
            .filter(t => t.id !== sourceTower.id && t.id !== targetTower.id)
            .concat(upgradedTower),
          selectedTower: upgradedTower,
        });
        return;
      }
      
      // Original adjacent merging logic for button clicks
      if (!state.canMergeTowers || !state.selectedGridCell) return;
      
      const adjacentTowers = state.towers.filter(tower => {
        const dx = Math.abs(tower.x - state.selectedGridCell!.x);
        const dz = Math.abs(tower.z - state.selectedGridCell!.z);
        return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
      });
      
      const currentTower = state.towers.find(
        t => t.x === state.selectedGridCell!.x && t.z === state.selectedGridCell!.z
      );
      
      if (!currentTower) return;
      
      const mergeableTower = adjacentTowers.find(t => 
        t.level === currentTower.level && 
        t.level < 5 && 
        t.type === currentTower.type
      );
      if (!mergeableTower) return;
      
      const upgradedTower: Tower = {
        ...currentTower,
        level: currentTower.level + 1,
        damage: Math.floor(currentTower.damage * 2.2),
        range: currentTower.range * 1.15,
        fireRate: Math.max(currentTower.fireRate * 0.85, 150),
      };
      
      set({
        towers: state.towers
          .filter(t => t.id !== currentTower.id && t.id !== mergeableTower.id)
          .concat(upgradedTower),
        selectedTower: upgradedTower,
      });
    },
    
    // Obstacle actions
    toggleObstacleMode: () => {
      set(state => ({ obstacleMode: !state.obstacleMode, selectedGridCell: null }));
    },
    
    selectObstacleSlot: (x, z) => {
      set({ selectedObstacleSlot: { x, z } });
    },
    
    buyObstacle: () => {
      const state = get();
      if (!state.selectedObstacleSlot || state.coins < 10) return;
      
      const existingObstacle = state.obstacles.find(
        o => o.x === state.selectedObstacleSlot!.x && o.z === state.selectedObstacleSlot!.z
      );
      if (existingObstacle) return;
      
      const newObstacle: Obstacle = {
        id: Math.random().toString(36).substr(2, 9),
        x: state.selectedObstacleSlot.x,
        z: state.selectedObstacleSlot.z,
        type: 'rock',
      };
      
      set(state => ({
        obstacles: [...state.obstacles, newObstacle],
        coins: state.coins - 10,
        selectedObstacleSlot: null,
      }));
    },
    
    removeObstacle: (id) => {
      set(state => ({
        obstacles: state.obstacles.filter(o => o.id !== id)
      }));
    },
    
    // Game logic actions
    spawnEnemy: (enemy) => {
      set(state => ({
        enemies: [...state.enemies, enemy]
      }));
    },
    
    removeBullet: (id) => {
      set(state => ({
        bullets: state.bullets.filter(b => b.id !== id)
      }));
    },
    
    removeEnemy: (id) => {
      set(state => ({
        enemies: state.enemies.filter(e => e.id !== id)
      }));
    },
    
    damageEnemy: (id, damage) => {
      set(state => ({
        enemies: state.enemies.map(enemy =>
          enemy.id === id
            ? { ...enemy, health: Math.max(0, enemy.health - damage) }
            : enemy
        )
      }));
    },
    
    addBullet: (bullet) => {
      set(state => ({
        bullets: [...state.bullets, bullet]
      }));
    },
    
    updateBullet: (id, x, y, z) => {
      set(state => ({
        bullets: state.bullets.map(bullet =>
          bullet.id === id ? { ...bullet, x, y, z } : bullet
        )
      }));
    },
    
    updateEnemy: (id, x, z, pathIndex) => {
      set(state => ({
        enemies: state.enemies.map(enemy =>
          enemy.id === id ? { ...enemy, x, z, pathIndex } : enemy
        )
      }));
    },
    
    updateTowerLastShot: (id, time) => {
      set(state => ({
        towers: state.towers.map(tower =>
          tower.id === id ? { ...tower, lastShot: time } : tower
        )
      }));
    },
    
    updateTowerRotation: (id, currentRotation, targetRotation) => {
      set(state => ({
        towers: state.towers.map(tower => 
          tower.id === id ? { 
            ...tower, 
            currentRotation,
            ...(targetRotation !== undefined && { targetRotation })
          } : tower
        )
      }));
    },
    
    takeDamage: (amount) => {
      set(state => {
        const newHealth = Math.max(0, state.health - amount);
        if (newHealth === 0) {
          return { health: newHealth, gamePhase: "gameOver" as GamePhase };
        }
        return { health: newHealth };
      });
    },
    
    addCoins: (amount) => {
      set(state => ({ coins: state.coins + amount }));
    },
    
    nextWave: () => {
      set(state => ({
        wave: state.wave + 1,
        enemiesInWave: Math.floor(5 + state.wave * 1.5),
        enemiesSpawned: 0,
        waveProgress: 0,
        waveStartTime: Date.now(),
        waveCompletionTime: null,
      }));
    },
    
    setWaveProgress: (progress) => {
      set({ waveProgress: progress });
    },
    
    setEnemiesSpawned: (count) => {
      set({ enemiesSpawned: count });
    },
    
    setWaveCompletionTime: (time) => {
      set({ waveCompletionTime: time });
    },
    
    addMuzzleFlash: (flash) => {
      set(state => ({
        muzzleFlashes: [...state.muzzleFlashes, flash]
      }));
    },
    
    removeMuzzleFlash: (id) => {
      set(state => ({
        muzzleFlashes: state.muzzleFlashes.filter(f => f.id !== id)
      }));
    },
    
    addExplosion: (explosion) => {
      set(state => ({
        explosions: [...state.explosions, explosion]
      }));
    },
    
    removeExplosion: (id) => {
      set(state => ({
        explosions: state.explosions.filter(e => e.id !== id)
      }));
    },
    
    addImpact: (impact) => {
      set(state => ({
        impacts: [...state.impacts, impact]
      }));
    },
    
    removeImpact: (id) => {
      set(state => ({
        impacts: state.impacts.filter(i => i.id !== id)
      }));
    },
    
    // Computed properties
    get canPlaceTower() {
      const state = get();
      if (!state.selectedGridCell) return false;
      
      // Check if cell is already occupied
      const existingTower = state.towers.find(
        t => t.x === state.selectedGridCell!.x && t.z === state.selectedGridCell!.z
      );
      if (existingTower) return false;
      
      // Check if player has enough coins for selected tower type
      const towerCost = state.selectedTowerType === 'turret' ? 15 : 25;
      return state.coins >= towerCost;
    },
    
    get canMergeTowers() {
      const state = get();
      if (!state.selectedGridCell) return false;
      
      const currentTower = state.towers.find(
        t => t.x === state.selectedGridCell!.x && t.z === state.selectedGridCell!.z
      );
      if (!currentTower || currentTower.level >= 5) return false;
      
      // Find adjacent towers that can merge
      const adjacentTowers = state.towers.filter(tower => {
        const dx = Math.abs(tower.x - state.selectedGridCell!.x);
        const dz = Math.abs(tower.z - state.selectedGridCell!.z);
        return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
      });
      
      return adjacentTowers.some(t => 
        t.level === currentTower.level && 
        t.level < 5 && 
        t.type === currentTower.type
      );
    },
  }))
);
