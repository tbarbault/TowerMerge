import { create } from "zustand";

// Audio pool for better memory management on mobile
class AudioPool {
  private pool: HTMLAudioElement[] = [];
  private maxSize: number;
  private src: string;
  private volume: number;

  constructor(src: string, volume: number = 0.5, maxSize: number = 3) {
    this.src = src;
    this.volume = volume;
    this.maxSize = maxSize;
  }

  private createAudio(): HTMLAudioElement {
    const audio = new Audio(this.src);
    audio.volume = this.volume;
    audio.preload = "none"; // Load on demand for better iOS performance
    return audio;
  }

  play(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Find available audio or create new one
      let audio = this.pool.find(a => a.paused);
      
      if (!audio && this.pool.length < this.maxSize) {
        audio = this.createAudio();
        this.pool.push(audio);
      } else if (!audio) {
        // All are playing, skip instead of interrupting on iOS for better performance
        if (isIOS()) {
          resolve();
          return;
        }
        // On desktop, use the oldest one
        audio = this.pool[0];
        audio.currentTime = 0;
      }

      audio.currentTime = 0;
      audio.play()
        .then(() => resolve())
        .catch(error => {
          // Silently fail on iOS to avoid console spam
          if (!isIOS()) {
            console.log("Audio play prevented:", error);
          }
          reject(error);
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
  isMuted: false, // Start unmuted by default
  isIOS: isIOS(),
  audioEnabled: false,
  
  hitPool: null,
  successPool: null,
  towerPlacePool: null,
  enemyDeathPool: null,
  
  initialize: async () => {
    const { isInitialized, isIOS: deviceIsIOS } = get();
    if (isInitialized) return;

    try {
      // Load mute state from localStorage
      if (typeof window !== 'undefined') {
        const savedMuted = window.localStorage.getItem('audio-muted');
        if (savedMuted) {
          set({ isMuted: JSON.parse(savedMuted) });
        }
      }

      // Create audio pools with iOS-optimized settings
      const poolSize = deviceIsIOS ? 2 : 3; // Smaller pool size on iOS
      const hitVolume = deviceIsIOS ? 0.2 : 0.3; // Lower volume on iOS
      
      const hitPool = new AudioPool("/sounds/bullet_impact.wav", hitVolume, poolSize);
      const successPool = new AudioPool("/sounds/success.mp3", 0.5, poolSize);
      const towerPlacePool = new AudioPool("/sounds/hit.mp3", 0.3, poolSize);
      const enemyDeathPool = new AudioPool("/sounds/bubble_death.wav", 0.4, poolSize);

      set({
        hitPool,
        successPool,
        towerPlacePool,
        enemyDeathPool,
        isInitialized: true
      });

      console.log(`Audio initialized for ${deviceIsIOS ? 'iOS' : 'desktop'} device`);
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
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
    const { hitPool, isMuted, audioEnabled, isIOS: deviceIsIOS } = get();
    if (!hitPool || isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    hitPool.play().catch(() => {
      // Silently fail for better performance
    });
  },
  
  playSuccess: () => {
    const { successPool, isMuted, audioEnabled, isIOS: deviceIsIOS } = get();
    if (!successPool || isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    successPool.play().catch(() => {
      // Silently fail for better performance
    });
  },
  
  playTowerPlace: () => {
    const { towerPlacePool, isMuted, audioEnabled, isIOS: deviceIsIOS } = get();
    if (!towerPlacePool || isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
    console.log(`Playing ${towerPlacePool === get().towerPlacePool ? 'turret' : 'mortar'} placement sound`);
    towerPlacePool.play().catch(() => {
      // Silently fail for better performance
    });
  },
  
  playEnemyDeath: () => {
    const { enemyDeathPool, isMuted, audioEnabled, isIOS: deviceIsIOS } = get();
    if (!enemyDeathPool || isMuted || (deviceIsIOS && !audioEnabled)) {
      return;
    }
    
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
