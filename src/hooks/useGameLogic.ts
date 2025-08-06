





import { useEffect, useCallback, useReducer, useRef } from 'react';
import { 
  GameMode, DifficultyLevel, Question, IncorrectAttempt, MatchingPairsQuestion, EndGameMessageInfo, 
  GameLogicState, GameLogicActions, ShapeType, NumberSequenceQuestion, VisualPatternQuestion, 
  NumberRecognitionOption, OddOneOutQuestion, MathQuestion, ComparisonQuestion, VisualPatternOption,
  PlayerPerformanceState, QuestionRequestType
} from '../../types';
import { useAudio } from '../contexts/AudioContext';
import { generateQuestionsForRound, generateSingleQuestion } from '../services/questionService';
import { NUM_QUESTIONS_PER_ROUND, POSITIVE_FEEDBACKS, ENCOURAGING_FEEDBACKS, NEXT_QUESTION_DELAY_MS, SLOW_NEXT_QUESTION_DELAY_MS, CONGRATS_MESSAGES, CONGRATS_ICONS, ENCOURAGE_TRY_AGAIN_MESSAGE, ENCOURAGE_TRY_AGAIN_ICONS, POSITIVE_FEEDBACK_EMOJIS, ENCOURAGING_FEEDBACK_EMOJIS, VISUAL_PATTERN_QUESTIONS_MAM, VISUAL_PATTERN_QUESTIONS_CHOI, ODD_ONE_OUT_QUESTIONS_MAM, ODD_ONE_OUT_QUESTIONS_CHOI, COMPREHENSIVE_CHALLENGE_QUESTIONS, COMPREHENSIVE_CHALLENGE_TIME_MAM, COMPREHENSIVE_CHALLENGE_TIME_CHOI } from '../../constants';
import { shuffleArray, questionContainsZero } from '../services/questionUtils';
import { GameReducerState, GameReducerAction } from '../../types';

declare var confetti: any;

interface UseGameLogicProps {
  mode: GameMode;
  difficulty: DifficultyLevel;
  unlockedSetIds: string[];
  masterUsedIcons: string[]; 
  onEndGame: (
    incorrectAttempts: IncorrectAttempt[],
    score: number,
    starsEarnedThisRound: number,
    numQuestionsInRound: number,
    iconsUsedInRound: string[], 
    timeTaken: number | null
  ) => void;
}

// =================================================================
// PURE HELPER FUNCTIONS
// =================================================================

const calculateStars = (score: number, totalQuestions: number): number => {
    if (totalQuestions === 0) return 0;
    const percentageScore = (score / totalQuestions) * 100;
    if (percentageScore >= 90) return 5;
    if (percentageScore >= 75) return 4;
    if (percentageScore >= 60) return 3;
    if (percentageScore >= 40) return 2;
    if (percentageScore >= 20) return 1;
    return 0;
};

const createEndGameMessage = (score: number, totalQuestions: number, isTimeUp: boolean, timeTaken: number | null): EndGameMessageInfo => {
    if (score >= totalQuestions * 0.7 && !isTimeUp) {
        return {
            text: CONGRATS_MESSAGES[Math.floor(Math.random() * CONGRATS_MESSAGES.length)],
            type: 'congrats',
            icons: shuffleArray([...POSITIVE_FEEDBACK_EMOJIS, ...CONGRATS_ICONS]).slice(0, 3),
            timeTaken
        };
    } else {
        return {
            text: isTimeUp ? "Hết giờ rồi! Cố gắng hơn lần sau nhé!" : ENCOURAGE_TRY_AGAIN_MESSAGE,
            type: 'encourage',
            icons: shuffleArray([...ENCOURAGING_FEEDBACK_EMOJIS]).slice(0, 3),
            timeTaken
        };
    }
};

