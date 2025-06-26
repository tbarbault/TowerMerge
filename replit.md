# Tower Defense 3D

## Overview

This is a 3D tower defense game built with React Three Fiber, featuring a modern tech stack with full-stack capabilities. The game presents enemies spawning from tunnel exits and players must strategically place towers to defend their base. The application includes a complete frontend game experience with backend infrastructure ready for multiplayer features and user management.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the UI layer
- **React Three Fiber (@react-three/fiber)** for 3D game rendering
- **React Three Drei (@react-three/drei)** for 3D utilities and helpers
- **Tailwind CSS** with shadcn/ui components for styling
- **Zustand** for state management (game state, audio, tower defense logic)
- **TanStack Query** for server state management
- **Vite** as the build tool and development server

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations
- **PostgreSQL** as the primary database (configured via Neon)
- Memory storage fallback for development
- Session-based architecture ready for authentication

### 3D Game Engine
- **Three.js** for 3D graphics rendering
- **GLSL shader support** via vite-plugin-glsl
- Real-time game loop with frame-based updates
- 3D models support (.gltf, .glb) and audio assets (.mp3, .ogg, .wav)

## Key Components

### Game Logic
- **Tower System**: Turrets and mortars with upgrade mechanics
- **Enemy System**: Multiple enemy types with pathfinding AI
- **Research Tree**: Upgrade system using diamonds as currency
- **Wave Management**: Progressive difficulty with timed enemy spawns
- **Mine System**: Deployable explosive defenses

### State Management
- **useTowerDefense**: Core game state (towers, enemies, bullets, waves)
- **useGame**: Game phase management (menu, playing, paused, gameOver)
- **useAudio**: Sound effects and music management

### 3D Components
- **Grid**: Interactive tower placement system
- **Tower**: Animated 3D towers with targeting and shooting
- **Enemy**: Animated enemies with health bars and pathfinding
- **Terrain**: 3D environment with textures and lighting
- **Effects**: Explosions, impacts, muzzle flashes, and particle systems

## Data Flow

1. **Game Initialization**: Game starts in menu phase, loads audio assets
2. **Game Loop**: useFrame hook drives real-time updates at 60fps
3. **User Input**: Click/touch events for tower placement and UI interaction
4. **State Updates**: Zustand stores manage game state transitions
5. **3D Rendering**: React Three Fiber renders game objects based on state
6. **Audio Feedback**: Sound effects triggered by game events

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React-DOM, React Three Fiber)
- Three.js and 3D utilities
- UI framework (Radix UI components, Tailwind CSS)
- State management (Zustand, TanStack Query)

### Backend Dependencies
- Express.js server framework
- Drizzle ORM with PostgreSQL driver
- Session management with connect-pg-simple
- Database connection via @neondatabase/serverless

### Development Dependencies
- Vite build system with TypeScript support
- GLSL shader processing
- PostCSS with Tailwind CSS
- ESBuild for server bundling

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit with `.replit` configuration
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon PostgreSQL with environment variable configuration
- **Port Configuration**: Server on port 5000, external port 80

### Production Build
- **Client Build**: Vite builds React app to `dist/public`
- **Server Build**: ESBuild bundles Express server to `dist/index.js`
- **Asset Handling**: Static assets served via Express in production
- **Database Migration**: Drizzle migrations in `./migrations` directory

### Cloud Deployment
- **Target Platform**: Google Cloud Run (configured in .replit)
- **Container Ready**: Dockerfile-free deployment with build scripts
- **Environment Variables**: DATABASE_URL required for production
- **Asset Optimization**: Texture and model files included in build

## Changelog

Changelog:
- June 26, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.