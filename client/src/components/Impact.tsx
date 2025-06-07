import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ImpactProps {
  position: [number, number, number];
  onComplete: () => void;
}

export default function Impact({ position, onComplete }: ImpactProps) {
  const meshRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now());
  const duration = 300; // 300ms impact animation

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = Date.now() - startTime.current;
    const progress = elapsed / duration;

    if (progress >= 1) {
      onComplete();
      return;
    }

    // Scale effect: starts small, grows quickly, then shrinks
    const scale = progress < 0.3 
      ? progress * 3.33 // Grow quickly to 1.0 in first 30%
      : 1.0 - (progress - 0.3) * 1.43; // Shrink to 0 in remaining 70%

    meshRef.current.scale.setScalar(Math.max(0, scale));

    // Opacity fade out
    const opacity = 1 - progress;
    meshRef.current.children.forEach((child: any) => {
      if (child.material) {
        child.material.opacity = opacity;
      }
    });
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Main impact flash */}
      <mesh>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial 
          color="#ffff00" 
          transparent 
          opacity={1}
        />
      </mesh>
      
      {/* Outer glow ring */}
      <mesh>
        <ringGeometry args={[0.2, 0.4, 8]} />
        <meshBasicMaterial 
          color="#ff6600" 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Sparks */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 0.3;
        const z = Math.sin(angle) * 0.3;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial 
              color="#ffff99" 
              transparent 
              opacity={1}
            />
          </mesh>
        );
      })}
    </group>
  );
}