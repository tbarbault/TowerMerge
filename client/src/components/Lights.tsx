export default function Lights() {
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.3} color="#ffffff" />
      
      {/* Main directional light (dramatic sun) */}
      <directionalLight
        position={[15, 12, 8]}
        intensity={1.2}
        color="#fff5e6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Cool fill light from opposite side */}
      <directionalLight
        position={[-8, 6, -10]}
        intensity={0.4}
        color="#a3c7ff"
      />
      
      {/* Atmospheric point light over battlefield */}
      <pointLight
        position={[0, 10, -5]}
        intensity={0.6}
        distance={25}
        decay={1.5}
        color="#fff9e6"
      />
      
      {/* Red glow over life line */}
      <pointLight
        position={[0, 3, 5]}
        intensity={0.8}
        distance={8}
        decay={2}
        color="#ff4444"
      />
      
      {/* Ominous green glow at spawn */}
      <pointLight
        position={[0, 2, -15]}
        intensity={0.5}
        distance={6}
        decay={2}
        color="#44ff44"
      />
    </>
  );
}
