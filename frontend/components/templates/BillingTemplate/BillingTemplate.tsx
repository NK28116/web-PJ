import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { useBilling } from '@/hooks/useBilling';
import { generateReceiptPDF } from '@/utils/generateReceipt';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MdKeyboardArrowLeft, MdEdit } from 'react-icons/md';

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  planName: string;
  invoiceId: string;
}

const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  { id: '1', date: '2026/01/01', amount: 33000, planName: 'Standard Plan', invoiceId: 'INV-2026-001' },
  { id: '2', date: '2025/12/01', amount: 33000, planName: 'Standard Plan', invoiceId: 'INV-2025-012' },
  { id: '3', date: '2025/11/01', amount: 33000, planName: 'Standard Plan', invoiceId: 'INV-2025-011' },
];

const MOCK_NEXT_PAYMENT = {
  date: '2026/02/01',
  amount: 33000,
};

const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_standard';

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
  const { startCheckout, openPortal, loading: billingLoading, error: billingError } = useBilling();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Stripe Checkout完了後の戻り先チェック
  React.useEffect(() => {
    if (router.query.checkout === 'success') {
      setSuccessMessage('サブスクリプションが正常に更新されました');
      router.replace('/billing', undefined, { shallow: true });
    }
  }, [router]);

  const handleChangeCard = () => {
    openPortal();
  };

  const handleCheckout = () => {
    startCheckout(STRIPE_PRICE_ID);
  };

  const handleExportPDF = (payment: PaymentHistory) => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    generateReceiptPDF({
      paymentDate: payment.date,
      companyName: userEmail,
      sumPrice: payment.amount,
      planName: payment.planName,
      receiptNumber: payment.invoiceId,
    });
  };

  return (
    <BaseTemplate
      className={className}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="space-y-4 pb-20">

        {/* 成功メッセージ */}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {/* エラーメッセージ */}
        {billingError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
            {billingError}
          </div>
        )}

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
              onClick={handleChangeCard}
              className="text-gray-500 hover:text-black"
              aria-label="カード情報を編集"
              disabled={billingLoading}
            >
              <MdEdit size={18} />
            </button>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <Text className="text-[14px] text-black">カード番号</Text>
              <Text className="text-[14px] text-black tracking-wider">**** **** **** ****</Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-[14px] text-black">有効期限</Text>
              <Text className="text-[14px] text-black">**/**</Text>
            </div>
          </div>
          <div className="px-4 pb-4 space-y-2">
            <Button
              onClick={handleChangeCard}
              className="w-full border border-gray-300 text-[14px] text-black py-2"
              disabled={billingLoading}
            >
              {billingLoading ? '処理中...' : 'カード情報を変更する'}
            </Button>
            <Button
              onClick={handleCheckout}
              className="w-full bg-[#00A48D] text-white text-[14px] py-2"
              disabled={billingLoading}
            >
              {billingLoading ? '処理中...' : 'プランに申し込む'}
            </Button>
          </div>
        </div>

        {/* お支払い履歴セクション */}
        <div className="border border-gray-300 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">お支払い履歴（請求書・領収書）</Text>
          </div>
          <div className="p-4 space-y-3">
            {MOCK_PAYMENT_HISTORY.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Text className="text-[14px] text-black">{item.date}</Text>
                <div className="flex items-center gap-3">
                  <Text className="text-[14px] text-black">{formatCurrency(item.amount)}</Text>
                  <button
                    onClick={() => handleExportPDF(item)}
                    className="border border-gray-300 px-2 py-0.5 text-[11px] text-black hover:bg-gray-50 rounded"
                  >
                    PDF
                  </button>
                </div>
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
    </BaseTemplate>
  );
};
