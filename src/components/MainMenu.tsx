
import React, { useMemo, useCallback } from 'react';
import { GameMode, DifficultyLevel } from '../../types';
import { useAudio } from '../contexts/AudioContext';
import { MENU_EMOJIS_RANDOM, COMPARISON_ICON, COUNTING_ICON, REVIEW_ICON, NUMBER_RECOGNITION_ICON, MATCHING_PAIRS_ICON, NUMBER_SEQUENCE_ICONS, VISUAL_PATTERN_ICON, ODD_ONE_OUT_ICONS_RANDOM, COMPREHENSIVE_CHALLENGE_ICON } from '../../constants';
import { theme } from '../config/theme';

interface MainMenuProps {
  onStartGame: (mode: GameMode) => void;
  onShowReview: () => void;
  totalStars: number;
  onRequestResetProgress: () => void;
  currentDifficulty: DifficultyLevel;
  onSetDifficulty: (level: DifficultyLevel) => void;
}

const getRandomEmoji = () => MENU_EMOJIS_RANDOM[Math.floor(Math.random() * MENU_EMOJIS_RANDOM.length)];
const getRandomNumberSequenceIcon = () => NUMBER_SEQUENCE_ICONS[Math.floor(Math.random() * NUMBER_SEQUENCE_ICONS.length)];
const getRandomOddOneOutIcon = () => ODD_ONE_OUT_ICONS_RANDOM[Math.floor(Math.random() * ODD_ONE_OUT_ICONS_RANDOM.length)];

interface MenuItem {
  mode: GameMode | 'REVIEW' | 'RESET' | 'DIFFICULTY_MAM' | 'DIFFICULTY_CHOI';
  text: string;
  emoji?: string; 
  bgColorClass: string;
  colSpanClass?: string;
  onClick?: () => void; 
  isActive?: boolean; 
}

const MenuButton: React.FC<{ item: MenuItem; onClick?: () => void }> = ({ item, onClick }) => {
  const { playSound } = useAudio();
  const handleClick = () => {
    playSound('BUTTON_CLICK');
    if (onClick) {
      onClick();
    }
  };
  return (
    <button
      onClick={handleClick}
      className={`${theme.buttons.mainMenu} ${theme.fontSizes.mainMenuButton} ${item.bgColorClass} ${item.isActive ? 'ring-4 ring-pink-500 brightness-110' : 'hover:brightness-110'} ${item.colSpanClass ?? ''}`}
      aria-pressed={item.isActive}
    >
      {item.emoji && <span className={`mr-2 ${theme.fontSizes.mainMenuButtonEmoji} flex-shrink-0`}>{item.emoji}</span>}
      <span className="text-center whitespace-nowrap">{item.text}</span>
    </button>
  );
};

