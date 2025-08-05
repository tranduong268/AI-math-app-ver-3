// src/config/theme.ts

const theme = {
  // =================================================================
  // FONT SIZES
  // =================================================================
  fontSizes: {
    // ---- Question & Answer Elements ----
    mathOperand: 'text-5xl md:text-6xl lg:text-7xl',
    mathOperator: 'text-4xl md:text-5xl lg:text-6xl',
    mathAnswerDisplay: 'text-5xl md:text-6xl',
    mathMultipleChoiceOption: 'text-4xl md:text-5xl',
    
    comparisonOperatorButton: 'text-4xl md:text-5xl lg:text-6xl',
    comparisonAnswerBox: 'text-5xl md:text-6xl lg:text-7xl',
    
    countingShapeLayout: {
      small: 'text-2xl md:text-3xl', // > 15 items
      medium: 'text-3xl md:text-4xl', // <= 15 items
      large: 'text-4xl md:text-5xl', // <= 12 items
      xlarge: 'text-4xl md:text-5xl', // <= 8 items
      xxlarge: 'text-6xl md:text-7xl', // <= 5 items
    },

    numberRecOptionNumber: 'text-5xl md:text-6xl lg:text-7xl',
    numberRecOptionEmoji: {
      small: 'text-lg md:text-xl', // > 8 emojis
      medium: 'text-xl md:text-2xl', // <= 8
      large: 'text-2xl md:text-3xl', // <= 6
      xlarge: 'text-3xl md:text-4xl', // <= 4
      xxlarge: 'text-4xl md:text-5xl', // <= 2
    },
    
    matchingPairNumber: 'text-5xl md:text-6xl lg:text-7xl',
    matchingPairEmoji: {
        small: 'text-lg md:text-xl',
        medium: 'text-xl md:text-2xl',
        large: 'text-2xl md:text-3xl',
        xlarge: 'text-3xl md:text-4xl',
        xxlarge: 'text-5xl md:text-6xl',
    },

    sequenceNumber: 'text-4xl sm:text-5xl md:text-5xl',
    sequenceInput: 'text-4xl sm:text-5xl md:text-5xl',

    visualPatternOption: 'text-4xl md:text-5xl lg:text-6xl',
    visualPatternMatrixItem: 'text-4xl md:text-5xl',

    oddOneOutOption: 'text-4xl md:text-5xl lg:text-6xl',
    
    promptHighlightNumber: 'text-4xl md:text-5xl',

    // ---- Review Screen Elements ----
    reviewMathOperand: 'text-3xl md:text-4xl lg:text-5xl',
    reviewMathOperator: 'text-2xl md:text-3xl lg:text-4xl',
    reviewComparisonAnswer: 'text-4xl md:text-5xl lg:text-6xl',
    reviewCorrectAnswer: 'text-lg md:text-xl lg:text-2xl',
    reviewUserAnswer: 'text-lg md:text-xl lg:text-2xl',
    reviewOddOneOutAnswer: 'text-4xl',
    reviewPromptHighlightNumber: 'text-2xl md:text-3xl',

    // ---- General UI ----
    headerTitle: 'text-3xl md:text-4xl',
    headerSubtitle: 'text-lg md:text-xl',
    mainMenuTitle: 'text-xl md:text-2xl',
    mainMenuButton: 'text-base md:text-lg',
    mainMenuButtonEmoji: 'text-xl md:text-2xl',
    mainMenuStars: 'text-base md:text-lg',
    feedback: 'text-2xl md:text-3xl',
    gameHeaderTitle: 'text-lg sm:text-xl',
    gameHeaderStats: 'text-base sm:text-lg',
    endGameTitle: 'text-3xl md:text-4xl',
    endGameStats: 'text-xl md:text-2xl',
  },

  // =================================================================
  // COLORS (Text, Background, Border)
  // =================================================================
  colors: {
    text: {
      primary: 'text-gray-800',
      secondary: 'text-gray-700',
      light: 'text-gray-600',
      header: 'text-white',
      headerBrand: 'text-orange-300',
      headerWelcome: 'text-blue-100',
      accent: 'text-pink-600',
      positive: 'text-green-700',
      negative: 'text-red-700',
      operand: 'text-indigo-700',
      operator: 'text-pink-600',
      userInput: 'text-pink-600',
      comparisonAnswer: 'text-purple-600',
      stars: 'text-yellow-700',
      button: 'text-white',
      buttonSecondary: 'text-slate-700',
      buttonDanger: 'text-white',
      link: 'text-pink-500',
      modalTitle: 'text-red-700',
      unlockTitle: 'text-pink-700',
      promptHighlightNumber: 'text-red-600',
    },
    bg: {
      body: 'bg-sky-100',
      header: 'bg-sky-400',
      mainMenu: 'bg-white/80',
      gameScreen: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
      questionCard: 'bg-white',
      questionSubtle: 'bg-sky-50',
      feedbackPositive: 'bg-green-100',
      feedbackNegative: 'bg-red-100',
      stars: 'bg-yellow-100',
      progressBar: 'bg-pink-500',
      progressBarTrack: 'bg-gray-200',
      modalOverlay: 'bg-black/60',
      resetModal: 'bg-gradient-to-br from-red-200 via-rose-200 to-pink-200',
      unlockModal: 'bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400',
      sequenceTrainPrimary: 'bg-blue-400',
      sequenceTrainSecondary: 'bg-green-400',
      sequenceTrainBlank: 'bg-gray-200',
      sequenceStepsPrimary: 'bg-cyan-500',
      sequenceStepsSecondary: 'bg-teal-500',
      sequenceStepsBlank: 'bg-stone-200',
      sequenceFindErrorDefault: 'bg-sky-200',
      matchingPairDefault: 'bg-cyan-50',
      matchingPairSelected: 'bg-yellow-300',
      matchingPairMatched: 'bg-slate-300',
      oddOneOutDefault: 'bg-indigo-200',
      visualPatternMatrixBlank: 'bg-white/70',
      visualPatternMatrixCell: 'bg-white',
      visualPatternSequenceBg: 'bg-sky-100',
      retryButton: 'bg-blue-100 hover:bg-blue-200',
    },
    border: {
      default: 'border-gray-300',
      inputFocus: 'ring-pink-500',
      answerCorrect: 'ring-green-500',
      answerIncorrect: 'ring-red-500',
      optionSelected: 'ring-pink-500',
      sequenceItemActive: 'ring-pink-500',
      sequenceItemCorrected: 'ring-yellow-400',
      matchingPairSelected: 'ring-yellow-500',
      visualPatternMatrixBlank: 'border-pink-400',
      visualPatternMatrixCell: 'border-gray-200',
      svgLine: 'rgb(156 163 175)',
    },
  },
  
  // =================================================================
  // BUTTONS
  // =================================================================
  buttons: {
    base: 'font-bold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white py-3 px-10 text-xl',
    mainMenu: 'w-full py-3 px-4 md:py-4 md:px-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-150 ease-in-out flex items-center justify-center font-semibold',
    comparisonOperator: 'py-2 px-4 md:py-3 md:px-5 bg-sky-200 hover:bg-sky-300 text-sky-700',
    option: 'p-3 md:p-4 rounded-lg shadow-md font-semibold transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed min-h-[68px] md:min-h-[80px] flex items-center justify-center break-words whitespace-normal leading-tight',
    mathOption: 'p-4 rounded-lg shadow-md font-semibold transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed min-h-[70px] md:min-h-[90px] flex items-center justify-center break-words whitespace-normal leading-tight',
    optionCorrect: 'bg-green-300 text-green-700',
    optionIncorrect: 'bg-red-300 text-red-700',
    optionDefault: 'bg-sky-200 hover:bg-sky-300 text-sky-700',
    backToMenu: 'bg-white hover:bg-red-100 text-red-500 font-semibold py-1.5 px-2.5 rounded-md shadow-md transition-colors flex items-center shrink-0',
    retry: 'mt-2 text-sm text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded-md transition-colors',
  },

  // =================================================================
  // INPUTS
  // =================================================================
  inputs: {
    answerDisplayBox: 'w-16 h-16 md:w-20 md:h-20 rounded-lg shadow-inner bg-gray-100 flex items-center justify-center',
    sequenceItem: 'w-16 h-16 md:w-20 md:h-20 p-1',
  },

  // =================================================================
  // LAYOUT & SIZING
  // =================================================================
  sizing: {
    mainContainer: 'w-full max-w-4xl p-4 relative',
    mainMenuContainer: 'max-w-2xl',
    questionContainer: 'p-4 md:p-6 lg:p-8 my-4 rounded-lg shadow-lg text-center flex flex-col justify-around items-center',
    questionContainerMinHeight: 'min-h-[350px] md:min-h-[420px] lg:min-h-[480px]',
    matchingPairButton: 'w-28 h-28 md:w-32 lg:w-36 md:h-32 lg:h-36',
    matchingPairIconButton: 'w-32 h-32 md:w-36 lg:w-40 md:h-36 lg:h-40',
  },

  // =================================================================
  // SHARED CLASSES
  // =================================================================
  classes: {
    // A class for unknown slots in math questions for consistency
    mathUnknown: 'font-semibold text-pink-600',
  }
};

export { theme };