

import React from 'react';
import { MathQuestion, StandardMathQuestion, BalancingEquationQuestion, MultipleChoiceMathQuestion, TrueFalseMathQuestion } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';

const renderStandardReview = (attempt: AttemptReviewProps['attempt'], question: StandardMathQuestion) => {
    const numClasses = `${theme.fontSizes.reviewMathOperand} font-bold ${theme.colors.text.operand}`;
    const operatorClasses = `${theme.fontSizes.reviewMathOperator} font-semibold ${theme.colors.text.operator}`;
    
    const operand1Display = question.unknownSlot === 'operand1' ? '?' : question.operand1True;
    const operand2Display = question.unknownSlot === 'operand2' ? '?' : question.operand2True;
    const resultDisplay = question.unknownSlot === 'result' ? '?' : question.resultTrue;

    return (
        <div>
            <div className="flex items-center justify-center space-x-2 md:space-x-3 lg:space-x-4 my-2">
                <span className={numClasses}>{operand1Display}</span>
                <span className={operatorClasses}>{question.operator}</span>
                <span className={numClasses}>{operand2Display}</span>
                <span className={operatorClasses}>=</span>
                <span className={numClasses}>{resultDisplay}</span>
            </div>
            <AnswerDisplay 
                userAnswerDisplay={<span className={theme.fontSizes.reviewUserAnswer}>{attempt.userAnswer}</span>}
                correctAnswerDisplay={<strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{question.answer}</strong>}
                isCorrectSimple={false}
            />
        </div>
    );
};

const renderBalancingReview = (attempt: AttemptReviewProps['attempt'], question: BalancingEquationQuestion) => {
    const numClasses = `${theme.fontSizes.reviewMathOperand} font-bold ${theme.colors.text.operand}`;
    const operatorClasses = `${theme.fontSizes.reviewMathOperator} font-semibold ${theme.colors.text.operator}`;
    
    const equation = `${question.operand1} ${question.operator} ${question.operand2} = ${question.operand3} ${question.operator} ?`;

    return (
        <div>
            <div className="flex items-center justify-center space-x-2 my-2">
                <span className={numClasses}>{equation}</span>
            </div>
             <AnswerDisplay 
                userAnswerDisplay={<span className={theme.fontSizes.reviewUserAnswer}>{attempt.userAnswer}</span>}
                correctAnswerDisplay={<strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{question.answer}</strong>}
                isCorrectSimple={false}
            />
        </div>
    );
};

const renderMultipleChoiceReview = (attempt: AttemptReviewProps['attempt'], question: MultipleChoiceMathQuestion) => {
    const numClasses = `${theme.fontSizes.reviewMathOperand} font-bold ${theme.colors.text.operand}`;
    const equation = `${question.operand1} ${question.operator} ${question.operand2} = ?`;
    
    const selectedOption = question.options.find(opt => opt.id === attempt.userAnswer);

    return (
        <div>
            <p className={`${numClasses} text-center my-2`}>{equation}</p>
            <p className="text-sm text-gray-600 text-center mb-2">
                (Các lựa chọn: {question.options.map(o => o.value).join(', ')})
            </p>
            <AnswerDisplay
                userAnswerDisplay={<span className={theme.fontSizes.reviewUserAnswer}>{selectedOption ? selectedOption.value : attempt.userAnswer}</span>}
                correctAnswerDisplay={<strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{question.answer}</strong>}
                isCorrectSimple={false}
            />
        </div>
    );
};

const renderTrueFalseReview = (attempt: AttemptReviewProps['attempt'], question: TrueFalseMathQuestion) => {
    const numClasses = `${theme.fontSizes.reviewMathOperand} font-bold ${theme.colors.text.operand}`;
    const operatorClasses = `${theme.fontSizes.reviewMathOperator} font-semibold ${theme.colors.text.operator}`;
    
    const equation = `${question.operand1} ${question.operator} ${question.operand2} = ${question.displayedResult}`;

    return (
        <div>
            <div className="flex items-center justify-center space-x-2 my-2">
                <span className={numClasses}>{equation}</span>
            </div>
             <AnswerDisplay 
                userAnswerDisplay={<span className={theme.fontSizes.reviewUserAnswer}>{attempt.userAnswer ? 'Đúng' : 'Sai'}</span>}
                correctAnswerDisplay={<strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{question.answer ? 'Đúng' : 'Sai'}</strong>}
                isCorrectSimple={false}
            />
        </div>
    );
};


const MathReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as MathQuestion;

  switch (q.variant) {
    case 'standard':
      return renderStandardReview(attempt, q);
    case 'balancing_equation':
      return renderBalancingReview(attempt, q);
    case 'multiple_choice':
      return renderMultipleChoiceReview(attempt, q);
    case 'true_false':
      return renderTrueFalseReview(attempt, q);
    default:
      return <p>Dạng câu hỏi không xác định</p>;
  }
};

export default MathReview;