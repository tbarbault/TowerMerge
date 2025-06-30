
export interface MapConfig {
  obstacles: Array<{ x: number; z: number; type: string }>;
  tunnelExits: Array<{ x: number; z: number }>;
  terrainType: string;
  specialFeatures: Array<{ type: string; x: number; z: number }>;
}

export function generateRandomMap(seed?: number): MapConfig {
  // Use seed for reproducible maps if desired
  const random = seed ? seedRandom(seed) : Math.random;
  
  // Generate random obstacle placement
  const obstacles = [];
  const numObstacles = 3 + Math.floor(random() * 4); // 3-6 obstacles
  
  for (let i = 0; i < numObstacles; i++) {
    const x = -4 + random() * 8; // Grid range
    const z = -2 + random() * 6; // Avoid spawn/end zones
    obstacles.push({ x, z, type: 'rock' });
  }
  
  // Randomize tunnel positions
  const tunnelConfigs = [
    [{ x: -4, z: -12 }, { x: -1, z: -12 }, { x: 2, z: -12 }], // Standard
    [{ x: -5, z: -12 }, { x: 0, z: -12 }, { x: 3, z: -12 }], // Spread out
    [{ x: -3, z: -12 }, { x: -1, z: -12 }, { x: 1, z: -12 }], // Clustered
  ];
  
  const tunnelExits = tunnelConfigs[Math.floor(random() * tunnelConfigs.length)];
  
  // Random terrain themes
  const terrainTypes = ['grass', 'desert', 'volcanic', 'arctic'];
  const terrainType = terrainTypes[Math.floor(random() * terrainTypes.length)];
  
  // Special features
  const specialFeatures = [];
  if (random() > 0.7) {
    specialFeatures.push({
      type: 'chokepoint',
      x: -1 + random() * 2,
      z: 2 + random() * 2
    });
  }
  
  return {
    obstacles,
    tunnelExits,
    terrainType,
    specialFeatures
  };
}

function seedRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return () => {
    x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}
