import { useMemo } from "react";
import * as THREE from "three";

export default function Decorations() {
  // Pre-calculate random positions for decorative elements
  const rockPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 12; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 25,
        z: (Math.random() - 0.5) * 30,
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2
      });
    }
    return positions;
  }, []);

  const treePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 8; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 28,
        z: (Math.random() - 0.5) * 35,
        scale: 0.8 + Math.random() * 0.6,
        rotation: Math.random() * Math.PI * 2
      });
    }
    return positions;
  }, []);

  const crystalPositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 6; i++) {
      positions.push({
        x: (Math.random() - 0.5) * 20,
        z: (Math.random() - 0.5) * 25,
        scale: 0.2 + Math.random() * 0.3,
        rotation: Math.random() * Math.PI * 2,
        color: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)]
      });
    }
    return positions;
  }, []);

  return (
    <group>
      {/* Decorative rocks scattered around battlefield */}
      {rockPositions.map((rock, i) => (
        <mesh 
          key={`rock-${i}`} 
          position={[rock.x, -0.2, rock.z]} 
          scale={rock.scale}
          rotation={[0, rock.rotation, 0]}
        >
          <dodecahedronGeometry args={[0.5]} />
          <meshStandardMaterial 
            color="#94a3b8" 
            roughness={0.6}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* Stylized trees around the perimeter */}
      {treePositions.map((tree, i) => (
        <group key={`tree-${i}`} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          {/* Tree trunk */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 1]} />
            <meshStandardMaterial color="#a3a3a3" roughness={0.7} />
          </mesh>
          
          {/* Tree foliage */}
          <mesh position={[0, 1.2, 0]} rotation={[0, tree.rotation, 0]}>
            <coneGeometry args={[0.6, 1.2, 8]} />
            <meshStandardMaterial 
              color="#16a34a" 
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Mystical energy crystals */}
      {crystalPositions.map((crystal, i) => (
        <mesh 
          key={`crystal-${i}`} 
          position={[crystal.x, 0.3, crystal.z]} 
          scale={crystal.scale}
          rotation={[0, crystal.rotation, 0]}
        >
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial 
            color={crystal.color}
            emissive={crystal.color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Ancient pillars at corners */}
      {[
        [-12, -12], [12, -12], [-12, 12], [12, 12]
      ].map(([x, z], i) => (
        <group key={`pillar-${i}`} position={[x, 0, z]}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 2]} />
            <meshStandardMaterial 
              color="#6b7280" 
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>
          
          {/* Pillar glow */}
          <mesh position={[0, 2.2, 0]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial 
              color="#fbbf24"
              emissive="#fbbf24"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* Floating energy orbs */}
      {[
        [-8, 2, -8], [8, 2, -8], [-8, 2, 8], [8, 2, 8], [0, 3, -12]
      ].map(([x, y, z], i) => (
        <mesh key={`orb-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial 
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={0.6}
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}