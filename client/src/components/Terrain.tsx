import { useTexture } from "@react-three/drei";

export default function Terrain() {
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture repeat
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(8, 6);

  return (
    <>
      {/* Main green terrain base */}
      <mesh position={[0, -0.5, -8]} receiveShadow>
        <boxGeometry args={[20, 1, 35]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#4ade80"
        />
      </mesh>
      
      {/* Central track area - defined pathway */}
      <mesh position={[0, -0.4, -8]} receiveShadow>
        <boxGeometry args={[14, 0.1, 32]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#65a30d"
        />
      </mesh>
      
      {/* Side barriers/walls */}
      <mesh position={[-8, 0, -8]} receiveShadow>
        <boxGeometry args={[1.5, 0.8, 35]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#365314"
        />
      </mesh>
      
      <mesh position={[8, 0, -8]} receiveShadow>
        <boxGeometry args={[1.5, 0.8, 35]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#365314"
        />
      </mesh>
      
      {/* Track lane dividers */}
      <mesh position={[-3, -0.35, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 32]} />
        <meshStandardMaterial 
          color="#374151" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      <mesh position={[0, -0.35, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 32]} />
        <meshStandardMaterial 
          color="#374151" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      <mesh position={[3, -0.35, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 32]} />
        <meshStandardMaterial 
          color="#374151" 
          transparent 
          opacity={0.7}
        />
      </mesh>
      
      {/* Life line at the front of the grid - enemies crossing this lose player life */}
      <mesh position={[0, 0.02, 8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.2]} />
        <meshStandardMaterial 
          color="#ef4444" 
          transparent 
          opacity={0.8}
          emissive="#ef4444"
          emissiveIntensity={0.3}
        />
      </mesh>
      

    </>
  );
}
