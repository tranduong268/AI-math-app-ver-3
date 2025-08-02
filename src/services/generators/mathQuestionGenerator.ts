


import { DifficultyLevel, MathQuestion, MathQuestionUnknownSlot, GameMode, StandardMathQuestion, BalancingEquationQuestion, MultipleChoiceMathQuestion, MultipleChoiceMathOption, TrueFalseMathQuestion, QuestionRequestType, Question } from '../../../types';
import { generateId, shuffleArray } from '../questionUtils';

interface MathGenerationOptions {
    requestType?: QuestionRequestType;
    failedQuestion?: Question;
    allowZero?: boolean;
}

const generateStandardMathQuestion = (
    difficulty: DifficultyLevel, 
    operator: '+' | '-', 
    existingSignatures: Set<string>,
    options: MathGenerationOptions = {}
): StandardMathQuestion | null => {
    const { requestType = 'STANDARD', failedQuestion, allowZero = true } = options;
    let qData: { operand1True: number, operand2True: number, resultTrue: number, unknownSlot: MathQuestionUnknownSlot, answer: number };
    let signature: string;
    let attempts = 0;

    do {
        attempts++;
        if (attempts > 50) return null;

        let chosenSlot: MathQuestionUnknownSlot;

        if (requestType === 'BOOSTER') {
            chosenSlot = 'result'; // Booster questions are always the simplest form
        } else {
            const slotProb = Math.random();
            if (difficulty === DifficultyLevel.PRE_SCHOOL_MAM) {
                if (slotProb < 0.6) chosenSlot = 'result'; else if (slotProb < 0.8) chosenSlot = 'operand2'; else chosenSlot = 'operand1';
            } else { // Choi or Challenge
                 if (requestType === 'CHALLENGE') {
                    // Challenge questions are less likely to ask for the result
                    if (slotProb < 0.6) chosenSlot = 'operand2'; else chosenSlot = 'operand1';
                 } else {
                    if (slotProb < 0.4) chosenSlot = 'result'; else if (slotProb < 0.7) chosenSlot = 'operand2'; else chosenSlot = 'operand1';
                 }
            }
        }

        let o1t=0, o2t=0, resT=0, ans=0;

        if (operator === '+') {
            const minResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 11 : 2;
            const maxResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
            resT = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
            
            if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
                o1t = Math.floor(Math.random() * (resT - 4)) + 2; 
                o2t = resT - o1t;
            } else {
                 o1t = Math.floor(Math.random() * (resT - (allowZero ? 0 : 1) ));
                 o2t = resT - o1t;
            }

            if (chosenSlot === 'result') ans = resT;
            else if (chosenSlot === 'operand2') ans = o2t;
            else ans = o1t;
        } else { // operator '-'
            const minMinuend = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 11 : 1;
            const maxMinuend = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
            
            o1t = Math.floor(Math.random() * (maxMinuend - minMinuend + 1)) + minMinuend;
            
            if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
                 if (o1t < 4) o1t = Math.floor(Math.random() * (maxMinuend - 10)) + 10; 
                 o2t = Math.floor(Math.random() * (o1t - 3)) + 1;
            } else {
                o2t = Math.floor(Math.random() * (o1t - (allowZero ? -1 : 0)));
            }
            resT = o1t - o2t;

            if (chosenSlot === 'result') ans = resT;
            else if (chosenSlot === 'operand2') ans = o2t;
            else ans = o1t;
        }

        if (!allowZero && (o1t === 0 || o2t === 0 || resT === 0)) {
            signature = '';
            continue;
        }

        qData = { operand1True: o1t, operand2True: o2t, resultTrue: resT, unknownSlot: chosenSlot, answer: ans };
        
        // New robust signature generation
        let sigParts: (string | number)[];
        if (qData.unknownSlot === 'result') {
            const operands = operator === '+' ? [qData.operand1True, qData.operand2True].sort((a,b)=>a-b) : [qData.operand1True, qData.operand2True];
            sigParts = [...operands, 'q'];
        } else if (qData.unknownSlot === 'operand1') {
            sigParts = ['q', qData.operand2True, qData.resultTrue];
        } else { // operand2
            sigParts = [qData.operand1True, 'q', qData.resultTrue];
        }
        signature = `std-${operator}-${sigParts.join('-')}`;


    } while (existingSignatures.has(signature));

    existingSignatures.add(signature);
    return {
        id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
        difficulty: difficulty, operator: operator, promptText: 'Bé hãy điền số còn thiếu:',
        variant: 'standard', ...qData
    };
};

