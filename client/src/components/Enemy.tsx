import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface EnemyProps {
  position: [number, number, number];
  health: number;
  maxHealth: number;
  type: string;
}

export default function Enemy({ position, health, maxHealth, type }: EnemyProps) {
  const meshRef = useRef<THREE.Group>(null);

  // Animate enemy
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
  });

  // Enemy appearance based on type
  const getEnemyConfig = (type: string) => {
    switch (type) {
      case "basic":
        return { 
          color: "#ef4444", 
          size: 0.3,
          segments: 8 
        };
      case "fast":
        return { 
          color: "#22c55e", 
          size: 0.25,
          segments: 6 
        };
      case "heavy":
        return { 
          color: "#3b82f6", 
          size: 0.4,
          segments: 10 
        };
      case "armored":
        return { 
          color: "#8b5cf6", 
          size: 0.45,
          segments: 12 
        };
      case "elite":
        return { 
          color: "#f59e0b", 
          size: 0.5,
          segments: 14 
        };
      case "boss":
        return { 
          color: "#dc2626", 
          size: 0.6,
          segments: 16 
        };
      case "megaboss":
        return { 
          color: "#7c3aed", 
          size: 0.8,
          segments: 20 
        };
      default:
        return { 
          color: "#ef4444", 
          size: 0.3,
          segments: 8 
        };
    }
  };

  const config = getEnemyConfig(type);
  const healthPercentage = health / maxHealth;

  return (
    <group ref={meshRef} position={position}>
      {/* Enemy body */}
      <mesh>
        <sphereGeometry args={[config.size, config.segments, config.segments]} />
        <meshStandardMaterial 
          color={config.color}
          emissive={config.color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Health bar background */}
      <mesh position={[0, config.size + 0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.08]} />
        <meshStandardMaterial color="#4b5563" transparent opacity={0.8} />
      </mesh>

      {/* Health bar fill */}
      <mesh 
        position={[-0.3 + (0.6 * healthPercentage) / 2, config.size + 0.31, 0]} 
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[healthPercentage, 1, 1]}
      >
        <planeGeometry args={[0.6, 0.06]} />
        <meshStandardMaterial 
          color={healthPercentage > 0.6 ? "#22c55e" : healthPercentage > 0.3 ? "#eab308" : "#ef4444"}
          transparent 
          opacity={0.9}
        />
      </mesh>

      {/* Enemy eyes */}
      <mesh position={[-0.1, 0.05, config.size - 0.05]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.1, 0.05, config.size - 0.05]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Enemy pupils */}
      <mesh position={[-0.1, 0.05, config.size - 0.02]}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.1, 0.05, config.size - 0.02]}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
}
