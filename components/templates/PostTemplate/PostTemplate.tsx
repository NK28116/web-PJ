import React, { useState } from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import { cn } from '@/utils/cn';
import { PostListItem } from './PostListItem';
import { PostDetailModal } from './PostDetailModal';
import { Button } from '@/components/atoms/Button/Button';
import { Modal } from '@/components/organisms/Modal';

const GridIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3H10V10H3V3Z"
      fill={active ? '#00A48D' : '#C4C4C4'}
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M14 3H21V10H14V3Z"
      fill={active ? '#00A48D' : '#C4C4C4'}
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M14 14H21V21H14V14Z"
      fill={active ? '#00A48D' : '#C4C4C4'}
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M3 14H10V21H3V14Z"
      fill={active ? '#00A48D' : '#C4C4C4'}
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

const ListIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 12H21"
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 6H21"
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3 18H21"
      stroke={active ? '#00A48D' : '#C4C4C4'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 1L5 5L9 1"
      stroke="#333333"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export interface PostTemplateProps {
  className?: string;
}

export const PostTemplate: React.FC<PostTemplateProps> = () => {
  // ダミーデータ
  const posts = Array.from({ length: 27 }, (_, i) => ({
    id: i,
    bgColor: ['#2D3748', '#4FD1C5', '#3182CE', '#E53E3E'][i % 4],
    title: '【NEW】Smash Double Cheese Burgar',
    content: 'パティとチーズは同じものを使っています！\n変更点は、\n・グリルドオニオン\n・ピクルス\n・オーロラソース\n\n既存のタルタルソースをかけたマッシュダブルチーズバーガーも好評いただいておりますが、こちらもかなり自信作です！\nまだメニューに載ってないので、お声がけください！',
    tags: '#cheeseburger #中目黒 #ハンバーガー',
    rate: 30.4,
    views: 196,
    date: 'July 6, 2025',
    username: '@wyzesystem_1212',
    status: '表示中'
  }));

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  // postsの型推論を利用してstateの型を定義
  const [selectedPost, setSelectedPost] = useState<typeof posts[0] | null>(null);
  const [open, setOpen] = useState(false);
const [order, setOrder] = useState("postDate");


  return (
    <BaseTemplate activeTab="post">
      <div className="flex flex-col gap-4">
        {/* コントロールバー */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E1E1E1]">
          {/* 左側：ビュー切り替えと件数 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button onClick={() => setViewMode('grid')} className="p-1">
                <GridIcon active={viewMode === 'grid'} />
              </Button>
              <Button onClick={() => setViewMode('list')} className="p-1">
                <ListIcon active={viewMode === 'list'} />
              </Button>
            </div>
            
            {/* 縦線 */}
            <div className="w-px h-6 bg-[#E1E1E1]" />
            
            <Text className="text-base">27 件</Text>
          </div>

          {/* 右側：並べ替え */}
          <div className="flex items-center gap-2">
            <Text className="text-base">表示中</Text>
 <Button onClick={() => setOpen(true)}>
  並び順
</Button>

<Modal isOpen={open} onClose={() => setOpen(false)}>
  <ul className="text-sm">
    {[
      { label: "投稿順", value: "postDate" },
      { label: "集客効果が高い順", value: "effect" },
      { label: "いいねが多い順", value: "favorite" },
      { label: "コメントが多い順", value: "comment" },
      { label: "アクセスが多い順", value: "access" },
    ].map((item) => (
      <li
        key={item.value}
        onClick={() => {
          setOrder(item.value);
          setOpen(false);
        }}
        className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
      >
        {item.label}
      </li>
    ))}
  </ul>
</Modal>
          </div>
        </div>

        {/* コンテンツ */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-3 gap-5 pt-2">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square w-full rounded-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: post.bgColor }}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {posts.map((post) => (
              <PostListItem 
                key={post.id} 
                post={post} 
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        )}
      </div>

      <PostDetailModal 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        post={selectedPost}
      />
    </BaseTemplate>
  );
};
