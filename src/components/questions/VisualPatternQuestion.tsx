
import React from 'react';
import { VisualPatternQuestion } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';

const VisualPatternDisplay: React.FC<QuestionComponentProps<VisualPatternQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
  const { playSound } = useAudio();
  
  const handleOptionClick = (optionId: string) => {
    if (disabled) return;
    playSound('BUTTON_CLICK');
    onAnswer(optionId);
  };
  
  const correctOption = question.options.find(opt => opt.isCorrect);
  const answeredCorrectly = disabled && lastAnswer === correctOption?.id;

  return (
      <div className="flex flex-col items-center w-full">
          <p className={`text-xl md:text-2xl lg:text-3xl font-semibold ${theme.colors.text.secondary} mb-3 text-center`}>{question.promptText}</p>
          {/* Sequence Display */}
          <div className={`mb-4 flex flex-wrap items-center justify-center gap-2 md:gap-3 p-3 ${theme.colors.bg.visualPatternSequenceBg} rounded-lg min-h-[80px] w-full max-w-full overflow-x-auto`}>
              {question.displayedSequence.map((emoji, index) => (
                <span key={index} className={`${theme.fontSizes.visualPatternOption} p-1 select-none`}>{emoji}</span>
              ))}
              <span className="text-4xl md:text-5xl p-1 text-pink-500 font-bold select-none self-center">?</span>
          </div>

          {/* Options Display */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-2 w-full max-w-xl">
              {question.options.map((option) => (
                  <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      disabled={disabled}
                      className={`p-2 rounded-lg shadow-md font-semibold transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed min-h-[90px] md:min-h-[110px] flex items-center justify-center aspect-square
                          ${disabled && option.isCorrect ? `${theme.buttons.optionCorrect} ${theme.colors.border.answerCorrect}` : 
                           disabled && !option.isCorrect && lastAnswer === option.id ? `${theme.buttons.optionIncorrect} ${theme.colors.border.answerIncorrect}` :
                           theme.buttons.optionDefault}`}
                       aria-label={`Lựa chọn ${option.emoji}`}
                  >
                      <span className={theme.fontSizes.visualPatternOption}>{option.emoji}</span>
                  </button>
              ))}
          </div>

          {answeredCorrectly && question.explanation && (
               <div className="mt-4 w-full text-center max-w-xl">
                  <p className={`text-base md:text-lg font-medium text-green-800 ${theme.colors.bg.feedbackPositive} p-3 rounded-lg shadow-inner`}>
                      ({question.explanation})
                  </p>
              </div>
          )}
      </div>
  );
};

export default VisualPatternDisplay;