import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';
import { Text } from '@/atoms/Text';
import { Button } from '@/components/atoms/Button';
import { Review } from '@/test/mock/reviewMock';

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

function StreamlineStar1(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 14 14" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.49 1.09L9.08 4.3a.51.51 0 0 0 .41.3l3.51.52a.54.54 0 0 1 .3.93l-2.53 2.51a.53.53 0 0 0-.16.48l.61 3.53a.55.55 0 0 1-.8.58l-3.16-1.67a.59.59 0 0 0-.52 0l-3.16 1.67a.55.55 0 0 1-.8-.58L3.39 9a.53.53 0 0 0-.16-.48L.67 6.05A.54.54 0 0 1 1 5.12l3.51-.52a.51.51 0 0 0 .41-.3l1.59-3.21a.54.54 0 0 1 .98 0"
      />
    </svg>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <StreamlineStar1
          key={i}
          style={{
            fontSize: '16px',
            fill: i < rating ? '#ffa500' : 'none',
            stroke: i < rating ? '#ffa500' : '#ccc',
          }}
        />
      ))}
    </div>
  );
}

interface ReviewDetailModalProps {
  review: Review | null;
  mode: 'detail' | 'reply';
  onClose: () => void;
  onReplySubmit: (id: string, replyText: string) => void;
}

export const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({
  review,
  mode,
  onClose,
  onReplySubmit,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isReplying, setIsReplying] = useState(mode === 'reply');
  const [replyText, setReplyText] = useState('');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (review) {
      document.body.style.overflow = 'hidden';
      setIsReplying(mode === 'reply');
      setReplyText(review.replyText ?? '');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [review, mode]);

  if (!mounted || !review) return null;

  const displayImages = review.images.slice(0, 3);
  const extraCount = review.images.length - 3;

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onReplySubmit(review.id, replyText.trim());
  };

  const handleDraftSave = () => {
    // 下書き保存: ローカルstateに保持したまま閉じる
    onClose();
  };

  const handleImageClick = (index: number) => {
    router.push(`/review/image/${review.id}?index=${index}`);
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* モーダル本体: w-720px, max-h-90vh, bg-#f3f3f3 */}
      <div className="relative z-10 w-full max-w-[720px] max-h-[90vh] bg-[#f3f3f3] rounded-lg p-8 flex flex-col gap-6 overflow-y-auto">

        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Text className="text-base font-semibold text-gray-900">
            {isReplying ? '返信する' : '口コミ詳細'}
          </Text>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ユーザー情報 + 総合評価 */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
            {review.userName[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <Text className="text-sm font-bold">{review.userName}</Text>
              <Text className="text-gray-400 text-xs">{review.createdAt}</Text>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[#ffa500] text-base leading-none">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </span>
              <Text className="text-sm font-semibold text-[#d4a000]">{review.rating}.0</Text>
            </div>
          </div>
        </div>

        {/* サブ評価 */}
        <div className="bg-white rounded-lg p-4 flex flex-col gap-2">
          {(
            [
              { label: '食事', value: review.foodRate },
              { label: '雰囲気', value: review.atmosphereRate },
              { label: 'サービス', value: review.serviceRate },
            ] as const
          ).map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Text className="text-xs text-gray-500 w-14 shrink-0">{label}</Text>
              <StarRating rating={value} />
              <Text className="text-xs text-gray-500">{value}.0</Text>
            </div>
          ))}
        </div>

        {/* コメント (10行制限) */}
        <p className="text-sm text-gray-700 leading-relaxed line-clamp-10">{review.comment}</p>

        {/* 画像: 150x150px */}
        {review.images.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {displayImages.map((imgKey, idx) => {
              const imgSrc = shopReviewImageMap[imgKey];
              const isLast = idx === 2 && extraCount > 0;
              return (
                <div
                  key={idx}
                  className="relative w-[150px] h-[150px] rounded overflow-hidden cursor-pointer shrink-0"
                  onClick={() => handleImageClick(idx)}
                >
                  {imgSrc && (
                    <img
                      src={imgSrc.src}
                      alt={`口コミ画像 ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {isLast && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Text className="text-white text-sm font-semibold">+{extraCount}枚</Text>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/**その他 */}
        <div>
          <Text className="text-sm font-semibold text-gray-900">その他</Text>
          <div className="flex flex-col gap-2">
            <Text className="text-sm text-gray-700 leading-relaxed">待ち時間: {review.waitTime}分程度</Text>
            <Text className="text-sm text-gray-700 leading-relaxed">騒音レベル: {review.noiseLevel}</Text>
          </div>
        </div>

        {/* 既存の返信 (詳細モード) */}
        {!isReplying && review.replyStatus === 'replied' && review.replyText && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Text className="text-xs text-[#00A48D] font-semibold">オーナーの返信</Text>
              <Text className="text-xs text-gray-400">{review.replyCreatedAt}</Text>
            </div>
            <Text className="text-sm text-gray-700 leading-relaxed">{review.replyText}</Text>
          </div>
        )}

        {/* 返信フォーム */}
        {isReplying && (
          <div className="flex flex-col gap-2">
            <Text className="text-sm font-semibold text-gray-900">返信内容</Text>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="返信内容を入力してください..."
              rows={5}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-[#1aa382] focus:border-transparent bg-white"
            />
          </div>
        )}

        {/* フッター */}
        <div className="flex justify-center gap-6 mt-2">
          {isReplying ? (
            <>
              <Button
                onClick={handleDraftSave}
                className="bg-white border border-[#333] text-gray-700 px-6 py-3 rounded text-sm font-medium"
              >
                下書き保存
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!replyText.trim()}
                className="bg-[#1aa382] text-black px-6 py-3 rounded text-sm font-medium disabled:opacity-40"
              >
                返信を投稿する
              </Button>
              <Button
                onClick={onClose}
                className="bg-white border border-[#333] text-gray-700 px-6 py-3 rounded text-sm font-medium"
              >
                閉じる
              </Button>
            </>
          ) : (
            <>
              {review.replyStatus === 'unreplied' && (
                <Button
                  onClick={() => setIsReplying(true)}
                  className="bg-[#1aa382] text-black px-6 py-3 rounded text-sm font-medium"
                >
                  返信する
                </Button>
              )}
              <Button
                onClick={onClose}
                className="bg-white border border-[#333] text-gray-700 px-6 py-3 rounded text-sm font-medium"
              >
                閉じる
              </Button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
