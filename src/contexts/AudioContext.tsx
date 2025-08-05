import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { SoundKey } from '../audio/audioAssets';

interface AudioContextType {
  playSound: (key: SoundKey) => void;
  playMusic: (key: SoundKey) => void;
  stopMusic: () => void;
  playLowTimeWarning: () => void;
  stopLowTimeWarning: () => void;
  toggleMute: () => void;
  isMuted: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

const AUDIO_MUTED_KEY = 'toanHocThongMinh_isMuted';

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const savedState = localStorage.getItem(AUDIO_MUTED_KEY);
      return savedState ? JSON.parse(savedState) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    audioService.setMutedState(isMuted);
  }, [isMuted]);

  // Effect to handle browser tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      // If the page becomes visible again, wake up the audio context.
      // This is crucial for mobile browsers that suspend audio when the tab is not active.
      if (document.visibilityState === 'visible') {
        audioService.wakeupAudio();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []); // Empty dependency array means this effect runs only once on mount and unmount


  const playSound = useCallback((key: SoundKey) => {
    audioService.playSound(key);
  }, []);

  const playMusic = useCallback((key: SoundKey) => {
    audioService.playMusic(key);
  }, []);
  
  const stopMusic = useCallback(() => {
    audioService.stopMusic();
  }, []);

  const playLowTimeWarning = useCallback(() => {
    audioService.playLowTimeWarning();
  }, []);

  const stopLowTimeWarning = useCallback(() => {
    audioService.stopLowTimeWarning();
  }, []);

  const toggleMute = useCallback(() => {
    const newMutedState = audioService.toggleMute();
    setIsMuted(newMutedState);
    try {
      localStorage.setItem(AUDIO_MUTED_KEY, JSON.stringify(newMutedState));
    } catch (e) {
      console.error("Failed to save mute state to localStorage", e);
    }
  }, []);

  const value = { playSound, playMusic, stopMusic, playLowTimeWarning, stopLowTimeWarning, toggleMute, isMuted };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};
