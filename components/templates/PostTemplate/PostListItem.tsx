import React from 'react';
import { Text } from '@/atoms/Text';
import { cn } from '@/utils/cn';

export interface PostListItemProps {
  post: {
    id: number;
    bgColor: string;
    title: string;
    tags: string;
    rate: number;
    views: number;
    date: string;
  };
  onClick?: () => void;
}

export const PostListItem: React.FC<PostListItemProps> = ({ post, onClick }) => {
  return (
    <div 
      className="relative w-full h-[158px] border-b border-[#C4C4C4]/20 flex overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      {/* 左側の画像 */}
      <div 
        className="w-[128px] h-[160px] flex-shrink-0 -mt-[1px] ml-[10px]"
        style={{ backgroundColor: post.bgColor }}
      />
      
      {/* 右側のコンテンツエリア */}
      <div className="flex-1 pl-[23px] pr-[10px] py-[3px] relative">
        {/* タイトル */}
        <Text className="text-[18px] font-bold leading-[1.2] truncate pr-8">
          {post.title}
        </Text>

        {/* 右上のアイコン（Instagram?） */}
        <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
             {/* プレースホルダー */}
        </div>

        {/* ハッシュタグ */}
        <Text className="text-[13px] text-gray-600 mt-2 line-clamp-2 leading-[1.2]">
          {post.tags}
        </Text>

        {/* 統計情報 */}
        <div className="mt-4 space-y-2">
          {/* 集客誘導率 */}
          <div className="flex items-center justify-between pr-8">
            <Text className="text-[14px]">集客誘導率</Text>
            <div className="flex items-baseline">
              <Text className="text-[20px] font-bold text-[#00A48D]">{post.rate.toFixed(1)}</Text>
              <Text className="text-[18px] ml-1">％</Text>
            </div>
          </div>

          {/* プロフィール閲覧数 */}
          <div className="flex items-center justify-between pr-8">
            <Text className="text-[14px]">プロフィール閲覧数</Text>
            <div className="flex items-baseline">
              <Text className="text-[16px]">{post.views}</Text>
              <Text className="text-[14px] ml-1">回</Text>
            </div>
          </div>
        </div>

        {/* 日付 */}
        <div className="absolute bottom-3 right-8">
          <Text className="text-[12px] text-gray-500">{post.date}</Text>
        </div>
        
        {/* 右端の矢印 */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <svg width="7" height="16" viewBox="0 0 7 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L6 8L1 15" stroke="rgba(0,0,0,0.6)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
