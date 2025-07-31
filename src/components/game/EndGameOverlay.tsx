

import React from 'react';
import { EndGameMessageInfo } from '../../../types';
import { theme } from '../../config/theme';

interface EndGameOverlayProps {
  endGameMessageInfo: EndGameMessageInfo;
  score: number;
  starsEarnedThisRound: number;
  totalQuestionsInRound: number;
  onConfirmEndGame: () => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const EndGameOverlay: React.FC<EndGameOverlayProps> = ({
  endGameMessageInfo,
  score,
  starsEarnedThisRound,
  totalQuestionsInRound,
  onConfirmEndGame,
}) => {
  return (
    <div className={`fixed inset-0 ${theme.colors.bg.body}/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-pop-scale`}>
      <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-lg w-full">
        <div className="text-6xl md:text-8xl mb-4" role="img" aria-label="Feedback Emojis">
          {endGameMessageInfo.icons.join(' ')}
        </div>
        <h2 className={`${theme.fontSizes.endGameTitle} font-bold ${theme.colors.text.accent} mb-6`}>
          {endGameMessageInfo.text}
        </h2>
        <div className="space-y-1">
            <p className={`${theme.fontSizes.endGameStats} ${theme.colors.text.secondary}`}>
            Bé đạt được: <strong className="text-yellow-500">{score}</strong> / {totalQuestionsInRound} câu đúng
            </p>
            {endGameMessageInfo.timeTaken !== undefined && endGameMessageInfo.timeTaken !== null && (
                 <p className={`${theme.fontSizes.endGameStats} ${theme.colors.text.secondary}`}>
                    Thời gian: <strong className="text-blue-500">{formatTime(endGameMessageInfo.timeTaken)}</strong>
                 </p>
            )}
        </div>

        <p className={`${theme.fontSizes.endGameStats} text-yellow-600 mt-4 mb-6`}>
          ✨ +{starsEarnedThisRound} sao ✨
        </p>
        <button
          onClick={onConfirmEndGame}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg w-full"
        >
          Chơi Tiếp Nào!
        </button>
      </div>
    </div>
  );
};

export default EndGameOverlay;
