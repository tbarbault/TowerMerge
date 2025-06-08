// Center path - straight through middle from tunnel
export function getCenterPath() {
  return [
    { x: -1, z: -12 },  // Start at center-left tunnel
    { x: -1, z: -9 },   // Combat zone begins
    { x: -1, z: -6 },   // Main combat area
    { x: -1, z: -4 },   // Enter grid back
    { x: -1, z: -2 },   // Move through grid
    { x: 0, z: 0 },     // Center of grid
    { x: 0, z: 2 },     // Continue toward front
    { x: 0, z: 4 },     // Exit grid front
    { x: 0, z: 6 },     // End position (in front of player - life lost)
  ];
}

// Left path - comes from leftmost tunnel
export function getLeftPath() {
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Main combat area
    { x: -3, z: -4 },   // Enter grid back left
    { x: -2, z: -2 },   // Move toward center
    { x: -1, z: 0 },    // Through grid left side
    { x: 0, z: 2 },     // Converge to center front
    { x: 0, z: 4 },     // Exit grid front
    { x: 0, z: 6 },     // End position
  ];
}

// Right path - comes from rightmost tunnel
export function getRightPath() {
  return [
    { x: 5, z: -12 },   // Start at rightmost tunnel
    { x: 5, z: -9 },    // Combat zone begins
    { x: 5, z: -6 },    // Main combat area
    { x: 3, z: -4 },    // Enter grid back right
    { x: 2, z: -2 },    // Move toward center
    { x: 1, z: 0 },     // Through grid right side
    { x: 0, z: 2 },     // Converge to center front
    { x: 0, z: 4 },     // Exit grid front
    { x: 0, z: 6 },     // End position
  ];
}

// Zigzag path - serpentine movement from center-right tunnel
export function getZigzagPath() {
  return [
    { x: 2, z: -12 },   // Start at center-right tunnel
    { x: 1, z: -9 },    // Zigzag left in combat zone
    { x: 3, z: -6 },    // Zigzag right in combat zone
    { x: 1, z: -3 },    // Zigzag left near grid
    { x: 2, z: -1 },    // Zigzag right
    { x: 0, z: 1 },     // Zigzag to center
    { x: 1, z: 3 },     // Move toward front
    { x: 0, z: 6 },     // End position
  ];
}

// Edge path - goes around the outside from leftmost tunnel
export function getEdgePath() {
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Main combat area
    { x: -4, z: -2 },   // Move along left edge
    { x: -3, z: 0 },    // Turn toward center
    { x: -1, z: 1 },    // Move inward
    { x: 1, z: 2 },     // Cross center
    { x: 0, z: 4 },     // Exit front
    { x: 0, z: 6 },     // End position
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
