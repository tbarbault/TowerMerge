import { useRef, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture, useGLTF } from "@react-three/drei";
import { useTowerDefense } from "../lib/stores/useTowerDefense";
import { useAudio } from "../lib/stores/useAudio";
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
  
  // Load the custom turret level 1 GLB model
  const turretLevel1GLB = useGLTF("/models/turret_level1.glb");
  
  const { enemies, towers, mergeTowers } = useTowerDefense();
  const { camera, raycaster, pointer } = useThree();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(new THREE.Vector3());
  const [targetRotation, setTargetRotation] = useState(0);
  const animationGroupRef = useRef<THREE.Group>(null);
  
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
              // Play merge sound effect
              const audioMuted = typeof window !== 'undefined' && window.localStorage ? 
                JSON.parse(window.localStorage.getItem('audio-muted') || 'false') : false;
              if (!audioMuted) {
                try {
                  const mergeAudio = new Audio("/sounds/hit.mp3");
                  mergeAudio.volume = 1.0;
                  mergeAudio.playbackRate = 1.0;
                  mergeAudio.play().catch(() => {});
                  console.log("Playing tower merge sound");
                } catch (e) {
                  console.log("Error playing merge sound:", e);
                }
              }
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
      {type === 'turret' && level === 1 ? (
        // Custom GLB model for Turret Level 1
        <group ref={turretRef} scale={2.5}>
          <primitive 
            object={turretLevel1GLB.scene.clone()} 
            userData={{ towerId }}
          />
        </group>
      ) : type === 'turret' ? (
        // Procedural Military Style Design for turret levels 2-5 (20% larger)
        <group scale={1.2}>
          {/* Hexagonal Base Platform */}
          <mesh position={[0, 0.05, 0]} userData={{ towerId }}>
            <cylinderGeometry args={[0.8, 0.9, 0.1, 6]} />
            <meshStandardMaterial 
              color="#8B4513"
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
          
          {/* Main Base Structure */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.7, 0.8, 0.15, 6]} />
            <meshStandardMaterial 
              color={level === 1 ? "#556B2F" : level === 2 ? "#4682B4" : level === 3 ? "#9370DB" : level === 4 ? "#DC143C" : "#FF8C00"}
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>
          
          {/* Progressive base enhancements */}
          {level >= 2 && (
            <>
              {/* Corner reinforcements */}
              {Array.from({ length: 6 }, (_, i) => (
                <mesh key={i} position={[
                  Math.cos(i * Math.PI / 3) * 0.75,
                  0.12,
                  Math.sin(i * Math.PI / 3) * 0.75
                ]} rotation={[0, i * Math.PI / 3, 0]}>
                  <boxGeometry args={[0.05, 0.15, 0.08]} />
                  <meshStandardMaterial 
                    color="#2F2F2F"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {level >= 3 && (
            <>
              {/* Power conduits on base */}
              {Array.from({ length: 3 }, (_, i) => (
                <mesh key={i} position={[0, 0.05 + i * 0.03, 0]} rotation={[0, i * Math.PI / 2, 0]}>
                  <torusGeometry args={[0.72, 0.01, 6, 16]} />
                  <meshStandardMaterial 
                    color="#00AAFF"
                    emissive="#0066AA"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {level >= 4 && (
            <>
              {/* Advanced cooling systems */}
              {Array.from({ length: 12 }, (_, i) => (
                <mesh key={i} position={[
                  Math.cos(i * Math.PI / 6) * 0.65,
                  0.19,
                  Math.sin(i * Math.PI / 6) * 0.65
                ]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.04, 6]} />
                  <meshStandardMaterial 
                    color="#FF4400"
                    emissive="#AA2200"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {level >= 5 && (
            <>
              {/* Elite shield generators */}
              {Array.from({ length: 6 }, (_, i) => (
                <mesh key={i} position={[
                  Math.cos(i * Math.PI / 3) * 0.6,
                  0.25,
                  Math.sin(i * Math.PI / 3) * 0.6
                ]}>
                  <sphereGeometry args={[0.03, 8, 6]} />
                  <meshStandardMaterial 
                    color="#FFFF00"
                    emissive="#DDDD00"
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {/* Secondary Base */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.5, 0.6, 0.2, 8]} />
            <meshStandardMaterial 
              color={level === 1 ? "#6B8E23" : level === 2 ? "#5A8AC0" : level === 3 ? "#A085DB" : level === 4 ? "#E85A5A" : "#FFA500"}
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
          
          {/* Turret Mounting */}
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.35, 0.4, 0.15, 8]} />
            <meshStandardMaterial 
              color="#4F5D2F"
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>
          
          {/* Turret Head - Spherical with level-based complexity */}
          <group ref={turretRef} position={[0, 0.45, 0]}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.3, 16, 12]} />
              <meshStandardMaterial 
                color={level === 1 ? "#6B8E23" : level === 2 ? "#5A8AC0" : level === 3 ? "#A085DB" : level === 4 ? "#E85A5A" : "#FFA500"}
                metalness={0.7}
                roughness={0.3}
              />
            </mesh>
            
            {/* Level-based armor plating and details */}
            {level >= 2 && (
              <>
                {/* Armor plating rings */}
                {Array.from({ length: 3 }, (_, i) => (
                  <mesh key={i} position={[0, 0, 0]} rotation={[0, (i * Math.PI) / 3, 0]}>
                    <torusGeometry args={[0.32, 0.02, 8, 16]} />
                    <meshStandardMaterial 
                      color="#4A4A4A"
                      metalness={0.9}
                      roughness={0.1}
                    />
                  </mesh>
                ))}
              </>
            )}
            
            {level >= 3 && (
              <>
                {/* Advanced targeting sensors */}
                {Array.from({ length: 4 }, (_, i) => (
                  <mesh key={i} position={[
                    Math.cos(i * Math.PI / 2) * 0.25,
                    0.05,
                    Math.sin(i * Math.PI / 2) * 0.25
                  ]}>
                    <sphereGeometry args={[0.03, 8, 6]} />
                    <meshStandardMaterial 
                      color="#00FF00"
                      emissive="#00AA00"
                      emissiveIntensity={0.5}
                    />
                  </mesh>
                ))}
              </>
            )}
            
            {level >= 4 && (
              <>
                {/* Advanced radar array */}
                <mesh position={[0, 0.35, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
                  <meshStandardMaterial 
                    color="#FF0000"
                    emissive="#AA0000"
                    emissiveIntensity={0.6}
                  />
                </mesh>
                <mesh position={[0, 0.43, 0]} rotation={[0, 0, 0]}>
                  <torusGeometry args={[0.08, 0.01, 6, 16]} />
                  <meshStandardMaterial 
                    color="#FF0000"
                    emissive="#AA0000"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              </>
            )}
            
            {level >= 5 && (
              <>
                {/* Elite command module */}
                <mesh position={[0, 0.25, 0]}>
                  <octahedronGeometry args={[0.08]} />
                  <meshStandardMaterial 
                    color="#FFFF00"
                    emissive="#DDDD00"
                    emissiveIntensity={0.8}
                  />
                </mesh>
                {/* Energy field generators */}
                {Array.from({ length: 8 }, (_, i) => (
                  <mesh key={i} position={[
                    Math.cos(i * Math.PI / 4) * 0.35,
                    0,
                    Math.sin(i * Math.PI / 4) * 0.35
                  ]}>
                    <cylinderGeometry args={[0.005, 0.005, 0.6, 4]} />
                    <meshStandardMaterial 
                      color="#FFFF00"
                      emissive="#DDDD00"
                      emissiveIntensity={0.9}
                      transparent
                      opacity={0.7}
                    />
                  </mesh>
                ))}
              </>
            )}
            
            {/* Multi-barrel system based on level */}
            {Array.from({ length: config.barrelCount }, (_, i) => {
              const angleOffset = (i * 2 * Math.PI) / config.barrelCount;
              const barrelRadius = config.barrelCount > 1 ? 0.15 : 0;
              return (
                <group key={i}>
                  {/* Barrel */}
                  <mesh position={[
                    Math.cos(angleOffset) * barrelRadius,
                    0,
                    Math.sin(angleOffset) * barrelRadius + config.barrelLength / 2
                  ]}>
                    <cylinderGeometry args={[config.barrelRadius, config.barrelRadius, config.barrelLength, 8]} />
                    <meshStandardMaterial 
                      color="#2F2F2F"
                      metalness={0.8}
                      roughness={0.2}
                    />
                  </mesh>
                  
                  {/* Muzzle */}
                  <mesh position={[
                    Math.cos(angleOffset) * barrelRadius,
                    0,
                    Math.sin(angleOffset) * barrelRadius + config.barrelLength
                  ]}>
                    <cylinderGeometry args={[config.barrelRadius * 1.2, config.barrelRadius, 0.05, 8]} />
                    <meshStandardMaterial 
                      color="#1A1A1A"
                      metalness={0.9}
                      roughness={0.1}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        </group>
      ) : type === 'mortar' ? (
        // Mortar - Artillery Style Design for all levels
        <>
          {/* Hexagonal Base Platform */}
          <mesh position={[0, 0.05, 0]} userData={{ towerId }}>
            <cylinderGeometry args={[0.8, 0.9, 0.1, 6]} />
            <meshStandardMaterial 
              color="#8B4513"
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>
          
          {/* Main Base Structure */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.7, 0.8, 0.15, 6]} />
            <meshStandardMaterial 
              color={level === 1 ? "#556B2F" : level === 2 ? "#4682B4" : level === 3 ? "#9370DB" : level === 4 ? "#DC143C" : "#FF8C00"}
              metalness={0.4}
              roughness={0.6}
            />
          </mesh>
          
          {/* Progressive mortar base enhancements */}
          {level >= 2 && (
            <>
              {/* Stabilizing legs */}
              {Array.from({ length: 3 }, (_, i) => (
                <mesh key={i} position={[
                  Math.cos(i * 2 * Math.PI / 3) * 0.9,
                  0.06,
                  Math.sin(i * 2 * Math.PI / 3) * 0.9
                ]} rotation={[0, i * 2 * Math.PI / 3, 0]}>
                  <boxGeometry args={[0.1, 0.12, 0.3]} />
                  <meshStandardMaterial 
                    color="#2F2F2F"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {level >= 3 && (
            <>
              {/* Ammo storage rings */}
              {Array.from({ length: 2 }, (_, i) => (
                <mesh key={i} position={[0, 0.08 + i * 0.04, 0]}>
                  <torusGeometry args={[0.65, 0.02, 6, 16]} />
                  <meshStandardMaterial 
                    color="#8B4513"
                    metalness={0.4}
                    roughness={0.6}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {level >= 4 && (
            <>
              {/* Advanced loading mechanisms */}
              {Array.from({ length: 6 }, (_, i) => (
                <mesh key={i} position={[
                  Math.cos(i * Math.PI / 3) * 0.6,
                  0.18,
                  Math.sin(i * Math.PI / 3) * 0.6
                ]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.08, 6]} />
                  <meshStandardMaterial 
                    color="#FF4400"
                    emissive="#AA2200"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {level >= 5 && (
            <>
              {/* Elite auto-loader systems */}
              {Array.from({ length: 4 }, (_, i) => (
                <mesh key={i} position={[
                  Math.cos(i * Math.PI / 2) * 0.4,
                  0.25,
                  Math.sin(i * Math.PI / 2) * 0.4
                ]}>
                  <boxGeometry args={[0.08, 0.15, 0.08]} />
                  <meshStandardMaterial 
                    color="#FFFF00"
                    emissive="#DDDD00"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              ))}
            </>
          )}
          
          {/* Mortar Tube - Rotating with targeting */}
          <group ref={turretRef} position={[0, config.height, 0]}>
            {/* Tube support structure */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.25, 0.3, 0.2, 8]} />
              <meshStandardMaterial 
                color={level === 1 ? "#6B8E23" : level === 2 ? "#5A8AC0" : level === 3 ? "#A085DB" : level === 4 ? "#E85A5A" : "#FFA500"}
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
            
            {/* Main mortar tube - angled upward */}
            <mesh 
              position={[0, config.mortarTubeLength / 2 * Math.sin(config.mortarAngle), config.mortarTubeLength / 2 * Math.cos(config.mortarAngle)]}
              rotation={[config.mortarAngle, 0, 0]}
            >
              <cylinderGeometry args={[config.mortarTubeRadius, config.mortarTubeRadius * 0.8, config.mortarTubeLength, 12]} />
              <meshStandardMaterial 
                color="#2F2F2F"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
            
            {/* Muzzle brake */}
            <mesh 
              position={[0, config.mortarTubeLength * Math.sin(config.mortarAngle), config.mortarTubeLength * Math.cos(config.mortarAngle)]}
              rotation={[config.mortarAngle, 0, 0]}
            >
              <cylinderGeometry args={[config.mortarTubeRadius * 1.3, config.mortarTubeRadius, 0.08, 12]} />
              <meshStandardMaterial 
                color="#1A1A1A"
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            
            {/* Level-based targeting systems */}
            {level >= 2 && (
              <mesh position={[0.2, 0.1, 0]}>
                <sphereGeometry args={[0.04, 8, 6]} />
                <meshStandardMaterial 
                  color="#00FF00"
                  emissive="#00AA00"
                  emissiveIntensity={0.5}
                />
              </mesh>
            )}
            
            {level >= 3 && (
              <>
                {/* Rangefinder */}
                <mesh position={[-0.2, 0.1, 0]}>
                  <boxGeometry args={[0.06, 0.04, 0.08]} />
                  <meshStandardMaterial 
                    color="#0088FF"
                    emissive="#0066AA"
                    emissiveIntensity={0.4}
                  />
                </mesh>
              </>
            )}
            
            {level >= 4 && (
              <>
                {/* Advanced ballistic computer */}
                <mesh position={[0, 0.15, -0.2]}>
                  <boxGeometry args={[0.12, 0.08, 0.06]} />
                  <meshStandardMaterial 
                    color="#FF0000"
                    emissive="#AA0000"
                    emissiveIntensity={0.6}
                  />
                </mesh>
              </>
            )}
            
            {level >= 5 && (
              <>
                {/* Elite guided munition system */}
                <mesh position={[0, 0.2, 0]}>
                  <octahedronGeometry args={[0.06]} />
                  <meshStandardMaterial 
                    color="#FFFF00"
                    emissive="#DDDD00"
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </>
            )}
          </group>
        </>
      ) : null}
    </group>
  );
}