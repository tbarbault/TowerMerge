// Simple predefined path for enemies to follow
// Path goes from front (positive Z) toward the back (negative Z)
export function getPath() {
  return [
    { x: 0, z: 8 },     // Start position (in front of player)
    { x: 0, z: 6 },     // Move toward grid
    { x: 0, z: 4 },     // Enter grid front
    { x: 0, z: 2 },     // Move through grid
    { x: 0, z: 0 },     // Center of grid
    { x: 0, z: -2 },    // Continue toward back
    { x: 0, z: -4 },    // Exit grid back
    { x: 0, z: -6 },    // End position (behind player - life lost)
  ];
}

// Alternative path with some turns for more complex routing
export function getAlternatePath() {
  return [
    { x: -6, z: -2 },   // Start bottom
    { x: -4, z: -2 },   // Enter grid bottom
    { x: -2, z: -2 },   // Move right
    { x: -2, z: 0 },    // Turn up to center
    { x: 0, z: 0 },     // Center
    { x: 2, z: 0 },     // Continue right
    { x: 2, z: 2 },     // Turn up to top
    { x: 4, z: 2 },     // Move right top
    { x: 6, z: 2 },     // End position top
  ];
}

// Get a random path variation
export function getRandomPath() {
  const paths = [getPath(), getAlternatePath()];
  return paths[Math.floor(Math.random() * paths.length)];
}
