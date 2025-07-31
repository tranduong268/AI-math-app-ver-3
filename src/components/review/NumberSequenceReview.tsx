

import React, { useState } from 'react';
import { NumberSequenceQuestion, FillInTheBlanksQuestion, FindAndFixErrorQuestion, SortSequenceQuestion } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';
import NumberSequenceDisplay from '../questions/NumberSequenceQuestion';

// Helper to render the styled prompt for review screen
const StyledPrompt = ({ text }: { text: string }) => {
  const parts = text.split(/(\d+)/);
  return (
    <>
      {parts.map((part, index) => {
        if (/\d+/.test(part)) {
          // Use slightly smaller font sizes for the review screen to match its context
          return <strong key={index} className={`${theme.colors.text.promptHighlightNumber} ${theme.fontSizes.reviewPromptHighlightNumber} mx-1 align-middle`}>{part}</strong>;
        }
        return <span key={index} className="align-middle">{part}</span>;
      })}
    </>
  );
};


const renderFillInTheBlanksReview = (attempt: AttemptReviewProps['attempt'], question: FillInTheBlanksQuestion) => {
  const userAnswerDisplay = <span className={theme.fontSizes.reviewUserAnswer}>{(Array.isArray(attempt.userAnswer) ? attempt.userAnswer.join(', ') : attempt.userAnswer)}</span>;
  const correctAnswerDisplay = <strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{question.answers.join(', ')}</strong>;
  
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2">
          {question.sequence.map((part, index) => (
              part === null 
                  ? <span key={`blank-${index}`} className={`text-3xl sm:text-4xl font-bold text-gray-400 p-1`}>_</span>
                  : <span key={`num-${index}`} className={`text-3xl sm:text-4xl font-bold ${theme.colors.text.operand} p-1`}>{part}</span>
          ))}
      </div>
      <AnswerDisplay
        userAnswerDisplay={userAnswerDisplay}
        correctAnswerDisplay={correctAnswerDisplay}
        isCorrectSimple={false}
      />
    </>
  );
};

const renderFindAndFixErrorReview = (attempt: AttemptReviewProps['attempt'], question: FindAndFixErrorQuestion) => {
  let userCorrections: Record<string, number> = {};
  try {
    if (typeof attempt.userAnswer === 'string') {
      userCorrections = JSON.parse(attempt.userAnswer);
    }
  } catch (e) { /* ignore parse error */ }

  const userAnswerDisplay = (
    <div className="flex flex-wrap gap-2">
      {Object.keys(userCorrections).length > 0 ? Object.entries(userCorrections).map(([index, value]) => (
        <span key={index} className="text-sm bg-red-100 px-2 py-1 rounded">Sửa ô {Number(index) + 1} thành <strong className="font-bold">{value}</strong></span>
      )) : <span className="text-sm text-gray-500">(Không sửa lỗi nào)</span>}
    </div>
  );
  
  const correctAnswerDisplay = (
     <div className="flex flex-col items-start gap-1">
      {Object.entries(question.errors).map(([index, value]) => (
         <span key={index} className="text-sm bg-green-100 px-2 py-1 rounded">Lỗi ở ô {Number(index) + 1} (số <strong className="font-bold text-red-600">{question.sequenceWithErrors[Number(index)]}</strong>), đáp án đúng là <strong className="font-bold">{value}</strong></span>
      ))}
     </div>
  );
  
  return (
     <>
       <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2">
          {question.sequenceWithErrors.map((part, index) => {
            const isError = question.errors[index] !== undefined;
            return (
              <span key={`num-${index}`} className={`text-3xl sm:text-4xl font-bold p-1 ${isError ? 'text-red-500 underline decoration-wavy' : theme.colors.text.operand}`}>
                {part}
              </span>
            );
          })}
       </div>
      <AnswerDisplay
        userAnswerDisplay={userAnswerDisplay}
        correctAnswerDisplay={correctAnswerDisplay}
        isCorrectSimple={false}
      />
     </>
  );
};

