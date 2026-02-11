import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

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
                    Light プラン
                </Text>
                <div className="border border-[#00A48D] text-[#00A48D] px-2 py-0.5 text-[12px]">
                    契約中
                </div>
            </div>
        </div>

        {/* 契約情報ブロック */}
        <div className="border border-gray-300 p-4 space-y-3 bg-white">
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">契約期間</Text>
                <Text className="text-[14px] text-black">2026/01/01 - 2026/12/31</Text>
            </div>
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">月額料金</Text>
                <Text className="text-[14px] text-black">30,000 円(税抜)</Text>
            </div>
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">支払方法</Text>
                <Text className="text-[14px] text-black">Web口座振替</Text>
            </div>
            <div className="flex justify-between">
                <Text className="text-[14px] text-black">更新日</Text>
                <Text className="text-[14px] text-black">2027/01/01 (自動更新)</Text>
            </div>
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
                    <Button className="text-[14px] text-black">Basicへ変更</Button>
                </div>
                <div className="flex items-center gap-3">
                    <Text>
                      Pro プラン
                    </Text>
                    <Button className="text-[14px] text-black">Proへ変更</Button>
                </div>
                <div>
                  ※現在開発中です
                </div>
             </div>
        </div>

      </div>
    </BaseTemplate>
  );
};
