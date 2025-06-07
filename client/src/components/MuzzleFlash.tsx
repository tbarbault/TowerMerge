import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface MuzzleFlashProps {
  position: [number, number, number];
  rotation: number;
  onComplete: () => void;
}

export default function MuzzleFlash({ position, rotation, onComplete }: MuzzleFlashProps) {
  const meshRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const duration = 150; // milliseconds

  useFrame(() => {
    const elapsed = Date.now() - startTime.current;
    if (elapsed >= duration) {
      onComplete();
      return;
    }

    if (meshRef.current) {
      const progress = elapsed / duration;
      const scale = 1 - progress;
      const opacity = 1 - progress;
      
      meshRef.current.scale.setScalar(scale);
      
      // Update material opacity
      meshRef.current.children.forEach((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.opacity = opacity;
        }
      });
    }
  });

  return (
    <group ref={meshRef} position={position} rotation={[0, rotation, 0]}>
      {/* Main flash */}
      <mesh position={[0, 0, 0.8]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ff6600"
          emissiveIntensity={2}
          transparent
        />
      </mesh>
      
      {/* Flash cone */}
      <mesh position={[0, 0, 0.9]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.05, 0.2, 8]} />
        <meshStandardMaterial 
          color="#ffaa00"
          emissive="#ff4400"
          emissiveIntensity={1.5}
          transparent
        />
      </mesh>
    </group>
  );
}