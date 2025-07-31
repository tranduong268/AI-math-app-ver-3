
import React, { useState, useEffect } from 'react';
import { GameMode, IncorrectAttempt, DifficultyLevel } from '../../types';
import useGameLogic from '../hooks/useGameLogic';
import QuestionDisplay from '../../components/QuestionDisplay'; // Corrected/Verified path
import FeedbackDisplay from '../../components/FeedbackDisplay'; // Corrected/Verified path
import ProgressBar from './ProgressBar';
import GameHeader from './game/GameHeader';
import EndGameOverlay from './game/EndGameOverlay';
import GameTimer from './game/GameTimer';
import TimesUpOverlay from './game/TimesUpOverlay';
import { useAudio } from '../contexts/AudioContext';
import { theme } from '../config/theme';

interface GameScreenProps {
  mode: GameMode;
  difficulty: DifficultyLevel;
  onEndGame: (
    incorrectAttempts: IncorrectAttempt[],
    score: number,
    starsEarnedThisRound: number,
    numQuestionsInRound: number,
    iconsUsedInRound: string[], // Added for icon tracking
    timeTaken: number | null,
  ) => void;
  onBackToMenu: () => void;
  unlockedSetIds: string[];
  masterUsedIcons: string[]; // New prop for long-term icon diversity
}

const CountdownOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    // Array to define each step of the countdown for easier management
    const countdownSteps = [
        { key: 'ready', text: 'Bé sẵn sàng chưa?', sound: 'ARE_YOU_READY', className: 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pop-scale whitespace-nowrap', duration: 3100 },
        { key: '3', text: '3', sound: 'COUNTDOWN_3', className: 'text-9xl md:text-[10rem] lg:text-[12rem] animate-zoom-in-out-fade [text-shadow:0_0_15px_#fff,0_0_25px_currentColor] text-yellow-400', duration: 1000 },
        { key: '2', text: '2', sound: 'COUNTDOWN_2', className: 'text-9xl md:text-[10rem] lg:text-[12rem] animate-zoom-in-out-fade [text-shadow:0_0_15px_#fff,0_0_25px_currentColor] text-orange-400', duration: 1000 },
        { key: '1', text: '1', sound: 'COUNTDOWN_1', className: 'text-9xl md:text-[10rem] lg:text-[12rem] animate-zoom-in-out-fade [text-shadow:0_0_15px_#fff,0_0_25px_currentColor] text-red-500', duration: 1000 },
        { key: 'go', text: 'Go!', sound: 'COUNTDOWN_GO', className: 'text-9xl md:text-[10rem] lg:text-[12rem] text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 animate-explode-and-glow', duration: 1200 },
    ];

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const { playSound } = useAudio();

    useEffect(() => {
        const step = countdownSteps[currentStepIndex];
        if (!step) return;

        // Play the sound for the current step. A small delay can help with reliability.
        const soundTimer = setTimeout(() => {
            playSound(step.sound as any);
        }, 50);

        // Set a timer to advance to the next step
        const stepTimer = setTimeout(() => {
            if (currentStepIndex < countdownSteps.length - 1) {
                setCurrentStepIndex(prevIndex => prevIndex + 1);
            } else {
                onComplete();
            }
        }, step.duration);

        return () => {
            clearTimeout(soundTimer);
            clearTimeout(stepTimer);
        };
    }, [currentStepIndex, onComplete, playSound]); // Dependency on currentStepIndex drives the sequence

    const currentStep = countdownSteps[currentStepIndex];

    if (!currentStep) return null;

    return (
        <div className="fixed inset-0 bg-sky-200/80 backdrop-blur-sm flex items-center justify-center z-[200] p-4">
            <p key={currentStep.key} className={`font-extrabold drop-shadow-lg ${currentStep.className}`}>
                {currentStep.text}
            </p>
        </div>
    );
};


