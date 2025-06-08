export default function Lights() {
  return (
    <>
      {/* Enhanced ambient light */}
      <ambientLight intensity={0.3} color="#f0f8ff" />
      
      {/* Main directional light (sun) with enhanced shadows */}
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={80}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />
      
      {/* Hemisphere light for natural lighting */}
      <hemisphereLight
        skyColor="#87CEEB"
        groundColor="#2d5016"
        intensity={0.4}
      />
      
      {/* Fill light from opposite side */}
      <directionalLight
        position={[-10, 5, -15]}
        intensity={0.3}
        color="#ff6b35"
      />
      
      {/* Combat area spotlight */}
      <pointLight
        position={[0, 12, 0]}
        intensity={0.6}
        distance={30}
        decay={2}
        color="#fffacd"
      />
    </>
  );
}
