
import { AudioAssets, SoundKey } from "../audio/audioAssets";

const POOL_SIZE = 10; // Number of audio players in the pool

class AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  private audioPool: HTMLAudioElement[] = [];
  private poolIndex: number = 0;
  private backgroundMusic: HTMLAudioElement | null = null;
  private lowTimeSound: HTMLAudioElement | null = null;
  private isMuted: boolean = false;
  private masterVolume: number = 1.0;
  private hasInteracted: boolean = false;
  private pendingMusicKey: SoundKey | null = null;

  constructor() {
    this.preload();
    this.createAudioPool();
  }

  preload() {
    Object.values(AudioAssets).forEach(asset => {
      if (Array.isArray(asset.path)) {
        asset.path.forEach(p => this.createAndCacheAudioElement(p, asset.loop, asset.volume));
      } else {
        this.createAndCacheAudioElement(asset.path, asset.loop, asset.volume);
      }
    });
  }

  private createAndCacheAudioElement(path: string, loop: boolean, volume?: number) {
      if (this.audioCache.has(path)) return;
      // The paths in audioAssets.ts are root-relative (e.g., '/audio/sound.mp3').
      // These are valid URLs that the Audio constructor can handle directly
      // without manual conversion to an absolute URL. This is more robust and
      // avoids potential issues with `window.location.origin` in different environments.
      const audio = new Audio(path);
      audio.loop = loop;
      audio.volume = (volume ?? 1.0) * this.masterVolume;
      audio.preload = 'auto';
      this.audioCache.set(path, audio);
      audio.load();
  }

  private createAudioPool() {
    for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio();
        audio.preload = 'auto';
        this.audioPool.push(audio);
    }
  }
  
  public userHasInteracted = () => {
    if (this.hasInteracted) return;
    this.hasInteracted = true;
    this.wakeupAudio(); // Initial wakeup
    
    if (this.pendingMusicKey) {
      const keyToPlay = this.pendingMusicKey;
      this.pendingMusicKey = null;
      this.playMusic(keyToPlay);
    }
  };

  public wakeupAudio = () => {
    if (!this.hasInteracted) return;
    // Play a tiny, silent audio file on a pooled player. This is the most robust way
    // to keep the audio context alive or wake it up after an interruption.
    const player = this.audioPool[this.poolIndex];
    if (player && player.paused) {
        // A very short, silent data URI.
        player.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        player.volume = 0;
        player.play().catch(() => {}); // Ignore errors, this is just for wakeup
    }
  }

  playSound(key: SoundKey) {
    this.wakeupAudio(); // Proactively wake up audio context before any sound attempt.
    if (this.isMuted || !this.hasInteracted) return;

    const asset = AudioAssets[key];
    if (!asset) {
      console.warn(`Sound key "${key}" not found.`);
      return;
    }
    
    // For sounds that don't need to overlap rapidly (like button clicks), we can use a simpler method.
    // 'TYPE' was removed from this list to fix a bug where rapid typing would cause sounds to be skipped.
    // By removing it, 'TYPE' now uses the audio pool below, which is designed for overlapping sounds.
    const nonOverlappingSounds: SoundKey[] = ['BUTTON_CLICK', 'DECISION'];
    if (nonOverlappingSounds.includes(key)) {
        let path: string = Array.isArray(asset.path) ? asset.path[0] : asset.path;
        const audio = this.audioCache.get(path);
        if(audio) {
            audio.currentTime = 0;
            audio.volume = (asset.volume ?? 1.0) * this.masterVolume;
            audio.play().catch(e => { if(e.name !== 'NotAllowedError') console.error(`Error playing simple sound ${path}:`, e)});
        }
        return;
    }
    
    let path: string;
    if (Array.isArray(asset.path)) {
      path = asset.path[Math.floor(Math.random() * asset.path.length)];
    } else {
      path = asset.path;
    }
    
    const originalAudioData = this.audioCache.get(path);
    if (!originalAudioData) {
       console.error(`Audio element for path ${path} not found in cache during playSound.`);
       return;
    }

    // Use the pool for overlapping sounds (this now includes 'TYPE')
    this.poolIndex = (this.poolIndex + 1) % POOL_SIZE;
    const player = this.audioPool[this.poolIndex];
    
    player.src = originalAudioData.src;
    player.volume = originalAudioData.volume;
    player.loop = originalAudioData.loop;
    player.currentTime = 0;
    
    player.play().catch(error => {
      if (error.name !== 'NotAllowedError') {
           console.error(`Error playing pooled sound ${path}:`, error);
      }
    });
  }

  playLowTimeWarning = () => {
    this.wakeupAudio(); // Proactively wake up audio context.
    if (this.isMuted || !this.hasInteracted) return;

    const asset = AudioAssets.TIMER_LOW;
    if (!asset || Array.isArray(asset.path)) return;

    const soundPath = asset.path;
    // Use the cached element if it exists
    const soundElement = this.audioCache.get(soundPath);

    if (!soundElement) {
        console.error(`Low time warning sound for path ${soundPath} not found in cache.`);
        return;
    }

    this.lowTimeSound = soundElement;

    if (this.lowTimeSound && this.lowTimeSound.paused) {
        this.lowTimeSound.currentTime = 0;
        this.lowTimeSound.play().catch(e => console.error("Error playing low time warning", e));
    }
  }

  stopLowTimeWarning = () => {
    if (this.lowTimeSound && !this.lowTimeSound.paused) {
        this.lowTimeSound.pause();
        this.lowTimeSound.currentTime = 0;
    }
  }

  playMusic(key: SoundKey) {
    this.wakeupAudio(); // Proactively wake up audio context.
    if (!this.hasInteracted) {
      this.pendingMusicKey = key;
      return;
    }

    const asset = AudioAssets[key];
    if (!asset || Array.isArray(asset.path)) {
        console.warn(`Music key "${key}" not found or is a sound effect array.`);
        return;
    }
    
    const musicPath = asset.path as string;
    const newMusicElement = this.audioCache.get(musicPath);

    if (!newMusicElement) {
        console.error(`Music element for path ${musicPath} not found in cache.`);
        return;
    }
    
    if (this.backgroundMusic === newMusicElement) {
        if (!this.isMuted && this.backgroundMusic.paused) {
             this.backgroundMusic.play().catch(error => console.error(`Error resuming music ${musicPath}:`, error));
        }
        return;
    }

    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    
    this.backgroundMusic = newMusicElement;
    if (!this.isMuted) {
      this.backgroundMusic.currentTime = 0;
      this.backgroundMusic.play().catch(error => console.error(`Error playing music ${musicPath}:`, error));
    }
  }

  stopMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    this.pendingMusicKey = null;
  }

  toggleMute() {
    this.userHasInteracted();
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      if (this.backgroundMusic) this.backgroundMusic.pause();
      if (this.lowTimeSound) this.lowTimeSound.pause();
    } else {
      // Game logic in components (App.tsx for music, useGameLogic for timed sounds)
      // is responsible for resuming sounds by calling playMusic() or playLowTimeWarning() again,
      // now that isMuted is false.
    }
    return this.isMuted;
  }
  
  getIsMuted() {
    return this.isMuted;
  }

  setMutedState(muted: boolean) {
    this.isMuted = muted;
    if (this.isMuted) {
       if (this.backgroundMusic) this.backgroundMusic.pause();
       if (this.lowTimeSound) this.lowTimeSound.pause();
    }
  }
}

export const audioService = new AudioService();
