import React, { useMemo, useState } from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import {
  FilterOption,
  ReviewDetailModal,
  ReviewFilter,
  ReviewList,
  ReviewSort,
  ReviewSummary,
  SortOption,
} from '@/organisms/Review';
import { Review, reviewMockData } from '@/test/mock/reviewMock';

const sortReviews = (reviews: Review[], sort: SortOption): Review[] => {
  const copy = [...reviews];
  switch (sort) {
    case 'recommended':
      // 未返信 > 低評価 > 新しい順
      return copy.sort((a, b) => {
        if (a.replyStatus !== b.replyStatus) {
          return a.replyStatus === 'unreplied' ? -1 : 1;
        }
        if (a.rating !== b.rating) return a.rating - b.rating;
        return b.createdAt.localeCompare(a.createdAt);
      });
    case 'newest':
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'oldest':
      return copy.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case 'ratingHigh':
      return copy.sort((a, b) => b.rating - a.rating);
    case 'ratingLow':
      return copy.sort((a, b) => a.rating - b.rating);
    default:
      return copy;
  }
};

export const ReviewTemplate: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(reviewMockData);
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recommended');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'reply'>('detail');

  const displayedReviews = useMemo(() => {
    const filtered =
      filter === 'all'
        ? reviews
        : reviews.filter((r) => r.replyStatus === filter);
    return sortReviews(filtered, sort);
  }, [reviews, filter, sort]);

  const handleDetail = (review: Review) => {
    setSelectedReview(review);
    setModalMode('detail');
  };

  const handleReply = (review: Review) => {
    setSelectedReview(review);
    setModalMode('reply');
  };

  const handleReplySubmit = (id: string, replyText: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              replyStatus: 'replied',
              replyText,
              replyCreatedAt: new Date().toISOString().split('T')[0],
            }
          : r
      )
    );
    setSelectedReview(null);
  };

  return (
    <BaseTemplate activeTab="review" customTabLabels={{ review: '口コミ・返信' }}>
      <div className="flex flex-col gap-6 h-full pb-10">
        {/* 統計情報 */}
        <ReviewSummary reviews={reviews} />

        {/* フィルター・ソート */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-4">
            <ReviewFilter value={filter} onChange={setFilter} />
            <div className="h-4 w-px bg-gray-300" />
            <Text className="text-gray-500 text-sm">{displayedReviews.length} 件</Text>
          </div>
          <ReviewSort value={sort} onChange={setSort} />
        </div>

        {/* リスト */}
        <ReviewList
          reviews={displayedReviews}
          onDetail={handleDetail}
          onReply={handleReply}
        />
      </div>

      {/* 詳細・返信モーダル */}
      <ReviewDetailModal
        review={selectedReview}
        mode={modalMode}
        onClose={() => setSelectedReview(null)}
        onReplySubmit={handleReplySubmit}
      />
    </BaseTemplate>
  );
};
