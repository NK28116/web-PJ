import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { reviewMockData } from '@/test/mock/reviewMock';

// Shop review images static imports
import shopReview1 from '../../../test/mock/shop-review/shopReview.png';
import shopReview2 from '../../../test/mock/shop-review/shopReview2.png';
import shopReview3 from '../../../test/mock/shop-review/shopReview3.png';
import shopReview4 from '../../../test/mock/shop-review/shopReview4.png';
import shopReview5 from '../../../test/mock/shop-review/shopReview5.png';
import shopReview6 from '../../../test/mock/shop-review/shopReview6.png';

const shopReviewImageMap: Record<string, { src: string }> = {
  'shopReview.png': shopReview1,
  'shopReview2.png': shopReview2,
  'shopReview3.png': shopReview3,
  'shopReview4.png': shopReview4,
  'shopReview5.png': shopReview5,
  'shopReview6.png': shopReview6,
};

export default function ReviewImagePage() {
  const router = useRouter();
  const { id, index } = router.query;

  const review = reviewMockData.find((r) => r.id === id);
  const initialIndex = typeof index === 'string' ? parseInt(index, 10) : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const touchStartX = useRef<number | null>(null);

  // URLのindexパラメータが変わったら同期
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const total = review?.images.length ?? 0;

  const goTo = (idx: number) => {
    const next = Math.max(0, Math.min(total - 1, idx));
    setCurrentIndex(next);
    router.replace(`/review/image/${id}?index=${next}`, undefined, { shallow: true });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff < -50) goTo(currentIndex + 1);
    else if (diff > 50) goTo(currentIndex - 1);
    touchStartX.current = null;
  };

  const imageKey = review?.images[currentIndex];
  const imgSrc = imageKey ? shopReviewImageMap[imageKey] : null;

  return (
    <>
      <Head>
        <title>口コミ画像 - Wyze System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="fixed inset-0 bg-black flex flex-col select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-white text-sm flex items-center gap-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            閉じる
          </button>
          {total > 1 && (
            <span className="text-white text-sm">
              {currentIndex + 1} / {total}
            </span>
          )}
          <div className="w-14" />
        </div>

        {/* 画像エリア（左右矢印付き） */}
        <div className="flex-1 flex items-center justify-center relative px-12">
          {/* 前へ */}
          {total > 1 && currentIndex > 0 && (
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-2 text-white bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="前の画像"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}

          {imgSrc ? (
            <img
              src={imgSrc.src}
              alt={`口コミ画像 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              draggable={false}
            />
          ) : (
            <p className="text-gray-400 text-sm">画像が見つかりません</p>
          )}

          {/* 次へ */}
          {total > 1 && currentIndex < total - 1 && (
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-2 text-white bg-black/40 hover:bg-black/60 rounded-full w-10 h-10 flex items-center justify-center"
              aria-label="次の画像"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {/* ドットインジケーター */}
        {total > 1 && (
          <div className="flex justify-center gap-1.5 py-4 shrink-0">
            {review!.images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                className={[
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  idx === currentIndex ? 'bg-white' : 'bg-gray-600',
                ].join(' ')}
                aria-label={`画像 ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
