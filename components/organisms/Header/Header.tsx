import React from 'react';
import { useRouter } from 'next/router';
import { StatusBar } from '@/organisms/StatusBar';
import { Text } from '@/atoms/Text';
import { cn } from '@/utils/cn';

export interface HeaderProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
}

const tabs = [
  { id: 'home' as const, label: 'ホーム' },
  { id: 'post' as const, label: '投稿' },
  { id: 'report' as const, label: 'レポート' },
  { id: 'auto-reply' as const, label: '自動返信' },
] as const;

export const Header: React.FC<HeaderProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
}) => {
  const router = useRouter();

  const handleTabClick = (tab: 'home' | 'post' | 'report' | 'auto-reply') => {
    onTabChange?.(tab);
    // ルーティング
    if (tab === 'home') {
      router.push('/home');
    } else if (tab === 'post') {
      router.push('/post');
    } else if (tab === 'report') {
      router.push('/report');
    } else if (tab === 'auto-reply') {
      router.push('/auto-reply');
    }
  };

  return (
    <div
      className={cn(
        'w-full bg-white flex flex-col',
        'max-w-[393px] mx-auto',
        className
      )}
    >
      {/* ステータスバー */}
      <StatusBar />

      {/* ロゴエリア */}
      <div className="relative">
        {/* 背景色の矩形 */}
        <div
          className="absolute inset-x-0 top-0 h-[62px]"
          style={{ backgroundColor: '#00A48D' }}
        />

        {/* ロゴテキスト */}
        <div className="relative z-10 flex items-center justify-center h-[62px]">
          <Text
            as="h1"
            className="text-[48px] leading-[1.546em] text-center"
            style={{
              fontFamily: "'Kdam Thmor Pro', sans-serif",
              fontWeight: 400,
              color: '#FFFAFA',
            }}
          >
            wyze
          </Text>
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div className="relative">
        {/* 区切り線（上） */}
        <div className="absolute top-0 left-0 right-0 h-px bg-white" />

        {/* タブリスト */}
        <div className="flex items-center justify-around pt-4 pb-3">
          {tabs.map((tab, index) => (
            <div key={tab.id} className="flex-1 flex flex-col items-center">
              <button
                onClick={() => handleTabClick(tab.id)}
                className={cn(
                  'w-full py-2 text-base font-normal leading-[1.21em] text-center',
                  'transition-colors',
                  activeTab === tab.id ? 'text-black' : 'text-black'
                )}
                style={{
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {tab.label}
              </button>

              {/* アクティブインジケーター */}
              {activeTab === tab.id && (
                <div
                  className="mt-1 h-px w-full"
                  style={{
                    background:
                      'linear-gradient(to right, #C4C4C4, rgba(0, 0, 0, 0.2))',
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* 区切り線（下） */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
      </div>
    </div>
  );
};

