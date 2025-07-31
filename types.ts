
export enum GameMode {
  ADDITION = 'PHÉP CỘNG (+)',
  SUBTRACTION = 'PHÉP TRỪ (-)',
  COMPARISON = 'SO SÁNH (<, >, =)',
  COUNTING = 'ĐẾM HÌNH',
  NUMBER_RECOGNITION = 'NHẬN BIẾT SỐ',
  MATCHING_PAIRS = 'TÌM CẶP TƯƠNG ỨNG',
  NUMBER_SEQUENCE = 'HOÀN THIỆN DÃY SỐ',
  VISUAL_PATTERN = 'TÌM QUY LUẬT HÌNH ẢNH',
  ODD_ONE_OUT = 'TÌM VẬT KHÁC BIỆT',
  COMPREHENSIVE_CHALLENGE = 'THỬ THÁCH TỔNG HỢP', // New timed mode
}

export enum DifficultyLevel {
  PRE_SCHOOL_MAM = 'Mầm (3-4 tuổi)', // Seedling
  PRE_SCHOOL_CHOI = 'Chồi (4-5 tuổi)', // Sprout
  // TODO: Add more levels for older kids later
}

// =================================================================
// ADAPTIVE MODE TYPES
// =================================================================
export enum PlayerPerformanceState {
  NEUTRAL = 'NEUTRAL', // Trạng thái bắt đầu hoặc sau một lỗi nhỏ
  FLOWING = 'FLOWING', // Trả lời đúng và nhanh, sẵn sàng cho thử thách
  CONSOLIDATING = 'CONSOLIDATING', // Đang củng cố, trả lời đúng nhưng chậm
  STRUGGLING = 'STRUGGLING', // Gặp khó khăn, sai nhiều lần
  GUESSING = 'GUESSING', // Đoán mò, trả lời sai và nhanh
}

export type QuestionRequestType = 'STANDARD' | 'CHALLENGE' | 'BOOSTER';

export interface QuestionGenerationContext {
  failedQuestion?: Question;
  existingSignatures: Set<string>;
  baseUnlockedIcons?: ShapeType[];
  globallyRecentIcons?: ShapeType[];
  iconsUsedInCurrentGenerationCycle?: Set<ShapeType>;
  usedIconsThisModeCycle?: Set<ShapeType>;
}


export interface BaseQuestion {
  id: string;
  mode: GameMode;
  difficulty: DifficultyLevel; // Add difficulty to all questions
  promptText: string; // Add promptText to all questions for dynamic AI prompts
}

export type MathQuestionUnknownSlot = 'operand1' | 'operand2' | 'result';

// =================================================================
// MATH QUESTION TYPES (NEW STRUCTURE)
// =================================================================
export interface BaseMathQuestion extends BaseQuestion {
  type: 'math';
  operator: '+' | '-';
}

export interface StandardMathQuestion extends BaseMathQuestion {
    variant: 'standard';
    operand1True: number;
    operand2True: number;
    resultTrue: number;
    unknownSlot: MathQuestionUnknownSlot;
    answer: number;
}

export interface BalancingEquationQuestion extends BaseMathQuestion {
    variant: 'balancing_equation';
    // e.g. 5 + 3 = 4 + ?
    operand1: number;
    operand2: number;
    operand3: number;
    answer: number; // The unknown value
}

export interface MultipleChoiceMathOption {
    id: string;
    value: number;
    isCorrect: boolean;
}

export interface MultipleChoiceMathQuestion extends BaseMathQuestion {
    variant: 'multiple_choice';
    operand1: number;
    operand2: number;
    options: MultipleChoiceMathOption[];
    answer: number; // The correct value
}

export interface TrueFalseMathQuestion extends BaseMathQuestion {
    variant: 'true_false';
    operand1: number;
    operand2: number;
    displayedResult: number; // The result shown to the user (can be wrong)
    answer: boolean; // true if the displayedResult is correct
}