const renderSortSequenceReview = (attempt: AttemptReviewProps['attempt'], question: SortSequenceQuestion) => {
  const userAnswerDisplay = <span className={theme.fontSizes.reviewUserAnswer}>{(Array.isArray(attempt.userAnswer) ? attempt.userAnswer.join(' → ') : attempt.userAnswer)}</span>;
  const correctAnswerDisplay = <strong className={`font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`}>{question.fullSequence.join(' → ')}</strong>;

  return (
      <>
          <div className="flex flex-wrap items-center justify-center gap-x-1 sm:gap-x-2">
              <p className="w-full text-center text-sm text-gray-500 mb-1">Dãy số ban đầu:</p>
              {question.scrambledSequence.map((part, index) => (
                  <span key={`num-${index}`} className={`text-2xl sm:text-3xl font-bold text-gray-500 p-1`}>{part}</span>
              ))}
          </div>
          <AnswerDisplay
              userAnswerDisplay={userAnswerDisplay}
              correctAnswerDisplay={correctAnswerDisplay}
              isCorrectSimple={false}
          />
      </>
  );
};


const NumberSequenceReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as NumberSequenceQuestion;
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryFeedback, setRetryFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleRetryAnswer = (userAnswer: string | number | string[]) => {
      let isCorrect = false;
      if (q.variant === 'fill_in_the_blanks') {
          const userAnswersArray = Array.isArray(userAnswer) ? userAnswer : [String(userAnswer)];
          isCorrect = userAnswersArray.length === q.answers.length && userAnswersArray.every((ans, index) => parseInt(ans, 10) === q.answers[index]);
      } else if (q.variant === 'find_and_fix_error') {
          try {
              const userCorrections = JSON.parse(String(userAnswer)) as Record<string, number>;
              const correctErrors = q.errors;
              const userErrorIndices = Object.keys(userCorrections).map(Number).sort();
              const correctErrorIndices = Object.keys(correctErrors).map(Number).sort();
              if (userErrorIndices.length === correctErrorIndices.length && userErrorIndices.length > 0) {
                  isCorrect = correctErrorIndices.every(index => 
                      userCorrections[index] !== undefined && 
                      Number(userCorrections[index]) === correctErrors[index] &&
                      userErrorIndices.includes(index)
                  );
              }
          } catch(e) { isCorrect = false; }
      } else if (q.variant === 'sort_sequence') {
          const userAnswersArray = Array.isArray(userAnswer) ? userAnswer.map(Number) : [];
          isCorrect = JSON.stringify(userAnswersArray) === JSON.stringify(q.fullSequence);
      }
      
      setRetryFeedback(isCorrect ? 'correct' : 'incorrect');
      setTimeout(() => {
        setIsRetrying(false);
        setRetryFeedback(null);
      }, isCorrect ? 1500 : 2000);
  };

  if (isRetrying) {
      return (
          <div className="p-4 bg-yellow-50 rounded-lg border-2 border-dashed border-yellow-400">
              <NumberSequenceDisplay question={q} onAnswer={handleRetryAnswer} disabled={!!retryFeedback} />
              {retryFeedback === 'correct' && <p className="text-center mt-2 font-bold text-green-600 animate-pop-scale">Đúng rồi, giỏi quá!</p>}
              {retryFeedback === 'incorrect' && <p className="text-center mt-2 font-bold text-red-600 animate-shake-short">Vẫn chưa đúng, bé thử lại nhé!</p>}
          </div>
      );
  }

  const renderReviewContent = () => {
      switch (q.variant) {
        case 'fill_in_the_blanks': return renderFillInTheBlanksReview(attempt, q);
        case 'find_and_fix_error': return renderFindAndFixErrorReview(attempt, q);
        case 'sort_sequence': return renderSortSequenceReview(attempt, q);
        default: return null;
      }
  };

  return (
    <div className="text-center my-2">
      <p className={`text-md md:text-lg lg:text-xl font-medium ${theme.colors.text.secondary} mb-2`}>
         {q.variant === 'find_and_fix_error' ? <StyledPrompt text={q.promptText} /> : q.promptText}
      </p>
      {renderReviewContent()}
      <button 
        onClick={() => setIsRetrying(true)} 
        className={`${theme.buttons.retry} ${theme.colors.bg.retryButton}`}
      >
        🔄 Thử lại
      </button>
    </div>
  );
};

export default NumberSequenceReview;