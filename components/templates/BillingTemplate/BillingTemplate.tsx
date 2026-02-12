import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MdKeyboardArrowLeft, MdEdit, MdPictureAsPdf } from 'react-icons/md';

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
}

interface CardInfo {
  brand: string;
  last4: string;
  expiry: string;
}

const MOCK_CARD_INFO: CardInfo = {
  brand: 'Visa',
  last4: '1234',
  expiry: '12/28',
};

const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  { id: '1', date: '2026/01/01', amount: 33000 },
  { id: '2', date: '2025/12/01', amount: 33000 },
  { id: '3', date: '2025/11/01', amount: 33000 },
];

const MOCK_NEXT_PAYMENT = {
  date: '2026/02/01',
  amount: 33000,
};

const formatCurrency = (amount: number): string => {
  return `¥${new Intl.NumberFormat('ja-JP').format(amount)}`;
};

export interface BillingTemplateProps {
  className?: string;
  activeTab?: 'home' | 'post' | 'report' | 'review';
  onTabChange?: (tab: 'home' | 'post' | 'report' | 'review') => void;
}

export const BillingTemplate: React.FC<BillingTemplateProps> = ({
  className,
  activeTab,
  onTabChange,
}) => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleExportPDF = () => {
    const lines = MOCK_PAYMENT_HISTORY.map((item) => {
      const d = item.date.split('/');
      return `${d[0]}年${d[1]}月${d[2]}日 ${formatCurrency(item.amount)}`;
    });
    const total = MOCK_PAYMENT_HISTORY.reduce((sum, item) => sum + item.amount, 0);
    console.log(
      `領収書.pdf\n${lines.join('\n')}\n-----------------------\n合計         ${formatCurrency(total)}`
    );
    window.alert('領収書(PDF)を出力しました。コンソールを確認してください。');
  };

  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-4 pb-20">

        {/* ヘッダー部分 */}
        <div className="border-b border-gray-300 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[16px] text-black font-normal"
          >
            <MdKeyboardArrowLeft size={24} />
            <span>お支払い情報</span>
          </button>
        </div>

        {/* クレジットカード情報セクション */}
        <div className="border border-gray-300 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">登録クレジットカード情報</Text>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-gray-500 hover:text-black"
              aria-label="カード情報を編集"
            >
              <MdEdit size={18} />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <Text className="text-[14px] text-black">カード番号</Text>
              <Text className="text-[14px] text-black tracking-wider">**** **** **** {MOCK_CARD_INFO.last4}</Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-[14px] text-black">有効期限</Text>
              <Text className="text-[14px] text-black">**/**</Text>
            </div>
          </div>
          <div className="px-4 pb-4">
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full border border-gray-300 text-[14px] text-black py-2"
            >
              カード情報を変更する
            </Button>
          </div>
        </div>

        {/* お支払い履歴セクション */}
        <div className="border border-gray-300 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">お支払い履歴（請求書・領収書）</Text>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1 border border-gray-300 px-3 py-1 text-[12px] text-black hover:bg-gray-50"
            >
              領収書 / PDF
            </button>
          </div>
          <div className="p-4 space-y-3">
            {MOCK_PAYMENT_HISTORY.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Text className="text-[14px] text-black">{item.date}</Text>
                <Text className="text-[14px] text-black">{formatCurrency(item.amount)}</Text>
              </div>
            ))}
          </div>
          {/* 次回お支払い */}
          <div className="border-t border-gray-300 p-4 text-center">
            {MOCK_NEXT_PAYMENT ? (
              <Text className="text-[14px] text-gray-500">
                次回のお支払い：{MOCK_NEXT_PAYMENT.date} {formatCurrency(MOCK_NEXT_PAYMENT.amount)}
              </Text>
            ) : (
              <Text className="text-[14px] text-gray-500">
                次回のお支払い予定はありません
              </Text>
            )}
          </div>
        </div>

      </div>

      {/* カード編集モーダル */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-sm rounded shadow-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Text className="text-[16px] text-black font-bold">カード情報の変更</Text>
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] text-gray-500 mb-1">カード番号</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                  readOnly
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[12px] text-gray-500 mb-1">有効期限</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[12px] text-gray-500 mb-1">CVC</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full border border-gray-300 px-3 py-2 text-[14px] rounded"
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 border border-gray-300 text-[14px] text-black py-2"
              >
                キャンセル
              </Button>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 bg-[#00A48D] text-white text-[14px] py-2"
              >
                保存する
              </Button>
            </div>
          </div>
        </div>
      )}
    </BaseTemplate>
  );
};
