// Center path - straight through middle from tunnel
export function getCenterPath() {
  return [
    { x: -1, z: -12 },  // Start at center-left tunnel
    { x: -1, z: -9 },   // Combat zone begins
    { x: -1, z: -6 },   // Approach grid
    { x: -1, z: -3 },   // Enter grid back
    { x: 0, z: 0 },     // Move through grid
    { x: 0, z: 2 },     // Center of grid
    { x: 0, z: 4 },     // Continue toward front
    { x: 0, z: 6 },     // Exit grid front
    { x: 0, z: 8.5 },   // End position (just before red line - life lost at z > 8)
  ];
}

// Left path - comes from leftmost tunnel
export function getLeftPath() {
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Approach grid
    { x: -3, z: -3 },   // Enter grid back left
    { x: -2, z: 0 },    // Move toward center
    { x: -1, z: 2 },    // Through grid left side
    { x: 0, z: 4 },     // Continue through grid
    { x: 0, z: 6 },     // Converge to center front
    { x: 0, z: 9 },     // End position
  ];
}

// Right path - comes from rightmost tunnel
export function getRightPath() {
  return [
    { x: 5, z: -12 },   // Start at rightmost tunnel
    { x: 5, z: -9 },    // Combat zone begins
    { x: 5, z: -6 },    // Approach grid
    { x: 3, z: -3 },    // Enter grid back right
    { x: 2, z: 0 },     // Move toward center
    { x: 1, z: 2 },     // Through grid right side
    { x: 0, z: 4 },     // Continue through grid
    { x: 0, z: 6 },     // Converge to center front
    { x: 0, z: 8.5 },   // End position (just before red line)
  ];
}

// Zigzag path - serpentine movement from center-right tunnel
export function getZigzagPath() {
  return [
    { x: 2, z: -12 },   // Start at center-right tunnel
    { x: 1, z: -9 },    // Zigzag left in combat zone
    { x: 3, z: -6 },    // Zigzag right near grid
    { x: 1, z: -3 },    // Zigzag left approaching grid
    { x: 2, z: 0 },     // Zigzag right in grid
    { x: 0, z: 2 },     // Zigzag to center
    { x: 1, z: 4 },     // Move toward front
    { x: 0, z: 6 },     // Exit grid
    { x: 0, z: 8.5 },   // End position (just before red line)
  ];
}

// Edge path - goes around the outside from leftmost tunnel
export function getEdgePath() {
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Main combat area
    { x: -4, z: -3 },   // Move along left edge
    { x: -3, z: 0 },    // Turn toward center
    { x: -1, z: 2 },    // Move inward
    { x: 1, z: 4 },     // Cross center
    { x: 0, z: 6 },     // Exit grid
    { x: 0, z: 8.5 },   // End position (just before red line)
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
