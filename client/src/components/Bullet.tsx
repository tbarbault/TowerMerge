import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BulletProps {
  position: [number, number, number];
  color: string;
}

export default function Bullet({ position, color }: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate bullet
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.2;
      meshRef.current.rotation.y += 0.15;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.08, 6, 6]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
