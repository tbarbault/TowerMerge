import { useRef } from "react";
import * as THREE from "three";

interface ObstacleProps {
  position: [number, number, number];
  type: 'rock' | 'tree' | 'barrier';
  onRemove: () => void;
}

export default function Obstacle({ position, type, onRemove }: ObstacleProps) {
  const meshRef = useRef<THREE.Group>(null);

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (event.shiftKey) {
      onRemove();
    }
  };

  const getObstacleConfig = (type: 'rock' | 'tree' | 'barrier') => {
    switch (type) {
      case 'rock':
        return {
          color: "#6b7280",
          emissive: "#374151",
          geometry: "sphere",
          scale: [0.6, 0.4, 0.6] as [number, number, number],
        };
      case 'tree':
        return {
          color: "#059669",
          emissive: "#047857",
          geometry: "cylinder",
          scale: [0.3, 0.8, 0.3] as [number, number, number],
        };
      case 'barrier':
        return {
          color: "#92400e",
          emissive: "#78350f",
          geometry: "box",
          scale: [0.8, 0.6, 0.2] as [number, number, number],
        };
    }
  };

  const config = getObstacleConfig(type);

  return (
    <group ref={meshRef} position={position} onClick={handleClick}>
      <mesh position={[0, config.scale[1] / 2, 0]} scale={config.scale}>
        {config.geometry === "sphere" && <sphereGeometry args={[1, 8, 8]} />}
        {config.geometry === "cylinder" && <cylinderGeometry args={[1, 1, 1, 8]} />}
        {config.geometry === "box" && <boxGeometry args={[1, 1, 1]} />}
        <meshStandardMaterial 
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.1}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Hover indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 16]} />
        <meshStandardMaterial 
          color="#ef4444" 
          transparent 
          opacity={0.3}
          visible={false}
        />
      </mesh>
    </group>
  );
}