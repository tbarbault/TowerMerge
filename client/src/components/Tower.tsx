import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

interface TowerProps {
  position: [number, number, number];
  level: number;
  isSelected?: boolean;
  towerId: string;
}

export default function Tower({ position, level, isSelected = false, towerId }: TowerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);
  const woodTexture = useTexture("/textures/wood.jpg");
  const { enemies } = useTowerDefense();
  const [targetRotation, setTargetRotation] = useState(0);

  // Find target enemy and calculate rotation
  useEffect(() => {
    const tower = { x: position[0], z: position[2], range: 2.5 + level * 0.5 };
    
    const enemiesInRange = enemies.filter((enemy) => {
      const dx = enemy.x - tower.x;
      const dz = enemy.z - tower.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance <= tower.range;
    });

    if (enemiesInRange.length > 0) {
      // Target the enemy furthest along the path
      const target = enemiesInRange.reduce((closest, enemy) => 
        enemy.pathIndex > closest.pathIndex ? enemy : closest
      );
      
      // Calculate angle to target
      const dx = target.x - tower.x;
      const dz = target.z - tower.z;
      const angle = Math.atan2(dx, dz);
      setTargetRotation(angle);
    }
  }, [enemies, position, level]);

  // Animate turret rotation and selection
  useFrame((state, delta) => {
    if (turretRef.current) {
      // Smooth rotation towards target
      const currentRotation = turretRef.current.rotation.y;
      const rotationDiff = targetRotation - currentRotation;
      const normalizedDiff = Math.atan2(Math.sin(rotationDiff), Math.cos(rotationDiff));
      turretRef.current.rotation.y += normalizedDiff * delta * 3; // Rotation speed
    }

    if (meshRef.current && isSelected) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  // Tower appearance based on level
  const getTowerConfig = (level: number) => {
    switch (level) {
      case 1:
        return { 
          height: 0.8, 
          baseColor: "#4a5568", 
          turretColor: "#2d3748",
          segments: 12,
          barrelLength: 0.6,
          barrelRadius: 0.04 
        };
      case 2:
        return { 
          height: 1.0, 
          baseColor: "#2d3748", 
          turretColor: "#1a202c",
          segments: 16,
          barrelLength: 0.8,
          barrelRadius: 0.05 
        };
      case 3:
        return { 
          height: 1.2, 
          baseColor: "#1a202c", 
          turretColor: "#000000",
          segments: 20,
          barrelLength: 1.0,
          barrelRadius: 0.06 
        };
      default:
        return { 
          height: 0.8, 
          baseColor: "#4a5568", 
          turretColor: "#2d3748",
          segments: 12,
          barrelLength: 0.6,
          barrelRadius: 0.04 
        };
    }
  };

  const config = getTowerConfig(level);

  return (
    <group ref={meshRef} position={position}>
      {/* Tower base platform */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 8]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#8b4513"
        />
      </mesh>

      {/* Main tower base */}
      <mesh position={[0, config.height / 2 + 0.2, 0]}>
        <cylinderGeometry args={[0.35, 0.45, config.height, config.segments]} />
        <meshStandardMaterial 
          color={config.baseColor}
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>

      {/* Rotating turret */}
      <group ref={turretRef} position={[0, config.height + 0.2, 0]}>
        {/* Turret body */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.6]} />
          <meshStandardMaterial 
            color={config.turretColor}
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>

        {/* Main barrel */}
        <mesh position={[0, 0.15, config.barrelLength / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[config.barrelRadius, config.barrelRadius + 0.01, config.barrelLength, 12]} />
          <meshStandardMaterial 
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Barrel tip */}
        <mesh position={[0, 0.15, config.barrelLength + 0.3]}>
          <sphereGeometry args={[config.barrelRadius + 0.01, 8, 8]} />
          <meshStandardMaterial 
            color="#0a0a0a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Additional barrels for higher levels */}
        {level >= 2 && (
          <>
            <mesh position={[-0.15, 0.1, config.barrelLength / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[config.barrelRadius * 0.8, config.barrelRadius * 0.8, config.barrelLength * 0.8, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0.15, 0.1, config.barrelLength / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[config.barrelRadius * 0.8, config.barrelRadius * 0.8, config.barrelLength * 0.8, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
            </mesh>
          </>
        )}

        {/* Missile pods for level 3 */}
        {level === 3 && (
          <>
            <mesh position={[-0.25, 0.25, 0.1]}>
              <boxGeometry args={[0.1, 0.1, 0.4]} />
              <meshStandardMaterial color="#8b0000" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0.25, 0.25, 0.1]}>
              <boxGeometry args={[0.1, 0.1, 0.4]} />
              <meshStandardMaterial color="#8b0000" metalness={0.4} roughness={0.6} />
            </mesh>
          </>
        )}
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.04, 16]} />
          <meshStandardMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.6}
            emissive="#22c55e"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* Level indicator */}
      <mesh position={[0, config.height + 0.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={level === 1 ? "#ef4444" : level === 2 ? "#3b82f6" : "#fbbf24"}
          emissive={level === 1 ? "#ef4444" : level === 2 ? "#3b82f6" : "#fbbf24"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Range indicator (when selected) */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.5 + level * 0.5 - 0.1, 2.5 + level * 0.5 + 0.1, 32]} />
          <meshStandardMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}
