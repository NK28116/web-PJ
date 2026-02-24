import React from 'react';
import { Text } from '@/atoms/Text';
import { Review } from '@/test/mock/reviewMock';

interface ReviewListProps {
  reviews: Review[];
  onDetail: (review: Review) => void;
  onReply: (review: Review) => void;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, onDetail }) => {
  if (reviews.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 mt-4 bg-[#F9FAFB] rounded-lg border border-dashed border-gray-300">
        <div className="w-[120px] h-[120px] bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="#CBD5E1"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <Text className="text-base font-medium mb-3 text-gray-900">口コミがありません</Text>
        <Text className="text-sm text-gray-500 leading-relaxed max-w-[280px]">
          Googleマップの口コミを増やす施策を実施し、
          <br />
          お店の魅力を見える化しましょう。
        </Text>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {reviews.map((review) => (
        <div
          key={review.id}
          onClick={() => onDetail(review)}
          className="flex gap-6 px-5 py-5 border-b border-[#ddd] bg-[#f7f7f7] cursor-pointer hover:bg-[#efefef] transition-colors"
        >
          {/* 左側: スコア＋星 */}
          <div className="flex items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[40px] font-bold text-[#d4a000] leading-none">
                {review.rating}.0
              </span>
              <span className="text-[18px] text-[#f5b301] leading-none">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
            </div>
          </div>

          {/* 右側: 詳細 */}
          <div className="flex-1 flex flex-col gap-2.5 min-w-0">
            {/* ヘッダー: ユーザー情報 + ステータス */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#cfd8dc] rounded-full flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                  {review.userName[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{review.userName}</p>
                  <p className="text-[#777] text-sm">{review.createdAt}</p>
                </div>
              </div>
              {review.replyStatus === 'unreplied' ? (
                <span className="border border-red-500 text-red-500 px-2.5 py-1 rounded text-sm font-bold shrink-0 ml-2">
                  未返信
                </span>
              ) : (
                <span className="border border-[#00A48D] text-[#00A48D] px-2.5 py-1 rounded text-sm font-bold shrink-0 ml-2">
                  返信済み
                </span>
              )}
            </div>

            {/* コメント (3行制限) */}
            <p className="text-sm leading-[1.6] text-[#333] line-clamp-3">
              {review.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
