

import React from 'react';
import { theme } from '../src/config/theme';

interface ResetConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div 
      className={`fixed inset-0 ${theme.colors.bg.modalOverlay} backdrop-blur-md flex items-center justify-center z-[100] p-4`}
      aria-modal="true"
      role="dialog"
      aria-labelledby="resetConfirmationTitle"
      aria-describedby="resetConfirmationDescription"
    >
      <div className={`${theme.colors.bg.resetModal} p-6 md:p-8 rounded-xl shadow-2xl text-center max-w-md w-full animate-pop-scale relative ${theme.colors.text.primary}`}>
        <h2 id="resetConfirmationTitle" className={`text-2xl md:text-3xl font-bold ${theme.colors.text.modalTitle} mb-4`}>
          ⚠️ Xác Nhận Chơi Lại?
        </h2>
        <p id="resetConfirmationDescription" className={`text-md md:text-lg ${theme.colors.text.secondary} mb-6`}>
          Bé có chắc chắn muốn bắt đầu lại từ đầu không? <br/>
          Tất cả <strong className="text-yellow-600">🌟 sao</strong> và các <strong className="text-purple-600">bộ hình đã mở khóa</strong> sẽ bị xóa vĩnh viễn.
          <br/>Hành động này không thể hoàn tác.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className={`bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 text-lg w-full sm:w-auto order-2 sm:order-1`}
            aria-label="Hủy bỏ và đóng thông báo"
          >
            Hủy Bỏ
          </button>
          <button
            onClick={onConfirm}
            className={`bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105 text-lg w-full sm:w-auto order-1 sm:order-2`}
            aria-label="Xác nhận đặt lại tiến độ"
          >
            Đồng Ý Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetConfirmationModal;