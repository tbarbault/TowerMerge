import React, { useMemo } from 'react';
import { useTexture } from "@react-three/drei";

export default function BackgroundDecor() {
  const grassTexture = useTexture("/textures/grass.png");
  
  // Pre-calculate random positions for trees and rocks to avoid Math.random() in render
  const decorItems = useMemo(() => {
    const items = [];
    
    // Trees in background (behind the combat area)
    for (let i = 0; i < 8; i++) {
      items.push({
        type: 'tree',
        position: [
          (Math.random() - 0.5) * 18, // x: spread across width
          0,
          -20 - Math.random() * 8 // z: behind combat area
        ],
        scale: 0.8 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2
      });
    }
    
    // Rocks scattered around edges
    for (let i = 0; i < 12; i++) {
      const side = Math.random() < 0.5 ? -1 : 1;
      items.push({
        type: 'rock',
        position: [
          side * (12 + Math.random() * 4), // x: on the sides
          0,
          -15 + Math.random() * 25 // z: scattered along length
        ],
        scale: 0.3 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2
      });
    }
    
    // Hills in far background
    for (let i = 0; i < 5; i++) {
      items.push({
        type: 'hill',
        position: [
          (Math.random() - 0.5) * 30, // x: wide spread
          -2,
          -35 - Math.random() * 10 // z: far behind
        ],
        scale: 2 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI * 2
      });
    }
    
    return items;
  }, []);

  return (
    <group>
      {decorItems.map((item, index) => {
        if (item.type === 'tree') {
          return (
            <group key={`tree-${index}`} position={item.position} rotation={[0, item.rotation, 0]} scale={item.scale}>
              {/* Tree trunk */}
              <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.15, 0.2, 2, 8]} />
                <meshStandardMaterial color="#8b4513" />
              </mesh>
              
              {/* Tree foliage */}
              <mesh position={[0, 2.5, 0]}>
                <sphereGeometry args={[1.2, 8, 6]} />
                <meshStandardMaterial color="#228b22" />
              </mesh>
              
              <mesh position={[0, 3.5, 0]}>
                <sphereGeometry args={[0.8, 8, 6]} />
                <meshStandardMaterial color="#32cd32" />
              </mesh>
            </group>
          );
        }
        
        if (item.type === 'rock') {
          return (
            <mesh 
              key={`rock-${index}`} 
              position={item.position} 
              rotation={[0, item.rotation, 0]} 
              scale={item.scale}
            >
              <dodecahedronGeometry args={[1]} />
              <meshStandardMaterial color="#696969" />
            </mesh>
          );
        }
        
        if (item.type === 'hill') {
          return (
            <mesh 
              key={`hill-${index}`} 
              position={item.position} 
              rotation={[0, item.rotation, 0]} 
              scale={item.scale}
            >
              <sphereGeometry args={[3, 16, 8]} />
              <meshStandardMaterial 
                map={grassTexture}
                color="#4ade80" 
              />
            </mesh>
          );
        }
        
        return null;
      })}
      
      {/* Distant mountains */}
      <mesh position={[-20, 2, -50]} scale={[8, 4, 3]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#708090" />
      </mesh>
      
      <mesh position={[0, 3, -55]} scale={[12, 6, 4]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#778899" />
      </mesh>
      
      <mesh position={[25, 1.5, -45]} scale={[6, 3, 2.5]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#696969" />
      </mesh>
      
      {/* Clouds */}
      <mesh position={[-15, 15, -30]} scale={[3, 1.5, 2]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#f0f8ff" transparent opacity={0.8} />
      </mesh>
      
      <mesh position={[10, 18, -40]} scale={[4, 2, 2.5]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#f5f5f5" transparent opacity={0.7} />
      </mesh>
      
      <mesh position={[0, 20, -60]} scale={[5, 2.5, 3]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#fffafa" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}