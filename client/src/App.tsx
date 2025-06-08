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

  // Mobile-optimized camera settings - restored previous zoom level
  const cameraSettings = isMobile 
    ? {
        position: [0, 20, 20] as [number, number, number],
        fov: 85,
        near: 0.1,
        far: 1000
      }
    : {
        position: [0, 18, 18] as [number, number, number],
        fov: 60,
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
            {/* Improved skybox with gradient effect */}
            <color attach="background" args={["#87CEEB"]} />
            <fog attach="fog" args={["#87CEEB", 30, 80]} />
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