const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onShowReview, totalStars, onRequestResetProgress, currentDifficulty, onSetDifficulty }) => {
  const { playSound } = useAudio();

  const handleStartGameWithSound = useCallback((mode: GameMode) => {
    playSound('DECISION');
    onStartGame(mode);
  }, [onStartGame, playSound]);

  const handleShowReviewWithSound = useCallback(() => {
    playSound('DECISION');
    onShowReview();
  }, [onShowReview, playSound]);

  const gameModeItems = useMemo<MenuItem[]>(() => [
    { mode: GameMode.ADDITION, text: GameMode.ADDITION, emoji: getRandomEmoji(), bgColorClass: 'bg-yellow-400' },
    { mode: GameMode.SUBTRACTION, text: GameMode.SUBTRACTION, emoji: getRandomEmoji(), bgColorClass: 'bg-green-400' },
    { mode: GameMode.COMPARISON, text: GameMode.COMPARISON, emoji: COMPARISON_ICON, bgColorClass: 'bg-blue-400' },
    { mode: GameMode.COUNTING, text: GameMode.COUNTING, emoji: COUNTING_ICON, bgColorClass: 'bg-purple-400' },
    { mode: GameMode.NUMBER_RECOGNITION, text: "Nhận Biết Số", emoji: NUMBER_RECOGNITION_ICON, bgColorClass: 'bg-teal-400' },
    { mode: GameMode.MATCHING_PAIRS, text: "Tìm Cặp Ghép", emoji: MATCHING_PAIRS_ICON, bgColorClass: 'bg-orange-400' },
    { mode: GameMode.NUMBER_SEQUENCE, text: GameMode.NUMBER_SEQUENCE, emoji: getRandomNumberSequenceIcon(), bgColorClass: 'bg-pink-400' },
    { mode: GameMode.VISUAL_PATTERN, text: GameMode.VISUAL_PATTERN, emoji: VISUAL_PATTERN_ICON, bgColorClass: 'bg-cyan-400' },
    { mode: GameMode.ODD_ONE_OUT, text: GameMode.ODD_ONE_OUT, emoji: getRandomOddOneOutIcon(), bgColorClass: 'bg-indigo-400' },
    { mode: GameMode.COMPREHENSIVE_CHALLENGE, text: GameMode.COMPREHENSIVE_CHALLENGE, emoji: COMPREHENSIVE_CHALLENGE_ICON, bgColorClass: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' },
  ], []);
  
  return (
    <div className={`${theme.colors.bg.mainMenu} backdrop-blur-md p-4 md:p-6 rounded-xl shadow-xl ${theme.sizing.mainMenuContainer} mx-auto`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`${theme.fontSizes.mainMenuTitle} font-semibold ${theme.colors.text.accent}`}>Chọn Chế Độ Chơi</h2>
        <div className={`${theme.colors.bg.stars} ${theme.colors.text.stars} px-3 py-1 rounded-full shadow-md`}>
          <span className="text-xl md:text-2xl mr-1">🌟</span>
          <span className={`font-bold ${theme.fontSizes.mainMenuStars}`}>{totalStars}</span>
        </div>
      </div>

      <div className="mb-6 p-3 bg-sky-100 rounded-lg shadow">
        <h3 className="text-sm md:text-base font-semibold text-sky-700 mb-2 text-center">Chọn Cấp Độ (Tiền Tiểu Học):</h3>
        <div className="grid grid-cols-2 gap-3">
          <MenuButton
            item={{
              mode: 'DIFFICULTY_MAM',
              text: DifficultyLevel.PRE_SCHOOL_MAM,
              bgColorClass: 'bg-lime-300 hover:bg-lime-400',
              isActive: currentDifficulty === DifficultyLevel.PRE_SCHOOL_MAM
            }}
            onClick={() => onSetDifficulty(DifficultyLevel.PRE_SCHOOL_MAM)}
          />
          <MenuButton
            item={{
              mode: 'DIFFICULTY_CHOI',
              text: DifficultyLevel.PRE_SCHOOL_CHOI,
              bgColorClass: 'bg-emerald-300 hover:bg-emerald-400',
              isActive: currentDifficulty === DifficultyLevel.PRE_SCHOOL_CHOI
            }}
            onClick={() => onSetDifficulty(DifficultyLevel.PRE_SCHOOL_CHOI)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {gameModeItems.map((item) => (
          <MenuButton
            key={item.mode}
            item={item}
            onClick={() => handleStartGameWithSound(item.mode as GameMode)}
          />
        ))}
        <MenuButton
          item={{
            mode: 'REVIEW',
            text: "Xem Lại Lỗi Sai",
            emoji: REVIEW_ICON,
            bgColorClass: 'bg-red-400',
            colSpanClass: 'sm:col-span-2'
          }}
          onClick={handleShowReviewWithSound}
        />
      </div>
      <div className="mt-6 pt-4 border-t border-gray-200">
        <MenuButton
          item={{
            mode: 'RESET',
            text: "Chơi Mới Từ Đầu",
            emoji: "🔄",
            bgColorClass: 'bg-slate-300 hover:bg-slate-400 text-slate-700',
            colSpanClass: 'sm:col-span-2'
          }}
          onClick={onRequestResetProgress}
        />
      </div>
    </div>
  );
};

export default MainMenu;