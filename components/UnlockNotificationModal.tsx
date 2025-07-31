

import React, { useEffect } from 'react';
import { ImageSet } from '../types';
import { useAudio } from '../src/contexts/AudioContext';
import { theme } from '../src/config/theme';

interface UnlockNotificationModalProps {
  unlockedSet: ImageSet;
  onClose: () => void;
}

const UnlockNotificationModal: React.FC<UnlockNotificationModalProps> = ({ unlockedSet, onClose }) => {
  const { playSound } = useAudio();

  useEffect(() => {
    playSound('ITEM_UNLOCKED');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sampleIcons = unlockedSet.icons.slice(0, 5).join(' '); // Show up to 5 sample icons

  return (
    <div 
      className={`fixed inset-0 ${theme.colors.bg.modalOverlay} backdrop-blur-md flex items-center justify-center z-[100] p-4`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="unlockNotificationTitle"
    >
      <div className={`${theme.colors.bg.unlockModal} p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-sm w-full animate-pop-scale relative ${theme.colors.text.primary}`}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl font-bold"
          aria-label="Đóng thông báo"
        >
          &times;
        </button>
        
        <div className="text-6xl mb-4">🎉🌟🥳</div>
        
        <h2 id="unlockNotificationTitle" className={`text-2xl md:text-3xl font-bold ${theme.colors.text.unlockTitle} mb-3`}>
          Chúc Mừng Bé!
        </h2>
        <p className={`text-lg md:text-xl text-indigo-700 mb-2`}>
          Bé đã mở khóa một bộ hình mới:
        </p>
        <p className={`text-xl md:text-2xl font-semibold bg-white/50 py-2 px-3 rounded-md shadow-inner text-purple-700 mb-4`}>
          ✨ {unlockedSet.name} ✨
        </p>
        
        {sampleIcons && (
          <div className="my-3">
            <p className={`text-sm ${theme.colors.text.secondary}`}>Một vài hình ảnh mới nè:</p>
            <div className="text-4xl mt-1 p-2 bg-white/30 rounded-lg">{sampleIcons}</div>
          </div>
        )}

        <p className="text-md text-green-800 font-medium mb-6">
          Hãy thử chế độ 'Đếm Hình' để khám phá nhé!
        </p>
        
        <button
          onClick={onClose}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg w-full"
        >
          Tuyệt Vời!
        </button>
      </div>
    </div>
  );
};

export default UnlockNotificationModal;