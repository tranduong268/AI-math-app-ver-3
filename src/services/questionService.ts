
// src/services/questionService.ts

import { GameMode, DifficultyLevel, Question, ShapeType, IconData, QuestionRequestType, QuestionGenerationContext } from '../../types';
import { getAllBaseUnlockedIcons, shuffleArray } from './questionUtils';
import { ICON_DATA } from '../data/iconData';

// Import individual question generators
import { generateAdditionQuestion, generateSubtractionQuestion } from './generators/mathQuestionGenerator';
import { generateComparisonQuestion, generateComparisonQuestionsForChoi } from './generators/comparisonQuestionGenerator';
import { generateCountingQuestion } from './generators/countingQuestionGenerator';
import { generateMatchingPairsQuestion } from './generators/matchingPairsGenerator';
import { generateNumberRecognitionQuestion } from './generators/numberRecognitionGenerator';
import { generateNumberSequenceQuestion } from './generators/numberSequenceGenerator';
// AI-based generators are now used for these modes
import { generateAiQuestionsBatch } from './aiService'; 
import { COMPREHENSIVE_CHALLENGE_QUESTIONS, ODD_ONE_OUT_PROMPTS, VISUAL_PATTERN_PROMPTS } from '../../constants';


// Function to get specific, underused icons to enforce diversity.
const getSeedIconsForBatch = (
    allIcons: IconData[],
    masterUsedIcons: ShapeType[],
    count: number
): IconData[] => {
    const masterUsedSet = new Set(masterUsedIcons);

    // Prioritize icons that have NEVER been used.
    const freshIcons = allIcons.filter(icon => !masterUsedSet.has(icon.emoji));
    
    if (freshIcons.length >= count) {
        return shuffleArray(freshIcons).slice(0, count);
    }

    // If not enough fresh icons, take all of them and fill the rest with the least recently used ones.
    const seededIcons = [...freshIcons];
    const usedIconsInOrder = masterUsedIcons.slice().reverse(); // Least recent are now at the start
    
    for (const usedEmoji of usedIconsInOrder) {
        if (seededIcons.length >= count) break;
        const iconData = allIcons.find(i => i.emoji === usedEmoji);
        // Ensure we don't add duplicates if freshIcons was populated
        if (iconData && !seededIcons.some(si => si.emoji === iconData.emoji)) {
            seededIcons.push(iconData);
        }
    }
    
    // Fallback if still not enough icons (e.g., very new player)
    if (seededIcons.length < count) {
        const remainingIcons = allIcons.filter(icon => !seededIcons.some(si => si.emoji === icon.emoji));
        seededIcons.push(...shuffleArray(remainingIcons).slice(0, count - seededIcons.length));
    }

    return shuffleArray(seededIcons);
};

export const generateSingleQuestion = async (
    mode: GameMode,
    difficulty: DifficultyLevel,
    requestType: QuestionRequestType = 'STANDARD',
    context: QuestionGenerationContext
): Promise<Question | null> => {
    let question: Question | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS_PER_QUESTION = 20;

    const {
        existingSignatures,
        baseUnlockedIcons = [],
        globallyRecentIcons = [],
        iconsUsedInCurrentGenerationCycle = new Set(),
        usedIconsThisModeCycle = new Set(),
        failedQuestion
    } = context;

    while (!question && attempts < MAX_ATTEMPTS_PER_QUESTION) {
        attempts++;
        switch (mode) {
          case GameMode.ADDITION:
            question = generateAdditionQuestion(difficulty, existingSignatures, requestType, failedQuestion);
            break;
          case GameMode.SUBTRACTION:
            question = generateSubtractionQuestion(difficulty, existingSignatures, requestType, failedQuestion);
            break;
          case GameMode.COMPARISON:
            question = generateComparisonQuestion(difficulty, existingSignatures, requestType, failedQuestion);
            break;
          case GameMode.COUNTING:
            question = generateCountingQuestion(difficulty, existingSignatures, baseUnlockedIcons, globallyRecentIcons, iconsUsedInCurrentGenerationCycle);
            break;
          case GameMode.NUMBER_RECOGNITION:
            question = generateNumberRecognitionQuestion(difficulty, existingSignatures, baseUnlockedIcons, globallyRecentIcons, iconsUsedInCurrentGenerationCycle, usedIconsThisModeCycle);
            break;
          case GameMode.MATCHING_PAIRS:
            question = generateMatchingPairsQuestion(difficulty, existingSignatures, baseUnlockedIcons, globallyRecentIcons, iconsUsedInCurrentGenerationCycle, usedIconsThisModeCycle);
            break;
          case GameMode.NUMBER_SEQUENCE:
            question = generateNumberSequenceQuestion(difficulty, existingSignatures);
            break;
          // AI modes are generated in batches, not adaptively for now.
          default:
            return null;
        }
    }
    return question;
};