const checkIsCorrect = (question: Question, userAnswer: string | number | string[] | boolean): boolean => {
    const userAnswerStr = Array.isArray(userAnswer) ? userAnswer.join(',') : userAnswer.toString();
    switch (question.type) {
        case 'math': {
            const cq = question as MathQuestion;
            if (cq.variant === 'true_false') return userAnswer === cq.answer;
            if (cq.variant === 'multiple_choice') {
                const selectedOption = cq.options.find(opt => opt.id === userAnswerStr);
                return selectedOption?.isCorrect || false;
            }
            return parseInt(userAnswerStr, 10) === cq.answer;
        }
        case 'comparison': {
            const cq = question as ComparisonQuestion;
            return cq.variant === 'true_false' ? userAnswer === cq.answer : userAnswerStr === cq.answer;
        }
        case 'counting':
            return parseInt(userAnswerStr) === question.answer;
        case 'number_recognition': {
            const selectedOption = question.options.find((opt: NumberRecognitionOption) => opt.id === userAnswerStr);
            return selectedOption?.isCorrect || false;
        }
        case 'visual_pattern': {
            const selectedOption = question.options.find((opt: VisualPatternOption) => opt.id === userAnswerStr);
            return selectedOption?.isCorrect || false;
        }
        case 'number_sequence': {
            const nsQ = question as NumberSequenceQuestion;
            if (nsQ.variant === 'fill_in_the_blanks') {
                const userAnswersArray = Array.isArray(userAnswer) ? userAnswer : [userAnswerStr];
                return userAnswersArray.every((ans, index) => parseInt(ans, 10) === nsQ.answers[index]);
            }
            if (nsQ.variant === 'find_and_fix_error') {
                try {
                    const userCorrections = JSON.parse(userAnswerStr) as Record<string, number>;
                    const correctErrors = nsQ.errors;
                    const userErrorIndices = Object.keys(userCorrections).map(Number).sort();
                    const correctErrorIndices = Object.keys(correctErrors).map(Number).sort();
                    return userErrorIndices.length === correctErrorIndices.length && userErrorIndices.length > 0 &&
                        correctErrorIndices.every(index => 
                            userCorrections[index] !== undefined && 
                            Number(userCorrections[index]) === correctErrors[index]
                        );
                } catch (e) { return false; }
            }
            if (nsQ.variant === 'sort_sequence') {
                const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.map(Number) : [];
                return JSON.stringify(userAnswersArray) === JSON.stringify(nsQ.fullSequence);
            }
            return false;
        }
        case 'odd_one_out':
            return userAnswerStr === question.correctAnswerId;
        case 'matching_pairs':
            return false;
        default:
            return false;
    }
};


// =================================================================
// INITIAL STATE & REDUCER
// =================================================================

const initialState: GameReducerState = {
    isLoading: true,
    isGeneratingNextQuestion: false,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    starsEarnedThisRound: 0,
    incorrectAttempts: [],
    feedbackMessage: null,
    feedbackType: null,
    isInputDisabled: false,
    lastSubmittedAnswer: null,
    currentMatchingQuestionState: null,
    showEndGameOverlay: false,
    showTimesUpOverlay: false,
    endGameMessageInfo: null,
    numQuestionsForRound: NUM_QUESTIONS_PER_ROUND,
    iconsUsedThisRound: new Set(),
    gameStatus: 'idle',
    timeLeft: null,
    totalTime: null,
    // Adaptive state
    playerState: PlayerPerformanceState.NEUTRAL,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    questionStartTime: 0,
    zerosUsed: 0,
};

