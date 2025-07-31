
import React, { useState } from 'react';
import { OddOneOutQuestion } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';
import OddOneOutDisplay from '../questions/OddOneOutQuestion';

const OddOneOutReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as OddOneOutQuestion;
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryFeedback, setRetryFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleRetryAnswer = (userAnswerId: string | number | string[]) => {
    const isCorrect = userAnswerId === q.correctAnswerId;
    setRetryFeedback(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => {
      setIsRetrying(false);
      setRetryFeedback(null);
    }, 1500);
  };

  if (isRetrying) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-400">
        <OddOneOutDisplay question={q} onAnswer={handleRetryAnswer} disabled={!!retryFeedback} />
        {retryFeedback === 'correct' && <p className="text-center mt-2 font-bold text-green-600 animate-pop-scale">Đúng rồi, giỏi quá!</p>}
        {retryFeedback === 'incorrect' && <p className="text-center mt-2 font-bold text-red-600 animate-shake-short">Vẫn chưa đúng, bé thử lại nhé!</p>}
      </div>
    );
  }

  const questionPreview = (
    <div className="text-center my-2">
      <p className={`text-md md:text-lg lg:text-xl font-medium ${theme.colors.text.secondary} mb-2`}>{q.promptText}</p>
      <div className="mb-2 flex flex-wrap justify-center items-center max-w-sm md:max-w-md mx-auto p-1 bg-gray-100 rounded-md gap-2">
        {q.options.map((option) => (
          <div key={option.id} className={`${theme.fontSizes.reviewOddOneOutAnswer} p-1`}>
            {option.emoji}
          </div>
        ))}
      </div>
    </div>
  );

  const selectedOpt = q.options.find(opt => opt.id === attempt.userAnswer);
  const correctOpt = q.options.find(opt => opt.id === q.correctAnswerId);

  const userAnswerDisplay = selectedOpt 
    ? <span className={theme.fontSizes.reviewOddOneOutAnswer}>{selectedOpt.emoji}</span>
    : 'Không rõ';
  
  const correctAnswerDisplay = correctOpt 
    ? (
        <div className="flex flex-col items-center text-center">
            <span className={theme.fontSizes.reviewOddOneOutAnswer}>{correctOpt.emoji}</span>
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
      <div className="text-center">
          <button 
            onClick={() => setIsRetrying(true)} 
            className={`${theme.buttons.retry} ${theme.colors.bg.retryButton}`}
          >
            🔄 Thử lại
          </button>
      </div>
    </div>
  );
};

export default OddOneOutReview;