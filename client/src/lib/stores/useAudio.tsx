import { create } from "zustand";

// Audio pool for better memory management on mobile
class AudioPool {
  private pool: HTMLAudioElement[] = [];
  private maxSize: number;
  private src: string;
  private volume: number;
  private lastPlayTime: number = 0;
  private throttleMs: number = 100; // Prevent audio spam

  constructor(src: string, volume: number = 0.5, maxSize: number = 2) {
    this.src = src;
    this.volume = volume;
    this.maxSize = maxSize;
  }

  private createAudio(): HTMLAudioElement {
    const audio = new Audio();
    audio.volume = this.volume;
    audio.preload = "none"; // Load on demand for better performance
    audio.crossOrigin = "anonymous"; // Prevent CORS issues
    return audio;
  }

  play(): Promise<void> {
    return new Promise((resolve) => {
      // Throttle audio to prevent spam and lag
      const now = Date.now();
      if (now - this.lastPlayTime < this.throttleMs) {
        resolve();
        return;
      }
      this.lastPlayTime = now;

      // Find available audio or create new one
      let audio = this.pool.find(a => a.paused);
      
      if (!audio && this.pool.length < this.maxSize) {
        audio = this.createAudio();
        this.pool.push(audio);
      } else if (!audio) {
        // All are playing, skip to prevent lag
        resolve();
        return;
      }

      // Only set src if it's not already set to avoid reloading
      if (audio.src !== this.src && !audio.src.endsWith(this.src)) {
        audio.src = this.src;
      }

      audio.currentTime = 0;
      audio.play()
        .then(() => resolve())
        .catch(() => {
          // Silently fail to prevent console spam
          resolve();
        });
    });
  }

  cleanup() {
    this.pool.forEach(audio => {
      audio.pause();
      audio.src = "";
    });
    this.pool = [];
  }
}

// Detect iOS devices
const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

interface AudioState {
  isInitialized: boolean;
  isMuted: boolean;
  isIOS: boolean;
  audioEnabled: boolean;
  
  // Audio pools for better performance
  hitPool: AudioPool | null;
  successPool: AudioPool | null;
  towerPlacePool: AudioPool | null;
  enemyDeathPool: AudioPool | null;
  
  // Control functions
  initialize: () => Promise<void>;
  ensureAudioPools: () => void;
  toggleMute: () => void;
  enableAudio: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playTowerPlace: () => void;
  playEnemyDeath: () => void;
  cleanup: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  isInitialized: false,
  isMuted: true, // Start muted by default to prevent lag
  isIOS: isIOS(),
  audioEnabled: false,
  
  hitPool: null,
  successPool: null,
  towerPlacePool: null,
  enemyDeathPool: null,
  
  initialize: async () => {
    const { isInitialized } = get();
    if (isInitialized) return;

    try {
      // Load mute state from localStorage
      if (typeof window !== 'undefined') {
        const savedMuted = window.localStorage.getItem('audio-muted');
        if (savedMuted) {
          set({ isMuted: JSON.parse(savedMuted) });
        }
      }

      // Mark as initialized but delay audio pool creation until needed
      set({ isInitialized: true });

      console.log(`Audio initialized for ${isIOS() ? 'iOS' : 'desktop'} device`);
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  },

  // Lazy initialize audio pools only when needed
  ensureAudioPools: () => {
    const { hitPool, successPool, towerPlacePool, enemyDeathPool, isIOS: deviceIsIOS } = get();
    
    if (hitPool && successPool && towerPlacePool && enemyDeathPool) {
      return; // Already initialized
    }

    // Create audio pools with minimal sizes to reduce lag
    const poolSize = deviceIsIOS ? 1 : 2; // Very small pool size to prevent lag
    const hitVolume = deviceIsIOS ? 0.15 : 0.2; // Lower volume to reduce processing
    
    const newHitPool = new AudioPool("/sounds/bullet_impact.wav", hitVolume, poolSize);
    const newSuccessPool = new AudioPool("/sounds/success.mp3", 0.3, poolSize);
    const newTowerPlacePool = new AudioPool("/sounds/hit.mp3", 0.2, poolSize);
    const newEnemyDeathPool = new AudioPool("/sounds/bubble_death.wav", 0.25, poolSize);

    set({
      hitPool: newHitPool,
      successPool: newSuccessPool,
      towerPlacePool: newTowerPlacePool,
      enemyDeathPool: newEnemyDeathPool,
    });
  },

  enableAudio: () => {
    set({ audioEnabled: true });
    console.log("Audio enabled by user interaction");
  },

  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    // Persist mute state in localStorage
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('audio-muted', JSON.stringify(newMutedState));
    }
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { isMuted, audioEnabled, isIOS: deviceIsIOS, ensureAudioPools } = get();
    if (isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    ensureAudioPools();
    const { hitPool } = get();
    if (!hitPool) return;
    
    hitPool.play().catch(() => {
      // Silently fail for better performance
    });
  },
  
  playSuccess: () => {
    const { isMuted, audioEnabled, isIOS: deviceIsIOS, ensureAudioPools } = get();
    if (isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    ensureAudioPools();
    const { successPool } = get();
    if (!successPool) return;
    
    successPool.play().catch(() => {
      // Silently fail for better performance
    });
  },
  
  playTowerPlace: () => {
    const { isMuted, audioEnabled, isIOS: deviceIsIOS, ensureAudioPools } = get();
    if (isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    ensureAudioPools();
    const { towerPlacePool } = get();
    if (!towerPlacePool) return;
    
    towerPlacePool.play().catch(() => {
      // Silently fail for better performance
    });
  },
  
  playEnemyDeath: () => {
    const { isMuted, audioEnabled, isIOS: deviceIsIOS, ensureAudioPools } = get();
    if (isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    ensureAudioPools();
    const { enemyDeathPool } = get();
    if (!enemyDeathPool) return;
    
    enemyDeathPool.play().catch(() => {
      // Silently fail for better performance
    });
  },

  cleanup: () => {
    const { hitPool, successPool, towerPlacePool, enemyDeathPool } = get();
    
    hitPool?.cleanup();
    successPool?.cleanup();
    towerPlacePool?.cleanup();
    enemyDeathPool?.cleanup();
    
    set({
      hitPool: null,
      successPool: null,
      towerPlacePool: null,
      enemyDeathPool: null,
      isInitialized: false,
      audioEnabled: false
    });
    
    console.log("Audio resources cleaned up");
  }
}));
