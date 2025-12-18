import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React from 'react';
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";

export interface CurrentFeaturesTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
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
                    ご利用中の機能
                </Text>
            </div>
            <div className="flex items-center gap-2">
                <Text className="text-[16px] text-black font-normal">
                    ID:0001
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

        {/* 機能一覧ブロック */}
        <div className="border border-gray-300 bg-white">
             <div className="border-b border-gray-300 p-2">
                <Text className="text-[14px] text-black">ご利用中の機能</Text>
             </div>
             <div className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                    <MdCheckBox className="text-[#006355] text-lg" />
                    <Text className="text-[14px] text-black">Google連携</Text>
                </div>
                <div className="flex items-center gap-3">
                    <MdCheckBox className="text-[#006355] text-lg" />
                    <Text className="text-[14px] text-black">Instagram連携</Text>
                </div>
                <div className="flex items-center gap-3">
                    <MdCheckBox className="text-[#006355] text-lg" />
                    <Text className="text-[14px] text-black">レポート</Text>
                </div>
                <div className="flex items-center gap-3">
                    <MdCheckBox className="text-[#006355] text-lg" />
                    <Text className="text-[14px] text-black">口コミAI自動返信</Text>
                </div>
             </div>
        </div>

        {/* 追加オプションブロック */}
        <div className="border border-gray-300 bg-white p-4 space-y-2">
            <Text className="text-[16px] font-bold text-black mb-2">【追加オプション】</Text>
            
            <div className="flex justify-between items-start">
                <div className="flex gap-3">
                     <MdCheckBoxOutlineBlank className="text-[#006355] text-lg min-w-[18px]" />
                     <div>
                        <Text className="text-[14px] text-black font-medium">Google広告自動運用</Text>
                        <Text className="text-[10px] text-gray-600 mt-1 leading-tight">
                            GoogleのAI広告「Performance Max」を活用して、<br/>
                            自動的に最適な広告を配信します
                        </Text>
                     </div>
                </div>
                 <Text className="text-[12px] text-black whitespace-nowrap">20,000円/月</Text>
            </div>
            
            <div className="flex justify-end mt-4">
                <Button className="bg-[#006355] text-white text-[12px] px-8 py-1 h-auto rounded-none hover:bg-[#004d42]">
                    申込む
                </Button>
            </div>
        </div>

        {/* 各種モード設定ブロック */}
        <div className="border border-gray-300 bg-white">
             <div className="border-b border-gray-300 p-2">
                <Text className="text-[14px] text-black">各種モード設定</Text>
             </div>
             <div className="p-4 space-y-4">
                {/* 投稿 */}
                <div className="space-y-1">
                    <Text className="text-[14px] text-black pl-2">・投稿</Text>
                    <div className="pl-6 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-black"></div>
                            <Text className="text-[14px] text-black">自動反映</Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-white"></div>
                            <Text className="text-[14px] text-black">手動反映</Text>
                        </div>
                    </div>
                </div>

                {/* 口コミ自動返信 */}
                <div className="space-y-1">
                    <Text className="text-[14px] text-black pl-2">・口コミ自動返信</Text>
                     <div className="pl-6 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-black"></div>
                            <Text className="text-[14px] text-black">自動返信</Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-white"></div>
                            <Text className="text-[14px] text-black">手動返信</Text>
                        </div>
                         <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-black bg-white"></div>
                            <Text className="text-[14px] text-black">ハイブリット</Text>
                        </div>
                    </div>
                </div>
             </div>
        </div>

      </div>
    </BaseTemplate>
  );
};
