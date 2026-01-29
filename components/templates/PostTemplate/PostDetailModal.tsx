import React from 'react';
import { Modal } from '@/components/organisms/Modal';
import { Text } from '@/components/atoms/Text';
import { Button } from '@/components/atoms/Button';
import type { Post } from './PostTemplate';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
  onStatusChange?: (postId: number) => void;
  formatDate?: (dateString: string) => string;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  isOpen,
  onClose,
  post,
  onStatusChange,
  formatDate,
}) => {
  if (!post) return null;

  const isHidden = post.status === '非表示';
  const displayDate = formatDate ? formatDate(post.date) : post.date;

  const handleStatusToggle = () => {
    if (onStatusChange) {
      onStatusChange(post.id);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <Text className="font-bold text-sm">{post.username}</Text>
            <div
              className={`px-2 py-[2px] border text-[10px] rounded ${
                isHidden
                  ? 'border-gray-500 text-gray-500 bg-gray-100'
                  : 'border-[#00A48D] text-[#00A48D] bg-white'
              }`}
            >
              {post.status}
            </div>
          </div>
          <Button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6L18 18" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Button>
        </div>

        <div className="overflow-y-auto p-5 flex-1 scrollbar-hide">
          {/* 画像エリア */}
          <div
            className="w-full aspect-square relative mb-5 border border-gray-100"
            style={{ backgroundColor: post.bgColor }}
          >
            {/* 画像内の黄色い帯 */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#F4D03F] p-3">
              {post.isNew && (
                <Text className="text-[10px] font-bold leading-none mb-1">NEW</Text>
              )}
              <Text className="font-bold text-xs uppercase tracking-wide truncate">
                {post.title.replace(/^【.*?】/, '')}
              </Text>
            </div>
          </div>

          {/* タイトル & 本文 */}
          <div className="mb-5">
            <Text className="font-bold text-base mb-3 leading-tight">{post.title}</Text>
            <Text className="text-[13px] whitespace-pre-wrap leading-relaxed text-[#333333]">
              {post.content || '投稿の本文がここに入ります。'}
            </Text>
            <div className="text-right mt-2">
              <Text className="text-[12px] text-gray-500">{displayDate}</Text>
            </div>
          </div>

          {/* タグエリア */}
          <div className="border-t border-b border-gray-200 py-3 mb-5">
             <Text className="text-[13px] font-bold mb-1"># タグ</Text>
             <Text className="text-[13px] text-gray-600">{post.tags}</Text>
          </div>

          {/* 統計エリア */}
          <div className="space-y-4 mb-2">
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <Text className="text-[13px] text-gray-600">集客誘導率</Text>
                <div className="flex items-baseline gap-1">
                  <Text className="text-2xl font-bold text-[#00A48D]">{post.rate.toFixed(1)}</Text>
                  <Text className="text-sm text-[#00A48D]">%</Text>
                </div>
              </div>
              {/* プログレスバー */}
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden relative">
                <div 
                  className="bg-[#00A48D] h-full rounded-full absolute left-0 top-0" 
                  style={{ width: `${Math.min(post.rate, 100)}%` }}
                />
                 {/* インジケーター（三角形） - 簡易的な表現 */}
                 <div 
                    className="absolute top-full mt-0.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-[#00A48D]"
                    style={{ left: `calc(${Math.min(post.rate, 100)}% - 4px)` }}
                 />
              </div>
            </div>
          </div>
        </div>

        {/* フッターアクション */}
        <div className="p-4 flex gap-3 justify-center pb-6">
          <Button className="px-4 py-2 border border-[#C4C4C4] rounded-md text-[13px] text-gray-700 font-bold hover:bg-gray-50 transition-colors">
            投稿を編集
          </Button>
          <Button
            onClick={handleStatusToggle}
            className={`px-4 py-2 border rounded-md text-[13px] font-bold transition-colors ${
              isHidden
                ? 'border-[#00A48D] text-[#00A48D] hover:bg-[#00A48D]/10'
                : 'border-[#C4C4C4] text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isHidden ? '表示する' : '非表示にする'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
