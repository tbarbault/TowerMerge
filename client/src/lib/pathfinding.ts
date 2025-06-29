// Center path - straight through middle from tunnel
export function getCenterPath() {
  // Add more randomness to path selection and waypoints
  const targetX = Math.random() < 0.6 ? (Math.random() * 4 - 2) : (Math.random() * 6 + 1);
  const randomOffsetX = () => (Math.random() - 0.5) * 1.5; // Random offset ±0.75
  const randomOffsetZ = () => (Math.random() - 0.5) * 0.8; // Random offset ±0.4
  
  return [
    { x: -1 + randomOffsetX() * 0.5, z: -12 },  // Start with slight randomness
    { x: -1 + randomOffsetX(), z: -9 + randomOffsetZ() },   // Combat zone with variation
    { x: -1 + randomOffsetX(), z: -6 + randomOffsetZ() },   // Approach grid with variation
    { x: -1 + randomOffsetX(), z: -3 + randomOffsetZ() },   // Enter grid back with variation
    { x: 0 + randomOffsetX(), z: 0 + randomOffsetZ() },     // Move through grid with variation
    { x: targetX * 0.2 + randomOffsetX() * 0.5, z: 2 + randomOffsetZ() },     // Early angle with variation
    { x: targetX * 0.5 + randomOffsetX() * 0.3, z: 4 + randomOffsetZ() },     // Continue angling with variation
    { x: targetX * 0.8 + randomOffsetX() * 0.2, z: 6 + randomOffsetZ() },     // Strong angle with slight variation
    { x: targetX, z: 8.5 },   // End at distributed point on red line
  ];
}

// Left path - comes from leftmost tunnel
export function getLeftPath() {
  // Force left side distribution with more variation
  const targetX = Math.random() < 0.7 ? (Math.random() * 3 - 2) : (Math.random() * 4 + 1);
  const randomOffsetX = () => (Math.random() - 0.5) * 1.2;
  const randomOffsetZ = () => (Math.random() - 0.5) * 0.6;
  
  return [
    { x: -4 + randomOffsetX() * 0.3, z: -12 },  // Start with variation
    { x: -4 + randomOffsetX(), z: -9 + randomOffsetZ() },   // Combat zone with variation
    { x: -4 + randomOffsetX(), z: -6 + randomOffsetZ() },   // Approach grid with variation
    { x: -3 + randomOffsetX(), z: -3 + randomOffsetZ() },   // Enter grid back left with variation
    { x: -2 + randomOffsetX(), z: 0 + randomOffsetZ() },    // Move toward center with variation
    { x: targetX * 0.3 + randomOffsetX() * 0.4, z: 2 + randomOffsetZ() },    // Early angle with variation
    { x: targetX * 0.6 + randomOffsetX() * 0.3, z: 4 + randomOffsetZ() },     // Continue angling with variation
    { x: targetX * 0.9 + randomOffsetX() * 0.2, z: 6 + randomOffsetZ() },     // Strong angle with variation
    { x: targetX, z: 8.5 },     // End at left-biased point on red line
  ];
}

// Right path - comes from rightmost tunnel
export function getRightPath() {
  // Force right side distribution with more variation
  const targetX = Math.random() < 0.7 ? (Math.random() * 4 + 1) : (Math.random() * 3 - 1);
  const randomOffsetX = () => (Math.random() - 0.5) * 1.2;
  const randomOffsetZ = () => (Math.random() - 0.5) * 0.6;
  
  return [
    { x: 5 + randomOffsetX() * 0.3, z: -12 },   // Start with variation
    { x: 5 + randomOffsetX(), z: -9 + randomOffsetZ() },    // Combat zone with variation
    { x: 5 + randomOffsetX(), z: -6 + randomOffsetZ() },    // Approach grid with variation
    { x: 3 + randomOffsetX(), z: -3 + randomOffsetZ() },    // Enter grid back right with variation
    { x: 2 + randomOffsetX(), z: 0 + randomOffsetZ() },     // Move toward center with variation
    { x: targetX * 0.4 + randomOffsetX() * 0.4, z: 2 + randomOffsetZ() },     // Early angle with variation
    { x: targetX * 0.7 + randomOffsetX() * 0.3, z: 4 + randomOffsetZ() },     // Continue angling with variation
    { x: targetX * 0.9 + randomOffsetX() * 0.2, z: 6 + randomOffsetZ() },     // Strong angle with variation
    { x: targetX, z: 8.5 },   // End at right-biased point on red line
  ];
}

