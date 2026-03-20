import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { useBilling } from '@/hooks/useBilling';
import { useProfile } from '@/hooks/useProfile';
import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';

type PlanStatus = 'active' | 'inactive';

const PLAN_DISPLAY: Record<string, { name: string; price: string }> = {
  light: { name: 'Light プラン', price: '10,000' },
  basic: { name: 'Basic プラン', price: '29,800' },
  pro: { name: 'Pro プラン', price: '59,800' },
};

const PLAN_DATA_DEFAULT = {
  currency: '円(税抜)',
  paymentMethod: 'クレジットカード',
};

export interface CurrentFeaturesTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
}

export const CurrentFeaturesTemplate: React.FC<CurrentFeaturesTemplateProps> = ({
  className,
  activeTab,
  onTabChange,
}) => {
  const { profile } = useProfile();
  const planTier = profile?.plan_tier || 'free';
  const planStatus: PlanStatus = planTier !== 'free' ? 'active' : 'inactive';
  const planInfo = PLAN_DISPLAY[planTier] || { name: '未契約', price: '0' };

  const [isAutoRenewal, setIsAutoRenewal] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { startCheckout, loading: billingLoading, error: billingError } = useBilling();

  const PRICE_IDS = {
    light: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT || '',
    basic: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || '',
    pro: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
  } as const;

  const handleCancel = () => {
    // TODO: Stripe Portal経由で解約API呼び出し
    setIsAutoRenewal(false);
    setIsMenuOpen(false);
  };

  const handleStopAutoRenewal = () => {
    setIsAutoRenewal(false);
    setIsMenuOpen(false);
  };

  const handleSubscribe = () => {
    startCheckout(PRICE_IDS.light);
  };

  const handleUpgrade = (priceId: string) => {
    startCheckout(priceId);
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
            <div className="flex items-center gap-4">
                <Text className="text-[16px] text-black font-normal">
                  現在のプラン
                </Text>
            </div>
            <div className="flex items-center gap-2">
                <Text className="text-[16px] text-black font-normal">
                    {planInfo.name}
                </Text>
                {planStatus === 'active' ? (
                  <div className="border border-[#00A48D] text-[#00A48D] px-2 py-0.5 text-[12px]">
                    契約中
                  </div>
                ) : (
                  <div className="border border-gray-400 text-gray-400 px-2 py-0.5 text-[12px]">
                    未契約
                  </div>
                )}
                {/* ミートボールメニュー */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="メニュー"
                    className="p-1 text-gray-600 hover:text-black"
                  >
                    <BsThreeDotsVertical size={18} />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 shadow-md z-10 min-w-[160px]">
                      <button
                        onClick={handleCancel}
                        className="block w-full text-left px-4 py-2 text-[14px] text-black hover:bg-gray-100"
                      >
                        解約
                      </button>
                      <button
                        onClick={handleStopAutoRenewal}
                        className="block w-full text-left px-4 py-2 text-[14px] text-black hover:bg-gray-100"
                      >
                        自動更新を停止
                      </button>
                    </div>
                  )}
                </div>
            </div>
        </div>

        {/* 契約情報ブロック */}
        <div className="border border-gray-300 p-4 space-y-3 bg-white">
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">月額料金</Text>
                <Text className="text-[14px] text-black">{planInfo.price} {PLAN_DATA_DEFAULT.currency}</Text>
            </div>
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">支払方法</Text>
                <Text className="text-[14px] text-black">{PLAN_DATA_DEFAULT.paymentMethod}</Text>
            </div>
            {planStatus === 'active' && (
              <div className="flex justify-between">
                  <Text className="text-[14px] text-black">自動更新</Text>
                  {isAutoRenewal ? (
                    <Text className="text-[14px] text-[#00A48D]">有効</Text>
                  ) : (
                    <Text className="text-[14px] text-red-500">停止中</Text>
                  )}
              </div>
            )}
        </div>

        {billingError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-[14px] p-3">
            {billingError}
          </div>
        )}

        {/* プラン変更ブロック（契約中のみ表示） */}
        {planStatus === 'active' && (() => {
          const tierOrder = ['light', 'basic', 'pro'];
          const currentIdx = tierOrder.indexOf(planTier);
          const upgradePlans = tierOrder
            .filter((_, i) => i > currentIdx)
            .map((id) => ({ id, ...PLAN_DISPLAY[id], priceId: PRICE_IDS[id as keyof typeof PRICE_IDS] }));
          if (upgradePlans.length === 0) return null;
          return (
            <div className="border border-gray-300 bg-white">
              <div className="border-b border-gray-300 p-2">
                <Text className="text-[14px] text-black">プラン変更</Text>
              </div>
              <div className="p-4 space-y-2">
                {upgradePlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <Text className="text-[14px] text-black">{plan.name}（¥{plan.price}/月）</Text>
                    <Button
                      className="text-[14px] text-black"
                      onClick={() => handleUpgrade(plan.priceId)}
                      disabled={billingLoading}
                    >
                      {billingLoading ? '処理中...' : 'アップグレード'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 契約するボタン (未契約時のみ) */}
        {planStatus === 'inactive' && (
          <div className="flex justify-center">
            <Button
              onClick={handleSubscribe}
              className="border border-orange-400 text-orange-400 px-6 py-2 text-[12px]"
              disabled={billingLoading}
            >
              {billingLoading ? '処理中...' : '契約する'}
            </Button>
          </div>
        )}

        {/* --- DEV_ONLY: 状態リセットボタン（リリース前に削除） --- */}
        {planStatus === 'active' && !isAutoRenewal && (
          <div className="flex justify-center">
            <Button
              onClick={() => setIsAutoRenewal(true)}
              className="border border-orange-400 text-orange-400 px-6 py-2 text-[12px]"
            >
              [DEV] 自動更新を再開
            </Button>
          </div>
        )}
        {/* --- /DEV_ONLY --- */}

      </div>
    </BaseTemplate>
  );
};
