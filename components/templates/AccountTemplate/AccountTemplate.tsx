import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React from 'react';


export interface AccountTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'auto-reply';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'auto-reply') => void;
}
export const AccountTemplate: React.FC <AccountTemplateProps>= ({
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
                       アカウント情報
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

       {/* アカウント情報ブロック */}
          <div className="border border-gray-300 rounded-lg p-4 space-y-2 bg-transparent">
            <div className="flex justify-between items-start">
                <div className="flex items-center justify-center">
                    <span className="text-4xl font-serif text-black bg-gray-400">w</span>
                </div>

                <div>
                    <Text className="text-xl font-normal text-black leading-tight">
                        ID: 0001
                     </Text>
                     <Text className="text-xs font-normal text-black mt-1">
                        wyzesystem○○@gmail.com
                     </Text>
                </div>

 
            </div>
            
          </div>


         <div className="border border-gray-300 bg-white">
              <div className="border-b border-gray-300 p-2 flex items-center justify-between">
                 <Text className="text-[14px] text-black">アカウント設定</Text>
                 <button>
                     <Text className="text-[14px] text-[#00A48D] border-2" >編集</Text>
                 </button>
              </div>

              <div className="p-4 space-y-2">
                 <div className="flex justify-between gap-3">
                     <Text className="text-[14px] text-black">氏名</Text>
                     <Text className="text-[14px] text-black">遠藤憲一</Text>
                 </div>
                </div>


              <div className="p-4 space-y-2">
                 <div className="flex justify-between gap-3">
                     <Text className="text-[14px] text-black">電話番号</Text>
                     <Text className="text-[14px] text-black">090-1234-5678</Text>
                 </div>
            </div>
         </div>

       {/* ログイン設定ブロック */}
         <div className="border border-gray-300 bg-white">
              <div className="border-b border-gray-300 p-2">
                 <Text className="text-[14px] ">ログイン設定</Text>
              </div>
              <div className="p-4 space-y-2">
                 <div className="flex justify-between gap-3">
                     <Text className="text-[14px] ">パスワード</Text>
                     <Text className="text-[14px]">*******</Text>
                                    <button>
                     <Text className="text-[14px] border-2" >変更</Text>
                 </button>
                 </div>
              </div>
         </div>
        </div>
    </BaseTemplate>
  );
};
