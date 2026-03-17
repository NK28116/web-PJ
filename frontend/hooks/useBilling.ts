import { useCallback, useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '@/utils/api';
import type { CheckoutResponse, PaymentMethod, PortalResponse, SetupIntentResponse } from '@/types/api';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [pmLoading, setPmLoading] = useState(false);

  const fetchPaymentMethods = useCallback(async () => {
    setPmLoading(true);
    try {
      const res = await apiGet<{ payment_methods: PaymentMethod[] }>('/api/billing/payment-methods');
      setPaymentMethods(res.payment_methods ?? []);
    } catch {
      // 未契約など Customer 未作成の場合は空配列のまま
      setPaymentMethods([]);
    } finally {
      setPmLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const getSetupIntentSecret = useCallback(async (): Promise<string | null> => {
    try {
      const res = await apiPost<SetupIntentResponse>('/api/billing/setup-intent');
      return res.client_secret;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'カード登録の準備に失敗しました');
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
      setError(err instanceof Error ? err.message : 'カードの削除に失敗しました');
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
      setError(err instanceof Error ? err.message : '決済セッションの作成に失敗しました');
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
      setError(err instanceof Error ? err.message : 'ポータルの作成に失敗しました');
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
