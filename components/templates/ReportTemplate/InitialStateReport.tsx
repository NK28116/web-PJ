import { Text } from '@/components/atoms/Text';
import React from 'react';

/**
 * リリース時（初期状態）のEmpty State表示コンポーネント
 * アカウント連携前やデータがない状態で表示される
 */
export const InitialStateReport: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center">
        <Text className="text-2xl font-bold text-gray-400 mb-2">
          リリース時
        </Text>
        <Text className="text-4xl font-bold text-gray-600 mb-8">
          レポート
        </Text>
        <div className="bg-gray-100 rounded-lg p-6 max-w-sm mx-auto">
          <Text className="text-sm text-gray-500 leading-relaxed">
            アカウントを連携すると、
            <br />
            レポートが表示されます。
          </Text>
        </div>
      </div>
    </div>
  );
};