const generateBalancingEquation = (
    difficulty: DifficultyLevel, 
    operator: '+' | '-', 
    existingSignatures: Set<string>,
    allowZero: boolean
): BalancingEquationQuestion | null => {
    let o1, o2, o3, ans, signature: string;
    let attempts = 0;

    do {
        attempts++;
        if (attempts > 50) return null;

        if (operator === '+') {
            const total = Math.floor(Math.random() * 10) + 11; // Chồi: Total sum 11-20
            
            o1 = Math.floor(Math.random() * (total - 1)) + 1;
            o2 = total - o1;

            o3 = Math.floor(Math.random() * (total - 1)) + 1;
            ans = total - o3;
        } else { // SUBTRACTION LOGIC
            const result = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
            
            o1 = Math.floor(Math.random() * (20 - result)) + result;
            o2 = o1 - result;

            o3 = Math.floor(Math.random() * (20 - result)) + result;
            ans = o3 - result;
        }
        
        if (!allowZero && (o1 === 0 || o2 === 0 || o3 === 0 || ans === 0)) {
            signature = '';
            continue;
        }
        if(ans <= 0 || o1 === o3 || o2 === ans || o1 === ans || o2 === o3 || o2 <= 0) {
            signature = '';
            continue;
        }

        const leftResult = operator === '+' ? o1 + o2 : o1 - o2;
        signature = `bal-${operator}-${leftResult}-vs-${o3}`;

    } while (existingSignatures.has(signature));

    existingSignatures.add(signature);
    
    return {
        id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
        difficulty: difficulty, operator: operator, variant: 'balancing_equation',
        promptText: 'Làm cho hai bên cân bằng nào!',
        operand1: o1, operand2: o2, operand3: o3, answer: ans
    };
};

const generateMultipleChoiceMath = (
    difficulty: DifficultyLevel, 
    operator: '+' | '-', 
    existingSignatures: Set<string>,
    allowZero: boolean
): MultipleChoiceMathQuestion | null => {
    let o1, o2, ans, options: MultipleChoiceMathOption[];
    let signature: string;
    let attempts = 0;

    do {
        attempts++;
        if (attempts > 50) return null;

        const minResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 11 : (allowZero ? 0 : 1);
        const maxResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
        
        if (operator === '+') {
            const tempAns = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
            if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
                o1 = Math.floor(Math.random() * (tempAns - 3)) + 2;
            } else {
                 o1 = Math.floor(Math.random() * (tempAns + (allowZero ? 1 : 0)));
            }
            o2 = tempAns - o1;
            ans = tempAns;
        } else { // '-'
            o1 = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
            
            if (difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
                if (o1 < 3) o1 = Math.floor(Math.random() * (maxResult - 10)) + 10; 
                 o2 = Math.floor(Math.random() * (o1 - 2)) + 1;
            } else {
                o2 = Math.floor(Math.random() * (o1 + (allowZero ? 1 : 0)));
            }
            ans = o1 - o2;
        }

        if (!allowZero && (o1 === 0 || o2 === 0 || ans === 0)) {
            signature = '';
            continue;
        }

        const distractors = new Set<number>();
        while(distractors.size < 2) {
            const offset = shuffleArray([-2, -1, 1, 2])[0];
            const distractor = ans + offset;
            if (distractor >= 0 && distractor !== ans) {
                distractors.add(distractor);
            }
        }
        
        options = shuffleArray([
            { id: generateId(), value: ans, isCorrect: true },
            ...Array.from(distractors).map(d => ({ id: generateId(), value: d, isCorrect: false }))
        ]);
        
        const operands = operator === '+' ? [o1, o2].sort((a,b)=>a-b) : [o1, o2];
        signature = `mc-${operator}-${operands.join('-')}`;

    } while (existingSignatures.has(signature));
    
    existingSignatures.add(signature);
    
    return {
        id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
        difficulty: difficulty, operator: operator, variant: 'multiple_choice',
        promptText: 'Chọn đáp án đúng nhé:',
        operand1: o1, operand2: o2, answer: ans, options
    };
};

