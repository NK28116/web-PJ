import { useCallback, useState } from 'react';
import { apiPost } from '@/utils/api';
import type { CheckoutResponse, PortalResponse } from '@/types/api';

export const useBilling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return { startCheckout, openPortal, loading, error };
};
