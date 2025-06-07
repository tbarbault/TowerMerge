import { useRef } from "react";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

export default function ObstacleZones() {
  const meshRef = useRef<THREE.Group>(null);
  const { selectedObstacleSlot, selectObstacleSlot, obstacles, obstacleMode, buyObstacle, coins } = useTowerDefense();

  // Define 5x3 rock grid behind the tower grid (matching tower grid layout)
  const obstacleSlots = [];
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 3; z++) {
      obstacleSlots.push({
        x: x * 2 - 4, // Same spacing as tower grid
        z: (z * 2 - 2) - 6 // Positioned 6 units behind tower grid
      });
    }
  }

  const handleSlotClick = (x: number, z: number) => {
    const hasObstacle = obstacles.some(o => o.x === x && o.z === z);
    
    if (!hasObstacle && coins >= 10) {
      // Directly place rock without needing rock mode
      selectObstacleSlot(x, z);
      // Auto-buy after selection
      setTimeout(() => buyObstacle(), 10);
    }
  };

  // Always show obstacle zones

  return (
    <group ref={meshRef}>
      {obstacleSlots.map((slot, index) => {
        const isSelected = selectedObstacleSlot?.x === slot.x && selectedObstacleSlot?.z === slot.z;
        const hasObstacle = obstacles.some(o => o.x === slot.x && o.z === slot.z);
        
        let slotColor = "#374151"; // Default gray
        let opacity = 0.3; // Always visible
        if (hasObstacle) {
          slotColor = "#7f1d1d"; // Dark red if occupied
          opacity = 0.8;
        } else if (isSelected) {
          slotColor = "#22c55e"; // Green if selected
          opacity = 0.6;
        }

        return (
          <mesh
            key={`obstacle-slot-${index}`}
            position={[slot.x, 0.01, slot.z]}
            userData={{ x: slot.x, z: slot.z }}
            onClick={() => handleSlotClick(slot.x, slot.z)}
          >
            <boxGeometry args={[1.6, 0.02, 1.6]} />
            <meshStandardMaterial
              color={slotColor}
              transparent
              opacity={opacity}
            />
          </mesh>
        );
      })}
      
      {/* Zone border indicators for rock placement area */}
      <group>
        {/* Horizontal line separating towers from rocks */}
        <mesh position={[0, 0.02, -2.5]}>
          <boxGeometry args={[12, 0.02, 0.1]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
        {/* Rock zone boundary */}
        <mesh position={[0, 0.02, -5.5]}>
          <boxGeometry args={[12, 0.02, 0.1]} />
          <meshStandardMaterial color="#dc2626" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}