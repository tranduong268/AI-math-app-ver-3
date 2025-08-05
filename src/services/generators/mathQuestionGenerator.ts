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
    const { requestType = 'STANDARD', allowZero = true } = options;
    let attempts = 0;
    const MAX_ATTEMPTS = 50;

    while (attempts < MAX_ATTEMPTS) {
        attempts++;

        let chosenSlot: MathQuestionUnknownSlot;
        // Logic for determining the unknown slot based on difficulty and request type
        if (requestType === 'BOOSTER') {
            chosenSlot = 'result';
        } else {
            const slotProb = Math.random();
            if (difficulty === DifficultyLevel.PRE_SCHOOL_MAM) {
                if (slotProb < 0.6) chosenSlot = 'result'; else if (slotProb < 0.8) chosenSlot = 'operand2'; else chosenSlot = 'operand1';
            } else { // Choi or Challenge
                 if (requestType === 'CHALLENGE') {
                    if (slotProb < 0.6) chosenSlot = 'operand2'; else chosenSlot = 'operand1';
                 } else {
                    if (slotProb < 0.4) chosenSlot = 'result'; else if (slotProb < 0.7) chosenSlot = 'operand2'; else chosenSlot = 'operand1';
                 }
            }
        }

        let o1t = 0, o2t = 0, resT = 0, ans = 0;

        // Generate numbers based on operator and difficulty
        if (operator === '+') {
            const minResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 11 : (allowZero ? 0 : 2);
            const maxResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
            if (maxResult < minResult) continue; // Should not happen, but a safeguard
            resT = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;

            const minOperand = allowZero ? 0 : 1;
            const maxOperand = resT - minOperand;
            if (maxOperand < minOperand) continue; // Not possible to generate valid operands (e.g., resT=1 and !allowZero)

            o1t = Math.floor(Math.random() * (maxOperand - minOperand + 1)) + minOperand;
            o2t = resT - o1t;
        } else { // operator '-'
            const minMinuend = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 11 : (allowZero ? 0 : 1);
            const maxMinuend = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
            o1t = Math.floor(Math.random() * (maxMinuend - minMinuend + 1)) + minMinuend;
            
            const minSubtrahend = allowZero ? 0 : 1;
            const maxSubtrahend = o1t - minSubtrahend;
            if (maxSubtrahend < minSubtrahend) continue; // Not possible to make result >= minSubtrahend
            
            o2t = Math.floor(Math.random() * (maxSubtrahend - minSubtrahend + 1)) + minSubtrahend;
            resT = o1t - o2t;
        }

        if (chosenSlot === 'result') ans = resT;
        else if (chosenSlot === 'operand2') ans = o2t;
        else ans = o1t;

        // Final validation - this is a safeguard as the logic above should be correct
        if (!allowZero && (o1t === 0 || o2t === 0 || resT === 0)) {
            continue;
        }
        
        const qData = { operand1True: o1t, operand2True: o2t, resultTrue: resT, unknownSlot: chosenSlot, answer: ans };

        // Create and check signature for uniqueness
        let sigParts: (string | number)[];
        if (qData.unknownSlot === 'result') {
            const operands = operator === '+' ? [qData.operand1True, qData.operand2True].sort((a,b)=>a-b) : [qData.operand1True, qData.operand2True];
            sigParts = [...operands, 'q'];
        } else if (qData.unknownSlot === 'operand1') {
            sigParts = ['q', qData.operand2True, qData.resultTrue];
        } else { // operand2
            sigParts = [qData.operand1True, 'q', qData.resultTrue];
        }
        const signature = `std-${operator}-${sigParts.join('-')}`;

        if (!existingSignatures.has(signature)) {
            existingSignatures.add(signature);
            return {
                id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
                difficulty, operator, promptText: 'Bé hãy điền số còn thiếu:',
                variant: 'standard', ...qData
            };
        }
    }
    return null; // Failed to generate after many attempts
};


const generateBalancingEquation = (
    difficulty: DifficultyLevel,
    operator: '+' | '-',
    existingSignatures: Set<string>,
    allowZero: boolean
): BalancingEquationQuestion | null => {
    let attempts = 0;

    while (attempts < 50) {
        attempts++;
        let o1, o2, o3, ans;

        if (operator === '+') {
            const total = Math.floor(Math.random() * 10) + 11;
            o1 = Math.floor(Math.random() * (total - 2)) + 1; // Ensure o2 is at least 1, and o1 is at least 1
            o2 = total - o1;
            o3 = Math.floor(Math.random() * (total - 2)) + 1;
            ans = total - o3;
        } else { // SUBTRACTION
            const result = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
            o1 = Math.floor(Math.random() * (20 - result)) + result;
            o2 = o1 - result;
            o3 = Math.floor(Math.random() * (20 - result)) + result;
            ans = o3 - result;
        }
        
        // Validation
        if (!allowZero && (o1 === 0 || o2 === 0 || o3 === 0 || ans === 0)) continue;
        if (ans <= 0 || o2 <= 0 || o1 === o3) continue; // Avoid trivial or invalid questions

        // Signature and return
        const leftResult = operator === '+' ? o1 + o2 : o1 - o2;
        const signature = `bal-${operator}-${leftResult}-vs-${o3}`;

        if (!existingSignatures.has(signature)) {
            existingSignatures.add(signature);
            return {
                id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
                difficulty, operator, variant: 'balancing_equation',
                promptText: 'Làm cho hai bên cân bằng nào!',
                operand1: o1, operand2: o2, operand3: o3, answer: ans
            };
        }
    }
    return null;
};

