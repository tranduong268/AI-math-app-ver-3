

import React, { useMemo } from 'react';
import { POSITIVE_FEEDBACK_EMOJIS, ENCOURAGING_FEEDBACK_EMOJIS } from '../constants';
import { theme } from '../src/config/theme';

interface FeedbackDisplayProps {
  message: string;
  type: 'positive' | 'encouraging';
}

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ message, type }) => {
  const baseClasses = `mt-4 p-3 md:p-4 rounded-md text-center font-semibold ${theme.fontSizes.feedback} shadow`;
  const typeClasses = type === 'positive' 
    ? `${theme.colors.bg.feedbackPositive} ${theme.colors.text.positive} animate-pop-scale` 
    : `${theme.colors.bg.feedbackNegative} ${theme.colors.text.negative} animate-shake-short`;

  const emojisToDisplay = useMemo(() => {
    if (type === 'positive') {
      if (POSITIVE_FEEDBACK_EMOJIS.length === 0) return '';
      const shuffledEmojis = shuffleArray(POSITIVE_FEEDBACK_EMOJIS);
      // Ensure we don't try to take more emojis than available
      const count = Math.min(3, shuffledEmojis.length);
      return shuffledEmojis.slice(0, count).join(' ');
    } else { // encouraging
      if (ENCOURAGING_FEEDBACK_EMOJIS.length === 0) return '';
      return ENCOURAGING_FEEDBACK_EMOJIS[Math.floor(Math.random() * ENCOURAGING_FEEDBACK_EMOJIS.length)];
    }
  }, [type]); // Re-calculate if type changes, message change implicitly means new feedback.

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {message} {emojisToDisplay && <span className="ml-2">{emojisToDisplay}</span>}
    </div>
  );
};

export default FeedbackDisplay;