

import { DifficultyLevel, NumberSequenceQuestion, GameMode, SequenceTheme, FillInTheBlanksQuestion, FindAndFixErrorQuestion, SortSequenceQuestion } from '../../../types';
import { generateId, shuffleArray } from '../questionUtils';

const generateRandomNumberSet = (difficulty: DifficultyLevel): number[] => {
    const count = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 4 : 5;
    const maxNum = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 10 : 20;
    const set = new Set<number>();
    while (set.size < count) {
        set.add(Math.floor(Math.random() * maxNum) + 1);
    }
    return Array.from(set);
};

const generateArithmeticSequence = (difficulty: DifficultyLevel, step: number): number[] => {
    const lengthOptions = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? [5, 6] : [6, 7];
    const length = shuffleArray(lengthOptions)[0];

    let startNum: number;
    const rangeMax = 20;

    if (step > 0) { // Ascending
        const limit = rangeMax - (length - 1) * step;
        startNum = Math.floor(Math.random() * (limit > 0 ? limit : 1)) + 1;
    } else { // Descending
        const minStart = 1 + (length - 1) * Math.abs(step);
        startNum = Math.floor(Math.random() * (rangeMax - minStart + 1)) + minStart;
    }
    
    return Array.from({ length }, (_, i) => startNum + i * step);
}


const generateFillBlanks = (
    difficulty: DifficultyLevel,
    fullSequence: number[],
): { sequence: (number | null)[], answers: number[] } => {
    const length = fullSequence.length;
    const numBlanksOptions = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? [1, 2] : [2, 3];
    const numBlanks = shuffleArray(numBlanksOptions)[0];
    
    const sequence = [...fullSequence] as (number | null)[];
    const answers: number[] = [];
    
    const blankIndices = new Set<number>();
    
    // For Mầm, blanks are less likely to be at the very ends
    const possibleIndices = Array.from({length}, (_, i) => i);
    if (difficulty === DifficultyLevel.PRE_SCHOOL_MAM) {
        if (Math.random() < 0.7 && possibleIndices.length > 2) possibleIndices.shift();
        if (Math.random() < 0.7 && possibleIndices.length > 2) possibleIndices.pop();
    }

    const shuffledPossible = shuffleArray(possibleIndices);
    for(let i = 0; i < numBlanks; i++) {
        if (shuffledPossible[i] !== undefined) {
            blankIndices.add(shuffledPossible[i]);
        }
    }

    const sortedBlankIndices = Array.from(blankIndices).sort((a,b) => a-b);
    sortedBlankIndices.forEach(index => {
        answers.push(sequence[index] as number);
        sequence[index] = null;
    });

    return { sequence, answers };
}

const generateFindErrors = (
    difficulty: DifficultyLevel,
    fullSequence: number[]
): { sequenceWithErrors: number[], errors: Record<number, number> } => {
    const length = fullSequence.length;
    const numErrorsOptions = [1, 2]; // Chồi can have 1 or 2 errors
    const numErrors = shuffleArray(numErrorsOptions)[0];

    const sequenceWithErrors = [...fullSequence];
    const errors: Record<number, number> = {};

    const errorIndices = new Set<number>();
    while(errorIndices.size < numErrors) {
        const newIndex = Math.floor(Math.random() * length);
        if (newIndex > 0 && newIndex < length - 1) { // Avoid first/last element for simplicity
             errorIndices.add(newIndex);
        }
    }

    errorIndices.forEach(index => {
        const correctValue = fullSequence[index];
        errors[index] = correctValue;
        
        let wrongValue;
        do {
            const offset = shuffleArray([-2, -1, 1, 2])[0];
            wrongValue = correctValue + offset;
        } while (wrongValue <= 0 || wrongValue === sequenceWithErrors[index - 1] || wrongValue === sequenceWithErrors[index + 1] || wrongValue === correctValue);
        
        sequenceWithErrors[index] = wrongValue;
    });

    return { sequenceWithErrors, errors };
}

export const generateNumberSequenceQuestion = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>
): NumberSequenceQuestion | null => {
    
    let signature: string;
    let question: NumberSequenceQuestion;
    const MAX_ATTEMPTS = 30;
    let attempts = 0;

    do {
        attempts++;
        if (attempts > MAX_ATTEMPTS) return null;

        let variant: 'fill_in_the_blanks' | 'find_and_fix_error' | 'sort_sequence';
        if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
            const variantProb = Math.random();
            if (variantProb < 0.45) variant = 'fill_in_the_blanks';
            else if (variantProb < 0.75) variant = 'sort_sequence';
            else variant = 'find_and_fix_error';
        } else {
            variant = 'fill_in_the_blanks';
        }

        const theme = shuffleArray<SequenceTheme>(['train', 'steps'])[0];
        const base = {
            id: generateId(),
            type: 'number_sequence' as const,
            mode: GameMode.NUMBER_SEQUENCE,
            difficulty,
            theme,
        };

        if (variant === 'sort_sequence') {
            const randomNumbers = generateRandomNumberSet(difficulty);
            const sortOrder = shuffleArray<'asc' | 'desc'>(['asc', 'desc'])[0];
            const fullSequence = [...randomNumbers].sort((a, b) => sortOrder === 'asc' ? a - b : b - a);
            let scrambledSequence = shuffleArray(randomNumbers);
            // Ensure it's actually scrambled
            if (JSON.stringify(scrambledSequence) === JSON.stringify(fullSequence)) {
                scrambledSequence = shuffleArray(randomNumbers);
            }
            const promptText = `Sắp xếp các số theo thứ tự ${sortOrder === 'asc' ? 'tăng dần (từ nhỏ đến lớn)' : 'giảm dần (từ lớn đến nhỏ)'}:`;
            
            question = {
                ...base,
                variant,
                scrambledSequence,
                fullSequence,
                sortOrder,
                promptText,
            };
            signature = `ns-sort-${randomNumbers.sort((a,b)=>a-b).join(',')}-${sortOrder}`;
        } else { // fill_in_the_blanks or find_and_fix_error (Arithmetic based)
            const possibleSteps = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? [1, -1] : [1, -1, 2];
            const step = shuffleArray(possibleSteps)[0];
            const fullSequence = generateArithmeticSequence(difficulty, step);

            if (variant === 'fill_in_the_blanks') {
                const { sequence, answers } = generateFillBlanks(difficulty, fullSequence);
                question = {
                    ...base,
                    variant,
                    fullSequence,
                    rule: { type: 'skip_counting' as const, step },
                    sequence,
                    answers,
                    promptText: "Hoàn thành dãy số sau:",
                };
                signature = `ns-fill-${fullSequence.join(',')}-${sequence.join(',')}`;
            } else { // find_and_fix_error
                const { sequenceWithErrors, errors } = generateFindErrors(difficulty, fullSequence);
                const numErrors = Object.keys(errors).length;
                question = {
                    ...base,
                    variant,
                    fullSequence,
                    rule: { type: 'skip_counting' as const, step },
                    sequenceWithErrors,
                    errors,
                    promptText: `Tìm và sửa ${numErrors} lỗi sai trong dãy số:`,
                };
                signature = `ns-fix-${fullSequence.join(',')}-${sequenceWithErrors.join(',')}`;
            }
        }
    } while(existingSignatures.has(signature));
    
    existingSignatures.add(signature);
    return question;
};
