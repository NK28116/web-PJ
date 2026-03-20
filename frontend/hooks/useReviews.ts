import { useCallback, useEffect, useState } from 'react';
import { apiGet, apiPost } from '@/utils/api';
import type { GoogleReview } from '@/types/api';
import type { Review } from '@/test/mock/reviewMock';
import { reviewMockData } from '@/test/mock/reviewMock';

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

function toReview(r: GoogleReview): Review {
  return {
    id: r.review_id,
    userName: r.reviewer,
    rating: Math.min(5, Math.max(1, r.rating)) as Review['rating'],
    comment: r.comment,
    images: r.media_urls || [],
    createdAt: r.create_time.split('T')[0],
    replyStatus: r.reply_text ? 'replied' : 'unreplied',
    replyText: r.reply_text,
    replyCreatedAt: r.reply_time?.split('T')[0],
    foodRate: 3,
    atmosphereRate: 3,
    serviceRate: 3,
    waitTime: null,
    noiseLevel: 'ふつう',
  };
}

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (IS_MOCK) {
        setReviews(reviewMockData);
        return;
      }
      const data = await apiGet<GoogleReview[]>('/api/google/reviews');
      console.log('[useReviews] GET /api/google/reviews:', { count: data.length, data });
      setReviews(data.map(toReview));
    } catch (err) {
      console.error('[useReviews] GET /api/google/reviews failed:', err);
      setError(err instanceof Error ? err.message : '口コミの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const submitReply = useCallback(async (reviewId: string, comment: string) => {
    console.log('[useReviews] POST /api/google/reviews/' + reviewId + '/reply:', { comment });
    await apiPost(`/api/google/reviews/${reviewId}/reply`, { comment });
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, replyStatus: 'replied' as const, replyText: comment, replyCreatedAt: new Date().toISOString().split('T')[0] }
          : r
      )
    );
  }, []);

  return { reviews, loading, error, refetch: fetchReviews, submitReply };
};
