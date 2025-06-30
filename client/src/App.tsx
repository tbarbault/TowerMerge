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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Detect iOS devices
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile-optimized camera settings - iPhone optimized positioning
  const cameraSettings = isMobile 
    ? {
        position: [0, 25, 25] as [number, number, number],
        fov: 60,
        near: 0.1,
        far: 1000
      }
    : {
        position: [0, 14, 14] as [number, number, number],
        fov: 60,
        near: 0.1,
        far: 1000
      };

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <KeyboardControls map={controls}>
          <Canvas
            shadows={!isIOS} // Disable shadows on iOS for better performance
            camera={cameraSettings}
            gl={{
              antialias: !isIOS, // Disable antialiasing on iOS for better performance
              powerPreference: isIOS ? "low-power" : "default",
              alpha: false, // Disable alpha channel for better performance
              stencil: false, // Disable stencil buffer for better performance
              preserveDrawingBuffer: false, // Don't preserve drawing buffer
              failIfMajorPerformanceCaveat: false,
              ...(isIOS && {
                // iOS-specific optimizations
                precision: "mediump", // Use medium precision for better performance
                logarithmicDepthBuffer: false,
              })
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
