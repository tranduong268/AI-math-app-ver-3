import React from 'react';
import { StoredSession, GameMode } from '../types'; 
import { COMPARISON_ICON, COUNTING_ICON, NUMBER_RECOGNITION_ICON, MATCHING_PAIRS_ICON, NUMBER_SEQUENCE_ICONS, VISUAL_PATTERN_ICON, ODD_ONE_OUT_ICONS_RANDOM } from '../constants';
import { theme } from '../src/config/theme';

// Import all the new specialized review components
import MathReview from '../src/components/review/MathReview';
import ComparisonReview from '../src/components/review/ComparisonReview';
import CountingReview from '../src/components/review/CountingReview';
import NumberRecognitionReview from '../src/components/review/NumberRecognitionReview';
import MatchingPairsReview from '../src/components/review/MatchingPairsReview';
import NumberSequenceReview from '../src/components/review/NumberSequenceReview';
import VisualPatternReview from '../src/components/review/VisualPatternReview';
import OddOneOutReview from '../src/components/review/OddOneOutReview';


interface ReviewScreenProps {
  sessions: StoredSession[];
  onBackToMenu: () => void;
}

const getModeIcon = (mode: GameMode): string => {
  switch (mode) {
    case GameMode.ADDITION: return '➕';
    case GameMode.SUBTRACTION: return '➖';
    case GameMode.COMPARISON: return COMPARISON_ICON;
    case GameMode.COUNTING: return COUNTING_ICON;
    case GameMode.NUMBER_RECOGNITION: return NUMBER_RECOGNITION_ICON;
    case GameMode.MATCHING_PAIRS: return MATCHING_PAIRS_ICON;
    case GameMode.NUMBER_SEQUENCE: return NUMBER_SEQUENCE_ICONS[0]; 
    case GameMode.VISUAL_PATTERN: return VISUAL_PATTERN_ICON;
    case GameMode.ODD_ONE_OUT: return ODD_ONE_OUT_ICONS_RANDOM[0];
    default: return '❓';
  }
};

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ sessions, onBackToMenu }) => {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('vi-VN')} lúc ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (sessions.length === 0) {
    return (
      <div className="w-full max-w-lg mx-auto"> 
        <div className="flex justify-between items-center mb-3 md:mb-4 px-1 sm:px-0">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-700">Xem Lại Lỗi Sai</h2>
          <button 
            onClick={onBackToMenu}
            className="bg-white text-pink-500 px-4 py-2 rounded-lg shadow hover:bg-pink-100 transition-colors font-medium text-sm md:text-base"
            aria-label="Về Menu Chính"
          >
            Về Menu
          </button>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl text-center">
          <p className="text-gray-600 text-lg md:text-xl">Chưa có lỗi sai nào được ghi lại. Bé giỏi quá! 🎉</p>
          <button 
            onClick={onBackToMenu}
            className="mt-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 md:py-3 md:px-8 rounded-lg shadow transition-transform transform hover:scale-105 text-base md:text-lg"
          >
            Tuyệt! Về Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto"> 
      <div className="flex justify-between items-center mb-3 md:mb-4 lg:mb-6 px-1 sm:px-0">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-700">Xem Lại Lỗi Sai</h2>
        <button 
          onClick={onBackToMenu}
          className="bg-white text-pink-500 px-4 py-2 rounded-lg shadow hover:bg-pink-100 transition-colors font-medium text-sm md:text-base"
          aria-label="Về Menu Chính"
        >
          Về Menu
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100 p-3 md:p-4 lg:p-6 rounded-xl shadow-2xl space-y-4 md:space-y-6">
        {sessions.map((session) => {
          let previousMode: GameMode | null = null; 
          return (
            <div key={session.id} className="p-3 md:p-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
              <h3 className={`text-lg md:text-xl font-semibold ${theme.colors.text.primary} border-b ${theme.colors.border.default} pb-2 mb-3`}>
                Lượt chơi: {formatDate(session.timestamp)} - Điểm: <strong className="font-bold text-blue-600">{session.score}</strong>/{session.totalQuestions}
                {session.difficulty && <span className={`text-sm md:text-base ${theme.colors.text.light} ml-2`}>({session.difficulty})</span>}
              </h3>
              {session.incorrectAttempts.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {session.incorrectAttempts.map((attempt, index) => {
                    const showModeTitle = attempt.question.mode !== previousMode;
                    previousMode = attempt.question.mode;

                    const renderReviewComponent = () => {
                      switch (attempt.question.type) {
                        case 'math': return <MathReview attempt={attempt} />;
                        case 'comparison': return <ComparisonReview attempt={attempt} />;
                        case 'counting': return <CountingReview attempt={attempt} />;
                        case 'number_recognition': return <NumberRecognitionReview attempt={attempt} />;
                        case 'matching_pairs': return <MatchingPairsReview attempt={attempt} />;
                        case 'number_sequence': return <NumberSequenceReview attempt={attempt} />;
                        case 'visual_pattern': return <VisualPatternReview attempt={attempt} />;
                        case 'odd_one_out': return <OddOneOutReview attempt={attempt} />;
                        default: return <p className="text-gray-600">Câu hỏi không xác định.</p>;
                      }
                    };

                    return (
                      <div key={index} className={`p-2 md:p-3 bg-sky-50 rounded-md shadow-sm border border-sky-200 ${showModeTitle ? 'mt-3' : 'mt-1'}`}>
                        {showModeTitle && (
                          <p className="text-md md:text-lg font-semibold text-sky-800 mb-2 pb-1 border-b border-sky-200">
                            <span className="text-xl md:text-2xl mr-2">{getModeIcon(attempt.question.mode)}</span>
                            {attempt.question.mode}
                          </p>
                        )}
                        {renderReviewComponent()}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={`${theme.colors.text.positive} p-2 text-center text-base md:text-lg`}>Chúc mừng! Bé không có lỗi sai nào trong lượt chơi này! ✨</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
