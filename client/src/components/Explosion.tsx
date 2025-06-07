import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ExplosionProps {
  position: [number, number, number];
  radius: number;
  onComplete: () => void;
  color?: string;
}

export default function Explosion({ position, radius, onComplete, color = "#ff4500" }: ExplosionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now());
  const duration = 800; // 800ms explosion animation

  useFrame(() => {
    if (meshRef.current) {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      if (progress >= 1) {
        onComplete();
        return;
      }

      // Explosion grows quickly then fades
      const scale = progress < 0.3 ? progress * 3.33 : 1 - (progress - 0.3) * 1.43;
      const opacity = progress < 0.2 ? progress * 5 : 1 - (progress - 0.2) * 1.25;
      
      meshRef.current.scale.setScalar(scale * radius);
      (meshRef.current.material as THREE.MeshStandardMaterial).opacity = Math.max(0, opacity);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={1}
      />
    </mesh>
  );
}