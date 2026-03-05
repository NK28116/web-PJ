import { NotificationItem } from '@/molecules/NotificationItem';
import type { Notification } from '@/molecules/NotificationItem';
import React, { useEffect } from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onConfirm: (id: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onConfirm,
}) => {
  // 背景スクロール禁止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* モーダル本体: 幅・高さ75% */}
      <div className="relative z-10 bg-white rounded-lg shadow-xl w-[75%] h-[75%] flex flex-col overflow-hidden">
        {/* ヘッダー */}
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          {unreadCount > 0 ? (
            <p className="text-base font-bold">
              <span className="text-wyze-primary">お知らせ</span>
              {'　'}
              <span className="text-wyze-primary">{unreadCount}件</span>
            </p>
          ) : (
            <p className="text-base font-bold text-gray-500">
              お知らせはありません
            </p>
          )}
        </div>

        {/* 通知リスト（内部スクロール） */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">お知らせはありません</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onConfirm={onConfirm}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
