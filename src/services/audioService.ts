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
    // Play a short, silent audio clip to keep the audio context active.
    // This is a common strategy to prevent mobile browsers from suspending audio.
    const player = this.audioPool[this.poolIndex];
    if (player && player.paused) {
        // A very short, silent WAV file encoded in base64.
        player.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        player.volume = 0;
        player.play().catch(() => {
          // This catch block is important. The play() might be interrupted by another sound,
          // which is fine. We just want to ensure it doesn't throw an unhandled promise rejection.
        });
    }
  }

  playSound(key: SoundKey) {
    this.wakeupAudio(); 
    if (this.isMuted || !this.hasInteracted) return;

    const asset = AudioAssets[key];
    if (!asset) {
      console.warn(`Sound key "${key}" not found.`);
      return;
    }
    
    // Non-overlapping sounds can use a simpler method.
    const nonOverlappingSounds: SoundKey[] = ['BUTTON_CLICK', 'DECISION', 'SEQUENCE_ITEM_POP', 'SEQUENCE_ITEM_SLIDE'];
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
    
    // Use the pool for sounds that can overlap rapidly (like typing or multiple correct answers)
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

    this.poolIndex = (this.poolIndex + 1) % POOL_SIZE;
    const player = this.audioPool[this.poolIndex];
    
    player.src = originalAudioData.src;
    player.volume = originalAudioData.volume;
    player.loop = originalAudioData.loop;
    player.currentTime = 0;
    
    player.play().catch(error => {
      // Don't log an error if the user hasn't interacted yet, or if play was interrupted.
      if (error.name !== 'NotAllowedError' && error.name !== 'AbortError') {
           console.error(`Error playing pooled sound ${path}:`, error);
      }
    });
  }

  playLowTimeWarning = () => {
    this.wakeupAudio();
    if (this.isMuted || !this.hasInteracted) return;

    const asset = AudioAssets.TIMER_LOW;
    if (!asset || Array.isArray(asset.path)) return;

    const soundPath = asset.path;
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
    this.wakeupAudio();
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
      // Stop all pooled sounds
      this.audioPool.forEach(player => player.pause());
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
       this.audioPool.forEach(player => player.pause());
    }
  }
}

export const audioService = new AudioService();
