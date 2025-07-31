
import React from 'react';
import { ComparisonQuestion, StandardComparisonQuestion, ExpressionComparisonQuestion, TrueFalseComparisonQuestion } from '../../../types';
import { useAudio } from '../../contexts/AudioContext';
import { theme } from '../../config/theme';
import { QuestionComponentProps } from './QuestionProps';
import TrueFalseButtons from '../shared/TrueFalseButtons';

// --- Standard Comparison Display (A vs B) ---
const StandardComparisonDisplay: React.FC<QuestionComponentProps<StandardComparisonQuestion>> = ({ question, lastAnswer, disabled }) => {
  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-3 lg:space-x-4">
      <span className={`${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`}>{question.number1}</span>
      <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border border-dashed border-gray-400 rounded-lg flex items-center justify-center ${theme.fontSizes.comparisonAnswerBox} font-bold ${theme.colors.text.comparisonAnswer}`}>
        {disabled && typeof lastAnswer === 'string' ? lastAnswer : null}
      </div>
      <span className={`${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`}>{question.number2}</span>
    </div>
  );
};

// --- Expression Comparison Display (A+B vs C) ---
const ExpressionComparisonDisplay: React.FC<QuestionComponentProps<ExpressionComparisonQuestion>> = ({ question, lastAnswer, disabled }) => {
  const expressionText = `${question.expOperand1} ${question.expOperator} ${question.expOperand2}`;
  
  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-3 lg:space-x-4">
      <div className={`py-2 px-3 md:px-4 rounded-lg bg-white shadow-inner ${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`}>
        {expressionText}
      </div>
      <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border border-dashed border-gray-400 rounded-lg flex items-center justify-center ${theme.fontSizes.comparisonAnswerBox} font-bold ${theme.colors.text.comparisonAnswer}`}>
        {disabled && typeof lastAnswer === 'string' ? lastAnswer : null}
      </div>
      <span className={`${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`}>{question.compareTo}</span>
    </div>
  );
};

// --- True/False Comparison Display ---
const TrueFalseDisplay: React.FC<QuestionComponentProps<TrueFalseComparisonQuestion>> = ({ question, onAnswer, disabled, lastAnswer }) => {
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <p className="text-xl md:text-2xl font-semibold text-gray-600 mb-4">{question.promptText}</p>
            <div className="flex items-center justify-center space-x-1 md:space-x-2 lg:space-x-4">
                <span className={`${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`}>{question.number1}</span>
                <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 border-0 bg-sky-100 rounded-lg flex items-center justify-center ${theme.fontSizes.comparisonAnswerBox} font-bold ${theme.colors.text.comparisonAnswer}`}>
                    {question.displayedOperator}
                </div>
                <span className={`${theme.fontSizes.mathOperand} font-bold ${theme.colors.text.operand}`}>{question.number2}</span>
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
const ComparisonQuestionDisplay: React.FC<QuestionComponentProps<ComparisonQuestion>> = (props) => {
  const { question, onAnswer, disabled, lastAnswer } = props;
  const { playSound } = useAudio();

  if (question.variant === 'true_false') {
    return <TrueFalseDisplay {...props as QuestionComponentProps<TrueFalseComparisonQuestion>} />;
  }

  // Logic for 'standard' and 'expression_comparison'
  const handleOperatorClick = (operator: '<' | '>' | '=') => {
    if (disabled) return;
    playSound('BUTTON_CLICK');
    onAnswer(operator);
  };
  
  const getButtonClass = (op: '<' | '>' | '=') => {
    if (disabled) {
        if (op === question.answer) return `ring-4 ${theme.colors.border.answerCorrect}`;
        if (op === lastAnswer) return `ring-4 ${theme.colors.border.answerIncorrect}`;
    }
    return '';
  };

  return (
    <div className='w-full flex flex-col items-center'>
      <div className={`${theme.colors.bg.questionSubtle} p-3 md:p-4 lg:p-5 rounded-lg shadow-sm w-full mb-4`}>
        {question.variant === 'standard' 
          ? <StandardComparisonDisplay {...props as QuestionComponentProps<StandardComparisonQuestion>} />
          : <ExpressionComparisonDisplay {...props as QuestionComponentProps<ExpressionComparisonQuestion>} />
        }
      </div>
      <div className="flex justify-center space-x-3 md:space-x-4 lg:space-x-5 mt-4 md:mt-6">
        {(['<', '>', '='] as Array<'<' | '>' | '='>).map((op) => (
          <button
            key={op}
            onClick={() => handleOperatorClick(op)}
            disabled={disabled}
            className={`${theme.buttons.base} ${theme.buttons.comparisonOperator} ${theme.fontSizes.comparisonOperatorButton} ${getButtonClass(op)}`}
          >
            {op}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ComparisonQuestionDisplay;
