import React from 'react';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { Text } from '@/atoms/Text';
import { cn } from '@/utils/cn';

const PieChart = () => (
  <div className="relative w-[130px] h-[130px] mx-auto">
    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
      <circle cx="50" cy="50" r="50" fill="#E1306C" /> {/* Instagram Base */}
      <path d="M50 50 L50 0 A50 50 0 0 1 100 50 Z" fill="#4285F4" /> {/* Google (Quarter) */}
      <path d="M50 50 L100 50 A50 50 0 0 1 50 100 Z" fill="#2A9D84" /> {/* Reels? */}
      <path d="M50 50 L50 100 A50 50 0 0 1 0 50 Z" fill="#CF2E92" /> {/* Stories? */}
    </svg>
  </div>
);

export const ReportTemplate: React.FC = () => {
  return (
    <BaseTemplate activeTab="report">
      <div className="flex flex-col gap-6 pb-20">
        {/* サブヘッダー */}
        <div className="flex items-center justify-between px-2 pt-2">
            <div className="flex gap-6">
                <div className="border-b-2 border-black pb-1">
                    <Text className="font-bold text-base">月次レポート</Text>
                </div>
                <div className="pb-1">
                    <Text className="text-gray-400 text-base">AI分析</Text>
                </div>
            </div>
            <Text className="text-sm font-medium">9月1日〜9月30日</Text>
        </div>

        {/* 統合アクション総数 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                    <Text className="text-sm text-gray-600 mb-1">統合アクション総数</Text>
                    <div className="flex items-end gap-1">
                        <Text className="text-4xl font-normal">2,605</Text>
                        <Text className="text-xl mb-1 text-gray-600">件</Text>
                    </div>
                </div>
                <div className="text-right">
                    <Text className="text-[#00A48D] text-lg font-medium block">↑+25%</Text>
                    <Text className="text-[#00A48D] text-lg font-medium block">↑+0.2pt</Text>
                </div>
            </div>
        </div>

        {/* 統合アクション内訳 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
             <Text className="text-sm text-gray-600 mb-6">統合アクション内訳</Text>
             <div className="flex items-center">
                 <div className="w-[45%] flex justify-center">
                     <PieChart />
                 </div>
                 <div className="w-[55%] pl-4 space-y-3 text-xs">
                     <div className="flex items-center gap-2">
                         <div className="w-2.5 h-2.5 bg-[#4285F4] rounded-full flex-shrink-0"/>
                         <Text className="text-sm">Google</Text>
                     </div>
                     <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 bg-[#E1306C] rounded-full flex-shrink-0"/>
                            <Text className="text-sm">Instagram</Text>
                        </div>
                        <div className="pl-5 space-y-2">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#E1306C] rounded-full flex-shrink-0"/>
                                <Text className="text-xs text-gray-600">投稿</Text>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#2A9D84] rounded-full flex-shrink-0"/>
                                <Text className="text-xs text-gray-600">リール</Text>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-[#CF2E92] rounded-full flex-shrink-0"/>
                                <Text className="text-xs text-gray-600">ストーリーズ</Text>
                            </div>
                        </div>
                     </div>
                 </div>
             </div>
        </div>

        {/* 口コミ平均評価 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center">
            <Text className="text-sm text-gray-600">口コミ平均評価</Text>
            <div className="flex items-center gap-4">
                 <Text className="text-4xl font-normal">4.2</Text>
                 <Text className="text-sm text-gray-500">前月比 -</Text>
            </div>
        </div>

        {/* アクション分析 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
             <Text className="text-sm text-gray-600 mb-4">アクション分析</Text>
             
             {/* グラフプレースホルダー */}
             <div className="h-[200px] border-b border-l border-gray-300 relative">
                 <div className="absolute bottom-0 left-0 w-full h-full flex items-end justify-around px-2">
                     {[40, 60, 30, 80, 50, 70, 45].map((h, i) => (
                         <div key={i} className="w-6 bg-[#4285F4] rounded-t-sm" style={{ height: `${h}%` }} />
                     ))}
                 </div>
             </div>
             <div className="flex justify-around mt-2 text-xs text-gray-500">
                 <span>月</span><span>火</span><span>水</span><span>木</span><span>金</span><span>土</span><span>日</span>
             </div>
             
             <div className="flex justify-center mt-4 gap-4">
                 <div className="flex items-center gap-2">
                     <div className="w-3 h-3 bg-[#4285F4] rounded-sm"/>
                     <Text className="text-xs">時間帯・曜日傾向</Text>
                 </div>
             </div>
        </div>

        {/* ユーザーペルソナ分析 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
             <Text className="text-sm text-gray-600 mb-4">ユーザーペルソナ分析</Text>
             <div className="flex items-center justify-between">
                 <div className="w-[130px] h-[130px] relative">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="50" fill="#E5E7EB" />
                        <path d="M50 50 L50 0 A50 50 0 0 1 85 15 Z" fill="#FC9A4C" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                          <Text className="text-3xl font-bold">37</Text>
                          <Text className="text-sm">%</Text>
                      </div>
                 </div>
                 <div className="flex-1 pl-6 space-y-4">
                     <div className="space-y-1">
                         <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-[#FC9A4C] rounded-full"/>
                             <Text className="text-xs">30代女性</Text>
                         </div>
                         <Text className="text-xs text-gray-500 pl-5">週末ディナーを検討</Text>
                     </div>
                     <div className="space-y-1">
                         <div className="flex items-center gap-2">
                             <div className="w-3 h-3 bg-[#0C7FFB] rounded-full"/>
                             <Text className="text-xs">20代男性</Text>
                         </div>
                         <Text className="text-xs text-gray-500 pl-5">ランチを探してる</Text>
                     </div>
                 </div>
             </div>
        </div>
      </div>
    </BaseTemplate>
  );
};
