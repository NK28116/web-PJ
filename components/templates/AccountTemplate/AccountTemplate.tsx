import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MdKeyboardArrowLeft, MdNotifications, MdMenu } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';

interface AccountData {
  profile: {
    shopName: string;
    address: string;
    phone: string;
  };
  owner: {
    name: string;
    email: string;
  };
  notifications: {
    monthlyReport: boolean;
    competitorAlert: boolean;
    reviewAlert: boolean;
  };
}

const MOCK_ACCOUNT_DATA: AccountData = {
  profile: {
    shopName: 'サンプル店舗 渋谷店',
    address: '東京都渋谷区神南1-2-3',
    phone: '03-1234-5678',
  },
  owner: {
    name: '山田 太郎',
    email: 'taro.yamada@example.com',
  },
  notifications: {
    monthlyReport: true,
    competitorAlert: false,
    reviewAlert: true,
  },
};

type NotificationKey = keyof AccountData['notifications'];

const NOTIFICATION_LABELS: Record<NotificationKey, string> = {
  monthlyReport: '月次レポート',
  competitorAlert: '競合変動アラート',
  reviewAlert: '低評価口コミアラート',
};

export interface AccountTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
}

export const AccountTemplate: React.FC<AccountTemplateProps> = ({
  className,
  activeTab,
  onTabChange,
}) => {
  const router = useRouter();
  const [profile, setProfile] = useState(MOCK_ACCOUNT_DATA.profile);
  const [owner, setOwner] = useState(MOCK_ACCOUNT_DATA.owner);
  const [notifications, setNotifications] = useState(MOCK_ACCOUNT_DATA.notifications);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [menuOpenProfile, setMenuOpenProfile] = useState(false);
  const [menuOpenOwner, setMenuOpenOwner] = useState(false);

  // 編集用の一時State
  const [editProfile, setEditProfile] = useState(profile);
  const [editOwner, setEditOwner] = useState(owner);

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditingProfile(false);
    console.log('Save Profile', editProfile);
  };

  const handleCancelProfile = () => {
    setEditProfile(profile);
    setIsEditingProfile(false);
  };

  const handleSaveOwner = () => {
    setOwner(editOwner);
    setIsEditingOwner(false);
    console.log('Save Owner', editOwner);
  };

  const handleCancelOwner = () => {
    setEditOwner(owner);
    setIsEditingOwner(false);
  };

  const handleToggleNotification = (key: NotificationKey) => {
    if (isSaving) return;
    setIsSaving(true);
    setNotifications((s) => ({ ...s, [key]: !s[key] }));
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-4 pb-20">

        {/* ヘッダー部分 */}
        <div className="flex items-center justify-between border-b border-gray-300 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[16px] text-black font-normal"
          >
            <MdKeyboardArrowLeft size={24} />
            <span>店舗・アカウント設定</span>
          </button>
          <div className="flex items-center gap-3">
              
          </div>
        </div>

        {/* 店舗プロフィール情報セクション */}
        <div className="border border-gray-300 rounded bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">店舗プロフィール情報</Text>
            <div className="relative">
              <button
                onClick={() => setMenuOpenProfile(!menuOpenProfile)}
                aria-label="店舗プロフィールメニュー"
                className="p-1 text-gray-600 hover:text-black"
              >
                <BsThreeDotsVertical size={16} />
              </button>
              {menuOpenProfile && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 shadow-md z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setEditProfile(profile);
                      setIsEditingProfile(true);
                      setMenuOpenProfile(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-[14px] text-black hover:bg-gray-100"
                  >
                    変更する
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 space-y-2">
            {isEditingProfile ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1">店舗名</label>
                    <input
                      type="text"
                      value={editProfile.shopName}
                      onChange={(e) => setEditProfile((s) => ({ ...s, shopName: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1">住所</label>
                    <input
                      type="text"
                      value={editProfile.address}
                      onChange={(e) => setEditProfile((s) => ({ ...s, address: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1">電話番号</label>
                    <input
                      type="text"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile((s) => ({ ...s, phone: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <Button
                    onClick={handleCancelProfile}
                    className="flex-1 border border-gray-300 text-[14px] text-black py-2"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-[#00A48D] text-blue-600 text-[14px] py-2"
                  >
                    保存
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">店舗名</Text>
                  <Text className="text-[14px] text-black">{profile.shopName}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">住所</Text>
                  <Text className="text-[14px] text-black text-right max-w-[200px]">{profile.address}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">電話番号</Text>
                  <Text className="text-[14px] text-black">{profile.phone}</Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* オーナーアカウント設定セクション */}
        <div className="border border-gray-300 rounded bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">オーナーアカウント設定</Text>
            <div className="relative">
              <button
                onClick={() => setMenuOpenOwner(!menuOpenOwner)}
                aria-label="オーナー設定メニュー"
                className="p-1 text-gray-600 hover:text-black"
              >
                <BsThreeDotsVertical size={16} />
              </button>
              {menuOpenOwner && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 shadow-md z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setEditOwner(owner);
                      setIsEditingOwner(true);
                      setMenuOpenOwner(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-[14px] text-black hover:bg-gray-100"
                  >
                    変更する
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="p-4 space-y-2">
            {isEditingOwner ? (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1">担当者名</label>
                    <input
                      type="text"
                      value={editOwner.name}
                      onChange={(e) => setEditOwner((s) => ({ ...s, name: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1">ログインメールアドレス</label>
                    <input
                      type="email"
                      value={editOwner.email}
                      onChange={(e) => setEditOwner((s) => ({ ...s, email: e.target.value }))}
                      className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] text-gray-500 mb-1">パスワード</label>
                    <input
                      type="password"
                      placeholder="********"
                      className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                      readOnly
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <Button
                    onClick={handleCancelOwner}
                    className="flex-1 border border-gray-300 text-[14px] text-black py-2"
                  >
                    キャンセル
                  </Button>
                  <Button
                    onClick={handleSaveOwner}
                    className="flex-1 bg-[#00A48D] text-blue-600 text-[14px] py-2"
                  >
                    保存
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">担当者名</Text>
                  <Text className="text-[14px] text-black">{owner.name}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">ログインメールアドレス</Text>
                  <Text className="text-[14px] text-black text-right">{owner.email}</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">パスワード</Text>
                  <Text className="text-[14px] text-black">********</Text>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 通知設定セクション */}
        <div className="border border-gray-300 rounded bg-white">
          <div className="border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">通知設定</Text>
          </div>
          <div className="p-4 space-y-4">
            {(Object.keys(NOTIFICATION_LABELS) as NotificationKey[]).map((key) => (
              <div key={key} className="flex items-center justify-between">
                <Text className="text-[14px] text-black">{NOTIFICATION_LABELS[key]}</Text>
                <button
                  role="switch"
                  aria-checked={notifications[key]}
                  aria-label={NOTIFICATION_LABELS[key]}
                  onClick={() => handleToggleNotification(key)}
                  disabled={isSaving}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[key] ? 'bg-[#00A48D]' : 'bg-gray-300'
                  } ${isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      notifications[key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </BaseTemplate>
  );
};
