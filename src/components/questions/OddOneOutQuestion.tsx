
import React from 'react';
import { OddOneOutQuestion } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';

const OddOneOutDisplay: React.FC<QuestionComponentProps<OddOneOutQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
  const { playSound } = useAudio();

  const handleOptionClick = (optionId: string) => {
    if (disabled) return;
    playSound('BUTTON_CLICK');
    onAnswer(optionId);
  };
  
  const numOptions = question.options.length;
  let gridColsClass = 'grid-cols-2 sm:grid-cols-4'; // Default for 4 options
  if (numOptions === 3) gridColsClass = 'grid-cols-3';
  else if (numOptions === 5) gridColsClass = 'grid-cols-3 sm:grid-cols-5';

  const answeredCorrectly = disabled && lastAnswer === question.correctAnswerId;

  return (
      <div className="flex flex-col items-center w-full">
          <p className={`text-xl md:text-2xl lg:text-3xl font-semibold ${theme.colors.text.secondary} mb-4 md:mb-6 text-center`}>{question.promptText}</p>
          <div className={`grid ${gridColsClass} gap-3 md:gap-4 w-full max-w-lg lg:max-w-xl`}>
              {question.options.map((option, index) => {
                  const isCorrect = option.id === question.correctAnswerId;
                  const wasSelectedIncorrectly = lastAnswer === option.id && !isCorrect;

                  return (
                      <button
                          key={option.id}
                          onClick={() => handleOptionClick(option.id)}
                          disabled={disabled}
                          className={`rounded-lg shadow-md font-semibold transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center p-2 min-h-[90px] md:min-h-[110px] aspect-square
                              ${isCorrect && disabled ? `${theme.buttons.optionCorrect} ring-4 ${theme.colors.border.answerCorrect}` : 
                               wasSelectedIncorrectly && disabled ? `${theme.buttons.optionIncorrect} ring-4 ${theme.colors.border.answerIncorrect}` :
                               `${theme.colors.bg.oddOneOutDefault} hover:bg-indigo-300 text-indigo-700`}`}
                           aria-label={`Lựa chọn ${index + 1}`}
                      >
                          <span className={theme.fontSizes.oddOneOutOption}>{option.emoji}</span>
                      </button>
                  );
              })}
          </div>
          
          {answeredCorrectly && question.explanation && (
               <div className="mt-4 w-full text-center max-w-lg lg:max-w-xl">
                  <p className={`text-base md:text-lg font-medium text-green-800 ${theme.colors.bg.feedbackPositive} p-3 rounded-lg shadow-inner`}>
                      ({question.explanation})
                  </p>
              </div>
          )}
      </div>
  );
};

export default OddOneOutDisplay;