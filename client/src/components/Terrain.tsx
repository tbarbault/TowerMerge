import { useTexture } from "@react-three/drei";

export default function Terrain() {
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture repeat
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(8, 6);

  return (
    <>
      {/* Track lanes - create defined pathways for enemies */}
      <mesh position={[0, -0.45, -8]} receiveShadow>
        <boxGeometry args={[14, 1, 35]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#2d5016"
        />
      </mesh>
      
      {/* Central track area - lighter green */}
      <mesh position={[0, -0.4, -8]} receiveShadow>
        <boxGeometry args={[12, 0.1, 32]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#4ade80"
        />
      </mesh>
      
      {/* Side barriers/walls */}
      <mesh position={[-7, 0, -8]} receiveShadow>
        <boxGeometry args={[2, 0.5, 35]} />
        <meshStandardMaterial 
          color="#1f2937"
        />
      </mesh>
      
      <mesh position={[7, 0, -8]} receiveShadow>
        <boxGeometry args={[2, 0.5, 35]} />
        <meshStandardMaterial 
          color="#1f2937"
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
