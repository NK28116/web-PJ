import React from 'react';
import { Text } from '@/atoms/Text';
import { Review } from '@/test/mock/reviewMock';

interface ReviewSummaryProps {
  reviews: Review[];
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({ reviews }) => {
  const total = reviews.length;
  const unrepliedCount = reviews.filter((r) => r.replyStatus === 'unreplied').length;
  const repliedCount = reviews.filter((r) => r.replyStatus === 'replied').length;

  const avgRating =
    total === 0 ? 0 : reviews.reduce((sum, r) => sum + r.rating, 0) / total;
  const roundedRating = Math.round(avgRating * 10) / 10;

  const replyRate = total === 0 ? 0 : Math.round((repliedCount / total) * 100);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 未返信口コミ数 */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <Text className="text-sm text-gray-600 mb-2">未返信口コミ数</Text>
        <div className="flex items-end justify-end gap-1">
          <Text className="text-xl font-medium">{total === 0 ? '-' : unrepliedCount}</Text>
          <Text className="text-xs text-gray-500 mb-1">件</Text>
        </div>
      </div>

      {/* 総合評価 */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <Text className="text-sm text-gray-600 mb-2">総合評価</Text>
        <div className="flex items-end justify-end gap-1">
          <Text className="text-xl font-medium">{total === 0 ? '-' : roundedRating}</Text>
          <Text className="text-xs text-gray-500 mb-1">/5.0</Text>
        </div>
      </div>

      {/* 返信率 */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <Text className="text-sm text-gray-600 mb-2">返信率（％）</Text>
        <div className="flex items-end justify-end gap-1">
          <Text className="text-xl font-medium">{total === 0 ? '-' : replyRate}</Text>
          <Text className="text-xs text-gray-500 mb-1">％</Text>
        </div>
      </div>

      {/* 平均返信時間 (固定値) */}
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <Text className="text-sm text-gray-600 mb-2">平均返信時間</Text>
        <div className="flex items-end justify-end gap-1">
          <Text className="text-xl font-medium">{total === 0 ? '-' : '10.4'}</Text>
          <Text className="text-xs text-gray-500 mb-1">時間</Text>
        </div>
      </div>
    </div>
  );
};
