import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MineProps {
  position: [number, number, number];
  triggered: boolean;
  onExplode: () => void;
}

export default function Mine({ position, triggered, onExplode }: MineProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const explosionTimer = useRef<number>(0);

  useEffect(() => {
    if (triggered) {
      explosionTimer.current = Date.now();
    }
  }, [triggered]);

  useFrame(() => {
    if (meshRef.current) {
      if (triggered) {
        // Flash red when triggered
        const elapsed = Date.now() - explosionTimer.current;
        if (elapsed > 500) {
          onExplode();
        } else {
          const flash = Math.sin(elapsed * 0.02) > 0;
          (meshRef.current.material as THREE.MeshStandardMaterial).color.setHex(
            flash ? 0xff0000 : 0x444444
          );
        }
      } else {
        // Subtle pulsing when not triggered
        const time = Date.now() * 0.002;
        const pulse = 0.8 + Math.sin(time) * 0.2;
        meshRef.current.scale.setScalar(pulse);
      }
    }
  });

  return (
    <group position={position}>
      {/* Mine body */}
      <mesh ref={meshRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
        <meshStandardMaterial 
          color={triggered ? "#ff0000" : "#444444"}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      
      {/* Mine spikes */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[
          Math.cos(i * Math.PI / 2) * 0.25,
          0.15,
          Math.sin(i * Math.PI / 2) * 0.25
        ]}>
          <coneGeometry args={[0.05, 0.15, 4]} />
          <meshStandardMaterial 
            color={triggered ? "#ff4444" : "#666666"}
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      ))}
      
      {/* Warning light */}
      <mesh position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial 
          color={triggered ? "#ff0000" : "#ff8800"}
          emissive={triggered ? "#ff0000" : "#ff4400"}
          emissiveIntensity={triggered ? 1.0 : 0.3}
        />
      </mesh>
    </group>
  );
}