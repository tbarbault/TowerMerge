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
  targetId: string;
  damage: number;
  speed: number;
  color: string;
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

export interface GridCell {
  x: number;
  z: number;
}

interface TowerDefenseState {
  // Game state
  gamePhase: GamePhase;
  wave: number;
  health: number;
  coins: number;
  waveStartTime: number;
  
  // Game objects
  towers: Tower[];
  enemies: Enemy[];
  bullets: Bullet[];
  muzzleFlashes: MuzzleFlash[];
  
  // UI state
  selectedGridCell: GridCell | null;
  selectedTower: Tower | null;
  selectedTowerType: 'turret' | 'mortar';
  
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
  
  // Game logic
  spawnEnemy: (enemy: Enemy) => void;
  removeBullet: (id: string) => void;
  removeEnemy: (id: string) => void;
  damageEnemy: (id: string, damage: number) => void;
  addBullet: (bullet: Bullet) => void;
  updateBullet: (id: string, x: number, y: number, z: number) => void;
  updateEnemy: (id: string, x: number, z: number, pathIndex: number) => void;
  updateTowerLastShot: (id: string, time: number) => void;
  takeDamage: (amount: number) => void;
  addCoins: (amount: number) => void;
  nextWave: () => void;
  setWaveProgress: (progress: number) => void;
  setEnemiesSpawned: (count: number) => void;
  addMuzzleFlash: (flash: MuzzleFlash) => void;
  removeMuzzleFlash: (id: string) => void;
  
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
    coins: 50,
    waveStartTime: 0,
    
    towers: [],
    enemies: [],
    bullets: [],
    muzzleFlashes: [],
    
    selectedGridCell: null,
    selectedTower: null,
    selectedTowerType: 'turret',
    
    enemiesInWave: 5,
    enemiesSpawned: 0,
    waveProgress: 0,
    
    // Actions
    startGame: () => {
      set({
        gamePhase: "playing",
        wave: 1,
        health: 20,
        coins: 50,
        towers: [],
        enemies: [],
        bullets: [],
        muzzleFlashes: [],
        waveStartTime: Date.now(),
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
      const hasEnoughCoins = state.coins >= 10;
      const canPlace = !towerExists && hasEnoughCoins;
      
      // Calculate canMergeTowers
      let canMerge = false;
      if (existingTower && existingTower.level < 3) {
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
      if (!state.selectedGridCell || !state.canPlaceTower || state.coins < 10) {
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
          return { damage: 10, range: 2.5, fireRate: 1000 };
        } else {
          return { damage: 25, range: 3.5, fireRate: 2000 };
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
        coins: state.coins - 10,
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
        
        if (!sourceTower || !targetTower || sourceTower.level !== targetTower.level || sourceTower.level >= 3 || sourceTower.type !== targetTower.type) {
          console.log("Cannot merge towers:", { sourceTower, targetTower, reason: "different types or levels" });
          return;
        }
        
        const upgradedTower: Tower = {
          ...targetTower, // Keep the target tower's position
          level: targetTower.level + 1,
          damage: targetTower.damage * 2,
          range: targetTower.range * 1.2,
          fireRate: Math.max(targetTower.fireRate * 0.8, 200),
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
      
      const mergeableTower = adjacentTowers.find(t => t.level === currentTower.level);
      if (!mergeableTower) return;
      
      const upgradedTower: Tower = {
        ...currentTower,
        level: currentTower.level + 1,
        damage: currentTower.damage * 2,
        range: currentTower.range * 1.2,
        fireRate: Math.max(currentTower.fireRate * 0.8, 200),
      };
      
      set({
        towers: state.towers
          .filter(t => t.id !== currentTower.id && t.id !== mergeableTower.id)
          .concat(upgradedTower),
        selectedTower: upgradedTower,
      });
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
      }));
    },
    
    setWaveProgress: (progress) => {
      set({ waveProgress: progress });
    },
    
    setEnemiesSpawned: (count) => {
      set({ enemiesSpawned: count });
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
    
    // Computed properties
    canPlaceTower: false,
    canMergeTowers: false,
  }))
);
