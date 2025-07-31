import { DifficultyLevel, CountingQuestion, ShapeType, GameMode } from '../../../types';
import { generateId, getPrioritizedIconPool, getCandidateIcons, shuffleArray } from '../questionUtils';

export const generateCountingQuestion = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>,
    baseUnlockedIcons: ShapeType[],
    globallyRecentIcons: ShapeType[],
    iconsUsedInCurrentGenerationCycle: Set<ShapeType>
): CountingQuestion | null => {
    const prioritizedPool = getPrioritizedIconPool(baseUnlockedIcons, globallyRecentIcons);
    const candidateIconList = getCandidateIcons(prioritizedPool, iconsUsedInCurrentGenerationCycle, undefined, 1);

    if (candidateIconList.length === 0) {
      const fallbackCandidates = prioritizedPool.filter(icon => !existingSignatures.has(`count-${icon}`));
      if (fallbackCandidates.length === 0) return null; 
      candidateIconList.push(shuffleArray(fallbackCandidates)[0]);
    }
    
    const iconType = candidateIconList[0];
    if (!iconType) return null;


    const maxCount = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 10 : 20;
    const minCount = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 1 : (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 5 : 1) ;
    
    let count: number;
    let questionSignature: string;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; 

    do {
      count = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
      questionSignature = `count-${iconType}-${count}`;
      attempts++;
      if (attempts > MAX_ATTEMPTS && existingSignatures.has(questionSignature)) {
          break; 
      }
    } while (existingSignatures.has(questionSignature) && attempts <= MAX_ATTEMPTS);


    const shapes = Array(count).fill(iconType);
    const q: CountingQuestion = {
        id: generateId(), type: 'counting', mode: GameMode.COUNTING, difficulty: difficulty,
        shapes, iconType, answer: count,
        promptText: `Đếm số lượng ${iconType} trong hình:`
    };
    
    existingSignatures.add(`count-${iconType}`); 
    existingSignatures.add(questionSignature);   
    iconsUsedInCurrentGenerationCycle.add(iconType); 
    return q;
};
