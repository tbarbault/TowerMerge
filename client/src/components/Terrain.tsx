import { useTexture } from "@react-three/drei";

export default function Terrain() {
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture repeat
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(8, 6);

  return (
    <>
      {/* Main terrain - extended for longer combat zone */}
      <mesh position={[0, -0.5, -5]} receiveShadow>
        <boxGeometry args={[30, 1, 35]} />
        <meshStandardMaterial 
          map={grassTexture}
          color="#4ade80"
        />
      </mesh>
      
      {/* Life line at the front of the grid - enemies crossing this lose player life */}
      <mesh position={[0, 0.02, 5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.2]} />
        <meshStandardMaterial 
          color="#ef4444" 
          transparent 
          opacity={0.8}
          emissive="#ef4444"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Enemy spawn indicator at far back */}
      <mesh position={[0, 0.02, -15]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 0.2]} />
        <meshStandardMaterial 
          color="#22c55e" 
          transparent 
          opacity={0.6}
          emissive="#22c55e"
          emissiveIntensity={0.2}
        />
      </mesh>
    </>
  );
}
