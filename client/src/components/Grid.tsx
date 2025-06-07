import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

export default function Grid() {
  const meshRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();
  const { selectedGridCell, selectGridCell } = useTowerDefense();

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

  // Generate grid cells (5x3)
  const gridCells = [];
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 3; z++) {
      const isSelected = selectedGridCell?.x === x && selectedGridCell?.z === z;
      gridCells.push(
        <mesh
          key={`${x}-${z}`}
          position={[x * 2 - 4, 0.01, z * 2 - 2]}
          userData={{ x, z }}
          onClick={handleClick}
        >
          <boxGeometry args={[1.8, 0.02, 1.8]} />
          <meshStandardMaterial
            color={isSelected ? "#4ade80" : "#374151"}
            transparent
            opacity={isSelected ? 0.8 : 0.3}
            wireframe={!isSelected}
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
          <mesh key={`v-${i}`} position={[x, 0.01, 0]}>
            <boxGeometry args={[0.02, 0.02, 6]} />
            <meshStandardMaterial color="#6b7280" transparent opacity={0.5} />
          </mesh>
        ))}
        
        {/* Horizontal border lines */}
        {[-3, -1, 1, 3].map((z, i) => (
          <mesh key={`h-${i}`} position={[0, 0.01, z]}>
            <boxGeometry args={[10, 0.02, 0.02]} />
            <meshStandardMaterial color="#6b7280" transparent opacity={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