const gameReducer = (state: GameReducerState, action: GameReducerAction): GameReducerState => {
    switch (action.type) {
        case 'INITIALIZE_GAME_START':
            return { ...initialState, isLoading: true };

        case 'INITIALIZE_GAME_SUCCESS': {
            const { questions, iconsUsed, numQuestions, timeLimit, gameStatus, zerosUsed } = action.payload;
            return {
                ...initialState,
                isLoading: false,
                questions,
                iconsUsedThisRound: iconsUsed,
                numQuestionsForRound: numQuestions,
                totalTime: timeLimit,
                timeLeft: timeLimit,
                gameStatus,
                currentMatchingQuestionState: questions.length > 0 && questions[0]?.type === 'matching_pairs' ? (questions[0] as MatchingPairsQuestion) : null,
                questionStartTime: Date.now(),
                zerosUsed: zerosUsed,
            };
        }

        case 'INITIALIZE_GAME_FAILURE':
            return { ...state, isLoading: false, questions: [] };

        case 'START_GAME':
            return { ...state, gameStatus: 'playing', questionStartTime: Date.now() };

        case 'TIMER_TICK':
            if (state.timeLeft !== null && state.timeLeft > 0) {
                return { ...state, timeLeft: state.timeLeft - 1 };
            }
            return state;

        case 'SET_LAST_ANSWER':
            return { ...state, lastSubmittedAnswer: action.payload.answer, isInputDisabled: true };

        case 'PROCESS_ANSWER': {
            const { isCorrect, answerTime, question, userAnswer, feedback } = action.payload;
            const newConsecutiveCorrect = isCorrect ? state.consecutiveCorrect + 1 : 0;
            const newConsecutiveIncorrect = isCorrect ? 0 : state.consecutiveIncorrect + 1;
            let newPlayerState = state.playerState;

            const FLOWING_THRESHOLD = 3;
            const STRUGGLING_THRESHOLD = 2;
            const FAST_ANSWER_MS = 5000; // 5 seconds
            const GUESSING_MS = 2000; // 2 seconds

            if (isCorrect) {
                if (newConsecutiveCorrect >= FLOWING_THRESHOLD && answerTime < FAST_ANSWER_MS) {
                    newPlayerState = PlayerPerformanceState.FLOWING;
                } else {
                    newPlayerState = PlayerPerformanceState.CONSOLIDATING;
                }
            } else { // Incorrect
                if (newConsecutiveIncorrect >= STRUGGLING_THRESHOLD) {
                    newPlayerState = PlayerPerformanceState.STRUGGLING;
                } else if (answerTime < GUESSING_MS) {
                    newPlayerState = PlayerPerformanceState.GUESSING;
                } else {
                    newPlayerState = PlayerPerformanceState.NEUTRAL;
                }
            }
            
            return {
                ...state,
                score: isCorrect ? state.score + 1 : state.score,
                incorrectAttempts: isCorrect ? state.incorrectAttempts : [...state.incorrectAttempts, { question, userAnswer }],
                feedbackMessage: feedback,
                feedbackType: isCorrect ? 'positive' : 'encouraging',
                consecutiveCorrect: newConsecutiveCorrect,
                consecutiveIncorrect: newConsecutiveIncorrect,
                playerState: newPlayerState,
            };
        }

        case 'FETCH_NEXT_QUESTION_START':
            return {
                ...state,
                isGeneratingNextQuestion: true,
                feedbackMessage: null,
                feedbackType: null,
                isInputDisabled: false,
                lastSubmittedAnswer: null,
            };

        case 'FETCH_NEXT_QUESTION_SUCCESS': {
            const { newQuestion, containsZero } = action.payload;
            return {
                ...state,
                isGeneratingNextQuestion: false,
                questions: [...state.questions, newQuestion],
                currentQuestionIndex: state.currentQuestionIndex + 1,
                zerosUsed: containsZero ? state.zerosUsed + 1 : state.zerosUsed,
                currentMatchingQuestionState: newQuestion?.type === 'matching_pairs' ? (newQuestion as MatchingPairsQuestion) : null,
                questionStartTime: Date.now(),
            };
        }

        case 'FETCH_NEXT_QUESTION_FAILURE':
             // If fetching fails, we end the game gracefully.
            return { ...state, isGeneratingNextQuestion: false, gameStatus: 'ended' };
            
        case 'PROCEED_TO_NEXT_QUESTION': { // For non-adaptive modes
            const nextIndex = state.currentQuestionIndex + 1;
            if (nextIndex >= state.questions.length) {
                return { ...state, gameStatus: 'ended' };
            }
            const nextQ = state.questions[nextIndex];
            return {
                ...state,
                currentQuestionIndex: nextIndex,
                currentMatchingQuestionState: nextQ?.type === 'matching_pairs' ? (nextQ as MatchingPairsQuestion) : null,
                feedbackMessage: null,
                feedbackType: null,
                isInputDisabled: false,
                lastSubmittedAnswer: null,
            };
        }

        case 'UPDATE_MATCHING_QUESTION':
            return { ...state, currentMatchingQuestionState: action.payload.newMatchingState };
        
        case 'SET_MATCHING_FEEDBACK':
            return { ...state, feedbackMessage: action.payload.message, feedbackType: action.payload.type, isInputDisabled: true };

        case 'CLEAR_FEEDBACK':
            return { ...state, feedbackMessage: null, feedbackType: null, isInputDisabled: false };

        case 'SHOW_TIMES_UP_OVERLAY':
            return { ...state, gameStatus: 'ended', showTimesUpOverlay: true };

        case 'HIDE_TIMES_UP_OVERLAY':
            return { ...state, showTimesUpOverlay: false };

        case 'SHOW_END_GAME_OVERLAY':
            return { ...state, gameStatus: 'ended', showEndGameOverlay: true, endGameMessageInfo: action.payload.messageInfo, starsEarnedThisRound: action.payload.stars };
        
        case 'CONFIRM_END_GAME':
             return { ...state, showEndGameOverlay: false };

        default:
            return state;
    }
};

