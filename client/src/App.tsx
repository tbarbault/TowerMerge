import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
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
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <KeyboardControls map={controls}>
          <Canvas
            shadows
            camera={{
              position: [0, 15, 10],
              fov: 50,
              near: 0.1,
              far: 1000
            }}
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
