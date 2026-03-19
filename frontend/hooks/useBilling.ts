import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '@/utils/api';
import type { CheckoutResponse, PaymentMethod, PortalResponse, SetupIntentResponse } from '@/types/api';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [pmLoading, setPmLoading] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '(未設定→fallback)';
    console.log('[useBilling] NEXT_PUBLIC_API_URL:', apiUrl);
    console.log('[useBilling] GET /api/billing/payment-methods');
    setPmLoading(true);
    try {
      const res = await apiGet<{ payment_methods: PaymentMethod[] }>('/api/billing/payment-methods');
      console.log('[useBilling] payment-methods OK:', res);
      setPaymentMethods(res.payment_methods ?? []);
    } catch (err) {
      console.error('[useBilling] payment-methods failed — err:', err);
      console.error('[useBilling] err message:', err instanceof Error ? err.message : String(err));
      setPaymentMethods([]);
    } finally {
      setPmLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const getSetupIntentSecret = useCallback(async (): Promise<string | null> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '(未設定→fallback)';
    console.log('[useBilling] NEXT_PUBLIC_API_URL:', apiUrl);
    console.log('[useBilling] POST /api/billing/setup-intent');
    try {
      const res = await apiPost<SetupIntentResponse>('/api/billing/setup-intent');
      console.log('[useBilling] setup-intent OK:', res);
      return res.client_secret;
    } catch (err) {
      console.error('[useBilling] setup-intent failed — FULL ERROR OBJECT:', err);
      console.error('[useBilling] err type:', Object.prototype.toString.call(err));
      console.error('[useBilling] err message:', err instanceof Error ? err.message : String(err));
      const msg = err instanceof Error ? err.message : String(err);
      
      if (msg.includes('Failed to fetch')) {
        const target = process.env.NEXT_PUBLIC_API_URL || 'デフォルト';
        setError(`サーバーに接続できませんでした。接続先: ${target}`);
      } else {
        setError(`カード登録の準備に失敗しました: ${msg}`);
      }
      return null;
    }
  }, []);

  const deletePaymentMethod = useCallback(async (pmId: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiDelete(`/api/billing/payment-methods/${pmId}`);
      await fetchPaymentMethods();
    } catch (err) {
      console.error('[useBilling] Delete PM failed:', err);
      setError('カードの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [fetchPaymentMethods]);

  const startCheckout = useCallback(async (priceId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useBilling] POST /api/billing/checkout:', { price_id: priceId });
      const res = await apiPost<CheckoutResponse>('/api/billing/checkout', { price_id: priceId });
      console.log('[useBilling] checkout response:', res);
      window.location.assign(res.url);
    } catch (err) {
      console.error('[useBilling] POST /api/billing/checkout failed:', err);
      setError('決済セッションの作成に失敗しました');
      setLoading(false);
    }
  }, []);

  const openPortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useBilling] POST /api/billing/portal');
      const res = await apiPost<PortalResponse>('/api/billing/portal');
      console.log('[useBilling] portal response:', res);
      window.location.assign(res.url);
    } catch (err) {
      console.error('[useBilling] POST /api/billing/portal failed:', err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('400') || msg.includes('customer not found')) {
        setError('カードが登録されていません');
      } else if (msg.includes('Failed to fetch')) {
        setError('サーバーに接続できませんでした');
      } else {
        setError('ポータルの作成に失敗しました');
      }
      setLoading(false);
    }
  }, []);

  return {
    startCheckout,
    openPortal,
    getSetupIntentSecret,
    deletePaymentMethod,
    paymentMethods,
    pmLoading,
    loading,
    error,
    refetchPaymentMethods: fetchPaymentMethods,
  };
};
