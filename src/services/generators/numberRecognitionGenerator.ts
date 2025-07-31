import { DifficultyLevel, NumberRecognitionQuestion, ShapeType, GameMode, NumberRecognitionOption } from '../../../types';
import { generateId, getPrioritizedIconPool, getCandidateIcons, shuffleArray } from '../questionUtils';

export const generateNumberRecognitionQuestion = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>,
    baseUnlockedIcons: ShapeType[],
    globallyRecentIcons: ShapeType[],
    iconsUsedInCurrentGenerationCycle: Set<ShapeType>, 
    usedIconsThisModeCycle: Set<ShapeType> 
): NumberRecognitionQuestion | null => {
    const signatureBase = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 'nr-m-' : 'nr-c-';
    const maxNum = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 10 : 20;
    const numOptions = 3;

    const prioritizedPool = getPrioritizedIconPool(baseUnlockedIcons, globallyRecentIcons);
    if (prioritizedPool.length === 0) return null;

    let variant: 'number-to-items' | 'items-to-number';
    let optionsArray: NumberRecognitionOption[];
    let correctAnswerValue: number;
    let promptText: string;
    let targetItemIconForPrompt: ShapeType | undefined;
    let questionSignaturePart: string;
    let chosenIconForQuestion: ShapeType | null = null;

    let attempts = 0;
    const MAX_MAIN_ATTEMPTS = 30;

    do {
        attempts++;
        if (attempts > MAX_MAIN_ATTEMPTS) return null;

        const candidateIconsForThisQTarget = getCandidateIcons(prioritizedPool, iconsUsedInCurrentGenerationCycle, usedIconsThisModeCycle, 1);
        if (candidateIconsForThisQTarget.length === 0) {
          chosenIconForQuestion = null; // Ensure it's reset if no icon found this iteration
          continue; 
        }
        chosenIconForQuestion = candidateIconsForThisQTarget[0];
        
        variant = Math.random() < 0.5 ? 'number-to-items' : 'items-to-number';
        optionsArray = [];
        promptText = '';
        targetItemIconForPrompt = undefined;

        if (variant === 'number-to-items') {
            correctAnswerValue = Math.floor(Math.random() * maxNum) + 1;
            promptText = `Tìm nhóm có ${correctAnswerValue} ${chosenIconForQuestion}:`;
            optionsArray.push({ id: generateId(), display: Array(correctAnswerValue).fill(chosenIconForQuestion), isCorrect: true });
            questionSignaturePart = `n2i-${correctAnswerValue}-${chosenIconForQuestion}`;

            const distractorIconPool = getCandidateIcons(prioritizedPool, iconsUsedInCurrentGenerationCycle, new Set([chosenIconForQuestion]), prioritizedPool.length);

            while (optionsArray.length < numOptions) {
                let wrongCount = Math.floor(Math.random() * maxNum) + 1;
                // Check if this exact (count + icon) combo already exists as correct or another distractor
                if (optionsArray.some(opt => Array.isArray(opt.display) && opt.display.length === wrongCount && opt.display[0] === chosenIconForQuestion)) continue;
                
                let wrongOptionIcon = chosenIconForQuestion;
                 if (Math.random() < 0.3 && distractorIconPool.length > 0) {
                    const otherIconCandidates = distractorIconPool.filter(i => i !== chosenIconForQuestion);
                    if (otherIconCandidates.length > 0) wrongOptionIcon = otherIconCandidates[Math.floor(Math.random() * otherIconCandidates.length)];
                }
                optionsArray.push({ id: generateId(), display: Array(wrongCount).fill(wrongOptionIcon), isCorrect: false });
            }
        } else { // items-to-number
            targetItemIconForPrompt = chosenIconForQuestion;
            correctAnswerValue = Math.floor(Math.random() * maxNum) + 1;
            promptText = `Có bao nhiêu ${targetItemIconForPrompt} ở đây?`;
            optionsArray.push({ id: generateId(), display: correctAnswerValue.toString(), isCorrect: true });
            questionSignaturePart = `i2n-${correctAnswerValue}-${targetItemIconForPrompt}`;

            while (optionsArray.length < numOptions) {
                let wrongNum = Math.floor(Math.random() * maxNum) + 1;
                if (wrongNum === correctAnswerValue || optionsArray.some(opt => opt.display === wrongNum.toString())) continue;
                optionsArray.push({ id: generateId(), display: wrongNum.toString(), isCorrect: false });
            }
        }
    } while (!chosenIconForQuestion || existingSignatures.has(signatureBase + questionSignaturePart)); // Ensure chosenIconForQuestion is valid
    
    if (!chosenIconForQuestion) return null; 

    existingSignatures.add(signatureBase + questionSignaturePart);
    iconsUsedInCurrentGenerationCycle.add(chosenIconForQuestion);
    usedIconsThisModeCycle.add(chosenIconForQuestion);
    
    optionsArray.forEach(opt => {
        if(Array.isArray(opt.display)) {
            opt.display.forEach(icon => iconsUsedInCurrentGenerationCycle.add(icon));
        }
    });

    const q: NumberRecognitionQuestion = {
        id: generateId(), type: 'number_recognition', mode: GameMode.NUMBER_RECOGNITION, difficulty: difficulty,
        variant, promptText, options: shuffleArray(optionsArray),
        targetNumber: variant === 'number-to-items' ? correctAnswerValue : undefined,
        targetItems: variant === 'items-to-number' ? Array(correctAnswerValue).fill(targetItemIconForPrompt!) : undefined,
        targetItemIcon: variant === 'items-to-number' ? targetItemIconForPrompt : undefined,
    };
    return q;
};
