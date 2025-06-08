// Center path - straight through middle from tunnel
export function getCenterPath() {
  // Force distribution across red line - bias toward left side for center path
  const targetX = Math.random() < 0.7 ? (Math.random() * 3 - 2) : (Math.random() * 5 + 1); // Bias left or spread right
  return [
    { x: -1, z: -12 },  // Start at center-left tunnel
    { x: -1, z: -9 },   // Combat zone begins
    { x: -1, z: -6 },   // Approach grid
    { x: -1, z: -3 },   // Enter grid back
    { x: 0, z: 0 },     // Move through grid
    { x: targetX * 0.2, z: 2 },     // Early angle toward target
    { x: targetX * 0.5, z: 4 },     // Continue angling
    { x: targetX * 0.8, z: 6 },     // Strong angle toward target
    { x: targetX, z: 8.5 },   // End at distributed point on red line
  ];
}

// Left path - comes from leftmost tunnel
export function getLeftPath() {
  // Force left side distribution - heavily bias toward left side of red line
  const targetX = Math.random() < 0.8 ? (Math.random() * 2.5 - 2) : (Math.random() * 3 + 2);
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Approach grid
    { x: -3, z: -3 },   // Enter grid back left
    { x: -2, z: 0 },    // Move toward center
    { x: targetX * 0.3, z: 2 },    // Early angle toward target
    { x: targetX * 0.6, z: 4 },     // Continue angling toward target
    { x: targetX * 0.9, z: 6 },     // Strong angle toward target
    { x: targetX, z: 8.5 },     // End at left-biased point on red line
  ];
}

// Right path - comes from rightmost tunnel
export function getRightPath() {
  // Force right side distribution - heavily bias toward right side of red line
  const targetX = Math.random() < 0.8 ? (Math.random() * 4 + 2) : (Math.random() * 2 - 1);
  return [
    { x: 5, z: -12 },   // Start at rightmost tunnel
    { x: 5, z: -9 },    // Combat zone begins
    { x: 5, z: -6 },    // Approach grid
    { x: 3, z: -3 },    // Enter grid back right
    { x: 2, z: 0 },     // Move toward center
    { x: targetX * 0.4, z: 2 },     // Early angle toward target
    { x: targetX * 0.7, z: 4 },     // Continue angling toward target
    { x: targetX * 0.9, z: 6 },     // Strong angle toward target
    { x: targetX, z: 8.5 },   // End at right-biased point on red line
  ];
}

// Zigzag path - serpentine movement from center-right tunnel
export function getZigzagPath() {
  // Force center-spread distribution - avoid center clustering
  const targetX = Math.random() < 0.5 ? (Math.random() * 2 - 2) : (Math.random() * 3 + 3);
  return [
    { x: 2, z: -12 },   // Start at center-right tunnel
    { x: 1, z: -9 },    // Zigzag left in combat zone
    { x: 3, z: -6 },    // Zigzag right near grid
    { x: 1, z: -3 },    // Zigzag left approaching grid
    { x: 2, z: 0 },     // Zigzag right in grid
    { x: targetX * 0.3, z: 2 },     // Early spread toward target
    { x: targetX * 0.6, z: 4 },     // Continue spreading toward target
    { x: targetX * 0.9, z: 6 },     // Strong spread toward target
    { x: targetX, z: 8.5 },   // End at edge-biased point on red line
  ];
}

// Edge path - goes around the outside from leftmost tunnel
export function getEdgePath() {
  // Force extreme edge distribution - far left or far right only
  const targetX = Math.random() < 0.5 ? (Math.random() * 1.5 - 2) : (Math.random() * 1.5 + 4.5);
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Main combat area
    { x: -4, z: -3 },   // Move along left edge
    { x: -3, z: 0 },    // Turn toward center
    { x: targetX * 0.4, z: 2 },    // Early angle toward extreme target
    { x: targetX * 0.7, z: 4 },     // Continue toward extreme target
    { x: targetX * 0.95, z: 6 },     // Strong angle toward extreme target
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
