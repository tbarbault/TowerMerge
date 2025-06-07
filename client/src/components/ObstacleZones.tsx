import { useRef } from "react";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

export default function ObstacleZones() {
  const meshRef = useRef<THREE.Group>(null);
  const { selectedObstacleSlot, selectObstacleSlot, obstacles, obstacleMode } = useTowerDefense();

  // Define predefined obstacle slots behind the grid (z = -4 to -6)
  const obstacleSlots = [
    { x: -4, z: -4 }, { x: -2, z: -4 }, { x: 0, z: -4 }, { x: 2, z: -4 }, { x: 4, z: -4 },
    { x: -3, z: -5 }, { x: -1, z: -5 }, { x: 1, z: -5 }, { x: 3, z: -5 },
    { x: -2, z: -6 }, { x: 0, z: -6 }, { x: 2, z: -6 },
  ];

  const handleSlotClick = (x: number, z: number) => {
    selectObstacleSlot(x, z);
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
      
      {/* Zone border indicators */}
      <group>
        {/* Horizontal lines marking obstacle zone */}
        <mesh position={[0, 0.02, -3.5]}>
          <boxGeometry args={[12, 0.02, 0.1]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.02, -6.5]}>
          <boxGeometry args={[8, 0.02, 0.1]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  );
}