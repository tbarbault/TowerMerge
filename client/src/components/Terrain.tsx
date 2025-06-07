import { useTexture } from "@react-three/drei";

export default function Terrain() {
  const grassTexture = useTexture("/textures/grass.png");
  
  // Configure texture repeat
  grassTexture.wrapS = grassTexture.wrapT = 1000; // RepeatWrapping
  grassTexture.repeat.set(8, 6);

  return (
    <mesh position={[0, -0.5, 0]} receiveShadow>
      <boxGeometry args={[20, 1, 16]} />
      <meshStandardMaterial 
        map={grassTexture}
        color="#4ade80"
      />
    </mesh>
  );
}
