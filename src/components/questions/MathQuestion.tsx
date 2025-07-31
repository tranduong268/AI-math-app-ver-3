
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MathQuestion, StandardMathQuestion, BalancingEquationQuestion, MultipleChoiceMathQuestion, TrueFalseMathQuestion } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';
import CustomNumpad from '../shared/CustomNumpad';
import TrueFalseButtons from '../shared/TrueFalseButtons';

// --- Standard Question Display (Fill in the blank) ---
const StandardMathDisplay: React.FC<QuestionComponentProps<StandardMathQuestion>> = ({ question, onAnswer, disabled }) => {
  const { playSound } = useAudio();
  const [inputValue, setInputValue] = useState('');
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue('');
    setIsActive(true); // Auto-focus on new question
  }, [question.id]);

  const handleSubmit = useCallback(() => {
    if (disabled || inputValue.trim() === '') return;
    playSound('DECISION');
    onAnswer(inputValue);
    setIsActive(false);
  }, [disabled, inputValue, onAnswer, playSound]);

  const handleNumpadInput = useCallback((num: string) => {
    if (disabled || !isActive) return;
    playSound('TYPE');
    setInputValue(prev => (prev.length < 2 ? prev + num : prev));
  }, [disabled, isActive, playSound]);

  const handleNumpadDelete = useCallback(() => {
    if (disabled || !isActive) return;
    playSound('TYPE');
    setInputValue(prev => prev.slice(0, -1));
  }, [disabled, isActive, playSound]);

  useEffect(() => {
    if (disabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isActive) return;
      if (event.key >= '0' && event.key <= '9') handleNumpadInput(event.key);
      else if (event.key === 'Backspace') handleNumpadDelete();
      else if (event.key === 'Enter') { event.preventDefault(); handleSubmit(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, disabled, handleNumpadInput, handleNumpadDelete, handleSubmit]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsActive(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const numClasses = `${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`;
  const operatorClasses = `${theme.fontSizes.mathOperator} font-semibold ${theme.colors.text.operator}`;

  const renderSlot = (value: number, type: 'operand1' | 'operand2' | 'result') => {
    if (type === question.unknownSlot) {
      return (
        <button onClick={() => setIsActive(true)} disabled={disabled} className={`${theme.inputs.answerDisplayBox} ${theme.fontSizes.mathAnswerDisplay} ${isActive ? `ring-2 ${theme.colors.border.inputFocus}` : ''} ${disabled ? 'cursor-default' : 'cursor-pointer'}`}>
          {inputValue ? <span className={theme.classes.mathUnknown}>{inputValue}</span> : isActive ? <span className={`${theme.classes.mathUnknown} animate-pulse`}>?</span> : <span className="text-gray-400">?</span>}
        </button>
      );
    }
    return <span className={numClasses}>{value}</span>;
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center justify-center gap-y-12">
      <div className="flex items-center justify-center space-x-2 md:space-x-4 lg:space-x-6">
        {renderSlot(question.operand1True, 'operand1')}
        <span className={operatorClasses}>{question.operator}</span>
        {renderSlot(question.operand2True, 'operand2')}
        <span className={operatorClasses}>=</span>
        {renderSlot(question.resultTrue, 'result')}
      </div>
      {!disabled && <CustomNumpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} onEnter={handleSubmit} />}
    </div>
  );
};

// --- Balancing Equation Display ---
const BalancingEquationDisplay: React.FC<QuestionComponentProps<BalancingEquationQuestion>> = ({ question, onAnswer, disabled }) => {
    // This component can reuse the same input logic as the standard display
    const { playSound } = useAudio();
    const [inputValue, setInputValue] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setInputValue(''); }, [question.id]);
    const handleSubmit = useCallback(() => { if (!disabled && inputValue.trim() !== '') { playSound('DECISION'); onAnswer(inputValue); } }, [disabled, inputValue, onAnswer, playSound]);
    const handleNumpadInput = useCallback((num: string) => { if (!disabled) { playSound('TYPE'); setInputValue(prev => (prev.length < 2 ? prev + num : prev)); } }, [disabled, playSound]);
    const handleNumpadDelete = useCallback(() => { if (!disabled) { playSound('TYPE'); setInputValue(prev => prev.slice(0, -1)); } }, [disabled, playSound]);
    
    useEffect(() => {
        if (disabled) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key >= '0' && event.key <= '9') handleNumpadInput(event.key);
            else if (event.key === 'Backspace') handleNumpadDelete();
            else if (event.key === 'Enter') { event.preventDefault(); handleSubmit(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [disabled, handleNumpadInput, handleNumpadDelete, handleSubmit]);

    const numClasses = `${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`;
    const operatorClasses = `${theme.fontSizes.mathOperator} font-semibold ${theme.colors.text.operator}`;

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center gap-y-12">
            <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-2">⚖️ {question.promptText} ⚖️</p>
            <div className="flex items-center justify-center space-x-2 md:space-x-4 lg:space-x-6">
                <span className={numClasses}>{question.operand1}</span>
                <span className={operatorClasses}>{question.operator}</span>
                <span className={numClasses}>{question.operand2}</span>
                <span className={operatorClasses}>=</span>
                <span className={numClasses}>{question.operand3}</span>
                <span className={operatorClasses}>{question.operator}</span>
                <div className={`${theme.inputs.answerDisplayBox} ${theme.fontSizes.mathAnswerDisplay} ring-2 ${theme.colors.border.inputFocus}`}>
                    {inputValue ? <span className={theme.classes.mathUnknown}>{inputValue}</span> : <span className={`${theme.classes.mathUnknown} animate-pulse`}>?</span>}
                </div>
            </div>
            {!disabled && <CustomNumpad onInput={handleNumpadInput} onDelete={handleNumpadDelete} onEnter={handleSubmit} />}
        </div>
    );
};


// --- Multiple Choice Math Display ---
const MultipleChoiceMathDisplay: React.FC<QuestionComponentProps<MultipleChoiceMathQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
    const { playSound } = useAudio();

    const handleOptionClick = (optionId: string) => {
        if (disabled) return;
        playSound('BUTTON_CLICK');
        onAnswer(optionId);
    };

    const numClasses = `${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`;
    const operatorClasses = `${theme.fontSizes.mathOperator} font-semibold ${theme.colors.text.operator}`;

    return (
        <div className="w-full flex flex-col items-center justify-center gap-y-8 md:gap-y-10">
             <div className="flex items-center justify-center space-x-2 md:space-x-4 lg:space-x-6">
                <span className={numClasses}>{question.operand1}</span>
                <span className={operatorClasses}>{question.operator}</span>
                <span className={numClasses}>{question.operand2}</span>
                <span className={operatorClasses}>=</span>
                <span className={`${numClasses} ${theme.colors.text.promptHighlightNumber}`}>?</span>
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-md">
                {question.options.map(option => (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        disabled={disabled}
                        className={`${theme.buttons.base} ${theme.buttons.mathOption} ${theme.fontSizes.mathMultipleChoiceOption}
                            ${disabled && option.isCorrect ? `${theme.buttons.optionCorrect} ring-4 ${theme.colors.border.answerCorrect}` :
                             disabled && lastAnswer === option.id ? `${theme.buttons.optionIncorrect} ring-4 ${theme.colors.border.answerIncorrect}` :
                             theme.buttons.optionDefault}`}
                    >
                        {option.value}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- True/False Math Display ---
const TrueFalseMathDisplay: React.FC<QuestionComponentProps<TrueFalseMathQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
  const numClasses = `${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`;
  const operatorClasses = `${theme.fontSizes.mathOperator} font-semibold ${theme.colors.text.operator}`;

  return (
    <div className="w-full flex flex-col items-center justify-center gap-y-8 md:gap-y-10">
      <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-2">{question.promptText}</p>
      <div className="flex items-center justify-center space-x-2 md:space-x-4 lg:space-x-6">
        <span className={numClasses}>{question.operand1}</span>
        <span className={operatorClasses}>{question.operator}</span>
        <span className={numClasses}>{question.operand2}</span>
        <span className={operatorClasses}>=</span>
        <span className={`${numClasses} ${theme.colors.text.userInput}`}>{question.displayedResult}</span>
      </div>
      <TrueFalseButtons
        onAnswer={onAnswer}
        disabled={disabled}
        lastAnswer={lastAnswer}
        correctAnswer={question.answer}
      />
    </div>
  );
};

// --- Main Component ---
const MathQuestionDisplay: React.FC<QuestionComponentProps<MathQuestion>> = (props) => {
  switch (props.question.variant) {
    case 'standard':
      return <StandardMathDisplay {...props as QuestionComponentProps<StandardMathQuestion>} />;
    case 'balancing_equation':
      return <BalancingEquationDisplay {...props as QuestionComponentProps<BalancingEquationQuestion>} />;
    case 'multiple_choice':
        return <MultipleChoiceMathDisplay {...props as QuestionComponentProps<MultipleChoiceMathQuestion>} />;
    case 'true_false':
        return <TrueFalseMathDisplay {...props as QuestionComponentProps<TrueFalseMathQuestion>} />;
    default:
      return <div>Loại câu hỏi toán học không xác định.</div>;
  }
};

export default MathQuestionDisplay;