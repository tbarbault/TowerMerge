export default function TunnelExits() {

  // Define tunnel positions along the back edge where enemies spawn
  const tunnelPositions: [number, number, number][] = [
    [-4, 0, -12],
    [-1, 0, -12], 
    [2, 0, -12],
    [5, 0, -12]
  ];

  return (
    <>
      {tunnelPositions.map((position, index) => (
        <group key={index} position={position as [number, number, number]}>
          {/* Tunnel entrance - circular opening */}
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 0.8, 16]} />
            <meshStandardMaterial 
              color="#2d2d2d" 
              transparent 
              opacity={0.9}
            />
          </mesh>
          
          {/* Tunnel walls */}
          <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.6, 16]} />
            <meshStandardMaterial 
              map={woodTexture}
              color="#555555"
            />
          </mesh>
          
          {/* Tunnel rim */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 1.0, 16]} />
            <meshStandardMaterial 
              map={woodTexture}
              color="#666666"
            />
          </mesh>
          
          {/* Small rocks around entrance */}
          <mesh position={[0.6, 0.1, 0.3]} rotation={[0, Math.random() * Math.PI, 0]}>
            <dodecahedronGeometry args={[0.1]} />
            <meshStandardMaterial 
              map={woodTexture}
              color="#777777"
            />
          </mesh>
          
          <mesh position={[-0.5, 0.1, 0.4]} rotation={[0, Math.random() * Math.PI, 0]}>
            <dodecahedronGeometry args={[0.08]} />
            <meshStandardMaterial 
              map={woodTexture}
              color="#888888"
            />
          </mesh>
          
          <mesh position={[0.3, 0.1, -0.6]} rotation={[0, Math.random() * Math.PI, 0]}>
            <dodecahedronGeometry args={[0.12]} />
            <meshStandardMaterial 
              map={woodTexture}
              color="#666666"
            />
          </mesh>
        </group>
      ))}
    </>
  );
}