import { Text } from '@/atoms/Text';
import { SideMenu } from '@/organisms/SideMenu';
import { cn } from '@/utils/cn';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { IoMdMenu } from "react-icons/io";

export interface HeaderProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
  customTabLabels?: { [key: string]: string };
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
  customTabLabels,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, []);

  const handleTabClick = (tab: 'home' | 'post' | 'report' | 'auto-reply') => {
    onTabChange?.(tab);
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
    <>
      <div
        className={cn(
          'w-full bg-white flex flex-col',
          className
        )}
      >
        {/* ロゴエリア */}
        <div className="relative" ref={headerRef}>
          {/* 背景色の矩形 */}
          <div
            className="absolute inset-x-0 top-0 h-[54px]"
            style={{ backgroundColor: '#00A48D' }}
          />

          {/* ロゴテキスト */}
          <div className="relative z-10 flex items-center justify-between h-[54px] px-[18px]">
            <Text
              as="h1"
              className="text-[24px] leading-[1.546em]"
              style={{
                fontFamily: "'Kdam Thmor Pro', sans-serif",
                fontWeight: 400,
                color: '#FFFAFA',
              }}
            >
              wyze
            </Text>

            {/* ハンバーガーメニュー */}
            <button 
              className="flex flex-col gap-[6px] focus:outline-none"
              onClick={() => setIsMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <IoMdMenu size={24} color="#FFFAFA" />
            </button>
          </div>
        </div>

        {/* ナビゲーションタブ */}
        <div className="relative ">
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
                  {customTabLabels?.[tab.id] || tab.label}
                </button>

                {/* アクティブインジケーター */}
                {activeTab === tab.id && (
                  <div
                    className="mt-1 h-[3px] w-[45px] mx-auto"
                    style={{
                      backgroundColor: '#00A48D',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 区切り線（下） */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-wyze-primary" />
        </div>
      </div>

      {/* サイドメニュー */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} top={headerHeight}>
        <div>
          <ul className="grid grid-cols-1 divide-y divide-black   border-wyze-primary border-2 h-min ">
            <li><a href="/home" className="text-lg m-4">ホーム</a></li>
            <li><a href="/current-features" className="text-lg m-4">ご利用中の機能</a></li>
            <li><a href="/billing" className="text-lg m-4">ご請求内容</a></li>
            <li><a href="/account" className="text-lg m-4">アカウント情報</a></li>
            <li><a href="#" className="text-lg m-4">お問い合わせ</a></li>
            <li><a href="#" className="text-lg m-4">ログアウト</a></li>
          </ul>
        </div>
      </SideMenu>
    </>
  );
};
