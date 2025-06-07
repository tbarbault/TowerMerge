import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

export default function Grid() {
  const meshRef = useRef<THREE.Group>(null);
  const { camera, raycaster, pointer } = useThree();
  const { selectedGridCell, selectGridCell } = useTowerDefense();

  // Handle grid cell selection
  useFrame(() => {
    if (meshRef.current) {
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(meshRef.current.children);
      
      if (intersects.length > 0) {
        const intersect = intersects[0];
        const userData = intersect.object.userData;
        if (userData.x !== undefined && userData.z !== undefined) {
          // Visual feedback for hover
          const material = intersect.object.material as THREE.MeshStandardMaterial;
          material.opacity = selectedGridCell?.x === userData.x && selectedGridCell?.z === userData.z ? 0.8 : 0.6;
        }
      }
    }
  });

  const handleClick = (event: any) => {
    event.stopPropagation();
    const userData = event.object.userData;
    if (userData.x !== undefined && userData.z !== undefined) {
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
      
      {/* Grid lines for visual clarity */}
      <lineSegments position={[0, 0.02, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={24}
            array={new Float32Array([
              // Vertical lines
              -5, 0, -3, -5, 0, 3,
              -3, 0, -3, -3, 0, 3,
              -1, 0, -3, -1, 0, 3,
              1, 0, -3, 1, 0, 3,
              3, 0, -3, 3, 0, 3,
              5, 0, -3, 5, 0, 3,
              // Horizontal lines
              -5, 0, -3, 5, 0, -3,
              -5, 0, -1, 5, 0, -1,
              -5, 0, 1, 5, 0, 1,
              -5, 0, 3, 5, 0, 3,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#6b7280" opacity={0.5} transparent />
      </lineSegments>
    </group>
  );
}
