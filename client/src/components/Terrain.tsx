import { useTexture } from "@react-three/drei";

export default function Terrain() {
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture repeat
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(10, 8);

  return (
    <>
      {/* Main battlefield base */}
      <mesh position={[0, -0.6, -5]} receiveShadow>
        <boxGeometry args={[32, 1.2, 40]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#22c55e"
          roughness={0.6}
        />
      </mesh>
      
      {/* Tower platform - elevated stone platform */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[12, 0.3, 8]} />
        <meshStandardMaterial 
          color="#94a3b8"
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
      
      {/* Battle path - worn dirt path from spawn to life line */}
      <mesh position={[0, -0.05, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 25]} />
        <meshStandardMaterial 
          color="#d97706"
          roughness={0.7}
          opacity={0.9}
          transparent
        />
      </mesh>
      
      {/* Defensive perimeter - decorative stone borders */}
      {[-6, 6].map((x, i) => (
        <mesh key={i} position={[x, -0.1, 0]} receiveShadow>
          <boxGeometry args={[0.5, 0.4, 8]} />
          <meshStandardMaterial color="#64748b" roughness={0.4} />
        </mesh>
      ))}
      
      {/* Life line - glowing danger zone */}
      <mesh position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 0.3]} />
        <meshStandardMaterial 
          color="#dc2626" 
          transparent 
          opacity={0.9}
          emissive="#b91c1c"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Enemy spawn zone - ominous dark area */}
      <mesh position={[0, -0.03, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 3]} />
        <meshStandardMaterial 
          color="#475569" 
          transparent 
          opacity={0.8}
          emissive="#64748b"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Atmospheric fog planes for depth */}
      <mesh position={[0, 1, -20]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 8]} />
        <meshStandardMaterial 
          color="#9ca3af" 
          transparent 
          opacity={0.1}
        />
      </mesh>
    </>
  );
}
