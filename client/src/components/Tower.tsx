import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import * as THREE from "three";

interface TowerProps {
  position: [number, number, number];
  level: number;
  isSelected?: boolean;
  towerId: string;
  type: 'turret' | 'mortar';
}

export default function Tower({ position, level, isSelected = false, towerId, type }: TowerProps) {
  const meshRef = useRef<THREE.Group>(null);
  const turretRef = useRef<THREE.Group>(null);
  const woodTexture = useTexture("/textures/wood.jpg");
  const { enemies, towers, mergeTowers, updateTowerRotation } = useTowerDefense();
  const { camera, raycaster, pointer } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  
  // Get current tower data
  const currentTower = towers.find(t => t.id === towerId);
  const targetRotation = currentTower?.targetRotation || 0;
  const currentRotation = currentTower?.currentRotation || 0;

  // This effect is now handled by the game logic
  // Rotation is managed through the store's updateTowerRotation function

  // Handle drag and drop functionality
  const handlePointerDown = (event: any) => {
    if (event.button === 0) { // Left mouse button
      setIsDragging(true);
      const intersectionPoint = event.point;
      const towerPosition = new THREE.Vector3(...position);
      setDragOffset(intersectionPoint.clone().sub(towerPosition));
      event.stopPropagation();
    }
  };

  const handlePointerUp = (event: any) => {
    if (isDragging) {
      setIsDragging(false);
      
      // Reset tower position to original
      if (meshRef.current) {
        meshRef.current.position.set(...position);
      }
      
      // Check if dropped on another tower for merging
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(meshRef.current?.parent?.children || []);
      
      for (const intersect of intersects) {
        const userData = intersect.object.userData;
        if (userData.towerId && userData.towerId !== towerId) {
          const targetTower = towers.find(t => t.id === userData.towerId);
          const currentTower = towers.find(t => t.id === towerId);
          
          if (targetTower && currentTower && targetTower.level === currentTower.level && currentTower.level < 3) {
            // Check if towers are adjacent (no diagonal merging)
            const dx = Math.abs(targetTower.x - currentTower.x);
            const dz = Math.abs(targetTower.z - currentTower.z);
            const isAdjacent = (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
            
            if (isAdjacent) {
              console.log(`Merging tower ${towerId} with ${userData.towerId}`);
              mergeTowers(towerId, userData.towerId);
              break;
            } else {
              console.log("Towers must be adjacent (no diagonal merging)");
            }
          }
        }
      }
      event.stopPropagation();
    }
  };

  // Animate turret rotation and selection
  useFrame((state, delta) => {
    if (turretRef.current && !isDragging) {
      // Smooth rotation towards target
      const currentRotationValue = turretRef.current.rotation.y;
      const rotationDiff = targetRotation - currentRotationValue;
      const normalizedDiff = Math.atan2(Math.sin(rotationDiff), Math.cos(rotationDiff));
      const newRotation = currentRotationValue + normalizedDiff * delta * 6;
      turretRef.current.rotation.y = newRotation;
      
      // Update tower rotation in store
      updateTowerRotation(towerId, newRotation, targetRotation);
    }

    if (meshRef.current && isSelected && !isDragging) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }

    // Handle dragging - only update position during active drag
    if (isDragging && meshRef.current) {
      raycaster.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      
      if (intersectionPoint) {
        const newPosition = intersectionPoint.sub(dragOffset);
        meshRef.current.position.copy(newPosition);
      }
    }
    
    // Ensure tower stays at original position when not dragging
    if (!isDragging && meshRef.current) {
      const currentPos = meshRef.current.position;
      const targetPos = new THREE.Vector3(...position);
      if (currentPos.distanceTo(targetPos) > 0.01) {
        meshRef.current.position.copy(targetPos);
      }
    }
  });

  // Tower appearance based on type and level
  const getTowerConfig = (type: 'turret' | 'mortar', level: number) => {
    if (type === 'turret') {
      switch (level) {
        case 1:
          return { 
            height: 0.8, 
            baseColor: "#a0aec0", 
            turretColor: "#718096",
            segments: 12,
            barrelLength: 0.6,
            barrelRadius: 0.04,
            isMortar: false
          };
        case 2:
          return { 
            height: 1.0, 
            baseColor: "#63b3ed", 
            turretColor: "#4299e1",
            segments: 16,
            barrelLength: 0.8,
            barrelRadius: 0.05,
            isMortar: false
          };
        case 3:
          return { 
            height: 1.2, 
            baseColor: "#fc8181", 
            turretColor: "#f56565",
            segments: 20,
            barrelLength: 1.0,
            barrelRadius: 0.06,
            isMortar: false
          };
        default:
          return { 
            height: 0.8, 
            baseColor: "#a0aec0", 
            turretColor: "#718096",
            segments: 12,
            barrelLength: 0.6,
            barrelRadius: 0.04,
            isMortar: false
          };
      }
    } else { // mortar
      switch (level) {
        case 1:
          return { 
            height: 0.6, 
            baseColor: "#d69e2e", 
            turretColor: "#b7791f",
            segments: 8,
            barrelLength: 0.4,
            barrelRadius: 0.08,
            isMortar: true
          };
        case 2:
          return { 
            height: 0.8, 
            baseColor: "#f6ad55", 
            turretColor: "#dd6b20",
            segments: 10,
            barrelLength: 0.5,
            barrelRadius: 0.1,
            isMortar: true
          };
        case 3:
          return { 
            height: 1.0, 
            baseColor: "#fbb6ce", 
            turretColor: "#e53e3e",
            segments: 12,
            barrelLength: 0.6,
            barrelRadius: 0.12,
            isMortar: true
          };
        default:
          return { 
            height: 0.6, 
            baseColor: "#d69e2e", 
            turretColor: "#b7791f",
            segments: 8,
            barrelLength: 0.4,
            barrelRadius: 0.08,
            isMortar: true
          };
      }
    }
  };

  const config = getTowerConfig(type, level);

  return (
    <group 
      ref={meshRef} 
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      userData={{ towerId }}
    >
      {/* Tower base platform */}
      <mesh position={[0, 0.1, 0]} userData={{ towerId }}>
        <cylinderGeometry args={[0.5, 0.6, 0.2, 8]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#8b4513"
        />
      </mesh>

      {/* Main tower base */}
      <mesh position={[0, config.height / 2 + 0.2, 0]}>
        <cylinderGeometry args={[0.35, 0.45, config.height, config.segments]} />
        <meshStandardMaterial 
          color={config.baseColor}
          metalness={0.7}
          roughness={0.2}
          emissive={config.baseColor}
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Rotating turret */}
      <group ref={turretRef} position={[0, config.height + 0.2, 0]}>
        {/* Turret body */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.3, 0.6]} />
          <meshStandardMaterial 
            color={config.turretColor}
            metalness={0.8}
            roughness={0.1}
            emissive={config.turretColor}
            emissiveIntensity={0.05}
          />
        </mesh>

        {/* Main barrel - different styles for turret vs mortar */}
        {config.isMortar ? (
          // Mortar: Short, wide barrel angled upward
          <mesh position={[0, 0.2, config.barrelLength / 2 + 0.2]} rotation={[Math.PI / 3, 0, 0]}>
            <cylinderGeometry args={[config.barrelRadius, config.barrelRadius - 0.02, config.barrelLength, 8]} />
            <meshStandardMaterial 
              color="#8b4513"
              metalness={0.6}
              roughness={0.3}
              emissive="#654321"
              emissiveIntensity={0.05}
            />
          </mesh>
        ) : (
          // Turret: Long, narrow barrel horizontal
          <mesh position={[0, 0.15, config.barrelLength / 2 + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[config.barrelRadius, config.barrelRadius + 0.01, config.barrelLength, 12]} />
            <meshStandardMaterial 
              color="#4a5568"
              metalness={0.9}
              roughness={0.1}
              emissive="#2d3748"
              emissiveIntensity={0.02}
            />
          </mesh>
        )}

        {/* Barrel tip */}
        <mesh position={[0, 0.15, config.barrelLength + 0.3]}>
          <sphereGeometry args={[config.barrelRadius + 0.01, 8, 8]} />
          <meshStandardMaterial 
            color="#0a0a0a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Additional barrels for higher levels */}
        {level >= 2 && (
          <>
            <mesh position={[-0.15, 0.1, config.barrelLength / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[config.barrelRadius * 0.8, config.barrelRadius * 0.8, config.barrelLength * 0.8, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0.15, 0.1, config.barrelLength / 2 + 0.25]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[config.barrelRadius * 0.8, config.barrelRadius * 0.8, config.barrelLength * 0.8, 8]} />
              <meshStandardMaterial color="#2a2a2a" metalness={0.7} roughness={0.3} />
            </mesh>
          </>
        )}

        {/* Missile pods for level 3 */}
        {level === 3 && (
          <>
            <mesh position={[-0.25, 0.25, 0.1]}>
              <boxGeometry args={[0.1, 0.1, 0.4]} />
              <meshStandardMaterial color="#8b0000" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0.25, 0.25, 0.1]}>
              <boxGeometry args={[0.1, 0.1, 0.4]} />
              <meshStandardMaterial color="#8b0000" metalness={0.4} roughness={0.6} />
            </mesh>
          </>
        )}
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.04, 16]} />
          <meshStandardMaterial 
            color="#22c55e" 
            transparent 
            opacity={0.6}
            emissive="#22c55e"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* Level indicator */}
      <mesh position={[0, config.height + 0.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={level === 1 ? "#ef4444" : level === 2 ? "#3b82f6" : "#fbbf24"}
          emissive={level === 1 ? "#ef4444" : level === 2 ? "#3b82f6" : "#fbbf24"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Range indicator (when selected) */}
      {isSelected && (
        <>
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.5 + level * 0.5 - 0.1, 2.5 + level * 0.5 + 0.1, 32]} />
            <meshStandardMaterial 
              color="#22c55e" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Show mergeable towers when selected */}
          {towers.filter(t => {
            if (t.id === towerId || t.level !== level || t.level >= 3 || t.type !== type) return false;
            // Convert world position back to grid coordinates
            const currentGridX = Math.round((position[0] + 4) / 2);
            const currentGridZ = Math.round((position[2] + 2) / 2);
            const dx = Math.abs(t.x - currentGridX);
            const dz = Math.abs(t.z - currentGridZ);
            return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
          }).map(tower => (
            <mesh 
              key={`mergeable-${tower.id}`}
              position={[tower.x * 2 - 4, 0.05, tower.z * 2 - 2]} 
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.7, 16]} />
              <meshStandardMaterial 
                color="#fbbf24" 
                transparent 
                opacity={0.8}
                emissive="#fbbf24"
                emissiveIntensity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </>
      )}

      {/* Dragging indicator */}
      {isDragging && (
        <>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.8, 16]} />
            <meshStandardMaterial 
              color="#fbbf24" 
              transparent 
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Mergeable tower indicator - find towers of same level and adjacent */}
          {towers.filter(t => {
            if (t.id === towerId || t.level !== level || t.level >= 3) return false;
            const dx = Math.abs(t.x - position[0] / 2 + 2);
            const dz = Math.abs(t.z - position[2] / 2 + 1);
            return (dx === 1 && dz === 0) || (dx === 0 && dz === 1);
          }).map(tower => (
            <mesh 
              key={`merge-indicator-${tower.id}`}
              position={[tower.x * 2 - 4, 0.05, tower.z * 2 - 2]} 
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <circleGeometry args={[0.6, 16]} />
              <meshStandardMaterial 
                color="#10b981" 
                transparent 
                opacity={0.7}
                emissive="#10b981"
                emissiveIntensity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}
