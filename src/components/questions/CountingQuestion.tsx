

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CountingQuestion, ShapeType } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';
import CustomNumpad from '../shared/CustomNumpad';

const renderShapesForLayout = (shapes: ShapeType[]) => {
    const itemCount = shapes.length;
    const rows: ShapeType[][] = [];
    let itemFontSizeClass = '';
    let containerPaddingClass = ''; // For dynamic padding

    // Determine number of rows, font size, and padding based on item count
    if (itemCount <= 5) { // 1 row, largest icons, largest padding
        rows.push(shapes);
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.xxlarge;
        containerPaddingClass = 'p-4 md:p-6';
    } else if (itemCount <= 8) { // 1 row, large icons, large padding
        rows.push(shapes);
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.xlarge;
        containerPaddingClass = 'p-3 md:p-5';
    } else if (itemCount <= 12) { // 2 rows, medium icons, medium padding
        const half = Math.ceil(itemCount / 2);
        rows.push(shapes.slice(0, half));
        rows.push(shapes.slice(half));
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.large;
        containerPaddingClass = 'p-2 md:p-4';
    } else if (itemCount <= 15) { // 3 rows, small icons, smaller padding
        const third = Math.ceil(itemCount / 3);
        rows.push(shapes.slice(0, third));
        rows.push(shapes.slice(third, 2 * third));
        rows.push(shapes.slice(2 * third));
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.medium;
        containerPaddingClass = 'p-2 md:p-3';
    } else  { // 3 or 4 rows for > 15, smallest icons, smallest padding
        const fourth = Math.ceil(itemCount / (itemCount > 18 ? 4 : 3) ); // Use 4 rows if > 18, else 3
        for(let i=0; i < itemCount; i+=fourth) {
            rows.push(shapes.slice(i, i + fourth));
        }
        itemFontSizeClass = theme.fontSizes.countingShapeLayout.small;
        containerPaddingClass = 'p-1 md:p-2';
    }

    return (
        <div className={`mb-4 flex flex-col items-center justify-center ${containerPaddingClass} bg-sky-100 rounded-lg min-h-[140px] md:min-h-[160px] w-full max-w-lg transition-all duration-300 ease-in-out`}>
            {rows.map((rowEmojis, rowIndex) => (
                <div key={rowIndex} className={`flex flex-wrap items-center justify-center`}>
                    {rowEmojis.map((shape, itemIndex) => (
                        <span key={itemIndex} className={`${itemFontSizeClass} p-1 select-none`}>{shape}</span>
                    ))}
                </div>
            ))}
        </div>
    );
};

const CountingQuestionDisplay: React.FC<QuestionComponentProps<CountingQuestion>> = ({ question, onAnswer, disabled }) => {
  const { playSound } = useAudio();
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue('');
  }, [question.id]);

  const handleSubmit = useCallback(() => {
    if (disabled || inputValue.trim() === '') return;
    playSound('DECISION');
    onAnswer(inputValue);
  }, [disabled, inputValue, onAnswer, playSound]);

  const handleNumpadInput = useCallback((num: string) => {
    if (disabled) return;
    playSound('TYPE');
    setInputValue(prev => (prev.length < 2 ? prev + num : prev));
  }, [disabled, playSound]);

  const handleNumpadDelete = useCallback(() => {
    if (disabled) return;
    playSound('TYPE');
    setInputValue(prev => prev.slice(0, -1));
  }, [disabled, playSound]);

  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key >= '0' && event.key <= '9') {
        handleNumpadInput(event.key);
      } else if (event.key === 'Backspace') {
        handleNumpadDelete();
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleNumpadInput, handleNumpadDelete, handleSubmit]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center gap-y-4">
      <p className={`text-xl md:text-2xl font-semibold ${theme.colors.text.secondary} text-center`}>{question.promptText}</p>
      {renderShapesForLayout(question.shapes)}
      <div className={`${theme.inputs.answerDisplayBox} ${theme.fontSizes.mathAnswerDisplay}`}>
        {inputValue ? (
          <span className={theme.classes.mathUnknown}>{inputValue}</span>
        ) : (
          <span className="text-gray-400">?</span>
        )}
      </div>
      {!disabled && <CustomNumpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} onEnter={handleSubmit} />}
    </div>
  );
};

export default CountingQuestionDisplay;