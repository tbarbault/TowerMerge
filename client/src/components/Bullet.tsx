import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BulletProps {
  position: [number, number, number];
  color: string;
  type?: 'bullet' | 'mortar';
}

export default function Bullet({ position, color, type = 'bullet' }: BulletProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Animate bullet
  useFrame(() => {
    if (meshRef.current) {
      if (type === 'mortar') {
        meshRef.current.rotation.x += 0.1;
        meshRef.current.rotation.z += 0.1;
      } else {
        meshRef.current.rotation.x += 0.2;
        meshRef.current.rotation.y += 0.15;
      }
    }
  });

  if (type === 'mortar') {
    return (
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    );
  }

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
