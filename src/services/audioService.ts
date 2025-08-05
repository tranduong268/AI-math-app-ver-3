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
    const player = this.audioPool[this.poolIndex];
    if (player && player.paused) {
        player.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
        player.volume = 0;
        player.play().catch(() => {});
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
    const nonOverlappingSounds: SoundKey[] = ['BUTTON_CLICK', 'DECISION', 'SEQUENCE_ITEM_POP', 'SEQUENCE_ITEM_SLIDE', 'TYPE'];
    if (nonOverlappingSounds.includes(key)) {
        let path: string = Array.isArray(asset.path) ? asset.path[0] : asset.path;
        if(key === 'TYPE') { // Special handling for rapid sounds using pool
             this.poolIndex = (this.poolIndex + 1) % POOL_SIZE;
             const player = this.audioPool[this.poolIndex];
             const originalAudioData = this.audioCache.get(path);
             if(originalAudioData){
                 player.src = originalAudioData.src;
                 player.volume = originalAudioData.volume;
                 player.loop = originalAudioData.loop;
                 player.currentTime = 0;
                 player.play().catch(e => { if(e.name !== 'NotAllowedError') console.error(`Error playing pooled sound ${path}:`, e)});
             }
             return;
        }

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