import React from 'react';
import { theme } from '../../config/theme';

interface AnswerDisplayProps {
  userAnswerDisplay: React.ReactNode;
  correctAnswerDisplay: React.ReactNode;
  isCorrectSimple: boolean;
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({ userAnswerDisplay, correctAnswerDisplay, isCorrectSimple }) => {
  return (
    <div className="mt-2 text-base md:text-lg lg:text-xl space-y-1">
        <p className="flex items-start sm:items-center">
            <span className={`mr-2 ${theme.colors.text.secondary} shrink-0`}>Bé trả lời:</span>
            <span className={`font-semibold ${theme.colors.text.negative} ${isCorrectSimple ? '' : 'line-through'}`}>
              {userAnswerDisplay}
            </span>
            <span className="ml-2 text-red-500 text-lg md:text-xl shrink-0">❌</span> 
        </p>
        <p className="flex items-start sm:items-center">
            <span className={`mr-2 ${theme.colors.text.secondary} shrink-0`}>Đáp án đúng:</span>
            {correctAnswerDisplay}
            <span className="ml-2 text-green-600 text-lg md:text-xl shrink-0">✅</span> 
        </p>
    </div>
  );
};

export default AnswerDisplay;
