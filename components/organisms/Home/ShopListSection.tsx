import React from 'react';
import { Text } from '@/atoms/Text';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

export type ShopStatus = 'pending' | 'linked' | 'error';

export interface Shop {
  id: string;
  email: string;
  status: ShopStatus;
  logoText?: string;
}

export interface ShopListSectionProps {
  className?: string;
  shops: Shop[];
  onShopClick?: (shopId: string) => void;
}

export const ShopListSection: React.FC<ShopListSectionProps> = ({
  className,
  shops,
  onShopClick,
}) => {
  const { user } = useAuth();

  return (
    <section className={cn('space-y-3', className)}>
      {/* アカウント情報 */}
      {(user.email || user.wyzeId) && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-1">
          <Text className="text-[13px] font-bold text-gray-500">アカウント情報</Text>
          {user.email && (
            <Text className="text-[13px] text-black">
              メールアドレス: {user.email}
            </Text>
          )}
          {user.wyzeId && (
            <Text className="text-[13px] text-black">
              WyzeID: {user.wyzeId}
            </Text>
          )}
        </div>
      )}

      <Text className="text-[15px] font-normal text-black pl-2">
        店舗一覧
      </Text>

      <div className="space-y-3">
        {shops.map((shop) => (
          <ShopCard
            key={shop.id}
            shop={shop}
            onClick={() => onShopClick?.(shop.id)}
          />
        ))}
      </div>
    </section>
  );
};

interface ShopCardProps {
  shop: Shop;
  onClick?: () => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onClick }) => {
  const statusConfig = getStatusConfig(shop.status);

  return (
    <div
      className="border border-gray-300 rounded-lg p-4 space-y-2 bg-transparent cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <Text className="text-[24px] font-normal text-black leading-tight">
            ID: {shop.id}
          </Text>
          <Text className="text-[14px] font-normal text-black mt-1">
            {shop.email}
          </Text>
        </div>
        <div className="w-16 h-16 flex items-center justify-center">
          <span className="text-4xl font-serif text-black">
            {shop.logoText ?? 'w'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <div
          className={cn('w-3 h-3 rounded-full', statusConfig.dotColor)}
        />
        <Text className="text-[12px] text-black">{statusConfig.label}</Text>
      </div>
    </div>
  );
};

interface StatusConfig {
  label: string;
  dotColor: string;
}

const getStatusConfig = (status: ShopStatus): StatusConfig => {
  switch (status) {
    case 'pending':
      return { label: '連携待ち', dotColor: 'bg-[#3498DB]' };
    case 'linked':
      return { label: '連携済み', dotColor: 'bg-[#2ECC71]' };
    case 'error':
      return { label: 'エラー', dotColor: 'bg-[#E74C3C]' };
    default:
      return { label: '不明', dotColor: 'bg-gray-400' };
  }
};
