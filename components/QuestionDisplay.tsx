import React from 'react';
import { Question, MathQuestion, ComparisonQuestion, CountingQuestion, NumberRecognitionQuestion, MatchingPairsQuestion, NumberSequenceQuestion, VisualPatternQuestion, OddOneOutQuestion } from '../types';

// Import all the new specialized question components
import MathQuestionDisplay from '../src/components/questions/MathQuestion';
import ComparisonQuestionDisplay from '../src/components/questions/ComparisonQuestion';
import CountingQuestionDisplay from '../src/components/questions/CountingQuestion';
import NumberRecognitionDisplay from '../src/components/questions/NumberRecognitionQuestion';
import MatchingPairsDisplay from '../src/components/questions/MatchingPairsQuestion';
import NumberSequenceDisplay from '../src/components/questions/NumberSequenceQuestion';
import VisualPatternDisplay from '../src/components/questions/VisualPatternQuestion';
import OddOneOutDisplay from '../src/components/questions/OddOneOutQuestion';

import { theme } from '../src/config/theme';

interface QuestionDisplayProps {
  question: Question; 
  onAnswer: (answer: string | number | string[] | boolean) => void; 
  disabled: boolean;
  lastAnswer?: string | number | string[] | boolean; 
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, onAnswer, disabled, lastAnswer }) => {
  
  const renderQuestion = () => {
    switch(question.type) {
      case 'math':
        return <MathQuestionDisplay question={question as MathQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      case 'comparison':
        return <ComparisonQuestionDisplay question={question as ComparisonQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      case 'counting':
        return <CountingQuestionDisplay question={question as CountingQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      case 'number_recognition':
        return <NumberRecognitionDisplay question={question as NumberRecognitionQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      case 'matching_pairs':
        return <MatchingPairsDisplay question={question as MatchingPairsQuestion} onAnswer={onAnswer} disabled={disabled} />;
      case 'number_sequence':
        return <NumberSequenceDisplay question={question as NumberSequenceQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      case 'visual_pattern':
        return <VisualPatternDisplay question={question as VisualPatternQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      case 'odd_one_out':
        return <OddOneOutDisplay question={question as OddOneOutQuestion} onAnswer={onAnswer} disabled={disabled} lastAnswer={lastAnswer} />;
      default:
        return <div>Loại câu hỏi không xác định.</div>
    }
  }

  return (
    <div className={`${theme.colors.bg.questionCard} ${theme.sizing.questionContainer} ${theme.sizing.questionContainerMinHeight} ${question.id ? 'animate-pop-scale' : ''}`}>
      {renderQuestion()}
    </div>
  );
};

export default QuestionDisplay;