// Zigzag path - serpentine movement from center-right tunnel
export function getZigzagPath() {
  // Force center-spread distribution with enhanced randomness
  const targetX = Math.random() < 0.4 ? (Math.random() * 3 - 2) : (Math.random() * 4 + 2);
  const randomOffsetX = () => (Math.random() - 0.5) * 1.8; // Larger variation for zigzag
  const randomOffsetZ = () => (Math.random() - 0.5) * 0.8;
  
  return [
    { x: 2 + randomOffsetX() * 0.4, z: -12 },   // Start with variation
    { x: 1 + randomOffsetX(), z: -9 + randomOffsetZ() },    // Zigzag left with heavy variation
    { x: 3 + randomOffsetX(), z: -6 + randomOffsetZ() },    // Zigzag right with heavy variation
    { x: 1 + randomOffsetX(), z: -3 + randomOffsetZ() },    // Zigzag left with heavy variation
    { x: 2 + randomOffsetX(), z: 0 + randomOffsetZ() },     // Zigzag right with heavy variation
    { x: targetX * 0.3 + randomOffsetX() * 0.5, z: 2 + randomOffsetZ() },     // Early spread with variation
    { x: targetX * 0.6 + randomOffsetX() * 0.4, z: 4 + randomOffsetZ() },     // Continue spreading with variation
    { x: targetX * 0.9 + randomOffsetX() * 0.2, z: 6 + randomOffsetZ() },     // Strong spread with variation
    { x: targetX, z: 8.5 },   // End at edge-biased point on red line
  ];
}

// Edge path - goes around the outside from leftmost tunnel
export function getEdgePath() {
  // Force extreme edge distribution with variation
  const targetX = Math.random() < 0.4 ? (Math.random() * 2 - 2.5) : (Math.random() * 2 + 4);
  const randomOffsetX = () => (Math.random() - 0.5) * 1.0;
  const randomOffsetZ = () => (Math.random() - 0.5) * 0.5;
  
  return [
    { x: -4 + randomOffsetX() * 0.3, z: -12 },  // Start with variation
    { x: -4 + randomOffsetX(), z: -9 + randomOffsetZ() },   // Combat zone with variation
    { x: -4 + randomOffsetX(), z: -6 + randomOffsetZ() },   // Main combat area with variation
    { x: -4 + randomOffsetX(), z: -3 + randomOffsetZ() },   // Move along left edge with variation
    { x: -3 + randomOffsetX(), z: 0 + randomOffsetZ() },    // Turn toward center with variation
    { x: targetX * 0.4 + randomOffsetX() * 0.4, z: 2 + randomOffsetZ() },    // Early angle with variation
    { x: targetX * 0.7 + randomOffsetX() * 0.3, z: 4 + randomOffsetZ() },     // Continue with variation
    { x: targetX * 0.95 + randomOffsetX() * 0.1, z: 6 + randomOffsetZ() },     // Strong angle with variation
    { x: targetX, z: 8.5 },   // End at extreme edge point on red line
  ];
}

// Get a random path for enemy spawning
export function getRandomPath() {
  const paths = [getCenterPath, getLeftPath, getRightPath, getZigzagPath, getEdgePath];
  const randomPath = paths[Math.floor(Math.random() * paths.length)];
  return randomPath();
}

// Main path function used by game logic
export function getPath() {
  return getCenterPath();
}
