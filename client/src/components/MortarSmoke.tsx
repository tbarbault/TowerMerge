import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MortarSmokeProps {
  position: [number, number, number];
  onComplete: () => void;
}

export default function MortarSmoke({ position, onComplete }: MortarSmokeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 20;
  const lifetime = 1.5; // seconds
  const startTime = useRef(Date.now());
  
  const { positions, velocities, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Start at mortar position with slight random spread
      positions[i3] = position[0] + (Math.random() - 0.5) * 0.3;
      positions[i3 + 1] = position[1] + 0.2;
      positions[i3 + 2] = position[2] + (Math.random() - 0.5) * 0.3;
      
      // Random upward velocities with spread
      velocities[i3] = (Math.random() - 0.5) * 2;
      velocities[i3 + 1] = Math.random() * 3 + 1; // Upward
      velocities[i3 + 2] = (Math.random() - 0.5) * 2;
      
      // Random particle sizes
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    return { positions, velocities, sizes };
  }, [position]);
  
  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    if (elapsed > lifetime) {
      onComplete();
      return;
    }
    
    const positionsAttribute = particlesRef.current.geometry.attributes.position;
    const sizesAttribute = particlesRef.current.geometry.attributes.size;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Update positions based on velocities
      positionsAttribute.array[i3] += velocities[i3] * delta;
      positionsAttribute.array[i3 + 1] += velocities[i3 + 1] * delta;
      positionsAttribute.array[i3 + 2] += velocities[i3 + 2] * delta;
      
      // Apply gravity to Y velocity
      velocities[i3 + 1] -= 2 * delta;
      
      // Fade out particles over time
      const progress = elapsed / lifetime;
      sizesAttribute.array[i] = sizes[i] * (1 - progress);
    }
    
    positionsAttribute.needsUpdate = true;
    sizesAttribute.needsUpdate = true;
    
    // Fade out the entire effect
    if (groupRef.current) {
      groupRef.current.scale.setScalar(1 - Math.min(elapsed / lifetime, 1));
    }
  });
  
  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={particleCount}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={sizes}
            count={particleCount}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          transparent
          opacity={0.8}
          color="#666666"
          alphaTest={0.1}
        />
      </points>
    </group>
  );
}