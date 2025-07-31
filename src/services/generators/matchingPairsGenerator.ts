import { DifficultyLevel, MatchingPairsQuestion, ShapeType, GameMode, MatchableItem } from '../../../types';
import { generateId, getPrioritizedIconPool, getCandidateIcons, shuffleArray } from '../questionUtils';

export const generateMatchingPairsQuestion = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>,
    baseUnlockedIcons: ShapeType[],
    globallyRecentIcons: ShapeType[],
    iconsUsedInCurrentGenerationCycle: Set<ShapeType>,
    usedIconsThisModeCycle: Set<ShapeType> 
): MatchingPairsQuestion | null => {
    const numPairs = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 3 : 5;
    const maxNumValue = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 5 : 10;
    const signatureBase = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 'mp-m-' : 'mp-c-';
    const MAX_GENERATION_ATTEMPTS = 50;
    let generationAttempts = 0;

    let allItemsForQuestion: MatchableItem[] = [];
    let currentPairValuesAndIcons: { value: number, icon: string }[] = [];
    
    let questionNumbersSignaturePart = '';
    let questionIconsSignaturePart = '';


    const prioritizedPool = getPrioritizedIconPool(baseUnlockedIcons, globallyRecentIcons);
    if (prioritizedPool.length < numPairs) return null;


    do {
        generationAttempts++;
        if (generationAttempts > MAX_GENERATION_ATTEMPTS) return null;

        allItemsForQuestion = [];
        currentPairValuesAndIcons = [];
        const usedValuesThisQuestion = new Set<number>();
        
        const iconsForThisQuestionInstance = getCandidateIcons(prioritizedPool, iconsUsedInCurrentGenerationCycle, usedIconsThisModeCycle, numPairs);
        if (iconsForThisQuestionInstance.length < numPairs) {
            questionNumbersSignaturePart = ''; 
            questionIconsSignaturePart = '';
            continue; 
        }

        for (let i = 0; i < numPairs; i++) {
            let value: number;
            let valueAttempts = 0;
            do {
                value = Math.floor(Math.random() * maxNumValue) + 1;
                valueAttempts++;
            } while (usedValuesThisQuestion.has(value) && valueAttempts < (maxNumValue * 2));

            if (usedValuesThisQuestion.has(value)) { 
                currentPairValuesAndIcons = []; 
                break;
            }
            usedValuesThisQuestion.add(value);

            const iconForThisPair = iconsForThisQuestionInstance[i]; 
            currentPairValuesAndIcons.push({ value, icon: iconForThisPair });
        }

        if (currentPairValuesAndIcons.length !== numPairs) {
            questionNumbersSignaturePart = ''; 
            questionIconsSignaturePart = '';
            continue;
        }

        questionNumbersSignaturePart = currentPairValuesAndIcons.map(p => p.value).sort((a, b) => a - b).join('-');
        questionIconsSignaturePart = currentPairValuesAndIcons.map(p => p.icon).sort().join(',');
        
    } while (existingSignatures.has(signatureBase + questionNumbersSignaturePart + '-' + questionIconsSignaturePart));

    if (currentPairValuesAndIcons.length === numPairs) {
        existingSignatures.add(signatureBase + questionNumbersSignaturePart + '-' + questionIconsSignaturePart);
        const iconsActuallyUsedInThisQuestion: string[] = [];

        currentPairValuesAndIcons.forEach(pair => {
            iconsActuallyUsedInThisQuestion.push(pair.icon);
            const matchId = generateId();
            allItemsForQuestion.push({
                id: generateId(), matchId, display: pair.value.toString(),
                type: 'matching_pairs_element', visualType: 'digit',
                isMatched: false, isSelected: false
            });
            allItemsForQuestion.push({
                id: generateId(), matchId, display: Array(pair.value).fill(pair.icon).join(''),
                type: 'matching_pairs_element', visualType: 'emoji_icon',
                isMatched: false, isSelected: false
            });
        });
        
        iconsActuallyUsedInThisQuestion.forEach(icon => {
            iconsUsedInCurrentGenerationCycle.add(icon);
            usedIconsThisModeCycle.add(icon);
        });

        return {
            id: generateId(), type: 'matching_pairs', mode: GameMode.MATCHING_PAIRS, difficulty: difficulty,
            items: shuffleArray(allItemsForQuestion),
            promptText: "Nối các cặp tương ứng:"
        };
    }
    return null;
};
