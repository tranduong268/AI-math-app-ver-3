import React from 'react';
import { CountingQuestion } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';

const CountingReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as CountingQuestion;

  const questionPreview = (
    <div className="text-center my-2">
      <p className={`text-md md:text-lg lg:text-xl font-medium ${theme.colors.text.secondary} mb-2`}>{q.promptText}</p>
      <div className="mb-2 flex flex-wrap justify-center items-center max-w-sm md:max-w-md mx-auto p-1 bg-gray-100 rounded-md">
        {q.shapes.map((emoji, index) => (
          <span key={index} className="text-3xl md:text-4xl lg:text-5xl p-0.5 select-none">
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );

  const userAnswerDisplay = <span className={theme.fontSizes.reviewUserAnswer}>{attempt.userAnswer}</span>;
  const correctAnswerDisplay = <strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{q.answer}</strong>;

  return (
    <div>
      {questionPreview}
      <AnswerDisplay
        userAnswerDisplay={userAnswerDisplay}
        correctAnswerDisplay={correctAnswerDisplay}
        isCorrectSimple={false}
      />
    </div>
  );
};

export default CountingReview;
