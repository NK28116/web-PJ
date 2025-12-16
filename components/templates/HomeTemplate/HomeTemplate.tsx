import React from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import { Button } from '@/atoms/Button';
import { cn } from '@/utils/cn';

export interface HomeTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
  children?: React.ReactNode;
}

export const HomeTemplate: React.FC<HomeTemplateProps> = ({
  className,
  activeTab = 'home',
  onTabChange,
  children,
}) => {
  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-6 pb-20">
        
        {/* アカウント連携セクション */}
        <section className="space-y-3">
          <Text className="text-[15px] font-normal text-black pl-2">
            アカウント連携
          </Text>

          <div className="border border-gray-300 rounded-lg p-4 space-y-4 bg-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Google Icon Placeholder */}
                <div className="w-8 h-8 bg-white flex items-center justify-center">
                    {/* 簡易的なGロゴ */}
                   <span className="text-xl font-bold text-[#4285F4]">G</span>
                </div>
                <div className="flex flex-col">
                    <Text className="text-[12px] text-black">Google</Text>
                    <Text className="text-[10px] text-black">未連携</Text>
                </div>
              </div>
              
              <Button 
                size="sm"
                className="bg-[#006355] text-white hover:bg-[#004d42] text-[10px] h-8 px-4 rounded"
              >
                連携する
              </Button>
            </div>
             <div className="flex justify-end pt-2 border-t border-gray-200">
                 <button className="text-[10px] text-[#006355] font-bold">
                    アカウントを追加
                 </button>
            </div>
          </div>
        </section>

        {/* インスタグラム連携セクション */}
        <section className="space-y-3">
          <Text className="text-[15px] font-normal text-black pl-2">
            インスタグラム連携
          </Text>

          <div className="border border-gray-300 rounded-lg p-4 flex justify-center bg-transparent">
            <Button
              className="w-full bg-[#006355] text-white hover:bg-[#004d42] text-[10px] h-9"
            >
              ビジネスプロフィールからインポート
            </Button>
          </div>
        </section>

        {/* 店舗一覧セクション */}
        <section className="space-y-3">
          <Text className="text-[15px] font-normal text-black pl-2">
            店舗一覧
          </Text>

          <div className="border border-gray-300 rounded-lg p-4 space-y-2 bg-transparent">
            <div className="flex justify-between items-start">
                <div>
                     <Text className="text-[24px] font-normal text-black leading-tight">
                        ID: 0001
                     </Text>
                     <Text className="text-[14px] font-normal text-black mt-1">
                        wyzesystem○○@gmail.com
                     </Text>
                </div>
                <div className="w-16 h-16 flex items-center justify-center">
                    <span className="text-4xl font-serif text-black">w</span>
                </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
                <div className="w-3 h-3 rounded-full bg-[#3498DB]"></div>
                <Text className="text-[12px] text-black">連携待ち</Text>
            </div>
          </div>
        </section>

        {/* ダッシュボードセクション */}
        <section className="space-y-3 pt-6">
             <div className="flex items-center justify-between px-2">
                <Text className="text-[15px] font-normal text-black">
                    ダッシュボード
                </Text>
                <button className="bg-[#C4C4C4] rounded-full px-4 py-1">
                    <Text className="text-[11px] text-black">更新する</Text>
                </button>
            </div>
            
            <div className="border-t border-[#D9D9D9] pt-4 space-y-4">
                {/* AI Action */}
                <div className="bg-[#D5F6F2] rounded-md p-4 text-center space-y-2 mx-1">
                    <Text className="text-[15px] text-black block">AIによる最優先アクション</Text>
                    <Text className="text-[15px] text-black block font-medium">-</Text>
                </div>

                {/* Stats */}
                <div className="relative">
                    {/* Overlay Message */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                        <div className="bg-white/90 p-4 rounded text-center">
                            <Text className="text-[15px] text-black whitespace-pre-wrap leading-relaxed">
                                Googleで連携すると{"\n"}使用できます
                            </Text>
                        </div>
                    </div>

                    {/* Stats List (Blurred/Disabled) */}
                    <div className="space-y-0 opacity-50 blur-[1px] pointer-events-none select-none">
                        {/* Row 1 */}
                        <div className="py-3 px-2 flex justify-between items-center border-b border-[#E5E5E5]">
                            <Text className="text-[15px] text-black">システム稼働状況</Text>
                            <Text className="text-[15px] text-black">-</Text>
                        </div>

                        {/* Row 2 */}
                        <div className="py-3 px-2 flex justify-between items-center border-b border-[#E5E5E5]">
                            <Text className="text-[15px] text-black">AI返信待ち口コミ</Text>
                            <div className="flex items-center gap-2">
                                <Text className="text-[15px] text-black font-bold">-</Text>
                                <Text className="text-[15px] text-black">件</Text>
                            </div>
                        </div>
                        {/* Row 3 */}
                        <div className="py-3 px-2 flex justify-between items-center border-b border-[#E5E5E5]">
                            <Text className="text-[15px] text-black">新しい口コミ</Text>
                            <div className="flex items-center gap-2">
                                <Text className="text-[15px] text-black font-bold">-</Text>
                                <Text className="text-[15px] text-black">件</Text>
                            </div>
                        </div>
                        {/* Row 4 */}
                        <div className="py-3 px-2 flex justify-between items-center border-b border-[#E5E5E5]">
                            <Text className="text-[15px] text-black">本日のプロフィール閲覧数</Text>
                            <div className="flex items-center gap-2">
                                <Text className="text-[15px] text-black font-bold">-</Text>
                                <Text className="text-[15px] text-black">件</Text>
                            </div>
                        </div>
                        {/* Row 5 */}
                        <div className="py-3 px-2 flex justify-between items-center border-b border-[#E5E5E5]">
                            <Text className="text-[15px] text-black">本日の検索数</Text>
                            <div className="flex items-center gap-2">
                                <Text className="text-[15px] text-black font-bold">-</Text>
                                <Text className="text-[15px] text-black">件</Text>
                            </div>
                        </div>
                        {/* Row 6 */}
                        <div className="py-3 px-2 flex justify-between items-center">
                            <Text className="text-[15px] text-black">前週比 / 前月比</Text>
                            <div className="flex items-center gap-2">
                                <Text className="text-[15px] text-black font-bold">-% / -%</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
      </div>
    </BaseTemplate>
  );
};
