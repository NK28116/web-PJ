import { useAuth } from '@/hooks/useAuth';
import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* モーダル本体 */}
      <div className="relative z-10 bg-white border border-[#006355] rounded-[5px] w-[220px] h-[130px] flex flex-col items-center justify-center px-4">
        <p className="text-black text-sm text-center mb-4">ログアウトしますか？</p>

        <div className="flex gap-3 w-full justify-center">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex-1 bg-[#00A48D] text-white text-sm py-1.5 rounded"
          >
            ログアウト
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#006355] text-[#006355] text-sm py-1.5 rounded"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