export const generateQuestionsForRound = async (
  mode: GameMode,
  difficulty: DifficultyLevel,
  unlockedSetIds: string[],
  numQuestions: number,
  masterUsedIcons: ShapeType[],
  existingSignatures: Set<string>
): Promise<{ questions: Question[], iconsUsedInRound: Set<ShapeType> }> => {
  const iconsUsedInCurrentGenerationCycle = new Set<ShapeType>();
  
  // --- AI Mode Handling (Batch Generation with Icon Seeding) ---
  if (mode === GameMode.ODD_ONE_OUT || mode === GameMode.VISUAL_PATTERN) {
    const allUnlockedIconsData = getAllBaseUnlockedIcons(unlockedSetIds)
      .map(emoji => ICON_DATA.find(d => d.emoji === emoji))
      .filter((d): d is IconData => d !== undefined);
    
    const numSeedIcons = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 2 : 4;
    const seedIcons = getSeedIconsForBatch(allUnlockedIconsData, masterUsedIcons, numSeedIcons);

    const { questions: rawAiQuestions, iconsUsed } = await generateAiQuestionsBatch(
        mode,
        difficulty,
        numQuestions,
        shuffleArray(allUnlockedIconsData), 
        seedIcons 
    );
    
    const finalAiQuestions = rawAiQuestions.map(q => {
        let prompts: string[] = [];
        if (q.mode === GameMode.ODD_ONE_OUT) prompts = ODD_ONE_OUT_PROMPTS;
        else if (q.mode === GameMode.VISUAL_PATTERN) prompts = VISUAL_PATTERN_PROMPTS;

        if (prompts.length > 0) q.promptText = prompts[Math.floor(Math.random() * prompts.length)];
        return q;
    });

    iconsUsed.forEach(icon => iconsUsedInCurrentGenerationCycle.add(icon));
    return { questions: finalAiQuestions, iconsUsedInRound: iconsUsedInCurrentGenerationCycle };
  }

  // --- Standard & Adaptive Mode Handling (Loop-based Generation) ---
  const questions: Question[] = [];
  const allBaseIcons = getAllBaseUnlockedIcons(unlockedSetIds);
  const usedIconsThisModeCycle = new Set<ShapeType>();

  // Handle Comprehensive Challenge Mode separately (non-adaptive)
  if (mode === GameMode.COMPREHENSIVE_CHALLENGE) {
    const totalQuestions = COMPREHENSIVE_CHALLENGE_QUESTIONS;
    const numSeq = 3;
    const numComp = 4;
    const numSub = 4;
    const numAdd = totalQuestions - numSeq - numComp - numSub;

    const modesToGenerate = shuffleArray([
      ...Array(numAdd).fill(GameMode.ADDITION),
      ...Array(numSub).fill(GameMode.SUBTRACTION),
      ...Array(numComp).fill(GameMode.COMPARISON),
      ...Array(numSeq).fill(GameMode.NUMBER_SEQUENCE),
    ]);

    for (const gameMode of modesToGenerate) {
      const q = await generateSingleQuestion(gameMode, difficulty, 'STANDARD', { existingSignatures });
      if (q) questions.push(q);
    }
    return { questions, iconsUsedInRound: new Set() };
  }

  // Special handling for non-adaptive Comparison 'Choi' level to get a balanced set
  if (mode === GameMode.COMPARISON && difficulty === DifficultyLevel.PRE_SCHOOL_CHOI && numQuestions > 1) {
      const comparisonQuestions = generateComparisonQuestionsForChoi(difficulty, existingSignatures, numQuestions);
      return { questions: comparisonQuestions, iconsUsedInRound: new Set() };
  }

  for (let i = 0; i < numQuestions; i++) {
    const question = await generateSingleQuestion(mode, difficulty, 'STANDARD', { 
        existingSignatures,
        baseUnlockedIcons: allBaseIcons,
        globallyRecentIcons: masterUsedIcons,
        iconsUsedInCurrentGenerationCycle,
        usedIconsThisModeCycle
     });

    if (question) {
      questions.push(question);
    } else {
      console.warn(`Failed to generate a question for mode ${mode} at index ${i}. Round may be shorter than intended.`);
    }
  }

  return { questions, iconsUsedInRound: iconsUsedInCurrentGenerationCycle };
};
