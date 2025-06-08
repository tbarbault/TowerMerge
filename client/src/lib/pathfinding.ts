// Center path - straight through middle from tunnel
export function getCenterPath() {
  // Generate random target point along red line (x: -2 to 6, z: 8.5)
  const targetX = Math.random() * 8 - 2; // Random x between -2 and 6
  return [
    { x: -1, z: -12 },  // Start at center-left tunnel
    { x: -1, z: -9 },   // Combat zone begins
    { x: -1, z: -6 },   // Approach grid
    { x: -1, z: -3 },   // Enter grid back
    { x: 0, z: 0 },     // Move through grid
    { x: 0, z: 2 },     // Center of grid
    { x: 0, z: 4 },     // Continue toward front
    { x: targetX * 0.5, z: 6 },     // Start angling toward target
    { x: targetX, z: 8.5 },   // End at random point on red line
  ];
}

// Left path - comes from leftmost tunnel
export function getLeftPath() {
  // Generate random target point along red line
  const targetX = Math.random() * 8 - 2;
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Approach grid
    { x: -3, z: -3 },   // Enter grid back left
    { x: -2, z: 0 },    // Move toward center
    { x: -1, z: 2 },    // Through grid left side
    { x: targetX * 0.3, z: 4 },     // Start angling toward target
    { x: targetX * 0.7, z: 6 },     // Continue toward target
    { x: targetX, z: 8.5 },     // End at random point on red line
  ];
}

// Right path - comes from rightmost tunnel
export function getRightPath() {
  // Generate random target point along red line
  const targetX = Math.random() * 8 - 2;
  return [
    { x: 5, z: -12 },   // Start at rightmost tunnel
    { x: 5, z: -9 },    // Combat zone begins
    { x: 5, z: -6 },    // Approach grid
    { x: 3, z: -3 },    // Enter grid back right
    { x: 2, z: 0 },     // Move toward center
    { x: 1, z: 2 },     // Through grid right side
    { x: targetX * 0.3, z: 4 },     // Start angling toward target
    { x: targetX * 0.7, z: 6 },     // Continue toward target
    { x: targetX, z: 8.5 },   // End at random point on red line
  ];
}

// Zigzag path - serpentine movement from center-right tunnel
export function getZigzagPath() {
  // Generate random target point along red line
  const targetX = Math.random() * 8 - 2;
  return [
    { x: 2, z: -12 },   // Start at center-right tunnel
    { x: 1, z: -9 },    // Zigzag left in combat zone
    { x: 3, z: -6 },    // Zigzag right near grid
    { x: 1, z: -3 },    // Zigzag left approaching grid
    { x: 2, z: 0 },     // Zigzag right in grid
    { x: 0, z: 2 },     // Zigzag to center
    { x: targetX * 0.4, z: 4 },     // Start angling toward target
    { x: targetX * 0.8, z: 6 },     // Continue toward target
    { x: targetX, z: 8.5 },   // End at random point on red line
  ];
}

// Edge path - goes around the outside from leftmost tunnel
export function getEdgePath() {
  // Generate random target point along red line
  const targetX = Math.random() * 8 - 2;
  return [
    { x: -4, z: -12 },  // Start at leftmost tunnel
    { x: -4, z: -9 },   // Combat zone begins
    { x: -4, z: -6 },   // Main combat area
    { x: -4, z: -3 },   // Move along left edge
    { x: -3, z: 0 },    // Turn toward center
    { x: -1, z: 2 },    // Move inward
    { x: targetX * 0.5, z: 4 },     // Start angling toward target
    { x: targetX * 0.8, z: 6 },     // Continue toward target
    { x: targetX, z: 8.5 },   // End at random point on red line
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
