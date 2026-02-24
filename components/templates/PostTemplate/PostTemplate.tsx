import { Text } from '@/atoms/Text';
import { Button } from '@/components/atoms/Button/Button';
import { Modal } from '@/components/organisms/Modal';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React, { useCallback, useMemo, useState } from 'react';
import { PostDetailModal } from './PostDetailModal';
import { PostListItem } from './PostListItem';
import { PostGridItem } from './PostGridItem';
import privatePostImg from '../../../test/mock/post/privatePost.png';
import publicPostImg from '../../../test/mock/post/publicPost.png';

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

export interface Post {
  id: number;
  bgColor: string;
  title: string;
  content: string;
  tags: string;
  rate: number;
  views: number;
  likes: number;
  comments: number;
  date: string;
  username: string;
  status: '表示中' | '非表示';
  isNew?: boolean;
  imageUrl?: string;
}

type PostOrder =
  | "postDate"
  | "effect"
  | "favorite"
  | "comment"
  | "access";

type FilterStatus = 'all' | 'visible' | 'hidden';

const sortOptions: { label: string; value: PostOrder }[] = [
  { label: "投稿順", value: "postDate" },
  { label: "集客効果が高い順", value: "effect" },
  { label: "いいねが多い順", value: "favorite" },
  { label: "コメントが多い順", value: "comment" },
  { label: "アクセスが多い順", value: "access" },
];

// ダミーデータ生成
const generateMockPosts = (): Post[] => {
  return Array.from({ length: 27 }, (_, i) => ({
    id: i,
    bgColor: ['#2D3748', '#4FD1C5', '#3182CE', '#E53E3E'][i % 4],
    title: '【NEW】Smash Double Cheese Burgar',
    content: 'パティとチーズは同じものを使っています！\n変更点は、\n・グリルドオニオン\n・ピクルス\n・オーロラソース\n\n既存のタルタルソースをかけたマッシュダブルチーズバーガーも好評いただいておりますが、こちらもかなり自信作です！\nまだメニューに載ってないので、お声がけください！',
    tags: '#cheeseburger #中目黒 #ハンバーガー',
    rate: Math.round((30 + Math.random() * 20) * 10) / 10,
    views: 196 + i * 17,
    likes: Math.floor(50 + Math.random() * 100),
    comments: Math.floor(5 + Math.random() * 30),
    date: new Date(2025, 6, 27 - i).toISOString(),
    username: '@wyzesystem_1212',
    status: i % 3 === 0 ? '非表示' : '表示中',
    isNew: i < 3,
    imageUrl: i % 5 === 0 ? privatePostImg.src : i % 5 === 1 ? publicPostImg.src : undefined,
  }));
};

// 日付フォーマット関数
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

export const PostTemplate: React.FC<PostTemplateProps> = () => {
  // ダミーデータをuseStateで管理
  const [posts, setPosts] = useState<Post[]>(() => generateMockPosts());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState<PostOrder>("postDate");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // 投稿更新ハンドラ
  const handleUpdatePost = useCallback((updatedPost: Post) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => post.id === updatedPost.id ? updatedPost : post)
    );
    setSelectedPost(null);
  }, []);

  // 投稿削除ハンドラ
  const handleDeletePost = useCallback((postId: number) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
    setSelectedPost(null);
  }, []);

  // ステータス変更ハンドラ
  const handleStatusChange = useCallback((postId: number) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, status: post.status === '表示中' ? '非表示' : '表示中' }
          : post
      )
    );
    // 選択中の投稿も更新
    setSelectedPost((prev) => {
      if (prev && prev.id === postId) {
        return { ...prev, status: prev.status === '表示中' ? '非表示' : '表示中' };
      }
      return prev;
    });
  }, []);

  const handleSortChange = (value: PostOrder) => {
    setOrder(value);
    setOpen(false);
  };

  const handleFilterToggle = () => {
    setFilterStatus((prev) => {
      if (prev === 'all') return 'visible';
      if (prev === 'visible') return 'hidden';
      return 'all';
    });
  };

  const sortedPosts = useMemo(() => {
    // フィルタリング処理
    let filteredPosts = posts;
    if (filterStatus === 'visible') {
      filteredPosts = posts.filter((post) => post.status === '表示中');
    } else if (filterStatus === 'hidden') {
      filteredPosts = posts.filter((post) => post.status === '非表示');
    }

    // ソート処理
    const sortablePosts = [...filteredPosts];
    switch (order) {
      case 'postDate':
        return sortablePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'effect':
        return sortablePosts.sort((a, b) => b.rate - a.rate);
      case 'access':
        return sortablePosts.sort((a, b) => b.views - a.views);
      case 'favorite':
        return sortablePosts.sort((a, b) => b.likes - a.likes);
      case 'comment':
        return sortablePosts.sort((a, b) => b.comments - a.comments);
      default:
        return sortablePosts;
    }
  }, [order, posts, filterStatus]);

  // フィルタ後の件数
  const postCount = sortedPosts.length;

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
            
            <Text className="text-base">{postCount} 件</Text>
          </div>

          {/* 右側：並べ替え */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFilterToggle}
              className={`text-base px-3 py-1 rounded-md border transition-colors ${
                filterStatus !== 'all'
                  ? 'border-[#00A48D] text-[#00A48D] bg-[#00A48D]/10'
                  : 'border-[#C4C4C4] text-gray-700'
              }`}
            >
              {filterStatus === 'all' ? '全て' : filterStatus === 'visible' ? '表示中' : '非表示'}
            </Button>
 <Button onClick={() => setOpen(true)}>
  並び順
</Button>
<ChevronDownIcon/>
<Modal isOpen={open} onClose={() => setOpen(false)}>
  <ul className="text-sm" role="menu">
    {sortOptions.map((item) => (
      <li
        key={item.value}
        onClick={() => handleSortChange(item.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleSortChange(item.value);
          }
        }}
        className="px-4 py-3 hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none"
        role="menuitem"
        tabIndex={0}
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
          <div className="grid grid-cols-3 gap-3 pt-2">
            {sortedPosts.map((post) => (
              <PostGridItem
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            {sortedPosts.map((post) => (
              <PostListItem
                key={post.id}
                post={post}
                onClick={() => setSelectedPost(post)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      <PostDetailModal
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        post={selectedPost}
        onStatusChange={handleStatusChange}
        onUpdate={handleUpdatePost}
        onDelete={handleDeletePost}
        formatDate={formatDate}
      />
    </BaseTemplate>
  );
};
