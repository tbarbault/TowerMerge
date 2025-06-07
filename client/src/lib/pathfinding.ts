// Center path - straight through middle
export function getCenterPath() {
  return [
    { x: 0, z: -8 },    // Start position (behind player)
    { x: 0, z: -6 },    // Move toward grid
    { x: 0, z: -4 },    // Enter grid back
    { x: 0, z: -2 },    // Move through grid
    { x: 0, z: 0 },     // Center of grid
    { x: 0, z: 2 },     // Continue toward front
    { x: 0, z: 4 },     // Exit grid front
    { x: 0, z: 6 },     // End position (in front of player - life lost)
  ];
}

// Left path - comes from left side
export function getLeftPath() {
  return [
    { x: -3, z: -8 },   // Start left back
    { x: -3, z: -6 },   // Move toward grid
    { x: -3, z: -4 },   // Enter grid back left
    { x: -2, z: -2 },   // Move toward center
    { x: -1, z: 0 },    // Through grid left side
    { x: 0, z: 2 },     // Converge to center front
    { x: 0, z: 4 },     // Exit grid front
    { x: 0, z: 6 },     // End position
  ];
}

// Right path - comes from right side
export function getRightPath() {
  return [
    { x: 3, z: -8 },    // Start right back
    { x: 3, z: -6 },    // Move toward grid
    { x: 3, z: -4 },    // Enter grid back right
    { x: 2, z: -2 },    // Move toward center
    { x: 1, z: 0 },     // Through grid right side
    { x: 0, z: 2 },     // Converge to center front
    { x: 0, z: 4 },     // Exit grid front
    { x: 0, z: 6 },     // End position
  ];
}

// Zigzag path - serpentine movement
export function getZigzagPath() {
  return [
    { x: -2, z: -8 },   // Start left back
    { x: -2, z: -5 },   // Move forward
    { x: 1, z: -3 },    // Zigzag right
    { x: -1, z: -1 },   // Zigzag left
    { x: 2, z: 1 },     // Zigzag right
    { x: 0, z: 3 },     // Move to center front
    { x: 0, z: 6 },     // End position
  ];
}

// Edge path - goes around the outside
export function getEdgePath() {
  return [
    { x: -4, z: -8 },   // Start far left back
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
