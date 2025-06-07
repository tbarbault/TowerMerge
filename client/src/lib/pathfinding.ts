// Simple predefined path for enemies to follow
// Path goes from left side of the grid to the right side
export function getPath() {
  return [
    { x: -6, z: 0 },    // Start position (off-grid left)
    { x: -4, z: 0 },    // Enter grid
    { x: -2, z: 0 },    // Move right
    { x: 0, z: 0 },     // Center
    { x: 2, z: 0 },     // Continue right
    { x: 4, z: 0 },     // Almost at end
    { x: 6, z: 0 },     // End position (off-grid right)
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
