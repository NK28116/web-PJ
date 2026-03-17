import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { useBilling } from '@/hooks/useBilling';
import { generateReceiptPDF } from '@/utils/generateReceipt';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MdKeyboardArrowLeft, MdEdit, MdDelete } from 'react-icons/md';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

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

// カード登録フォーム（SetupIntent フロー）
const CardSetupForm: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
  getSetupIntentSecret: () => Promise<string | null>;
}> = ({ onSuccess, onCancel, getSetupIntentSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setFormError(null);

    const clientSecret = await getSetupIntentSecret();
    if (!clientSecret) {
      setSubmitting(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setSubmitting(false);
      return;
    }

    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    });

    if (error) {
      setFormError(error.message ?? 'カード登録に失敗しました');
      setSubmitting(false);
      return;
    }

    onSuccess();
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3">
      <div className="border border-gray-300 rounded p-3">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      {formError && (
        <Text className="text-xs text-red-500">{formError}</Text>
      )}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={!stripe || submitting}
          className="flex-1 bg-[#00A48D] text-white text-[14px] py-2"
        >
          {submitting ? '登録中...' : 'カードを登録する'}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-[14px] py-2"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
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
  const {
    startCheckout,
    openPortal,
    getSetupIntentSecret,
    deletePaymentMethod,
    paymentMethods,
    pmLoading,
    loading: billingLoading,
    error: billingError,
    refetchPaymentMethods,
  } = useBilling();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);

  // Stripe Checkout完了後の戻り先チェック
  React.useEffect(() => {
    if (router.query.checkout === 'success') {
      setSuccessMessage('サブスクリプションが正常に更新されました');
      router.replace('/billing', undefined, { shallow: true });
    }
  }, [router]);

  const handleCardSetupSuccess = async () => {
    setShowCardForm(false);
    setSuccessMessage('カードを登録しました');
    await refetchPaymentMethods();
  };

  const handleDeleteCard = async (pmId: string) => {
    if (!confirm('このカードを削除しますか？')) return;
    await deletePaymentMethod(pmId);
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
              onClick={() => setShowCardForm(!showCardForm)}
              className="text-gray-500 hover:text-black"
              aria-label="カード情報を編集"
            >
              <MdEdit size={18} />
            </button>
          </div>

          {/* 保存済みカード一覧 */}
          <div className="p-4 space-y-2">
            {pmLoading ? (
              <Text className="text-[13px] text-gray-400">読み込み中...</Text>
            ) : paymentMethods.length > 0 ? (
              paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between">
                  <div>
                    <Text className="text-[14px] text-black capitalize">{pm.brand}</Text>
                    <Text className="text-[13px] text-gray-500">**** **** **** {pm.last4}　{pm.exp_month}/{pm.exp_year}</Text>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(pm.id)}
                    disabled={billingLoading}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="カードを削除"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ))
            ) : (
              <>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">カード番号</Text>
                  <Text className="text-[14px] text-black tracking-wider">**** **** **** ****</Text>
                </div>
                <div className="flex justify-between">
                  <Text className="text-[14px] text-black">有効期限</Text>
                  <Text className="text-[14px] text-black">**/**</Text>
                </div>
              </>
            )}
          </div>

          {/* カード登録フォーム（SetupIntent） */}
          {showCardForm && (
            <Elements stripe={stripePromise}>
              <CardSetupForm
                onSuccess={handleCardSetupSuccess}
                onCancel={() => setShowCardForm(false)}
                getSetupIntentSecret={getSetupIntentSecret}
              />
            </Elements>
          )}

          <div className="px-4 pb-4 space-y-2">
            <Button
              onClick={openPortal}
              className="w-full border border-gray-300 text-[14px] text-black py-2"
              disabled={billingLoading}
            >
              {billingLoading ? '処理中...' : 'カード情報を変更する'}
            </Button>
            <Button
              onClick={handleCheckout}
              className="w-full bg-[#00A48D] text-blue-950 text-[14px] py-2"
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
