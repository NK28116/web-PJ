import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React, { useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';

type PlanStatus = 'active' | 'inactive';

const PLAN_DATA = {
  name: 'Light プラン',
  price: '30,000',
  currency: '円(税抜)',
  interval: '年契約',
  paymentMethod: 'Web口座振替',
  startDate: '2026/01/01',
  endDate: '2026/12/31',
  nextRenewalDate: '2027/01/01',
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
  const [planStatus, setPlanStatus] = useState<PlanStatus>('active');
  const [isAutoRenewal, setIsAutoRenewal] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCancel = () => {
    setPlanStatus('inactive');
    setIsAutoRenewal(false);
    setIsMenuOpen(false);
  };

  const handleStopAutoRenewal = () => {
    setIsAutoRenewal(false);
    setIsMenuOpen(false);
  };

  const handleSubscribe = () => {
    setPlanStatus('active');
    setIsAutoRenewal(true);
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
                    {PLAN_DATA.name}
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
            {planStatus === 'active' && (
              <div className="flex justify-between">
                  <Text className="text-[14px] text-black">契約期間</Text>
                  <Text className="text-[14px] text-black">{PLAN_DATA.startDate} - {PLAN_DATA.endDate}</Text>
              </div>
            )}
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">月額料金</Text>
                <Text className="text-[14px] text-black">{PLAN_DATA.price} {PLAN_DATA.currency}</Text>
            </div>
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">支払方法</Text>
                <Text className="text-[14px] text-black">{PLAN_DATA.paymentMethod}</Text>
            </div>
            {planStatus === 'active' && (
              <div className="flex justify-between">
                  <Text className="text-[14px] text-black">更新日</Text>
                  {isAutoRenewal ? (
                    <Text className="text-[14px] text-black">{PLAN_DATA.nextRenewalDate} (自動更新)</Text>
                  ) : (
                    <Text className="text-[14px] text-red-500">自動更新が設定されていません</Text>
                  )}
              </div>
            )}
        </div>

        {/* プラン変更ブロック */}
        <div className="border border-gray-300 bg-white">
             <div className="border-b border-gray-300 p-2">
                <Text className="text-[14px] text-black">プラン変更</Text>
             </div>
             <div className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                    <Text>
                      Basic プラン
                    </Text>
                    <Button className="text-[14px] text-black">アップグレード</Button>
                </div>
                <div className="flex items-center gap-3">
                    <Text>
                      Pro プラン
                    </Text>
                    <Button className="text-[14px] text-black">アップグレード</Button>
                </div>
             </div>
        </div>

        {/* 契約するボタン (未契約時のみ) */}
        {planStatus === 'inactive' && (
          <div className="flex justify-center">
            <Button
              onClick={handleSubscribe}
              className="border border-orange-400 text-orange-400 px-6 py-2 text-[12px]"
            >
              契約する
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