// =================================================================
// THE HOOK
// =================================================================

const ADAPTIVE_MODES = [GameMode.ADDITION, GameMode.SUBTRACTION, GameMode.COMPARISON];

const useGameLogic = ({ mode, difficulty, unlockedSetIds, masterUsedIcons, onEndGame }: UseGameLogicProps): GameLogicState & GameLogicActions => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { playSound, playLowTimeWarning, stopLowTimeWarning, isMuted } = useAudio();
  const questionSignatures = useRef(new Set<string>());

  const { questions, currentQuestionIndex, score, incorrectAttempts, totalTime, timeLeft, gameStatus, numQuestionsForRound, starsEarnedThisRound, iconsUsedThisRound, endGameMessageInfo, playerState } = state;

  const isAdaptiveMode = ADAPTIVE_MODES.includes(mode);

  const determineNumQuestions = useCallback(() => {
    if (mode === GameMode.VISUAL_PATTERN) return difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? VISUAL_PATTERN_QUESTIONS_MAM : VISUAL_PATTERN_QUESTIONS_CHOI;
    if (mode === GameMode.ODD_ONE_OUT) return difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? ODD_ONE_OUT_QUESTIONS_MAM : ODD_ONE_OUT_QUESTIONS_CHOI;
    if (mode === GameMode.NUMBER_SEQUENCE) return difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? 10 : 15;
    if (mode === GameMode.COMPARISON && difficulty === DifficultyLevel.PRE_SCHOOL_CHOI && !isAdaptiveMode) return 25;
    if (mode === GameMode.COMPREHENSIVE_CHALLENGE) return COMPREHENSIVE_CHALLENGE_QUESTIONS;
    if (isAdaptiveMode) return 15; // Set a fixed length for adaptive rounds
    return NUM_QUESTIONS_PER_ROUND;
  }, [mode, difficulty, isAdaptiveMode]);
  
  const resetGameState = useCallback(async () => {
    dispatch({ type: 'INITIALIZE_GAME_START' });
    questionSignatures.current.clear();
    const questionsToGenerate = determineNumQuestions();
    let timeLimit: number | null = null;
    let initialGameStatus: 'countdown' | 'playing' = 'playing';

    if (mode === GameMode.COMPREHENSIVE_CHALLENGE) {
      timeLimit = difficulty === DifficultyLevel.PRE_SCHOOL_MAM ? COMPREHENSIVE_CHALLENGE_TIME_MAM : COMPREHENSIVE_CHALLENGE_TIME_CHOI;
      initialGameStatus = 'countdown';
    }

    try {
        const numToFetchInitially = isAdaptiveMode ? 1 : questionsToGenerate;
        const { questions: generatedQuestions, iconsUsedInRound, zerosGenerated } = await generateQuestionsForRound(
            mode, difficulty, unlockedSetIds, numToFetchInitially, masterUsedIcons, questionSignatures.current
        );

        if (generatedQuestions.length === 0) throw new Error("Question generation failed.");
        
        dispatch({
            type: 'INITIALIZE_GAME_SUCCESS',
            payload: {
                questions: generatedQuestions,
                iconsUsed: iconsUsedInRound,
                numQuestions: questionsToGenerate,
                timeLimit,
                gameStatus: initialGameStatus,
                zerosUsed: zerosGenerated,
            }
        });
    } catch (error) {
        console.error("Failed to initialize game state:", error);
        dispatch({ type: 'INITIALIZE_GAME_FAILURE' });
    }
  }, [mode, difficulty, unlockedSetIds, masterUsedIcons, determineNumQuestions, isAdaptiveMode]);

  useEffect(() => {
    resetGameState();
  }, [resetGameState]);


  const fetchAndSetNextQuestion = useCallback(async () => {
    dispatch({ type: 'FETCH_NEXT_QUESTION_START' });

    const isZeroLimitedMode = [GameMode.ADDITION, GameMode.SUBTRACTION, GameMode.COMPARISON].includes(mode);
    const ZERO_LIMIT = 2;

    let newQuestion: Question | null = null;
    let attempts = 0;
    const MAX_ATTEMPTS = 20; // Max attempts to find a valid (non-zero if needed) question

    // This is the robust "safe loop" to ensure the zero limit is respected.
    do {
        const allowZero = !isZeroLimitedMode || state.zerosUsed < ZERO_LIMIT;

        let requestType: QuestionRequestType = 'STANDARD';
        if (playerState === PlayerPerformanceState.FLOWING) requestType = 'CHALLENGE';
        if (playerState === PlayerPerformanceState.STRUGGLING) requestType = 'BOOSTER';
        const lastIncorrectQuestion = state.incorrectAttempts.length > 0 ? state.incorrectAttempts[state.incorrectAttempts.length-1].question : undefined;

        const candidateQuestion = await generateSingleQuestion(mode, difficulty, requestType, {
            failedQuestion: lastIncorrectQuestion,
            existingSignatures: questionSignatures.current,
            allowZero
        });
        
        if (candidateQuestion) {
            const hasZero = isZeroLimitedMode && questionContainsZero(candidateQuestion);
            // If the question has a zero, but we've already used up our quota, discard it.
            if (hasZero && state.zerosUsed >= ZERO_LIMIT) {
                newQuestion = null; // Invalid, will trigger a retry in the loop.
            } else {
                newQuestion = candidateQuestion; // Valid question.
            }
        } else {
            newQuestion = null; // Generation failed, will trigger a retry.
        }
        attempts++;
    } while (!newQuestion && attempts < MAX_ATTEMPTS);


    if (newQuestion) {
        const newQuestionHasZero = isZeroLimitedMode && questionContainsZero(newQuestion);
        dispatch({ type: 'FETCH_NEXT_QUESTION_SUCCESS', payload: { newQuestion, containsZero: newQuestionHasZero } });
    } else {
        console.warn("Failed to generate next adaptive question after multiple attempts, ending round.");
        dispatch({ type: 'FETCH_NEXT_QUESTION_FAILURE' });
    }
  }, [mode, difficulty, playerState, state.incorrectAttempts, state.zerosUsed]);


  const endGame = useCallback((isTimeUp: boolean = false) => {
    stopLowTimeWarning();
    // Prevent multiple endGame calls
    if (gameStatus === 'ended' && (state.showEndGameOverlay || state.showTimesUpOverlay)) {
        return;
    }

    const finalTimeTaken = isTimeUp ? totalTime : (totalTime !== null && timeLeft !== null) ? totalTime - timeLeft : null;
    const finalStars = calculateStars(score, numQuestionsForRound);
    const messageInfo = createEndGameMessage(score, numQuestionsForRound, isTimeUp, finalTimeTaken);

    const showSummary = () => {
        if (finalStars >= 4) playSound('ROUND_WIN');
        else if (finalStars > 0) playSound('ENCOURAGEMENT');
        if (score >= numQuestionsForRound * 0.8 && typeof confetti === 'function') {
            try { confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } }); } catch (e) { console.error("Confetti error:", e); }
        }
        dispatch({ type: 'SHOW_END_GAME_OVERLAY', payload: { messageInfo, stars: finalStars } });
    };

    if (isTimeUp) {
      playSound('TIMER_END');
      dispatch({ type: 'SHOW_TIMES_UP_OVERLAY' });
      setTimeout(() => {
        dispatch({ type: 'HIDE_TIMES_UP_OVERLAY' });
        showSummary();
      }, 2000);
    } else {
      showSummary();
    }
  }, [score, numQuestionsForRound, playSound, timeLeft, totalTime, stopLowTimeWarning, gameStatus, state.showEndGameOverlay, state.showTimesUpOverlay]);

  const goToNextQuestionAfterFeedback = useCallback(() => {
    if (state.isGeneratingNextQuestion) return; // Prevent multiple calls

    // End game if we've reached the target number of questions
    if (currentQuestionIndex >= numQuestionsForRound - 1) {
      endGame(false);
      return;
    }
    
    if(isAdaptiveMode) {
      fetchAndSetNextQuestion();
    } else {
      dispatch({ type: 'PROCEED_TO_NEXT_QUESTION' });
    }
  }, [currentQuestionIndex, numQuestionsForRound, isAdaptiveMode, fetchAndSetNextQuestion, state.isGeneratingNextQuestion, endGame]);

  useEffect(() => {
    if (gameStatus === 'playing' && timeLeft !== null && timeLeft > 0) {
      const timerId = setInterval(() => {
        dispatch({ type: 'TIMER_TICK' });
      }, 1000);
      return () => clearInterval(timerId);
    } else if (gameStatus === 'playing' && timeLeft === 0) {
      endGame(true);
    }
  }, [gameStatus, timeLeft, endGame]);
  
  // Effect to handle the end of the game when generation fails for adaptive modes
  useEffect(() => {
    if (gameStatus === 'ended' && !state.showEndGameOverlay && !state.showTimesUpOverlay) {
        endGame(false);
    }
  }, [gameStatus, state.showEndGameOverlay, state.showTimesUpOverlay, endGame]);


  useEffect(() => {
    const isLowTime = gameStatus === 'playing' && timeLeft !== null && timeLeft > 0 && timeLeft <= 15;
    if (isLowTime && !isMuted) {
      playLowTimeWarning();
    } else {
      stopLowTimeWarning();
    }
    return () => { stopLowTimeWarning(); };
  }, [gameStatus, timeLeft, isMuted, playLowTimeWarning, stopLowTimeWarning]);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
    playSound('ROCKET_WHOOSH');
  }, [playSound]);

  const currentQuestion = questions[currentQuestionIndex] || null;

  const submitAnswer = useCallback((userAnswer: string | number | string[] | boolean) => {
    if (state.isInputDisabled || !currentQuestion || currentQuestion.type === 'matching_pairs' || gameStatus !== 'playing') return;
    
    dispatch({ type: 'SET_LAST_ANSWER', payload: { answer: userAnswer } });
    const isCorrect = checkIsCorrect(currentQuestion, userAnswer);
    const answerTime = Date.now() - state.questionStartTime;

    dispatch({
        type: 'PROCESS_ANSWER',
        payload: {
            isCorrect,
            answerTime,
            question: currentQuestion,
            userAnswer,
            feedback: isCorrect
                ? POSITIVE_FEEDBACKS[Math.floor(Math.random() * POSITIVE_FEEDBACKS.length)]
                : ENCOURAGING_FEEDBACKS[Math.floor(Math.random() * ENCOURAGING_FEEDBACKS.length)],
        },
    });

    if (isCorrect) playSound('CORRECT_ANSWER');
    else playSound('WRONG_ANSWER');

    const delay = [GameMode.VISUAL_PATTERN, GameMode.ODD_ONE_OUT].includes(currentQuestion.mode) ? SLOW_NEXT_QUESTION_DELAY_MS : NEXT_QUESTION_DELAY_MS;
    setTimeout(() => {
        goToNextQuestionAfterFeedback();
    }, delay);
  }, [state.isInputDisabled, currentQuestion, gameStatus, playSound, state.questionStartTime, goToNextQuestionAfterFeedback]);

  const selectMatchingPairItem = useCallback((itemIdOrOutcome: string) => {
    if (!state.currentMatchingQuestionState || state.isInputDisabled || gameStatus !== 'playing') return;

    let currentQuestionState = state.currentMatchingQuestionState;
    let newItems = currentQuestionState.items.map(item =>
        item.id === itemIdOrOutcome ? { ...item, isSelected: !item.isSelected } : item
    );
    const selectedItems = newItems.filter(item => item.isSelected && !item.isMatched);

    if (selectedItems.length === 2) {
        dispatch({ type: 'SET_MATCHING_FEEDBACK', payload: { message: '', type: 'positive' } }); // Disables input
        const [first, second] = selectedItems;
        if (first.matchId === second.matchId && first.visualType !== second.visualType) {
            playSound('MATCHING_CONNECT');
            newItems = newItems.map(item =>
                item.matchId === first.matchId ? { ...item, isMatched: true, isSelected: false } :
                {...item, isSelected: false}
            );
            const updatedQuestionState = { ...currentQuestionState, items: newItems };
            dispatch({ type: 'UPDATE_MATCHING_QUESTION', payload: { newMatchingState: updatedQuestionState } });

            const allMatched = newItems.every(item => item.isMatched);
            if (allMatched) {
                dispatch({ type: 'PROCESS_ANSWER', payload: { isCorrect: true, answerTime: 9999, question: currentQuestionState, userAnswer: 'matched', feedback: POSITIVE_FEEDBACKS[Math.floor(Math.random() * POSITIVE_FEEDBACKS.length)] } });
                setTimeout(() => {
                    goToNextQuestionAfterFeedback();
                }, NEXT_QUESTION_DELAY_MS);
            } else {
                dispatch({ type: 'SET_MATCHING_FEEDBACK', payload: { message: POSITIVE_FEEDBACKS[Math.floor(Math.random() * POSITIVE_FEEDBACKS.length)], type: 'positive' } });
                 setTimeout(() => dispatch({ type: 'CLEAR_FEEDBACK' }), NEXT_QUESTION_DELAY_MS / 2);
            }
        } else {
            playSound('WRONG_ANSWER');
            dispatch({ type: 'SET_MATCHING_FEEDBACK', payload: { message: ENCOURAGING_FEEDBACKS[Math.floor(Math.random() * ENCOURAGING_FEEDBACKS.length)], type: 'encouraging' } });
            setTimeout(() => {
                const revertedState = { ...currentQuestionState, items: currentQuestionState.items.map(i => ({ ...i, isSelected: false })) };
                dispatch({ type: 'UPDATE_MATCHING_QUESTION', payload: { newMatchingState: revertedState } });
                dispatch({ type: 'CLEAR_FEEDBACK' });
            }, NEXT_QUESTION_DELAY_MS);
        }
    } else if (selectedItems.length <= 1) {
        dispatch({ type: 'UPDATE_MATCHING_QUESTION', payload: { newMatchingState: { ...currentQuestionState, items: newItems } } });
    }
  }, [state.currentMatchingQuestionState, state.isInputDisabled, gameStatus, playSound, goToNextQuestionAfterFeedback]);

  const confirmEndGameAndNavigate = useCallback(() => {
    dispatch({ type: 'CONFIRM_END_GAME' });
    onEndGame(incorrectAttempts, score, starsEarnedThisRound, numQuestionsForRound, Array.from(iconsUsedThisRound), endGameMessageInfo?.timeTaken ?? null);
  }, [onEndGame, incorrectAttempts, score, starsEarnedThisRound, numQuestionsForRound, iconsUsedThisRound, endGameMessageInfo]);
  
  const progressPercent = numQuestionsForRound > 0 ? ((currentQuestionIndex) / numQuestionsForRound) * 100 : 0;
  const gameModeTitle = mode as string;
  const incorrectAttemptsCount = incorrectAttempts.length;

  return {
    ...state,
    currentQuestion,
    incorrectAttemptsCount,
    progressPercent,
    gameModeTitle,
    // Actions
    submitAnswer,
    selectMatchingPairItem,
    confirmEndGameAndNavigate,
    goToNextQuestionAfterFeedback,
    startGame,
  };
};

export default useGameLogic;