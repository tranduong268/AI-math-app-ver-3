

import React from 'react';
import { DifficultyLevel } from '../../../types'; 
import { theme } from '../../config/theme';

interface GameHeaderProps {
  onBackToMenu: () => void;
  currentQuestionIndex: number;
  score: number;
  incorrectAttemptsCount: number;
  gameModeTitle: string;
  difficulty: DifficultyLevel;
  numQuestionsTotal: number; // New prop for total questions in this round
}

const GameHeader: React.FC<GameHeaderProps> = ({
  onBackToMenu,
  currentQuestionIndex,
  score,
  incorrectAttemptsCount,
  gameModeTitle,
  difficulty,
  numQuestionsTotal 
}) => {
  return (
    <div className="mb-3 px-1">
      {/* Row 1: Game Mode, Difficulty (left) and Menu button (right) */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-left flex-1 min-w-0 mr-2"> 
          <h2 className={`${theme.fontSizes.gameHeaderTitle} font-bold text-purple-700 leading-tight tracking-wide whitespace-nowrap`}>{gameModeTitle}</h2>
          <p className={`text-sm sm:text-base ${theme.colors.text.light} leading-tight`}>{difficulty}</p>
        </div>
        <button
          onClick={onBackToMenu}
          className={theme.buttons.backToMenu}
          aria-label="Về Menu Chính"
        >
          <span aria-hidden="true" className="mr-1 text-lg">&larr;</span>
          <span className="text-sm">Menu</span>
        </button>
      </div>

      {/* Row 2: Question Count (left), Score & Errors (right) */}
      <div className={`flex justify-between items-center ${theme.fontSizes.gameHeaderStats} font-semibold ${theme.colors.text.primary}`}> 
        {/* Left Aligned Item - Question Count */}
        <div className="whitespace-nowrap">
          <span>🎯Câu: <strong className="text-blue-600 font-bold">{currentQuestionIndex + 1}</strong>/{numQuestionsTotal}</span>
        </div>

        {/* Right Aligned Group: Score, Errors */}
        <div className="flex items-center gap-x-3 sm:gap-x-4"> 
          <span className="whitespace-nowrap">✅Đúng: <strong className={`${theme.colors.text.positive} font-bold`}>{score}</strong></span>
          <span className="whitespace-nowrap">❌Sai: <strong className={`${theme.colors.text.negative} font-bold`}>{incorrectAttemptsCount}</strong></span>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;