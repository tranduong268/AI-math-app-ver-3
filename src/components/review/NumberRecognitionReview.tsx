import React from 'react';
import { NumberRecognitionQuestion, ShapeType } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';

const renderOptionDisplay = (display: ShapeType[] | string, isLarge: boolean = false): JSX.Element => {
  const sizeClass = isLarge ? "text-xl md:text-2xl lg:text-3xl" : "text-lg md:text-xl lg:text-2xl"; 
  if (Array.isArray(display)) {
    return <span className={`${sizeClass} p-0.5`}>{display.join(' ')}</span>;
  }
  return <span className={sizeClass}>{display}</span>;
};

const NumberRecognitionReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as NumberRecognitionQuestion;
  
  const questionPreview = (
    <div className="text-center my-2">
      <p className={`text-md md:text-lg lg:text-xl font-medium ${theme.colors.text.secondary} mb-2`}>{q.promptText}</p>
      {q.variant === 'items-to-number' && q.targetItems && (
         <div className="mb-2 flex flex-wrap justify-center items-center max-w-sm md:max-w-md mx-auto p-1 bg-gray-100 rounded-md">
           {q.targetItems.map((item, index) => (
             <span key={index} className="text-3xl md:text-4xl lg:text-5xl p-0.5 select-none">{item}</span>
           ))}
         </div>
      )}
    </div>
  );

  const selectedOpt = q.options.find(opt => opt.id === attempt.userAnswer);
  const correctOpt = q.options.find(opt => opt.isCorrect);

  const userAnswerDisplay = selectedOpt ? renderOptionDisplay(selectedOpt.display, true) : 'Không rõ';
  const correctAnswerDisplay = correctOpt 
    ? <strong className={`font-bold ${theme.colors.text.positive}`}>{renderOptionDisplay(correctOpt.display, true)}</strong>
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

export default NumberRecognitionReview;
