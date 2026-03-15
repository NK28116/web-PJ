import React, { useMemo, useState } from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import { Spinner } from '@/atoms/Spinner';
import {
  FilterOption,
  ReviewDetailModal,
  ReviewFilter,
  ReviewList,
  ReviewSort,
  ReviewSummary,
  SortOption,
} from '@/organisms/Review';
import type { Review } from '@/test/mock/reviewMock';
import { useReviews } from '@/hooks/useReviews';

const sortReviews = (reviews: Review[], sort: SortOption): Review[] => {
  const copy = [...reviews];
  switch (sort) {
    case 'recommended':
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
  const { reviews, loading, error, submitReply } = useReviews();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('recommended');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [modalMode, setModalMode] = useState<'detail' | 'reply'>('detail');
  const [replyError, setReplyError] = useState<string | null>(null);

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

  const handleReplySubmit = async (id: string, replyText: string) => {
    setReplyError(null);
    try {
      await submitReply(id, replyText);
      setSelectedReview(null);
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : '返信の送信に失敗しました');
    }
  };

  if (loading) {
    return (
      <BaseTemplate activeTab="review" customTabLabels={{ review: '口コミ・返信' }}>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </BaseTemplate>
    );
  }

  if (error) {
    return (
      <BaseTemplate activeTab="review" customTabLabels={{ review: '口コミ・返信' }}>
        <div className="flex items-center justify-center h-64">
          <Text className="text-red-500">{error}</Text>
        </div>
      </BaseTemplate>
    );
  }

  return (
    <BaseTemplate activeTab="review" customTabLabels={{ review: '口コミ・返信' }}>
      <div className="flex flex-col gap-6 h-full pb-10">
        <ReviewSummary reviews={reviews} />

        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div className="flex items-center gap-4">
            <ReviewFilter value={filter} onChange={setFilter} />
            <div className="h-4 w-px bg-gray-300" />
            <Text className="text-gray-500 text-sm">{displayedReviews.length} 件</Text>
          </div>
          <ReviewSort value={sort} onChange={setSort} />
        </div>

        <ReviewList
          reviews={displayedReviews}
          onDetail={handleDetail}
          onReply={handleReply}
        />
      </div>

      {replyError && (
        <div className="fixed bottom-20 left-4 right-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm z-50">
          {replyError}
        </div>
      )}

      <ReviewDetailModal
        review={selectedReview}
        mode={modalMode}
        onClose={() => setSelectedReview(null)}
        onReplySubmit={handleReplySubmit}
      />
    </BaseTemplate>
  );
};
