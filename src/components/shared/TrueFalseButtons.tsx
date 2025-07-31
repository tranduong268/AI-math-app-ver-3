import React from 'react';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';

interface TrueFalseButtonsProps {
  onAnswer: (answer: string | number | string[] | boolean) => void;
  disabled: boolean;
  lastAnswer?: any; // Can be boolean
  correctAnswer?: boolean; // The actual answer for highlighting
}

const TrueFalseButtons: React.FC<TrueFalseButtonsProps> = ({ onAnswer, disabled, lastAnswer, correctAnswer }) => {
  const { playSound } = useAudio();

  const handleClick = (value: boolean) => {
    if (disabled) return;
    playSound('BUTTON_CLICK');
    onAnswer(value);
  };

  const getButtonClasses = (value: boolean) => {
    if (disabled) {
      if (value === correctAnswer) {
        return `${theme.buttons.optionCorrect} ring-4 ${theme.colors.border.answerCorrect}`;
      }
      if (value === lastAnswer) {
        return `${theme.buttons.optionIncorrect} ring-4 ${theme.colors.border.answerIncorrect}`;
      }
    }
    return theme.buttons.optionDefault;
  };

  return (
    <div className="flex justify-center space-x-4 md:space-x-6 mt-6 md:mt-8 w-full max-w-sm">
      <button
        onClick={() => handleClick(true)}
        disabled={disabled}
        className={`${theme.buttons.base} ${theme.buttons.option} w-1/2 ${getButtonClasses(true)}`}
      >
        <span className="text-3xl md:text-4xl mr-2">✅</span> Đúng
      </button>
      <button
        onClick={() => handleClick(false)}
        disabled={disabled}
        className={`${theme.buttons.base} ${theme.buttons.option} w-1/2 ${getButtonClasses(false)}`}
      >
        <span className="text-3xl md:text-4xl mr-2">❌</span> Sai
      </button>
    </div>
  );
};

export default TrueFalseButtons;