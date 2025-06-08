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
  const { enemies, towers, mergeTowers } = useTowerDefense();
  const { camera, raycaster, pointer } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const [targetRotation, setTargetRotation] = useState(0);
  
  // Calculate tower range based on type and level
  const baseRange = type === 'turret' ? 6.0 : 7.0;
  const towerRange = baseRange * (1.15 ** (level - 1));

  // Find target enemy and calculate rotation
  useEffect(() => {
    // Convert grid position to world position
    const towerWorldX = position[0];
    const towerWorldZ = position[2];
    
    const enemiesInRange = enemies.filter((enemy) => {
      const dx = enemy.x - towerWorldX;
      const dz = enemy.z - towerWorldZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      return distance <= towerRange;
    });

    if (enemiesInRange.length > 0) {
      // Target the enemy furthest along the path
      const target = enemiesInRange.reduce((closest, enemy) => 
        enemy.pathIndex > closest.pathIndex ? enemy : closest
      );
      
      // Calculate angle to target
      const dx = target.x - towerWorldX;
      const dz = target.z - towerWorldZ;
      const angle = Math.atan2(dx, dz);
      setTargetRotation(angle);
    }
  }, [enemies, position, level, type]);

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
          
          if (targetTower && currentTower && targetTower.level === currentTower.level && currentTower.level < 5 && targetTower.type === currentTower.type) {
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
      const newRotation = currentRotationValue + normalizedDiff * delta * 12; // Doubled rotation speed
      turretRef.current.rotation.y = newRotation;
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
            height: 0.25, 
            baseColor: "#22c55e", 
            turretColor: "#16a34a",
            segments: 8,
            barrelLength: 0.5,
            barrelRadius: 0.04,
            barrelCount: 1,
            isMortar: false
          };
        case 2:
          return { 
            height: 0.35, 
            baseColor: "#3b82f6", 
            turretColor: "#2563eb",
            segments: 10,
            barrelLength: 0.64,
            barrelRadius: 0.05,
            barrelCount: 2,
            isMortar: false
          };
        case 3:
          return { 
            height: 0.5, 
            baseColor: "#a855f7", 
            turretColor: "#9333ea",
            segments: 12,
            barrelLength: 0.8,
            barrelRadius: 0.06,
            barrelCount: 3,
            isMortar: false
          };
        case 4:
          return { 
            height: 0.7, 
            baseColor: "#ef4444", 
            turretColor: "#dc2626",
            segments: 14,
            barrelLength: 1.0,
            barrelRadius: 0.07,
            barrelCount: 4,
            isMortar: false
          };
        case 5:
          return { 
            height: 0.9, 
            baseColor: "#f59e0b", 
            turretColor: "#d97706",
            segments: 16,
            barrelLength: 1.24,
            barrelRadius: 0.08,
            barrelCount: 5,
            isMortar: false
          };
        default:
          return { 
            height: 0.15, 
            baseColor: "#718096", 
            turretColor: "#4a5568",
            segments: 8,
            barrelLength: 0.3,
            barrelRadius: 0.025,
            barrelCount: 1,
            isMortar: false
          };
      }
    } else { // mortar - completely different design
      switch (level) {
        case 1:
          return { 
            height: 0.16, 
            baseColor: "#22c55e", 
            turretColor: "#16a34a",
            segments: 8,
            mortarTubeLength: 0.55,
            mortarTubeRadius: 0.66,
            mortarAngle: 0.6, // 35 degrees
            baseWidth: 1.4,
            isMortar: true
          };
        case 2:
          return { 
            height: 0.24, 
            baseColor: "#3b82f6", 
            turretColor: "#2563eb",
            segments: 10,
            mortarTubeLength: 0.8,
            mortarTubeRadius: 0.9,
            mortarAngle: 0.6,
            baseWidth: 1.6,
            isMortar: true
          };
        case 3:
          return { 
            height: 0.36, 
            baseColor: "#a855f7", 
            turretColor: "#9333ea",
            segments: 12,
            mortarTubeLength: 1.05,
            mortarTubeRadius: 1.14,
            mortarAngle: 0.6,
            baseWidth: 1.8,
            isMortar: true
          };
        case 4:
          return { 
            height: 0.52, 
            baseColor: "#ef4444", 
            turretColor: "#dc2626",
            segments: 14,
            mortarTubeLength: 1.35,
            mortarTubeRadius: 1.38,
            mortarAngle: 0.6,
            baseWidth: 2.0,
            isMortar: true
          };
        case 5:
          return { 
            height: 0.72, 
            baseColor: "#f59e0b", 
            turretColor: "#d97706",
            segments: 16,
            mortarTubeLength: 1.7,
            mortarTubeRadius: 1.62,
            mortarAngle: 0.6,
            baseWidth: 2.2,
            isMortar: true
          };
        default:
          return { 
            height: 0.1, 
            baseColor: "#d69e2e", 
            turretColor: "#b7791f",
            segments: 8,
            mortarTubeLength: 0.2,
            mortarTubeRadius: 0.07,
            mortarAngle: 0.6,
            baseWidth: 0.75,
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
        <cylinderGeometry args={[1.0, 1.2, 0.4, 8]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#8b4513"
        />
      </mesh>

      {/* Main tower base - different for mortar vs turret */}
      {config.isMortar ? (
        // Mortar: Wide, low platform
        <mesh position={[0, config.height / 2 + 0.2, 0]}>
          <cylinderGeometry args={[(config as any).baseWidth / 2, (config as any).baseWidth / 2 + 0.1, config.height, config.segments]} />
          <meshStandardMaterial 
            color={config.baseColor}
            metalness={0.5}
            roughness={0.4}
            emissive={config.baseColor}
            emissiveIntensity={0.05}
          />
        </mesh>
      ) : (
        // Turret: Tall cylindrical base
        <mesh position={[0, config.height / 2 + 0.2, 0]}>
          <cylinderGeometry args={[0.7, 0.9, config.height, config.segments]} />
          <meshStandardMaterial 
            color={config.baseColor}
            metalness={0.7}
            roughness={0.2}
            emissive={config.baseColor}
            emissiveIntensity={0.05}
          />
        </mesh>
      )}

      {/* Rotating turret */}
      <group ref={turretRef} position={[0, config.height + 0.2, 0]}>
        {/* Turret body - different for mortar vs turret */}
        {config.isMortar ? (
          // Mortar: Low, wide mounting platform
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.6, 0.7, 0.32, 8]} />
            <meshStandardMaterial 
              color={config.turretColor}
              metalness={0.6}
              roughness={0.3}
              emissive={config.turretColor}
              emissiveIntensity={0.05}
            />
          </mesh>
        ) : (
          // Turret: Rectangular gun mount
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.8, 0.6, 1.2]} />
            <meshStandardMaterial 
              color={config.turretColor}
              metalness={0.8}
              roughness={0.1}
              emissive={config.turretColor}
              emissiveIntensity={0.05}
            />
          </mesh>
        )}

        {/* Weapons - different for turret vs mortar */}
        {config.isMortar ? (
          // Mortar: Angled cannon tube
          <mesh 
            position={[0, 0.2, (config as any).mortarTubeLength / 2 + 0.1]} 
            rotation={[(config as any).mortarAngle, 0, 0]}
          >
            <cylinderGeometry args={[(config as any).mortarTubeRadius, (config as any).mortarTubeRadius * 0.8, (config as any).mortarTubeLength, 12]} />
            <meshStandardMaterial 
              color="#8b4513"
              metalness={0.6}
              roughness={0.3}
              emissive="#654321"
              emissiveIntensity={0.05}
            />
          </mesh>
        ) : (
          // Turret: Multiple barrels based on level
          <>
            {Array.from({ length: (config as any).barrelCount }, (_, i) => {
              const angle = (i * 2 * Math.PI) / (config as any).barrelCount;
              const radius = (config as any).barrelCount === 1 ? 0 : 0.1;
              const x = Math.sin(angle) * radius;
              const z = Math.cos(angle) * radius;
              
              return (
                <mesh 
                  key={i}
                  position={[x, 0.15, z + (config as any).barrelLength / 2 + 0.25]} 
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[(config as any).barrelRadius, (config as any).barrelRadius, (config as any).barrelLength, 8]} />
                  <meshStandardMaterial 
                    color="#4a5568"
                    metalness={0.9}
                    roughness={0.1}
                    emissive="#2d3748"
                    emissiveIntensity={0.02}
                  />
                </mesh>
              );
            })}
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
            <ringGeometry args={[towerRange - 0.1, towerRange + 0.1, 32]} />
            <meshStandardMaterial 
              color="#22c55e" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </>
      )}

      {/* Dragging indicator */}
      {isDragging && (
        <>
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[towerRange, 16]} />
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
