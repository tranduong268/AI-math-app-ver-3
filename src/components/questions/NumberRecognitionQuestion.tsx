
import React from 'react';
import { NumberRecognitionQuestion, ShapeType } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';

// This layout helper is specific to NumberRecognition and was also used by Counting.
// It's duplicated here to maintain component independence.
const renderTargetItemsForLayout = (items: ShapeType[]) => {
    const itemCount = items.length;
    const rows: ShapeType[][] = [];
    let itemFontSizeClass = '';
    
    if (itemCount <= 5) { 
        rows.push(items);
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.xxlarge;
    } else if (itemCount <= 8) { 
        rows.push(items);
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.xlarge;
    } else if (itemCount <= 12) { 
        const half = Math.ceil(itemCount / 2);
        rows.push(items.slice(0, half));
        rows.push(items.slice(half));
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.large;
    } else if (itemCount <= 15) { 
        const third = Math.ceil(itemCount / 3);
        rows.push(items.slice(0, third));
        rows.push(items.slice(third, 2 * third));
        rows.push(items.slice(2 * third));
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.medium;
    } else  { 
        const fourth = Math.ceil(itemCount / (itemCount > 18 ? 4 : 3) ); 
        for(let i=0; i < itemCount; i+=fourth) {
            rows.push(items.slice(i, i + fourth));
        }
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.small;
    }

    return (
        <div className={`mb-4 flex flex-col items-center p-2 md:p-3 bg-sky-100 rounded-lg min-h-[70px] md:min-h-[80px] w-full max-w-lg`}> 
            {rows.map((rowEmojis, rowIndex) => (
                <div key={rowIndex} className={`flex flex-wrap items-center justify-center`}>
                    {rowEmojis.map((item, itemIndex) => (
                        <span key={itemIndex} className={`${itemFontSizeClass} p-1 select-none`}>{item}</span>
                    ))}
                </div>
            ))}
        </div>
    );
};

const NumberRecognitionDisplay: React.FC<QuestionComponentProps<NumberRecognitionQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
  const { playSound } = useAudio();
  
  const handleOptionClick = (optionId: string) => {
    if (disabled) return;
    playSound('BUTTON_CLICK');
    onAnswer(optionId);
  };

  let promptContent: React.ReactNode = question.promptText;
  let promptSizeClass = "text-3xl md:text-4xl lg:text-5xl"; 

  if (question.variant === 'number-to-items' && question.targetNumber !== undefined) {
      const promptParts = question.promptText.split(new RegExp(`(${question.targetNumber}|${question.targetItemIcon})`));
      promptContent = promptParts.map((part, index) => {
          if (part === question.targetNumber?.toString() || part === question.targetItemIcon) {
              return <strong key={index} className="text-blue-600 font-bold">{part}</strong>;
          }
          return part;
      });
  } else if (question.variant === 'items-to-number') {
      promptSizeClass = "text-2xl md:text-3xl lg:text-4xl"; 
  }

  return (
      <div className="flex flex-col items-center w-full">
          <p className={`${promptSizeClass} font-semibold ${theme.colors.text.secondary} mb-3 text-center`}>{promptContent}</p>
          {question.variant === 'items-to-number' && question.targetItems && renderTargetItemsForLayout(question.targetItems)}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 lg:gap-5 mt-2 w-full max-w-lg"> 
              {question.options.map((option) => (
                  <button
                      key={option.id}
                      onClick={() => handleOptionClick(option.id)}
                      disabled={disabled}
                      className={`${theme.buttons.option}
                          ${disabled && option.isCorrect ? `${theme.buttons.optionCorrect} ring-4 ${theme.colors.border.answerCorrect}` : 
                           disabled && !option.isCorrect && lastAnswer === option.id ? `${theme.buttons.optionIncorrect} ring-4 ${theme.colors.border.answerIncorrect}` :
                           theme.buttons.optionDefault}
                           `}
                  >
                      {Array.isArray(option.display) ? 
                          (() => {
                              const emojiCount = option.display.length;
                              let contentFontSizeClass = '';
                              if (emojiCount <= 2) contentFontSizeClass = theme.fontSizes.numberRecOptionEmoji.xxlarge;
                              else if (emojiCount <= 4) contentFontSizeClass = theme.fontSizes.numberRecOptionEmoji.xlarge;
                              else if (emojiCount <= 6) contentFontSizeClass = theme.fontSizes.numberRecOptionEmoji.large;
                              else if (emojiCount <= 8) contentFontSizeClass = theme.fontSizes.numberRecOptionEmoji.medium;
                              else contentFontSizeClass = theme.fontSizes.numberRecOptionEmoji.small; 
                              return (
                                  <span className={`w-full h-full flex flex-wrap justify-center items-center leading-tight ${contentFontSizeClass}`}>
                                      {option.display.map((emoji, idx) => <span key={idx} className="p-0.5">{emoji}</span>)}
                                  </span>
                              );
                          })() : 
                          <span className={`${theme.fontSizes.numberRecOptionNumber} text-blue-600`}>{option.display}</span> 
                      }
                  </button>
              ))}
          </div>
      </div>
  );
};

export default NumberRecognitionDisplay;
