import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  towerPlaceSound: HTMLAudioElement | null;
  enemyDeathSound: HTMLAudioElement | null;
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement | null) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  setTowerPlaceSound: (sound: HTMLAudioElement) => void;
  setEnemyDeathSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playTowerPlace: () => void;
  playEnemyDeath: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  towerPlaceSound: null,
  enemyDeathSound: null,
  isMuted: false, // Start unmuted by default
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  setTowerPlaceSound: (sound) => set({ towerPlaceSound: sound }),
  setEnemyDeathSound: (sound) => set({ enemyDeathSound: sound }),
  
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
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  playTowerPlace: () => {
    const { towerPlaceSound, isMuted } = get();
    if (towerPlaceSound && !isMuted) {
      towerPlaceSound.currentTime = 0;
      towerPlaceSound.volume = 0.4;
      towerPlaceSound.play().catch(error => {
        console.log("Tower place sound play prevented:", error);
      });
    }
  },
  
  playEnemyDeath: () => {
    const { enemyDeathSound, isMuted } = get();
    if (enemyDeathSound && !isMuted) {
      const soundClone = enemyDeathSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Enemy death sound play prevented:", error);
      });
    }
  },
}));
