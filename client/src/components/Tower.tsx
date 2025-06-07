import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

interface TowerProps {
  position: [number, number, number];
  level: number;
  isSelected?: boolean;
}

export default function Tower({ position, level, isSelected = false }: TowerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const woodTexture = useTexture("/textures/wood.jpg");

  // Animate selected tower
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  // Tower appearance based on level
  const getTowerConfig = (level: number) => {
    switch (level) {
      case 1:
        return { 
          height: 1, 
          color: "#8b4513", 
          segments: 8,
          barrelCount: 1 
        };
      case 2:
        return { 
          height: 1.5, 
          color: "#cd853f", 
          segments: 12,
          barrelCount: 2 
        };
      case 3:
        return { 
          height: 2, 
          color: "#daa520", 
          segments: 16,
          barrelCount: 4 
        };
      default:
        return { 
          height: 1, 
          color: "#8b4513", 
          segments: 8,
          barrelCount: 1 
        };
    }
  };

  const config = getTowerConfig(level);

  return (
    <group ref={meshRef} position={position}>
      {/* Tower base */}
      <mesh position={[0, config.height / 2, 0]}>
        <cylinderGeometry args={[0.4, 0.6, config.height, config.segments]} />
        <meshStandardMaterial 
          map={woodTexture}
          color={config.color}
        />
      </mesh>

      {/* Tower barrels */}
      {Array.from({ length: config.barrelCount }).map((_, i) => {
        const angle = (i * Math.PI * 2) / config.barrelCount;
        const radius = 0.3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh 
            key={i}
            position={[x, config.height + 0.2, z]}
            rotation={[0, angle, 0]}
          >
            <cylinderGeometry args={[0.05, 0.08, 0.4, 8]} />
            <meshStandardMaterial color="#2c2c2c" />
          </mesh>
        );
      })}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.02, 16]} />
          <meshStandardMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.5}
          />
        </mesh>
      )}

      {/* Level indicator */}
      <mesh position={[0, config.height + 0.5, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color={level === 1 ? "#ef4444" : level === 2 ? "#3b82f6" : "#8b5cf6"}
          emissive={level === 1 ? "#ef4444" : level === 2 ? "#3b82f6" : "#8b5cf6"}
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
