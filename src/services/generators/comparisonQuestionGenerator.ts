

import { DifficultyLevel, ComparisonQuestion, GameMode, StandardComparisonQuestion, ExpressionComparisonQuestion, TrueFalseComparisonQuestion, QuestionRequestType, Question } from '../../../types';
import { generateId, shuffleArray } from '../questionUtils';

const getComparisonSignature = (parts: (number|string)[]): string => {
    // For addition expression comparisons, sort operands to treat 3+4 and 4+3 as the same signature.
    const expressionMatch = parts.join('vs').match(/exp-([\d]+)\+([\d]+)vs([\d]+)/);
    if(expressionMatch) {
        const nums = [parseInt(expressionMatch[1]), parseInt(expressionMatch[2])].sort((a, b) => a-b);
        return `exp-${nums[0]}+${nums[1]}vs${expressionMatch[3]}`;
    }

    const sortedParts = parts.filter(p => typeof p === 'number').sort((a,b) => (a as number) - (b as number));
    const nonNumericParts = parts.filter(p => typeof p !== 'number');
    return `comp-${[...nonNumericParts, ...sortedParts].join('vs')}`;
};

const generateStandardComparison = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>
): StandardComparisonQuestion | null => {
    let num1, num2, answer, q: StandardComparisonQuestion;
    let signature: string;
    let attempts = 0;

    do {
        attempts++;
        if (attempts > 50) return null;

        if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
            // ~15% chance to generate a two-digit vs one-digit question for variety.
            if (Math.random() < 0.15) {
                num1 = Math.floor(Math.random() * 11) + 10; // 10-20
                num2 = Math.floor(Math.random() * 9) + 1;   // 1-9
                // Randomly decide which number comes first
                if (Math.random() < 0.5) {
                    [num1, num2] = [num2, num1];
                }
            } else {
                // Main case: compare two close two-digit numbers.
                num1 = Math.floor(Math.random() * 11) + 10; // 10-20
                const maxDiff = 4; // Ensures numbers are close, e.g., 13 vs 15
                const offset = Math.floor(Math.random() * (maxDiff * 2 + 1)) - maxDiff; 
                num2 = num1 + offset;

                // Clamp to be within the 10-20 range.
                if (num2 < 10) num2 = 10;
                if (num2 > 20) num2 = 20;
            }
        } else { // Mầm logic (single digit)
            const maxRange = 10;
            num1 = Math.floor(Math.random() * maxRange) + 1;
            num2 = Math.floor(Math.random() * maxRange) + 1;
        }
        
        if (num1 < num2) answer = '<';
        else if (num1 > num2) answer = '>';
        else answer = '=';
        
        signature = getComparisonSignature([num1, num2]);

    } while (existingSignatures.has(signature));
    
    existingSignatures.add(signature);
    
    q = { 
        id: generateId(), type: 'comparison', variant: 'standard', mode: GameMode.COMPARISON, 
        difficulty: difficulty, number1: num1, number2: num2, answer: answer, 
        promptText: 'Chọn dấu thích hợp:' 
    };
    return q;
};


const generateExpressionComparison = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>
): ExpressionComparisonQuestion | null => {
    let expOp1, expOp2, expRes, compareTo, answer, q: ExpressionComparisonQuestion;
    let signature: string;
    let attempts = 0;
    const maxRange = 20;
    let expOperator: '+' | '-';

    do {
        attempts++;
        if (attempts > 50) return null;
        
        expOperator = Math.random() < 0.6 ? '+' : '-';
        
        if (expOperator === '+') {
            expRes = Math.floor(Math.random() * 8) + 11; // Result will be 11-18
            expOp1 = Math.floor(Math.random() * 9) + 2; // Operand 1 will be 2-10
            expOp2 = expRes - expOp1;
            if (expOp2 <= 0) continue; // Retry if op2 is not positive
        } else { // '-'
            expOp1 = Math.floor(Math.random() * 11) + 10; // 10-20
            expOp2 = Math.floor(Math.random() * (expOp1 - 2)) + 1;
            expRes = expOp1 - expOp2;
        }
        
        const offset = shuffleArray([-3, -2, -1, 0, 1, 2, 3])[0];
        compareTo = expRes + offset;
        if (compareTo < 0) compareTo = expRes + 1;

        if (expRes < compareTo) answer = '<';
        else if (expRes > compareTo) answer = '>';
        else answer = '=';
        
        signature = `exp-${expOp1}${expOperator}${expOp2}vs${compareTo}`;

    } while (existingSignatures.has(getComparisonSignature(['exp', expOp1, expOp2, compareTo])) || expRes > maxRange);

    existingSignatures.add(getComparisonSignature(['exp', expOp1, expOp2, compareTo]));
    
    q = { 
        id: generateId(), type: 'comparison', variant: 'expression_comparison', mode: GameMode.COMPARISON, 
        difficulty: difficulty, expOperand1: expOp1, expOperand2: expOp2, expOperator, 
        compareTo, answer, promptText: 'So sánh kết quả phép tính:' 
    };
    return q;
};

