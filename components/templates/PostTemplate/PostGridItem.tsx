import React from 'react';
import type { Post } from './PostTemplate';

export interface PostGridItemProps {
  post: Post;
  onClick?: () => void;
}

export const PostGridItem: React.FC<PostGridItemProps> = ({ post, onClick }) => {
  const isHidden = post.status === '非表示';

  return (
    <div
      className="relative aspect-square w-full rounded-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: post.bgColor }}
      onClick={onClick}
    >
      {/* 画像（imageUrlがある場合） */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="投稿画像"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* ステータスバッジ */}
      <div
        className={`absolute top-1 right-1 px-1.5 py-0.5 text-[10px] font-bold rounded ${
          isHidden
            ? 'bg-gray-600 text-white'
            : 'bg-[#00A48D] text-white'
        }`}
      >
        {post.status}
      </div>

      {/* NEWラベル（該当時のみ） */}
      {post.isNew && (
        <div className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#F4D03F] text-black">
          NEW
        </div>
      )}

      {/* 非表示時のオーバーレイ */}
      {isHidden && (
        <div className="absolute inset-0 bg-black/30" />
      )}
    </div>
  );
};
