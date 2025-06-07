export default function Lights() {
  return (
    <>
      {/* Ambient light for general illumination */}
      <ambientLight intensity={0.4} />
      
      {/* Main directional light (sun) */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
        color="#b4d8ff"
      />
      
      {/* Point light for dynamic lighting */}
      <pointLight
        position={[0, 8, 0]}
        intensity={0.5}
        distance={20}
        decay={2}
      />
    </>
  );
}
