
import React from 'react';
import { VisualPatternQuestion } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';

const VisualPatternReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as VisualPatternQuestion;

  const questionPreview = (
    <div className="text-center my-2">
      <p className={`text-md md:text-lg lg:text-xl font-medium ${theme.colors.text.secondary} mb-2`}>{q.promptText}</p>
      <div className="mb-2 flex flex-wrap justify-center items-center gap-2 max-w-sm md:max-w-md mx-auto p-1 bg-gray-100 rounded-md">
        {q.displayedSequence.map((emoji, index) => (
          <span key={index} className="text-3xl md:text-4xl p-0.5 select-none">{emoji}</span>
        ))}
         <span className="text-3xl md:text-4xl p-0.5 text-pink-500 font-bold select-none">?</span>
      </div>
    </div>
  );

  const selectedOpt = q.options.find(opt => opt.id === attempt.userAnswer);
  const correctOpt = q.options.find(opt => opt.isCorrect);

  const userAnswerDisplay = selectedOpt 
    ? <span className="text-3xl">{selectedOpt.emoji}</span>
    : 'Không rõ';

  const correctAnswerDisplay = correctOpt 
    ? (
        <div className="flex flex-col items-center text-center">
          <span className="text-3xl font-bold">{correctOpt.emoji}</span>
          {q.explanation && (
            <p className="text-xs md:text-sm font-normal text-gray-600 mt-1">
              ({q.explanation})
            </p>
          )}
        </div>
      )
    : <span className="text-gray-500">Không tìm thấy đáp án</span>;

  return (
    <div>
      {questionPreview}
      <AnswerDisplay
        userAnswerDisplay={userAnswerDisplay}
        correctAnswerDisplay={correctAnswerDisplay}
        isCorrectSimple={true}
      />
    </div>
  );
};

export default VisualPatternReview;