const GameScreen: React.FC<GameScreenProps> = ({ mode, difficulty, onEndGame, onBackToMenu, unlockedSetIds, masterUsedIcons }) => {
  const {
    isLoading,
    isGeneratingNextQuestion,
    currentQuestion,
    currentQuestionIndex,
    score,
    starsEarnedThisRound,
    incorrectAttemptsCount,
    feedbackMessage,
    feedbackType,
    isInputDisabled,
    lastSubmittedAnswer,
    currentMatchingQuestionState,
    showEndGameOverlay,
    showTimesUpOverlay,
    endGameMessageInfo,
    progressPercent,
    gameModeTitle,
    numQuestionsForRound,
    gameStatus,
    timeLeft,
    totalTime,
    submitAnswer,
    selectMatchingPairItem,
    confirmEndGameAndNavigate,
    startGame,
  } = useGameLogic({ mode, difficulty, unlockedSetIds, masterUsedIcons, onEndGame });
  
  const isTimedMode = mode === GameMode.COMPREHENSIVE_CHALLENGE;

  if (isLoading) {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-xl text-gray-700 mb-4">Đang chuẩn bị câu hỏi cho bé...</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-500"></div>
      </div>
    );
  }

  // After loading, if there are still no questions, it means generation failed.
  if (!currentQuestion) {
    return (
      <div className="text-center p-8 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-2xl text-red-600 mb-3 font-bold">Rất tiếc, đã có lỗi!</p>
        <p className="text-lg text-gray-700 mb-6 text-center">
            Không thể tạo câu hỏi cho chế độ này. <br/>
            Bé hãy kiểm tra lại kết nối mạng và thử lại sau nhé.
        </p>
        <button
          onClick={onBackToMenu}
          className="mt-6 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
          aria-label="Về Menu Chính"
        >
          Về Menu Chính
        </button>
      </div>
    );
  }


  const questionForDisplay =
    currentQuestion.type === 'matching_pairs' && currentMatchingQuestionState
    ? currentMatchingQuestionState
    : currentQuestion;
    
  // The order of these checks is important.
  // The most transient overlay (TimesUp) should be checked first.
  if (showTimesUpOverlay) {
    return <TimesUpOverlay />;
  }

  if (showEndGameOverlay && endGameMessageInfo) {
    return (
      <EndGameOverlay
        endGameMessageInfo={endGameMessageInfo}
        score={score}
        starsEarnedThisRound={starsEarnedThisRound}
        totalQuestionsInRound={numQuestionsForRound}
        onConfirmEndGame={confirmEndGameAndNavigate}
      />
    );
  }
  
  if (isTimedMode && gameStatus === 'countdown') {
    return <CountdownOverlay onComplete={startGame} />;
  }

  return (
    <div className={`w-full max-w-6xl mx-auto ${theme.colors.bg.gameScreen} p-3 sm:p-4 md:p-6 rounded-2xl shadow-xl relative`}>
      {isGeneratingNextQuestion && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="text-purple-600 font-semibold">Đang tạo câu hỏi mới...</span>
          </div>
        </div>
      )}
      <GameHeader
        onBackToMenu={onBackToMenu}
        currentQuestionIndex={currentQuestionIndex}
        score={score}
        incorrectAttemptsCount={incorrectAttemptsCount}
        gameModeTitle={gameModeTitle}
        difficulty={difficulty}
        numQuestionsTotal={numQuestionsForRound}
      />
      
      {isTimedMode && timeLeft !== null && totalTime !== null ? (
        <GameTimer timeLeft={timeLeft} totalTime={totalTime} />
      ) : (
        <ProgressBar current={progressPercent} total={100} />
      )}


      <QuestionDisplay
        question={questionForDisplay}
        onAnswer={currentQuestion.type === 'matching_pairs' ? selectMatchingPairItem : submitAnswer}
        disabled={isInputDisabled || (isTimedMode && gameStatus !== 'playing')}
        lastAnswer={lastSubmittedAnswer}
      />

      {feedbackMessage && feedbackType && (
        <FeedbackDisplay message={feedbackMessage} type={feedbackType} />
      )}
    </div>
  );
};
export default GameScreen;