const generateTrueFalseComparison = (
    difficulty: DifficultyLevel,
    existingSignatures: Set<string>
): TrueFalseComparisonQuestion | null => {
    let num1, num2, displayedOperator, answer, signature;
    let attempts = 0;

    do {
        attempts++;
        if (attempts > 50) return null;

        if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
             if (Math.random() < 0.15) { // 15% chance for special case
                num1 = Math.floor(Math.random() * 11) + 10; // 10-20
                num2 = Math.floor(Math.random() * 9) + 1;   // 1-9
            } else { // Main case
                num1 = Math.floor(Math.random() * 11) + 10; // 10-20
                num2 = Math.floor(Math.random() * 11) + 10; // 10-20
            }
        } else { // Mầm
            const maxRange = 10;
            num1 = Math.floor(Math.random() * maxRange) + 1;
            num2 = Math.floor(Math.random() * maxRange) + 1;
        }

        const trueOperator = num1 < num2 ? '<' : num1 > num2 ? '>' : '=';

        if (Math.random() < 0.5) {
            displayedOperator = trueOperator;
            answer = true;
        } else {
            const otherOperators = (['<', '>', '='] as const).filter(op => op !== trueOperator);
            displayedOperator = shuffleArray(otherOperators)[0];
            answer = false;
        }

        signature = getComparisonSignature(['tf', num1, num2, displayedOperator]);
    } while (existingSignatures.has(signature));
    
    existingSignatures.add(signature);

    return {
        id: generateId(), type: 'comparison', variant: 'true_false', mode: GameMode.COMPARISON,
        difficulty: difficulty, number1: num1, number2: num2, displayedOperator, answer,
        promptText: 'Phép so sánh này Đúng hay Sai?'
    };
};


export const generateComparisonQuestion = (
    difficulty: DifficultyLevel, 
    existingSignatures: Set<string>,
    requestType: QuestionRequestType = 'STANDARD',
    failedQuestion?: Question
): ComparisonQuestion | null => {
    if (requestType === 'CHALLENGE' && difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
        return generateExpressionComparison(difficulty, existingSignatures);
    }
    
    if (requestType === 'BOOSTER') {
        return generateStandardComparison(difficulty, existingSignatures);
    }
    
    // Standard generation logic
    const variantProb = Math.random();
    if (difficulty === DifficultyLevel.PRE_SCHOOL_MAM) {
        if (variantProb < 0.75) return generateStandardComparison(difficulty, existingSignatures);
        return generateTrueFalseComparison(difficulty, existingSignatures);
    } else { // Chồi - Probabilities for adaptive mode (1 question at a time)
        if (variantProb < 0.10) {
            return generateExpressionComparison(difficulty, existingSignatures); // 10%
        }
        if (variantProb < 0.35) {
            return generateTrueFalseComparison(difficulty, existingSignatures); // 25%
        }
        return generateStandardComparison(difficulty, existingSignatures); // 65%
    }
};

/**
 * Generates a fixed, balanced set of comparison questions for the 'Choi' level.
 * This function avoids probability-based generation to ensure a consistent experience.
 */
export const generateComparisonQuestionsForChoi = (difficulty: DifficultyLevel, existingSignatures: Set<string>, count: number): ComparisonQuestion[] => {
    const questions: ComparisonQuestion[] = [];
    
    // Define strict counts for each question type to ensure balance
    const NUM_EXPRESSION_QUESTIONS = 3;
    const NUM_TRUE_FALSE_QUESTIONS = 5;

    // 1. Generate the fixed number of Expression Questions
    for (let i = 0; i < NUM_EXPRESSION_QUESTIONS; i++) {
        const q = generateExpressionComparison(difficulty, existingSignatures);
        if (q) {
            questions.push(q);
        }
    }
    
    // 2. Generate the fixed number of True/False Questions
    for (let i = 0; i < NUM_TRUE_FALSE_QUESTIONS; i++) {
        const q = generateTrueFalseComparison(difficulty, existingSignatures);
        if (q) {
            questions.push(q);
        }
    }

    // 3. Fill the rest of the round with Standard Comparison questions
    while(questions.length < count) {
        const q = generateStandardComparison(difficulty, existingSignatures);
        if(q) {
           questions.push(q);
        } else {
            // Safety break if the generator fails to produce a unique question
            break; 
        }
    }

    // Shuffle the final list to mix the question types randomly
    return shuffleArray(questions.slice(0, count));
}