const generateTrueFalseMathQuestion = (
    difficulty: DifficultyLevel,
    operator: '+' | '-',
    existingSignatures: Set<string>,
    allowZero: boolean
): TrueFalseMathQuestion | null => {
    let o1, o2, trueResult, displayedResult, answer, signature;
    let attempts = 0;

    while (attempts < 50) {
        attempts++;
        
        const maxResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
        const minResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 5 : (allowZero ? 0 : 1);
        
        // Step 1: Generate valid operands
        if (operator === '+') {
            o1 = Math.floor(Math.random() * (maxResult / 2)) + (allowZero ? 0 : 1);
            o2 = Math.floor(Math.random() * (maxResult / 2)) + (allowZero ? 0 : 1);
            trueResult = o1 + o2;
            if (trueResult > maxResult || trueResult < minResult) continue;
        } else { // '-'
            o1 = Math.floor(Math.random() * (maxResult - minResult)) + minResult;
            if (!allowZero && o1 === 0) o1 = 1;
            o2 = Math.floor(Math.random() * (o1 + (allowZero ? 1 : 0)));
            trueResult = o1 - o2;
        }
        
        if (!allowZero && (o1 === 0 || o2 === 0 || trueResult === 0)) continue;

        // Step 2: Decide if it's a true or false statement and generate displayed result
        if (Math.random() < 0.5) {
            displayedResult = trueResult;
            answer = true;
        } else {
            let tempResult;
            do {
                const offset = shuffleArray([-2, -1, 1, 2])[0];
                tempResult = trueResult + offset;
            } while (tempResult < 0 || tempResult === trueResult);
            displayedResult = tempResult;
            answer = false;
        }
        
        // Step 3: Check for signature uniqueness
        const operands = operator === '+' ? [o1, o2].sort((a,b)=>a-b) : [o1, o2];
        signature = `tf-${operator}-${operands.join('-')}-vs-${displayedResult}`;

        if (!existingSignatures.has(signature)) {
            existingSignatures.add(signature);
            return {
                id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
                difficulty: difficulty, operator: operator, variant: 'true_false',
                promptText: 'Phép tính này Đúng hay Sai?',
                operand1: o1, operand2: o2, displayedResult, answer
            };
        }
    }
    
    return null; // Failed to generate a unique question
};


const generateQuestion = (
  difficulty: DifficultyLevel, 
  operator: '+' | '-',
  existingSignatures: Set<string>,
  options: MathGenerationOptions = {}
): MathQuestion | null => {
    const { requestType = 'STANDARD', allowZero = true } = options;

    if (requestType === 'CHALLENGE' && difficulty === DifficultyLevel.PRE_SCHOOL_CHOI) {
        return generateStandardMathQuestion(difficulty, operator, existingSignatures, options);
    }
    
    if (requestType === 'BOOSTER') {
        // Force a simple standard question for boosters
        return generateStandardMathQuestion(difficulty, operator, existingSignatures, options);
    }

    // Standard generation logic with varied probabilities
    const variantProb = Math.random();
    if (difficulty === DifficultyLevel.PRE_SCHOOL_MAM) {
        if (variantProb < 0.65) return generateStandardMathQuestion(difficulty, operator, existingSignatures, options);
        if (variantProb < 0.85) return generateMultipleChoiceMath(difficulty, operator, existingSignatures, allowZero);
        return generateTrueFalseMathQuestion(difficulty, operator, existingSignatures, allowZero);
    } else { // Chồi
        if (variantProb < 0.55) return generateStandardMathQuestion(difficulty, operator, existingSignatures, options);
        if (variantProb < 0.80) return generateMultipleChoiceMath(difficulty, operator, existingSignatures, allowZero);
        return generateTrueFalseMathQuestion(difficulty, operator, existingSignatures, allowZero);
    }
};

export const generateAdditionQuestion = (difficulty: DifficultyLevel, existingSignatures: Set<string>, options?: MathGenerationOptions): MathQuestion | null => {
    return generateQuestion(difficulty, '+', existingSignatures, options);
};

export const generateSubtractionQuestion = (difficulty: DifficultyLevel, existingSignatures: Set<string>, options?: MathGenerationOptions): MathQuestion | null => {
    return generateQuestion(difficulty, '-', existingSignatures, options);
};