const generateMultipleChoiceMath = (
    difficulty: DifficultyLevel,
    operator: '+' | '-',
    existingSignatures: Set<string>,
    allowZero: boolean
): MultipleChoiceMathQuestion | null => {
    let attempts = 0;

    while (attempts < 50) {
        attempts++;
        let o1, o2, ans;
        
        const minResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 11 : (allowZero ? 0 : 1);
        const maxResult = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
        
        if (operator === '+') {
            ans = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
            const minOperand = allowZero ? 0 : 1;
            const maxOperand = ans - minOperand;
            if (maxOperand < minOperand) continue;

            o1 = Math.floor(Math.random() * (maxOperand - minOperand + 1)) + minOperand;
            o2 = ans - o1;
        } else { // '-'
            o1 = Math.floor(Math.random() * (maxResult - minResult + 1)) + minResult;
            const minSubtrahend = allowZero ? 0 : 1;
            const maxSubtrahend = o1 - minSubtrahend;
            if (maxSubtrahend < minSubtrahend) continue;

            o2 = Math.floor(Math.random() * (maxSubtrahend - minSubtrahend + 1)) + minSubtrahend;
            ans = o1 - o2;
        }

        if (!allowZero && (o1 === 0 || o2 === 0 || ans === 0)) continue;

        const distractors = new Set<number>();
        while(distractors.size < 2) {
            const offset = shuffleArray([-2, -1, 1, 2])[0];
            const distractor = ans + offset;
            if (distractor >= (allowZero ? 0 : 1) && distractor !== ans) {
                distractors.add(distractor);
            }
        }
        
        const options = shuffleArray([
            { id: generateId(), value: ans, isCorrect: true },
            ...Array.from(distractors).map(d => ({ id: generateId(), value: d, isCorrect: false }))
        ]);
        
        const operands = operator === '+' ? [o1, o2].sort((a,b)=>a-b) : [o1, o2];
        const signature = `mc-${operator}-${operands.join('-')}`;

        if (!existingSignatures.has(signature)) {
            existingSignatures.add(signature);
            return {
                id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
                difficulty, operator, variant: 'multiple_choice',
                promptText: 'Chọn đáp án đúng nhé:',
                operand1: o1, operand2: o2, answer: ans, options
            };
        }
    }
    return null;
};

const generateTrueFalseMathQuestion = (
    difficulty: DifficultyLevel,
    operator: '+' | '-',
    existingSignatures: Set<string>,
    allowZero: boolean
): TrueFalseMathQuestion | null => {
    let attempts = 0;

    while (attempts < 50) {
        attempts++;
        let o1, o2, trueResult, displayedResult, answer;

        const minNum = allowZero ? 0 : 1;
        const maxNum = difficulty === DifficultyLevel.PRE_SCHOOL_CHOI ? 20 : 10;
        
        if (operator === '+') {
            o1 = Math.floor(Math.random() * ((maxNum / 2) - minNum + 1)) + minNum;
            o2 = Math.floor(Math.random() * ((maxNum / 2) - minNum + 1)) + minNum;
            trueResult = o1 + o2;
            if (trueResult > maxNum) continue;
        } else { // '-'
            o1 = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
            o2 = Math.floor(Math.random() * (o1 - minNum + 1)) + minNum;
            trueResult = o1 - o2;
        }
        
        if (!allowZero && (o1 === 0 || o2 === 0 || trueResult === 0)) continue;

        if (Math.random() < 0.5) {
            displayedResult = trueResult;
            answer = true;
        } else {
            do {
                const offset = shuffleArray([-2, -1, 1, 2])[0];
                displayedResult = trueResult + offset;
            } while (displayedResult < 0 || displayedResult === trueResult);
            answer = false;
        }
        
        const operands = operator === '+' ? [o1, o2].sort((a,b)=>a-b) : [o1, o2];
        const signature = `tf-${operator}-${operands.join('-')}-vs-${displayedResult}`;

        if (!existingSignatures.has(signature)) {
            existingSignatures.add(signature);
            return {
                id: generateId(), type: 'math', mode: operator === '+' ? GameMode.ADDITION : GameMode.SUBTRACTION,
                difficulty, operator, variant: 'true_false',
                promptText: 'Phép tính này Đúng hay Sai?',
                operand1: o1, operand2: o2, displayedResult, answer
            };
        }
    }
    return null;
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
        return generateStandardMathQuestion(difficulty, operator, existingSignatures, options);
    }

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
