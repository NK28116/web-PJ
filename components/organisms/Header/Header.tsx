import { Text } from '@/atoms/Text';
import { Button } from '@/components/atoms/Button';
import type { Notification } from '@/molecules/NotificationItem';
import { LogoutModal, NotificationModal } from '@/organisms/Modal';
import { SideMenu } from '@/organisms/SideMenu';
import { cn } from '@/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { IoMdMenu } from "react-icons/io";
import { MdKeyboardArrowLeft, MdNotifications, MdMenu } from 'react-icons/md';

export interface HeaderProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
  customTabLabels?: { [key: string]: string };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    storeName: 'Wyze Pizza',
    content: 'Googleビジネスプロフィールの連携が切れました。再連携をしてください。',
    receivedAt: new Date(Date.now() - 1 * 60 * 1000),
    isRead: false,
    redirectPath: '/home',
  },
  {
    id: '2',
    storeName: 'Wyze Pizza',
    content: '新しい口コミ（★4）が届きました。',
    receivedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: false,
    redirectPath: '/review',
  },
  {
    id: '3',
    storeName: 'Wyze Pizza',
    content: '11月はGoogleマップ上で3位まで上昇しました。プロフィール閲覧数は先月＋26%向上。',
    receivedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: false,
    redirectPath: '/report',
  },
  {
    id: '4',
    storeName: 'Wyze Pizza',
    content: '月次レポートが生成されました。確認してください。',
    receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isRead: true,
    redirectPath: '/report',
  },
  {
    id: '5',
    storeName: 'Wyze Pizza',
    content: '新しい投稿が公開されました。',
    receivedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    isRead: true,
    redirectPath: '/post',
  },
];

const tabs = [
  { id: 'home' as const, label: 'ホーム' },
  { id: 'post' as const, label: '投稿' },
  { id: 'report' as const, label: 'レポート' },
  { id: 'review' as const, label: '口コミ・返信' },
] as const;

export const Header: React.FC<HeaderProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
  customTabLabels,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationConfirm = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.clientHeight);
    }
  }, []);

  const handleTabClick = (tab: 'home' | 'post' | 'report' | 'review') => {
    onTabChange?.(tab);
    if (tab === 'home') {
      router.push('/home');
    } else if (tab === 'post') {
      router.push('/post');
    } else if (tab === 'report') {
      router.push('/report');
    } else if (tab === 'review') {
      router.push('/review');
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
            {/* 通知・メニューを右側にまとめて配置 */}
            <div className="flex items-center gap-4">
              {/* 通知アイコン */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="relative focus:outline-none"
                aria-label="通知を開く"
              >
                <MdNotifications
                  size={22}
                  className={unreadCount > 0 ? 'text-white' : 'text-gray-400'}
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {/* ハンバーガーメニュー */}
              <Button
                className="flex flex-col gap-[6px] focus:outline-none border-none"
                onClick={() => setIsMenuOpen(true)}
                aria-label="メニューを開く"
              >
                <IoMdMenu size={24} color="#FFFAFA" />
              </Button>
            </div>
          </div>
        </div>

        {/* ナビゲーションタブ */}
        <div className="relative ">
          {/* 区切り線（上） */}
          <div className="absolute top-0 left-0 right-0 h-px bg-white" />

          {/* タブリスト */}
          <div className="flex items-center justify-around pt-4 pb-3">
            {tabs.map((tab) => (
              <div key={tab.id} className="flex-1 flex flex-col items-center">
                <Button
                  onClick={() => handleTabClick(tab.id)}
                  className={cn(
                    'w-full py-2 text-base font-normal leading-[1.21em] text-center',
                    'transition-colors',
                    'border-none',
                    activeTab === tab.id ? 'text-black' : 'text-black'
                  )}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {customTabLabels?.[tab.id] || tab.label}
                </Button>

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

      {/* 通知モーダル */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        notifications={notifications}
        onConfirm={handleNotificationConfirm}
      />

      {/* ログアウトモーダル */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* サイドメニュー */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} top={headerHeight}>
        <div>
          <ul className="grid grid-cols-1 divide-y divide-black border-wyze-primary border-2 h-min ">
            <li><Link href="/current-features" className="text-lg m-4">プラン確認・変更</Link></li>
            <li><Link href="/billing" className="text-lg m-4">お支払い情報</Link></li>
            <li><Link href="/account" className="text-lg m-4">店舗・アカウント情報</Link></li>
            <li><a href="/help" className="text-lg m-4">サポート・ヘルプ</a></li>
            <li>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="text-lg m-4 w-full text-left"
              >
                ログアウト
              </button>
            </li>
          </ul>
        </div>
      </SideMenu>
    </>
  );
};