export type MathQuestion = StandardMathQuestion | BalancingEquationQuestion | MultipleChoiceMathQuestion | TrueFalseMathQuestion;


// =================================================================
// COMPARISON QUESTION TYPES (NEW STRUCTURE)
// =================================================================
export interface BaseComparisonQuestion extends BaseQuestion {
  type: 'comparison';
}

export interface StandardComparisonQuestion extends BaseComparisonQuestion {
    variant: 'standard';
    number1: number;
    number2: number;
    answer: '<' | '>' | '=';
}

export interface ExpressionComparisonQuestion extends BaseComparisonQuestion {
    variant: 'expression_comparison';
    // e.g. 3 + 4 [?] 8
    expOperand1: number;
    expOperand2: number;
    expOperator: '+' | '-';
    compareTo: number;
    answer: '<' | '>' | '=';
}

export interface TrueFalseComparisonQuestion extends BaseComparisonQuestion {
    variant: 'true_false';
    number1: number;
    number2: number;
    displayedOperator: '<' | '>' | '=';
    answer: boolean;
}

export type ComparisonQuestion = StandardComparisonQuestion | ExpressionComparisonQuestion | TrueFalseComparisonQuestion;

export type ShapeType = string; // Emoji string

// New interface for rich icon data, to be used by OddOneOut and VisualPattern
export interface IconData {
  emoji: ShapeType;
  name: string; // Vietnamese name for explanations
  primaryCategory: 'animal' | 'plant' | 'food' | 'drink' | 'vehicle' | 'clothing' | 'tool' | 'household' | 'nature' | 'celestial' | 'activity' | 'technology' | 'toy' | 'instrument' | 'building' | 'misc' | 'shape_color';
  subCategory?: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'fish' | 'insect' | 'invertebrate' | 'fruit' | 'vegetable' | 'flower' | 'tree' | 'dish' | 'dessert' | 'furniture' | 'appliance' | 'land_vehicle' | 'water_vehicle' | 'air_vehicle' | 'sports_equipment' | 'school_supply' | 'shape' | 'toy' | 'technology';
  tertiaryCategory?: 'pet' | 'livestock' | 'wild_animal' | 'poultry';
  attributes: {
    color?: ('red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'brown' | 'black' | 'white' | 'gray' | 'multi_color')[];
    is_living_organism?: boolean;
    is_edible?: boolean;
    environment?: 'land' | 'water' | 'sky' | 'underwater' | 'indoor' | 'space';
    can_fly?: boolean;
    propulsion?: 'road' | 'rail';
    diet?: 'carnivore' | 'herbivore' | 'omnivore';
    is_real?: boolean;
    temperature?: 'hot' | 'cold';
    power_source?: 'electric' | 'manual';
    function?: 'write' | 'cut' | 'cook' | 'eat' | 'sit' | 'clean';
  }
}

export interface CountingQuestion extends BaseQuestion {
  type: 'counting';
  shapes: ShapeType[]; 
  iconType: ShapeType; 
  answer: number; 
}

// For Number Recognition
export interface NumberRecognitionOption {
  id: string;
  display: ShapeType[] | string; // Array of emojis for item groups, or a number string
  isCorrect: boolean;
}
export interface NumberRecognitionQuestion extends BaseQuestion {
  type: 'number_recognition';
  variant: 'number-to-items' | 'items-to-number'; // Type of recognition task
  targetNumber?: number; // For number-to-items
  targetItems?: ShapeType[]; // For items-to-number
  targetItemIcon?: ShapeType; // For items-to-number, to display the prompt "How many X?"
  options: NumberRecognitionOption[];
}

// For Matching Pairs
export interface MatchableItem {
  id: string; // Unique ID for this item on the board
  matchId: string; // ID used to find its pair
  display: string; // Emoji, number as string, or dots as string
  type: 'matching_pairs_element'; // General type for elements within a matching pairs question
  visualType: 'digit' | 'dots' | 'emoji_icon'; // Specific visual representation
  isMatched: boolean; // Has this item been successfully matched?
  isSelected: boolean; // Is this item currently selected by the user?
}
export interface MatchingPairsQuestion extends BaseQuestion {
  type: 'matching_pairs';
  items: MatchableItem[]; // All items to be displayed on the board, shuffled
}

// =================================================================
// NUMBER SEQUENCE QUESTION TYPES (NEW STRUCTURE)
// =================================================================
export type SequenceTheme = 'train' | 'steps' | 'default';

export interface NumberSequenceBase extends BaseQuestion {
  type: 'number_sequence';
  theme: SequenceTheme;
}

export interface FillInTheBlanksQuestion extends NumberSequenceBase {
  variant: 'fill_in_the_blanks';
  fullSequence: number[]; // The complete, correct sequence
  rule: {
    type: 'skip_counting';
    step: number; // e.g., 1, -1, 2
  };
  sequence: (number | null)[]; // Sequence with nulls for blanks
  answers: number[]; // Correct answers for the blanks, in order
}

export interface FindAndFixErrorQuestion extends NumberSequenceBase {
  variant: 'find_and_fix_error';
  fullSequence: number[]; // The complete, correct sequence
  rule: {
    type: 'skip_counting';
    step: number; // e.g., 1, -1, 2
  };
  sequenceWithErrors: number[]; // Sequence with incorrect numbers
  errors: Record<number, number>; // Map of incorrect index to its correct value, e.g., { 3: 4 }
}

export interface SortSequenceQuestion extends NumberSequenceBase {
  variant: 'sort_sequence';
  scrambledSequence: number[];
  fullSequence: number[]; // The sorted sequence is the answer
  sortOrder: 'asc' | 'desc'; // Explicitly define the sorting order
}

export type NumberSequenceQuestion = FillInTheBlanksQuestion | FindAndFixErrorQuestion | SortSequenceQuestion;

// For Visual Pattern
export interface VisualPatternOption {
  id: string;
  emoji: ShapeType;
  isCorrect: boolean;
}

export interface VisualPatternQuestion extends BaseQuestion {
  type: 'visual_pattern';
  displayedSequence: ShapeType[];
  options: VisualPatternOption[];
  explanation: string; // The logic behind the correct answer
}

// For Odd One Out
export interface OddOneOutOption {
  id: string;
  emoji: ShapeType;
}

export interface OddOneOutQuestion extends BaseQuestion {
  type: 'odd_one_out';
  options: OddOneOutOption[]; // All items displayed to the user
  correctAnswerId: string;    // The ID of the OddOneOutOption that is the correct answer
  explanation: string; // The logic behind the correct answer
}

export type Question = 
  | MathQuestion 
  | ComparisonQuestion 
  | CountingQuestion 
  | NumberRecognitionQuestion 
  | MatchingPairsQuestion 
  | NumberSequenceQuestion 
  | VisualPatternQuestion
  | OddOneOutQuestion; // Added OddOneOutQuestion

export interface IncorrectAttempt {
  question: Question; 
  userAnswer: string | number | string[] | boolean;
}

export interface StoredSession {
  id: string;
  timestamp: number;
  incorrectAttempts: IncorrectAttempt[];
  score: number;
  totalQuestions: number;
  difficulty?: DifficultyLevel; // Optionally store difficulty of the session
}

export interface EndGameMessageInfo {
  text: string;
  type: 'congrats' | 'encourage';
  icons: string[];
  timeTaken?: number | null; // Optional: for timed modes
}

export interface ImageSet {
  id: string;
  name: string;
  starsRequired: number;
  icons: ShapeType[];
}

// For useGameLogic hook - This is the PUBLIC API of the hook
export interface GameLogicState {
  questions: Question[];
  currentQuestion: Question | null;
  currentQuestionIndex: number;
  score: number;
  starsEarnedThisRound: number;
  incorrectAttempts: IncorrectAttempt[];
  incorrectAttemptsCount: number;
  feedbackMessage: string | null;
  feedbackType: 'positive' | 'encouraging' | null;
  isInputDisabled: boolean;
  lastSubmittedAnswer: string | number | string[] | boolean | null; 
  currentMatchingQuestionState: MatchingPairsQuestion | null;
  showTimesUpOverlay: boolean;
  showEndGameOverlay: boolean;
  endGameMessageInfo: EndGameMessageInfo | null;
  progressPercent: number;
  gameModeTitle: string;
  isLoading: boolean;
  isGeneratingNextQuestion: boolean;
  numQuestionsForRound: number; 
  // For timed mode
  gameStatus: 'idle' | 'countdown' | 'playing' | 'ended';
  timeLeft: number | null;
  totalTime: number | null;
}

// These are the internal types for the reducer within useGameLogic.
export interface GameReducerState {
  isLoading: boolean;
  isGeneratingNextQuestion: boolean; // For adaptive mode question fetching
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  starsEarnedThisRound: number;
  incorrectAttempts: IncorrectAttempt[];
  feedbackMessage: string | null;
  feedbackType: 'positive' | 'encouraging' | null;
  isInputDisabled: boolean;
  lastSubmittedAnswer: string | number | string[] | boolean | null;
  currentMatchingQuestionState: MatchingPairsQuestion | null;
  showEndGameOverlay: boolean;
  showTimesUpOverlay: boolean;
  endGameMessageInfo: EndGameMessageInfo | null;
  numQuestionsForRound: number;
  iconsUsedThisRound: Set<ShapeType>;
  // For timed mode
  gameStatus: 'idle' | 'countdown' | 'playing' | 'ended';
  timeLeft: number | null;
  totalTime: number | null;
  // For adaptive mode
  playerState: PlayerPerformanceState;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  questionStartTime: number; // timestamp
}

export type GameReducerAction =
  | { type: 'INITIALIZE_GAME_START' }
  | { type: 'INITIALIZE_GAME_SUCCESS'; payload: { questions: Question[]; iconsUsed: Set<ShapeType>; numQuestions: number; timeLimit: number | null; gameStatus: 'countdown' | 'playing' } }
  | { type: 'INITIALIZE_GAME_FAILURE' }
  | { type: 'START_GAME' }
  | { type: 'TIMER_TICK' }
  | { type: 'PROCESS_ANSWER'; payload: { isCorrect: boolean; answerTime: number; question: Question; userAnswer: string | number | string[] | boolean; feedback: string } }
  | { type: 'SET_LAST_ANSWER'; payload: { answer: string | number | string[] | boolean } }
  | { type: 'FETCH_NEXT_QUESTION_START' }
  | { type: 'FETCH_NEXT_QUESTION_SUCCESS'; payload: { newQuestion: Question } }
  | { type: 'FETCH_NEXT_QUESTION_FAILURE' }
  | { type: 'PROCEED_TO_NEXT_QUESTION' } // For non-adaptive modes
  | { type: 'UPDATE_MATCHING_QUESTION'; payload: { newMatchingState: MatchingPairsQuestion } }
  | { type: 'SET_MATCHING_FEEDBACK'; payload: { message: string, type: 'positive' | 'encouraging' } }
  | { type: 'CLEAR_FEEDBACK' }
  | { type: 'SHOW_TIMES_UP_OVERLAY' }
  | { type: 'HIDE_TIMES_UP_OVERLAY' }
  | { type: 'SHOW_END_GAME_OVERLAY'; payload: { messageInfo: EndGameMessageInfo; stars: number } }
  | { type: 'CONFIRM_END_GAME' };


export interface GameLogicActions {
  submitAnswer: (userAnswer: string | number | string[] | boolean) => void; 
  selectMatchingPairItem: (itemId: string) => void;
  confirmEndGameAndNavigate: () => void;
  goToNextQuestionAfterFeedback: () => void; 
  startGame: () => void; // To start the timer after countdown
}
