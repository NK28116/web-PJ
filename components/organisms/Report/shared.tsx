import { Text } from '@/atoms/Text';
import React from 'react';

export interface EmptyStateProps {
  message?: string;
  className?: string;
}

/**
 * Empty State表示コンポーネント
 * データがない場合に「COMING SOON」等のメッセージを表示
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'COMING SOON',
  className = '',
}) => (
  <div
    className={`flex items-center justify-center h-[120px] bg-gray-50 border border-gray-100 rounded ${className}`}
  >
    <Text className="text-sm text-gray-400">{message}</Text>
  </div>
);

/**
 * 配列が空かどうかをチェックするヘルパー関数
 */
export const isEmpty = <T,>(arr: T[] | undefined | null): boolean => !arr || arr.length === 0;
