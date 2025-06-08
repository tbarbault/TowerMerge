import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

export default function Grid() {
  const meshRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();
  const { selectedGridCell, selectGridCell, towers, selectedTower } = useTowerDefense();

  // Handle grid cell selection - simplified version without hover effects
  const handlePointerEvents = () => {
    // Grid selection is now handled purely through onClick events
  };

  const handleClick = (event: any) => {
    event.stopPropagation();
    const userData = event.object.userData;
    if (userData.x !== undefined && userData.z !== undefined) {
      console.log(`Grid cell clicked: (${userData.x}, ${userData.z})`);
      selectGridCell(userData.x, userData.z);
    }
  };

  // Helper function to check if a tower can merge with selected tower
  const canMergeWithSelected = (x: number, z: number) => {
    if (!selectedTower || !selectedGridCell) return false;
    
    // Only show merge highlighting when a tower is actually selected
    if (selectedGridCell.x !== selectedTower.x || selectedGridCell.z !== selectedTower.z) return false;
    
    const towerAtPosition = towers.find(t => t.x === x && t.z === z);
    if (!towerAtPosition) return false;
    
    // Don't highlight the selected tower itself
    if (towerAtPosition.id === selectedTower.id) return false;
    
    // Check if adjacent to selected tower
    const dx = Math.abs(towerAtPosition.x - selectedTower.x);
    const dz = Math.abs(towerAtPosition.z - selectedTower.z);
    const isAdjacent = (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
    
    // Check if same level, same type, and level < 3
    const canMerge = isAdjacent && 
                     towerAtPosition.level === selectedTower.level && 
                     towerAtPosition.type === selectedTower.type && 
                     towerAtPosition.level < 3;
    
    return canMerge;
  };

  // Generate grid cells (5x3)
  const gridCells = [];
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 3; z++) {
      const isSelected = selectedGridCell?.x === x && selectedGridCell?.z === z;
      const canMerge = canMergeWithSelected(x, z);
      
      let cellColor = "#374151"; // Default gray
      if (isSelected) {
        cellColor = "#4ade80"; // Green for selected
      } else if (canMerge) {
        cellColor = "#fbbf24"; // Yellow for mergeable
      }
      
      gridCells.push(
        <mesh
          key={`${x}-${z}`}
          position={[x * 2 - 4, 0.01, z * 2 - 5]}
          userData={{ x, z }}
          onClick={handleClick}
        >
          <boxGeometry args={[1.8, 0.02, 1.8]} />
          <meshStandardMaterial
            color={cellColor}
            transparent
            opacity={isSelected || canMerge ? 0.8 : 0.3}
          />
        </mesh>
      );
    }
  }

  return (
    <group ref={meshRef}>
      {gridCells}
      
      {/* Grid border lines */}
      <group>
        {/* Vertical border lines */}
        {[-5, -3, -1, 1, 3, 5].map((x, i) => (
          <mesh key={`v-${i}`} position={[x, 0.01, -3]}>
            <boxGeometry args={[0.02, 0.02, 6]} />
            <meshStandardMaterial color="#6b7280" transparent opacity={0.5} />
          </mesh>
        ))}
        
        {/* Horizontal border lines */}
        {[-6, -4, -2, 0].map((z, i) => (
          <mesh key={`h-${i}`} position={[0, 0.01, z]}>
            <boxGeometry args={[10, 0.02, 0.02]} />
            <meshStandardMaterial color="#6b7280" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
