import { Canvas } from "@react-three/fiber";
import { Suspense, useState, useEffect } from "react";
import { KeyboardControls } from "@react-three/drei";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Game from "./components/Game";
import GameUI from "./components/GameUI";
import "@fontsource/inter";

const queryClient = new QueryClient();

// Define control keys for the game
const controls = [
  { name: "select", keys: ["Space", "Enter"] },
  { name: "cancel", keys: ["Escape"] },
  { name: "up", keys: ["ArrowUp", "KeyW"] },
  { name: "down", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-optimized camera settings
  const cameraSettings = isMobile 
    ? {
        position: [0, 18, 12] as [number, number, number],
        fov: 75,
        near: 0.1,
        far: 1000
      }
    : {
        position: [0, 15, 10] as [number, number, number],
        fov: 50,
        near: 0.1,
        far: 1000
      };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={cameraSettings}
            gl={{
              antialias: true,
              powerPreference: "default"
            }}
          >
            <color attach="background" args={["#87CEEB"]} />
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </Canvas>
          <GameUI />
        </KeyboardControls>
      </div>
    </QueryClientProvider>
  );
}

export default App;
