import { cn } from '@/utils/cn';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export type Notification = {
  id: string;
  storeName: string;
  content: string;
  receivedAt: Date;
  isRead: boolean;
  redirectPath: string;
};

/** 日時フォーマット: 1日未満→○分前/○時間前、1〜3日→○日前、3日以上→yyyy/mm/dd */
export function formatNotificationDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    if (diffHours >= 1) return `${diffHours}時間前`;
    return `${Math.max(diffMinutes, 1)}分前`;
  }
  if (diffDays < 3) return `${diffDays}日前`;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

interface NotificationItemProps {
  notification: Notification;
  onConfirm: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onConfirm,
}) => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    setError(null);
    const { redirectPath } = notification;

    // バリデーション: /で始まり、httpを含まない
    if (!redirectPath.startsWith('/') || redirectPath.includes('http')) {
      setError('確認できませんでした');
      return;
    }

    onConfirm(notification.id);
    router.push(redirectPath);
  };

  return (
    <div
      className={cn(
        'px-4 py-4 border-b border-gray-200',
        notification.isRead && 'bg-gray-100'
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-gray-900">
          【{notification.storeName}】
        </p>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
          {formatNotificationDate(notification.receivedAt)}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-700 leading-relaxed">
        {notification.content}
      </p>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={handleConfirm}
          className="text-sm text-wyze-primary font-medium hover:underline"
        >
          確認する
        </button>
      </div>
    </div>
  );
};
