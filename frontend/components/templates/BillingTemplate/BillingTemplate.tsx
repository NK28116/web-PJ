import { Button } from '@/atoms/Button';
import { Text } from '@/atoms/Text';
import { BaseTemplate } from '@/templates/BaseTemplate';
import { useBilling } from '@/hooks/useBilling';
import { useProfile } from '@/hooks/useProfile';
import { generateReceiptPDF } from '@/utils/generateReceipt';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { MdKeyboardArrowLeft, MdEdit, MdDelete } from 'react-icons/md';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  planName: string;
  invoiceId: string;
  invoicePdfUrl?: string;
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

const IS_MOCK = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

const formatDate = (unix: number): string => {
  const d = new Date(unix * 1000);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

const PLANS = [
  {
    id: 'light',
    name: 'Light',
    description: '連携重視',
    price: 10000,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LIGHT || '',
  },
  {
    id: 'basic',
    name: 'Basic',
    description: '自動化重視',
    price: 29800,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_BASIC || '',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: '戦略重視',
    price: 59800,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || '',
  },
];

const formatCurrency = (amount: number): string => {
  return `¥${new Intl.NumberFormat('ja-JP').format(amount)}`;
};

// カード登録フォーム（SetupIntent フロー）
const CardSetupForm: React.FC<{
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  getSetupIntentSecret: () => Promise<string | null>;
  onLoadingChange?: (loading: boolean) => void;
}> = ({ onSuccess, onError, getSetupIntentSecret, onLoadingChange }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [formError, setFormError] = useState<string | null>(null);
  const [numberComplete, setNumberComplete] = useState(false);
  const [expiryComplete, setExpiryComplete] = useState(false);
  const [cvcComplete, setCvcComplete] = useState(false);
  const isComplete = numberComplete && expiryComplete && cvcComplete;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!stripe || !elements || !isComplete) return;

    onLoadingChange?.(true);
    setFormError(null);

    const clientSecret = await getSetupIntentSecret();
    if (!clientSecret) {
      onLoadingChange?.(false);
      onError('登録できませんでした');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) {
      onLoadingChange?.(false);
      return;
    }

    const { error, setupIntent } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardNumberElement },
    });

    if (error) {
      const msg = error.type === 'card_error' || error.type === 'validation_error'
        ? 'このカードは有効ではありません'
        : '登録できませんでした';
      setFormError(error.message ?? msg);
      onError(msg);
      onLoadingChange?.(false);
      return;
    }

    if (setupIntent?.status === 'succeeded') {
      onSuccess('登録できました');
    } else {
      onError('登録できませんでした');
    }
    onLoadingChange?.(false);
  };

  const elementStyle = {
    base: {
      fontSize: '14px',
      color: '#1a1a1a',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  };

  return (
    <form id="card-setup-form" onSubmit={handleSubmit} className="p-4 space-y-3">
      <div>
        <label className="block text-[12px] text-gray-500 mb-1">カード番号</label>
        <div className="border border-gray-300 rounded p-3 bg-white">
          <CardNumberElement
            options={{ style: elementStyle, placeholder: '1234 5678 9012 3456' }}
            onChange={(e) => setNumberComplete(e.complete)}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-[12px] text-gray-500 mb-1">有効期限</label>
          <div className="border border-gray-300 rounded p-3 bg-white">
            <CardExpiryElement
              options={{ style: elementStyle }}
              onChange={(e) => setExpiryComplete(e.complete)}
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-[12px] text-gray-500 mb-1">セキュリティコード</label>
          <div className="border border-gray-300 rounded p-3 bg-white">
            <CardCvcElement
              options={{ style: elementStyle, placeholder: '123' }}
              onChange={(e) => setCvcComplete(e.complete)}
            />
          </div>
        </div>
      </div>
      <Button
        type="submit"
        disabled={!stripe || !isComplete}
        className="w-full bg-[#00A48D] text-black text-[14px] py-2"
        onClick={(e) => { e.stopPropagation(); }}
      >
        カードを登録する
      </Button>
      {formError && (
        <Text className="text-xs text-red-500">{formError}</Text>
      )}
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
    invoices,
    invoicesLoading,
    upcoming,
  } = useBilling();
  const { profile } = useProfile();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(PLANS[0].id);
  const [cardRegistered, setCardRegistered] = useState(false);

  const isAnyLoading = billingLoading || pmLoading || formSubmitting;

  // Stripe Checkout完了後の戻り先チェック
  React.useEffect(() => {
    if (router.query.checkout === 'success') {
      setSuccessMessage('サブスクリプションが正常に更新されました');
      router.replace('/billing', undefined, { shallow: true });
    }
  }, [router]);

  const handleCardSetupSuccess = async (message: string) => {
    setShowCardForm(false);
    setCardRegistered(true);
    setSuccessMessage(message);
    await refetchPaymentMethods();
  };

  const handleCardSetupError = (message: string) => {
    // フォーム内のエラー表示に任せるが、必要に応じてテンプレート側でも保持可能
  };

  const handleDeleteCard = async (pmId: string) => {
    if (!confirm('このカードを削除しますか？')) return;
    await deletePaymentMethod(pmId);
  };



  const handleExportPDF = (payment: PaymentHistory) => {
    if (payment.invoicePdfUrl) {
      window.open(payment.invoicePdfUrl, '_blank');
      return;
    }
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : '';
    generateReceiptPDF({
      paymentDate: payment.date,
      companyName: userEmail,
      sumPrice: payment.amount,
      planName: payment.planName,
      receiptNumber: payment.invoiceId,
    });
  };

  // 実データの支払い履歴（モック排除済み）
  const paymentHistory: PaymentHistory[] = invoices.length > 0
    ? invoices.map((inv) => ({
        id: inv.id,
        date: formatDate(inv.created),
        amount: inv.amount_paid,
        planName: inv.plan_name || 'Subscription',
        invoiceId: inv.id,
        invoicePdfUrl: inv.invoice_pdf_url,
      }))
    : [];

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
                    disabled={isAnyLoading}
                    className="text-gray-400 hover:text-red-500"
                    aria-label="カードを削除"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ))
            ) : cardRegistered ? (
              <Text className="text-[13px] text-gray-400">カード情報を更新中...</Text>
            ) : showCardForm ? (
              <Text className="text-[13px] text-gray-500">下のフォームにカード情報を入力してください</Text>
            ) : (
              <div className="relative py-2">
                <div className="blur-[3px] select-none pointer-events-none opacity-40 space-y-2">
                  <div className="flex justify-between">
                    <Text className="text-[14px] text-black">カード番号</Text>
                    <Text className="text-[14px] text-black tracking-wider">**** **** **** ****</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-[14px] text-black">有効期限</Text>
                    <Text className="text-[14px] text-black">**/**</Text>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Text className="text-[14px] text-black font-medium bg-white/60 px-3 py-1 rounded">クレジットカードを登録してください</Text>
                </div>
              </div>
            )}
          </div>

          {/* カード登録フォーム（SetupIntent） */}
          {showCardForm && (
            <Elements stripe={stripePromise}>
              <CardSetupForm
                onSuccess={handleCardSetupSuccess}
                onError={handleCardSetupError}
                getSetupIntentSecret={getSetupIntentSecret}
                onLoadingChange={setFormSubmitting}
              />
            </Elements>
          )}

          {!showCardForm && (
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={paymentMethods.length > 0 ? openPortal : () => setShowCardForm(true)}
                  className="flex-1 border border-gray-300 text-[14px] text-black py-2"
                  disabled={isAnyLoading}
                >
                  {isAnyLoading ? '処理中...' : (paymentMethods.length === 0 ? 'カードを登録する' : 'カード情報を変更する')}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 border border-gray-300 text-[14px] text-black py-2"
                  disabled={isAnyLoading}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 現在のプラン表示 */}
        {profile?.plan_tier && profile.plan_tier !== 'free' && (
          <div className="border border-[#00A48D] bg-[#f0faf8] p-4 flex items-center justify-between">
            <div>
              <Text className="text-[12px] text-gray-500">現在のプラン</Text>
              <Text className="text-[16px] text-black font-medium capitalize">{profile.plan_tier} プラン</Text>
            </div>
            <div className="border border-[#00A48D] text-[#00A48D] px-2 py-0.5 text-[12px]">
              契約中
            </div>
          </div>
        )}



        {/* お支払い履歴セクション */}
        <div className="border border-gray-300 bg-white">
          <div className="flex items-center justify-between border-b border-gray-300 p-3">
            <Text className="text-[14px] text-black font-normal">お支払い履歴（請求書・領収書）</Text>
          </div>
          <div className="p-4 space-y-3">
            {invoicesLoading && <Text className="text-[13px] text-gray-400">読み込み中...</Text>}
            {!invoicesLoading && paymentHistory.length === 0 && (
              <Text className="text-[13px] text-gray-400 text-center py-2">履歴はありません</Text>
            )}
            {paymentHistory.map((item) => (
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
            {upcoming ? (
              <Text className="text-[14px] text-gray-500">
                次回のお支払い：{formatDate(upcoming.next_payment_date)} {formatCurrency(upcoming.amount_due)}
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
