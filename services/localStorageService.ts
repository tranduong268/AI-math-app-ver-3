
import { StoredSession } from '../types';
import { MAX_SESSIONS_TO_STORE, TOTAL_STARS_STORAGE_KEY, UNLOCKED_SETS_STORAGE_KEY } from '../constants';

const INCORRECT_SESSIONS_STORAGE_KEY = 'toanHocThongMinh_incorrectSessions';
const MASTER_USED_ICONS_KEY = 'toanHocThongMinh_masterUsedIcons';
const MAX_MASTER_ICONS_TO_STORE = 400; // Store a long history of icons

export const saveIncorrectSessionToStorage = (newSession: StoredSession): void => {
  let sessions = getIncorrectSessionsFromStorage();
  sessions.unshift(newSession);
  sessions = sessions.slice(0, MAX_SESSIONS_TO_STORE);
  try {
    localStorage.setItem(INCORRECT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving incorrect sessions to localStorage:", error);
  }
};

export const getIncorrectSessionsFromStorage = (): StoredSession[] => {
  try {
    const storedData = localStorage.getItem(INCORRECT_SESSIONS_STORAGE_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData) as StoredSession[];
      return parsedData.sort((a, b) => b.timestamp - a.timestamp);
    }
  } catch (error) {
    console.error("Error reading incorrect sessions from localStorage:", error);
  }
  return [];
};

// Functions for total stars
export const getTotalStars = (): number => {
  try {
    const storedStars = localStorage.getItem(TOTAL_STARS_STORAGE_KEY);
    return storedStars ? parseInt(storedStars, 10) : 0;
  } catch (error) {
    console.error("Error reading total stars from localStorage:", error);
    return 0;
  }
};

export const saveTotalStars = (stars: number): void => {
  try {
    localStorage.setItem(TOTAL_STARS_STORAGE_KEY, stars.toString());
  } catch (error) {
    console.error("Error saving total stars to localStorage:", error);
  }
};

// Functions for unlocked image sets
export const getUnlockedSetIds = (): string[] => {
  try {
    const storedSetIds = localStorage.getItem(UNLOCKED_SETS_STORAGE_KEY);
    return storedSetIds ? JSON.parse(storedSetIds) : [];
  } catch (error) {
    console.error("Error reading unlocked set IDs from localStorage:", error);
    return [];
  }
};

export const saveUnlockedSetIds = (setIds: string[]): void => {
  try {
    localStorage.setItem(UNLOCKED_SETS_STORAGE_KEY, JSON.stringify(setIds));
  } catch (error) {
    console.error("Error saving unlocked set IDs to localStorage:", error);
  }
};

// Functions for master used icons (long-term memory)
export const getMasterUsedIcons = (): string[] => {
  try {
    const storedIcons = localStorage.getItem(MASTER_USED_ICONS_KEY);
    return storedIcons ? JSON.parse(storedIcons) : [];
  } catch (error) {
    console.error("Error reading master used icons from localStorage:", error);
    return [];
  }
};

export const saveMasterUsedIcons = (
  newlyUsedInRound: string[],
  currentMasterIcons: string[]
): string[] => {
  try {
    const combined = [...new Set([...newlyUsedInRound, ...currentMasterIcons])];
    const updatedMasterIcons = combined.slice(0, MAX_MASTER_ICONS_TO_STORE);
    localStorage.setItem(MASTER_USED_ICONS_KEY, JSON.stringify(updatedMasterIcons));
    return updatedMasterIcons;
  } catch (error) {
    console.error("Error saving master used icons to localStorage:", error);
    return currentMasterIcons; // Return old list on error
  }
};

export const clearMasterUsedIcons = (): void => {
    try {
        localStorage.removeItem(MASTER_USED_ICONS_KEY);
    } catch (error) {
        console.error("Error clearing master used icons from localStorage:", error);
    }
};
