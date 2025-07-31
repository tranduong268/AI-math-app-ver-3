import React from 'react';
import { MatchingPairsQuestion } from '../../../types';
import { theme } from '../../config/theme';
import { AttemptReviewProps } from './AttemptReviewProps';
import AnswerDisplay from './AnswerDisplay';

const MatchingPairsReview: React.FC<AttemptReviewProps> = ({ attempt }) => {
  const q = attempt.question as MatchingPairsQuestion;

  const pairs: { item1: string, item2: string }[] = [];
  const processedMatchIds = new Set<string>();

  q.items.forEach(item1 => {
      if (!processedMatchIds.has(item1.matchId)) {
          const item2 = q.items.find(i => i.matchId === item1.matchId && i.id !== item1.id);
          if (item2) {
              const digit = item1.visualType === 'digit' ? item1 : item2;
              const visual = item1.visualType !== 'digit' ? item1 : item2;
              pairs.push({
                item1: digit.display, 
                item2: visual.display.length > 10 ? visual.display.substring(0, 10) + '...' : visual.display
              });
              processedMatchIds.add(item1.matchId);
          }
      }
  });
  
  const digitItems = q.items.filter(item => item.visualType === 'digit').map(i => i.display).join(', ');
  const visualItems = q.items.filter(item => item.visualType !== 'digit').map(i => i.display.length > 5 ? i.display.substring(0, 5) + '...' : i.display).join('; ');

  const questionPreview = (
    <div className="text-center my-2">
      <p className={`text-md md:text-lg lg:text-xl font-medium ${theme.colors.text.secondary} mb-2`}>{q.promptText}</p>
      <p className="text-sm text-gray-500">Số: [{digitItems}]</p>
      <p className="text-sm text-gray-500">Hình: [{visualItems}]</p>
      <p className="text-xs text-gray-400">(Xem chi tiết các cặp đúng ở phần đáp án)</p>
    </div>
  );

  const userAnswerDisplay = <span className={`${theme.fontSizes.reviewUserAnswer} text-gray-500`}>(Không hoàn thành đúng)</span>;
  
  const answerStyle = `font-bold ${theme.colors.text.positive} ${theme.fontSizes.reviewCorrectAnswer}`;
  const correctAnswerDisplay = (
    <div className={`text-sm ${theme.colors.text.positive}`}>
      {pairs.map((p, i) => (
          <div key={i} className={`${answerStyle} flex items-center justify-center gap-x-2`}>
              <span>{p.item1}</span> <span className="text-gray-500">&harr;</span> <span>{p.item2}</span>
          </div>
      ))}
      {pairs.length === 0 && <span className={answerStyle}>(Không có cặp nào)</span>}
    </div>
  );

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

export default MatchingPairsReview;
